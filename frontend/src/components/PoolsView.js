import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
    Button,
    Alert,
    TextField,
    InputAdornment,
    IconButton,
    Autocomplete,
    Stack,
    Chip
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import {
    Timeline,
    ShowChart,
    AccountBalance,
    SwapHoriz,
    Assessment,
    Search as SearchIcon,
    Clear as ClearIcon,
    FilterList
} from '@mui/icons-material';
import PoolFilters from './PoolFilters';
import { useLocalStorage } from '../hooks/useLocalStorage';
import StellarSdk from 'stellar-sdk';

const PoolsView = () => {
    const { code, issuer } = useParams();
    const navigate = useNavigate();
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPool, setSelectedPool] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPools, setFilteredPools] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        sortBy: 'tvl',
        order: 'desc',
        tvlRange: [0, 1000000],
        apyRange: [0, 100]
    });
    const [searchHistory, setSearchHistory] = useLocalStorage('poolSearchHistory', []);
    const [trades, setTrades] = useState([]);
    const [isLoadingTrades, setIsLoadingTrades] = useState(false);

    useEffect(() => {
        const fetchPools = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(
                    `/api/pools?asset_code=${code}&asset_issuer=${issuer}`
                );
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (!Array.isArray(data)) {
                    console.warn('Received non-array data:', data);
                    setPools([]);
                    return;
                }
                
                const validPools = data.filter(pool => 
                    pool && pool.id && pool.reserves && 
                    Array.isArray(pool.reserves) && 
                    pool.reserves.length > 0
                );
                
                setPools(validPools);
                if (validPools.length > 0) {
                    setSelectedPool(validPools[0]);
                    await fetchPoolTrades(validPools[0].id);
                }
            } catch (err) {
                console.error('Error fetching pools:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPools();
    }, [code, issuer]);

    useEffect(() => {
        if (!pools) return;
        
        const filtered = pools.filter(pool => 
            pool.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pool.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPools(filtered);
    }, [searchTerm, pools]);

    const fetchPoolTrades = async (poolId) => {
        setIsLoadingTrades(true);
        try {
            const server = new StellarSdk.Server('https://horizon.stellar.org');
            const trades = await server.trades()
                .forLiquidityPool(poolId)
                .limit(100)
                .order('desc')
                .call();

            const formattedTrades = trades.records.map(trade => ({
                id: trade.id,
                time: new Date(trade.ledger_close_time),
                baseAmount: parseFloat(trade.base_amount),
                counterAmount: parseFloat(trade.counter_amount),
                price: parseFloat(trade.price.n) / parseFloat(trade.price.d),
                type: parseFloat(trade.base_is_seller) ? 'Sell' : 'Buy',
                volume: parseFloat(trade.base_amount) * (parseFloat(trade.price.n) / parseFloat(trade.price.d))
            }));

            setTrades(formattedTrades);

            const chartDataFormatted = formattedTrades
                .map(trade => ({
                    time: trade.time.toLocaleTimeString(),
                    price: trade.price,
                    volume: trade.volume,
                    timestamp: trade.time
                }))
                .sort((a, b) => a.timestamp - b.timestamp);

            setChartData(chartDataFormatted);

        } catch (error) {
            console.error('Error fetching trades:', error);
            setTrades([]);
            setChartData([]);
        } finally {
            setIsLoadingTrades(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handlePoolSelect = async (pool) => {
        setSelectedPool(pool);
        await fetchPoolTrades(pool.id);
    };

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        
        if (value.trim() && !searchHistory.includes(value.trim())) {
            setSearchHistory(prev => [value.trim(), ...prev].slice(0, 5));
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            sortBy: 'tvl',
            order: 'desc',
            tvlRange: [0, 1000000],
            apyRange: [0, 100]
        });
    };

    const getFilteredAndSortedPools = () => {
        let result = [...pools];

        result = result.filter(pool => {
            const meetsTPLRange = pool.total_value >= filters.tvlRange[0] && 
                                pool.total_value <= filters.tvlRange[1];
            const meetsAPYRange = pool.apy >= filters.apyRange[0] && 
                                pool.apy <= filters.apyRange[1];
            return meetsTPLRange && meetsAPYRange;
        });

        if (searchTerm) {
            result = result.filter(pool => 
                pool.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pool.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        result.sort((a, b) => {
            let valueA, valueB;
            switch (filters.sortBy) {
                case 'tvl':
                    valueA = a.total_value;
                    valueB = b.total_value;
                    break;
                case 'volume':
                    valueA = a.volume_24h;
                    valueB = b.volume_24h;
                    break;
                case 'apy':
                    valueA = a.apy;
                    valueB = b.apy;
                    break;
                case 'fee':
                    valueA = a.fee_bp;
                    valueB = b.fee_bp;
                    break;
                default:
                    return 0;
            }
            return filters.order === 'asc' ? valueA - valueB : valueB - valueA;
        });

        return result;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Button 
                    onClick={() => navigate(-1)} 
                    variant="outlined" 
                    sx={{ mb: 2 }}
                >
                    Back to Assets
                </Button>
                <Alert severity="error" sx={{ mt: 2 }}>
                    Error loading pools: {error}
                </Alert>
            </Box>
        );
    }

    if (!pools || pools.length === 0) {
        return (
            <Box p={3}>
                <Button 
                    onClick={() => navigate(-1)} 
                    variant="outlined" 
                    sx={{ mb: 2 }}
                >
                    Back to Assets
                </Button>
                <Alert severity="info">
                    No liquidity pools found for {code}
                </Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Button 
                onClick={() => navigate(-1)} 
                variant="outlined" 
                sx={{ mb: 2 }}
            >
                Back to Assets
            </Button>

            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" sx={{ flexGrow: 1 }}>
                        Liquidity Pools for {code}
                    </Typography>
                    <TextField
                        placeholder="Search pools by pair or ID..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        variant="outlined"
                        size="small"
                        sx={{ width: 300 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={clearSearch}>
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <IconButton
                        onClick={() => setShowFilters(!showFilters)}
                        color={showFilters ? 'primary' : 'default'}
                    >
                        <FilterList />
                    </IconButton>
                </Box>

                {searchHistory.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                            Recent searches:
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                            {searchHistory.map((term, index) => (
                                <Chip
                                    key={index}
                                    label={term}
                                    size="small"
                                    onClick={() => setSearchTerm(term)}
                                    onDelete={() => {
                                        setSearchHistory(prev => 
                                            prev.filter(t => t !== term)
                                        );
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                )}

                {showFilters && (
                    <PoolFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={clearFilters}
                    />
                )}
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        <AccountBalance /> Total Value Locked
                                    </Typography>
                                    <Typography variant="h5">
                                        ${selectedPool?.total_value.toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        <ShowChart /> 24h Volume
                                    </Typography>
                                    <Typography variant="h5">
                                        ${selectedPool?.volume_24h.toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        <Assessment /> APY
                                    </Typography>
                                    <Typography variant="h5">
                                        {selectedPool?.apy.toFixed(2)}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        <SwapHoriz /> Fee Rate
                                    </Typography>
                                    <Typography variant="h5">
                                        {(selectedPool?.fee_bp / 100).toFixed(2)}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12}>
                    <Paper>
                        <Tabs value={tabValue} onChange={handleTabChange} centered>
                            <Tab label="Price Chart" icon={<ShowChart />} />
                            <Tab label="Volume Chart" icon={<Timeline />} />
                        </Tabs>
                        <Box p={3} height={400}>
                            {chartData.length === 0 ? (
                                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                    <Typography color="textSecondary">
                                        No trade data available for the selected time period
                                    </Typography>
                                </Box>
                            ) : (
                                <ResponsiveContainer>
                                    {tabValue === 0 ? (
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line 
                                                type="monotone" 
                                                dataKey="price" 
                                                stroke="#8884d8"
                                                dot={false}
                                            />
                                        </LineChart>
                                    ) : (
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="volume" fill="#82ca9d" />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Pair</TableCell>
                                    <TableCell align="right">Total Value</TableCell>
                                    <TableCell align="right">24h Volume</TableCell>
                                    <TableCell align="right">APY</TableCell>
                                    <TableCell align="right">Fee</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getFilteredAndSortedPools().map((pool) => (
                                    <TableRow 
                                        key={pool.id}
                                        selected={selectedPool?.id === pool.id}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                                cursor: 'pointer'
                                            }
                                        }}
                                        onClick={() => handlePoolSelect(pool)}
                                    >
                                        <TableCell>{pool.pair}</TableCell>
                                        <TableCell align="right">
                                            {pool.total_value.toLocaleString(undefined, {
                                                maximumFractionDigits: 2
                                            })}
                                        </TableCell>
                                        <TableCell align="right">
                                            {pool.volume_24h.toLocaleString(undefined, {
                                                maximumFractionDigits: 2
                                            })}
                                        </TableCell>
                                        <TableCell align="right">
                                            {pool.apy.toFixed(2)}%
                                        </TableCell>
                                        <TableCell align="right">
                                            {(pool.fee_bp / 100).toFixed(2)}%
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handlePoolSelect(pool)}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(searchTerm ? filteredPools : pools).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography color="textSecondary">
                                                {searchTerm 
                                                    ? "No pools match your search criteria" 
                                                    : "No pools available"
                                                }
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                        Recent Trades
                    </Typography>
                    
                    {isLoadingTrades ? (
                        <CircularProgress />
                    ) : trades.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Price</TableCell>
                                        <TableCell>Base Amount</TableCell>
                                        <TableCell>Counter Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {trades.map((trade) => (
                                        <TableRow key={trade.id}>
                                            <TableCell>
                                                {new Date(trade.time).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={trade.type}
                                                    color={trade.type === 'Buy' ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {trade.price.toFixed(7)}
                                            </TableCell>
                                            <TableCell>
                                                {trade.baseAmount.toFixed(7)}
                                            </TableCell>
                                            <TableCell>
                                                {trade.counterAmount.toFixed(7)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Alert severity="info">
                            No trade data available for the selected time period
                        </Alert>
                    )}
                </Grid>

                {trades.length > 0 && (
                    <Grid item xs={12}>
                        <Box sx={{ mt: 4, height: 300 }}>
                            <Typography variant="h6" gutterBottom>
                                Trade History
                            </Typography>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trades}>
                                    <XAxis 
                                        dataKey="time" 
                                        tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                                    />
                                    <YAxis />
                                    <Tooltip 
                                        labelFormatter={(label) => new Date(label).toLocaleString()}
                                        formatter={(value) => value.toFixed(7)}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke="#8884d8" 
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default PoolsView; 