import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate} from "react-router-dom";
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import firebase from '../../config/firebase';
import DataEmbarcadorTable from "../../components/Data-embarcador-table/data-embarcador-table";
import { Button } from "antd";
import AddIcon from '@mui/icons-material/Add';
import './embarcador.css';
import NewMiniDrawer from "../../components/navMenu/menu-nav";
require('firebase/auth')

function EmbarcadorList(){
    const db = firebase.firestore();
    const [listEmbar, setListEmbar] = useState([]);
    const [carregando, setCarregando] = useState(1);
        
    let embarList = [];

    var userLogado = useSelector(state => state.usuarioLogado);
    const user = useSelector(state => state.user)

    useEffect(() => {

        if(userLogado > 0) {


            if(user.perfil == "Master"){

                db.collection('shipper')
                .get().then( async (result) => {

                    result.docs.forEach(doc => {
                        embarList.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    })
                    
                    setListEmbar(embarList)
                    setCarregando(0)
                }).catch(error => {
                    setCarregando(0)
                    console.log(error)
                });
    
            }else{
            
                db.collection('shipper')
                .doc(user.uidShipper)
                .get().then( async (result) => {
                    
                    embarList.push({
                        id: result.id,
                        ...result.data()
                    });

                    setListEmbar(embarList)
                    setCarregando(0)
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
                                        <h4>Embarcadores</h4>
                                    </div>
                                    <div className="col-5">
                                    
                                    </div>
                                    <div className="col-2">
                                        <div className="col-md-11 control-label">
                                            <Link to={"/newEmbarcador"}>
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
                                    <DataEmbarcadorTable data={listEmbar}/>
                                    {/* <div style={{ display: 'flex', height: '100%' }}>
                                        <div style={{ flexGrow: 1 }}>
                                            <CustomPaginationActionsTable lista={listEmbar} />
                                        </div>
                                    </div> */}
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

export default EmbarcadorList;