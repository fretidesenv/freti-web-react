import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate} from "react-router-dom";
import CustomPaginationActionsTable from "../../components/GridSimple/CustomPaginationActionsTable";
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import firebase from '../../config/firebase';
import { Button } from "antd";
import AddIcon from '@mui/icons-material/Add';
import '../client-list/client.css';
import NewMiniDrawer from "../../components/navMenu/menu-nav";
require('firebase/auth')

function UserList(){
    const db = firebase.firestore();
    const [listUser, setListUser] = useState([]);
    const [carregando, setCarregando] = useState(1);
        
    let userList = [];

    var userLogado = useSelector(state => state.usuarioLogado);
    const user = useSelector(state => state.user)

    useEffect(() => {

        if(userLogado > 0) {

            debugger

            if(user.perfil === "Master"){
                db.collection('user_web')
                .get().then( async (result) => {

                    result.docs.forEach(doc => {
                            userList.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        })

                    setListUser(userList)
                    setCarregando(0)
                }).catch(error => {
                    setCarregando(0)
                    console.log(error)
                });
            }else{

                db.collection('user_web')
                .where('uidShipper', '==' , user.uidShipper)
                .get().then( async (result) => {
                    
                    result.docs.forEach(doc => {
                            userList.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        })

                    setListUser(userList)
                    setCarregando(0)

                    debugger

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
                            <div className="container">
                                <div className="row">
                                    <div className="col-5">
                                        <h3>Listagem de Usuário</h3>
                                    </div>
                                    <div className="col-5">
                                    
                                    </div>
                                    <div className="col-2">
                                        <div className="col-md-11 control-label">
                                            <Link to={"/newUser"}>
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
                                    <div style={{ display: 'flex', height: '100%' }}>
                                        <div style={{ flexGrow: 1 }}>
                                            <CustomPaginationActionsTable lista={listUser} />
                                        </div>
                                    </div>
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

export default UserList;