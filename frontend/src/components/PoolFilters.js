import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Chip,
    Stack
} from '@mui/material';
import { FilterList, Close } from '@mui/icons-material';

const PoolFilters = ({ filters, onFilterChange, onClearFilters }) => {
    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FilterList sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Advanced Filters
                </Typography>
                <IconButton size="small" onClick={onClearFilters}>
                    <Close />
                </IconButton>
            </Box>

            <Stack direction="row" spacing={2}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={filters.sortBy}
                        onChange={(e) => onFilterChange('sortBy', e.target.value)}
                        label="Sort By"
                        size="small"
                    >
                        <MenuItem value="tvl">TVL</MenuItem>
                        <MenuItem value="volume">24h Volume</MenuItem>
                        <MenuItem value="apy">APY</MenuItem>
                        <MenuItem value="fee">Fee Rate</MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Order</InputLabel>
                    <Select
                        value={filters.order}
                        onChange={(e) => onFilterChange('order', e.target.value)}
                        label="Order"
                        size="small"
                    >
                        <MenuItem value="asc">Ascending</MenuItem>
                        <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>TVL Range</Typography>
                <Slider
                    value={filters.tvlRange}
                    onChange={(e, value) => onFilterChange('tvlRange', value)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000000}
                    step={10000}
                />
            </Box>

            <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>APY Range (%)</Typography>
                <Slider
                    value={filters.apyRange}
                    onChange={(e, value) => onFilterChange('apyRange', value)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100}
                    step={1}
                />
            </Box>

            <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Active Filters:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {Object.entries(filters).map(([key, value]) => {
                        if (value) {
                            return (
                                <Chip
                                    key={key}
                                    label={`${key}: ${value}`}
                                    onDelete={() => onFilterChange(key, null)}
                                    size="small"
                                />
                            );
                        }
                        return null;
                    })}
                </Stack>
            </Box>
        </Paper>
    );
};

export default PoolFilters; 