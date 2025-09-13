import React, { useRef, useState, useEffect, useMemo } from 'react';
import PropTypes from "prop-types";
import { Table, Pagination, Button, Input, Space, Spin } from "antd";
import { Link } from "react-router-dom";
import { format } from 'date-fns';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import DatePickerMenu from '../dataPicker/dataPickerMenu';
import { CalendarOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
// import "./client.css";
require("firebase/auth");
const db = getFirestore();

export default function CustomPaginationTableFreights({ list }) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const searchInput = useRef(null);

  const [dateRange, setDateRange] = useState([]);

  const [filteredData, setFilteredData] = useState(list); // Lista filtrada

  const [loading, setLoading] = useState(false);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, page, rowsPerPage]);

  // Função para aplicar filtragem
  const applyFilters = (updateData) => {
    let data = [...updateData];

    // Filtrar por texto
    if (searchText && searchedColumn) {
      data = data.filter((item) => {
        const value = item[searchedColumn];

        if (searchedColumn === 'shipper') {
          const shipper = item.shipper; // Certifique-se de que 'shipper' está sendo obtido do item
          if (shipper && typeof shipper.name === 'string') {
            const cleanValue = searchText.replace(/[^\w]/g, '').trim().toLowerCase();
            const cleanShipper = shipper.name.replace(/[^\w]/g, '').toLowerCase();

            return cleanShipper.includes(cleanValue);
          }
        }

        if (searchedColumn === 'firstDelivery') {
          const cleanValue = searchText.replace(/[^\w]/g, '').trim().toLowerCase(); // Limpa o valor de busca

          // Verifica se firstDelivery e os campos city e uf são válidos
          if (item.firstDelivery) {
            const cleanCity = item.firstDelivery.city ? item.firstDelivery.city.replace(/[^\w]/g, '').toLowerCase() : '';
            const cleanUF = item.firstDelivery.uf ? item.firstDelivery.uf.replace(/[^\w]/g, '').toLowerCase() : '';

            // Verifica se o valor limpo da cidade ou do estado inclui o valor de busca
            return cleanCity.includes(cleanValue) || cleanUF.includes(cleanValue);
          }
        }

        if (searchedColumn === 'lastDelivery') {
          const cleanValue = searchText.replace(/[^\w]/g, '').trim().toLowerCase();

          if (item.lastDelivery) {
            const cleanCity = item.lastDelivery.city ? item.lastDelivery.city.replace(/[^\w]/g, '').toLowerCase() : '';
            const cleanUF = item.lastDelivery.uf ? item.lastDelivery.uf.replace(/[^\w]/g, '').toLowerCase() : '';

            return cleanCity.includes(cleanValue) || cleanUF.includes(cleanValue);
          }
        }

        if (searchedColumn === 'status') {
          if (item.status && typeof item.status.describe === 'string') {
            const cleanValue = searchText.replace(/[^\w]/g, '').trim().toLowerCase();
            const cleanStatus = item.status.describe.replace(/[^\w]/g, '').toLowerCase();

            return cleanStatus.includes(cleanValue);
          }
        }

        if (searchedColumn === 'stoppingQt') {
          if (item.stoppingQt && typeof item.stoppingQt === 'number') {
            const cleanValue = parseInt(searchText, 10);

            return item.stoppingQt === cleanValue;
          }
        }

        return value && value.toString().toLowerCase().includes(searchText.toLowerCase());
      });
    }

    // Filtrar por intervalo de datas
    if (dateRange && dateRange.length) {
      const [startDate, endDate] = dateRange;
      data = data.filter((record) => {
        const dateColeta = new Date(record?.firstDelivery?.dateColeta);
        if (isNaN(dateColeta.getTime())) return false;

        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && end && start.getTime() === end.getTime()) {
          return dateColeta.toDateString() === start.toDateString();
        }
        if (start && !end) {
          return dateColeta >= start;
        }
        if (start && end) {
          end.setHours(23, 59, 59, 999);
          return dateColeta >= start && dateColeta <= end;
        }
        return true;
      });
    }

    setFilteredData(data); // Atualiza a lista filtrada
    setPage(1); // Reinicia a paginação para a primeira página
  };

  function isLastPositionValid(positionTimestamp) {
    const agora = Date.now(); // em ms
    const diffMs = agora - positionTimestamp; 
    const diffMin = diffMs / (1000 * 60); // converte para minutos

    return diffMin <= 5; // true se estiver dentro dos últimos 5 min
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, "0");
    const minutos = String(date.getMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
  }

  async function addLastValidPosition(data) {
    // roda tudo em paralelo
    const promises = data.map(async (item) => {
      let lastPosition = null;

      if (item.status?.describe === "Em transito") {
        const positionsRef = collection(db, "freight", item.id, "positions");
        const q = query(
          positionsRef,
          orderBy("timestamp", "desc"),
          limit(1)
        );

        const snapshot = await getDocs(q);

        snapshot.forEach((doc) => {
          const pos = doc.data();
          lastPosition = { 
            id: doc.id, 
            ...pos, 
            formattedTimestamp: formatTimestamp(pos.timestamp) 
          };
        });
      }

      return {
        ...item,
        online: lastPosition && isLastPositionValid(lastPosition.timestamp) 
          ? "online" 
          : "offline",
        lastPosition: lastPosition
          ? lastPosition
          : { formattedTimestamp: null }, // sempre existe
      };
    });

    return Promise.all(promises);
  }

  async function addLastValidPositionAll(data) {
    const promises = data.map(async (item) => {
      let lastPosition = null;

      const positionsRef = collection(db, "freight", item.id, "positions");
      const q = query(positionsRef, orderBy("timestamp", "desc"), limit(1));
      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        const pos = doc.data();
        lastPosition = { 
          id: doc.id, 
          ...pos, 
          timestamp: pos.timestamp,
          formattedTimestamp: formatTimestamp(pos.timestamp) 
        };
      });

      return {
        ...item,
        online: lastPosition && isLastPositionValid(lastPosition.timestamp) 
          ? "online" 
          : "offline",
        lastPosition: lastPosition
          ? lastPosition
          : { formattedTimestamp: null }, // sempre existe
      };
    });

    return Promise.all(promises);
  }

    // Atualize a lista filtrada ao alterar os critérios de busca
  useEffect(() => {
    let intervalId;

    async function fetchAndApply() {
      setLoading(true); 
      try {
        // Primeiro executa o fetch e filtro das posições válidas
        const updatedList = await addLastValidPosition(list);
        applyFilters(updatedList);

        // Depois executa o fetchAll
        const updatedListAll = await addLastValidPositionAll(list);
        applyFilters(updatedListAll);
        console.log("Lista atualizada com todas as posições.");
      } 
      catch (error) {
        console.error("Erro ao atualizar lista:", error);
      }
      finally {
        setLoading(false);
      }
    }

    // Executa imediatamente ao montar
    fetchAndApply();

    // Executa a cada 5 minutos
    intervalId = setInterval(fetchAndApply, 3 * 60 * 1000);
    console.log("Intervalo iniciado para atualização a cada 5 minutos.");

    // Limpeza do intervalo ao desmontar
    return () => clearInterval(intervalId);
  }, [list, searchText, searchedColumn, dateRange]);

  const handleDateRangeChange = (dates) => {
    setDateRange(dates ? [dates[0], dates[1]] : []);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleSearchDate = (confirm) => {
    confirm();
    setSearchText('');
    setSearchedColumn('dateColeta');
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const handleResetDate = (clearFilters) => {
    clearFilters();
    setDateRange([]);
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>{ 

      if (dataIndex === 'shipper') {
        if (record.shipper && typeof record.shipper.name === 'string') {
          const cleanValue = value.replace(/[^\w]/g, '').trim().toLowerCase();
          const cleanShipper = record.shipper.name.replace(/[^\w]/g, '').toLowerCase();

          return cleanShipper.includes(cleanValue);
        }
      }
      if (dataIndex === 'firstDelivery') {
        const cleanValue = value.replace(/[^\w]/g, '').trim().toLowerCase(); // Limpa o valor de busca

        // Verifica se firstDelivery e os campos city e uf são válidos
        if (record.firstDelivery) {
          const cleanCity = record.firstDelivery.city ? record.firstDelivery.city.replace(/[^\w]/g, '').toLowerCase() : '';
          const cleanUF = record.firstDelivery.uf ? record.firstDelivery.uf.replace(/[^\w]/g, '').toLowerCase() : '';

          // Verifica se o valor limpo da cidade ou do estado inclui o valor de busca
          return cleanCity.includes(cleanValue) || cleanUF.includes(cleanValue);
        }
      }
      if (dataIndex === 'lastDelivery') {
        const cleanValue = value.replace(/[^\w]/g, '').trim().toLowerCase();

        if (record.lastDelivery) {
          const cleanCity = record.lastDelivery.city ? record.lastDelivery.city.replace(/[^\w]/g, '').toLowerCase() : '';
          const cleanUF = record.lastDelivery.uf ? record.lastDelivery.uf.replace(/[^\w]/g, '').toLowerCase() : '';

          return cleanCity.includes(cleanValue) || cleanUF.includes(cleanValue);
        }
      }
      if (dataIndex === 'status') {
        if (record.status && typeof record.status.describe === 'string') {
          const cleanValue = value.replace(/[^\w]/g, '').trim().toLowerCase();
          const cleanStatus = record.status.describe.replace(/[^\w]/g, '').toLowerCase();

          return cleanStatus.includes(cleanValue);
        }
      }
      if (dataIndex === 'stoppingQt') {
        if (record.stoppingQt && typeof record.stoppingQt === 'number') {
          const cleanValue = parseInt(value, 10);

          return record.stoppingQt === cleanValue;
        }
      }
      else {
        return record[dataIndex]
          ? String(record[dataIndex]).toLowerCase().includes(value.toLowerCase())
          : false;
      }

    }, onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },

    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const getColumnSearchPropsDate = () => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <DatePickerMenu
          onChange={(dates) => {
            handleDateRangeChange(dates); // Atualiza o estado do intervalo de datas
            setSelectedKeys(dates ? [dates] : []); // Armazena o intervalo de datas selecionado
          }}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearchDate(confirm)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleResetDate(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <CalendarOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (_, record) => {
      if (!dateRange || !dateRange.length) return true; // Se não há intervalo de datas

      const [startDate, endDate] = dateRange;
      const dateColeta = new Date(record?.firstDelivery?.dateColeta);
      
    
      if (isNaN(dateColeta.getTime())) {
        // Se a data for inválida
        return false;
      }

      // limpeza startDate e endDate
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end && start.getTime() === end.getTime()) {
        // Se startDate e endDate são iguais 
        return dateColeta.toDateString() === start.toDateString();
      }

      if (end) {
        // Ajusta o horário do endDate para o final do dia
        end.setHours(23, 59, 59, 999);
      }
  
      if (start && !end) {
        // Se endDate não estiver definido data em ou após startDate
        return dateColeta >= start;
      }

      if (start && end) {
        // Se startDate e endDate estão definidos, intervalo entre startDate e endDate
        return dateColeta >= start && dateColeta <= end;
      }

      return true; // Caso não se encaixe em nenhuma condição
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === 'dateColeta' ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (current, pageSize) => {
    setRowsPerPage(pageSize);
    setPage(1);
  };

  const columns = [
    {
      title: "Motorista",
      dataIndex: "driverName",
      key: "driverName",
      ...getColumnSearchProps('driverName'),
      render: (text, record) => (
        <Link
          to={`/freightsDetail/${record.id}/${record.freight.getDriverFreight.uidDriver}`}
          style={{ cursor: "pointer", textDecoration: "none", color: "black" }}
        >
          {text}
        </Link>
      ),
      sorter: (a, b) => {
        const nameA = a.driverName || '';
        const nameB = b.driverName || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: "Data Carregamento",
      dataIndex: "firstDelivery",
      key: "firstDelivery",
      ...getColumnSearchPropsDate(),
      render: (firstDelivery) => {
        if (!firstDelivery || !firstDelivery?.dateColeta) {
          return 'Data inválida';
        }
    
        const parsedDate = new Date(firstDelivery.dateColeta);
    
        if (isNaN(parsedDate.getTime())) {
          // Se a data for inválida
          console.error('Data inválida detectada:', firstDelivery.dateColeta);
          return 'Data inválida';
        }
    
        try {
          return format(parsedDate, 'dd/MM/yyyy');
        } catch (error) {
          console.error('Erro ao formatar a data:', error);
          return 'Data inválida';
        }
      },
    },    
    {
      title: "Cliente",
      dataIndex: "shipper",
      key: "shipper",
      ...getColumnSearchProps('shipper'),
      render: (shipper) => shipper.name,
      sorter: (a, b) => {
        const nameA = a.shipper.name || '';
        const nameB = b.shipper.name || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: "Origem",
      dataIndex: "firstDelivery",
      key: "origin",
      ...getColumnSearchProps('firstDelivery'),
      render: (firstDelivery) => `${firstDelivery.city} - ${firstDelivery.uf}`,
      sorter: (a, b) => {
        const nameA = `${a.firstDelivery.city || ''} ${a.firstDelivery.uf || ''}`.trim();
        const nameB = `${b.firstDelivery.city || ''} ${b.firstDelivery.uf || ''}`.trim();
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: "Destino",
      dataIndex: "lastDelivery",
      key: "destination",
      ...getColumnSearchProps('lastDelivery'),
      render: (lastDelivery) => `${lastDelivery.city} - ${lastDelivery.uf}`,
      sorter: (a, b) => {
        const nameA = `${a.lastDelivery.city || ''} ${a.lastDelivery.uf || ''}`.trim();
        const nameB = `${b.lastDelivery.city || ''} ${b.lastDelivery.uf || ''}`.trim();
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: "Qtd de Entregas",
      dataIndex: "stoppingQt",
      key: "stoppingQt",
      ...getColumnSearchProps('stoppingQt'),
      sorter: (a, b) => a.stoppingQt - b.stoppingQt,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "Online",
      dataIndex: "online",
      key: "online",
      ...getColumnSearchProps('online'),
      sorter: (a, b) => {
        const statusOrder = { online: 1, offline: 2 };
        return (statusOrder[a.online] || 99) - (statusOrder[b.online] || 99);
      },
      render: (online, record) => (
        <span style={{ color: online === 'online' ? 'green' : 'red', fontWeight: 'bold' }}>
          {online === 'online' ? 'Online' : 'Offline'}
          <br />
          {record.lastPosition?.formattedTimestamp || ''}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      ...getColumnSearchProps('status'),
      render: (status) => status.describe,
      sorter: (a, b) => {
        const nameA = a.status.describe || '';
        const nameB = b.status.describe || '';
        return nameA.localeCompare(nameB);
      },
    },
  ];

  return (
    <>
    <Spin spinning={loading} tip="Carregando dados...">
      <Table
        dataSource={paginatedData}
        columns={columns}
        pagination={false}
        rowKey="id"
        style={{ marginBottom: '16px' }}
      />
      {filteredData.length === list.length ? (
        <Pagination
          current={page}
          pageSize={rowsPerPage}
          total={list.length}
          showSizeChanger
          pageSizeOptions={[5, 10, 25]}
          onChange={handleChangePage}
          onShowSizeChange={handleChangeRowsPerPage}
          showTotal={(total) => `Total de ${total} fretes`}
        />
      ) : 
        <Pagination
          current={page}
          pageSize={rowsPerPage}
          total={filteredData.length}
          showSizeChanger
          pageSizeOptions={[5, 10, 25, 50]}
          onChange={handleChangePage}
          onShowSizeChange={handleChangeRowsPerPage}
          showTotal={(total) => `Total de ${total} fretes`}
        />
      }
      </Spin>
    </>
  );
}

CustomPaginationTableFreights.propTypes = {
  list: PropTypes.array.isRequired,
};