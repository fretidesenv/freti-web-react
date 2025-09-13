import { Table } from 'antd';
import { useState } from 'react';

const CompTableMdfe = ({data, rowSelection}) => {
    
  const [selectionType, setSelectionType] = useState('checkbox');
 
    const columns = [
        {
            title: 'Numero Nfe',
            dataIndex: 'numeroNfe',
        },
        {
            title: 'Chave',
            dataIndex: 'chave',
        },
        {
            title: 'Valor NF',
            dataIndex: 'valorNf',
        },
        {
            title: 'Peso Liquido',
            dataIndex: 'pesoL',
        },
        {
            title: 'Peso Bruto',
            dataIndex: 'pesoB',
        }

    ];

  return (
    <div>
        <Table
            rowKey={(_, index) => index}
            rowSelection={{ type: selectionType, ...rowSelection }}
            columns={columns}
            dataSource={data}
        />
    </div>
  );
};
export default CompTableMdfe;