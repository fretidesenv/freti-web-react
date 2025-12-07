import React, { useRef, useState, useEffect, Fragment } from 'react';
import { CopyOutlined, DeleteOutlined, EditOutlined, SearchOutlined, SmallDashOutlined } from '@ant-design/icons';
import { CalendarOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { Button, Dropdown, Input, Menu, Space, Table, Tooltip } from 'antd';
import { Link } from "react-router-dom";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import firebase from '../../config/firebase';
import { useSelector } from 'react-redux';
import Stack from '@mui/material/Stack';
import { Chip, Badge } from '@mui/material';
import EditNotificationsOutlinedIcon from '@mui/icons-material/EditNotificationsOutlined';
import { format } from 'date-fns';
import { ContentCopy } from '@mui/icons-material';
import DatePickerMenu from '../dataPicker/dataPickerMenu';
import DialogFileDriver from '../dialog-fila-driver/dialog-fila-driver';
import { title } from 'process';
require('firebase/auth');

const DriverBadge = ({ recordId }) => {
  const [driversInFila, setDriversInFila] = useState([]);
  const [status, setStatus] = useState('');

  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (!recordId) return;

    const db = firebase.firestore();
    
    // Listener para o documento do frete (status)
    const unsubscribeFreight = db.collection('freight').doc(recordId)
      .onSnapshot(
        (freightDoc) => {
          if (freightDoc.exists) {
            setStatus(freightDoc.data()?.status?.describe);
          }
        },
        (error) => {
          console.error("Erro ao carregar status do frete:", error);
        }
      );

    // Listener para a fila de motoristas
    const unsubscribeQueue = db.collection('freight').doc(recordId).collection('queue')
      .onSnapshot(
        (snapshot) => {
          const listDriverInFila = [];
          snapshot.docs.forEach(doc => {
            listDriverInFila.push({ id: doc.id, ...doc.data() });
          });
          setDriversInFila(listDriverInFila);
        },
        (error) => {
          console.error("Erro ao carregar fila de motoristas:", error);
        }
      );

    // Limpa os listeners quando o componente desmontar ou recordId mudar
    return () => {
      unsubscribeFreight();
      unsubscribeQueue();
    };
  }, [recordId]);

  if (status === 'Finalizado' || status === 'Contratado') {
    return (
      <EditNotificationsOutlinedIcon />
    );
  }

  return (
    <Link to={'#' + recordId}>
      {driversInFila.length > 0 ? (
        <Badge badgeContent={driversInFila.length} color="success">
          <EditNotificationsOutlinedIcon color='primary' />
        </Badge>
      ) : (
        <EditNotificationsOutlinedIcon color='primary' />
      )}
    </Link>
  );
};

