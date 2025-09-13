import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate} from "react-router-dom";
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import firebase from '../../config/firebase';
import { Button } from "antd";
import AddIcon from '@mui/icons-material/Add';
import DataOcurrenceTable from "../../components/Data-ocurrence-table/data-ocurrence-table";
import NewMiniDrawer from "../../components/navMenu/menu-nav";
require('firebase/auth')

function OcurrenceList(){
    const db = firebase.firestore();

    const [listOcurrence, setListOcurrence] = useState([]);
    const [carregando, setCarregando] = useState(1);

    let ocurrenceList = [];

    var userLogado = useSelector(state => state.usuarioLogado);
    const user = useSelector(state => state.user)

    useEffect(() => {

        if(userLogado > 0) {

            if(user.perfil === "Master"){
                db.collection('ocurrence')
                .get().then( async (result) => {
                    result.docs.forEach(doc => {
                        ocurrenceList.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    })
                    
                    setListOcurrence(ocurrenceList)
                    setCarregando(0)
                }).catch(error => {
                    setCarregando(0)
                    console.log(error)
                });

            }else{
            
            //Criar filtro para trazer apenas as ocorrencias do cliente 
                db.collection('ocurrence')
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

                    setListOcurrence(filtroCliente);
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
                                        <h4>Ocorrências</h4>
                                    </div>
                                    <div className="col-5">
                                    </div>
                                    <div className="col-2">
                                        <div className="col-md-11 control-label">
                                            <Link to={"/newOcurrence"}>
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
                                    <DataOcurrenceTable data={listOcurrence}/>
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

export default OcurrenceList;