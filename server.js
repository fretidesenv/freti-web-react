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
    const response = await axios.post('https://api.openrouteservice.org/v2/directions/driving-car', req.body, {
      headers: {
        'Authorization': '5b3ce3597851110001cf6248ad1895d5da0941eea372853b74155e91', // Substitua pela sua chave de API
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response.status).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
