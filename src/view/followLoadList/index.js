import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate} from "react-router-dom";
import CustomPaginationTableFollow from "../../components/GridSimple-followLoad";
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import firebase from '../../config/firebase';
require('firebase/auth')

function FollowLoadList(){
    const db = firebase.firestore();
    const [carregando, setCarregando] = useState(1);
    const [listFreight, setListFreight] = useState([]);
    const user = useSelector(state => state.user)

    let freightList = [];

    var userLogado = useSelector(state => state.usuarioLogado);

    useEffect(() => {

        if(userLogado > 0) {
            

            if(user.perfil == "Master"){

                db.collection('freight')
                .where('status.describe', '==', 'Em transito')
                .get().then( async (result) => {
                    
                    result.docs.forEach(async doc => {

                        console.log(doc.data())

                        freightList.push({
                            id: doc.id,
                            ...doc.data()
                        });
    
    
                        db.collection('drivers_users')
                            .doc(doc.data().getDriverFreight.uidDriver)
                            .get()
                            .then((item) => {
    
                                console.log(item.data())
    
                            }).catch(erro => {
                                console.log(erro)
                            });
                    })
    
                    setListFreight(freightList)
                    setCarregando(0)
                }).catch(error => {
                    setCarregando(0)
                    console.log(error)
                });

            }else{


                db.collection('freight')
                .where('shipper.uid', '==' , user.uidShipper)
                .where('status.describe', '==', 'Em transito')
                .get().then( async (result) => {
    
                    result.docs.forEach(async doc => {
                        freightList.push({
                            id: doc.id,
                            ...doc.data()
                        });
    
    
                        db.collection('drivers_users')
                            .doc(doc.data().getDriverFreight.uidDriver)
                            .get()
                            .then((item) => {
    
                                console.log(item.data())
    
                            }).catch(erro => {
                                console.log(erro)
                            });
                    })
    
                    setListFreight(freightList)
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

                     <PersistentDrawerLeft divOpen={
                        
                        <div className="freight-content">
                            <div className="container">
                                <div className="row">
                                    <div className="col-5">
                                        <h3>Motoristas em viagens</h3>
                                    </div>
                                    <div className="col-5">
                                    
                                    </div>
                                </div>        
                            </div>
                            <div>
                                <div style={{ height: 400, width: '100%' }}>
                                    <div style={{ display: 'flex', height: '100%' }}>
                                        <div style={{ flexGrow: 1 }}>
                                            <CustomPaginationTableFollow lista={listFreight} />

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

export default FollowLoadList;