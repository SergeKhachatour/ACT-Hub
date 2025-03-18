import React from 'react';
import { Card, CardContent, Typography, Button, Box, Divider, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
    People as PeopleIcon,
    AttachMoney as MoneyIcon,
    ShowChart as ShowChartIcon,
    Pool as PoolIcon 
} from '@mui/icons-material';

const AssetCard = ({ asset }) => {
    const navigate = useNavigate();

    const handleViewPools = () => {
        navigate(`/pools/${asset.code}/${asset.issuer}`);
    };

    // Fallback image if the asset image is not available
    const fallbackImage = 'https://stellar.expert/img/assets/unknown.svg';

    // Format numbers
    const formatNumber = (num) => {
        if (!num && num !== 0) return 'N/A';
        
        if (num >= 1000000000) {
            return `$${(num / 1000000000).toFixed(2)}B`;
        }
        if (num >= 1000000) {
            return `$${(num / 1000000).toFixed(2)}M`;
        }
        if (num >= 1000) {
            return `$${(num / 1000).toFixed(2)}K`;
        }
        return `$${num.toFixed(2)}`;
    };

    // Format holders count
    const formatHolders = (count) => {
        if (!count && count !== 0) return 'N/A';
        
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        }
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <img
                        src={asset.image}
                        alt={asset.code}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImage;
                        }}
                        style={{ width: 40, height: 40, marginRight: 12 }}
                    />
                    <Box>
                        <Typography variant="h6" component="div">
                            {asset.code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {asset.name}
                        </Typography>
                    </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {asset.issuer === 'native' ? 'Native Asset' : `Issuer: ${asset.issuer.slice(0, 4)}...${asset.issuer.slice(-4)}`}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ShowChartIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                Market Cap:
                            </Typography>
                        </Box>
                        <Typography variant="body2">
                            {formatNumber(asset.market_cap)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MoneyIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                Price:
                            </Typography>
                        </Box>
                        <Typography variant="body2">
                            {formatNumber(asset.price)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PeopleIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                Holders:
                            </Typography>
                        </Box>
                        <Typography variant="body2">
                            {formatHolders(asset.holders)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PoolIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                Pools:
                            </Typography>
                        </Box>
                        <Typography variant="body2">
                            {asset.pool_count || 0}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
            
            <Box sx={{ p: 2, pt: 0 }}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleViewPools}
                    disabled={!asset.pool_count}
                >
                    {asset.pool_count ? 'View Pools' : 'No Pools Available'}
                </Button>
            </Box>
        </Card>
    );
};

export default AssetCard; 