import { SearchOutlined } from '@ant-design/icons';
import React, { useRef, useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import { Button, Input, Space, Table } from 'antd';
import { Link, useNavigate} from "react-router-dom";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useSelector } from 'react-redux';
import { Chip, Stack } from '@mui/material';
import './data-embarcador.css'
import firebase from '../../config/firebase';
import InputMask from 'react-input-mask';
import driverService from '../../service/driver.service';
require('firebase/auth')

const DataDriverTable = ({data}) => {

  data.sort((a, b) => {
    return b.accountCreated?.seconds - a.accountCreated?.seconds || b.accountCreated?.nanoseconds - a.accountCreated?.nanoseconds;
  });

  const user = useSelector(state => state.user)

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [datas, setData] = useState([]);
  const [dataComPlaca, setMotoristasComPlaca] = useState([]);


  const fetchData = async () => {
    // const snapshot = await firebase.firestore().collection('drivers_users')
    // .where("uidShipper", "==", user.uidShipper).get();
    // const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // documents.sort((a, b) => {
    //   return b.accountCreated.seconds - a.accountCreated.seconds || b.accountCreated.nanoseconds - a.accountCreated.nanoseconds;
    // });
    // setData(documents);

    try {
      if (!data) return;

      const motoristasAtualizados = await Promise.all(
        data.map(async (motorista) => {
          const documentos = await driverService.getDriverAvailableById(motorista.id);

          const placa = documentos.data()?.vehicle?.vehiclePlate || "Sem placa";

          return {
            ...motorista,
            placa,
          };
        })
      );

      setMotoristasComPlaca(motoristasAtualizados);
    } catch (error) {
      console.error("Erro ao buscar dados dos motoristas:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [data]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    if (selectedKeys.length > 0) {
      if (selectedKeys[0].trim().length > 0) {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
      } else {
        confirm();
        setSearchText('');
        setSearchedColumn(dataIndex);
      }
    } else {
      confirm();
      setSearchText('');
      setSearchedColumn(dataIndex);
    }
  };
  
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
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
      case 'informed':
        return commonChip("Pendente", 'warning');
      case 'incomplete':
        return commonChip("incompleto", 'error');
      default:
        return commonChip("Autorizado", 'primary');
    }
  }

  function deleteDriver(id){
    if (user.perfil === "Master") {

      var result = window.confirm("Deseja mesmo excluir esse Motorista ? ");
      if (result === true) {
          firebase.firestore()
          .collection('drivers_users')
          .doc(id)
          .delete()
          .then(() => {
            alert("Documento excluído com sucesso!");
            fetchData();
          })
      } else {
        return;
      }
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
      if (dataIndex === 'cpf') {
        const cleanValue = value.replace(/[^\w]/g, '').trim();

        const documentNumber = record.cpf
          ? record.cpf.toString().replace(/[^\w]/g, '').toLowerCase().trim()
          : '';

        return documentNumber.includes(cleanValue.toLowerCase());
      } else if (dataIndex === 'statusDriver') {
        const cleanedValue = value.toLowerCase().trim();
        // console.log(`Record status: ${record[dataIndex]}, Cleaned value: ${cleanedValue}`);
        return record[dataIndex]?.toString().toLowerCase().includes(cleanedValue)
      } 
      else {
        return (
          record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        );
      };
      
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

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'CPF',
      dataIndex: 'cpf',
      key: 'cpf',
      ...getColumnSearchProps('cpf'),
      sorter: (a, b) => a.cpf.localeCompare(b.cpf),
      render: (text) => {
        return <InputMask mask="999.999.999-99" value={text} disabled style={{
          border: 'none',
          backgroundColor: 'transparent',
          width: 'auto',
          padding: '0 5px',
          fontSize: '14px',
          color: '#444',
        }}/>;
      },
    },
    {
      title: 'Placa Veiculo',
      dataIndex: 'placa',
      key: 'placa',
      ...getColumnSearchProps('placa'),
      sorter: (a, b) => a.placa.localeCompare(b.placa),
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
      ...getColumnSearchProps('email'),
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Status',
      dataIndex: 'statusDriver',
      key: 'statusDriver',
      ...getColumnSearchProps('statusDriver'),
      render: (_, value) => (
        <span>
          {renderStatusColor(value.statusDriver)}
        </span>
      ),
      sorter: (a, b) => a.statusDriver.localeCompare(b.statusDriver),
    },
    {
      title: 'Ações',
      // dataIndex: 'data',
      key: 'action',
          render: (_, record) => (
              <Space size="middle">
                <Link to={'/driverList/' + record.id}>
                      <EditOutlinedIcon />
                  </Link>
                {
                  <Link to={'#'}>
                    <DeleteOutlinedIcon onClick={(e) => deleteDriver(record.id)} color='error'/>
                  </Link>
                }
              </Space>
          ),
    },
  ];
  return <Table columns={columns} dataSource={dataComPlaca} />;

};
export default DataDriverTable;