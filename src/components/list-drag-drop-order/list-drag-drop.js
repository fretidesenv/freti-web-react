import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function GruposOrdenaveis({onSave, initialGroups = []}) {

    const [grupos, setGrupos] = useState([]);

    // Sincroniza o estado local com initialGroups quando ele mudar
    useEffect(() => {
        if (initialGroups && initialGroups.length > 0) {
            setGrupos(initialGroups);
        }
    }, [initialGroups]);

  // Quando o usuário solta o item
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(grupos);
    const [reordenado] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordenado);
    setGrupos(items);
    
    // Chama onSave automaticamente após reordenar
    const resultado = items.map((g, index) => ({
      id: g.id || g.idGroup, // Mantém compatibilidade com ambos formatos
      idGroup: g.id || g.idGroup,
      order: index + 1,
      name: g.data ? g.data().name : g.name,
      active: (index + 1) == 1 ? true : false,
      date_include: new Date()
    }));

    console.log("Nova ordem dos grupos:", resultado);
    onSave(resultado);
  };


  return (
    <Box sx={{ width: "100%", maxWidth: 400 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, color: "text.secondary" }}>
        Ordenar Grupos
      </Typography>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="grupos">
          {(provided) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{
                bgcolor: "transparent",
              }}
            >
              {grupos && grupos.length > 0 &&  grupos.map((grupo, index) => {
                // Garante compatibilidade com diferentes formatos
                const grupoId = grupo.id || grupo.idGroup || `grupo-${index}`;
                const grupoNome = grupo.data ? grupo.data().name : grupo.name;
                
                return (
                  <Draggable
                    key={grupoId}
                    draggableId={grupoId}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          mb: 1,
                          bgcolor: snapshot.isDragging
                            ? "primary.light"
                            : "grey.50",
                          border: snapshot.isDragging ? "2px solid" : "1px solid transparent",
                          borderColor: snapshot.isDragging ? "primary.main" : "grey.200",
                          borderRadius: 1,
                          cursor: "grab",
                          transition: "all 0.2s ease-in-out",
                          transform: snapshot.isDragging ? "rotate(2deg)" : "rotate(0deg)",
                          boxShadow: snapshot.isDragging 
                            ? "0 4px 12px rgba(0,0,0,0.15)" 
                            : "0 1px 3px rgba(0,0,0,0.08)",
                          "&:hover": {
                            bgcolor: "grey.100",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <ListItemText 
                          primary={grupoNome}
                          sx={{
                            "& .MuiListItemText-primary": {
                              fontWeight: snapshot.isDragging ? 500 : 400,
                              color: snapshot.isDragging ? "primary.dark" : "text.primary",
                            }
                          }}
                        />
                      </ListItem>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}
