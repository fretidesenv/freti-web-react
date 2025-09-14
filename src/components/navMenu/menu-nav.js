import React, { useState, useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import EditNoteIcon from '@mui/icons-material/EditNote';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MailIcon from "@mui/icons-material/Mail";
import TuneIcon from '@mui/icons-material/Tune';
import AccountMenu from "../menuProfile";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useLocation } from "react-router-dom";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import { Badge, Grid } from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import LocalAtmOutlinedIcon from '@mui/icons-material/LocalAtmOutlined';
import logoImage from "../../image/logo.png";
import packageJson from "../../../package.json";
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import paymentService from "../../service/payment.service";
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import AddToQueueRoundedIcon from '@mui/icons-material/AddToQueueRounded';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const drawerWidth = 240;

const CustomFooter = ( {open} ) => (
  <div>
    {open ? (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}> Versão: {packageJson.version}</div>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <BuildCircleIcon />
        <p style={{ fontSize: '8px' }}>
          Versão: {packageJson.version}
        </p>
      </div>
    )}
  </div>
);

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function NewMiniDrawer({ divOpen }) {
  const theme = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(() => {
    const savedOpenState = localStorage.getItem('drawerOpen');
    return savedOpenState !== null ? JSON.parse(savedOpenState) : true;
  });

  const [data, setData] = useState(() => {
    // Recupera os dados do localStorage ao carregar a página
    const savedData = localStorage.getItem("shipperData");
    debugger
    return savedData ? JSON.parse(savedData) : null;
  });
  const [logo, setLogo] = useState(() => {
    // Recupera os dados do localStorage ao carregar a página
    const savedLogo = localStorage.getItem("shipperLogo");
    return savedLogo ? JSON.parse(savedLogo) : null;
  });

  const [activeItem, setActiveItem] = useState("");

  const [openSubMenu, setOpenSubMenu] = useState(() => {
    const savedSubMenuState = localStorage.getItem('submenuOpen');
    return savedSubMenuState !== null ? JSON.parse(savedSubMenuState) : false;
  });
  const [openFiscalSubMenu, setOpenFiscalSubMenu] = useState(() => {
    const savedFiscalSubMenuState = localStorage.getItem('fiscalSubmenuOpen');
    return savedFiscalSubMenuState !== null ? JSON.parse(savedFiscalSubMenuState) : false;
  });
  const [openCadastroSubMenu, setOpenCadastroSubMenu] = useState(() => {
    const savedCadastroSubMenuState = localStorage.getItem('cadastroSubmenuOpen')
    return savedCadastroSubMenuState !== null ? JSON.parse(savedCadastroSubMenuState) : false;
  })
  const [openParamSubMenu, setOpenParamSubMenu] = useState(() => {
    const savedParamSubMenuState = localStorage.getItem('paramSubmenuOpen')
    return savedParamSubMenuState !== null ? JSON.parse(savedParamSubMenuState) : false;
  })

  useEffect(() => {
    const path = location.pathname;

    if (path === "/") {
      setActiveItem("Dashboard");
    } else if (path === "/clientList" || path === "/client") {
      setActiveItem("Cliente");
    } else if (path === "/embarcador" || path === "/newEmbarcador") {
      setActiveItem("Embarcador");
    } else if (path === "/freightlist" || path === "/freight") {
      setActiveItem("Frete");
    } else if (path === "/userList" || path === "/newUser") {
      setActiveItem("Usuario");
    } else if (path === "/importFile") {
      setActiveItem("Importacao");
    } else if (path === "/freightsDetail") {
      setActiveItem("Acomp");
    } else if (path === "/driverList" || path === "/driver") {
      setActiveItem("Motorista");
    } else if (path === "/listPayment" || path === "/listPaymentDetail") {
      setActiveItem("Pagamentos");
    } else if (path === "/listOcurrence" || path === "/newOcurrence") {
        setActiveItem("Ocorrencia");
    } else if (path === "/insertMdfe") {
        setActiveItem("mdfe");
    }else {
      console.error("Não foi Possivel localizar esta rota");
    }
  }, [location]);

  useEffect(() => {
    localStorage.setItem('drawerOpen', JSON.stringify(open));
  }, [open]);

  const dispatch = useDispatch();

  var user = useSelector((state) => state?.user);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleSubMenuClick = () => {
    setOpenSubMenu((prev) => {
      localStorage.setItem('submenuOpen', JSON.stringify(!prev));
      return !prev;
    });
  };

  const handleFiscalSubMenuClick = () => {
    setOpenFiscalSubMenu((prev) => {
      localStorage.setItem('fiscalSubmenuOpen', JSON.stringify(!prev));
      return !prev;
    });
  };

  const handleCadastroSubMenuClick = () => {
    setOpenCadastroSubMenu((prev) => {
      localStorage.setItem('cadastroSubmenuOpen', JSON.stringify(!prev));
      return !prev;
    });
  };

  const handleParamSubMenuClick = () => {
    setOpenParamSubMenu((prev) => {
      localStorage.setItem('paramSubmenuOpen', JSON.stringify(!prev));
      return !prev;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // console.log(user);
        console.log("[useEffect] Buscando dados do embarcador...");
        let datas = await paymentService.searchShipper(user.uidShipper);
        localStorage.setItem("shipperData", JSON.stringify(datas));
        // console.log(data);
        setData(datas);
      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
      }
    };

    if (user?.uidShipper) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    fetchLogo();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('submenuOpen', JSON.stringify(openSubMenu));
  }, [openSubMenu]);

  useEffect(() => {
    localStorage.setItem('fiscalSubmenuOpen', JSON.stringify(openFiscalSubMenu));
  }, [openFiscalSubMenu]);

  useEffect(() => {
    localStorage.setItem('cadastroSubmenuOpen', JSON.stringify(openCadastroSubMenu));
  }, [openCadastroSubMenu]);

  useEffect(() => {
    localStorage.setItem('paramSubmenuOpen', JSON.stringify(openParamSubMenu));
  }, [openParamSubMenu]);

  const fetchLogo = async () => {
    try {

      if (data.logo) {
        localStorage.setItem("shipperLogo", JSON.stringify(data.logo));
        setLogo(data.logo);
      }
      else {
        localStorage.setItem("shipperLogo", JSON.stringify(logoImage));
        setLogo(logoImage);
      }

    } catch (error) {
      setLogo(logoImage);
    }
  }

  return (
    <>
      {useSelector((state) => state.usuarioLogado) > 0 ? (
        <>
          <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar
              position="fixed"
              open={open}
              style={{ background: "var(--primary-color)" }}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  edge="start"
                  sx={{
                    marginRight: 5,
                    ...(open && { display: "none" }),
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <Grid container spacing={2}>
                  <Grid item lx={8}>
                    <label style={{ fontSize: "25px" }}>{user?.name}</label>
                  </Grid>
                  <Grid item xs={2}></Grid>
                  <Grid item xs={4}></Grid>
                </Grid>
                <IconButton style={{ color: "#FFF" }} aria-label="cart">
                  <Badge badgeContent={0} color="primary">
                    <NotificationsNoneOutlinedIcon color="#FFF" />
                  </Badge>
                </IconButton>
                <AccountMenu />
              </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={open}>
              <DrawerHeader style={{ background: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
                  <img
                    src={logo}
                    alt="Logo"
                    style={{
                      height: "250%",       // ocupa a altura do container
                      width: "auto",        // mantém a proporção
                      objectFit: "contain", // garante que não corte
                    }}
                  />
                  <IconButton onClick={handleDrawerClose}>
                    {theme.direction === "rtl" ? (
                      <ChevronRightIcon style={{ color: "#fff" }} />
                    ) : (
                      <ChevronLeftIcon style={{ color: "#fff" }} />
                    )}
                  </IconButton>
                </DrawerHeader>
              <Divider />
              <List>

                <ListItem key="Dashboard" disablePadding sx={{ display: "block" }}>
                    <Link
                    to="/"
                    style={{ textDecoration: "none", color: "inherit" }}
                    >
                    <ListItemButton
                        sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        borderLeft: activeItem === "Dashboard" ? "4px solid var(--secondary-color)" : "4px solid transparent",
                        backgroundColor:
                            activeItem === "Dashboard" ? "rgba(25, 118, 210, 0.1)" : "transparent",
                        transition: "all 0.3s ease",
                        '&:hover': {
                            backgroundColor: "rgba(25, 118, 210, 0.15)",
                        },
                        }}
                    >
                        <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: open ? 2 : "auto",
                            color: activeItem === "Dashboard" ? "var(--primary-color)" : "#a0a0a0",
                            transition: "color 0.3s ease",
                            justifyContent: "center",
                        }}
                        >
                        <DashboardCustomizeIcon />
                        </ListItemIcon>
                        <ListItemText
                        primary="Dashboard"
                        primaryTypographyProps={{
                            fontWeight: activeItem === "Dashboard" ? "bold" : "medium",
                            color: activeItem === "Dashboard" ? "var(--primary-color)" : "#a0a0a0",
                        }}
                        sx={{
                            opacity: open ? 1 : 0,
                            transition: "opacity 0.3s ease",
                        }}
                        />
                    </ListItemButton>
                    </Link>
                </ListItem>

              </List>
              <Divider />

              <List>
                <ListItem disablePadding sx={{ display: "block" }} >
                  <ListItemButton onClick={handleCadastroSubMenuClick} >
                    <ListItemIcon >
                      <EditNoteIcon />
                    </ListItemIcon>
                    <ListItemText primary="Cadastro" />
                    {openCadastroSubMenu ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>

                  <Collapse in={openCadastroSubMenu} timeout="auto" unmountOnExit >
                    <List component="div" disablePadding >
                      {user.perfil === "Comercial" || user.perfil === "Admin" || user.perfil === "Terceiros" || user.perfil === "Master" ? (

                        <ListItem key="Cliente" disablePadding sx={{ display: "block" }}>
                        <Link
                          to="/clientList"
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <ListItemButton
                            sx={{
                              minHeight: 48,
                              justifyContent: open ? "initial" : "center",
                              px: 2.5,
                              borderLeft: activeItem === "Cliente" ? "4px solid var(--secondary-color)" : "4px solid transparent",
                              backgroundColor:
                                activeItem === "Cliente" ? "rgba(25, 118, 210, 0.1)" : "transparent",
                              transition: "all 0.3s ease",
                              '&:hover': {
                                backgroundColor: "rgba(25, 118, 210, 0.15)",
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                mr: open ? 2 : "auto",
                                color: activeItem === "Cliente" ? "var(--primary-color)" : "#a0a0a0",
                                transition: "color 0.3s ease",
                                justifyContent: "center",
                              }}
                            >
                              <MailIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary="Cliente"
                              primaryTypographyProps={{
                                fontWeight: activeItem === "Cliente" ? "bold" : "medium",
                                color: activeItem === "Cliente" ? "var(--primary-color)" : "#a0a0a0",
                              }}
                              sx={{
                                opacity: open ? 1 : 0,
                                transition: "opacity 0.3s ease",
                              }}
                            />
                          </ListItemButton>
                        </Link>
                        </ListItem>

                      ) : (
                        ""
                      )}

                      {user.perfil === "Master" ? (

                        <ListItem key="Embarcador" disablePadding sx={{ display: "block" }}>
                        <Link
                          to="/embarcador"
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <ListItemButton
                            sx={{
                              minHeight: 48,
                              justifyContent: open ? "initial" : "center",
                              px: 2.5,
                              borderLeft: activeItem === "Embarcador" ? "4px solid var(--secondary-color)" : "4px solid transparent",
                              backgroundColor:
                                activeItem === "Embarcador" ? "rgba(25, 118, 210, 0.1)" : "transparent",
                              transition: "all 0.3s ease",
                              '&:hover': {
                                backgroundColor: "rgba(25, 118, 210, 0.15)",
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                mr: open ? 2 : "auto",
                                color: activeItem === "Embarcador" ? "var(--primary-color)" : "#a0a0a0",
                                transition: "color 0.3s ease",
                                justifyContent: "center",
                              }}
                            >
                              <BusinessTwoToneIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary="Embarcador"
                              primaryTypographyProps={{
                                fontWeight: activeItem === "Embarcador" ? "bold" : "medium",
                                color: activeItem === "Embarcador" ? "var(--primary-color)" : "#a0a0a0",
                              }}
                              sx={{
                                opacity: open ? 1 : 0,
                                transition: "opacity 0.3s ease",
                              }}
                            />
                          </ListItemButton>
                        </Link>
                        </ListItem>

                      ) : (
                        ""
                      )}

                      {user.perfil === "Master" || user.perfil === "Terceiros" || user.perfil === "Admin" || user.perfil === "Operacional" ? (

                        <ListItem key="Motorista" disablePadding sx={{ display: "block" }}>
                        <Link
                          to="/driverList"
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <ListItemButton
                            sx={{
                              minHeight: 48,
                              justifyContent: open ? "initial" : "center",
                              px: 2.5,
                              borderLeft: activeItem === "Motorista" ? "4px solid var(--secondary-color)" : "4px solid transparent",
                              backgroundColor:
                                activeItem === "Motorista" ? "rgba(25, 118, 210, 0.1)" : "transparent",
                              transition: "all 0.3s ease",
                              '&:hover': {
                                backgroundColor: "rgba(25, 118, 210, 0.15)",
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                mr: open ? 2 : "auto",
                                color: activeItem === "Motorista" ? "var(--primary-color)" : "#a0a0a0",
                                transition: "color 0.3s ease",
                                justifyContent: "center",
                              }}
                            >
                              <DirectionsCarIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary="Motorista"
                              primaryTypographyProps={{
                                fontWeight: activeItem === "Motorista" ? "bold" : "medium",
                                color: activeItem === "Motorista" ? "var(--primary-color)" : "#a0a0a0",
                              }}
                              sx={{
                                opacity: open ? 1 : 0,
                                transition: "opacity 0.3s ease",
                              }}
                            />
                          </ListItemButton>
                        </Link>
                        </ListItem>
                      
                      ) : (
                        ""
                      )}

                      {user.perfil === "Admin" || user.perfil === "Master" ? (

                        <ListItem key="Usuário" disablePadding sx={{ display: "block" }}>
                            <Link
                              to="/userList"
                              style={{ textDecoration: "none", color: "inherit" }}
                            >
                              <ListItemButton
                                sx={{
                                  minHeight: 48,
                                  justifyContent: open ? "initial" : "center",
                                  px: 2.5,
                                  borderLeft: activeItem === "Usuario" ? "4px solid var(--secondary-color)" : "4px solid transparent",
                                  backgroundColor:
                                    activeItem === "Usuario" ? "rgba(25, 118, 210, 0.1)" : "transparent",
                                  transition: "all 0.3s ease",
                                  '&:hover': {
                                    backgroundColor: "rgba(25, 118, 210, 0.15)",
                                  },
                                }}
                              >
                                <ListItemIcon
                                  sx={{
                                    minWidth: 0,
                                    mr: open ? 2 : "auto",
                                    color: activeItem === "Usuario" ? "var(--primary-color)" : "#a0a0a0",
                                    transition: "color 0.3s ease",
                                    justifyContent: "center",
                                  }}
                                >
                                  <AccountBoxIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary="Usuario"
                                  primaryTypographyProps={{
                                    fontWeight: activeItem === "Usuario" ? "bold" : "medium",
                                    color: activeItem === "Usuario" ? "var(--primary-color)" : "#a0a0a0",
                                  }}
                                  sx={{
                                    opacity: open ? 1 : 0,
                                    transition: "opacity 0.3s ease",
                                  }}
                                />
                              </ListItemButton>
                            </Link>
                        </ListItem>

                        
                      ) : (
                        ""
                      )}
                    </List>
                  </Collapse>
                </ListItem>
              </List>

              {/* <Divider /> */}
              {user.perfil === "Comercial" || user.perfil === "Operacional" || user.perfil === "Admin" || user.perfil === "Terceiros" || user.perfil === "Master" ? (

                <ListItem key="Frete" disablePadding sx={{ display: "block" }}>
                <Link
                  to="/freightlist"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <ListItemButton
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      borderLeft: activeItem === "Frete" ? "4px solid var(--secondary-color)" : "4px solid transparent",
                      backgroundColor:
                        activeItem === "Frete" ? "rgba(25, 118, 210, 0.1)" : "transparent",
                      transition: "all 0.3s ease",
                      '&:hover': {
                        backgroundColor: "rgba(25, 118, 210, 0.15)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : "auto",
                        color: activeItem === "Frete" ? "var(--primary-color)" : "#a0a0a0",
                        transition: "color 0.3s ease",
                        justifyContent: "center",
                      }}
                    >
                       <LocalShippingIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Frete"
                      primaryTypographyProps={{
                        fontWeight: activeItem === "Frete" ? "bold" : "medium",
                        color: activeItem === "Frete" ? "var(--primary-color)" : "#a0a0a0",
                      }}
                      sx={{
                        opacity: open ? 1 : 0,
                        transition: "opacity 0.3s ease",
                      }}
                    />
                  </ListItemButton>
                </Link>
              </ListItem>

              ) : (
                ""
              )}

              <Divider />

              {user.perfil === "Master" ? (

                <List>
                  <ListItem disablePadding sx={{ display: "block" }}>
                    <ListItemButton onClick={handleFiscalSubMenuClick}>
                      <ListItemIcon>
                        <ReceiptLongIcon />
                      </ListItemIcon>
                      <ListItemText primary="Fiscal" />
                      {openFiscalSubMenu ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>

                    <Collapse in={openFiscalSubMenu} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        <ListItem key="mdfe" disablePadding sx={{ display: "block" }}>
                          <Link
                            to="/listMdfe"
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <ListItemButton
                              sx={{
                                minHeight: 48,
                                justifyContent: open ? "initial" : "center",
                                px: 2.5,
                                borderLeft:
                                  activeItem === "mdfe"
                                    ? "4px solid var(--secondary-color)"
                                    : "4px solid transparent",
                                backgroundColor:
                                  activeItem === "mdfe"
                                    ? "rgba(25, 118, 210, 0.1)"
                                    : "transparent",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  backgroundColor: "rgba(25, 118, 210, 0.15)",
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 0,
                                  mr: open ? 2 : "auto",
                                  color: activeItem === "mdfe" ? "var(--primary-color)" : "#a0a0a0",
                                  transition: "color 0.3s ease",
                                  justifyContent: "center",
                                }}
                              >
                                <TableViewOutlinedIcon />
                              </ListItemIcon>

                              <ListItemText
                                primary="MDFe"
                                primaryTypographyProps={{
                                  fontWeight: activeItem === "mdfe" ? "bold" : "medium",
                                  color: activeItem === "mdfe" ? "var(--primary-color)" : "#a0a0a0",
                                }}
                                sx={{
                                  opacity: open ? 1 : 0,
                                  transition: "opacity 0.3s ease",
                                }}
                              />
                            </ListItemButton>
                          </Link>
                        </ListItem>
                        <ListItem key="Importação de arquivo" disablePadding sx={{ display: "block" }}>
                          <Link
                            to="/importFile"
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <ListItemButton
                              sx={{
                                minHeight: 48,
                                justifyContent: open ? "initial" : "center",
                                px: 2.5,
                                borderLeft: activeItem === "Importacao" ? "4px solid var(--secondary-color)" : "4px solid transparent",
                                backgroundColor:
                                  activeItem === "Importacao" ? "rgba(25, 118, 210, 0.1)" : "transparent",
                                transition: "all 0.3s ease",
                                '&:hover': {
                                  backgroundColor: "rgba(25, 118, 210, 0.15)",
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 0,
                                  mr: open ? 2 : "auto",
                                  color: activeItem === "Importacao" ? "var(--primary-color)" : "#a0a0a0",
                                  transition: "color 0.3s ease",
                                  justifyContent: "center",
                                }}
                              >
                                <FolderSharedIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary="Importacao"
                                primaryTypographyProps={{
                                  fontWeight: activeItem === "Importacao" ? "bold" : "medium",
                                  color: activeItem === "Importacao" ? "var(--primary-color)" : "#a0a0a0",
                                }}
                                sx={{
                                  opacity: open ? 1 : 0,
                                  transition: "opacity 0.3s ease",
                                }}
                              />
                            </ListItemButton>
                          </Link>
                        </ListItem>
                      </List>
                    </Collapse>
                  </ListItem>
                </List>

              ) : (
                ""
              )}

              {user.perfil === "Master" ? (

              <List>
                <ListItem disablePadding sx={{ display: "block" }}>
                  <ListItemButton onClick={handleSubMenuClick}>
                    <ListItemIcon>
                      <MonetizationOnIcon />
                    </ListItemIcon>
                    <ListItemText primary="Financeiro" />
                    {openSubMenu ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>

                  <Collapse in={openSubMenu} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <ListItem key="Pagamentos" disablePadding sx={{ display: "block" }}>
                        <Link
                          to="/listPayment"
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <ListItemButton
                            sx={{
                              minHeight: 48,
                              justifyContent: open ? "initial" : "center",
                              px: 2.5,
                              borderLeft:
                                activeItem === "Pagamentos"
                                  ? "4px solid var(--primary-color)"
                                  : "4px solid transparent",
                              backgroundColor:
                                activeItem === "Pagamentos"
                                  ? "rgba(25, 118, 210, 0.1)"
                                  : "transparent",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                backgroundColor: "rgba(25, 118, 210, 0.15)",
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                mr: open ? 2 : "auto",
                                color:
                                  activeItem === "Pagamentos" ? "var(--primary-color)" : "#a0a0a0",
                                transition: "color 0.3s ease",
                                justifyContent: "center",
                              }}
                            >
                              <LocalAtmOutlinedIcon />
                            </ListItemIcon>

                            <ListItemText
                              primary="Pagamentos"
                              primaryTypographyProps={{
                                fontWeight:
                                  activeItem === "Pagamentos" ? "bold" : "medium",
                                color:
                                  activeItem === "Pagamentos" ? "var(--primary-color)" : "#a0a0a0",
                              }}
                              sx={{
                                opacity: open ? 1 : 0,
                                transition: "opacity 0.3s ease",
                              }}
                            />
                          </ListItemButton>
                        </Link>
                      </ListItem>
                    </List>
                  </Collapse>
                </ListItem>
              </List>

              ) : (
                ""
              )}

              {user.perfil === "Master" ? (

                <List>
                  <ListItem disablePadding sx={{ display: "block" }} >
                    <ListItemButton onClick={handleParamSubMenuClick} >
                      <ListItemIcon>
                        <TuneIcon />
                      </ListItemIcon>
                      <ListItemText primary="Parâmetros" ></ListItemText>
                      {openParamSubMenu ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>

                    <Collapse in={openParamSubMenu} timeout="auto" unmountOnExit >
                      <List component="div" disablePadding>
                        <ListItem key="Ocorrências" disablePadding sx={{ display: "block" }}>
                          <Link
                            to="/listOcurrence"
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <ListItemButton
                              sx={{
                                minHeight: 48,
                                justifyContent: open ? "initial" : "center",
                                px: 2.5,
                                borderLeft: activeItem === "Ocorrencia" ? "4px solid var(--secondary-color)" : "4px solid transparent",
                                backgroundColor:
                                  activeItem === "Ocorrencia" ? "rgba(25, 118, 210, 0.1)" : "transparent",
                                transition: "all 0.3s ease",
                                '&:hover': {
                                  backgroundColor: "rgba(25, 118, 210, 0.15)",
                                },
                              }}
                            >

                            
                              <ListItemIcon
                                sx={{
                                  minWidth: 0,
                                  mr: open ? 2 : "auto",
                                  color: activeItem === "Ocorrencia" ? "var(--primary-color)" : "#a0a0a0",
                                  transition: "color 0.3s ease",
                                  justifyContent: "center",
                                }}
                              >
                                <AddToQueueRoundedIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary="Ocorrências"
                                primaryTypographyProps={{
                                  fontWeight: activeItem === "Ocorrencia" ? "bold" : "medium",
                                  color: activeItem === "Ocorrencia" ? "var(--primary-color)" : "#a0a0a0",
                                }}
                                sx={{
                                  opacity: open ? 1 : 0,
                                  transition: "opacity 0.3s ease",
                                }}
                              />
                            </ListItemButton>
                          </Link>
                        </ListItem>

                        <ListItem key="Tabela ICMS" disablePadding sx={{ display: "block" }}>
                          <Link
                            to="/tableIcmsList"
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <ListItemButton
                              sx={{
                                minHeight: 48,
                                justifyContent: open ? "initial" : "center",
                                px: 2.5,
                                borderLeft: activeItem === "tableIcms" ? "4px solid var(--secondary-color)" : "4px solid transparent",
                                backgroundColor:
                                  activeItem === "tableIcms" ? "rgba(25, 118, 210, 0.1)" : "transparent",
                                transition: "all 0.3s ease",
                                '&:hover': {
                                  backgroundColor: "rgba(25, 118, 210, 0.15)",
                                },
                              }}
                            >

                            
                              <ListItemIcon
                                sx={{
                                  minWidth: 0,
                                  mr: open ? 2 : "auto",
                                  color: activeItem === "tableIcms" ? "var(--primary-color)" : "#a0a0a0",
                                  transition: "color 0.3s ease",
                                  justifyContent: "center",
                                }}
                              >
                                <TableRowsOutlinedIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary="Tabela ICMS"
                                primaryTypographyProps={{
                                  fontWeight: activeItem === "tableIcms" ? "bold" : "medium",
                                  color: activeItem === "tableIcms" ? "var(--primary-color)" : "#a0a0a0",
                                }}
                                sx={{
                                  opacity: open ? 1 : 0,
                                  transition: "opacity 0.3s ease",
                                }}
                              />
                            </ListItemButton>
                          </Link>
                        </ListItem>

                        <ListItem key="Tabela de Preço" disablePadding sx={{ display: "block" }}>
                          <Link
                            to="/priceTableList"
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <ListItemButton
                              sx={{
                                minHeight: 48,
                                justifyContent: open ? "initial" : "center",
                                px: 2.5,
                                borderLeft: activeItem === "priceTable" ? "4px solid var(--secondary-color)" : "4px solid transparent",
                                backgroundColor:
                                  activeItem === "priceTable" ? "rgba(25, 118, 210, 0.1)" : "transparent",
                                transition: "all 0.3s ease",
                                '&:hover': {
                                  backgroundColor: "rgba(25, 118, 210, 0.15)",
                                },
                              }}
                            >

                            
                              <ListItemIcon
                                sx={{
                                  minWidth: 0,
                                  mr: open ? 2 : "auto",
                                  color: activeItem === "priceTable" ? "var(--primary-color)" : "#a0a0a0",
                                  transition: "color 0.3s ease",
                                  justifyContent: "center",
                                }}
                              >
                                <TableViewOutlinedIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary="Tabela de Preço"
                                primaryTypographyProps={{
                                  fontWeight: activeItem === "priceTable" ? "bold" : "medium",
                                  color: activeItem === "priceTable" ? "var(--primary-color)" : "#a0a0a0",
                                }}
                                sx={{
                                  opacity: open ? 1 : 0,
                                  transition: "opacity 0.3s ease",
                                }}
                              />
                            </ListItemButton>
                          </Link>
                        </ListItem>
                      </List>
                    </Collapse>
                  </ListItem>
                </List>

              ) : (
                ""
              )}

              <Divider />
              {user.perfil === "Comercial" ||
              user.perfil === "Operacional" ||
              user.perfil === "Admin" ||
              user.perfil === "Terceiros" ||
              user.perfil === "Master" ? (


                <ListItem key="Acomp. de entregas" disablePadding sx={{ display: "block" }}>
                <Link
                  to="/freightsDetail"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <ListItemButton
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      borderLeft: activeItem === "Acomp" ? "4px solid var(--secondary-color)" : "4px solid transparent",
                      backgroundColor:
                        activeItem === "Acomp" ? "rgba(25, 118, 210, 0.1)" : "transparent",
                      transition: "all 0.3s ease",
                      '&:hover': {
                        backgroundColor: "rgba(25, 118, 210, 0.15)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : "auto",
                        color: activeItem === "Acomp" ? "var(--primary-color)" : "#a0a0a0",
                        transition: "color 0.3s ease",
                        justifyContent: "center",
                      }}
                    >
                      <MapOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Acomp. de entregas"
                      primaryTypographyProps={{
                        fontWeight: activeItem === "Acomp" ? "bold" : "medium",
                        color: activeItem === "Acomp" ? "var(--primary-color)" : "#a0a0a0",
                      }}
                      sx={{
                        opacity: open ? 1 : 0,
                        transition: "opacity 0.3s ease",
                      }}
                    />
                  </ListItemButton>
                </Link>
              </ListItem>

              ) : (
                ""
              )}

                <Divider />
              <ListItem key={"logout"} disablePadding sx={{ display: "block" }}>
                <Link
                  to={"#"}
                  style={{ textDecorationLine: "none", color: "#707070" }}
                  onClick={() => dispatch({ type: "LOG_OUT" })}
                  underline="none"
                >
                  <ListItemButton
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      {0 % 2 === 0 ? <LogoutIcon /> : <MailIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={"Sair"}
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                  </ListItemButton>
                </Link>
              </ListItem>
              <CustomFooter open={open} />
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <DrawerHeader />
              {divOpen}
            </Box>
          </Box>
        </>
      ) : (
        <Navigate to="/login" />
      )}
    </>
  );
}