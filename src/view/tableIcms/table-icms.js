import React, { useState, useEffect } from 'react';
import { Table, InputNumber, Button, message } from 'antd';
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import firebase from '../../config/firebase';
import NewMiniDrawer from '../../components/navMenu/menu-nav';
require('firebase/auth');

const db = firebase.firestore();

const states = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RN', 'RS', 
  'RJ', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Função para gerar objeto padrão para uma origem
const createRowData = (origem) => ({
  key: origem,
  origem,
  ...Object.fromEntries(states.map(destino => [destino, 12])),
  docId: null
});

export default function PriceTableICMS() {
  const [data, setData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Carrega os dados do Firestore quando o componente monta
  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await db.collection("PriceTableIcms").get();
        if (snapshot.empty) {
          // Se não existir dados, inicializa com dados padrão
          const initialData = states.map(origem => createRowData(origem));
          setData(initialData);
        } else {
          // Converte os documentos do Firestore em um array e mapeia pelo campo "origem"
          const loadedData = [];
          snapshot.forEach(doc => {
            const docData = doc.data();
            // Se já existir um registro para a mesma origem, você pode decidir como mesclar.
            // Aqui, assumiremos que cada origem deve ser única.
            loadedData.push({ ...docData, docId: doc.id, key: docData.origem });
          });
          // Caso falte alguma origem, adiciona com dados padrão
          states.forEach(origem => {
            if (!loadedData.find(item => item.origem === origem)) {
              loadedData.push(createRowData(origem));
            }
          });
          // Ordena conforme a ordem dos estados
          loadedData.sort((a, b) => states.indexOf(a.origem) - states.indexOf(b.origem));
          setData(loadedData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        message.error("Erro ao carregar dados do Firestore.");
      }
    };

    fetchData();
  }, []);

  const toggleEditMode = () => {
    setIsEditing(prev => !prev);
  };

  const handleChange = (value, origem, destino) => {
    setData(prevData =>
      prevData.map(row =>
        row.origem === origem ? { ...row, [destino]: value } : row
      )
    );
  };

  // Atualiza ou adiciona os dados no Firestore
  const saveOrUpdateData = async () => {
    try {
      const updatedData = await Promise.all(
        data.map(async (row) => {
          // Prepara os dados sem a chave "key" (opcional) e sem "docId"
          const { key, docId, ...rowData } = row;
          if (docId) {
            // Atualiza o registro existente
            console.log(`Atualizando documento ${docId} para origem ${row.origem}`);
            await db.collection("PriceTableIcms").doc(docId).update(rowData);
            return row;
          } else {
            // Adiciona novo registro
            const docRef = await db.collection("PriceTableIcms").add(rowData);
            console.log(`Criado novo documento ${docRef.id} para origem ${row.origem}`);
            return { ...row, docId: docRef.id };
          }
        })
      );
      setData(updatedData);
      message.success("Dados salvos/atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar/atualizar dados:", error);
      message.error("Houve um problema ao salvar os dados.");
    }
  };

  const columns = [
    {
      title: 'Origem/Destino',
      dataIndex: 'origem',
      key: 'origem',
      fixed: 'left',
    },
    ...states.map(destino => ({
      title: destino,
      dataIndex: destino,
      key: destino,
      render: (value, record) => (
        <InputNumber
          min={0}
          max={100}
          value={value}
          onChange={(val) => isEditing && handleChange(val, record.origem, destino)}
          formatter={value => `${value}%`}
          parser={value => value.replace('%', '')}
          disabled={!isEditing}
        />
      )
    }))
  ];

  return (
    <>
      {useSelector(state => state.usuarioLogado) > 0 ? (
        <NewMiniDrawer
          divOpen={
            <>
              <div style={{ marginBottom: 20 }}>
                <Button type="primary" onClick={toggleEditMode}>
                  {isEditing ? 'Finalizar Edição' : 'Editar Valores'}
                </Button>
              </div>
              <Table
                dataSource={data}
                columns={columns}
                scroll={{ x: 1500 }}
                pagination={false}
                bordered
              />
              <div style={{ marginTop: 20 }}>
                <Button type="primary" onClick={saveOrUpdateData}>
                  Salvar Dados
                </Button>
              </div>
            </>
          }
        />
      ) : (
        <Navigate to='/login' />
      )}
    </>
  );
}
