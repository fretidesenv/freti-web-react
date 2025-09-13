import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import polyline from '@mapbox/polyline';

const MapRoteComponent = () => {
  const [map, setMap] = useState(null);
  const [driverMarker, setDriverMarker] = useState(null);
  const [driverRoute, setDriverRoute] = useState([]);
//   const [apiKey] = useState('5b3ce3597851110001cf6248ad1895d5da0941eea372853b74155e91'); // Substitua pela sua chave de API

  useEffect(() => {
    // Inicializa o mapa Leaflet
    const mapInstance = L.map('map').setView([-23.986178, -46.308402], 13);
    setMap(mapInstance);

    // Adiciona a camada de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    // Configura o ícone do marcador
    const icon = L.icon({
        iconUrl: `${process.env.PUBLIC_URL}/marker-driver.png`,
        iconSize: [32, 32],
        iconAnchor: [20, 42],
        popupAnchor: [-3, -32]
      });

    // Define os pontos e adiciona marcadores ao mapa
       const points = [
      {
        coords: [-23.508596, -46.841628],
        popupText: "<strong>Estátua do Pescador</strong>"
      },
      {
        coords: [-23.553309, -46.627801],
        popupText: "<strong>Segundo Ponto</strong>" 
      },
      {
        coords: [-23.553322, -46.601216],
        popupText: "<strong>Terceiro Ponto</strong>"
      },
      {
        coords: [-23.563248, -46.542555],
        popupText: "<strong>Quarto Ponto</strong>"
      }
      ,
      {
        coords: [-23.582342, -46.563542],
        popupText: "<strong>Quinto Ponto</strong>"
      }
      ,
      {
        coords: [-23.604505, -46.603767],
        popupText: "<strong>Sexto Ponto</strong>"
      }
      ,
      {
        coords: [-23.617710, -46.609707],
        popupText: "<strong>Setimo Ponto</strong>"
      }
      
    ];

    // Adiciona os marcadores ao mapa
    points.forEach(point => {
      L.marker(point.coords, { icon }).addTo(mapInstance)
        .bindPopup(point.popupText)
        .openPopup();
    });

    // Obter a rota do OpenRouteService
    const fetchRoute = async () => {
        try {
            const coordinates = points.map(point => point.coords);
            console.log('Requesting route with coordinates:', coordinates);

            const response = await axios.post('http://localhost:3001/directions', {
            coordinates: coordinates.map(coord => [coord[1], coord[0]]) // Invertendo a ordem para lat/lng -> lng/lat
            });

            console.log('Route response:', response.data);
            console.log('Route response:', response.data.metadata.query);

            // const route = response.data.metadata.query.coordinates.map(coord => [coord[1], coord[0]]);
            // Verificar se a resposta contém a rota esperada
            if (response.data.routes && response.data.routes.length > 0) {
                // Decodificando a geometria
                const route = polyline.decode(response.data.routes[0].geometry);
                console.log('Decoded route coordinates:', route);
    
                // Adicionando a polyline ao mapa
                const polylineLayer = L.polyline(route, { color: 'blue' }).addTo(mapInstance);
                mapInstance.fitBounds(polylineLayer.getBounds());
            } else {
                console.error('No routes found in response:', response.data);
            }
          } catch (error) {
            console.error('Error fetching route:', error);
          }
    };

    fetchRoute();

    // Configura o ícone personalizado para o motorista
    const driverIcon = L.icon({
        iconUrl: '/icon/truck-delivery-black.png',  // Caminho relativo à pasta public
        iconSize: [32, 32],
        iconAnchor: [16, 32],  // Ajuste a âncora do ícone conforme necessário
        popupAnchor: [0, -32]
      });

    // Adiciona o marcador do motorista com o ícone personalizado
    const initialDriverPosition = [-23.508596, -46.841628];
    const driverMarkerInstance = L.marker(initialDriverPosition, { icon: driverIcon }).addTo(mapInstance);
    setDriverMarker(driverMarkerInstance);

    // Define a rota inicial do motorista
    setDriverRoute([initialDriverPosition]);

  }, []);

  useEffect(() => {
    if (map && driverMarker) {
      // Simula a atualização da posição do motorista
      const updateDriverPosition = () => {
        const newPosition = [
          driverMarker.getLatLng().lat = -23.508596,
          driverMarker.getLatLng().lng = -46.841628
        ];

        // Atualiza a posição do marcador do motorista
        driverMarker.setLatLng(newPosition);

        // Adiciona a nova posição à rota do motorista
        setDriverRoute(prevRoute => {
          const updatedRoute = [...prevRoute, newPosition];
          L.polyline(updatedRoute, { color: 'red' }).addTo(map); // Atualiza a polyline no mapa
          return updatedRoute;
        });
      };

      const interval = setInterval(updateDriverPosition, 2000);

      return () => clearInterval(interval);
    }
  }, [map, driverMarker]);

  return (
    <div id="map" style={{ height: '500px', width: '100%' }}></div>
  );
};

export default MapRoteComponent;


