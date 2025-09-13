import React, { useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { Button, Input, Space, Table } from 'antd';
import { Link} from "react-router-dom";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useSelector } from 'react-redux';
import InputMask from 'react-input-mask';
import SendIcon from '@mui/icons-material/Send';
import firebase from '../../config/firebase';
import mdfeService from '../../service/mdfe.service';
import pdf from '../../service/pdf.service';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const filePDF = '/brand/ContratoLocacaoVeiculoOperador-FortioFormatado.pdf';

require('firebase/auth')

const DataMdfeTable = ({data}) => {
  data.sort((a, b) => {
      return b.accountCreated?.seconds - a.accountCreated?.seconds || b.accountCreated?.nanoseconds - a.accountCreated?.nanoseconds;
    });
  
    const user = useSelector(state => state.user)
  
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [datas, setData] = useState([]);
  
  
    const fetchData = async () => {
      const snapshot = await firebase.firestore().collection('drivers_users')
      .where("uidShipper", "==", user.uidShipper).get();
      const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      documents.sort((a, b) => {
        return b.accountCreated.seconds - a.accountCreated.seconds || b.accountCreated.nanoseconds - a.accountCreated.nanoseconds;
      });
      setData(documents);
    };
  
    
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
  
  
    function deleteMdfe(id){
      if (user.perfil === "Master") {
  
        var result = window.confirm("Deseja mesmo excluir esse MDFe ? ");
        if (result === true) {
            firebase.firestore()
            .collection('mdfe')
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


    const  sendMdfe = async (idMdfe) => {

        await mdfeService.sendMdfe(idMdfe);

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
          console.log(`Record status: ${record[dataIndex]}, Cleaned value: ${cleanedValue}`);
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
        title: 'Motorista',
        dataIndex: ['driver', 'nameDriver'],
        key: 'nameDriver',
        width: '30%',
        ...getColumnSearchProps(['driver', 'nameDriver']),
        sorter: (a, b) => {
          const nameA = a.driver?.nameDriver || '';
          const nameB = b.driver?.nameDriver || '';
          return nameA.localeCompare(nameB);
        },
      },
      {
        title: 'Contrato',
        dataIndex: ['infoMdfe', 'numberContract'],
        key: 'numberContract',
        width: '10%',
        ...getColumnSearchProps(['infoMdfe', 'numberContract']),
        sorter: (a, b) => {
          const nameA = a.infoMdfe?.numberContract || '';
          const nameB = b.infoMdfe?.numberContract || '';
          return nameA.localeCompare(nameB);
        },
      },
      {
        title: 'Serie',
        dataIndex: ['infoMdfe', 'serie'],
        key: 'serie',
        width: '10%',
        ...getColumnSearchProps(['infoMdfe', 'serie']),
        sorter: (a, b) => {
          const nameA = a.infoMdfe?.serie || '';
          const nameB = b.infoMdfe?.serie || '';
          return nameA.localeCompare(nameB);
        },
      },
      {
        title: 'Emitente',
        dataIndex: ['infoEmit', 'cnpjIssuer'],
        key: 'cnpjIssuer',
        width: '20%',
        ...getColumnSearchProps(['infoEmit', 'cnpjIssuer']),
        sorter: (a, b) => {
          const nameA = a.infoEmit?.cnpjIssuer || '';
          const nameB = b.infoEmit?.cnpjIssuer || '';
          return nameA.localeCompare(nameB);
        },
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
        title: 'Número',
        dataIndex: ['infoMdfe', 'number'],
        key: 'number',
        ...getColumnSearchProps(['infoMdfe', 'number']),
        sorter: (a, b) => {
          const nameA = a.infoMdfe?.number || '';
          const nameB = b.infoMdfe?.number || '';
          return nameA.localeCompare(nameB);
        },
      },
      {
        title: 'Valor total',
        dataIndex: ['infoCargo', 'totalValueCargo'],
        key: 'totalValueCargo',
        ...getColumnSearchProps(['infoCargo', 'totalValueCargo']),
        render: (_, value) => (
          <span>
            {value.infoCargo.totalValueCargo}
          </span>
        ),
        sorter: (a, b) => {
          const nameA = a.infoCargo?.totalValueCargo || '';
          const nameB = b.infoCargo?.totalValueCargo || '';
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
                  <Link to={'/insertMdfe/' + record.id}>
                        <EditOutlinedIcon />
                    </Link>
                  {
                    <Link to={'#'}>
                      <DeleteOutlinedIcon onClick={(e) => deleteMdfe(record.id)} color='error'/>
                    </Link>
                  }
                  {
                    <Link to={'#'}>
                      <SendIcon title={"Enviar MDFe"} onClick={(e) => sendMdfe(record.id)} color='primary'/>
                    </Link>
                  }
                  {
                    <Button
                      id="previewFrame"
                      type="link"
                      icon={<FileDownloadIcon />}
                      onClick={() => pdf.processPDF(record, filePDF)}
                    >
                    </Button>
                  }
                </Space>
            ),
      },
    ];
    return <Table columns={columns} dataSource={data} />;

};
export default DataMdfeTable;