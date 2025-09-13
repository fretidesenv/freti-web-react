import React from 'react';
import { Button } from 'antd';
import InputMask from 'react-input-mask';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

const ReboqueAdicional = ({ 
    reboque, 
    index, 
    onRemove, 
    onUpdate,
    handleClickOpen,
    setOrigem,
    handleDelete
}) => {
    const handleChange = (field, value) => {
        onUpdate(index, field, value);
    };

    return (
        <div className="reboque-adicional" style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '15px' }}>
            <div className="row">
                <div className="col-12">
                    <h5>Reboque Adicional #{index + 1}</h5>
                    <IconButton
                        aria-label="Remover Reboque"
                        size="small"
                        color="error"
                        onClick={() => onRemove(index)}
                        style={{ float: 'right', marginTop: '-30px' }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </div>
            </div>

            <div className="row">
                <div className="col-2">
                    <label htmlFor={`placaReboque${index}`} className="form-label">Placa Reboque</label>
                    <input 
                        type="text" 
                        onChange={(e) => handleChange('placaReboque', e.target.value)} 
                        value={reboque.placaReboque || ''} 
                        className="form-control" 
                        id={`placaReboque${index}`} 
                    />
                </div>
                <div className="col-2">
                    <label htmlFor={`renavamReboque${index}`} className="form-label">Renavam Reboque</label>
                    <input 
                        type="text" 
                        onChange={(e) => handleChange('renavamReboque', e.target.value)} 
                        value={reboque.renavamReboque || ''} 
                        className="form-control" 
                        id={`renavamReboque${index}`}
                    />
                </div>
                <div className="col-2">
                    <label htmlFor={`ufReboque${index}`} className="form-label">UF Reboque</label>
                    <input 
                        type="text" 
                        onChange={(e) => handleChange('ufReboque', e.target.value)} 
                        value={reboque.ufReboque || ''} 
                        className="form-control" 
                        id={`ufReboque${index}`}
                    />
                </div>
                <div className="col-2">
                    <div>
                        <label tabIndex={"0"} id={`cnhReboque${index}`} htmlFor={`cnhReboque${index}`} className="form-label">CNH Reboque</label>
                    </div>
                    {
                        reboque.cnhReboque ? (
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                <li
                                    style={{
                                        background: "#f8f9fa",
                                        border: "1px solid #e0e0e0",
                                        borderRadius: "8px",
                                        padding: "2px 3px",
                                        marginBottom: "4px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                        transition: "all 0.3s ease"
                                    }}
                                >
                                    <a
                                        href={reboque.cnhReboque}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            width: "100%",
                                            textDecoration: "none",
                                            color: "#007bff",
                                            fontWeight: 500,
                                            marginRight: 10,
                                            padding: "6px 14px",
                                            borderRadius: 6,
                                            background: "linear-gradient(90deg, #e3f0ff 0%, #f6faff 100%)",
                                            boxShadow: "0 2px 8px rgba(0,123,255,0.08)",
                                            transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                                            display: "inline-block",
                                            cursor: "pointer"
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.background = "#d0e7ff";
                                            e.currentTarget.style.color = "#0056b3";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,123,255,0.15)";
                                        }}
                                        onMouseOut={e => {
                                            e.currentTarget.style.background = "linear-gradient(90deg, #e3f0ff 0%, #f6faff 100%)";
                                            e.currentTarget.style.color = "#007bff";
                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,123,255,0.08)";
                                        }}
                                    >
                                        ANTT Veículo
                                    </a>
                                    <IconButton
                                        aria-label="Excluir"
                                        size="small"
                                        color="error"
                                        onClick={() => {
                                            handleDelete(reboque.cnhReboque);
                                            handleChange('cnhReboque', null);
                                        }}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                                transform: 'scale(1.1)',
                                            },
                                            transition: 'all 0.2s ease-in-out',
                                            padding: '4px',
                                            borderRadius: '50%',
                                            border: '1px solid transparent',
                                            '&:focus': {
                                                outline: 'none',
                                                border: '1px solid #d32f2f'
                                            }
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </li>
                            </ul>
                        )
                        : 
                        <Button variant="outlined" 
                            onClick={() => {
                                handleClickOpen();
                                setOrigem(`CNH Reboque Adicional ${index}`);
                            }}>
                            Importar Documento
                        </Button>
                    }
                </div>
            </div>

            <div className="row">
                <div className="col-4">
                    <label htmlFor={`descricaoReboque${index}`} className="form-label">Descrição Reboque</label>
                    <input 
                        type="text" 
                        onChange={(e) => handleChange('descricaoReboque', e.target.value)} 
                        value={reboque.descricaoReboque || ''} 
                        className="form-control" 
                        id={`descricaoReboque${index}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReboqueAdicional;