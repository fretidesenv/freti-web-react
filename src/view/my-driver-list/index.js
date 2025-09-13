import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import firebase from '../../config/firebase';
import MyDriverGridPagination from "../../components/GridSimple-mydriver";
import NewMiniDrawer from "../../components/navMenu/menu-nav";
require('firebase/auth')

function MyDriverList(){
    const [carregando, setCarregando] = useState(1);
    const [drivers, setDrivers] = useState([]);
    
    const user = useSelector(state => state.user);

    let driverList = [];

    useEffect(() => {
        
        firebase.firestore().collection('my_driver')
            .where('shipper.uid', '==' , user.uidShipper)
            .get().then( async (result) => {

                result.docs.forEach(doc => {
                    driverList.push({
                        id: doc.id,
                        ...doc.data()
                    });

                })
                
            setDrivers(driverList)

            setCarregando(0)
        }).catch(error => {
            setCarregando(0)
            console.log(error)
        });
        
        
    },[carregando]);


    return (
        <>
      { 
        useSelector(state => state.usuarioLogado) > 0 ?
            <NewMiniDrawer divOpen={
                <div className="freight-content">
                    <div className="container">
                        <div className="row">
                            <div className="col-5">
                                <h3>Meus Motoristas</h3>
                            </div>
                            <div className="col-5">
                            
                            </div>
                            <div className="col-2">
                                <div className="col-md-11 control-label">
                                    <Link to={"/myDriver"}>
                                        <button type="button" class="btn btn-primary">Novo Motorista</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        carregando ? 
                            <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span></div>
                        :
                        <MyDriverGridPagination key={1} lista={drivers}/>
                    }    
                </div>

        }/>

        : 
        <Navigate to='/login' />
      }
    </>
    );
}


export default MyDriverList;