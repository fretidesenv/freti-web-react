import { useEffect, useState } from "react";
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Paper } from '@mui/material';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import firebase from '../../config/firebase';;

const db = firebase.firestore();


export default function CardHeadDriver({titulo}) {


    const [carregando, setCarregando] = useState(1);

    const [lenght, setLenght] = useState(0);

    useEffect(() => {

        db.collection('drivers_users').where('statusDriver','not-in', ['authorized'])
        .get().then( async (result) => {
            
            setLenght(result.size);
            
            setCarregando(0)
        }).catch(error => {
            setCarregando(0)
            console.log(error)
        });
         
    },[0]);

    const styles = {
        card: {
          backgroundColor: '#fff', // Azul claro
          border: '0px solid #dc3545', // Azul mais escuro
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '300px',
          margin: 'auto',
        },
        title: {
          fontSize: '18px',
          fontWeight: '600',
          color: '#dc3545',
          marginBottom: '10px',
        },
        quantity: {
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#dc3545',
        },
      };
      

  return (

    <div style={styles.card}>
        <h3 style={styles.title}>Motoristas pendentes</h3>
        <div style={styles.quantity}>{lenght}</div>
    </div>

    // <Paper
    //     sx={{
    //         height: 150,
    //         width: 260,
    //         backgroundColor: (theme) =>
    //             theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    //         }}
    //     >

    //     <CardContent>
    //         <Typography variant="h6" component="div">
    //             Motoristas pendentes
    //         </Typography>
    //         <Typography variant="h2" sx={{ mb: 1.5 }} color="error">
    //         {
    //             carregando ? 
    //             <div class="spinner-border text-danger" role="status">
    //             <span class="visually-hidden">Loading...</span></div>
    //             :
    //             <div className="row">
    //                 <div className="col-2">
    //                     <DirectionsCarFilledOutlinedIcon />
    //                 </div>
    //                 <div className="col-10">
    //                     {lenght}
    //                 </div>
    //             </div>
    //         }
    //         </Typography>
    //     </CardContent>

    // </Paper>
);
}
 
 
    