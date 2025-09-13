import * as React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { TableHead } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import SentimentDissatisfiedOutlinedIcon from '@mui/icons-material/SentimentDissatisfiedOutlined';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
import { Link, useNavigate,  } from 'react-router-dom';
import driverService from '../../service/driver.service';

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


export default function MyDriverGridPagination({lista}) {
  let navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - lista.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  function renderStatusColor(status){
      
    if(status == "Não integrado") {
      return  <Stack  direction="row" spacing={1}>
                <Chip icon={<SentimentDissatisfiedOutlinedIcon />} label={"Não integrado"} className="btn btn-outline-warning" color="warning"/>
            </Stack>
    }
    else {
        return  <Stack  direction="row" spacing={1}>
                    <Chip icon={<SentimentDissatisfiedOutlinedIcon />} label={"Sem status"} color="primary"/>
                </Stack>
    }
  }

  function deleteDriver(id){
    
    var result = window.confirm("Deseja mesmo excluir esse motorista ? ");
    if (result == true) {
        driverService.deleteMyDriver(id)
        navigate("/myDriverList");
    } else {
       return;
    }
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
        <TableHead>
            <TableRow>
                <TableCell style={{color: "#000"}}><strong>Nome</strong></TableCell>
                <TableCell ><strong>CPF</strong></TableCell>
                <TableCell ><strong>E-mail</strong></TableCell>
                <TableCell ><strong>Status</strong></TableCell>
                <TableCell ><strong>Editar</strong></TableCell>
            </TableRow>
        </TableHead>

        <TableBody>
          {(rowsPerPage > 0
            ? lista.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : lista
          ).map((row) => (
            <TableRow key={row?.personalData?.fullName}>
                <TableCell >
                    {row.personalData?.fullName}
                </TableCell>
                <TableCell >
                    {row.personalData?.documentCpf}
                </TableCell>
                <TableCell >
                    {row?.firstData?.email}
                </TableCell>
                <TableCell >
                    {renderStatusColor(row?.firstData?.statusDriver)}
                </TableCell>
                <TableCell>
                  <Link to={'/myDriverList/' + row.id}>
                      <EditOutlinedIcon />
                  </Link>
                  <Link to={'#'}>
                      <DeleteOutlinedIcon onClick={(e) => deleteDriver(row.id)} color='error'/>
                  </Link>
              </TableCell>
            </TableRow>
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
              count={lista.length}
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
  );
}
