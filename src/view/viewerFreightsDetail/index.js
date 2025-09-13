import React, { useEffect, useState } from "react";
import "./style.css";
import { useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import freightService from "../../service/freight.service";
import CustomPaginationTableFreightsDetails from "../../components/GridSimple-details-freight";
import CardHeadDeliveriedSuccessfull from "../../components/card-head-delivered-successfull";
import CardHeadAllDelivered from "../../components/card-head-all-deliveried";
import CardHeadDeliveriedWithOcorrency from "../../components/card-head-delivered-with-ocurrency";
import CardHeadInTransitPending from "../../components/card-head-in-transit-pending";
import CardHeadInTransitWithOcorrency from "../../components/card-head-in-transit-with-ocurrency";
import driverService from "../../service/driver.service";
import ViewerMaps from "./component/maps-component";
import HtmlTemplate from "../MapLink/map-link";
import MapComponent from "../../components/MAPA-COMP/mapa-comp";

require("firebase/auth");

export default function ViewerFreightsDetails() {
  const { id, idDriver } = useParams();

  const [freightsDatas, setFreightsDatas] = useState([]);
  const [freightList, setFreightList] = useState([]);
  const [stoppingList, setStoppingList] = useState([]);
  const [driver, setDriver] = useState({});

  const [currentFreightId, setCurrentFreightId] = useState(null);


  //Aqui ele monta o objeto que preenche o header com as informações 
  //Total de Entregas, Finalizadas com sucesso, Finalizadas com Ocorrência, 
  //Em Transito Pendente, Em Transito com Ocorrência

  const getFreightsDatas = () => {
    let allDelivered = 0;
    let deliveredSuccessfull = 0;
    let deliveredWithOcorrency = 0;
    let inTransitPending = 0;
    let inTransitWithOcorrency = 0;

    allDelivered = stoppingList.length;

    deliveredSuccessfull = stoppingList.filter(
      (stopping) => stopping.concluded && !stopping.observation
    );

    deliveredWithOcorrency = stoppingList.filter(
      (stopping) => stopping.concluded === true && stopping.observation
    );

    inTransitPending = stoppingList.filter((stopping) => !stopping.concluded);

    inTransitWithOcorrency = stoppingList.filter(
      (stopping) => !stopping.concluded && stopping.observation
    );

    const datas = {
      allDelivered,
      deliveredSuccessfull: deliveredSuccessfull.length,
      deliveredWithOcorrency: deliveredWithOcorrency.length,
      inTransitPending: inTransitPending.length,
      inTransitWithOcorrency: inTransitWithOcorrency.length,
    };

    console.log("Tela de detalhe do frete")

    setFreightsDatas(datas);
  };

  const getAllStoppingPoints = async (idFreight) => {
    try {
      //Stopping points
      const stoppings = await freightService.getStoppingPointsByFreight(
        idFreight
      );

      const updatedStoppingList = stoppings.docs.map((stopping) => ({
        idFreight,
        ...stopping.data(),
      }));

      
      setStoppingList((prevStoppingPoints) => [
        ...prevStoppingPoints,
        ...updatedStoppingList.filter(
          (newStopping) =>
            !prevStoppingPoints.some(
              (existingStopping) => existingStopping.id === newStopping.id
            )
        ),
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  const getInfosDriver = async (idDriver) => {
    try {
      const driver = await driverService.getDriverAvailable(idDriver);
      setDriver(driver.data());
    } catch (error) {
      console.log(error);
    }
  };


  //Aqui ele monta as informações do motorista buscando no banco 
  //Depois vai buscar os fretes deste motorista no banco 
  //Seta as coordenadas do frete 
  //Monta o objeto de detalhes do mototista ao frete
  const fetchFreightsDatasByDriver = async () => {
    try {
      
      // const initFreight = await freightService.getFreightById(id);

      // setFreight(initFreight)

      getInfosDriver(idDriver);

      //vai buscar os frete deste motorista
      const freights = await freightService.getFreightsByDriverId(idDriver);

      const freightListPromises = freights.docs.map(async (freight) => {
        const freightObj = freight.data();

        const freightId = freight.id;

        getAllStoppingPoints(freightId);

        return {
          id: freightId,
          client: freightObj.shipper.name,
          address:
            freightObj.lastDelivery.city + " - " + freightObj.lastDelivery.uf,
          valueNF: freightObj.freight.valueNF,
          status: freightObj.status.describe,
          numberSerial: freightObj.numberSerial,
        };
      });

      const freightList = await Promise.all(freightListPromises);

      setFreightList(freightList);
    } catch (error) { 
      console.error("Erro ao requisitar fretes deste motorista", error);
      return 0;
    }
  };

  const handleUpdateCurrentFreightId = (newCurrentFreightId) => {
    setCurrentFreightId(newCurrentFreightId);
  };

  useEffect(() => {

    fetchFreightsDatasByDriver();
    setCurrentFreightId(id);
  }, []);

  useEffect(() => {
    getFreightsDatas();
  }, [stoppingList]);

  return (
    <>
      {useSelector((state) => state.usuarioLogado) > 0 ? (
        <PersistentDrawerLeft
          divOpen={
            <div className="freight-content-details">
              <div className="infos-section">
                <div className="driver-infos">
                  <h6>Motorista:</h6>
                  <h3>{driver?.name ? driver?.name : "Nome não informado"}</h3>

                  <div className="freights-card">
                    <CardHeadAllDelivered value={freightsDatas.allDelivered} />
                    <CardHeadDeliveriedSuccessfull
                      value={freightsDatas.deliveredSuccessfull}
                    />
                    <CardHeadDeliveriedWithOcorrency
                      value={freightsDatas.deliveredWithOcorrency}
                    />
                    <CardHeadInTransitPending
                      value={freightsDatas.inTransitPending}
                    />
                    <CardHeadInTransitWithOcorrency
                      value={freightsDatas.inTransitWithOcorrency}
                    />
                  </div>

                  <div className="driver-infos-row">
                    <div className="graphic-div-details">
                      {/* <DonutGraph values={freightsDatas} /> */}
                    </div>

                    <div className="viewer-maps-section">
                      {/* <ViewerMaps currentFreightId={currentFreightId} /> */}
                      <MapComponent />
                    </div>
                  </div>
                </div>
              </div>

              <div className="freight-list">
                <CustomPaginationTableFreightsDetails
                  list={freightList}
                  updateCurrentId={handleUpdateCurrentFreightId}
                />
              </div>
            </div>
          }
        />
      ) : (
        <Navigate to="/login" />
      )}
    </>

  );
  
}
