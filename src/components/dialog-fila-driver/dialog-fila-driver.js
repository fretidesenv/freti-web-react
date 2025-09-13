import React from 'react';
import { Modal, Button, List, Typography, Avatar } from 'antd';
import { ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';


const DialogFileDriver = ({ driversInFila, openModal, handleClose }) => {
    return (
        <Modal
            title="Motoristas na Fila"
            open={openModal}
            onCancel={handleClose}
            footer={[
                <Button key="ok" type="primary" onClick={handleClose}>
                    OK
                </Button>
            ]}
            centered // Centraliza o modal na tela
        >
            {driversInFila.length < 1 ? (
                <Typography.Text type="danger">
                    Não há motorista em espera para esse frete no momento.
                </Typography.Text>
            ) : (
                <List
                    dataSource={driversInFila}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                  avatar={
                                    <Avatar
                                        style={{
                                            backgroundColor: '#1890ff', // Cor de fundo do avatar
                                            color: '#fff', // Cor do texto
                                        }}
                                    >
                                        {item.driver_name[0].toUpperCase()} {/* Primeira letra do nome */}
                                    </Avatar>
                                }
                                title={<Typography.Text>{item.driver_name}</Typography.Text>}
                                description={`Na fila de espera desde: ${new Date(
                                    item.registrationInLineTime.seconds * 1000
                                ).toLocaleString('pt-BR')}`}

                            />
                                <Link to={'/driverList/' + item.driver_user}>
                                        <EditOutlinedIcon />
                                </Link>
                        </List.Item>
                    )}
                />
            )}
        </Modal>
    );
};

export default DialogFileDriver;

