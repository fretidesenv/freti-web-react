import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputMask from 'react-input-mask';
import firebase from '../../config/firebase';
require('firebase/auth')


export default function ShipperDialog({dadosClient, handleClose, open}) {
  
    const [payingCustomer, setPayingCustomer] = useState("");

    const [cnpjPayingCustomer, setCnpjPayingCustomer] = useState("");
    const [addressPaying, setAddressPaying ] = useState("");
    const [cityPaying, setCityPaying ] = useState("");
    const [payingStateInitial, setPayingStateInitial ] = useState("");
    const [cepPaying, setCepPaying] = useState("");
    const [phoneRespPaying, setPhoneRespPaying ] = useState("");
    const [responsiblePaying, setResponsiblePaying ] = useState("");
    const [typeLocationPaying, setTypeLocationPaying] = useState("");
    const [longitudePaying, setLongitudePaying] = useState(0);
    const [latitudePaying, setLatitudePaying] = useState(0);
    const [formOfPayment, setFormOfPayment] = useState();


    const db = firebase.firestore();


    function validate() {
        if(!payingCustomer){
            alert('Por favor preeencher o campo nome');
            return false;
        }
            return true
    }


    async function save(){
        console.log("Entrando no salvar")

        if(validate()){

            var locationPaying = {
                type: typeLocationPaying,
                coordinates: {
                    longitude: (longitudePaying ? longitudePaying : 0),
                    latitude: (latitudePaying ? latitudePaying : 0)
                }
            }
    
            var addressPayment = {
                cep: cepPaying, 
                logradouro: addressPaying,
                city: cityPaying,
                stateInitial: payingStateInitial,
                location: locationPaying
            }
    
            var responsibleClientPayment = {
                phone: phoneRespPaying, 
                name: responsiblePaying, 
            }
    
            let data = {
                name: payingCustomer, 
                cnpj: cnpjPayingCustomer,
                formOfPayment: formOfPayment,
                address: addressPayment,
                responsible: responsibleClientPayment
            }
    
            console.log(data)
    
            console.log("[save] Salvando embarcador ")
            await db.collection("client").add(data).then(() => {
                console.log("salvou ")
                dadosClient(cnpjPayingCustomer, payingCustomer);    
                handleClose();        
            }).catch(error => {
                console.log('erro')
            });

        }

    }

    function buscarCNPJ(input) {
        if(input.length < 14) { 
            return;
        } else {   

            
                fetch('https://brasilapi.com.br/api/cnpj/v1/'+input, {mode: 'cors'})
                .then((res) => res.json())
                .then((data) => {
                    if (data.hasOwnProperty("erro")) {
                        alert('CNPJ não existente');
                    } else {                        

                        setPayingCustomer(data?.razao_social)
                        setCnpjPayingCustomer(data?.cnpj)
                        setAddressPaying(data?.logradouro  + ' - ' + data?.complemento + ', ' + data?.numero)
                        setCityPaying(data?.municipio)
                        setPayingStateInitial(data?.uf)
                        setCepPaying(data?.cep)
                    }
                })
                .catch(err => console.log(err));
            }
        }

       //Função para consultar CEP
       function buscarCepPaying(input) {
        
        input.replace("-","");

        if(input.length < 8) { 
            return;
        } else {
            
                fetch('https://brasilapi.com.br/api/cep/v2/'+input, {mode: 'cors'})
                .then((res) => res.json())
                .then((data) => {
                    if (data.hasOwnProperty("erro")) {
                        alert('Cep não existente');
                    } else {
                        setAddressPaying(data.street + ' - ' + data.neighborhood)
                        setCityPaying(data.city)
                        setPayingStateInitial(data.state)
                        setTypeLocationPaying(data.location.type)
                        setLongitudePaying(data.location.coordinates.longitude)
                        setLatitudePaying(data.location.coordinates.latitude)
                    }
                })
                .catch(err => console.log(err));
        } 
    }



  return (
    <div>

      <Dialog open={open} 
        onClose={handleClose}
        fullWidth={"lg"}
        maxWidth={"lg"}
        >
        <DialogTitle>Cadastro de cliente</DialogTitle>
        <DialogContent>
            <div className="mb-4">
            <DialogContentText>
                Você pode encontrar esse cadastro após o salvamento no menu Cliente
            </DialogContentText>
            </div>

            <div className="form-signin mx-auto mb-4 mb-lg-6">
                
                <div className="row">
                    <div className="col-3">

                        <label htmlFor="cnpjPayingCustomerLabel" className="form-label">CNPJ</label>
                        <input type="text" 
                            onChange={(e)=> {
                                setCnpjPayingCustomer(e.target.value);
                                buscarCNPJ(e.target.value);
                            }}
                            value={cnpjPayingCustomer && cnpjPayingCustomer} 
                            maxLength={14}
                            className="form-control" id="cnpjPayingCustomer" placeholder=""/>

                    </div>
                    
                    <div className="col-md-9">
                        <label htmlFor="payingCustomerLabel" className="form-label">Cliente</label>
                        <input type="text" 
                            onChange={(e)=> setPayingCustomer(e.target.value)} 
                            value={payingCustomer && payingCustomer} 
                            className="form-control" id="payingCustomer"/>

                    </div>

                    <div className="row">

                        <div className="col-3">
                            <label htmlFor="cepOriginLabel"  className="form-label">CEP</label>
                            {/* <InputMask mask="99999-999" className="form-control" 
                            onChange={(e)=> {
                                buscarCep();
                                setCepPaying(e.target.value);
                                
                            }} value={cepPaying && cepPaying} placeholder="99999-999"
                            /> */}
                        <input type="text" 
                            onChange={(e)=> {
                                setCepPaying(e.target.value)
                                buscarCepPaying(e.target.value);
                            }} value={cepPaying && cepPaying} 
                            maxLength={10} 
                            className="form-control" id="cepPaying" placeholder=""/>

                        </div>
                        <div className="col-md-4">
                            <label htmlFor="addressOriginLabel" className="form-label">Endereço</label>
                            <input type="text" 
                            onChange={(e)=> setAddressPaying(e.target.value)} 
                            value={addressPaying && addressPaying} 
                            className="form-control" 
                            id="addressPaying"/>
                        </div>
                        <div className="col-4">
                            <label htmlFor="originCityLabel" className="form-label">Cidade</label>
                            <input type="text"  
                            onChange={(e)=> setCityPaying(e.target.value)} 
                            value={cityPaying && cityPaying}  
                            className="form-control" 
                            id="cityPaying" 
                            placeholder=""/>
                        </div>
                        <div className="col-md-1">
                            <label htmlFor="originStateInitial" className="form-label">Estado</label>
                            <input type="text"  
                            onChange={(e)=> setPayingStateInitial(e.target.value)} 
                            value={payingStateInitial && payingStateInitial}  
                            className="form-control" 
                            id="payingStateInitial"/>
                        </div>

                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <label htmlFor="responsiblePayingLabel" className="form-label">Responsável</label>
                            <input type="text" 
                            onChange={(e)=> setResponsiblePaying(e.target.value)} 
                            value={responsiblePaying && responsiblePaying} 
                            className="form-control" 
                            id="responsiblePaying"/>
                        </div>
                        <div className="col-4">
                            <label htmlFor="phoneRespPayingLabel" className="form-label">Telefone Responsável</label>
                            <InputMask mask="(99) 99999-9999" id="phoneRespPaying" className="form-control" 
                            onChange={(e)=> setPhoneRespPaying(e.target.value)} 
                            value={phoneRespPaying && phoneRespPaying} 
                            placeholder="(99) 99999-9999"/>
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="formOfPaymentLabel" className="form-label">Forma de pagamento</label>
                            <select className="form-select" id="formOfPayment" 
                            value={formOfPayment && formOfPayment} onChange={(e)=> setFormOfPayment(e.target.value)} 
                            aria-label="">
                                <option defaultValue="">Selecione</option>
                                <option value="BOLETO 3 DIAS">BOLETO 3 DIAS </option>
                                <option value="BOLETO 7 DIAS">BOLETO 7 DIAS </option>
                                <option value="BOLETO 10 DIAS">BOLETO 10 DIAS </option>
                                <option value="BOLETO 15 DIAS"> BOLETO 15 DIAS</option>
                                <option value="BOLETO 15/30 DIAS">BOLETO 15/30 DIAS </option>
                                <option value="BOLETO 20 DIAS">BOLETO 20 DIAS </option>
                                <option value="BOLETO 20/40 DIAS">BOLETO 20/40 DIAS </option>
                                <option value="BOLETO 20/40/60 DIAS">BOLETO 20/40/60 DIAS</option>
                                <option value="BOLETO 21 DIAS">BOLETO 21 DIAS </option>
                                <option value="BOLETO 28 DIAS">BOLETO 28 DIAS </option>
                                <option value="BOLETO 28/56 DIAS">BOLETO 28/56 DIAS </option>
                                <option value="BOLETO 30 DIAS">BOLETO 30 DIAS </option>
                                <option value="BOLETO 30/60 DIAS">BOLETO 30/60 DIAS </option>
                                <option value="BOLETO 30/60/90 DIAS">BOLETO 30/60/90 DIAS </option>
                                <option value="BOLETO 45 DIAS">BOLETO 45 DIAS </option>
                                <option value="D. BANCARIO A VISTA">D. BANCARIO A VISTA </option>
                                <option value="D. BANCARIO 7 DIAS">D. BANCARIO 7 DIAS </option>
                                <option value="D. BANCARIO 10 DIAS">D. BANCARIO 10 DIAS </option>
                                <option value="BOLETO 60 DIAS">BOLETO 60 DIAS </option>
                                <option value="BOLETO 21 DIAS - CORTE 5/20 - CRISTIANO DMA">BOLETO 21 DIAS - CORTE 5/20 - CRISTIANO DMA </option>
                                <option value="BOLETO 21 DIAS - CORTE 10/20/30 - MARCOS DMA">BOLETO 21 DIAS - CORTE 10/20/30 - MARCOS DMA </option>
                                <option value="BOLETO 28 DIAS - MAURO">BOLETO 28 DIAS - MAURO </option>
                                <option value="BOLETO 28 DIAS - JULIO">BOLETO 28 DIAS - JULIO </option>
                                <option value="BOLETO 30 DIAS - ATERPA JOÃO">BOLETO 30 DIAS - ATERPA JOÃO </option>
                                <option value="BOLETO 30 DIAS - ATERPA GUILHERME">BOLETO 30 DIAS - ATERPA GUILHERME </option>
                            </select>
                        </div>

                    </div>
                </div>
            </div>


            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={save}>Salvar</Button>
            </DialogActions>
        </Dialog>
    </div>
  );
}


