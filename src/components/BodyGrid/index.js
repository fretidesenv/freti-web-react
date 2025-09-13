import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Card, CardContent, Divider} from '@mui/material';
import ChartHome from '../chart-home-frete';

export default function BodyGrid() {

  return (
    <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
            
            <Grid item xs={12}>
                <Grid key={""} item>
                    <Card sx={{ minWidth: 350 }}>
                        <CardContent sx={{ height: 700 }}>
                            <ChartHome />
                            <Divider/>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            
        </Grid>
    </Box>
  );
}