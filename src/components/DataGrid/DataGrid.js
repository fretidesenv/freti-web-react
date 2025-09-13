import { useState, useRef } from 'react';
import { Input, Button, Space, Table, Tooltip } from 'antd';
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import './datagrid.css';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DatePickerMenu from '../dataPicker/dataPickerMenu';
import moment from 'moment';

export default function DataGrid({ columns, rows, onItemsSelected, handleOpenUpdateProvider, handleDeleteDocumentProvider , totalVolumesSelect, totalPesosSelect , totalValorNFSelect }) {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const [dateRange, setDateRange] = useState([]);

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

  const cellClassName = (record) => {
    return record.id === "total" ? 'last-row' : '';
  };

  const handleSelectionChange = (selectedRowKeys, selectedRows) => {
    // Filtra os itens selecionados, excluindo o total
    const filteredSelectedItems = selectedRows.filter(row => row && row.id !== "total");

    // Atualiza o estado com os IDs das linhas selecionadas
    setSelectedRowKeys(selectedRowKeys);

    // Chama a função externa se existir, passando os itens selecionados
    if (onItemsSelected) {
      onItemsSelected(filteredSelectedItems);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectionChange,
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      if (dataIndex === 'cpfCnpj') {
        const cleanValue = value.replace(/[^\w]/g, '').trim();
        return (
          (record.cpf && record.cpf.toString().replace(/[^\w]/g, '').toLowerCase().includes(cleanValue.toLowerCase())) ||
          (record.cnpj && record.cnpj.toString().replace(/[^\w]/g, '').toLowerCase().includes(cleanValue.toLowerCase()))
        );
      } else if (dataIndex === 'pesoB' || dataIndex === 'vNF') {
        // Remove as pontuações (pontos, vírgulas) para comparar os valores numéricos
        const cleanValue = value.replace(/[^\d]/g, ''); // Remove tudo que não é dígito
        const cleanRecordValue = record[dataIndex]?.toString().replace(/[^\d]/g, ''); // Remove pontuações no valor do record
        return cleanRecordValue.includes(cleanValue); // Faz a comparação sem pontuações
      } else if (typeof value === 'string') {
        return record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase());
      } else {
        return record[dataIndex] === value;
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
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
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
      const dateColeta = new Date(record.dhEmi);

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

  const antColumns = columns.map(col => {
    let sorterFunction = null;
  
  if (col.type === 'string') {
    sorterFunction = (a, b) => {
      if (a.id === 'total') return 1;
      if (b.id === 'total') return -1;

      const valA = a[col.field] || '';
      const valB = b[col.field] || '';
      return valA.localeCompare(valB);
    };
  } else if (col.type === 'number') {
    sorterFunction = (a, b) => {
      if (a.id === 'total') return 1;
      if (b.id === 'total') return -1;

      return (a[col.field] || 0) - (b[col.field] || 0);
    };
  }

    return {
      title: col.headerName,
      dataIndex: col.field,
      key: col.field,
      align: col.align,
      sorter: sorterFunction,
      ...(col.field === 'dhEmi' && getColumnSearchPropsDate()),
      ...(col.field === 'nNF' && getColumnSearchProps('nNF')),
      ...(col.field === 'nameEmit' && getColumnSearchProps('nameEmit')),
      ...(col.field === 'nameDest' && getColumnSearchProps('nameDest')),
      ...(col.field === 'qVol' && getColumnSearchProps('qVol')),
      ...(col.field === 'pesoB' && getColumnSearchProps('pesoB')),
      ...(col.field === 'vNF' && getColumnSearchProps('vNF')),
      ...(col.field === 'observation' && getColumnSearchProps('observation')),
      render: (text, record) => {
        if (col.field !== "actions" && !text) return '';
        if (col.type === 'date') {
          return moment(text).format('DD/MM/YYYY');
        }
        if (col.field === "observation") {
          return (
            <Tooltip title={text}>
              <span>
                {text.length > 50 ? `${text.slice(0, 15)}...` : text}
              </span>
            </Tooltip>
          );
        }
        if (col.field === 'pesoB' ) {
          // Verifica se o valor é um número e formata de acordo
          const pesoBFormatted = Number(text).toLocaleString('pt-BR', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          });
          return pesoBFormatted;
        }
        if (col.field === 'vNF' ) {
          // Verifica se o valor é um número e formata de acordo
          const pesoBFormatted = Number(text).toLocaleString('pt-BR', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          });
          return pesoBFormatted;
        }
        if (col.field === "actions") {
          if (record.id === 'total') {
            return null;
          }
          return (
            <div style={{ display: 'flex', gap: 4 }}>
              <Button
                type="text"
                icon={<EditOutlinedIcon />}
                onClick={() => handleOpenUpdateProvider(record)}
              />
              <Button
                type="text"
                icon={<DeleteOutlinedIcon />}
                danger
                onClick={() => handleDeleteDocumentProvider(record.id)}
              />
            </div>
          );
        }
        return text;
      },
      width: col.maxWidth || 150,
    };
  });

  return (
    <div className="datagrid-wrapper">
      <Table
        rowKey="id"
        columns={antColumns}
        dataSource={rows}
        rowSelection={rowSelection}
        pagination={{ pageSize: 25 }}
        onRow={(record) => ({
          className: cellClassName(record),
        })}
        defaultSortOrder="desc"
        footer={() => (
          <h5>
            <b>Volumes:</b> {totalVolumesSelect}{" "}
            <b>Peso:</b> {totalPesosSelect}{" "}
            <b>ValorNF:</b> {totalValorNFSelect}
          </h5>
        )}
      />
    </div>
  );
}
