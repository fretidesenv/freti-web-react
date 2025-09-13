import React, { useRef, useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { Button, Input, Space, Table } from 'antd';
import { Link } from "react-router-dom";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSelector } from 'react-redux';
import DialogConfirme from '../dialog-confirm/dialog-confirm';
import DialogSave from '../dialog-save/dialog-save';
import firebase from '../../config/firebase';
import { Chip, Stack, Tooltip } from '@mui/material';
import PaymentModal from '../modal-salve-payment/modal-payment';
import paymentService from '../../service/payment.service';
import { set } from 'date-fns';
import { render } from '@testing-library/react';
require('firebase/auth')

const DataPaymentTable = ({ data, updatedList }) => {

  const db = firebase.firestore();

  const [idFreight, setIdFreight] = useState(data?.idFreight);

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [datas, setData] = useState([]);
  const searchInput = useRef(null);

  const [openDialogYesOrNo, setOpenDialogYesOrNo] = useState();
  const [messageDialogYesOrNo, setMessageDialogYesOrNo] = useState();
  const [titleDialogYesOrNo, setTitleDialogYesOrNo] = useState();
  const [statusDialogYesOrNo, setStatusDialogYesOrNo] = useState();
  const [recordInput, setRecordInput] = useState();

  const [openDialog, setOpenDialog] = useState();
  const [messageDialog, setMessageDialog] = useState();
  const [titleDialog, setTitleDialog] = useState();
  const [statusDialog, setStatusDialog] = useState();
  const [open, setOpen] = useState();
  const [selectDriver, setSelectedDriver] = useState();
  const [dataHistory, setDataHistory] = useState();

  const [updatedData, setUpdatedData] = useState(null);

  const user = useSelector(state => state.user)

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleUpdate = () => {
    console.log("Atualizando dados...");
    try {
      fetchDriverNames();
    }
    catch (error) {
      console.error(error);
    }
  }

  const fetchDriverNames = async () => {
    if (!data || data.length === 0) return;

    // console.log("data");
    // console.log(data);

    if (!idFreight || idFreight.length === 0) return;
    const payment = await paymentService.getEspecifico(idFreight);
    
    // console.log("payment");
    // console.log(payment);

    const groupedFreights = payment.reduce((acc, curr) => {
      const { idFreight } = curr;

      if (acc.idFreight && acc.idFreight !== idFreight) return acc;

      if (!acc.idFreight) {
        acc.idFreight = idFreight;
        acc.items = [];
      }
      acc.items.push(curr);
      return acc;
    }, {});

    if (!groupedFreights || groupedFreights.length === 0) return;

    // console.log("groupedFreights");
    // console.log(groupedFreights);

    try {
      // Aqui taxa o type e faz a seleção do tipo.
      const driverPromises = groupedFreights.items.map(async (item, index) => {
        const type = item.type ? item.type : (index === 0 ? "Adiantamento" : "Saldo");
        if (!item.driver) { return { ...item, type }; }
        const driverRef = db.collection("drivers_users").doc(item.driver);
        const driverSnap = await driverRef.get();
        if (driverSnap.exists) {
          return { ...item, driver: driverSnap.data().name, driverID: driverSnap.data().uid, type };
        } else {
          return { ...item, type };
        }
      });
      // let firstValidDriverAssigned = false; // Flag para saber se já atribuímos "Adiantamento"

      // const driverPromises = groupedFreights.items.map(async (item) => {
      //     let type = "Saldo"; // Padrão como "Saldo"
          
      //     if (item.driver && !firstValidDriverAssigned) {
      //         type = "Adiantamento"; // O primeiro motorista válido recebe "Adiantamento"
      //         firstValidDriverAssigned = true; // Atualiza a flag
      //     }

      //     if (!item.driver) {
      //         return { ...item, type };
      //     }

      //     const driverRef = db.collection("drivers_users").doc(item.driver);
      //     const driverSnap = await driverRef.get();

      //     if (driverSnap.exists) {
      //         return { ...item, driver: driverSnap.data().name, driverID: driverSnap.data().uid, type };
      //     } else {
      //         return { ...item, type };
      //     }
      // });

      const updatedList = await Promise.all(driverPromises);

      const sortedData = customSort(updatedList)?.map(item => ({
        ...item,
        valordoFrete: item.valueTotal ?? item.value
      }));
      
      // console.log("updatedList")
      // console.log(sortedData)
      setUpdatedData(sortedData)
    } catch (error) {
      console.error(error);
    }
  };

  const updateAndReplaceData = async (data) => {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log("Nenhum dado válido foi fornecido.");
        return;
      }

      const idFreight = data[0].idFreight;
      const querySnapshot = await db.collection('payment').where("idFreight", "==", idFreight).get();

      if (querySnapshot.empty) {
        console.log("Documento não encontrado.");
        return;
      }

      let hasTypeField = false;
      
      // Verificar se algum documento contém o campo "type"
      querySnapshot.forEach((doc) => {
        if (doc.data().type !== undefined) {
          hasTypeField = true;
        }
      });

      if (hasTypeField) {
        console.log("stop");
        return;
      }

      // 1. Apagar todos os documentos encontrados
      const deletePromises = querySnapshot.docs.map((doc) => doc.ref.delete());
      await Promise.all(deletePromises);
      console.log(`Todos os documentos com idFreight ${idFreight} foram apagados.`);

      // 2. Adicionar os novos documentos
      const addPromises = data.map((item) => db.collection('payment').add(item));
      await Promise.all(addPromises);
      
      console.log("Novos documentos adicionados com os dados atualizados.");

    } catch (error) {
      console.error("Erro ao atualizar dados no banco:", error);
    }
  };

  useEffect(() => {
    // console.log(data);
    // console.log(updatedList);
    fetchDriverNames();

  }, [data]);

  useEffect(() => {

    updateAndReplaceData(updatedData);

  }, [updatedData]);

  useEffect(() => {

    if ( updatedList ) {
      handleUpdate();
    }
    else {
      console.log("Nenhum dado foi atualizado.");
    }
  }, [ updatedList ]);

  // const fetchData = async () => {
  //   const snapshot = await db.collection('ocurrence').get();
  //   const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  //   setData(documents);
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);
  
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const deleteOcorrence = () => {

    try {
      // console.log(recordInput)
      paymentService.delete(recordInput);
      setOpenDialogYesOrNo(false);
      handleUpdate();
    }
    catch (error) {
      console.error(error);
    }

  }

  const handleDialogCloseYesOrNo = () => {
    setOpenDialogYesOrNo(false);
  };

  function toPascalCase(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const deleteEmb = (record) => {

    setRecordInput(record)
    setOpenDialogYesOrNo(true);
    setStatusDialogYesOrNo('error')
    setTitleDialogYesOrNo("Deletar ocorrência ")
    setMessageDialogYesOrNo("Tem certeza que deseja deletar a ocorrência " + record.name  + " ? ")

  };

  const handleDialogClose = () => {
    setOpenDialog(false); 
    setOpenDialogYesOrNo(false);
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

      if (dataIndex === 'cpfCnpj') {
        const cleanValue = value.replace(/[^\w]/g, '').trim();
      
        return (
          (record.cpf && record.cpf.toString().replace(/[^\w]/g, '').toLowerCase().includes(cleanValue.toLowerCase())) ||
          (record.cnpj && record.cnpj.toString().replace(/[^\w]/g, '').toLowerCase().includes(cleanValue.toLowerCase()))
        );
      }
      else if(typeof value === 'string'){
        return record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase())
      }
      else {
        return record[dataIndex] = value
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

    switch (status.toLowerCase()) {
      case "pendente":
        return commonChip(toPascalCase(status), 'warning');
      case "cancelado":
        return commonChip(toPascalCase(status), 'error');
      case "pago":
        return commonChip(toPascalCase(status), 'success');
      default:
        return commonChip(toPascalCase(status), 'default');
    }
  }

  const customSort = (data) => {
    const order = ['Adiantamento', 'Saldo']; // Define a ordem dos tipos
    return data?.sort((a, b) => {
      const aIndex = order.indexOf(a.type);
      const bIndex = order.indexOf(b.type);
  
      // Se ambos os valores estiverem na lista de prioridade, ordena por índice
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
  
      // Se apenas um dos valores estiver na lista, coloca o valor prioritário primeiro
      if (aIndex !== -1) return -1; // 'a' vem primeiro
      if (bIndex !== -1) return 1;  // 'b' vem primeiro
  
      // Caso contrário, realiza uma ordenação normal (por nome)
      return a.type.localeCompare(b.type);
    });
  };
  
  // Use a função para ordenar os dados antes de passar para a tabela
  const sortedData = customSort(updatedData);

  const onOpen = (record, data) => {
    // console.log("record");
    // console.log(record);
    setSelectedDriver(record);
    // console.log("data");
    // console.log(data.history);
    setDataHistory(data.history);
    setOpen(true);
  }

  const columns = [
    {
      title: 'Motorista',
      dataIndex: 'driver',
      key: 'driver',
      width: '30%',
      ...getColumnSearchProps('driver'),
      sorter: (a, b) => a.driver.localeCompare(b.driver),
      render: (text, record) => (
        <Link to={`/driverList/${record.driverID}`} >
          {text}
        </Link>
      ),
    },
    {
      title: 'Frete',
      dataIndex: 'order',
      key: 'order',
      width: '15%',
      // sorter: (a, b) => a.order.localeCompare(b.order),
      render: (text, record) => (
        <Link to={`/freight/${record.idFreight}`} >
          {text}
        </Link>
      ),
    },
    {
      title: 'Valor do Frete',
      dataIndex: ['valordoFrete'],
      key: 'valordoFrete',
      align: 'center',
      width: '22%',
      ...getColumnSearchProps(['valordoFrete']),
      render: (valor) => `${(valor || 0).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`,
      sorter: (a, b) => (a.valordoFrete ?? 0) - (b.valordoFrete ?? 0),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: '15%',
      sorter: (a, b) => {
        const order = ['Adiantamento', 'Saldo']; // Define a ordem dos tipos
        const aIndex = order.indexOf(a.type);
        const bIndex = order.indexOf(b.type);
        
        // Se ambos os valores estiverem na lista de prioridade, ordena por índice
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        
        // Se apenas um dos valores estiver na lista, coloca o valor prioritário primeiro
        if (aIndex !== -1) return -1; // 'a' vem primeiro
        if (bIndex !== -1) return 1;  // 'b' vem primeiro
        
        // Caso contrário, realiza uma ordenação normal (por nome)
        return a.type.localeCompare(b.type);
      },
      render: (type) => toPascalCase(type) || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      ...getColumnSearchProps('status'),
      render: (status) => {
        return (
          <Tooltip title={status}>
            <div>
              {renderStatusColor(status)}
            </div>
          </Tooltip>
        );
      },
      sorter: (a, b) => {
        const statusA = a?.status || '';
        const statusB = b?.status || '';
        return statusA.localeCompare(statusB);
      },
    },
    {
      title: 'Ações',
      width: '10%',
      // dataIndex: 'data',
      key: 'action',
          render: (_, record) => (
              <Space size="middle">
                  <Link>
                    {record.status?.toLowerCase() === "pago" ? (
                      <VisibilityIcon onClick={() => onOpen(record, data)} />
                    ) : (
                      <EditOutlinedIcon onClick={() => onOpen(record, data)} />
                    )}
                  </Link>
                {
                  <Link to={'#'}>
                    <DeleteOutlinedIcon onClick={(e) => { 
                      if (record.status?.toLowerCase() !== "pago" && !!record.addExpenses ) {
                        deleteEmb(record)
                        handleUpdate();
                      } } }
                        color='error'
                        disable={record.status?.toLowerCase() === "pago" || !record.addExpenses}
                    />
                  </Link>
                }
              </Space>
          ),
    },
  ];

    const onClose = () => {
        setOpen(false)
    }

  return(
      <>
        <DialogConfirme 
            open={openDialogYesOrNo} 
            handleClose={handleDialogCloseYesOrNo}
            input={recordInput}
            handleOk={deleteOcorrence}
            title={titleDialogYesOrNo}
            message={messageDialogYesOrNo} 
            status={statusDialogYesOrNo}
          />

        <DialogSave 
            open={openDialog} 
            handleClose={handleDialogClose}
            title={titleDialog}
            message={messageDialog} 
            status={statusDialog}
        />

        <PaymentModal visible={open} onClose={onClose} driverName={selectDriver} dataHistory={dataHistory} type={selectDriver?.type} onUpdate={handleUpdate} />

        <Table columns={columns} dataSource={sortedData} />

      </>
  ) 

};
export default DataPaymentTable;