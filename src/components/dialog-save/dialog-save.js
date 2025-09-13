import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Button, Result, Typography } from 'antd';

export default function DialogSave({open, handleClose, title, message, status}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <div>

      <Dialog
          maxWidth={"sm"}
          fullWidth={true}        
          fullScreen={fullScreen}
          open={open}
          onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
          aria-describedby='resposive-dialog-describe'
        >
          <Result
              status={status}
              title={title}
              subTitle={message}
              extra={[
                <Button size='large' style={{background: '#000', color: '#FFF', width: '50%' }}
                  onClick={handleClose} autoFocus
                  >OK, entendi
                </Button>
              ]}
            />

        </Dialog>
    </div>
  );
}