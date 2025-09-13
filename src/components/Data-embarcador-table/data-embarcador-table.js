import { SearchOutlined } from '@ant-design/icons';
import React, { useRef, useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import { Button, Input, Space, Table } from 'antd';
import { Link, useNavigate} from "react-router-dom";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import firebase from '../../config/firebase';
import { useSelector } from 'react-redux';
import InputMask from 'react-input-mask';
require('firebase/auth')

const DataEmbarcadorTable = ({data}) => {

  let navigate = useNavigate();
  const user = useSelector(state => state.user)

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [datas, setData] = useState([]);
  const searchInput = useRef(null);
  
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const fetchData = async () => {
    const snapshot = await firebase.firestore().collection('shipper').get();
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // documents.sort((a, b) => {
    //   return b.accountCreated.seconds - a.accountCreated.seconds || b.accountCreated.nanoseconds - a.accountCreated.nanoseconds;
    // });
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

    var result = window.confirm("Deseja mesmo excluir esse embarcador ? ");
      if (result === true) {
        
        firebase.firestore()
          .collection('shipper')
          .doc(id)
          .delete()
          .then(() => {
            alert("Documento excluído com sucesso!");
            fetchData();
          });
      } else {
        return;
      }
    }else{
      alert("Você não tem privilégio suficiente para excluir um Embarcador, contate algum usuário master.")
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

      if (dataIndex === 'documentNumber') {
        const cleanValue = value.replace(/[^\w]/g, '').trim();

        const documentNumber = record.dataPersonal.documentNumber
          ? record.dataPersonal.documentNumber.toString().replace(/[^\w]/g, '').toLowerCase().trim()
          : '';

        return documentNumber.includes(cleanValue.toLowerCase());
      }
      else if (dataIndex === 'socialName') {
        return (
          (record.dataPersonal.socialName && record.dataPersonal.socialName.toString().toLowerCase().includes(value.toLowerCase()))
        );
      }
      else if(dataIndex === 'nameFantasy'){
        return (
          (record.dataPersonal.nameFantasy && record.dataPersonal.nameFantasy.toString().toLowerCase().includes(value.toLowerCase()))
        );
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
      title: 'Razão Social',
      dataIndex: 'socialName',
      key: 'socialName',
      width: '30%',
      ...getColumnSearchProps('socialName'),
      render: (_, record) => (
        <span>
          {record.dataPersonal.socialName}
        </span>
      ),
      sorter: (a, b) => {
        const nameA = a.dataPersonal?.socialName || '';
        const nameB = b.dataPersonal?.socialName || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Nome Fantasia',
      dataIndex: 'nameFantasy',
      key: 'nameFantasy',
      width: '30%',
      ...getColumnSearchProps('nameFantasy'),
      render: (_, record) => (
        <span>
          {record.dataPersonal.nameFantasy}
        </span>
      ),
      sorter: (a, b) => {
        const nameA = a.dataPersonal?.nameFantasy || '';
        const nameB = b.dataPersonal?.nameFantasy || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'CNPJ',
      dataIndex: 'documentNumber',
      key: 'documentNumber',
      ...getColumnSearchProps('documentNumber'),
      render: (_, record) => (
        <span>
          <InputMask mask="99.999.999/9999-99" value={record.dataPersonal.documentNumber} disabled style={{
          border: 'none',
          backgroundColor: 'transparent',
          width: 'auto',
          padding: '0 5px',
          fontSize: '14px',
          color: '#444',
        }}/>
        </span>
      ),
      sorter: (a, b) => {
        const nameA = a.dataPersonal?.documentNumber || '';
        const nameB = b.dataPersonal?.documentNumber || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Ações',
      width: '10%',
      // dataIndex: 'data',
      key: 'action',
          render: (_, record) => (
              <Space size="middle">
                <Link to={'/newEmbarcador/' + record.id}>
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
export default DataEmbarcadorTable;