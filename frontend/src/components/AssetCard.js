import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardActions, Typography, Button } from '@mui/material';

const AssetCard = ({ asset }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" component="h2">
                    {asset.code}
                </Typography>
                {/* ... other card content ... */}
            </CardContent>
            <CardActions>
                <Button
                    component={Link}
                    to={`/pools/${asset.code}/${asset.issuer}`}
                    size="small"
                    color="primary"
                >
                    View Pools
                </Button>
            </CardActions>
        </Card>
    );
};

export default AssetCard; 