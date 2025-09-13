import React, { useEffect, useState } from "react";
import "./style.css";
import { useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import MapComponent from "../../components/MAPA-COMP/mapa-comp";
import firebase from "../../config/firebase";
import freightService from "../../service/freight.service";
import StepPoints from "../../components/step-folow-driver/comp-step-driver";
import CardFolowFreigth from "../../components/card-info-folow-freight/card-freigth-folow";
import NewMiniDrawer from "../../components/navMenu/menu-nav";
import paymentService from "../../service/payment.service";
import driverService from "../../service/driver.service";

require("firebase/auth");

export default function ViewerFreights() {
  const db = firebase.firestore();
  const { id } = useParams();

  const [points, setPoints] = useState([]);
  const [positions, setPositions] = useState([]);
  const [freightData, setFreightData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stoppingPointsUrl, setStoppingPointsUrl] = useState("");
  const [positionsUrl, setPositionsUrl] = useState("");
  const [nameDriver, setNameDriver] = useState("");

  // Função para calcular a distância entre duas coordenadas (Haversine Formula)
  const calculateDistance = (coord1, coord2) => {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const R = 6371; // Raio da Terra em km

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distância em km

    return distance;
  };

  // Função para gerar o link de coordenadas filtradas e unificadas
  const generateGoogleMapsLink_ = (positions) => {
    // 23 a 25
    const baseUrl = "https://www.google.com/maps/dir/";

    // Função para agrupar coordenadas muito próximas e com timestamps próximos
    const filteredPositions = positions.reduce((acc, current, index, arr) => {
      if (index === 0) {
        acc.push(current); // Adiciona o primeiro ponto
        return acc;
      }

      const prevPosition = acc[acc.length - 1]; // Último ponto no array de acumulados
      const distance = calculateDistance(current.coords, prevPosition.coords);
      const timeDifference = Math.abs(
        current.timestamp - prevPosition.timestamp
      );

      // Se a distância for maior que 0.1 km ou a diferença de tempo for maior que 5 minutos, adiciona como um novo ponto
      if (distance > 0.1 || timeDifference > 5 * 60 * 1000) {
        acc.push(current);
      } else {
        // Se for muito próximo, substitui o ponto anterior com a média dos pontos agrupados
        const avgLat = (prevPosition.coords[0] + current.coords[0]) / 2;
        const avgLon = (prevPosition.coords[1] + current.coords[1]) / 2;
        prevPosition.coords = [avgLat, avgLon];
        prevPosition.timestamp = Math.max(
          prevPosition.timestamp,
          current.timestamp
        ); // Mantenha o timestamp mais recente
      }

      return acc;
    }, []);

    // Transformar as coordenadas filtradas em string para o Google Maps
    const coordsString = filteredPositions
      .map((position) => position.coords.join(","))
      .join("/");

    return `${baseUrl}${coordsString}`;
  };


  const generateGoogleMapsLink = (positions) => {
    const baseUrl = "https://www.google.com/maps/dir/";
    const maxPoints = 25;
  
    if (!Array.isArray(positions) || positions.length === 0) {
      return baseUrl;
    }
  
    const limit = Math.min(positions.length, maxPoints);
  
    let selectedPositions;
  
    if (positions.length <= maxPoints) {
      selectedPositions = positions;
    } else {
      const step = Math.floor(positions.length / (limit - 1));
      selectedPositions = [positions[0]];
  
      for (let i = step; i < positions.length - 1; i += step) {
        selectedPositions.push(positions[i]);
      }
  
      selectedPositions.push(positions[positions.length - 1]);
    }
  
    const coordsString = selectedPositions
      .map((position) => {
        if (
          Array.isArray(position.coords) &&
          position.coords.length === 2 &&
          typeof position.coords[0] === "number" &&
          typeof position.coords[1] === "number"
        ) {
          return position.coords.join(",");
        }
        return null;
      })
      .filter(Boolean)
      .join("/");
  
    return `${baseUrl}${coordsString}`;
  };
  


  // const generateGoogleMapsLink = (positions) => {
  //   const baseUrl = "https://www.google.com/maps/dir/";

  //   // Limite de pontos para o Google Maps (25 é o máximo permitido)
  //   const maxPoints = 25;

  //   if (positions.length <= maxPoints) {
  //     // Se o número de posições for menor ou igual ao limite, basta usar todas as posições
  //     const coordsString = positions
  //       .map((position) => position.coords.join(","))
  //       .join("/");
  //     return `${baseUrl}${coordsString}`;
  //   }

  //   // Selecionar os primeiros, últimos e pontos intermediários proporcionalmente
  //   const step = Math.floor(positions.length / (maxPoints - 1)); // -1 para incluir o último ponto
  //   const selectedPositions = [];

  //   // Adiciona o primeiro ponto
  //   selectedPositions.push(positions[0]);

  //   // Adiciona pontos intermediários proporcionalmente
  //   for (let i = step; i < positions.length - 1; i += step) {
  //     selectedPositions.push(positions[i]);
  //   }

  //   // Adiciona o último ponto
  //   selectedPositions.push(positions[positions.length - 1]);

  //   // Gerar a string para o Google Maps com os pontos selecionados
  //   const coordsString = selectedPositions
  //     .map((position) => position.coords.join(","))
  //     .join("/");

  //   return `${baseUrl}${coordsString}`;
  // };

  const fetchFreightData = async () => {
    try {
      // const freightDocRef = db.collection("freight").doc(id);
      // const freightDoc = await freightDocRef.get();
      const freightDoc = await freightService?.getFreightById(id);

      if (!freightDoc.exists) {
        throw new Error("Documento não encontrado");
      }

      const freightData = {
        id: freightDoc.id,
        ...freightDoc.data(),
      };

      // const subcollectionSnapshot = await freightDocRef
      //   .collection("stopping_points")
      //   .get();

      const subcollectionSnapshot = await freightService?.getStoppingPointsByFreight(
        id
      );

      const subcollectionData = subcollectionSnapshot.docs.map((subDoc) => ({
        id: subDoc.id,
        ...subDoc.data(),
      }));

      setFreightData({
        ...freightData,
        subcollectionData,
      });

      const pontos = subcollectionData.map((item) => ({
        coords: [item.latitude, item.longitude],
        popupText: `
          <strong>${item.name}</strong><br/>
          ${item.logradouro}, ${item.number}, ${item.city} - ${item.uf}, ${item.cep}
        `,
        events: item.events || [], // Inclui os eventos associados ao ponto de parada
        operation: item.operation || [],
        concluded: item.concluded || false,
      }));

      // Adiciona os pontos de parada ao estado
      setPoints(pontos);
      // Gerar a URL de pontos de parada
      setStoppingPointsUrl(generateGoogleMapsLink(pontos));
    } catch (err) {
      setError(err);
      console.error("Erro ao buscar dados do frete:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchLatestPositions = async (lastPositionReceived) => {
    try {
      console.log(lastPositionReceived);
  
      const latestPositionsSnapshot = await freightService?.searchLatestPositions(
        id,
        lastPositionReceived
      );
  
      const latestPositions = latestPositionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Criar novas coordenadas
      const coordenadas = latestPositions.map((position) => ({
        coords: [position.latitude, position.longitude],
        timestamp: position.timestamp,
      }));
  
      setPositions((_positions) => {
        const novasPosicoes = coordenadas.filter(
          (novaPosicao) =>
            !_positions.some((pos) => pos.timestamp === novaPosicao.timestamp)
        );
  
        const todasAsPosicoes = [..._positions, ...novasPosicoes];
        // Atualizar a URL com todas as posições
        setPositionsUrl(generateGoogleMapsLink(todasAsPosicoes));
  
        return todasAsPosicoes;
      });
  
      return latestPositions;
    } catch (error) {
      console.error("Erro ao buscar últimas posições:", error);
      return null;
    }
  };

  async function nameDriverFreight(freightData) {
    if (freightData) {
      let data = await driverService.getDriverAvailable(freightData.freight.getDriverFreight.uidDriver);

      const docSnap = await driverService.getDriverAvailable( freightData.freight.getDriverFreight.uidDriver );

      if (docSnap.exists) {
        const driverData = docSnap.data();
        console.log(driverData);
        console.log(driverData.name);

        setNameDriver(driverData.name);
      } else {
        console.log("Motorista não encontrado");
      }
    }
  }

  // const searchLatestPositions = async (lastPositionReceived) => {
  //   try {
  //     console.log(lastPositionReceived);

  //     const latestPositionsSnapshot = await freightService?.searchLatestPositions(
  //       id,
  //       lastPositionReceived
  //     );

  //     const latestPositions = latestPositionsSnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));

  //     // Atualizando o estado com as últimas coordenadas recebidas
  //     const coordenadas = latestPositions.map((position) => ({
  //       coords: [position.latitude, position.longitude],
  //       timestamp: position.timestamp,
  //     }));

  //     // setPositions((_positions) => [..._positions, ...coordenadas]);
  //     setPositions((_positions) => {
  //       const novasPosicoes = coordenadas.filter(novaPosicao =>
  //         !_positions.some(pos => pos.timestamp === novaPosicao.timestamp)
  //       );
  //       return [..._positions, ...novasPosicoes];
  //     });
      

  //     // Gerar a URL de posições

      

  //     const positionCoords = coordenadas.map((pos) => pos.coords);
  //     setPositionsUrl(generateGoogleMapsLink([...positions, ...coordenadas]));

  //     return latestPositions;
  //   } catch (error) {
  //     console.error("Erro ao buscar últimas posições:", error);
  //     return null;
  //   }
  // };

  useEffect(() => {
    fetchFreightData();
    searchLatestPositions(null); // Chamando a função para buscar as últimas posições
  }, []);

  useEffect(() => {
    if (freightData) {
      nameDriverFreight(freightData);
    }
  }, [freightData]);

  useEffect(() => {
    if (points.length > 0) {
      console.log("Pontos no estado:", points);
    }
  }, [points]); // Verificar sempre que `points` for atualizado

  if (useSelector((state) => state.usuarioLogado) <= 0) {
    return <Navigate to="/login" />;
  }

  return (
    <NewMiniDrawer
      divOpen={
        <div className="freight-content-details">
          <div className="container">
            {loading ? (<p>Carregando...</p>) : error ? (<p>Erro ao carregar dados: {error.message}</p>) : points.length > 0 ? (
              <>
                <MapComponent
                  points={points}
                  idFreight={id}
                  searchLatestPositions={searchLatestPositions}
                />
                <section
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-around",
                    width: "100%",
                    gap: 10,
                    paddingTop: '20px'
                  }}
                >
                  <div style={{ width: "50%"}}>
                    {/* <h3>Coordenadas coletadas</h3> */}
                    <a
                      href={positionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver no Maps
                    </a>
                    <table>

                    {freightData ? (

                      <CardFolowFreigth 
                          numberSerial={freightData.numberSerial}
                          product={freightData.freight.product}
                          weightCargo={freightData.freight.weightCargo}
                          valueNF={freightData.freight.valueNF}
                          valueFreightage={freightData.freight.valueFreightage}
                          user={freightData.user}
                          clientPayment={freightData.clientPayment}
                          vehicle={freightData.vehicle}
                          typeBodywork={freightData.vehicle?.typeBodywork?.dados ?? "Tipo não informado"}
                          typeVehicle={freightData.vehicle.typeVehicle.dados}
                          nameDriver={nameDriver}
                      />

                    ) : (
                      <ul>
                        <li>Dados do frete indisponíveis.</li>
                      </ul>
                    )}

                    </table>
                  </div>

                  <div style={{ width: "50%", marginBottom: 5 }}>
                    {/* <h3>Pontos de Parada</h3> */}
                    <a
                      href={stoppingPointsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver no Maps
                    </a>
                    <table className="table-pontos-de-parada">
                      
                      {freightData && freightData?.subcollectionData?.length > 0 ? (
                        
                        <StepPoints listPoints={freightData} />

                      ) : (
                        <li>Nenhum dado de ponto de parada disponível.</li>
                      )}
                    </table>
                  </div>
                </section>
              </>
            ) : (
              <p>Nenhum ponto de parada encontrado.</p>
            )}
          </div>
        </div>
      }
    />
  );
}
