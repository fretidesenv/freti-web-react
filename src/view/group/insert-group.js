import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import firebase from '../../config/firebase';
import { useNavigate, useParams } from "react-router-dom";
import { Input, Typography, Switch, Form, Card, Space, Button, Layout, Breadcrumb, Col, Row } from 'antd';
import { Content, Footer, Header } from "antd/es/layout/layout";
import DialogSave from "../../components/dialog-save/dialog-save";
import NewMiniDrawer from "../../components/navMenu/menu-nav";
require('firebase/auth')

function NewGroup(){

    const db = firebase.firestore();

    const { Title, Text } = Typography;


    const {id} = useParams();

    let navigate = useNavigate();

    const [name, setName] = useState();
    const [description, setDescription] = useState();
    const [active, setActive] = useState();

    const [carregando, setCarregando] = useState(1);

    const [openDialog, setOpenDialog] = useState();
    const [messageDialog, setMessageDialog] = useState();
    const [titleDialog, setTitleDialog] = useState();
    const [statusDialog, setStatusDialog] = useState();

    const user = useSelector(state => state.user)


    useEffect(() => {
        
        db.collection('tb_group').doc(id)
        .get().then( async (result) => {
            
            var data = result.data();
                

            if(id){
                
                setName(data.name)
                setDescription(data.description)
                setActive(data.active)

            }

        }).catch(error => {
            setCarregando(0)
            console.log(error)
        });
            
    },[carregando]);
        


    function save(){

        setCarregando(1);


        var data = {
            name: name,
            description: description,
            active: active,
            uidShipper: user.uidShipper,
        }
       

            firebase.firestore().collection('tb_group').add(data).then(() => {
                setOpenDialog(true);
                setStatusDialog('success')
                setTitleDialog("Muito bem!")
                setMessageDialog("Grupo cadastrado com sucesso!")
                navigate("/listGroup");

            }).catch(error => {
                setOpenDialog(true);
                setStatusDialog('error')
                setTitleDialog("Muito ruim!")
                setMessageDialog("Houve um problema ao salvar o Grupo!")
                
            }).finally(item=>{
                setCarregando(0)
            })

            setCarregando(0)

    }

    function update(){

        setCarregando(1);

        var data = {
            name: name,
            description: description,
            active: active,
        }
       

        db.collection("tb_group").doc(id).update(data).then(() => {
            setCarregando(0)
            setOpenDialog(true);
            setStatusDialog('success')
            setTitleDialog("Muito bem!")
            setMessageDialog("Grupo atualizado com sucesso!")

        }).catch(error => {
            setCarregando(0)
            setOpenDialog(true);
            setStatusDialog('error')
            setTitleDialog("Muito ruim!")
            setMessageDialog("Houve um problema ao salvar!")
            
        }).finally(item=>{
            setCarregando(0)
        })

    }



    const handleDialogClose = () => {
        setOpenDialog(false); 
        navigate("/listGroup")
    };


    return(
        <>
            <NewMiniDrawer divOpen={ 
                
                <Layout  style={{
                            padding: 0,
                            background: '#FFFF'
                        }}>
                        <Header
                            style={{
                                padding: 0,
                                background: '#FFFF'
                            }}
                        >
                            <Title level={3} style={{ textAlign: 'left', color: '#333' }}>Cadastro de Grupo</Title>
                        </Header>
                        
                        <DialogSave 
                            open={openDialog} 
                            handleClose={handleDialogClose}
                            title={titleDialog}
                            message={messageDialog} 
                            status={statusDialog}
                        />
                        
                        <Content
                        style={{
                            margin: '0 16px',
                        }}
                        >
                        {/* <Breadcrumb
                            style={{
                            margin: '16px 0',
                            }}
                        >
                            <Breadcrumb.Item>Home</Breadcrumb.Item>
                            <Breadcrumb.Item>Grupos</Breadcrumb.Item>
                        </Breadcrumb> */}
                        <div
                            style={{
                            padding: 24,
                            minHeight: 360,
                            background: '',
                            borderRadius: '',
                            }}
                        >

                            <Card style={{  display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Digite o nome"
                                            style={{ borderRadius: '8px', height: '40px', fontSize: '16px' }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Input
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Digite a descrição"
                                            style={{ borderRadius: '8px', height: '40px', fontSize: '16px' }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Text strong style={{ fontSize: '16px', color: '#333' }}>Opções de Visibilidade</Text>
                                        <Space direction="vertical" size="large" style={{ width: '100%', marginTop: '10px' }}>
                                            <Form.Item>
                                                <Space align="center">
                                                    <Switch checked={active} onChange={setActive} />
                                                    <span>Ativo</span>
                                                </Space>
                                            </Form.Item>
                                        </Space>
                                    </Col>

                                </Row>
                                <Button type="primary" 
                                    size="large" 
                                    onClick={id ? update : save } 
                                    style={{ borderRadius: '8px', width: '100%', marginTop: '20px' }}
                                >
                                    Salvar
                                </Button>
                            </Card>

                        </div>
                        </Content>
                        <Footer
                        style={{
                                textAlign: 'center',
                                padding: 0,
                                background: '#FFFF'
                            }}
                            >

                        </Footer>
                </Layout>

            }/>
        </>
    )
}

export default NewGroup;