const DataFreteTable = ({ data }) => {
  const db = firebase.firestore();

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [driversInFila, setDriversInFila] = useState([]);
  const [datas, setData] = useState([]);

  const [dateRange, setDateRange] = useState([]);

  const handleDateRangeChange = (dates) => {
    setDateRange(dates ? [dates[0], dates[1]] : []);
  };

  const searchInput = useRef(null);
  const queueUnsubscribeRef = useRef(null);

  const user = useSelector(state => state.user);

  const getDriversQueue = (id) => {
    const db = firebase.firestore();
    
    // Limpa o listener anterior se existir
    if (queueUnsubscribeRef.current) {
      queueUnsubscribeRef.current();
      queueUnsubscribeRef.current = null;
    }
    
    // Usando onSnapshot para atualização em tempo real da fila
    queueUnsubscribeRef.current = db.collection('freight').doc(id).collection('queue')
      .onSnapshot(
        (snapshot) => {
          const listDriverInFila = [];
          snapshot.docs.forEach(doc => {
            listDriverInFila.push({
              id: doc.id,
              ...doc.data()
            });
          });
          setDriversInFila(listDriverInFila);
          handleOpen();
        },
        (error) => {
          console.error("Erro ao carregar fila de motoristas:", error);
        }
      );
  };

  useEffect(() => {
    if (!user) return;

    let query;
    
    if(user.perfil == "Master") {
        query = firebase.firestore()
            .collection("freight");
    } else {
      query = firebase.firestore()
          .collection("freight")
          .where('shipper.uid', '==', user.uidShipper);
    }

    // Usando onSnapshot para atualização em tempo real
    const unsubscribe = query.onSnapshot(
      async (snapshot) => {
        const documents = await Promise.all(snapshot.docs.map(async (docSnap) => {
          const docData = docSnap.data();
          const uid = docData?.freight?.getDriverFreight?.uidDriver;
    
          // Se tiver uidDriver, tenta buscar o nome do motorista
          if (uid) {
            
            try {
              const driverSnap = await firebase.firestore()
                .collection("drivers_users")
                .doc(uid)
                .get();
    
              if (driverSnap.exists) {
                const driverData = driverSnap.data();
                return {
                  id: docSnap.id,
                  ...docData,
                  freight: {
                    ...docData.freight,
                    getDriverFreight: {
                      ...docData.freight.getDriverFreight,
                      name: driverData.name || "Nome não encontrado",
                    },
                  },
                };
              } else {
                return {
                  id: docSnap.id,
                  ...docData,
                  getDriverFreight: {
                    ...docData.getDriverFreight,
                    name: "Motorista não encontrado",
                  },
                };
              }
            } catch (error) {
              console.error("Erro ao buscar motorista:", error);
              return {
                id: docSnap.id,
                ...docData,
                getDriverFreight: {
                  ...docData.getDriverFreight,
                  name: "Erro ao buscar nome",
                },
              };
            }
          }
    
          // Se não tiver uidDriver, retorna como está
          return { id: docSnap.id, ...docData };
        }));
    
        setData(documents);
      },
      (error) => {
        console.error("Erro ao carregar fretes:", error);
      }
    );

    // Limpa o listener quando o componente desmontar
    return () => {
      unsubscribe();
      // Também limpa o listener da fila se existir
      if (queueUnsubscribeRef.current) {
        queueUnsubscribeRef.current();
        queueUnsubscribeRef.current = null;
      }
    };
  }, [user]);

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    // Limpa o listener da fila quando o modal fechar
    if (queueUnsubscribeRef.current) {
      queueUnsubscribeRef.current();
      queueUnsubscribeRef.current = null;
    }
    setOpenModal(false);
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

  const deleteEmb = (id) => {
    if (user.perfil === "Master") {
      var result = window.confirm("Deseja mesmo excluir ? ");
      if (result === true) {
        firebase.firestore()
        .collection('freight')
        .doc(id)
        .delete()
        .then(() => {
          alert("Frete excluído com sucesso!");
          // Não precisa chamar fetchData() - o listener onSnapshot atualiza automaticamente
        })
      } else {
        return;
      }
    } else {
      alert("Você não tem privilégio suficiente para excluir um Cliente, contate algum usuário master.");
    }
  };

  function renderStatusColor(status) {
    const chipStyle = {
      minWidth: '100px',
      maxWidth: '150px',
    };

    const commonChip = (label, color) => (
      <Stack direction="row" spacing={1}>
        <Chip label={label} color={color} style={chipStyle} />
      </Stack>
    );

    switch (status) {
      case 'Contratado':
        return commonChip(status, 'primary');
      case 'Pendente de contratação':
      case 'Em Analise de perfil':
        return commonChip(status, 'warning');
      case 'Em Analise do motorista':
      case 'Em transito':
        return commonChip(status, 'success');
      case 'Entregue':
        return commonChip(status, 'warning');
      case 'Finalizado':
        return commonChip(status, 'error');
      default:
        return commonChip(status, 'warning');
    }
  }

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
    onFilter: (value, record) => {
      const dataIndexArray = Array.isArray(dataIndex) ? dataIndex : [dataIndex];
      let recordValue = record;
      for (const index of dataIndexArray) {
        recordValue = recordValue[index];
      }
      if (typeof value === 'string') {
        return recordValue?.toString().toLowerCase().includes(value.toLowerCase());
      } 
      else if (dataIndex === 'driver') {
        const totalValue = record.items?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
        return totalValue.toFixed(2).toString().includes(value.toString());
      }
      else {
        return recordValue === value;
      }
      
    },
    onFilterDropdownOpenChange: (visible) => {
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
      const dateColeta = new Date(record.firstDelivery.dateColeta);

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

  const statusPriority = {
    "Pendente de contratação": 1,
    "Em transito": 2,
    "Contratado": 3,
    "Outro status": 4, // Prioridade para os demais
  };

  const columns = [
    {
      title: 'Data Coleta',
      dataIndex: ['firstDelivery', 'dateColeta'],
      key: 'dateColeta',
      align: 'center',
      // width: '20%',
      ...getColumnSearchPropsDate(),
      sorter: (a, b) => {
        const dateA = a.firstDelivery?.dateColeta;
        const dateB = b.firstDelivery?.dateColeta;

        if (!dateA) return -1;
        if (!dateB) return 1;

        const [yearA, monthA, dayA] = dateA.split('-').map(Number);
        const [yearB, monthB, dayB] = dateB.split('-').map(Number);

        const timeA = new Date(yearA, monthA - 1, dayA).getTime();
        const timeB = new Date(yearB, monthB - 1, dayB).getTime();

        return timeA - timeB;
      },
      render: (dataColeta) => {
        if (dataColeta && dataColeta !== "") {
          const [year, month, day] = dataColeta.split('-');
          const localDate = new Date(+year, +month - 1, +day); // Mês começa do 0
          return format(localDate, 'dd/MM/yyyy');
        }
        return "";
      },
    },
    {
      title: 'Codigo Frete',
      dataIndex: 'numberSerial',
      key: 'numberSerial',
      align: 'center',
      // width: '20%',
      ...getColumnSearchProps('numberSerial'),
      // sorter: (a, b) => {
      //   const idA = a.id || '';
      //   const idB = b.id || '';
      //   return idA.localeCompare(idB);
      // },
      // render: (numberSerial) => (
      //   {numberSerial}
      // ),
    },
    {
      title: 'Nome Pagador',
      dataIndex: ['clientPayment', 'name'],
      key: 'name',
      align: 'center',
      // width: '27%',
      ...getColumnSearchProps(['clientPayment', 'name']),
      sorter: (a, b) => {
        const nameA = a.clientPayment?.name || '';
        const nameB = b.clientPayment?.name || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Nome Motorista',
      dataIndex: ['freight', 'getDriverFreight', 'name'],
      key: 'driver',
      align: 'center',
      // width: '27%',
      ...getColumnSearchProps(['freight', 'getDriverFreight', 'name']),
      sorter: (a, b) => {
        const nameA = a.driver?.name || '';
        const nameB = b.driver?.name || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Origem',
      dataIndex: ['firstDelivery', 'city'],
      key: 'firstDelivery',
      align: 'center',
      // width: '18%',
      ...getColumnSearchProps(['firstDelivery', 'city']),
      sorter: (a, b) => {
        const nameA = a.firstDelivery?.city || '';
        const nameB = b.firstDelivery?.city || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Destino',
      dataIndex: ['lastDelivery', 'city'],
      key: 'lastDelivery',
      align: 'center',
      // width: '18%',
      ...getColumnSearchProps(['lastDelivery', 'city']),
      sorter: (a, b) => {
        const nameA = a.lastDelivery?.city || '';
        const nameB = b.lastDelivery?.city || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Valor do Frete',
      dataIndex: ['freight', 'valueFreightage'],
      key: 'freight',
      align: 'center',
      // width: '22%',
      ...getColumnSearchProps(['freight', 'valueFreightage']),
      render: (valueFreightage) => (
        `${(valueFreightage || 0).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`
      ),
      sorter: (a, b) => {
        const valueA = a.freight?.valueFreightage || 0;
        const valueB = b.freight?.valueFreightage || 0;
        return valueA - valueB;
      },
    },
    {
      title: 'Pagando ao Motorista',
      dataIndex: ['driver', 'valueInitial'],
      key: 'driver_valueInitial',
      align: 'center',
      // width: '30%',
      ...getColumnSearchProps(['driver', 'valueInitial']),
      render: (driver) => (
        `${(driver || 0).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`
      ),
      sorter: (a, b) => {
        const valueA = a.driver?.valueInitial || 0;
        const valueB = b.driver?.valueInitial || 0;
        return valueA - valueB;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      ...getColumnSearchProps(['status', 'describe']),
      render: (status) => {
        const describeText = status?.describe === 'Pendente de contratação' ? 'P.Contratação' : status?.describe;
        return (
          <Tooltip title={status?.describe}>
            <div>
              {renderStatusColor(describeText)}
            </div>
          </Tooltip>
        );
      },
      sorter: (a, b) => a?.status?.describe?.localeCompare(b?.status?.describe),
    },
    {
      title: 'Ações',
      align: 'center',
      key: 'action',
      render: (_, record) => {
        const handleMenuClick = ({ key }) => {
          if (key === 'queue') getDriversQueue(record.id);
          if (key === 'delete') deleteEmb(record.id);
        };
    
        const menu = (
          <Menu
            onClick={handleMenuClick}
            style={{ minWidth: 180, padding: '8px 0', borderRadius: 8 }}
          >
            <Menu.Item key="queue" style={{ padding: '10px 16px' }}>
              <Link to={`#${record.id}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DriverBadge recordId={record.id} />
                Ver Fila
              </Link>
            </Menu.Item>
    
            <Menu.Item key="edit" style={{ padding: '10px 16px' }}>
              <Link to={`/freight/${record.id}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <EditOutlined />
                Editar
              </Link>
            </Menu.Item>
    
            <Menu.Item key="copy" style={{ padding: '10px 16px' }}>
              <Link to={`/freight/${record.id}?copy=true`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CopyOutlined />
                Copiar
              </Link>
            </Menu.Item>
    
            <Menu.Item key="delete" style={{ padding: '10px 16px', color: 'red' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DeleteOutlined />
                Excluir
              </div>
            </Menu.Item>
          </Menu>
        );
    
        return (
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <Button
              type="text"
              icon={<SmallDashOutlined style={{ fontSize: 20 }} />}
            />
          </Dropdown>
        );
      },
    }
    // {
    //   title: 'Editar',
    //   // width: '10%',
    //   align: 'center',
    //   key: 'action',
    //   render: (_, record) => (
    //     <Space size="middle">
    //       <Link to={'#' + record.id} onClick={() => getDriversQueue(record.id)}>
    //         <DriverBadge recordId={record.id} />
    //       </Link>
    //       <Link to={'/freight/' + record.id}>
    //         <EditOutlinedIcon />
    //       </Link>
    //       <Link to={`/freight/${record.id}?copy=true`}>
    //         <ContentCopy />
    //       </Link>
    //       <Link to={'#'}>
    //         <DeleteOutlinedIcon onClick={() => deleteEmb(record.id)} color='error' />
    //       </Link>
    //     </Space>
    //   ),
    // },
  ];

  const sortedData = datas.sort((a, b) => {
    // console.log("A ia não quer trabalhar");
    // console.log(datas);
    const priorityA = statusPriority[a?.status?.describe] || 5;
    const priorityB = statusPriority[b?.status?.describe] || 5;
    return priorityA - priorityB;
  });

  return (
    <>
      <DialogFileDriver driversInFila={driversInFila} openModal={openModal} handleClose={handleClose}/>
      <Table columns={columns} dataSource={sortedData} rowKey="id" />
    </>
  );
};

export default DataFreteTable;