import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Avatar, Stack } from '@mui/material';
import RatingSize from '../rating/ratingProfile';

export default function ProfileCard({imgProfile, nameDriver}) {
  return (
    <Card sx={{ maxWidth: 200 }}>
      <CardContent>
            <Stack direction="row" spacing={2} style={{paddingLeft: 30}}>
                <Avatar alt="Profile" 
                sx={{ width: 100, height: 100}}
                src={imgProfile}/>
            </Stack>
            <Typography gutterBottom variant="h6" component="div">
            </Typography>
            <Typography gutterBottom variant="h5" component="div">
                <RatingSize />
            </Typography>
      </CardContent>
    </Card>
  );
}