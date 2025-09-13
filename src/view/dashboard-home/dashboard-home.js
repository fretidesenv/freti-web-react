// Dashboard.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useSelector } from "react-redux";
import { FaTruck, FaUserCheck, FaShippingFast, FaClipboardList } from "react-icons/fa";
import NewMiniDrawer from "../../components/navMenu/menu-nav";
import driverService from "../../service/driver.service";
import freightService from "../../service/freight.service";


const COLORS = ["#0088FE", "#FF8042"];
 
const DashboardHome = () => {

    const [countDriver, setCountDriver] = useState(0);
    const [countFreight, setCountFreight] = useState(0);
    const [countDriverInTravel, setCountDriverInTravel] = useState(0);
    const [countDelivery, setCountDelivery] = useState(1);
    const [countMakeDelivery, setCountMakeDelivery] = useState(1);

    const [countFreightPend, setCountFreightPend] = useState(10);
    const [countFreightHired, setCountFreightHired] = useState(10);
    const [countFreightInTravel, setCountFreightInTravel] = useState(10);
    const [countFreighFinaly, setCountFreightFinaly] = useState(10);
    
    const user = useSelector(state => state.user);
    
    useEffect(() => {
        const fetchData = async () => {
          try {
            const allDrivers = await driverService.getAllDriver(user.uidShipper);
            const freightsInProgress = await freightService.getFreightsInProgress(user.uidShipper);
            const freightsFinal = await freightService.freightAllFinalizado(user.uidShipper);
            const freightsHired = await freightService.getFreightsHired(user.uidShipper);
            const freightsPending = await freightService.getFreightsInPendente(user.uidShipper);
            const delivered = await freightService.freightAllDeliveredEfeccts(user.uidShipper);
            const notDelivered = await freightService.freightAllDeliveredNeedEfeccts(user.uidShipper);

            setCountDriver(allDrivers);
            setCountDriverInTravel(freightsInProgress.size);
            setCountFreightInTravel(freightsInProgress.size);
            setCountFreightFinaly(freightsFinal.size);
            setCountFreightHired(freightsHired.size);
            setCountFreightPend(freightsPending.size);
            setCountMakeDelivery(notDelivered)

            setCountDelivery(delivered)
      
            
          } catch (error) {
            debugger
            console.error("Erro ao buscar dados dos fretes e motoristas:", error);
          }
        };
      
        fetchData();
      }, []);
      


 


    const estatisticas = {
        motoristasCadastrados: countDriver,
        fretesDisponiveis: countFreight,
        caminhoesEmViagem: countDriverInTravel,
        entregasEfetuadas: countDelivery,
        entregasAFazer: countMakeDelivery,
        fretesPendentes: countFreightPend,
        fretesContratados: countFreightHired,
        fretesEmViagem: countFreightInTravel,
        fretesFinalizados: countFreighFinaly,
      };
    
      const kmPorMes = [
        { mes: "Jan", km: 18000 },
        { mes: "Fev", km: 22000 },
        { mes: "Mar", km: 27000 },
        { mes: "Abr", km: 25000 },
        { mes: "Mai", km: 30000 },
        { mes: "Jun", km: 28000 },
        { mes: "Jul", km: 28000 },
        { mes: "Ago", km: 28000 },
        { mes: "Set", km: 28000 },
        { mes: "Out", km: 28000 },
        { mes: "Nov", km: 28000 },
        { mes: "Dez", km: 28000 },
      ];
    
      const pieData = [
        { name: "Efetuadas", value: estatisticas.entregasEfetuadas },
        { name: "A Fazer", value: estatisticas.entregasAFazer },
      ];

      const dataFretes = [
        { name: "Pendentes", value: estatisticas.fretesPendentes },
        { name: "Contratados", value: estatisticas.fretesContratados },
        { name: "Em Viagem", value: estatisticas.fretesEmViagem },
        { name: "Finalizados", value: estatisticas.fretesFinalizados },
      ];
      

  return (
   <>
    {useSelector((state) => state.usuarioLogado) > 0 ? (
        <NewMiniDrawer  
            divOpen={
                
                <div style={{ padding: "32px", fontFamily: "Arial, sans-serif", backgroundColor: "#fafafa" }}>
                <h2 style={{ marginBottom: "24px" }}>📊 Dashboard Logístico</h2>

                {/* Cards com estatísticas */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                    <StatCard
                        title="Motoristas"
                        value={estatisticas.motoristasCadastrados}
                        icon={FaUserCheck}
                        color="#4CAF50"
                    />
                    <StatCard
                        title="Em Viagem"
                        value={estatisticas.caminhoesEmViagem}
                        icon={FaTruck}
                        color="#2196F3"
                    />
                    <StatCard
                        title="Entregas Efetuadas"
                        value={estatisticas.entregasEfetuadas}
                        icon={FaShippingFast}
                        color="#9C27B0"
                    />
                    <StatCard
                        title="Entregas a Fazer"
                        value={estatisticas.entregasAFazer}
                        icon={FaClipboardList}
                        color="#FF9800"
                    />
                </div>

                {/* Gráficos lado a lado */}
                <div
                    style={{
                        display: "flex",
                        gap: "20px",
                        marginTop: "40px",
                        flexWrap: "wrap",
                    }}
                    >
                    <ChartCard
                        title="Status dos Fretes"
                        style={{ width: "calc(50% - 10px)" }}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                            data={dataFretes}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            label={({ name, percent }) =>
                                `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                            >
                            {dataFretes.map((entry, index) => (
                                <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Entregas (Efetuadas vs A Fazer)"
                        style={{ width: "calc(50% - 10px)" }}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={100}
                                label
                                >
                                {pieData.map((entry, index) => (
                                    <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    </div>

                {/* Gráfico de linha */}
                <ChartCard title="Km Rodados por Mês">
                    <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={kmPorMes}>
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                        type="monotone"
                        dataKey="km"
                        stroke="#82ca9d"
                        activeDot={{ r: 8 }}
                        />
                    </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
                </div>

            }/>
            ) : (
                <Navigate to="/login" />
            )}
        
            </>
        );
    };

        const ChartCard = ({ title, children, style = {} }) => (
            <div
            style={{
                marginTop: "40px",
                padding: "24px",
                borderRadius: "10px",
                backgroundColor: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                ...style, // <- isso permite sobrescrever width etc.
            }}
            >
            <h3 style={{ marginBottom: "16px" }}>{title}</h3>
            {children}
            </div>
        );

    const StatCard = ({ title, value, icon: Icon, color }) => (
    <div
        style={{
        flex: "1 1 240px",
        padding: "20px",
        borderRadius: "16px",
        backgroundColor: "#ffffff",
        boxShadow: "0 6px 12px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        borderLeft: `6px solid ${color}`,
        }}
    >
        <div
        style={{
            backgroundColor: `${color}22`,
            padding: "12px",
            borderRadius: "50%",
            color: color,
            fontSize: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}
        >
        <Icon />
        </div>
        <div>
        <div style={{ fontSize: "14px", color: "#555" }}>{title}</div>
        <div style={{ fontSize: "26px", fontWeight: "bold", color }}>{value}</div>
        </div>
    </div>
    );

  
//   const ChartCard = ({ title, children }) => (
//     <div
//       style={{
//         marginTop: "40px",
//         padding: "24px",
//         borderRadius: "10px",
//         backgroundColor: "#fff",
//         boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//       }}
//     >
//       <h3 style={{ marginBottom: "16px" }}>{title}</h3>
//       {children}
//     </div>
//   );

export default DashboardHome;
