import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import firebase from "../../config/firebase";
import { Button, Table, Input, Radio } from "antd";
import "../client-list/client.css";
import NewMiniDrawer from "../../components/navMenu/menu-nav";

require("firebase/auth");

function PriceTableList() {
  const db = firebase.firestore();
  const [listTable, setListTable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const tableList = [];
    const result = await db.collection("priceTableAnnt").get();
    result.docs.forEach((doc) => {
      tableList.push({ id: doc.id, ...doc.data() });
    });
    setListTable(tableList);
    setLoading(false);
  };

  const handleInputChange = (value, record, field) => {
    const newData = listTable.map((item) =>
      item.id === record.id ? { ...item, [field]: value } : item
    );
    setListTable(newData);
  };

  const handleRadioChange = (record, fieldPrefix, selectedKey) => {
    const newData = listTable.map((item) => {
      const updatedItem = { ...item };
      [2, 3, 4, 5, 6, 7, 9].forEach((num) => {
        updatedItem[`is_utiliza_${fieldPrefix}${num}`] = false;
      });
      if (item.id === record.id) {
        updatedItem[`is_utiliza_${fieldPrefix}${selectedKey}`] = true;
      }
      return updatedItem;
    });
    setListTable(newData);
  };

  const updateFirestore = async () => {
    for (const record of listTable) {
      await db.collection("priceTableAnnt").doc(record.id).update(record);
    }
    fetchData();
  };

  const addNewRow = async () => {
    const newRow = {
      tipo: "Novo Tipo",
      ccd2: 0, is_utiliza_ccd2: false,
      ccd3: 0, is_utiliza_ccd3: false,
      ccd4: 0, is_utiliza_ccd4: false,
      ccd5: 0, is_utiliza_ccd5: false,
      ccd6: 0, is_utiliza_ccd6: false,
      ccd7: 0, is_utiliza_ccd7: false,
      ccd9: 0, is_utiliza_ccd9: false,
      cc2: 0, is_utiliza_cc2: false,
      cc3: 0, is_utiliza_cc3: false,
      cc4: 0, is_utiliza_cc4: false,
      cc5: 0, is_utiliza_cc5: false,
      cc6: 0, is_utiliza_cc6: false,
      cc7: 0, is_utiliza_cc7: false,
      cc9: 0, is_utiliza_cc9: false,
    };
    const docRef = await db.collection("priceTableAnnt").add(newRow);
    setListTable([...listTable, { id: docRef.id, ...newRow }]);
  };

  const columns = [
    {
      title: "Tipo de Carga",
      dataIndex: "tipo",
      key: "tipo",
      fixed: "left",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(e.target.value, record, "tipo")}
        />
      ),
    },
    {
      title: "Coeficiente de Custo",
      children: [
        {
          title: "Deslocamento (CCD) - R$/km",
          children: [2, 3, 4, 5, 6, 7, 9].map((num) => ({
            title: num,
            dataIndex: `ccd${num}`,
            key: `ccd${num}`,
            render: (text, record) => (
              <>
                <Input
                  value={text}
                  onChange={(e) =>
                    handleInputChange(parseFloat(e.target.value), record, `ccd${num}`)
                  }
                />
                <Radio
                  checked={record[`is_utiliza_ccd${num}`] || false}
                  onChange={() => handleRadioChange(record, "ccd", num)}
                />
              </>
            ),
          })),
        },
        {
          title: "Carga e Descarga (CC) - R$",
          children: [2, 3, 4, 5, 6, 7, 9].map((num) => ({
            title: num,
            dataIndex: `cc${num}`,
            key: `cc${num}`,
            render: (text, record) => (
              <>
                <Input
                  value={text}
                  onChange={(e) =>
                    handleInputChange(parseFloat(e.target.value), record, `cc${num}`)
                  }
                />
                <Radio
                  checked={record[`is_utiliza_cc${num}`] || false}
                  onChange={() => handleRadioChange(record, "cc", num)}
                />
              </>
            ),
          })),
        },
      ],
    },
  ];

  return (
    <>
      {useSelector((state) => state.usuarioLogado) > 0 ? (
        <NewMiniDrawer
          divOpen={
            <>
              <Table
                columns={columns}
                dataSource={listTable}
                bordered
                pagination={false}
                scroll={{ x: "100%" }}
                loading={loading}
                rowKey="id"
              />
              <Button onClick={addNewRow} type="primary" style={{ marginTop: 16 }}>
                Adicionar Nova Linha
              </Button>
              <Button onClick={updateFirestore} type="primary" style={{ marginLeft: 16 }}>
                Salvar
              </Button>
            </>
          }
        />
      ) : (
        <Navigate to="/login" />
      )}
    </>
  );
}

export default PriceTableList;


// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { Navigate} from "react-router-dom";
// import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
// import firebase from '../../config/firebase';
// import { Button, Table } from "antd";

// import '../client-list/client.css';
// require('firebase/auth')

// function PriceTableList(){
//     const db = firebase.firestore();
//     const [listTable, setListTable] = useState([]);
//     const [carregando, setCarregando] = useState(1);
        

//     useEffect(() => {

//         var tableList = [];

//         db.collection('priceTableAnnt')
//         .get().then( async (result) => {

//             result.docs.forEach(doc => {


//                 console.log(doc.data())

//                 // tableList.push({
//                 //         id: doc.id,
//                 //         ...doc.data()
//                 //     });
//                 })

//             setListTable(tableList)
//             setCarregando(0)
//         }).catch(error => {
//             setCarregando(0)
//             console.log(error)
//         });
         
//     },[carregando]);


//     const columns = [
//         {
//           title: 'Tipo de Carga',
//           dataIndex: 'tipo',
//           key: 'tipo',
//           fixed: 'left',
//         },
//         {
//           title: 'Coeficiente de Custo',
//           children: [
//             {
//               title: 'Deslocamento (CCD) - R$/km',
//               dataIndex: 'ccd',
//               key: 'ccd',
//               children: [
//                 { title: '2', dataIndex: 'ccd2', key: 'ccd2' },
//                 { title: '3', dataIndex: 'ccd3', key: 'ccd3' },
//                 { title: '4', dataIndex: 'ccd4', key: 'ccd4' },
//                 { title: '5', dataIndex: 'ccd5', key: 'ccd5' },
//                 { title: '6', dataIndex: 'ccd6', key: 'ccd6' },
//                 { title: '7', dataIndex: 'ccd7', key: 'ccd7' },
//                 { title: '9', dataIndex: 'ccd9', key: 'ccd9' },
//               ],
//             },
//             {
//               title: 'Carga e Descarga (CC) - R$',
//               dataIndex: 'cc',
//               key: 'cc',
//               children: [
//                 { title: '2', dataIndex: 'cc2', key: 'cc2' },
//                 { title: '3', dataIndex: 'cc3', key: 'cc3' },
//                 { title: '4', dataIndex: 'cc4', key: 'cc4' },
//                 { title: '5', dataIndex: 'cc5', key: 'cc5' },
//                 { title: '6', dataIndex: 'cc6', key: 'cc6' },
//                 { title: '7', dataIndex: 'cc7', key: 'cc7' },
//                 { title: '9', dataIndex: 'cc9', key: 'cc9' },
//               ],
//             },
//           ],
//         },
//       ];
      
//       const data = [
//         {
//           key: '1',
//           tipo: 'Carga Geral',
//           ccd2: 3.6255, ccd3: 4.5930, ccd4: 5.2636, ccd5: 5.6013, ccd6: 6.2628, ccd7: 7.2119, ccd9: 8.1626,
//           cc2: 404.6700, cc3: 493.2500, cc4: 541.3300, cc5: 498.0400, cc6: 532.1300, cc7: 728.7400, cc9: 789.4100,
//         }
//         // Adicione os outros tipos de carga aqui...
//       ];



//       const saveDataToFirestore = async () => {
//         const data = 
//             {
//               key: '1',
//               tipo: 'Carga Geral',
//               ccd2: 3.6255, ccd3: 4.5930, ccd4: 5.2636, ccd5: 5.6013, ccd6: 6.2628, ccd7: 7.2119, ccd9: 8.1626,
//               cc2: 404.6700, cc3: 493.2500, cc4: 541.3300, cc5: 498.0400, cc6: 532.1300, cc7: 728.7400, cc9: 789.4100,
//             }
            
//           // Adicione os outros tipos de carga aqui...      
//         db.collection("priceTableAnnt").add(data).then(() => {
//             // setCarregando(0)
//             // setMsgTipo('sucesso')
            
//         }).catch(error => {
//             // setMsgTipo('erro')
//             // setCarregando(0)
//             // setTitle(' Ops!')
//             // setMsg('Houve um problema interno ao recuperar os dados do Embarcador');
//             // setOpen(true)
//         });

//       };


//     return(
//         <>
//             { 
//                 useSelector(state => state.usuarioLogado) > 0 ? 
//                     <PersistentDrawerLeft divOpen={
                        
//                       <>
//                         <Table 
//                         columns={columns} 
//                         dataSource={data} 
//                         bordered 
//                         pagination={false}
//                         scroll={{ x: '100%' }}
//                       />

//                       <Button onClick={saveDataToFirestore}>Salvar</Button>
//                       </>  


//                 }/>
//                 : 
//                 <Navigate to='/login' />
//             }
//         </>
//     );
// }

// export default PriceTableList;