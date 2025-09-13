import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Link } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { Avatar, Badge, Card, CardActionArea, CardContent, Chip, Divider, List, ListItem, ListItemAvatar, ListItemText, Modal, TableFooter, TablePagination } from '@mui/material';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import EditNotificationsOutlinedIcon from '@mui/icons-material/EditNotificationsOutlined';
import freightPDF from '../../report/freight';
import freightService from '../../service/freight.service';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import firebase from '../../config/firebase';
import { useTheme } from '@emotion/react';

import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

function Row(props) {

  const db = firebase.firestore();


  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [driversInFila, setDriversInFila] =  React.useState([]);
  const [length, setLength] =  React.useState(0);

  var listDriverInFila = [];

  let navigate = useNavigate();

  // var clientOrigin = row.clientOrigin;
  // var clientDelivery = row.clientDelivery;

  var clientPayment = row.clientPayment;
  var driver = row.driver;
  var freight = row.freight;
  var vehicle = row.vehicle;
  
  var status = row.status; 
  var user = row.user;

  var typeVehicle = "";

  vehicle.typeVehicle.dados.map(element => {

    if(element.selected){
      if(typeVehicle == "") {
        typeVehicle += element.name;
      }else{
        typeVehicle += ", " + element.name;
      }
    }
  });

  var typeBodywork = "";

  vehicle.typeBodywork.dados.map(element => {

    if(element.selected){
      if(typeBodywork == "") {
        typeBodywork += element.name;
      }else{
        typeBodywork += ", " + element.name;
      }
    }
});


  // let dataCollect = format(new Date(clientOrigin.dateCollect), 'dd/MM/yyyy');

  function deleteFreight(id){
    var result = window.confirm("Deseja mesmo excluir esse frete ? ");
    if (result == true) {
        freightService.deleteFreight(id);
        navigate("/freightlist");
    } else {
       return;
    }
  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    // bgcolor: 'background.paper',
    // border: '2px solid #000',
    // boxShadow: 24,
    // pt: 2,
    // px: 4,
    // pb: 3,
  };

  function renderStatusColor(status){
      if(status === "Contratado") {
          return  <Stack direction="row" spacing={1}>
                      <Chip label={status} color="primary" />
                  </Stack>
      }
      else if(status === "Pendente de contratação") {
          return  <Stack  direction="row" spacing={1}>
                    <Chip label={status} color="default" />
                  </Stack>
      }
      else if(status === "Em Analise de perfil") {
        return  <Stack  direction="row" spacing={1}>
                    <Chip label={status} color="secondary" />
                </Stack>
      }
      else if(status === "Em Analise do motorista") {
        return  <Stack  direction="row" spacing={1}>
                    <Chip label={status} color="secondary" />
                </Stack>
      }
      else if(status === "Em transito") {
        return  <Stack  direction="row" spacing={1}>
                  <Chip label={status} color="success" />
                </Stack>
      }
      else if(status === "Entregue") {
        return  <Stack  direction="row" spacing={1}>
                  <Chip label={status} color="primary" />
                </Stack>
      }
      else if(status === "Finalizado") {
        return  <Stack  direction="row" spacing={1}>
                    <Chip label={status} color="warning" />
                </Stack>
      }
      else {
          return  <Stack direction="row" spacing={1}>
                      <Chip label={status} color="warning" />
                  </Stack>
      }
  }

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const getDriversQueueLenght = (id) => {

    db.collection('freight').doc(id).collection('queue')
        .get()
        .then( async (result) => {
            setLength(result.docs.length)
            return result.docs.length
        }).catch(error => {
            console.log(error)
        });
  }

  function getDriversQueue(id){

    db.collection('freight').doc(id).collection('queue')
        .get().then( async (result) => {

            result.docs.forEach(doc => {

                listDriverInFila.push({
                    id: doc.id,
                    ...doc.data()
                });
            })

            setDriversInFila(listDriverInFila);
            handleOpen()

        }).catch(error => {
            console.log(error)
        });
  }
  
  
  return (

    <React.Fragment>
      
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        {/* <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell> */}

        {/* <TableCell component="th" scope="row">
          {/* {dataCollect} */} 
        {/* </TableCell> */}
        
        <TableCell >{clientPayment.cnpj} </TableCell>
        <TableCell >{clientPayment.name} </TableCell>
        <TableCell >{vehicle.occupation}</TableCell>
        <TableCell >{" De: " + driver.valueInitial.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})  + " Até: " + driver.valueFinal.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</TableCell>
        <TableCell>
            {renderStatusColor(status.describe)}
        </TableCell>
        <TableCell>
        
            <Link to={'#' + row.id}>
              
              {//Chamando a lista de motoristas na fila e renderizando logo abaixo.
                getDriversQueueLenght(row.id)
              }
              <Badge key={row.id} onClick={(e) => getDriversQueue(row.id)}  badgeContent={length}  color="success">
                {/* <MailIcon color="action" /> */}
                <EditNotificationsOutlinedIcon color='primary'/>
              </Badge>
                {/* <EditNotificationsOutlinedIcon onClick={(e) => getDriversQueue(row.id)} color='error'/> */}
            </Link>
            <Link to={'/freight/' + row.id}>
                <EditOutlinedIcon />
            </Link>
            <Link to={'#'}>
                <DeleteOutlinedIcon onClick={(e) => deleteFreight(row.id)} color='error'/>
            </Link>
            <Link to={"#"} > 
                <PictureAsPdfOutlinedIcon onClick={(e) => freightPDF(row)} color='secondary'/>
            </Link>

        </TableCell>
      </TableRow>

      {/* <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h7" gutterBottom component="div">
                <strong>Detalhamento</strong>
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: "25%", font: "16px Arial, sans-serif"}}><strong>Cliente Origem</strong></TableCell>
                    <TableCell style={{ width: "25%", font: "16px Arial, sans-serif"}}><strong>Cliente Destino</strong></TableCell>
                    <TableCell style={{ width: "25%", font: "16px Arial, sans-serif"}}><strong>Produto</strong></TableCell>
                    <TableCell style={{ width: "25%", font: "16px Arial, sans-serif"}}><strong>Tipo de Veículo</strong></TableCell>
                    <TableCell style={{ width: "25%", font: "16px Arial, sans-serif"}}><strong>Tipo de Carroçeria</strong></TableCell>
                    <TableCell style={{ width: "25%", font: "16px Arial, sans-serif"}}><strong>Livre de Carga/Descarga</strong></TableCell>
                    <TableCell style={{ width: "25%", font: "16px Arial, sans-serif"}}><strong>Vendedor</strong></TableCell>
                    <TableCell style={{ width: "25%", font: "16px Arial, sans-serif"}}><strong>Orçamento</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell component="th" scope="row"> 
                            {clientOrigin.name}
                        </TableCell>
                        <TableCell>{clientDelivery.name}</TableCell>
                        <TableCell>{freight.product}</TableCell>
                        <TableCell>{typeBodywork}</TableCell>
                        <TableCell>{typeVehicle}</TableCell>
                        <TableCell>{vehicle.freeOfCharge}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{row.numberSerial}</TableCell>
                    </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow> */}

      <Modal 
          open={openModal}
          onClose={handleClose}
          aria-labelledby="parent-modal-title"
          aria-describedby="parent-modal-description"
        >

        <Box sx={{ ...style, width: 600 }}>
          <Card sx={{ maxWidth: 600 }}>
            <CardActionArea>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Motoristas na fila
                </Typography>
                {
                  driversInFila.length < 1 ?
                    <Typography gutterBottom color={"error"} component="div">
                        Não há motorista em espera para esse frete no momento
                    </Typography>
                  : 
                  driversInFila.map(item => (

                    // {

                    //     console.log(moment(item.registrationInLineTime,"DD/MM/YYYY HH:mm:ss").diff(moment(d1,'DD/MM/YYYY HH:mm:ss')))
    
                    // }

                  <div className='row'>



                    <List sx={{ width: '100%', maxWidth: 800, bgcolor: 'background.paper' }}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar alt={item.driver_name}  />
                          </ListItemAvatar>
                          <ListItemText
                            primary={item.driver_name}
                            secondary={
                              <React.Fragment>
                                <Typography
                                  sx={{ display: 'inline' }}
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  Na fila de espera desde: {format(new Date(item.registrationInLineTime.seconds * 1000), 'dd/MM/yyyy HH:mm:ss')}
                                </Typography>
                              </React.Fragment>
                            }
                          />
                          <ListItemText>
                            <Link to={'/driverList/' + item.driver_user}>
                                <EditOutlinedIcon />
                            </Link>
                          </ListItemText>
                        </ListItem>
                        <Divider variant="inset" component="li" />                        
                    </List>

                  </div>
                ))
              }
                {/* <Typography variant="body2" color="text.secondary">
                  Lizards are a widespread group of squamate reptiles, with over 6,000
                  species, ranging across all continents except Antarctica
                </Typography>*/}
              </CardContent> 
            </CardActionArea>
          </Card>
        </Box>
        {/* <Box sx={{ ...style, width: 400 }}>
            <h5 id="parent-modal-title">Motoristas na fila</h5>
            
            {
                driversInFila.map(item => (
                  <div className='row'>

                      <div className="col-md-6">
                            <label htmlFor="fullName" className="form-label">{item.driver_name}</label>
                        </div>

                        <div className="col-md-3">
                          <Link to={'/driverList/' + item.driver_user}>
                              <EditOutlinedIcon />
                          </Link>
                        </div>

                  </div>
                ))
            }

        </Box> */}
      </Modal>

    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    calories: PropTypes.number.isRequired,
    carbs: PropTypes.number.isRequired,
    fat: PropTypes.number.isRequired,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.number.isRequired,
        clientOriginId: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
      }),
    ).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    protein: PropTypes.number.isRequired,
  }).isRequired,
};


function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

export default function CollapsibleTable({list}) {
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [page, setPage] = React.useState(0);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - list.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  return (
    <>
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            {/* <TableCell /> */}
            <TableCell ><strong>CNPJ Pagador</strong></TableCell>
            <TableCell ><strong>Nome Pagador </strong></TableCell>
            {/* <TableCell ><strong>Cidade/UF Destino</strong></TableCell> */}
            <TableCell ><strong>Ocupação</strong></TableCell>
            <TableCell ><strong>Pagando ao Motorista</strong></TableCell>
            <TableCell ><strong>               Status</strong></TableCell>
            <TableCell ><strong>Editar</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {(rowsPerPage > 0
            ? list.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : list
          ).map((row) => (
            <Row key={row.id} row={row} />
          ))}

          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              colSpan={3}
              count={list.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: {
                  'aria-label': 'Linhas por página',
                },
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
        
      </Table>
    </TableContainer>

  </>
  );
}