// import React, { useEffect, useState } from 'react';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import axios from 'axios';
// import polyline from '@mapbox/polyline';

// const MapRoteComponent = () => {
//   const [map, setMap] = useState(null);
//   const [driverMarker, setDriverMarker] = useState(null);
//   const [driverRoute, setDriverRoute] = useState([]);

//   useEffect(() => {
//     // Inicializa o mapa Leaflet
//     const mapInstance = L.map('map').setView([-23.986178, -46.308402], 13);
//     setMap(mapInstance);

//     // Adiciona a camada de tiles
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     }).addTo(mapInstance);

//     // Configura o ícone do marcador
//     const icon = L.icon({
//       iconUrl: 'iconfinder_Marker_1891030.png',
//       iconSize: [32, 32],
//       iconAnchor: [20, 42],
//       popupAnchor: [-3, -32]
//     }); 

//     // Define os pontos e adiciona marcadores ao mapa
//     const points = [
//         {
//             coords: [-23.508596, -46.841628],
//             popupText: "<strong>Estátua do Pescador</strong>"
//         },
//         {
//             coords: [-23.553309, -46.627801],
//             popupText: "<strong>Segundo Ponto</strong>" 
//         },
//         {
//             coords: [-23.553322, -46.601216],
//             popupText: "<strong>Terceiro Ponto</strong>"
//         },
//         {
//             coords: [-23.563248, -46.542555],
//             popupText: "<strong>Quarto Ponto</strong>"
//         }
//         ,
//         {
//             coords: [-23.582342, -46.563542],
//             popupText: "<strong>Quinto Ponto</strong>"
//         }
//         ,
//         {
//             coords: [-23.604505, -46.603767],
//             popupText: "<strong>Sexto Ponto</strong>"
//         }
//         ,
//         {
//             coords: [-23.617710, -46.609707],
//             popupText: "<strong>Setimo Ponto</strong>"
//         }
        
//     ];

//     // Adiciona os marcadores ao mapa
//     points.forEach(point => {
//       L.marker(point.coords, { icon }).addTo(mapInstance)
//         .bindPopup(point.popupText)
//         .openPopup();
//     });

//     // Obter a rota do OpenRouteService
//     const fetchRoute = async () => {
//       try {
//         const coordinates = points.map(point => point.coords);
//         console.log('Requesting route with coordinates:', coordinates);

//         const response = await axios.post('http://localhost:3001/directions', {
//           coordinates: coordinates.map(coord => [coord[1], coord[0]]) // Invertendo a ordem para lat/lng -> lng/lat
//         });

//         console.log('Route response:', response.data);

//         // Verificar se a resposta contém a rota esperada
//         if (response.data.routes && response.data.routes.length > 0) {
//           // Decodificando a geometria
//           const route = polyline.decode(response.data.routes[0].geometry);
//           console.log('Decoded route coordinates:', route);

//           // Adicionando a polyline ao mapa
//           const polylineLayer = L.polyline(route, { color: 'blue' }).addTo(mapInstance);
//           mapInstance.fitBounds(polylineLayer.getBounds());
//         } else {
//           console.error('No routes found in response:', response.data);
//         }
//       } catch (error) {
//         console.error('Error fetching route:', error);
//       }
//     };

//     fetchRoute();

//     // Configura o ícone personalizado para o motorista
//     const driverIcon = L.icon({
//       iconUrl: `${process.env.PUBLIC_URL}/icon/8665864_truck_fast_icon.png`,  // Caminho relativo à pasta public
//       iconSize: [32, 32],
//       iconAnchor: [16, 32],  // Ajuste a âncora do ícone conforme necessário
//       popupAnchor: [0, -32]
//     });

//     // Adiciona o marcador do motorista com o ícone personalizado
//     const initialDriverPosition = [-23.508596, -46.841628];
//     const driverMarkerInstance = L.marker(initialDriverPosition, { icon: driverIcon }).addTo(mapInstance);
//     setDriverMarker(driverMarkerInstance);

//     // Define a rota inicial do motorista
//     setDriverRoute([initialDriverPosition]);

//   }, []);

//   useEffect(() => {
//     if (map && driverMarker) {
//       // Simula a atualização da posição do motorista
//       const updateDriverPosition = () => {
//         const newPosition = [
//           driverMarker.getLatLng().lat = -23.508596,
//           driverMarker.getLatLng().lng = -46.841628
//         ];

//         // Atualiza a posição do marcador do motorista
//         driverMarker.setLatLng(newPosition);

//         // Adiciona a nova posição à rota do motorista
//         setDriverRoute(prevRoute => {
//           const updatedRoute = [...prevRoute, newPosition];
//           L.polyline(updatedRoute, { color: 'red' }).addTo(map); // Atualiza a polyline no mapa
//           return updatedRoute;
//         });
//       };

//       const interval = setInterval(updateDriverPosition, 2000);

//       return () => clearInterval(interval);
//     }
//   }, [map, driverMarker]);

//   return (
//     <div id="map" style={{ height: '500px', width: '100%' }}></div>
//   );
// };

// export default MapRoteComponent;







