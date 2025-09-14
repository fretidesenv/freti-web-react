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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MailIcon from "@mui/icons-material/Mail";
import AccountMenu from "../menuProfile";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useLocation } from "react-router-dom";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import { Badge, Grid } from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import LocalAtmOutlinedIcon from '@mui/icons-material/LocalAtmOutlined';
import logoImage from "../../image/logo.png";
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import packageJson from "../../../package.json";
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import paymentService from "../../service/payment.service";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from '../../config/firebase';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import AddToQueueRoundedIcon from '@mui/icons-material/AddToQueueRounded';


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

export default function MiniDrawer({ divOpen }) {
  const theme = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(() => {
    const savedOpenState = localStorage.getItem('drawerOpen');
    return savedOpenState !== null ? JSON.parse(savedOpenState) : true;
  });

  const [data, setData] = useState(() => {
    // Recupera os dados do localStorage ao carregar a página
    const savedData = localStorage.getItem("shipperData");
    return savedData ? JSON.parse(savedData) : null;
  });
  const [logo, setLogo] = useState(() => {
    // Recupera os dados do localStorage ao carregar a página
    const savedLogo = localStorage.getItem("shipperLogo");
    return savedLogo ? JSON.parse(savedLogo) : null;
  });
  // const [logo, setLogo] = useState("");

  const [activeItem, setActiveItem] = useState("");

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
    } else if (path === "/tableIcmsList") {
      setActiveItem("Tabela ICMS");
    } else {
      console.error("Não foi Possivel localizar esta rota");
    }
  }, [location]);

  useEffect(() => {
    localStorage.setItem('drawerOpen', JSON.stringify(open));
  }, [open]);

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

  const dispatch = useDispatch();

  var user = useSelector((state) => state?.user);

  const fetchLogo = async () => {
    try {

      // console.log(data.dataPersonal.nameFantasy);
      // const storageRef = ref(storage, `files/logo/${data.dataPersonal.nameFantasy}`);
      // const photoURL = await getDownloadURL(storageRef);
      if (data.logo) {
        localStorage.setItem("shipperLogo", JSON.stringify(data.logo));
        setLogo(data.logo);
      }
      else {
        localStorage.setItem("shipperLogo", JSON.stringify(logoImage));
        setLogo(logoImage);
      }

    } catch (error) {
      console.log("[useEffect] Logo não encontrado, utilizando padrão.");
      setLogo(logoImage);
    }
  }

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleClickFalseTrue = () => {
    setOpen(!open);

  };

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
              <DrawerHeader style={{ background: "var(--primary-color)" }}>
                <img
                  src={logo}
                  alt="Logo"
                  style={{ maxWidth: "160px", width: "100%", height: "auto" }}
                  width={"160px"}
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
                <ListItem
                  key={"Dashboard"}
                  disablePadding
                  sx={{ display: "block", textDecorationLine: "none" }}
                >
                  <Link
                    to={"/"}
                    style={{ textDecorationLine: "none", color: "#707070" }}
                    // onClick={() => open && setOpen(false)}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        backgroundColor:
                          activeItem === "Dashboard"
                            ? "#d3d3d3"
                            : "transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {0 % 2 === 0 ? (
                          <DashboardCustomizeIcon />
                        ) : (
                          <MailIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={"Dashboard"}
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              </List>
              <Divider />
              {user.perfil === "Comercial" ||
              user.perfil === "Admin" ||
              user.perfil === "Master" ? (
                <ListItem
                  key={"Cliente"}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <Link
                    to={"/clientList"}
                    style={{ textDecorationLine: "none", color: "#707070" }}
                    underline="none"
                    // onClick={() => open && setOpen(false)}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        backgroundColor:
                          activeItem === "Cliente" ? "#d3d3d3" : "transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {0 % 2 === 0 ? (
                          <FolderSharedIcon />
                        ) : (
                          <MailIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={"Cliente"}
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              ) : (
                ""
              )}
              {user.perfil === "Admin" || user.perfil === "Master" ? (
                <ListItem
                  key={"Embarcador"}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <Link
                    to={"/embarcador"}
                    style={{ textDecorationLine: "none", color: "#707070" }}
                    underline="none"
                    // onClick={() => open && setOpen(false)}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        backgroundColor:
                          activeItem === "Embarcador"
                            ? "#d3d3d3"
                            : "transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {0 % 2 === 0 ? <BusinessTwoToneIcon /> : <MailIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={"Embarcador"}
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              ) : (
                ""
              )}
              {user.perfil === "Master" || user.perfil === "Admin" ? (
                <ListItem
                  key={"Motorista"}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <Link
                    to={"/driverList"}
                    style={{ textDecorationLine: "none", color: "#707070" }}
                    underline="none"
                    // onClick={() => open && setOpen(false)}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        backgroundColor:
                          activeItem === "Motorista"
                            ? "#d3d3d3"
                            : "transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {0 % 2 === 0 ? (
                          <DirectionsCarIcon />
                        ) : (
                          <MailIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={"Motorista"}
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              ) : (
                ""
              )}
              <Divider />
              {user.perfil === "Comercial" ||
              user.perfil === "Admin" ||
              user.perfil === "Master" ? (
                <ListItem
                  key={"Frete"}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <Link
                    to={"/freightlist"}
                    style={{ textDecorationLine: "none", color: "#707070" }}
                    underline="none"
                    // onClick={() => open && setOpen(false)}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        backgroundColor:
                          activeItem === "Frete" ? "#d3d3d3" : "transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {0 % 2 === 0 ? (
                          <LocalShippingIcon />
                        ) : (
                          <MailIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={"Frete"}
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              ) : (
                ""
              )}
              {user.perfil === "Admin" || user.perfil === "Master" ? (
                <ListItem
                  key={"Usuário"}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <Link
                    to={"/userList"}
                    style={{ textDecorationLine: "none", color: "#707070" }}
                    underline="none"
                    // onClick={() => open && setOpen(false)}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        backgroundColor:
                          activeItem === "Usuario" ? "#d3d3d3" : "transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {0 % 2 === 0 ? (
                          <AccountBoxIcon />
                        ) : (
                          <MailIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={"Usuário"}
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              ) : (
                ""
              )}
              {user.perfil === "Comercial" ||
              user.perfil === "Admin" ||
              user.perfil === "Master" ? (
                <ListItem
                  key={"Importação de arquivo"}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <Link
                    to={"/importFile"}
                    style={{ textDecorationLine: "none", color: "#707070" }}
                    underline="none"
                    // onClick={() => open && setOpen(false)}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        backgroundColor:
                          activeItem === "Importacao"
                            ? "#d3d3d3"
                            : "transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {0 % 2 === 0 ? (
                          <FolderSharedIcon />
                        ) : (
                          <MailIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={"Importação de XML "}
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              ) : (
                ""
              )}

              {user.perfil === "Comercial" ||
              user.perfil === "Admin" ||
              user.perfil === "Master" ? (
                <ListItem
                  key={"Ocorrências"}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <Link
                    to={"/listOcurrence"}
                    style={{ textDecorationLine: "none", color: "#707070" }}
                    underline="none"
                    // onClick={() => open && setOpen(false)}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        backgroundColor:
                          activeItem === "ocorrencia"
                            ? "#d3d3d3"
                            : "transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {0 % 2 === 0 ? (
                          <AddToQueueRoundedIcon />
                        ) : (
                          <MailIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={"Ocorrências "}
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              ) : (
                ""
              )}
              <Divider />

              {user.perfil === "Comercial" ||
              user.perfil === "Admin" ||
              user.perfil === "Master" ? (
                <ListItem
                  key={"Tabela de Preço"}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <Link
                    to={"/priceTableList"}
                    style={{ textDecorationLine: "none", color: "#707070" }}
                    underline="none"
                    // onClick={() => open && setOpen(false)}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        backgroundColor:
                          activeItem === "ocorrencia"
                            ? "#d3d3d3"
                            : "transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {0 % 2 === 0 ? (
                          <TableViewOutlinedIcon />
                        ) : (
                          <TableViewOutlinedIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={"Tabela de Preço "}
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              ) : (
                ""
              )}
              {user.perfil === "Comercial" ||
              user.perfil === "Admin" ||
              user.perfil === "Master" ? (
                <ListItem
                  key={"Tabela ICMS"}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <Link
                    to={"/tableIcmsList"}
                    style={{ textDecorationLine: "none", color: "#707070" }}
                    underline="none"
                    // onClick={() => open && setOpen(false)}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        backgroundColor:
                          activeItem === "ocorrencia"
                            ? "#d3d3d3"
                            : "transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {0 % 2 === 0 ? (
                          <TableRowsOutlinedIcon />
                        ) : (
                          <MailIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={"Tabela ICMS "}
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              ) : (
                ""
              )}

              {user.perfil === "Comercial" ||
              user.perfil === "Admin" ||
              user.perfil === "Master" ? (
                <ListItem
                  key={"Acomp. de entregas"}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <Link
                    to={"/freightsDetail"}
                    style={{ textDecorationLine: "none", color: "#707070" }}
                    underline="none"
                    // onClick={() => open && setOpen(false)}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        backgroundColor:
                          activeItem === "Acomp" ? "#d3d3d3" : "transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {0 % 2 === 0 ? <MapOutlinedIcon /> : <MailIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={"Acomp. de entregas"}
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              ) : (
                ""
              )}

            {user.perfil === "Master" ? (
                <ListItem
                  key={"Pagamentos"}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <Link
                    to={"/listPayment"}
                    style={{ textDecorationLine: "none", color: "#707070" }}
                    underline="none"
                    // onClick={() => open && setOpen(false)}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        backgroundColor:
                          activeItem === "Pagamentos" ? "#d3d3d3" : "transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {0 % 2 === 0 ? <LocalAtmOutlinedIcon /> : <MailIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={"Pagamentos"}
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              ) : (
                ""
              )}

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
              {/* <Footer>Versão: {packageJson.version}</Footer> */}
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