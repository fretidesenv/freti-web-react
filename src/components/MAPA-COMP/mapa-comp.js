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

        // Enviando os dados para a API de rotas
        const response = await axios.post(
          "https://8t7wcp4ip0.execute-api.us-east-1.amazonaws.com/dev/directions",
          {
            coordinates:
              startPosition[0].longitude && startPosition[0].latitude
                ? [
                    [startPosition[0].longitude, startPosition[0].latitude],
                    ...coordinates.map((coord) => [coord[1], coord[0]]), // Corrigindo a ordem para longitude, latitude
                  ]
                : [...coordinates.map((coord) => [coord[1], coord[0]])],
          }
        );

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
        console.error(
          "Erro ao buscar rota:",
          error.response ? error.response.data : error.message
        );
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
