import React, { useRef, useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { Button, Input, Space, Table } from 'antd';
import { Link } from "react-router-dom";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useSelector } from 'react-redux';
import DialogConfirme from '../dialog-confirm/dialog-confirm';
import DialogSave from '../dialog-save/dialog-save';
import firebase from '../../config/firebase';
import { Chip, Stack, Tooltip } from '@mui/material';
import PaymentModal from '../modal-salve-payment/modal-payment';
import { useNavigate } from "react-router-dom";
import paymentService from '../../service/payment.service';
require('firebase/auth')

const DataPaymentTableGeral = ({  }) => {

  // console.log(data)

  const db = firebase.firestore();

  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [data, setData] = useState([]);
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

  const [updatedData, setUpdatedData] = useState(null);

  const user = useSelector(state => state.user)

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  function toPascalCase(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const fetchDriverNames = async () => {

    try {
      const data = await paymentService.getAll();

      if (!data || data.length === 0 ) return;

      setData(data);

      const driverPromises = data.map(async (item) => {
        if (!item.driver) return item;
        const driverRef = db.collection("drivers_users").doc(item.driver);
        const driverSnap = await driverRef.get();
        if (driverSnap.exists) {
          return { ...item, driver: driverSnap.data().name, driverID: driverSnap.data().uid };
        } else {
          return item;
        }
      });

      const updatedList = await Promise.all(driverPromises);

      // Agrupando por idFreight
      const groupedFreights = updatedList.reduce((acc, curr) => {
        const { idFreight } = curr;
        if (!acc[idFreight]) {
          acc[idFreight] = { idFreight, items: [] };
        }
        acc[idFreight].items.push(curr);
        return acc;
      }, {});

      const finalGroupedList = await Promise.all(
        Object.values(groupedFreights).map(async (group) => {
          // Buscar o frete no banco pelo idFreight
          const freightDoc = await db.collection("freight").doc(group.idFreight).get();

          if (freightDoc.exists) {
            // console.log("Frete");
            const freightData = freightDoc.data();
            // console.log(freightData);
            return {
              ...group,
              origem: freightData.firstDelivery?.city || null,
              destino: freightData.lastDelivery?.city || null,
              history: freightData.history || null,
            };
          } else {
            return {
              ...group,
              origem: null,
              destino: null,
              history: null,
            };
          }
        })
      );

      // console.log("Final Grouped List: ");
      // console.log(finalGroupedList);
      setUpdatedData(finalGroupedList);
    } catch (error) {
      console.error("Erro ao buscar motoristas:", error);
    }
  };

  useEffect(() => {

    fetchDriverNames();
  }, []);

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



  const deleteOcorrence = async () => {

    try {
      // console.log(recordInput)
      await paymentService.deleteDetalhes(recordInput);
      await fetchDriverNames();
    }
    catch (error) {
      console.error(error);
    }
    finally {
      setOpenDialogYesOrNo(false);
    }

  }

  const handleDialogCloseYesOrNo = () => {
    setOpenDialogYesOrNo(false);
  };

  const deleteEmb = (record) => {

    setRecordInput(record)
    setOpenDialogYesOrNo(true);
    setStatusDialogYesOrNo('error')
    setTitleDialogYesOrNo("Deletar ocorrência ")
    setMessageDialogYesOrNo("Tem certeza que deseja deletar a ocorrência " + record.name  + " ? ")

  };

  const handleEditClick = (record) => {
    // console.log("record apertei no lapis");
    // console.log(record);
    navigate("/listPaymentDetail", { state: { record } });
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

      if (dataIndex === 'driver') {
        const item = record.items?.find(item => item.driver);
        const driverName = item?.driver?.toLowerCase() || '';
        return driverName.includes(value.toLowerCase());
      }

      if (dataIndex === 'order') {
        const order = record.items?.[0]?.order?.toString() || '';
        return order.includes(value.toString());
      }

      if (dataIndex === 'value') {
        const totalValue = record.items?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
        return totalValue.toFixed(2).toString().includes(value.toString());
      }

      if (typeof value === 'string') {
        return record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase());
      } else {
        return record[dataIndex] === value;
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

  // function renderStatusColor(status) {
  //   const chipStyle = {
  //     minWidth: '100px',
  //     maxWidth: '150px',
  //   };

  //   const commonChip = (label, color) => (
  //     <Stack direction="row" spacing={1}>
  //       <Chip label={label} color={color} style={chipStyle} />
  //     </Stack>
  //   );

  //   switch (status) {
  //     case 'Liberado':
  //       return commonChip(status, 'primary');
  //     default:
  //       return commonChip(status, 'warning');
  //   }
  // }

  function getStatusFromUpdatedData(record) {
    // if (!Array.isArray(record) || record.length === 0) {
    //   return "em aberto";
    // }
  
    const hasCancel = record.some(item => item.status?.toLowerCase() === "cancelado");
    const allPaid = record.every(item => item.status?.toLowerCase() === "pago");
    const hasPaid = record.some(item => item.status?.toLowerCase() === "pago");
    const hasSoli = record.some(item => item.status?.toLowerCase() === "solicitar pagamento");
    const hasPendent = record.some(item => item.status?.toLowerCase() === "pendente");
    const allBloqued = record.every(item => item.status?.toLowerCase() === "bloqueado");

    if (hasCancel) return "cancelado";
    if (allPaid) return "pago";
    if (hasSoli) return "solicitar pagamento";
    if (hasPendent) return "pendente liberação";
    if (allBloqued) return "bloqueado";
    if (hasPaid) return "baixa parcial";

    return "em aberto";
  }

  function renderStatusColor(record) {
    const status = getStatusFromUpdatedData(record.items);

    const chipStyle = {
      minWidth: '100px',
      maxWidth: '150px',
    };

    const commonChip = (label, color) => (
      <Stack direction="row" spacing={1}>
        <Chip label={label} color={color} style={chipStyle} />
      </Stack>
    );

    // debugger;
    switch (status) {
      case "pago":
        return commonChip(toPascalCase(status), "success");
      case "baixa parcial":
        return commonChip(toPascalCase(status), "info");
      case "em aberto":
        return commonChip(toPascalCase(status), "warning");
      case "pendente liberação": 
        return commonChip(toPascalCase(status), "warning");
      case "solicitar pagamento": 
        return commonChip(toPascalCase(status), "warning");
      case "cancelado":
        return commonChip(toPascalCase(status), "error");
      default:
        return commonChip(toPascalCase(status), "default");
    }
  }

  // const renderStatusColumn = (updatedData) => {
  //   return (
  //     <Tooltip title={getStatusFromUpdatedData(updatedData)}>
  //       <div>
  //         {renderStatusColor(updatedData)}
  //       </div>
  //     </Tooltip>
  //   );
  // };

  const onOpen = (record) => {
    // console.log("record");
    // console.log(record);
    setSelectedDriver(record.driver);
    setOpen(true);
  }

  const columns = [
    {
      title: 'Motorista',
      dataIndex: 'driver',
      key: 'driver',
      width: '30%',
      ...getColumnSearchProps('driver'),
      sorter: (a, b) => {
        const driverA = a.items?.[0]?.driver || '';
        const driverB = b.items?.[0]?.driver || '';
        return driverA.localeCompare(driverB);
      },
      render: (_, record) => {
        if (!record.items || record.items.length === 0) return 'Sem motorista';

        const firstDriverItem = record.items.find(item => item.driver && item.driver.toLowerCase() !== "terceiros") || {};
        const { driver, driverID } = firstDriverItem;

        return driver ? (
          <Link to={`/driverList/${driverID || '#'}`}>
            <span>{driver}</span>
          </Link>
        ) : (
          <span>Motorista não encontrado</span>
        );
      }
    },
    {
      title: 'Frete',
      dataIndex: 'order',
      key: 'order',
      width: '15%',
      ...getColumnSearchProps('order'),
      sorter: (a, b) => a.order.localeCompare(b.order),
      render: (text, record) => {
        const idFreight = record.idFreight || "#";
        const order = record.items[0].order || "#";

        return (
          <Link to={`/freight/${idFreight}`}>
            {order}
          </Link>
        );
      }
    },
    {
      title: 'Origem',
      dataIndex: 'origem',
      key: 'origem',
      width: '15%',
      ...getColumnSearchProps('origem'),
      sorter: (a, b) => a.origem?.localeCompare(b.origem),
      render: (text, record) => {
        const order = record.origem || "#";
        return order; // retorna a string diretamente
      }
    },
    {
      title: 'Destino',
      dataIndex: 'destino',
      key: 'destino',
      width: '15%',
      ...getColumnSearchProps('destino'),
      sorter: (a, b) => (a.destino || "").localeCompare(b.destino || ""),
      render: (text, record) => {
        const order = record.destino || "#";
        return order; // retorna a string diretamente
      }
    },
    {
      title: 'Valor do Frete',
      dataIndex: ['value'],
      key: 'value',
      align: 'center',
      width: '22%',
      ...getColumnSearchProps('value'),
      render: (text, record) => {
        // Soma todos os valores dentro de items
        const totalValue = record.items?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;

        return `${totalValue?.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`
      },
      sorter: (a, b) => {
        const totalA = a.items?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
        const totalB = b.items?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;

        return totalA - totalB;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      ...getColumnSearchProps('status'),
      render: (_, record) => {
        return (
          <Tooltip title={getStatusFromUpdatedData(record.items)}>
            <div>
              {renderStatusColor(record)}
              {/* {console.log("status", record)} */}
            </div>
          </Tooltip>
        );
      },
      sorter: (a, b) => (a.status?.describe || "").localeCompare(b.status?.describe || ""),
    },
    {
      title: 'Ações',
      width: '10%',
      // dataIndex: 'data',
      key: 'action',
          render: (_, record) => (
              <Space size="middle">
                  <EditOutlinedIcon style={{ color: '#1a73e8', cursor: 'pointer' }} onClick={() => handleEditClick(record)} />
                {
                  <Link to={'#'}>
                    <DeleteOutlinedIcon onClick={(e) => deleteEmb(record)} color='error'/>
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

        <PaymentModal visible={open} onClose={onClose} driverName={selectDriver} type={"Adiantamento"} />

        <Table columns={columns} dataSource={updatedData} />

      </>
  ) 

};
export default DataPaymentTableGeral;