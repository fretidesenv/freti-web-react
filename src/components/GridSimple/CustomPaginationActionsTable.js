import React, { useRef, useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { Button, Input, Space, Table } from 'antd';
import { Link, useNavigate} from "react-router-dom";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import firebase from '../../config/firebase';
import { useSelector } from 'react-redux';
import { render } from '@testing-library/react';
import InputMask from 'react-input-mask';
import Stack from '@mui/material/Stack';
import { Chip } from '@mui/material';
import { Tooltip } from 'antd';
require('firebase/auth')

const CustomPaginationActionsTable = ({data}) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [datas, setData] = useState([]);
  const searchInput = useRef(null);

  const user = useSelector(state => state.user)

  let navigate = useNavigate();

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const fetchData = async () => {

    var snapshot = "";

    if(user.perfil == "Master"){
          snapshot = await firebase.firestore().collection('user_web')
                  .get();

    } else {
          snapshot = await firebase.firestore().collection('user_web')
                  .where('uidShipper', '==' , user?.uidShipper)
                  .get();
    }
                    
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

      var result = window.confirm("Deseja mesmo excluir ? ");
        if (result === true) {
          
          firebase.firestore()
          .collection('user_web')
          .doc(id)
          .delete()
          .then(() => {
            alert("Usuario excluído com sucesso!");
            fetchData();
          })
        } else {
          return;
        }
    }else{
      alert("Você não tem privilégio suficiente para excluir um Cliente, contate algum usuário master.")
    }
  };

  function renderStatusColor(status) {
    const chipStyle = {
      minWidth: '100px',
      maxWidth: '150px',
      // overflow: 'hidden', // Esconde o texto que excede a largura máxima
      // textOverflow: 'ellipsis', // Adiciona "..." ao final do texto que excede a largura
      // whiteSpace: 'nowrap', // Impede a quebra de linha
    };

    const commonChip = (label, color) => (
      <Stack direction="row" spacing={1}>
        <Chip label={label} color={color} style={chipStyle} />
      </Stack>
    );

    switch (status) {
      case 'Ativo':
        return commonChip(status, 'primary');
      case 'Inativo':
        return commonChip(status, 'warning');
      default:
        return commonChip(status, 'warning');
    }
  }

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
          position: dataIndex === 'name' ? 'relative' : '',
          left: dataIndex === 'name' ? '60px' : '0px',
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

      if (dataIndex === 'cpf') {
        const cleanValue = value.replace(/[^\w]/g, '').trim();

        const documentNumber = record.cpf
          ? record.cpf.toString().replace(/[^\w]/g, '').toLowerCase().trim()
          : '';

        return documentNumber.includes(cleanValue.toLowerCase());
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
      width: '15%',
      ...getColumnSearchProps('name'),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'CPF',
      dataIndex: 'cpf',
      key: 'cpf',
      width: '15%',
      ...getColumnSearchProps('cpf'),
      sorter: (a, b) => a.cpf.localeCompare(b.cpf),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '20%',
      ...getColumnSearchProps('email'),
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Telefone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      ...getColumnSearchProps('phoneNumber'),
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: 'Perfil',
      dataIndex: 'perfil',
      key: 'perfil',
      ...getColumnSearchProps('perfil'),
      sorter: (a, b) => a.perfil.localeCompare(b.perfil),
    },
    {
      title: 'Status',
      dataIndex: 'ativo',
      key: 'ativo',
      ...getColumnSearchProps('ativo'),
      render: (ativo) => {
        const describeText = ativo;
        return (
          <Tooltip title={ativo}>
            <div>
              {renderStatusColor(describeText)}
            </div>
          </Tooltip>
        );
      },
      sorter: (a, b) => a.ativo.localeCompare(b.ativo),
    },
    {
      title: 'Ações',
      width: '10%',
      // dataIndex: 'data',
      key: 'action',
          render: (_, record) => (
              <Space size="middle">
              <Link to={'/newUser/' + record.id}>
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
export default CustomPaginationActionsTable;