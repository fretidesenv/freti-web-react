import React, { useRef, useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { Button, Input, Space, Table } from 'antd';
import { Link} from "react-router-dom";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import firebase from '../../config/firebase';
import { useSelector } from 'react-redux';
import InputMask from 'react-input-mask';
require('firebase/auth')

const DataClientTable = ({data}) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [datas, setData] = useState([]);
  const searchInput = useRef(null);

  const user = useSelector(state => state.user)


  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const fetchData = async () => {
    const snapshot = await firebase.firestore()
      .collection('client')
      .where("uidShipper", "==", user.uidShipper)
      .get();
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setData(documents);
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const deleteEmb = (id) => {

    if(user.perfil === "Master") {

    var result = window.confirm("Deseja mesmo excluir ? ");
      if (result === true) {
        
        firebase.firestore()
        .collection('client')
        .doc(id)
        .delete()
        .then(() => {
          alert("Documento excluído com sucesso!");
          fetchData();
        })
      } else {
        return;
      }
    }else{
      alert("Você não tem privilégio suficiente para excluir um Cliente, contate algum usuário master.")
    }
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

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      ...getColumnSearchProps('name'),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Nome Fantasia',
      dataIndex: 'nameFantasy',
      key: 'nameFantasy',
      width: '20%',
      ...getColumnSearchProps('nameFantasy'),
      sorter: (a, b) => {
        const nameA = a.nameFantasy || '';
        const nameB = b.nameFantasy || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'CPF/CNPJ',
      dataIndex: 'cpfCnpj',
      key: 'cpfCnpj',
      ...getColumnSearchProps('cpfCnpj'),
      render: (text, record) => {
        if (record.cpf) {
          return <InputMask mask="999.999.999-99" value={record.cpf} disabled style={{
            border: 'none',
            backgroundColor: 'transparent',
            width: 'auto',
            padding: '0 5px',
            fontSize: '14px',
            color: '#444',
          }} />;

        } else if (record.cnpj) {
          return <InputMask mask="99.999.999/9999-99" value={record.cnpj} disabled style={{
            border: 'none',
            backgroundColor: 'transparent',
            width: 'auto',
            padding: '0 5px',
            fontSize: '14px',
            color: '#444',
          }} />;
        } else {
          return null;
        }
      },
      sorter: (a, b) => {
        const valueA = a.cpf || a.cnpj || '';
        const valueB = b.cpf || b.cnpj || '';
        return valueA.localeCompare(valueB);
      },
    },
    {
      title: 'Ações',
      width: '10%',
      // dataIndex: 'data',
      key: 'action',
          render: (_, record) => (
              <Space size="middle">
              <Link to={'/client/' + record.id}>
                      <EditOutlinedIcon />
                  </Link>
                {
                  <Link to={'#'}>
                    <DeleteOutlinedIcon onClick={(e) => deleteEmb(record.id)} color='error'/>
                  </Link>
                }
              </Space>
          ),
    },
  ];

  return <Table columns={columns} dataSource={datas} />;

};
export default DataClientTable;