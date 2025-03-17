import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Grid, 
    Card, 
    CardContent, 
    CardActions, 
    Typography, 
    Button,
    Box
} from '@mui/material';
import { Pool as PoolIcon } from '@mui/icons-material';

const AssetGrid = ({ assets }) => {
    return (
        <Grid container spacing={3}>
            {assets.map((asset) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`${asset.code}-${asset.issuer}`}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <img 
                                    src={asset.image_url} 
                                    alt={asset.code}
                                    style={{ width: 32, height: 32, marginRight: 8 }}
                                />
                                <Typography variant="h6" component="h2">
                                    {asset.code}
                                </Typography>
                            </Box>
                            <Typography color="textSecondary" gutterBottom>
                                Market Cap: ${asset.market_cap?.toLocaleString()}
                            </Typography>
                            <Typography color="textSecondary">
                                Price: ${asset.price?.toFixed(6)}
                            </Typography>
                            <Typography color="textSecondary">
                                Holders: {asset.holders?.toLocaleString()}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button
                                component={Link}
                                to={`/pools/${asset.code}/${asset.issuer}`}
                                variant="contained"
                                size="small"
                                color="primary"
                                startIcon={<PoolIcon />}
                                fullWidth
                            >
                                View Liquidity Pools
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default AssetGrid; 