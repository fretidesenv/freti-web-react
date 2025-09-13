import React, { useEffect, useState } from "react";
import "./style.css";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import freightService from "../../service/freight.service";
import driverService from "../../service/driver.service";
import CustomPaginationTableFreights from "../../components/GridSimple-home-freight";
import NewMiniDrawer from "../../components/navMenu/menu-nav";
import { Table, Pagination, Button, Input, Space, Spin } from "antd";

function ViewerFreights() {
  const [status, setStatus] = useState("");
  const [freightList, setFreightList] = useState([]);
  const [activeTab, setActiveTab] = useState("em_transito");
  const [dataFreihtInTravel, setDataFreihtInTravel] = useState(0);
  const [dataFreihtDelivered, setDataFreihtDelivered] = useState(0);
  const [dataFreihtWithOcurrency, setDataFreihtWithOcurrency] = useState(0);
  const [dataFreihtFinised, setDataFreihtFinised] = useState(0);
  const [loading, setLoading] = useState(false);

  const user = useSelector(state => state.user);

  const fetchStoppingPointsByFreight = async (freightId) => {
    return await freightService.getStoppingPointsByFreight(freightId);
  };

  const fetchDateFromFirstStoppingPoint = (stoppingPoints) => {
    const firstValidStoppingPoint = stoppingPoints.docs.find(
      (stoppingPoint) => {
        const stoppingPointObj = stoppingPoint.data();
        return stoppingPointObj.stop_order === 1;
      }
    );

    if (firstValidStoppingPoint) {
      return firstValidStoppingPoint.data().date_operation;
    } else {
      return null;
    }
  };

  const fetchAllFreights = async (activeTab) => {
    try {
      if (activeTab === "em_transito") {
        const freightsInProgress = await freightService.getFreightsInProgress(user.uidShipper);

        const allFreights = [...freightsInProgress.docs];

        const freightListPromises = allFreights.map(async (freight) => {
            const freightObj = freight.data();
            const freightId = freight.id;

            const stoppingPoints = await fetchStoppingPointsByFreight(freightId);
            const loadingDate = stoppingPoints
                ? fetchDateFromFirstStoppingPoint(stoppingPoints)
                : "Data de carregamento ainda não definida";

            const driverUid = freightObj.freight.getDriverFreight?.uidDriver;
            const driver = driverUid
                ? await driverService.getDriverAvailable(driverUid)
                : null;
            const driverName = driver?.data()?.name || "Não informado";

            return {
                id: freightId,
                driverName,
                loadingDate,
                stoppingQt: stoppingPoints?.size || 0,
                ...freightObj,
            };
          });

          const freightList = await Promise.all(freightListPromises);

          setFreightList(freightList);
      }
      else {

        const freightsInProgress = await freightService.getFreightsInProgress(user.uidShipper);

        const freightsDelivered = await freightService.freightAllFinalizado(user.uidShipper);

        const allFreights = [...freightsInProgress.docs, ...freightsDelivered.docs];

        const freightListPromises = allFreights.map(async (freight) => {
            const freightObj = freight.data();
            const freightId = freight.id;

            const stoppingPoints = await fetchStoppingPointsByFreight(freightId);
            const loadingDate = stoppingPoints
                ? fetchDateFromFirstStoppingPoint(stoppingPoints)
                : "Data de carregamento ainda não definida";

            const driverUid = freightObj.freight.getDriverFreight?.uidDriver;
            const driver = driverUid
                ? await driverService.getDriverAvailable(driverUid)
                : null;
            const driverName = driver?.data()?.name || "Não informado";

            return {
                id: freightId,
                driverName,
                loadingDate,
                stoppingQt: stoppingPoints?.size || 0,
                ...freightObj,
            };
          });

          const freightList = await Promise.all(freightListPromises);

          setFreightList(freightList);
      }
    } catch (error) {
        console.log(error);
    }
  };

  const getAllFreightsDelivered = async () => {
    try {
      const freithDelivery = await freightService.freightAllDelivered();

      setDataFreihtDelivered(freithDelivery);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllFreightsWithOcurrency = async () => {
    try {
      let countFreightsWithOcurrency = 0;

      const ocurrency = await freightService.freightWithOcurrency()
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllFreights(activeTab);

    freightService
        .freightInTravel(user.uidShipper)
        .then(async (item) => {
            setDataFreihtInTravel(item?.size);
        })
        .catch((erro) => {
            console.log(erro);
        });

    getAllFreightsDelivered();

    getAllFreightsWithOcurrency();

    freightService
        .allFreightsFinished()
        .then(async (item) => {
            setDataFreihtFinised(item?.size);
        })
        .catch((erro) => {
            console.log(erro);
        });

  }, [activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);

    if (tab === "todos") {
      setLoading(true);

      // Simula tempo de carregamento (ex: fetch real)
      setTimeout(() => {
        setLoading(false);
      }, 2000); 
    }
  };

  const styles = {
    card: {
      backgroundColor: '#fff', // Azul claro
      border: '0px solid rgb(1, 36, 66)', // Azul mais escuro
      borderRadius: '12px',
      padding: '20px',
      width: '250px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxWidth: '300px',
      margin: 'auto',
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      color: 'rgb(1, 36, 66)',
      marginBottom: '10px',
    },
    quantity: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: 'rgb(1, 36, 66)',
    },

    cardred: {
      backgroundColor: '#fff', // Azul claro
      border: '0px solid rgb(1, 36, 66)', // Azul mais escuro
      borderRadius: '12px',
      padding: '20px',
      width: '250px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxWidth: '300px',
      margin: 'auto',
    },
    titlered: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#dc3545',
      marginBottom: '10px',
    },
    quantityred: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#dc3545',
    },

    cardgreen: {
      backgroundColor: '#fff', // Azul claro
      border: '0px solid #0e8a16', // Azul mais escuro
      borderRadius: '12px',
      padding: '20px',
      width: '250px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxWidth: '300px',
      margin: 'auto',
    },
    titlegreen: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#0e8a16',
      marginBottom: '10px',
    },
    quantitygreen: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#0e8a16',
    },

    cardyallon: {
      backgroundColor: '#fff', // Azul claro
      border: '0px solid #fbca04', // Azul mais escuro
      borderRadius: '12px',
      padding: '20px',
      width: '250px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxWidth: '300px',
      margin: 'auto',
    },
    titleyallon: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#fbca04',
      marginBottom: '10px',
    },
    quantityyallon: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#fbca04',
    },

  };
  
  return (
    <>
      {useSelector((state) => state.usuarioLogado) > 0 ? (
        <NewMiniDrawer
          divOpen={
            <div className="freight-content">
              <div className="freight-container-header">
                <h3>Acompanhamento</h3>
                <div>
                </div>
              </div>
              <div>
                <div style={{ height: 700, width: "100%" }}>
                  <div style={{ height: "100%" }}>
                    <div className="graphic-div">
                      <div>

                      <div style={styles.cardgreen} >
                        <h3 style={styles.titlegreen}>Veículos em transito</h3>
                        <div style={styles.quantitygreen}>{dataFreihtInTravel ? dataFreihtInTravel : 0}</div>
                      </div>

                        {/* <Paper sx={{ height: 250, width: 250 }}>
                          <p className="graphic-title">Veículos em transito</p>

                          <Typography
                            align="center"
                            variant="h1"
                            fontFamily={"sans-serif"}
                            color={"#ffd778"}
                          >
                            {dataFreihtInTravel ? dataFreihtInTravel : 0}
                          </Typography>
                        </Paper> */}
                      </div>
                      <div>

                      <div style={styles.cardyallon}>
                        <h3 style={styles.titleyallon}>Entregas</h3>
                        <div style={styles.quantityyallon}>{dataFreihtDelivered ? dataFreihtDelivered : 0}</div>
                      </div>

                        {/* <Paper sx={{ height: 250, width: 250 }}>
                          <p className="graphic-title">Entregas</p>

                          <Typography
                            align="center"
                            variant="h1"
                            fontFamily={"sans-serif"}
                            color={"#4ed9d9"}
                          >
                            {dataFreihtDelivered ? dataFreihtDelivered : 0}
                          </Typography>
                        </Paper> */}
                      </div>
                      <div>

                      <div style={styles.cardred}>
                        <h3 style={styles.titlered}>Ocorrências</h3>
                        <div style={styles.quantityred}>{dataFreihtWithOcurrency
                              ? dataFreihtWithOcurrency
                              : 0}
                        </div>
                      </div>

                        {/* <Paper sx={{ height: 250, width: 250 }}>
                          <p className="graphic-title"> Ocorrências</p>
                          <Typography
                            align="center"
                            variant="h1"
                            fontFamily={"sans-serif"}
                            color={"#ff829d"}
                          >
                            {dataFreihtWithOcurrency
                              ? dataFreihtWithOcurrency
                              : 0}
                          </Typography>
                        </Paper> */}
                      </div>
                      <div>

                      <div style={styles.card}>
                        <h3 style={styles.title}>Entregas finalizadas</h3>
                        <div style={styles.quantity}>
                          {dataFreihtFinised ? dataFreihtFinised : 0}
                        </div>
                      </div>

                        {/* <Paper sx={{ height: 250, width: 250 }}>
                          <p className="graphic-title">Entregas finalizadas</p>
                          <Typography
                            align="center"
                            variant="h1"
                            fontFamily={"sans-serif"}
                            color={"#36a2eb"}
                          >
                            {dataFreihtFinised ? dataFreihtFinised : 0}
                          </Typography>
                        </Paper> */}
                      </div>
                    </div>
                    <div style={{ height: "70%", width: "100%", paddingTop: "2%" }}>
                      <div style={{ display: "flex", gap: "1rem", cursor: "pointer" }}>
                        <span
                          style={{
                            borderBottom: activeTab === "em_transito" ? "2px solid #000" : "none",
                            paddingBottom: "5px",
                          }}
                          onClick={() => handleTabClick("em_transito")}
                        >
                          Em Trânsito
                        </span>
                        <span
                          style={{
                            borderBottom: activeTab === "todos" ? "2px solid #000" : "none",
                            paddingBottom: "5px",
                          }}
                          onClick={() => handleTabClick("todos")}
                        >
                          Todos
                        </span>
                      </div>
                      <Spin spinning={loading} tip="Carregando dados...">
                        <CustomPaginationTableFreights list={freightList} />
                      </Spin>
                    </div>
                  </div>
                </div>
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

export default ViewerFreights;