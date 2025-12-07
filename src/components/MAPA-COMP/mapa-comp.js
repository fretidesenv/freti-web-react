import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import freightService from "../../service/freight.service";
import polyline from "@mapbox/polyline";
import axios from "axios";

const MapComponent = ({ points, idFreight, searchLatestPositions }) => {
  const [map, setMap] = useState(null);
  const [driverMarker, setDriverMarker] = useState(null);
  const [driverRoute, setDriverRoute] = useState([]);
  const [lastPositionReceived, setLastPositionReceived] = useState(null);


  useEffect(() => {
    // Inicializa o mapa
    const mapInstance = L.map("map").setView([-23.986178, -46.308402], 13);
    setMap(mapInstance);

    // Adiciona camada de tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);

    points.forEach((point) => {
      let iconUrl;
    
      if (point.operation && point.operation.includes("carga")) {
        // Se incluir "carga", verifica o status de "conclude"
        iconUrl = point.concluded
          ? `${process.env.PUBLIC_URL}/coleta-realizada.png`
          : `${process.env.PUBLIC_URL}/coleta-pendente.png`;
      } else if (point.operation && point.operation.includes("descarga")) {
        // Se incluir "descarga", verifica o status de "conclude"
        iconUrl = point.concluded
          ? `${process.env.PUBLIC_URL}/entrega-realizada.png`
          : `${process.env.PUBLIC_URL}/entrega-pendente.png`;
      } else {
        console.error("Ponto inválido ou sem operação definida:", point);
        return; // Pula este ponto se não houver operação válida
      }
    
      const icon = L.icon({
        iconUrl: iconUrl,
        iconSize: [50, 50],
        iconAnchor: [20, 42],
        popupAnchor: [-3, -32],
      });
    
      // Adiciona o marcador ao mapa
      L.marker(point.coords, { icon })
        .addTo(mapInstance)
        .bindPopup(point.popupText || "Sem descrição")
        .openPopup();
    });
    
    
    

    const fetchRoute = async () => {
      // Endpoint da API de direções (pode ser configurado via variável de ambiente)
      const directionsEndpoint = process.env.REACT_APP_DIRECTIONS_API_URL || 
        "https://8t7wcp4ip0.execute-api.us-east-1.amazonaws.com/dev/directions";
      
      // Declara validCoordinates fora do try para estar acessível no catch
      let validCoordinates = [];
      
      try {
        // Mapear os pontos de coordenadas
        const coordinates = points.map((point) => point?.coords);
        console.log("Pontos enviados para a API de rotas:", coordinates); // Verificando se as coordenadas estão corretas
        // Busca a posição inicial do motorista
        const stoppings_ = await freightService.searchFirstWay(idFreight);
        const startPosition = stoppings_.docs.map((stopping) => ({
          latitude: stopping?.data()?.latitude || 0,
          longitude: stopping?.data()?.longitude || 0,
        }));

        console.log("Posição inicial do motorista:", startPosition);
        if (
          startPosition.length === 0 ||
          !startPosition[0].latitude ||
          !startPosition[0].longitude
        ) {
          console.error("Erro: Posição inicial inválida do motorista");
          return; // Evitar tentar buscar rotas com dados inválidos
        }

        debugger;
        
        // Valida e formata todas as coordenadas
        // Leaflet usa [latitude, longitude], mas OpenRouteService espera [longitude, latitude]
        validCoordinates = [];
        
        // Adiciona a posição inicial se válida
        if (startPosition[0]?.longitude && startPosition[0]?.latitude) {
          const lng = parseFloat(startPosition[0].longitude);
          const lat = parseFloat(startPosition[0].latitude);
          if (!isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
            validCoordinates.push([lng, lat]);
          }
        }

        // Adiciona os pontos de parada
        // point.coords está no formato [latitude, longitude] (formato Leaflet)
        // Precisamos converter para [longitude, latitude] para OpenRouteService
        coordinates.forEach((coord, index) => {
          if (Array.isArray(coord) && coord.length >= 2) {
            // point.coords vem como [latitude, longitude] do Leaflet
            const lat = parseFloat(coord[0]);
            const lng = parseFloat(coord[1]);
            
            console.log(`Coordenada ${index} original [lat, lng]:`, [lat, lng]);
            
            // Valida se são números válidos e dentro dos ranges corretos
            if (!isNaN(lat) && !isNaN(lng) && 
                lat >= -90 && lat <= 90 && 
                lng >= -180 && lng <= 180) {
              // Converte para [lng, lat] para OpenRouteService
              const formattedCoord = [lng, lat];
              validCoordinates.push(formattedCoord);
              console.log(`Coordenada ${index} formatada [lng, lat]:`, formattedCoord);
            } else {
              console.warn("Coordenada inválida ignorada:", coord, {
                lat: lat,
                lng: lng,
                latValid: lat >= -90 && lat <= 90,
                lngValid: lng >= -180 && lng <= 180
              });
            }
          } else {
            console.warn("Coordenada não é um array válido:", coord);
          }
        });

        // Verifica se há pelo menos 2 coordenadas válidas
        if (validCoordinates.length < 2) {
          console.error("Erro: É necessário pelo menos 2 coordenadas válidas para calcular a rota");
          return;
        }

        console.log("Total de coordenadas válidas:", validCoordinates.length);
        console.log("Coordenadas formatadas para envio:", JSON.stringify(validCoordinates, null, 2));

        // Prepara o payload para envio
        // OpenRouteService espera coordenadas no formato [longitude, latitude]
        const requestPayload = {
          coordinates: validCoordinates,
          // Parâmetros opcionais que podem ajudar
          format: 'json',
          geometry: true
        };
        
        console.log("Payload completo que será enviado:", JSON.stringify(requestPayload, null, 2));
        console.log("Endpoint:", directionsEndpoint);
        console.log("Número de coordenadas:", validCoordinates.length);
        console.log("Primeira coordenada [lng, lat]:", validCoordinates[0]);
        console.log("Última coordenada [lng, lat]:", validCoordinates[validCoordinates.length - 1]);
        console.log("=== INICIANDO REQUISIÇÃO PARA API ===");

        // Enviando os dados para a API de rotas
        // IMPORTANTE: Esta é a ÚNICA requisição POST que fazemos para este endpoint
        const response = await axios.post(
          directionsEndpoint,
          requestPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 30000, // 30 segundos de timeout
            // Evita que o axios faça requisições OPTIONS automáticas desnecessárias
            withCredentials: false
          }
        );
        
        console.log("=== REQUISIÇÃO CONCLUÍDA COM SUCESSO ===");

        debugger;
        console.log("Resposta da API de rotas:", response.data);

        if (response.data.routes && response.data.routes.length > 0) {
          const route = polyline.decode(response.data.routes[0].geometry);

          console.log("Decodificação da rota:", route);

          const polylineLayer = L.polyline(route, { color: "blue" }).addTo(
            mapInstance
          );
          mapInstance.fitBounds(polylineLayer.getBounds());

          const driverIcon = L.icon({
            iconUrl: "/icon/icone-black-truck.png",
            iconSize: [62, 62],
            iconAnchor: [26, 52],
            popupAnchor: [0, -32],
          });

          const initialDriverPosition = [route[0][0], route[0][1]];
          const driverMarkerInstance = L.marker(initialDriverPosition, {
            icon: driverIcon,
          }).addTo(mapInstance);

          setDriverMarker(driverMarkerInstance);
          setDriverRoute([initialDriverPosition]);
        } else {
          console.error("Erro: Nenhuma rota foi retornada pela API.");
        }
      } catch (error) {
        console.error("=== ERRO AO BUSCAR ROTA ===");
        console.error("Status HTTP:", error.response?.status);
        console.error("Status Text:", error.response?.statusText);
        console.error("Dados do erro completo:", error.response?.data);
        console.error("Request enviado:", {
          url: directionsEndpoint,
          coordinates: validCoordinates,
          coordinatesCount: validCoordinates.length,
          payload: JSON.stringify({
            coordinates: validCoordinates,
            format: 'json',
            geometry: true
          }, null, 2)
        });
        console.error("Mensagem do erro:", error.message);
        console.error("Stack trace:", error.stack);
        
        // Mostra erro mais detalhado no console
        if (error.response?.data?.error) {
          console.error("Detalhes do erro da API:", error.response.data.error);
          if (error.response.data.error.message) {
            console.error("Mensagem de erro da API:", error.response.data.error.message);
          }
          if (error.response.data.error.code) {
            console.error("Código de erro:", error.response.data.error.code);
          }
        }
        
        // Se for erro 400, pode ser problema de formato ou distância
        if (error.response?.status === 400) {
          console.warn("⚠️ Erro 400 - Possíveis causas:");
          console.warn("1. Coordenadas muito distantes (limite da API)");
          console.warn("2. Formato de coordenadas incorreto");
          console.warn("3. Parâmetros faltando ou inválidos");
          console.warn("4. Limite de waypoints excedido");
        }
        
        console.error("=== FIM DO ERRO ===");
      }
    };

    fetchRoute();
  }, [points, idFreight]);



  useEffect(() => {
    if (map && driverMarker) {
      const updateDriverPosition = async () => {
        const latestPositions = await searchLatestPositions(
          lastPositionReceived
        );
        let newPositions = [];
        let timestamps = [];

        if (latestPositions) {
          latestPositions?.forEach((position) => {
            const latitude = position?.latitude;
            const longitude = position?.longitude;
            const timestamp = position?.timestamp;

            if (latitude !== undefined && longitude !== undefined) {
              newPositions.push([latitude, longitude]);
              timestamps.push(parseInt(timestamp) || null);
            } else {
              console.log(`latitude ou longitude inválida: ,
                latitude = ${position?.latitude},
                longitude = ${position?.longitude},
                timestamp = ${position?.timestamp},
                `);
            }
          });

          if (
            latestPositions?.[latestPositions?.length - 1]?.id !=
              lastPositionReceived &&
            latestPositions?.[latestPositions?.length - 1]?.id
          ) {
            console.log(
              "era: ",
              lastPositionReceived,
              " e trocou para: ",
              latestPositions?.[latestPositions?.length - 1]?.id
            );
            setLastPositionReceived(
              latestPositions?.[latestPositions?.length - 1]?.id
            );
          }
        } else {
          console.log("latestPositions é inválido: ", latestPositions);
        }

        const stoppings = await freightService.searchCurrentWay(idFreight);
        const newPosition = [
          stoppings.docs[0]?.data()?.latitude || 0,
          stoppings.docs[0]?.data()?.longitude || 0,
        ];

        if (newPosition[0] !== 0 && newPosition[1] !== 0) {
          driverMarker.setLatLng(newPosition);
          console.log("New position é válida");
        } else {
          console.log("New position inválida");
        }

        console.log("newPositions: ", newPositions);
        setDriverRoute((prevRoute) => {
          const updatedRoute = [...newPositions];

          map.eachLayer((layer) => {
            if (layer instanceof L.Polyline && layer.options.color === "red") {
              map.removeLayer(layer);
            }
          });

          updatedRoute.forEach((position, idx) => {
            const date = new Date(timestamps[idx]);
            const dateString = isNaN(date.getTime())
              ? "Data inválida"
              : date.toLocaleString();

            L.circleMarker(position, {
              radius: 4,
              color: "rgb(255,49,0)",
              fillColor: "rgb(255,49,0)",
              fillOpacity: 1,
            })
              .addTo(map)
              .bindPopup(dateString);
          });

          L.polyline(updatedRoute, { color: "rgb(1,36,67)" }).addTo(map);
          return updatedRoute;
        });
      };

      const interval = setInterval(updateDriverPosition, 10000);
      return () => clearInterval(interval);
    }
  }, [
    map,
    driverMarker,
    lastPositionReceived,
    idFreight,
    searchLatestPositions,
  ]);

  return <div id="map" style={{ height: "500px", width: "100%" }} />;
};

export default MapComponent;
