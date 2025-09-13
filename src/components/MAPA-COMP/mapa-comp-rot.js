
import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import freightService from '../../service/freight.service';
import polyline from '@mapbox/polyline';
import axios from 'axios';

const MapComponentRoteiriza = ({ points, idFreight }) => {
  const [map, setMap] = useState(null);
  const [driverMarker, setDriverMarker] = useState(null);
  const [driverRoute, setDriverRoute] = useState([]);
  const [routePolyline, setRoutePolyline] = useState(null);

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

    points.forEach(point => {
        L.marker(point.coords, { icon }).addTo(mapInstance)
          .bindPopup(point.popupText)
          .openPopup();
      });

    const fetchRoute = async () => {
        try {
            const coordinates = points.map(point => point.coords);
            const response = await axios.post(' ', {
            coordinates: coordinates.map(coord => [coord[1], coord[0]]) // Invertendo a ordem para lat/lng -> lng/lat
            });

            if (response.data.routes && response.data.routes.length > 0) {
                const route = polyline.decode(response.data.routes[0].geometry);
                const polylineLayer = L.polyline(route, { color: 'blue' }).addTo(mapInstance);
                mapInstance.fitBounds(polylineLayer.getBounds());

                const driverIcon = L.icon({
                  iconUrl: '/icon/truck-delivery-black.png',
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                  popupAnchor: [0, -32]
                });

                const initialDriverPosition = [route[0][0], route[0][1]];
                const driverMarkerInstance = L.marker(initialDriverPosition, { icon: driverIcon }).addTo(mapInstance);
                setDriverMarker(driverMarkerInstance);
                setDriverRoute(route);
            } else {
                console.error('No routes found in response:', response.data);
            }
          } catch (error) {
            console.error('Error fetching route:', error);
          }
    };

    fetchRoute();

  }, [points]);

  const searchCurrentWay = async (idFreight) => {
    // Simular dados de resposta
    return {
        docs: [
            {
                data: () => ({
                    latitude: -8.071126,//-8.0700774,
                    longitude: -34.8800061//-34.9297755
                })
            },
            {
                data: () => ({
                    latitude: -8.071126,
                    longitude: -34.8800061
                })
            }
        ]
    };
};


  useEffect(() => {
    if (map && driverMarker) {
     // Inicialize o mapa
    // const map = L.map('map').setView([0, 0], 13);
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    let driverRoute = [];
    const accessToken = 'pk.eyJ1IjoiZm9ydGlvIiwiYSI6ImNtMGxkMjlvYjA0M3cybG9oZGd4bnFpM3oifQ.cW0fvgggOfFHujtNoJ2g9g'; // Substitua pelo seu token Mapbox

    const updateDriverPosition = async () => {
        // const stoppings = await freightService.searchCurrentWay(idFreight);
         const stoppings = await searchCurrentWay(idFreight);
        
        
        const positions = stoppings.docs.map(stopping => ({
            lat: stopping.data().latitude,
            lng: stopping.data().longitude
        }));

        console.log("Posição atualizada")
        console.log(positions.length)
        
        if (positions.length < 1) return; // Precisa de pelo menos dois pontos para traçar uma rota

        const start = positions[0];
        const end = positions[positions.length - 1];

        const routeResponse = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?steps=true&geometries=geojson&access_token=${accessToken}`);
        const routeData = await routeResponse.json();
        const route  = routeData.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);

        // Atualiza a posição do marcador do motorista
        driverMarker.setLatLng([end.lat, end.lng]);

        // Atualiza a rota do motorista
        driverRoute = [...driverRoute, ...route];
        L.polyline(driverRoute, { color: 'red' }).addTo(map);
    };

    const interval = setInterval(updateDriverPosition, 2000);

      return () => clearInterval(interval);
    }
  }, [map, driverMarker, idFreight]);

  return (
    <div id="map" style={{ height: '500px', width: '100%' }}></div>
  );
};

export default MapComponentRoteiriza;
