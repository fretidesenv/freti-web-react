import {React, useState, useEffect} from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import homeDashboardService from '../../service/home.dashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Relatório de fretes realizados/pendentes por mês',
    },
  },
};

export const labels = ['Frete por mês'];


export default function ChartHome() {
  
  const [carregando, setCarregando] = useState(1);
  const [dataFreihtAvaliable, setDataFreihtAvaliable] = useState(0);
  const [dataDriverPending, setDataDriverPending] = useState(0);
  const [dataFreihtInTravel, setDataFreihtInTravel] = useState(0);
  const [dataLoadingDriver, setDataLoadingDriver] = useState(0);
  
  useEffect(() => {
      
    homeDashboardService.freightAvaliable().then(async item => {
      setDataFreihtAvaliable(item?.size);
    }).catch(erro => {
        console.log(erro)
    });

    homeDashboardService.driverPending().then(async item => {
      setDataDriverPending(item?.size);
    }).catch(erro => {
        console.log(erro)
    });

    homeDashboardService.freightInTravel().then(async item => {
      setDataFreihtInTravel(item?.size);
    }).catch(erro => {
        console.log(erro)
    });

    homeDashboardService.waitingDriver().then(async item => {
      setDataLoadingDriver(item?.size);
    }).catch(erro => {
        console.log(erro)
    });

    
  },[0]);
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Fretes disponíveis',
        data: labels.map(() => dataFreihtAvaliable),
        backgroundColor: 'rgba(53, 162, 300, 1.5)',
      },
      {
        label: 'Motoristas pendentes',
        data: labels.map(() => dataDriverPending),
        backgroundColor: 'rgba(255, 99, 132, 1.5)',
      },
      {
        label: 'Fretes em viagem',
        data: labels.map(() => dataFreihtInTravel),
        backgroundColor: 'rgba(53, 162, 100, 1.5)',
      },
      {
        label: 'Aguardando motorista',
        data: labels.map(() => dataLoadingDriver),
        backgroundColor: 'rgba(255, 200, 100, 1.5)',
      },

    ],
  };





  return <Bar options={options} data={data} />;
}