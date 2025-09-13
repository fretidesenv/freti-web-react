import { useState } from 'react'
import { AiFillFileImage } from "react-icons/ai";
import {DataGrid as MuiDataGrid, GridToolbar, GridToolbarContainer, GridToolbarFilterButton} from "@mui/x-data-grid";
import { ptBR } from '@mui/x-data-grid/locales/ptBR';
import './datagrid.css'

const ReportRenderToolbar = () => {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
    </GridToolbarContainer>
  );
};

export default function DataGrid({columns, rows, onItemsSelected}) {
  
  const [selectedRows, setSelectedRows] = useState([]);

  const cellClassName = (params) => {
    return params.id === "total" ? 'last-row' : '';
  };
  

  const handleSelectionChange = (selectionModel) => {

    // Atualiza o estado com os IDs das linhas selecionadas
    // setSelectedRows(selectionModel);

    // Exemplo de como encontrar os itens selecionados com base nos IDs
    const selectedItems = rows.filter((row) => {
      // Verifica se o ID da linha é diferente de "total" para que não selecione o row total e faça a soma.
      return row.id !== "total" && selectionModel.includes(row.id);
    });
        
    // Chama a função externa"Se existir", passando os itens selecionados.
    if (onItemsSelected) {
      onItemsSelected(selectedItems);
    }
  };

  return (
    <div
      className={"datagrid-wrapper"}
    >
      <MuiDataGrid
        rows={rows}
        columns={columns}
        className={"datagrid-component"}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        checkboxSelection
        onSelectionModelChange={handleSelectionChange}
        disableSelectionOnClick
        sortModel={[
          {
            field: "dhEmi",
            sort: "desc",
          },
        ]}
        disableColumnMenu
        getRowId={(row) => row.id}
        cellClassName={cellClassName}
        components={{
          Toolbar: ReportRenderToolbar,
        }}
        componentsProps={{
          header:{
            style: {
              textAlign: "center"
            }
          },
          toolbar: {
            style: {
              textAlign: "center"
            }
          }
        }}
        pageSize={25}
      />
    </div>
    
  );
}