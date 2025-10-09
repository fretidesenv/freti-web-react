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
require('firebase/auth')

const DataGroupTable = ({data}) => {

  const db = firebase.firestore();

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  // const [datas, setData] = useState([]);
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

  const user = useSelector(state => state.user)

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };



  const deleteGroup = () => {

    console.log(recordInput)

    if(user.perfil === "Master") {
          
          db
          .collection('group')
          .doc(recordInput.id)
          .delete()
          .then(() => {
            setOpenDialog(true);
            setStatusDialog('success')
            setTitleDialog("Muito bem!")
            setMessageDialog("Grupo excluído com sucesso!")
            // fetchData();
          })
        } else {
          return;
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
    setMessageDialogYesOrNo("Tem certeza que deseja deletar este grupo " + record.name + "?")

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

    onFilter: (value, record) => { 
      return record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase());
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
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      width: '15%',
    },
    {
      title: 'Ativo',
      dataIndex: 'active',
      key: 'active',
      width: '15%',
      render: (ativo) => (ativo ? 'Sim' : 'Não'), // Exibindo texto "Sim" ou "Não"
    },

    {
      title: 'Ações',
      width: '10%',
      // dataIndex: 'data',
      key: 'action',
          render: (_, record) => (
              <Space size="middle">
                  <Link to={'/insertGroup/' + record.id}>
                      <EditOutlinedIcon />
                  </Link>
                {
                  <Link to={'#'}>
                    <DeleteOutlinedIcon onClick={(e) => deleteEmb(record)} color='error'/>
                  </Link>
                }
              </Space>
          ),
    },
  ];

  return(
      <>
        <DialogConfirme 
            open={openDialogYesOrNo} 
            handleClose={handleDialogCloseYesOrNo}
            input={recordInput}
            handleOk={deleteGroup}
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

        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id"
          pagination={{ pageSize: 25 }}
        />

      </>
  ) 

};
export default DataGroupTable;