import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate} from "react-router-dom";
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import firebase from '../../config/firebase';
import DataPaymentTable from "../../components/Data-payment-table/data-payment-table";
import { Button, Form, Modal, Select } from "antd";
import PaymentModal from "../../components/modal-salve-payment/modal-payment";
import { useLocation } from "react-router-dom";
import PaymentModalDespesas from "../../components/modal-salve-payment/ModalPayment";
import NewMiniDrawer from "../../components/navMenu/menu-nav";
require('firebase/auth')

function PaymentListDetail(){
    const db = firebase.firestore();

    const location = useLocation();
    const record = location.state?.record;

    const [listPayment, setListPayment] = useState(record);
    const [selectDriver, setSelectedDriver] = useState();
    const [updatedList, setUpdateList] = useState(false);
    const [open, setOpen] = useState();

    const onOpen = (record) => {
        setSelectedDriver(record);
        setOpen(true);
    }

    const onClose = () => {
        setOpen(false)
    }

    const saveProp = (result) => {
        if (result) {
            setUpdateList(true);
        }
    }
    
    const [carregando, setCarregando] = useState(1);
    
    let paymentList = [];

    var userLogado = useSelector(state => state.usuarioLogado);
    const user = useSelector(state => state.user)



    useEffect(() => {

        if(userLogado > 0) {
            if(user.perfil === "Master"){
                
                console.log("listando pagamento");            
                
                db.collection('payment')
                .get().then( async (result) => {
                    result.docs.forEach(doc => {

                        paymentList.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    })
                    
                    console.log(listPayment);
                    console.log(record);
                    setListPayment(paymentList)
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
                                        <h4>Detalhe do Pagamento</h4>
                                    </div>
                                    <div className="col-5">
                                    </div>
                                    <div className="col-2">
                                        <div className="col-md-11 control-label">
                                            <Link>
                                                <Button type="primary" onClick={() => onOpen(listPayment)}>
                                                    Adicionar Despesas
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>        
                            </div>
                            <div>
                                <div style={{ height: 400, width: '100%' }}>
                                    <DataPaymentTable data={listPayment} updatedList={updatedList} />
                                    <PaymentModalDespesas visible={open} onClose={onClose} driverName={record} type={"Adiantamento"} onSaveResult={saveProp} />
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

export default PaymentListDetail;