import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate} from "react-router-dom";
import { Button } from "antd";
import AddIcon from '@mui/icons-material/Add';
import firebase from '../../config/firebase';
import NewMiniDrawer from "../../components/navMenu/menu-nav";
import DataGroupTable from "../../components/data-group-table/data-group-table";
require('firebase/auth')

function GroupListView(){
    const db = firebase.firestore();

    const [listGroup, setListGroup] = useState();
    const [carregando, setCarregando] = useState(1);

    let groupList = [];

    var userLogado = useSelector(state => state.usuarioLogado);
    const user = useSelector(state => state.user)

    useEffect(() => {

        if(userLogado > 0) {

            // if(user.perfil === "Master"){
                db.collection('tb_group')
                .where("uidShipper", "==", user.uidShipper)
                .get().then( async (result) => {
                    result.docs.forEach(doc => {
                        groupList.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    })
                    
                    setListGroup(groupList)
                    setCarregando(0)
                }).catch(error => {
                    setCarregando(0)
                    console.log(error)
                });

            // }
        }

        console.log(listGroup)

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
                                        <h4>Grupos</h4>
                                    </div>
                                    <div className="col-5">
                                    </div>
                                    <div className="col-2">
                                        <div className="col-md-11 control-label">
                                            <Link to={"/insertGroup"}>
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
                                    <DataGroupTable data={listGroup}/>
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

export default GroupListView;