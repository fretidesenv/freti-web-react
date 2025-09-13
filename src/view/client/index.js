import React, { useEffect, useState } from "react";
import firebase from '../../config/firebase';
import { useNavigate, useParams } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import InputMask from 'react-input-mask';
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import { Card } from "@mui/material";
import { Input, Select } from "antd";
import { useSelector } from "react-redux"; // identificador do user
import BackButton from "../../components/backButton/BackButton";
import { Link } from 'react-router-dom';
import NewMiniDrawer from "../../components/navMenu/menu-nav";
require('firebase/auth')

function NewClient(){
    
    const user = useSelector(state => state.user) // Criando uma constante para uso do user
    const {id} = useParams();

    var navigate = useNavigate();

    const [socialName, setSocialName] = useState("");
    const [socialNameError, setSocialNameError] = useState("");

    const [nameFantasy, setNameFantasy] = useState("");
    const [nameFantasyError, setNameFantasyError] = useState("");

    const [cnpj, setCnpj] = useState("");
    const [cnpjError, setCnpjError] = useState("");

    const [typePerson, setTypePerson] = useState(1);


    const [cep, setCep] = useState("");
    const [cepError, setCepError] = useState("");

    const [street, setStreet ] = useState("");
    const [streetError, setStreetError ] = useState("");

    const [neighborhood, setNeighborhood] = useState("");//bairro
    const [neighborhoodError, setNeighborhoodError] = useState("");//bairro

    const [city, setCity] = useState("");
    const [cityError, setCityError] = useState("");

    const [state, setState] = useState("");
    const [stateError, setStateError] = useState("");
    
    const [number, setNumber] = useState("");
    
    const [longitude, setLongitude] = useState();
    const [longitudeError, setLongitudeError] = useState();
    
    const [latitude, setLatitude] = useState();
    const [latitudeError, setLatitudeError] = useState();

    const [cepDelivery, setCepDelivery] = useState("");
    const [cepEntregaError, setCepEntregaError] = useState("");

    const [streetDelivery, setStreetDelivery ] = useState("");
    const [streetDeliveryError, setStreetDeliveryError ] = useState("");

    const [neighborhoodDelivery, setNeighborhoodDelivery] = useState("");//bairro
    const [neighborhoodDeliveryError, setNeighborhoodDeliveryError] = useState("");//bairro

    const [cityDelivery, setCityDelivery] = useState("");
    const [cityDeliveryError, setCityDeliveryError] = useState("");

    const [stateDelivery, setStateDelivery] = useState("");
    const [stateDeliveryError, setStateDeliveryError] = useState("");
    
    const [numberDelivery, setNumberDelivery] = useState("");
    
    const [longitudeDelivery, setLongitudeDelivery] = useState();
    const [longitudeDeliveryError, setLongitudeDeliveryError] = useState();
    
    const [latitudeDelivery, setLatitudeDelivery] = useState();
    const [latitudeDeliveryError, setLatitudeDeliveryError] = useState();

    
    const [responsible, setResponsible] = useState("");
    const [phoneResp, setPhoneResp] = useState("");
    const [email, setEmail] = useState("");

    const [msgTipo, setMsgTipo] = useState();
    const [carregando, setCarregando] = useState(0);
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState();
    const [title, setTitle] = useState();

    const db = firebase.firestore();

    useEffect(() => {

        db.collection('client').doc(id)
            .get().then( async (result) => {
                
                var data = result.data();
                if(id) {

                    setTypePerson(data.typePerson)
                    setSocialName(data.name)
                    setNameFantasy(data.nameFantasy)
                    setCnpj(data.cnpj)

                    setCep(data.address.cep)
                    setStreet(data.address.street)
                    setNeighborhood(data.address.neighborhood)
                    setCity(data.address.city)
                    setState(data.address.state)
                    setNumber(data.address.number)
                    // setLatitude(data.address.coordinates.latitude)
                    // setLongitude(data.address.coordinates.longitude)

                    setCepDelivery(data.addressDelivery.cep)
                    setStreetDelivery(data.addressDelivery.street)
                    setNeighborhoodDelivery(data.addressDelivery.neighborhood)
                    setCityDelivery(data.addressDelivery.city)
                    setStateDelivery(data.addressDelivery.state)
                    setNumberDelivery(data.addressDelivery.number)
                    // setLatitudeDelivery(data.addressDelivery.coordinatesDelivery.latitude)
                    // setLongitudeDelivery(data.addressDelivery.coordinatesDelivery.longitude)

                    setResponsible(data.responsible.responsible)
                    setPhoneResp(data.responsible.phoneResp)
                    setEmail(data.responsible.email)
                }

            }).catch(error => {
                setCarregando(0)
                console.log(error)
            });
            
    },[carregando]);

    //Função para consultar CEP
    function buscarCep(input) {

        if(input != null && input.length < 8) {
            return;
        } else {
            
            fetch('https://viacep.com.br/ws/' + input + '/json/', {mode: 'cors'})
            .then((res) => res.json())
            .then((data) => {
                if (data.hasOwnProperty("erro")) {
                    alert('Cep não existente');
                } else {

                    setStreet(data?.logradouro)
                    setNeighborhood(data?.bairro)
                    setCity(data?.localidade)
                    setState(data?.uf)
                }
            })
            .catch(err => console.log(err));
        }
    }

        //Função para consultar CEP
        function buscarCepDelivery(input) {

            if(input != null && input.length < 8) {
                return;
            } else {
                
                    fetch('https://viacep.com.br/ws/' + input + '/json/', {mode: 'cors'})
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.hasOwnProperty("erro")) {
                            alert('Cep não existente');
                        } else {

                            setStreetDelivery(data?.logradouro)
                            setNeighborhoodDelivery(data?.bairro)
                            setCityDelivery(data?.localidade)
                            setStateDelivery(data?.uf)
                            // setLatitudeDelivery(data?.location?.coordinates?.latitude)
                            // setLongitudeDelivery(data?.location?.coordinates?.longitude)
                        }
                    })
                    .catch(err => console.log(err));
                    // fetch('https://brasilapi.com.br/api/cep/v1/'+input, {mode: 'cors'})
                    // .then((res) => res.json())
                    // .then((data) => {
                    //     if (data.hasOwnProperty("erro")) {
                    //         alert('Cep não existente');
                    //     } else {
                    //         setStreetDelivery(data?.street)
                    //         setNeighborhoodDelivery(data?.neighborhood)
                    //         setCityDelivery(data?.city)
                    //         setStateDelivery(data?.state)
                    //         setLatitudeDelivery(data?.location?.coordinates?.latitude)
                    //         setLongitudeDelivery(data?.location?.coordinates?.longitude)
                    //     }
                    // })
                    // .catch(err => console.log(err));
            }
        }

    function buscarCNPJ(input) {
        if(input.length === 14) {
            const inputLimpo = input.replace(/[^\d]/g, "");
            fetch('https://api.cnpjs.dev/v1/'+inputLimpo, {mode: 'cors'})
            .then((res) => res.json())
            .then((data) => {

                if (data.hasOwnProperty("erro")) {
                    alert('CNPJ não existente');
                } else if(data.status == 404){
                    console.log(data.status);
                    return;
                } else {
                    setSocialName(data?.razao_social)
                    setCnpj(data?.cnpj)
                    setNameFantasy(data?.nome_fantasia ? data?.nome_fantasia : data?.razao_social)
                    setPhoneResp(data?.telefone1)
                    setCep(data?.endereco.cep)
                    setStreet(data?.endereco.logradouro + ' - ' + data?.endereco.complemento)
                    setNumber(data?.endereco.numero)
                    setNeighborhood(data?.endereco.bairro)
                    setCity(data?.endereco.municipio)
                    setState(data?.endereco.uf)
                }
            })
            .catch(err => {
                console.log("Error ")
                console.log(err)

            });
        } else if (input.length === 18) {
            const inputLimpo = input.replace(/[^\d]/g, "");
            fetch('https://api.cnpjs.dev/v1/'+inputLimpo, {mode: 'cors'})
            .then((res) => res.json())
            .then((data) => {

                if (data.hasOwnProperty("erro")) {
                    alert('CNPJ não existente');
                } else if(data.status == 404){
                    console.log(data.status);
                    return;
                } else {
                    console.log(data);
                    setSocialName(data?.razao_social)
                    setCnpj(data?.cnpj)
                    setNameFantasy(data?.nome_fantasia ? data?.nome_fantasia : data?.razao_social)
                    setPhoneResp(data?.telefone1)
                    setCep(data?.endereco?.cep)
                    setStreet(data?.endereco?.logradouro + ' - ' + data?.endereco?.complemento)
                    setNumber(data?.endereco?.numero)
                    setNeighborhood(data?.endereco?.bairro)
                    setCity(data?.endereco?.municipio)
                    setState(data?.endereco?.uf)
                }
            })
            .catch(err => console.log(err));
        } else {
            return;
        }
    }


    function save(){
        setCarregando(1)

        var address = {
            cep: cep,
            street: street,
            neighborhood: neighborhood,
            number: number,
            city: city,
            state: state
            // coordinates: coordinates
        }

        var addressDelivery = {
            cep: cepDelivery,
            street: streetDelivery,
            neighborhood: neighborhoodDelivery,
            number: numberDelivery,
            city: cityDelivery,
            state: stateDelivery
        }

        var responsibleData = {
            responsible: responsible,
            phoneResp: phoneResp,
            email: email
        }


        var data = {
            name: socialName,
            nameFantasy: nameFantasy,
            typePerson: typePerson,
            cnpj: typePerson === 2 ? cnpj : '', 
            cpf: typePerson === 1 ? cnpj : '',
            address : address,
            addressDelivery: addressDelivery,
            responsible: responsibleData,
            uidShipper: user.uidShipper, 
        }

        console.log(data)

        db.collection("client").add(data).then(() => {
            setCarregando(0)
            setMsgTipo('sucesso')
            
            navigate("/clientList");
            
        }).catch(error => {
            setMsgTipo('erro')
            setCarregando(0)
            setTitle(' Ops!')
            setMsg('Houve um problema interno ao recuperar os dados do Embarcador');
            setOpen(true)
        });
    }

    const handleClose = () => {
        setOpen(false);
    };

    function update(){
        setCarregando(1)

        var address = {
            cep: cep,
            street: street,
            neighborhood: neighborhood,
            city: city,
            state: state,
            number: number,
        }

        var addressDelivery = {
            cep: cepDelivery,
            street: streetDelivery,
            neighborhood: neighborhoodDelivery,
            number: numberDelivery,
            city: cityDelivery,
            state: stateDelivery
        }

        var responsibleData = {
            responsible: responsible,
            phoneResp: phoneResp,
            email: email
        }
        
        var data = {
            name: socialName,
            nameFantasy: nameFantasy,
            typePerson: typePerson,
            cnpj: typePerson === 2 ? cnpj : "", 
            cpf: typePerson === 1 ? cnpj : "",
            address : address,
            addressDelivery: addressDelivery,
            responsible: responsibleData,
            // uidShipper: user.uidShipper
        }

        // db.collection("client").get().then(snapshot => {
        //     snapshot.forEach(doc => {
        //         doc.ref.update({ uidShipper: user.uidShipper });
        //     });
        // });

        db.collection("client").doc(id).update(data).then(() => {
            setCarregando(0)
            setMsgTipo('sucesso')
            
            navigate("/clientList");
            
        }).catch(error => {
            setMsgTipo('erro')
            setCarregando(0)
        });
    }

    const showChangeType = (value) => {

        if(value === 2) {
            return(
                <>
                    <InputMask
                        fullWidth
                        className="form-control" 
                        focused={cnpj && cnpj}
                        mask="99.999.999/9999-99"
                        onChange={(e)=> {
                            buscarCNPJ(e.target.value);
                            setCnpj(e.target.value);
                        }} 
                        value={cnpj && cnpj} 
                        placeholder="CNPJ"
                        required={cnpj && cnpj} 
                    />
                </>
            )  
            
        }else {
            return (
                <>
                    <InputMask mask="999.999.999-99" 
                        fullWidth
                        maskChar={""}
                        className="form-control" 
                        focused={cnpj && cnpj}
                        onChange={(e)=> {
                            setCnpj(e.target.value);  
                        }} 
                        value={cnpj && cnpj} 
                        placeholder="CPF"
                    />
                </>
            )
        }

    }


    return(
        <>
            <NewMiniDrawer divOpen={ 

                <div 
                    className="freight-content align-items-center"
                    style={{ paddingTop: '0px' }}
                >
                    
                    <div className="form-cadastro">
                        <h2>
                            Cadastro de cliente
                        </h2>
                        <div className="form-signin mx-auto mb-4 mb-lg-6">
                            <Card style={{padding: 8}} className="mb-3 mt-4">
                                <div className="col-12">
                                    <h5 className="mb-3">Dados pessoais</h5>
                                </div>

                                <div className="form-signin mx-auto mb-4 mb-lg-6">
                                    <div className="row">

                                            <div className="col-md-2">
                                                <label htmlFor="documentNumber" className="form-label">Tipo de cliente</label>
                                                <Select
                                                    defaultValue="Tipo de cliente"
                                                    onChange={(e) => {setTypePerson(e)}}
                                                    value={typePerson && typePerson}
                                                    options={[
                                                        {
                                                            value: 1,
                                                            label: 'Pessoa Física',
                                                        },
                                                        {
                                                            value: 2,
                                                            label: 'Pessoa Jurídica',
                                                        },
                                                    ]}
                                                    />
                                            </div>

                                            {/* {showJuridica(typePerson)} */}

                                            <div className="col-md-3">
                                                <label htmlFor="documentNumber" className="form-label">{typePerson === 2 ? 'CNPJ' : 'CPF' }</label>

                                                {showChangeType(typePerson)}
                                            </div>
                                        
                                            <div className="col-md-3">
                                                <label htmlFor="socialName" className="form-label">Razão Social</label>
                                                <Input 
                                                    placeholder="Razão Social"
                                                    onChange={(e)=> setSocialName(e.target.value)} 
                                                    value={socialName && socialName} 
                                                    id="socialName" 
                                                /> 

                                            </div>

                                            <div className="col-md-4">
                                                <label htmlFor="nameFantasy" className="form-label">Nome Fantasia</label>

                                                <Input 
                                                    placeholder="Nome fantasia"
                                                    onChange={(e)=> setNameFantasy(e.target.value)} 
                                                    value={nameFantasy && nameFantasy} 
                                                    id="nameFantasy" 
                                                /> 

                                            </div>
                                        
                                    </div>
                                </div>
                            </Card>
                            <Card style={{padding: 8}} className="mb-3 mt-4">
                                <div className="form-signin mx-auto mb-4 mb-lg-6">
                                    <div className="row">

                                        <div className="col-12" style={{ display: "flex", justifyContent: "flex-start", marginBottom: "10px", fontSize: "20px" }}>
                                            <label>Endereço Fiscal</label>
                                        </div>

                                        <div className="row">
                                            <div className="col-2">
                                                <label htmlFor="cep"  className="form-label">CEP</label>

                                                <InputMask mask="99999-999" className="form-control"
                                                    placeholder="CEP"
                                                    onChange={(e)=> {

                                                        buscarCep(e.target.value);
                                                        setCep(e.target.value);

                                                    }}
                                                    value={cep && cep}
                                                    id="cep"
                                                /> 

                                                {/* <input type="text"  
                                                    onChange={(e)=> {
                                                        buscarCep(e.target.value);
                                                        setCep(e.target.value);
                                                        
                                                    }}
                                                    value={cep && cep}  
                                                    className="form-control" 
                                                    id="cep" 
                                                /> */}

                                            </div>
                                            <div className="col-4">
                                                <label htmlFor="street" className="form-label">Endereço</label>

                                                <Input 
                                                    type="text"  
                                                    onChange={(e)=> setStreet(e.target.value)} 
                                                    value={street && street} 
                                                    placeholder="Endereço"
                                                />
                                                
                                                {/* <input type="text"  
                                                    onChange={(e)=> setStreet(e.target.value)} 
                                                    value={street && street}  
                                                    className="form-control" 
                                                    id="street" 
                                                /> */}
                                            </div>
                                            <div className="col-1">
                                                <label htmlFor="street" className="form-label">Número</label>

                                                <Input 
                                                    onChange={(e)=> setNumber(e.target.value)} 
                                                    value={number && number}  
                                                    placeholder="Número" 
                                                />

                                                {/* <input type="text"  
                                                    onChange={(e)=> setNumber(e.target.value)} 
                                                    value={number && number}  
                                                    className="form-control" 
                                                    id="street" 
                                                /> */}
                                            </div>

                                            <div className="col-md-2">
                                                <label htmlFor="neighborhood" className="form-label">Bairro</label>

                                                <Input 
                                                    onChange={(e)=> setNeighborhood(e.target.value)} 
                                                    value={neighborhood && neighborhood} 
                                                    placeholder="Bairro"
                                                />

                                                {/* <input type="text" 
                                                    onChange={(e)=> setNeighborhood(e.target.value)} 
                                                    value={neighborhood && neighborhood} 
                                                    className="form-control" 
                                                    id="neighborhood"/> */}
                                            </div>
                                            <div className="col-md-2">
                                                    <label htmlFor="city" className="form-label">Cidade</label>

                                                    <Input 
                                                        onChange={(e)=> setCity(e.target.value)} 
                                                        value={city && city} 
                                                        placeholder="Cidade"
                                                    />

                                                    {/* <input type="text" 
                                                        onChange={(e)=> setCity(e.target.value)} 
                                                        value={city && city} 
                                                        className="form-control" 
                                                        id="neighborhood"/> */}
                                                </div>

                                                <div className="col-md-1">
                                                    <label htmlFor="state" className="form-label">Estado</label>

                                                    <Input 
                                                        onChange={(e)=> setState(e.target.value)} 
                                                        value={state && state}  
                                                        placeholder="Estado"
                                                    />

                                                    {/* <input type="text"  
                                                        onChange={(e)=> setState(e.target.value)} 
                                                        value={state && state}  
                                                        id="state"/> */}
                                                </div>

                                        </div>
                                        {/* <div className="row">
                                            <div className="col-md-2">
                                                <label htmlFor="city" className="form-label">Latitude</label>

                                                <Input 
                                                        onChange={(e)=> setLatitude(e.target.value)} 
                                                        value={latitude && latitude} 
                                                        placeholder="Latitude"
                                                    />

                                            </div>

                                            <div className="col-md-2">
                                                <label htmlFor="state" className="form-label">Longitude</label>

                                                <Input 
                                                       onChange={(e)=> setLongitude(e.target.value)} 
                                                       value={longitude && longitude}  
                                                       placeholder="Longitude"
                                                    />

                                            </div>

                                        </div> */}
                                    </div>
                                </div>
                            </Card>

                            <Card style={{padding: 8}} className="mb-3 mt-4">
                                <div className="form-signin mx-auto mb-4 mb-lg-6">
                                    <div className="row">

                                        <div className="col-12" style={{ display: "flex", justifyContent: "flex-start", marginBottom: "10px", fontSize: "20px", fontWeight: "100" }}>
                                            <label>Endereço de Entrega</label>
                                        </div>
                                        
                                        <div className="row">
                                            <div className="col-2">
                                                <label htmlFor="cep"  className="form-label">CEP</label>

                                                <InputMask mask="99999-999" className="form-control" 
                                                    onChange={(e)=> {
                                                        buscarCepDelivery(e.target.value);
                                                        setCepDelivery(e.target.value);
                                                    }}
                                                    value={cepDelivery && cepDelivery}
                                                    placeholder="CEP"
                                                /> 

                                                {/* <input type="text"  
                                                    onChange={(e)=> {
                                                        buscarCep(e.target.value);
                                                        setCep(e.target.value);
                                                        
                                                    }}
                                                    value={cep && cep}  
                                                    className="form-control" 
                                                    id="cep" 
                                                /> */}

                                            </div>
                                            <div className="col-4">
                                                <label htmlFor="street" className="form-label">Endereço</label>

                                                <Input 
                                                    type="text"  
                                                    onChange={(e)=> setStreetDelivery(e.target.value)} 
                                                    value={streetDelivery && streetDelivery} 
                                                    placeholder="Endereço"
                                                /> 
                                                
                                                {/* <input type="text"  
                                                    onChange={(e)=> setStreet(e.target.value)} 
                                                    value={street && street}  
                                                    className="form-control" 
                                                    id="street" 
                                                /> */}
                                            </div>
                                            <div className="col-1">
                                                <label htmlFor="street" className="form-label">Número</label>

                                                <Input 
                                                    onChange={(e)=> setNumberDelivery(e.target.value)} 
                                                    value={numberDelivery && numberDelivery}  
                                                    placeholder="Número" 
                                                />

                                                {/* <input type="text"  
                                                    onChange={(e)=> setNumber(e.target.value)} 
                                                    value={number && number}  
                                                    className="form-control" 
                                                    id="street" 
                                                /> */}
                                            </div>

                                            <div className="col-md-2">
                                                <label htmlFor="neighborhood" className="form-label">Bairro</label>

                                                <Input 
                                                    onChange={(e)=> setNeighborhoodDelivery(e.target.value)} 
                                                    value={neighborhoodDelivery && neighborhoodDelivery} 
                                                    placeholder="Bairro"
                                                />

                                                {/* <input type="text" 
                                                    onChange={(e)=> setNeighborhood(e.target.value)} 
                                                    value={neighborhood && neighborhood} 
                                                    className="form-control" 
                                                    id="neighborhood"/> */}
                                            </div>
                                            <div className="col-md-2">
                                                    <label htmlFor="city" className="form-label">Cidade</label>

                                                    <Input 
                                                        onChange={(e)=> setCityDelivery(e.target.value)} 
                                                        value={cityDelivery && cityDelivery} 
                                                        placeholder="Cidade"
                                                    />

                                                    {/* <input type="text" 
                                                        onChange={(e)=> setCity(e.target.value)} 
                                                        value={city && city} 
                                                        className="form-control" 
                                                        id="neighborhood"/> */}
                                                </div>

                                                <div className="col-md-1">
                                                    <label htmlFor="state" className="form-label">Estado</label>

                                                    <Input 
                                                        onChange={(e)=> setStateDelivery(e.target.value)} 
                                                        value={stateDelivery && stateDelivery}  
                                                        placeholder="Estado"
                                                    />

                                                    {/* <input type="text"  
                                                        onChange={(e)=> setState(e.target.value)} 
                                                        value={state && state}  
                                                        id="state"/> */}
                                                </div>

                                        </div>
                                        {/* <div className="row">
                                            <div className="col-md-2">
                                                <label htmlFor="city" className="form-label">Latitude</label>

                                                <Input 
                                                        onChange={(e)=> setLatitudeDelivery(e.target.value)} 
                                                        value={latitudeDelivery && latitudeDelivery} 
                                                        placeholder="Latitude"
                                                    />
                                            </div>

                                            <div className="col-md-2">
                                                <label htmlFor="state" className="form-label">Longitude</label>

                                                <Input 
                                                       onChange={(e)=> setLongitudeDelivery(e.target.value)} 
                                                       value={longitudeDelivery && longitudeDelivery}  
                                                       placeholder="Longitude"
                                                    />

                                            </div>

                                        </div> */}
                                    </div>
                                </div>
                            </Card>

                            <Card style={{padding: 8}} className="mb-3 mt-4">
                                <div className="form-signin mx-auto mb-4 mb-lg-6">
                                    <div className="row">
                                        <div className="col-12">
                                            <h5 className="mb-3">Contato</h5>
                                        </div>

                                        <div className="col-md-4">
                                            <label htmlFor="phoneNumberFirst" className="form-label">Responsável </label>
                                                <Input 
                                                    onChange={(e)=> setResponsible(e.target.value)} 
                                                    value={responsible && responsible}  
                                                    placeholder="Contato"
                                                />
                                            {/* <input type="text"  
                                                    onChange={(e)=> setResponsible(e.target.value)} 
                                                    value={responsible && responsible}  
                                                    className="form-control" id="state"/> */}
                                        </div>
                                        <div className="col-4">
                                            <label htmlFor="phoneNumberSecond" className="form-label">Telefone </label>
                                            
                                                <InputMask mask="(99) 99999-9999" 
                                                    className="form-control" 
                                                    onChange={(e)=> setPhoneResp(e.target.value)} 
                                                    value={phoneResp && phoneResp} 
                                                    placeholder="(99) 99999-9999"/>
                                        </div>

                                        <div className="col-4">
                                            <label htmlFor="email" className="form-label">E-mail </label>
                                            <Input 
                                                    onChange={(e)=> setEmail(e.target.value)} 
                                                    value={email && email}  
                                                    placeholder="E-mail"
                                                />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="container">
                                <div className="row">
                                    <div className="col-4"></div>
                                    <div className="col-4"></div>
                                    <div className="col-4" style={{ display: 'flex', gap: '10px' }}>
                                        <div className="btn-class-cadastrar" style={{ flex: 1 }}>
                                            <Link to={"/clientList"}>
                                                <BackButton />
                                            </Link>
                                        </div>
                                        <div className="btn-class-cadastrar" style={{ flex: 1 }}>
                                            {
                                                carregando ? 
                                                <div className="spinner-border text-danger" role="status">
                                                <span className="visually-hidden ">Loading...</span></div>
                                                :
                                                <button type="submit" onClick={id ? update : save} className="w-100 btn btn-primary btn-cadastrar">{'Salvar'}</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    <div>
                        <Dialog
                            open={open}
                            onClose={handleClose}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                                <DialogTitle id="alert-dialog-title">
                                <h1>
                                    <i  class="fa fa-exclamation-triangle" style={{color: '#FEDE00'}} aria-hidden="true"></i> 
                                    {title}
                                </h1>
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText id="alert-dialog-description">
                                    <h6> {msg} </h6>
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <button 
                                        type="button" 
                                        onClick={handleClose} 
                                        className="btn btn-primary btn-cadastrar"> Ok</button>
                                </DialogActions>
                            </Dialog>
                        </div>
                    </div>
                </div>
            }/>
        </>
    )
}

export default NewClient;