const express = require('express');
const axios = require('axios');
const app = express();
const port = 3001;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use(express.json());

app.post('/directions', async (req, res) => {
  try {
    // Valida se o body contém coordinates
    if (!req.body || !req.body.coordinates || !Array.isArray(req.body.coordinates)) {
      return res.status(400).json({ 
        message: "Error posting data",
        error: {
          message: "Invalid request: 'coordinates' array is required",
          code: "INVALID_REQUEST"
        }
      });
    }

    // Valida se há pelo menos 2 coordenadas
    if (req.body.coordinates.length < 2) {
      return res.status(400).json({ 
        message: "Error posting data",
        error: {
          message: "At least 2 coordinates are required",
          code: "INSUFFICIENT_COORDINATES"
        }
      });
    }

    // Valida formato das coordenadas
    const invalidCoords = req.body.coordinates.some(coord => 
      !Array.isArray(coord) || 
      coord.length !== 2 || 
      typeof coord[0] !== 'number' || 
      typeof coord[1] !== 'number' ||
      coord[0] < -180 || coord[0] > 180 || // longitude
      coord[1] < -90 || coord[1] > 90     // latitude
    );

    if (invalidCoords) {
      return res.status(400).json({ 
        message: "Error posting data",
        error: {
          message: "Invalid coordinate format. Expected array of [longitude, latitude] where longitude is between -180 and 180, and latitude is between -90 and 90",
          code: "INVALID_COORDINATES"
        }
      });
    }

    // Prepara o body da requisição com formato correto
    const requestBody = {
      coordinates: req.body.coordinates,
      format: 'json', // Formato de resposta
      geometry: true, // Incluir geometria na resposta
      instructions: false // Não incluir instruções (opcional, reduz tamanho da resposta)
    };

    const response = await axios.post('https://api.openrouteservice.org/v2/directions/driving-car', requestBody, {
      headers: {
        'Authorization': '5b3ce3597851110001cf6248ad1895d5da0941eea372853b74155e91',
        'Content-Type': 'application/json',
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error in directions endpoint:', error.response?.data || error.message);
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({ 
      message: "Error posting data",
      error: {
        message: error.response?.data?.error?.message || error.message,
        code: error.response?.data?.error?.code || "UNKNOWN_ERROR",
        details: error.response?.data || error.message
      }
    });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
