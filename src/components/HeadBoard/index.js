import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CardHeadFreight from '../card-head-frete-dispo';
import CardHeadDriver from '../card-head-driver';
import CardHeadInDriver from '../card-head-in-travel';
import CardHeadLoadinDriver from '../card-head-loadin-driver';





export default function HeadGrid() {

  return (
    <Box sx={{ flexGrow: 1}}>
      <Grid container spacing={2}>
        
        <Grid item xs={3}>
            <Grid key={""} item>
              <CardHeadFreight />
            </Grid>
        </Grid>
        <Grid item xs={3}>
            <Grid key={""} item>
                <CardHeadDriver />
            </Grid>
        </Grid>
        <Grid item xs={3}>
            <Grid key={""} item>
                <CardHeadInDriver />
            </Grid>
        </Grid>
        <Grid item xs={3}>
            <Grid key={""} item>
                <CardHeadLoadinDriver />
            </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}