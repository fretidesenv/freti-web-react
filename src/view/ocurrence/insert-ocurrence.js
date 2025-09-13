import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import './new-ocurrence.css'
import firebase from '../../config/firebase';
import { useNavigate, useParams } from "react-router-dom";
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import '../../view/frete/freight.css'
import { Input, Typography, Switch, Form, Card, Space, Button, Layout, Breadcrumb } from 'antd';
import { Content, Footer, Header } from "antd/es/layout/layout";
import DialogSave from "../../components/dialog-save/dialog-save";
import NewMiniDrawer from "../../components/navMenu/menu-nav";
require('firebase/auth')

function NewOcurrence(){

    const db = firebase.firestore();

    const { Title, Text } = Typography;


    const {id} = useParams();

    let navigate = useNavigate();

    const [name, setName] = useState();
    const [isComent, setIsComent] = useState();
    const [isPhoto, setIsPhoto] = useState();
    const [isApplication, setIsApplication] = useState();
    const [isClient, setIsClient] = useState();

    const [carregando, setCarregando] = useState(1);

    const [openDialog, setOpenDialog] = useState();
    const [messageDialog, setMessageDialog] = useState();
    const [titleDialog, setTitleDialog] = useState();
    const [statusDialog, setStatusDialog] = useState();

    const user = useSelector(state => state.user)


    useEffect(() => {
        
        db.collection('ocurrence').doc(id)
        .get().then( async (result) => {
            
            var data = result.data();
                

            if(id){
                
                setName(data.name)
                setIsApplication(data.isApplication)
                setIsClient(data.isClient)
                setIsComent(data.isComent)
                setIsPhoto(data.isPhoto)

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
            isClient:  isClient ? isClient : false,
            isApplication: isApplication ? isApplication : false,
            isComent: isComent ? isComent : false,
            isPhoto: isPhoto ? isPhoto : false,
        }
       

            firebase.firestore().collection('ocurrence').add(data).then(() => {
                setOpenDialog(true);
                setStatusDialog('success')
                setTitleDialog("Muito bem!")
                setMessageDialog("Ocorrência cadastrado com sucesso!")
                navigate("/listOcurrence");

            }).catch(error => {
                setOpenDialog(true);
                setStatusDialog('error')
                setTitleDialog("Muito ruim!")
                setMessageDialog("Houve um problema ao salvar a Ocorrência!")
                
            }).finally(item=>{
                setCarregando(0)
            })

            setCarregando(0)

    }

    function update(){

        setCarregando(1);

        var data = {
            name: name,
            isClient:  isClient ? isClient : false,
            isApplication: isApplication ? isApplication : false,
            isComent: isComent ? isComent : false,
            isPhoto: isPhoto ? isPhoto : false,
        }
       

        db.collection("ocurrence").doc(id).update(data).then(() => {
            setCarregando(0)
            setOpenDialog(true);
            setStatusDialog('success')
            setTitleDialog("Muito bem!")
            setMessageDialog("Ocorrência atualizado com sucesso!")

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
        navigate("/listOcurrence")
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
                            <Title level={3} style={{ textAlign: 'left', color: '#333' }}>Cadastro de Ocorrências</Title>
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
                        <Breadcrumb
                            style={{
                            margin: '16px 0',
                            }}
                        >
                            <Breadcrumb.Item>Home</Breadcrumb.Item>
                            <Breadcrumb.Item>Ocorrências</Breadcrumb.Item>
                        </Breadcrumb>
                        <div
                            style={{
                            padding: 24,
                            minHeight: 360,
                            background: '',
                            borderRadius: '',
                            }}
                        >

                            <Card style={{  display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                
                                {/* <Title level={3} style={{ textAlign: 'center', color: '#333' }}>Cadastro de Ocorrências</Title> */}
                    
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Digite o nome"
                                        style={{ borderRadius: '8px', height: '40px', fontSize: '16px' }}
                                    />
                    
                                    <div style={{ margin: '20px 0' }}>
                                        <Text strong style={{ fontSize: '16px', color: '#333' }}>Opções de Visibilidade</Text>
                                        <Space direction="vertical" size="large" style={{ width: '100%', marginTop: '10px' }}>
                                            <Form.Item>
                                                <Space align="center">
                                                    <Switch checked={isClient} onChange={setIsClient} />
                                                    <span>Visível para o cliente</span>
                                                </Space>
                                            </Form.Item>

                                            <Form.Item>
                                                <Space align="center">
                                                    <Switch checked={isApplication} onChange={setIsApplication} />
                                                    <span>Visível para o aplicativo</span>
                                                </Space>
                                            </Form.Item>

                                            <Form.Item>
                                                <Space align="center">
                                                    <Switch checked={isPhoto} onChange={setIsPhoto} />
                                                    <span>Exigir foto</span>
                                                </Space>
                                            </Form.Item>

                                            <Form.Item>
                                                <Space align="center">
                                                    <Switch checked={isComent} onChange={setIsComent} />
                                                    <span>Exibir comentário</span>
                                                </Space>
                                            </Form.Item>
                                        </Space>
                                    </div>

                                        <Button type="primary" size="large" onClick={id ? update : save } style={{ borderRadius: '8px', width: '100%' }}>
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



            // <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            //     <Card style={{ width: '100%', maxWidth: '600px', padding: '20px' }}>
                    
            //         <Title level={3} style={{ textAlign: 'center', color: '#333' }}>Cadastro de Ocorrências</Title>
        
            //                 <Input
            //                     value={name}
            //                     onChange={(e) => setName(e.target.value)}
            //                     placeholder="Digite o nome"
            //                     style={{ borderRadius: '8px', height: '40px', fontSize: '16px' }}
            //                 />
        
            //             <div style={{ margin: '20px 0' }}>
            //                 <Text strong style={{ fontSize: '16px', color: '#333' }}>Opções de Visibilidade</Text>
            //                 <Space direction="vertical" size="large" style={{ width: '100%', marginTop: '10px' }}>
            //                     <Form.Item>
            //                         <Space align="center">
            //                             <Switch checked={isClient} onChange={setIsClient} />
            //                             <span>Visível para o cliente</span>
            //                         </Space>
            //                     </Form.Item>

            //                     <Form.Item>
            //                         <Space align="center">
            //                             <Switch checked={isApplication} onChange={setIsApplication} />
            //                             <span>Visível para o aplicativo</span>
            //                         </Space>
            //                     </Form.Item>

            //                     <Form.Item>
            //                         <Space align="center">
            //                             <Switch checked={isPhoto} onChange={setIsPhoto} />
            //                             <span>Exigir foto</span>
            //                         </Space>
            //                     </Form.Item>

            //                     <Form.Item>
            //                         <Space align="center">
            //                             <Switch checked={isComent} onChange={setIsComent} />
            //                             <span>Exibir comentário</span>
            //                         </Space>
            //                     </Form.Item>
            //                 </Space>
            //             </div>

            //                 <Button type="primary" size="large" style={{ borderRadius: '8px', width: '100%' }}>
            //                     Salvar
            //                 </Button>
            //     </Card>
            // </div>
            }/>
        </>
    )
}

export default NewOcurrence;