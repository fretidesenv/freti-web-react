import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';

export default function DialogConfirme({open, handleClose, handleOk, input, title, message, status}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));
  
  return (
    <div>

      <Dialog
        maxWidth={"xs"}
        fullWidth={true}        
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        aria-describedby='resposive-dialog-describe'
      >

        <DialogContent align={"center"} style={{marginRight: 30, marginBottom: 30, marginLeft: 30, alignItems: "center"}}>
            <DialogTitle id="responsive-dialog-title"  >
                <p>
                  {
                    status == 'success' ? 
                      <CheckCircleOutlineIcon color='success' style={{fontSize: 100}}/>
                    : status == 'error' ? 
                      <HighlightOffOutlinedIcon color='error' style={{fontSize: 100}} />
                        : <WarningAmberIcon color='warning' style={{fontSize: 100}} />
                  }
                </p>
            <h5>{title}</h5>
            </DialogTitle>

            <DialogContentText id="alert" align="center" style={{color: "#6F89A4"}} className="mt-2" >
                {message}
            </DialogContentText>
        </DialogContent>
        
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            NÃO
          </Button>
          <Button onClick={(e) => handleOk(input)} autoFocus>
            SIM
          </Button>
        </DialogActions>

      </Dialog>

    </div>
  );
}