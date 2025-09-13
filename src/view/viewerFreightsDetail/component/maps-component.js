import React, { useState, useEffect } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";
import freightService from "../../../service/freight.service";

export default function ViewerMaps({ currentFreightId }) {

  const [positionsList, setPositionsList] = useState(null);
  const [isInProgress, setIsInProgress] = useState(false);
  const [stoppingPointsList, setStoppingPointsList] = useState([]);
  const [coordinateGroups, setCoordinateGroups] = useState(null);
  const [renderDirections, setRenderDirections] = useState(null);
  const [directions, setDirections] = useState([]);

  const truckk = `${process.env.PUBLIC_URL}/assets/brand/truckk.png`;
  
  const getCurrentLocationDriverInProgress = async (idFreight) => { 

    try {
      const freight = await freightService.getFreightById(idFreight);

      const freightObj = freight.data();

      if (freightObj.status.describe === "Em transito") {
        setIsInProgress(true);

      }
    } catch (error) {
      console.log(error);
    }
  };

  //Possição atual por onde o frete está passando na rua
  const getPositionsByFreight = async (idFreight) => {
    try {
      const positions = await freightService.getPositionsByFreight(idFreight);

      const positionsObj = positions.docs.map((position) => position.data());

      const positionsFilteredByDuplication = Array.from(
        new Map(
          positionsObj.map((position) => [position.timestamp, position])
        ).values()
      );

      let filteredPositions = positionsFilteredByDuplication.sort(
        (a, b) => a.timestamp - b.timestamp
      );

      setPositionsList(filteredPositions);
    } catch (error) {
      console.log(error);
    }
  };

  const getStoppingPointsByFreight = async (idFreight) => {
    try {
      const stoppings = await freightService.getStoppingPointsByFreight(
        idFreight
      );

      stoppings.docs.forEach((stopping) => {

        const stoppingObj = stopping.data();

        setStoppingPointsList((prev) => [
          ...prev,
          { lat: stoppingObj.latitude, lng: stoppingObj.longitude },
        ]);

      });

    } catch (error) {
      console.log(error);
    }
  };

  const getDirectionsFromPositions = () => {
    const directionsService = new window.google.maps.DirectionsService();
    const coordinateGroups = [];
    const batchSize = 27;

    for (let i = 0; i < positionsList.length; i += batchSize) {
      const coordinateGroup = positionsList.slice(i, i + 27);
      coordinateGroups.push(coordinateGroup);
    }
    setCoordinateGroups(0);
    setCoordinateGroups(coordinateGroups.length);

    coordinateGroups.forEach((coordinateGroup) => {
      const directionsOptions = {
        origin: {
          lat: coordinateGroup[0].latitude,
          lng: coordinateGroup[0].longitude,
        },
        destination: {
          lat: coordinateGroup[coordinateGroup.length - 1].latitude,
          lng: coordinateGroup[coordinateGroup.length - 1].longitude,
        },
        waypoints: coordinateGroup
          .slice(1, coordinateGroup.length - 1)
          .map((coord) => ({
            location: { lat: coord.latitude, lng: coord.longitude },
          })),
        travelMode: "DRIVING",
      };

      directionsService.route(directionsOptions, (result, status) => {
        if (status === "OK") {
          setDirections((prev) => [...prev, result]);
        }
      });
    });
  };

  //Direcionamento
  //
  const fetchData = async () => {
    setDirections([]);
    setRenderDirections(false);
    setPositionsList(null);
    setStoppingPointsList([]);
    setCoordinateGroups(null);

    //Coordenadas do frete, por onde ele passou 
    getStoppingPointsByFreight(currentFreightId);
    //Posição atualizada ordenada por data e hora por onde o frete está passando
    getPositionsByFreight(currentFreightId);
    //Seta na variavel apenas se o frete está com o status Em Transito
    getCurrentLocationDriverInProgress(currentFreightId);
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCHbtEVjuuXlpcj9yoKbWToka_uQj333XI",
  });

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 120000);

    // Limpe o intervalo quando o componente for desmontado
    return () => {
      clearInterval(interval);
    };
  }, [currentFreightId]);

  useEffect(() => {
    if (directions.length === coordinateGroups) {
      setRenderDirections(true);
    }
  }, [directions]);

  useEffect(() => {
    if (positionsList && isLoaded) {
      getDirectionsFromPositions();
    }
    console.log(positionsList);
  }, [positionsList, isLoaded]);
  
  return renderDirections && isLoaded ? (
    <>
      <GoogleMap
        center={stoppingPointsList[0]}
        zoom={17}
        mapContainerStyle={{ width: "100%", height: "30rem" }}
      >
        {directions.map((direction, i) => (
          <DirectionsRenderer
            key={i}
            options={{
              directions: direction,
              suppressMarkers: true,
            }}
          />
        ))}

        {stoppingPointsList.map((cood, i) => (
          <Marker key={i} position={cood} />
        ))}

        {isInProgress && positionsList && (
          <Marker
            position={{
              lat: positionsList[positionsList.length - 1].latitude,
              lng: positionsList[positionsList.length - 1].longitude,
            }}
            icon={{
              url: truckk,
              scaledSize: new window.google.maps.Size(50, 50),
            }}
          />
        )}
      </GoogleMap>
    </>
  ) : (
    <>
      <GoogleMap
        center={stoppingPointsList[0]}
        zoom={17}
        mapContainerStyle={{ width: "100%", height: "30rem" }}
      >

        {directions.map((direction, i) => (
          <DirectionsRenderer
            key={i}
            options={{
              directions: direction,
              suppressMarkers: true,
            }}
            icon={{
              url: `../src/assets/images/truckk.png`,
              scaledSize: new window.google.maps.Size(50, 50),
            }}
          />
        ))}

        {stoppingPointsList.map((cood, i) => (
          <Marker key={i} position={cood} />
        ))}

        {positionsList && (
          <Marker
            position={{
              lat: positionsList[positionsList.length - 1].latitude,
              lng: positionsList[positionsList.length - 1].longitude,
            }}
            icon={{
              url: `../src/assets/images/truckk.png`,
              scaledSize: new window.google.maps.Size(50, 50),
            }}
          />
        )}

      </GoogleMap>
    </>
  );
}
