import React from 'react'
import HeadGrid from '../HeadBoard'
import Container from '@mui/material/Container';
import BodyGrid from '../BodyGrid';
import { Grid } from '@mui/material';

const Dashboard = () => { 

  return (
    <>

    <Container maxWidth="lx">
        <Grid container spacing={2}>
            <Grid key={""} item xs={12}>
                <HeadGrid />
            </Grid>
            <Grid key={""} item xs={12}>
                <BodyGrid />
            </Grid>
        </Grid>
    </Container>
    
    </>
  )
}

export default Dashboard