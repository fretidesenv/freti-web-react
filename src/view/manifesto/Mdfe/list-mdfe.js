import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate} from "react-router-dom";
import { Button } from "antd";
import AddIcon from '@mui/icons-material/Add';
import DataMdfeTable from "../../../components/Data-mdfe-table/data-mdfe-table";
import firebase from '../../../config/firebase';
import NewMiniDrawer from "../../../components/navMenu/menu-nav";
require('firebase/auth')

function MdfeList(){
    const db = firebase.firestore();

    const [listMdfe, setListMdfe] = useState([]);
    const [carregando, setCarregando] = useState(1);

    let mdfeList = [];

    var userLogado = useSelector(state => state.usuarioLogado);
    const user = useSelector(state => state.user)

    useEffect(() => {

        if(userLogado > 0) {

            if(user.perfil === "Master"){
                db.collection('mdfe')
                // .where("uidShipper", "==", user.uidShipper)
                .get().then( async (result) => {
                    result.docs.forEach(doc => {
                        mdfeList.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    })
                    
                    setListMdfe(mdfeList)
                    setCarregando(0)
                }).catch(error => {
                    setCarregando(0)
                    console.log(error)
                });

            }else{

                db.collection('mdfe')
                .where("uidShipper", "==", user.uidShipper)
                .get().then( async (result) => {
                    const filtroCliente = [];
                    result.docs.forEach(doc => {
                        const clienteData = doc.data();
                        if (clienteData.uidShipper && clienteData.uidShipper !== null) {
                            filtroCliente.push({
                                id: doc.id,
                                ...clienteData
                            });
                        }
                    });

                    setListMdfe(filtroCliente);
                    setCarregando(0);
                }).catch(error => {
                    setCarregando(0)
                    console.log(error)
                });
            }
        }
    },[carregando]);

    return(
        <>
            { 
                useSelector(state => state.usuarioLogado) > 0 ? 
                    <NewMiniDrawer divOpen={
                        <div className="freight-content">
                            <div className="container mb-3">
                                <div className="row">
                                    <div className="col-5">
                                        <h4>MDF-e</h4>
                                    </div>
                                    <div className="col-5">
                                    </div>
                                    <div className="col-2">
                                        <div className="col-md-11 control-label">
                                            <Link to={"/insertMdfe"}>
                                                <Button id="ButtonHover" type="primary" icon={<AddIcon />}>
                                                    Novo
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>        
                            </div>
                            <div>
                                <div style={{ height: 400, width: '100%' }}>
                                    <DataMdfeTable data={listMdfe}/>
                                </div>
                            </div>
                        </div>
                }/>
                : 
                <Navigate to='/login' />
            }
        </>
    );
}

export default MdfeList;