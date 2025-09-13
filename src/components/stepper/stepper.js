import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { Typography } from 'antd';

const steps = [
    'Pendente de contratação', 
    'Em Analise de perfil',
    'Em Analise do motorista',
    'Contratado', 
    'Em transito',
    'Entregue',
    'Finalizado',
];

export default function HorizontalStepper({status}) {
  const isStepFailed = (step) => {
    return step === 8;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={status}>
        {steps.map((label, index) => {

            const labelProps = {};

            if (isStepFailed(index)) {
                labelProps.optional = (
                <Typography variant="caption" color="error">
                    Frete cancelado
                </Typography>
                );

                labelProps.error = true;
            }

            return (
                <Step key={label}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
            );
            })
        }
      </Stepper>
    </Box>
  );
}