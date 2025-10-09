import React, { useEffect, useState } from "react";
import './driver-list.css'
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import firebase from '../../config/firebase';
import DataDriverTable from "../../components/Data-driver-table/data-driver-table";
import { Button } from "antd";
import AddIcon from '@mui/icons-material/Add';
import NewMiniDrawer from "../../components/navMenu/menu-nav";
require('firebase/auth')

function DriverList(){
    const [carregando, setCarregando] = useState(1);
    const [drivers, setDrivers] = useState([]);
    
    const user = useSelector(state => state.user);

    let driverList = [];

    useEffect(() => {
        
        firebase.firestore()
            .collection('drivers_users')
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
                        <div id="rowWrap" className="row">
                            <div className="col-5 mb-3">
                                <h4>Motoristas</h4>
                            </div>
                            <div className="col-5">
                            
                            </div>
                            <div className="col-2">
                                <div className="col-4">
                                    <div className="col-md-11 control-label">
                                        <Link to={"/driver"}>
                                                <Button id="ButtonHover" type="primary" icon={<AddIcon />}>
                                                Novo
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        carregando ? 
                            <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span></div>
                        :
                        <DataDriverTable data={drivers} />
                    }
                </div>
        }/>
        : 
        <Navigate to='/login' />
    }
    </>
    );
}


export default DriverList;