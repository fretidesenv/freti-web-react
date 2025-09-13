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
import { Link, useNavigate} from "react-router-dom";
import Stack from '@mui/material/Stack';
import { Chip } from '@mui/material';
import { useSelector } from 'react-redux';
import firebase from '../../config/firebase';
import { getAuth, deleteUser } from "firebase/auth";


require('firebase/auth')

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


export default function CustomPaginationActionsTable1({lista}) {
  const userType = useSelector(state => state.user)
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

  const deleteUserNow = async (user) => {

    // var user = admin.auth().deleteUser(user.uid)
    // .then(item=> {
    //   console.log(item)

    //   firebase.firestore()
    //     .collection('user_web')
    //     .doc(user.id)
    //     .delete()
    //   .catch(error => {
    //       console.log(error) 
    //   });

    // })
    // .catch(function(error) {
    //   console.log("Error deleting user", user.uid, error);
    // });
    if (userType.perfil === "Master") {
      var result = window.confirm("Deseja mesmo excluir esse usuário?");
      if (result === true) {

        // const auth = getAuth();
        // debugger

        // var userfire = firebase.auth().currentUser

        // deleteUser(user.id)
        // debugger
        // var userfire = firebase.auth().currentUser
        // userfire.delete().then(() => {
        //   alert("Usuário excluído com sucesso!");
          
        const auth = getAuth();
        const userToDelete = user.uid;
        
        deleteUser(userToDelete)
        .then(() => {
          
          
            // Usuário excluído com sucesso.
        })
        .catch((error) => {
          console.error(error)
          console.log(error)
            // Trate erros (por exemplo, usuário não encontrado, permissões insuficientes, etc.).
        });

          // await firebase.firestore().collection('users').doc(user.uid).delete();

          // await firebase.firestore().collection('user_web').doc(user.uid).delete();

                navigate("/newUser");

        // }).catch((error) => {
        //   console.log("Erro ao excluir usuário:", error);
        // });

      }
    }
  };

function renderStatusColor(status){
      if(status === "Ativo") {
          return  <Stack direction="row" spacing={1}>
                      <Chip label={status} color="primary" />
                  </Stack>
      }
      else if(status === "Inativo") {
        return  <Stack  direction="row" spacing={1}>
                    <Chip label={status} color="error" />
                </Stack>
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
                <TableCell ><strong>Telefone</strong></TableCell>
                <TableCell ><strong>Perfil</strong></TableCell>
                <TableCell ><strong>Status</strong></TableCell>
                <TableCell ><strong>Editar</strong></TableCell>
            </TableRow>
        </TableHead>

        <TableBody>
          {(rowsPerPage > 0
            ? lista.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : lista
          ).map((row) => (
            <TableRow key={row.name}>
                <TableCell  component="th" scope="row">
                    {row.name}
                </TableCell>
                <TableCell >
                    {row.cpf}
                </TableCell>
                <TableCell >
                    {row.email}
                </TableCell>
                <TableCell >
                    {row.phoneNumber}
                </TableCell>
                <TableCell >
                    {row.perfil}
                </TableCell>
                <TableCell >
                    {renderStatusColor(row.ativo)}
                </TableCell>
                <TableCell >
                    <Link to={'/newUser/' + row.id}>
                        <EditOutlinedIcon />
                    </Link>
                    <Link to={'#'}>
                        <DeleteOutlinedIcon onClick={(e) => deleteUserNow(row)} color='error'/>
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
