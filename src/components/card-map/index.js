import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { 
    format, 
  } from 'date-fns';
import { Divider } from '@mui/material';

export default function RecipeReviewCard({
            idFreight,
            clientOrigin, 
            addrresOrigin,
            clientDestination, 
            addrresDestination,
            distance,
            duration}) {
    
    var dating = format(new Date(), 'dd/MM/yyyy')
    var newDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss')

    return (
        <Card sx={{ maxWidth: 1200 }}>
        <CardHeader
            title={"Rota de entrega"}
            subheader={dating}
        />

        <CardContent>
            <Typography variant="body2" color="text.secondary">
                    <font size="3" color="primary">Partindo de: </font> <h6>{clientOrigin}</h6> 
                    - {addrresOrigin}
                    </Typography>
                    <br/>
                    <Typography variant="body2" color="text.secondary">    
                    <font size="3" color="primary">Para: </font>
                    <h6>{clientDestination}</h6>
                    - {addrresDestination}
            </Typography>
        </CardContent>


        <CardContent>

            <Typography variant="body2" color="text.secondary">
                Distancia <h6>{distance}</h6> 
                Duração : <h6>{duration}</h6>
            </Typography>
            <br/>
            <Divider/>
            <br/>
            <Typography variant="body2" color="text.secondary">
                A rota é atualizada a cada 1 hora
            </Typography>

            <br/>
            <Typography variant="body2" color="text.secondary">
                Ultima atualização {newDate}
            </Typography>


        </CardContent>
        </Card>
    );
}