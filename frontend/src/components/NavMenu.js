import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    IconButton,
    Menu,
    MenuItem
} from '@mui/material';
import {
    AccountBalance as AssetsIcon,
    Pool as PoolsIcon,
    SwapHoriz as SwapIcon,
    Analytics as AnalyticsIcon,
    Menu as MenuIcon
} from '@mui/icons-material';

const NavMenu = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                    >
                        ACT Hub
                    </Typography>

                    {/* Desktop Menu */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/"
                            startIcon={<AssetsIcon />}
                        >
                            Assets
                        </Button>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/pools"
                            startIcon={<PoolsIcon />}
                        >
                            Pools
                        </Button>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/swap"
                            startIcon={<SwapIcon />}
                        >
                            Swap
                        </Button>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/analytics"
                            startIcon={<AnalyticsIcon />}
                        >
                            Analytics
                        </Button>
                    </Box>

                    {/* Mobile Menu */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            color="inherit"
                            onClick={handleMenu}
                            edge="end"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            onClick={handleClose}
                        >
                            <MenuItem component={RouterLink} to="/">
                                <AssetsIcon sx={{ mr: 1 }} /> Assets
                            </MenuItem>
                            <MenuItem component={RouterLink} to="/pools">
                                <PoolsIcon sx={{ mr: 1 }} /> Pools
                            </MenuItem>
                            <MenuItem component={RouterLink} to="/swap">
                                <SwapIcon sx={{ mr: 1 }} /> Swap
                            </MenuItem>
                            <MenuItem component={RouterLink} to="/analytics">
                                <AnalyticsIcon sx={{ mr: 1 }} /> Analytics
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default NavMenu; 