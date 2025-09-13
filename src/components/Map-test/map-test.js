import React, { useState, useEffect } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';

const MapWithDirections = () => {
    const [map, setMap] = useState(null);
    const [directions, setDirections] = useState(null);
    const [waypoints, setWaypoints] = useState([]);
  
    // Função para adicionar um ponto de parada
    const addWaypoint = (location) => {
      setWaypoints([...waypoints, { location }]);
    };
  
    // Função para remover um ponto de parada
    const removeWaypoint = (index) => {
      const newWaypoints = [...waypoints];
      newWaypoints.splice(index, 1);
      setWaypoints(newWaypoints);
    };
  
    // Função executada quando o mapa é carregado
    const handleMapLoad = (map) => {
      setMap(map);
    };
  
    // Função executada quando os waypoints são atualizados
    useEffect(() => {
      if (waypoints.length >= 2) {
        const directionsService = new window.google.maps.DirectionsService();
  
        directionsService.route(
          {
            origin: waypoints[0].location,
            destination: waypoints[waypoints.length - 1].location,
            waypoints: waypoints.slice(1, waypoints.length - 1).map((waypoint) => ({
              location: waypoint.location,
            })),
            travelMode: 'DRIVING',
          },
          (result, status) => {
            if (status === 'OK') {
              setDirections(result);
            }
          }
        );
      }
    }, [waypoints]);
  
    return (
      <GoogleMap
        onLoad={handleMapLoad}
        zoom={12}
        center={{ lat: -23.5505, lng: -46.6333 }} // Define o centro do mapa
      >
        {waypoints.map((waypoint, index) => (
          <button key={index} onClick={() => removeWaypoint(index)}>
            Remover Ponto de Parada {index + 1}
          </button>
        ))}
  
        <DirectionsRenderer directions={directions} />
  
        <button onClick={() => addWaypoint('Localização do Ponto de Parada')}>
          Adicionar Ponto de Parada
        </button>
      </GoogleMap>
    );
  };
  
  export default MapWithDirections;
  