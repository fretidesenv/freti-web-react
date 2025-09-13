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

export default function DialogDeConfirmação({ open, handleClose, title, message, status }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));

    return (
      <Dialog
        maxWidth="xs"
        fullWidth
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        aria-describedby="responsive-dialog-describe"
      >
        <DialogContent align="center" style={{ margin: 30 }}>
          <DialogTitle id="responsive-dialog-title">
            {
              status === 'success' ? 
                <CheckCircleOutlineIcon color='success' style={{ fontSize: 100 }} />
              : status === 'error' ? 
                <HighlightOffOutlinedIcon color='error' style={{ fontSize: 100 }} />
              : <WarningAmberIcon color='warning' style={{ fontSize: 100 }} />
            }
            <h5>{title}</h5>
          </DialogTitle>

          <DialogContentText id="alert" align="center" style={{ color: "#6F89A4" }} className="mt-2">
            {message}
          </DialogContentText>
        </DialogContent>
        
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
