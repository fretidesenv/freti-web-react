import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AccountMenu from '../menuProfile';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { Badge, Grid } from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import MailIcon from '@mui/icons-material/Mail';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import logoImage from '../../image/logo.jpeg';
import { Footer } from 'antd/es/layout/layout';
import packageJson from '../../../package.json'

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  // display: 'flex',
  alignItems: 'center',
  // justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function MiniDrawer({divOpen}) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);

  const dispatch = useDispatch()

  var user = useSelector(state => state?.user);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (

    <>
      { 
        useSelector(state => state.usuarioLogado) > 0 ?
        <>
            <Box sx={{ display: 'flex'}}>
              <CssBaseline />
              <AppBar position="fixed" open={open} style={{ background: "#012442"}}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            sx={{
                                marginRight: 5,
                                ...(open && { display: 'none' }),
                            }}
                        >
                        <MenuIcon />
                        </IconButton>
                        <Grid container spacing={2}>
                          <Grid item lx={8}>
                            <label style={{fontSize: "25px"}}>{user?.name}</label>
                          </Grid>
                          <Grid item xs={2}>
                          </Grid>
                          <Grid item xs={4}>
                          </Grid>
                        </Grid>
                        <IconButton style={{color: '#FFF'}} aria-label="cart">
                          <Badge badgeContent={0} color="primary">
                            <NotificationsNoneOutlinedIcon color="#FFF" />
                          </Badge>
                        </IconButton>
                        <AccountMenu /> {/* Menu laterial direito */}
                    </Toolbar>
                    
              </AppBar>
              <Drawer variant="permanent" open={open} >
                
                <DrawerHeader style={{ background: "#012442"}}>
                  <img src={logoImage} alt="Logo" style={{height: 'auto'}} width={'160px'} />
                </DrawerHeader>
                <Divider />
                <List >
                    <ListItem key={"Dashboard"}  disablePadding sx={{ display: 'block', textDecorationLine: "none" }}>
                        <Link to={"/"} style={{textDecorationLine: "none", color: "#707070" }}>
                            <ListItemButton 
                                sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                {0 % 2 === 0 ? <DashboardCustomizeOutlinedIcon /> : <MailIcon />}
                                </ListItemIcon>
                                <ListItemText primary={"Dashboard"} sx={{ opacity: open ? 1 : 0 }}  />
                            </ListItemButton>
                      </Link>
                    </ListItem>

                    <Divider />

                    {
                        user.perfil == "Comercial" || user.perfil == "Admin" || user.perfil == "Master"  ?

                          <ListItem key={"Cliente"} disablePadding sx={{ display: 'block' }}>
                              <Link to={"/clientList"} style={{textDecorationLine: "none", color: "#707070" }} underline="none">
                                  <ListItemButton
                                      sx={{
                                      minHeight: 48,
                                      justifyContent: open ? 'initial' : 'center',
                                      px: 2.5,
                                      }}
                                  >
                                      <ListItemIcon
                                          sx={{
                                              minWidth: 0,
                                              mr: open ? 3 : 'auto',
                                              justifyContent: 'center',
                                          }}
                                      >
                                      {0 % 2 === 0 ? <FolderSharedOutlinedIcon /> : <MailIcon />}
                                      </ListItemIcon>
                                      <ListItemText primary={"Cliente"} sx={{ opacity: open ? 1 : 0 }} />
                                  </ListItemButton>
                              </Link>
                          </ListItem>

                      :
                      ""
                    }

                    {   
                      user.perfil == "Admin" || user.perfil == "Master" ? 
                          <ListItem key={"Embarcador"} disablePadding sx={{ display: 'block' }}>
                              <Link to={"/embarcador"} style={{textDecorationLine: "none", color: "#707070" }} underline="none">
                                  <ListItemButton
                                      sx={{
                                      minHeight: 48,
                                      justifyContent: open ? 'initial' : 'center',
                                      px: 2.5,
                                      }}
                                  >
                                      <ListItemIcon
                                          sx={{
                                              minWidth: 0,
                                              mr: open ? 3 : 'auto',
                                              justifyContent: 'center',
                                          }}
                                      >
                                      {0 % 2 === 0 ? <BusinessOutlinedIcon /> : <MailIcon />}
                                      </ListItemIcon>
                                      <ListItemText primary={"Embarcador"} sx={{ opacity: open ? 1 : 0 }} />
                                  </ListItemButton>
                              </Link>
                          </ListItem>
                      :
                      ""
                    }

                    {
                        user.perfil == "Master"  ?

                          <ListItem key={"Motorista"} disablePadding sx={{ display: 'block' }}>
                              <Link to={"/driverList"} style={{textDecorationLine: "none", color: "#707070" }} underline="none">
                                  <ListItemButton
                                      sx={{
                                      minHeight: 48,
                                      justifyContent: open ? 'initial' : 'center',
                                      px: 2.5,
                                      }}
                                  >
                                      <ListItemIcon
                                          sx={{
                                              minWidth: 0,
                                              mr: open ? 3 : 'auto',
                                              justifyContent: 'center',
                                          }}
                                      >
                                      {0 % 2 === 0 ? <DirectionsCarFilledOutlinedIcon /> : <MailIcon />}
                                      </ListItemIcon>
                                      <ListItemText primary={"Motorista"} sx={{ opacity: open ? 1 : 0 }} />
                                  </ListItemButton>
                              </Link>
                          </ListItem>

                      :
                      ""
                    }

                    <Divider />
                    {
                        user.perfil == "Comercial" || user.perfil == "Admin" || user.perfil == "Master"  ? 

                          <ListItem key={"Frete"} disablePadding sx={{ display: 'block' }}>
                              <Link to={"/freightlist"} style={{textDecorationLine: "none", color: "#707070" }} underline="none">
                                  <ListItemButton
                                      sx={{
                                      minHeight: 48,
                                      justifyContent: open ? 'initial' : 'center',
                                      px: 2.5,
                                      }}
                                  >
                                      <ListItemIcon
                                          sx={{
                                              minWidth: 0,
                                              mr: open ? 3 : 'auto',
                                              justifyContent: 'center',
                                          }}
                                      >
                                      {0 % 2 === 0 ? <LocalShippingOutlinedIcon /> : <MailIcon />}
                                      </ListItemIcon>
                                      <ListItemText primary={"Frete"} sx={{ opacity: open ? 1 : 0 }} />
                                  </ListItemButton>
                              </Link>
                          </ListItem>

                        :
                        ""
                    }   

                    {   
                      user.perfil == "Admin" || user.perfil == "Master" ? 
                          <ListItem key={"Usuário"} disablePadding sx={{ display: 'block' }}>
                              <Link to={"/userList"} style={{textDecorationLine: "none", color: "#707070" }} underline="none">
                                  <ListItemButton
                                      sx={{
                                      minHeight: 48,
                                      justifyContent: open ? 'initial' : 'center',
                                      px: 2.5,
                                      }}
                                  >
                                      <ListItemIcon
                                          sx={{
                                              minWidth: 0,
                                              mr: open ? 3 : 'auto',
                                              justifyContent: 'center',
                                          }}
                                      >
                                      {0 % 2 === 0 ? <AccountBoxOutlinedIcon /> : <MailIcon />}
                                      </ListItemIcon>
                                      <ListItemText primary={"Usuário"} sx={{ opacity: open ? 1 : 0 }} />
                                  </ListItemButton>
                              </Link>
                          </ListItem>
                      :
                      ""
                    }

                    {
                        user.perfil == "Comercial" || user.perfil == "Admin" || user.perfil == "Master"  ?

                          <ListItem key={"Importação de arquivo"} disablePadding sx={{ display: 'block' }}>
                              <Link to={"/importFile"} style={{textDecorationLine: "none", color: "#707070" }} underline="none">
                                  <ListItemButton
                                      sx={{
                                      minHeight: 48,
                                      justifyContent: open ? 'initial' : 'center',
                                      px: 2.5,
                                      }}
                                  >
                                      <ListItemIcon
                                          sx={{
                                              minWidth: 0,
                                              mr: open ? 3 : 'auto',
                                              justifyContent: 'center',
                                          }}
                                      >
                                      {0 % 2 === 0 ? <FolderSharedOutlinedIcon /> : <MailIcon />}
                                      </ListItemIcon>
                                      <ListItemText primary={"Importação de XML "} sx={{ opacity: open ? 1 : 0 }} />
                                  </ListItemButton>
                              </Link>
                          </ListItem>

                      :
                      ""
                    }
                    <Divider />

                    {
                        user.perfil == "Comercial" || user.perfil == "Admin" || user.perfil == "Master"  ?

                          <ListItem key={"Acomp. de entregas"} disablePadding sx={{ display: 'block' }}>
                              <Link to={"/freightsDetail"} style={{textDecorationLine: "none", color: "#707070" }} underline="none">
                                  <ListItemButton
                                      sx={{
                                      minHeight: 48,
                                      justifyContent: open ? 'initial' : 'center',
                                      px: 2.5,
                                      }}
                                  >
                                      <ListItemIcon
                                          sx={{
                                              minWidth: 0,
                                              mr: open ? 3 : 'auto',
                                              justifyContent: 'center',
                                          }}
                                      >
                                      {0 % 2 === 0 ? <TravelExploreIcon /> : <MailIcon />}
                                      </ListItemIcon>
                                      <ListItemText primary={"Acomp. de entregas"} sx={{ opacity: open ? 1 : 0 }} />
                                  </ListItemButton>
                              </Link>
                          </ListItem>

                      :
                      ""
                    }


                    <ListItem key={"logout"} disablePadding sx={{ display: 'block' }}>
                        <Link to={"#"} style={{textDecorationLine: "none", color: "#707070" }} onClick={() => dispatch({type: 'LOG_OUT'})} underline="none">
                            <ListItemButton
                                sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                {0 % 2 === 0 ? <LogoutOutlinedIcon /> : <MailIcon />}
                                </ListItemIcon>
                                <ListItemText primary={"Sair"} sx={{ opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </Link>
                    </ListItem>

                </List>  
                <Footer>
                  Versão: {packageJson.version}
                </Footer>                      
              </Drawer>
              
              {/* style={{ background: "#f5f7fb"}} */}
              <Box component="main" sx={{ flexGrow: 1, p: 3 }} >
                <DrawerHeader />
                {divOpen}
              </Box>
            </Box>
        </>
        : 
        <Navigate to='/login' />
      }
    </> 
    
  );
}
