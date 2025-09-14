import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  ListItem,
  ListItemText,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Divider, List } from "antd";


export default function RetornoMdfeModal({ open, setOpen, mensagem, title, status }) {

   const renderMensagem = () => {
      if (!mensagem) return null;

  // Caso mensagem seja objeto com erros
      if (typeof mensagem === "object" && mensagem.erros) {
        return (
          <List>
            {mensagem.erros.map((msg, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="error">
                      • {msg}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        );
      }

      // Caso seja array de strings
      if (Array.isArray(mensagem)) {
        return (
          <List>
            {mensagem.map((msg, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="error">
                      • {msg}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        );
      }

      // Caso seja string simples
      if (typeof mensagem === "string") {
        return <Typography variant="body1">{mensagem}</Typography>;
      }

      // Último fallback (pra evitar erro)
      return (
        <Typography variant="body2" color="text.secondary">
          Retorno inesperado
        </Typography>
      );
    };


  return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth="sm" // 👈 agora maior (xs, sm, md, lg, xl)
            PaperProps={{
            sx: {
                borderRadius: 3,
                p: 2,
                bgcolor: "background.default",
                minHeight: "300px", // altura mínima
            }
            }}
        >
        {/* Cabeçalho */}
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {title || "Retorno do MDF-e"}
          </Typography>
        </DialogTitle>
        <Divider />

        {/* Corpo */}
        <DialogContent>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            gap={2}
            py={2}
          >
            {
                status === "success" ? (
                    <CheckCircleOutlineIcon color="success" sx={{ fontSize: 50 }} />
                ) : (
                    <ErrorOutlineIcon color="error" sx={{ fontSize: 50 }} />
                )
            }
            
            {/* Mensagem */}
            <Typography variant="body1" >
               {renderMensagem()}
            </Typography>
          </Box>
        </DialogContent>

        {/* Rodapé */}
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            {
                title === "Salvando MDF-e" ? (
                    ""
                ) : (
                    <Button
                        onClick={() => setOpen(false)}
                        variant="contained"
                        color="inherit"
                        sx={{ borderRadius: "8px", px: 3, backgroundColor: "var(--primary-color)", color: "white" }}
                    >
                    Fechar
                    </Button>
                )
            }
            
        </DialogActions>
      </Dialog>
  );
}
