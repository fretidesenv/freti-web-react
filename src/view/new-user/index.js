import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import './new-user.css'
import firebase from '../../config/firebase';
import { useNavigate, useParams, Link } from "react-router-dom";
import Radio from '@mui/material/Radio';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import InputMask from 'react-input-mask';
import BackButton from "../../components/backButton/BackButton";
import '../../view/frete/freight.css'
import NewMiniDrawer from "../../components/navMenu/menu-nav";
require('firebase/auth')

function NewUser(){
    
    const {id} = useParams();

    let navigate = useNavigate();

    const [email, setEmail] = useState();
    const [senha, setSenha] = useState();
    const [senha2, setSenha2] = useState();
    const [perfil, setPerfil] = useState("0");
    const [name, setName] = useState();
    const [cpf, setCpf] = useState();
    const [shippers, setShippers] = useState([]);
    const [shipper, setShipper] = useState("0");
    const [nameShipper, setNameShipper] = useState();
    const [phoneNumber, setPhoneNumber] = useState();
    const [ativo, setAtivo] = useState();

    const [msgTipo, setMsgTipo] = useState();
    const [carregando, setCarregando] = useState(1);
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState();
    const [title, setTitle] = useState();

    const user = useSelector(state => state.user)

    let shipperList = [];

        // function findShipper(socialName){

        //     firebase.firestore().collection('shipper')
        //     .doc()
        //     .get()
        //     .then(snapshot => {
        //         if (!snapshot.empty) {
        //             const doc = snapshot.docs[0];
        //             setShipper(doc.id);
        //             setNameShipper(socialName);
        //         }
        //         else if (socialName === "Embarcadora") {
        //             setShipper("0");
        //             setNameShipper("Embarcadora");
        //         }
        //         else {
        //             console.log("Nenhum shipper encontrado com esse socialName.");
        //         }
        //         setCarregando(0);
        //     })
        //     .catch(error => {
        //         console.log("Erro ao buscar shipper:", error);
        //         setCarregando(0);
        //     });
        // }


    useEffect(() => {

        if(user.perfil == "Master"){

            firebase.firestore().collection('shipper')
                .get().then( async (result) => {
                        result.docs.forEach(doc => {
                            shipperList.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        })
                    setShippers(shipperList)
                    setCarregando(0)
                }).catch(error => {
                    setCarregando(0)
                    console.log(error)
            });		

        }else{

            firebase.firestore().collection('shipper')
                .doc(user.uidShipper)
                .get().then( async (result) => {
                    shipperList.push(result.data());
                    setShippers(shipperList)
                    setCarregando(0)
                }).catch(error => {
                    setCarregando(0)
                    console.log(error)
                });

        }

        
        if(id){
    
            firebase.firestore().collection('user_web').doc(id)
            .get().then( async (result) => {
            
                var userData = result.data();
                setName(userData?.name);
                setCpf(userData?.cpf);
                setEmail(userData?.email);
                setPhoneNumber(userData?.phoneNumber);
                setPerfil(userData?.perfil);
                setShipper(userData?.uidShipper);
                setAtivo(userData?.ativo)
            }).catch(error => {
                setCarregando(0)
                console.log(error)
            });
        }
            
    },[carregando]);
        


    function save(){

        setCarregando(1);

        
        
        if(!email || !senha || !name || !perfil || !cpf || !phoneNumber){
            setMsgTipo('erro');
            setMsg('Todos os campos são de preenchimento obrigatório.');
            setTitle(' Oops!')
            setOpen(true)
            return;
        }

        if(shipper == "0"){
            setMsgTipo('erro');
            setMsg('Por favor, escolha um Embarcador válido');
            setTitle(' Oops!')
            setOpen(true)
            return;
        }

        if(perfil == "0"){
            setMsgTipo('erro');
            setMsg('Por favor, escolha um Perfil válido');
            setTitle(' Oops!')
            setOpen(true)
            return;
        }

        if(senha.length < 6){
            setMsgTipo('erro');
            setMsg('A senha deve ter pelo menos 6 caracteres');
            setTitle(' Oops!')
            setOpen(true)
            return;
        }

        if(senha != senha2){
            setMsgTipo('erro');
            setMsg('Senha diferente da confirmação, Por favor tentar novamente.');
            setTitle(' Oops! ')
            setOpen(true)
            return;
        }

        firebase.auth().createUserWithEmailAndPassword(email, senha)
        .then(async resultado => {
            let uid = resultado.user.uid;

            let dataUser = {
                uid: uid,
                email: resultado.user.email,
                perfil: perfil,
                name: name,
                cpf: cpf,
                ativo: ativo,
                phoneNumber: phoneNumber,
                accountCreated: new Date(),
                uidShipper: shipper
            }

            console.log(dataUser)

            firebase.firestore().collection('user_web').add(dataUser).then(() => {
                setCarregando(0)
                setMsgTipo('sucesso')
                navigate("/userList");
            }).catch(error => {
                setMsgTipo('erro')
                setCarregando(0)
            });

            setCarregando(0)
            setMsgTipo('sucesso')
        })
        .catch(error => {
            setCarregando(0)
            setMsgTipo('erro')
            switch (error.message) {
                case 'Firebase: Password should be at least 6 characters (auth/weak-password).':
                    setMsg('A senha deve ter pelo menos 6 caracteres')
                    setMsgTipo('erro');
                    setTitle(' Oops!')
                    setOpen(true)
                    break;
                case 'Firebase: The email address is already in use by another account. (auth/email-already-in-use).':
                    setMsg('Este e-mail já está sendo utilizado por outro usuário')
                    setMsgTipo('erro');
                    setTitle(' Oops!')
                    setOpen(true)
                    break;
                case 'Firebase: The email address is badly formatted. (auth/invalid-email).':
                    setMsg('O formato do seu e-mail é inválido!')
                    setMsgTipo('erro');
                    setTitle(' Oops!')
                    setOpen(true)
                    break;
                default:
                    setMsg('Não foi possível cadastrar. Tente novamente mais tarde ou contate o administrador!')
                    setMsgTipo('erro');
                    setTitle(' Oops!')
                    setOpen(true)
                    break;
            }
        });

    }

    const handleClose = () => {
        setOpen(false);
    };


    function update(){
        console.log("update")
        setCarregando(1);

        if(shipper == "0"){
            setMsgTipo('erro');
            setMsg('Por favor, escolha um Embarcador válido');
            setTitle(' Oops!')
            setOpen(true)
            return;
        }

        if(perfil == "0"){
            setMsgTipo('erro');
            setMsg('Por favor, escolha um Perfil válido');
            setTitle(' Oops!')
            setOpen(true)
            return;
        }

        if(senha && senha != "" && senha.length < 6){
            setMsgTipo('erro');
            setMsg('A senha deve ter pelo menos 6 caracteres');
            setTitle(' Oops!')
            setOpen(true)
            return;
        }

        if(senha && senha != "" && senha != senha2){
            setMsgTipo('erro');
            setMsg('Senha diferente da confirmação, Por favor tentar novamente.');
            setTitle(' Oops! ')
            setOpen(true)
            return;
        }

        if(!email || !name || !perfil || !cpf || !phoneNumber){
            setMsgTipo('erro');
            setMsg('Todos os campos são de preenchimento obrigatório.');
            setTitle(' Oops!')
            setOpen(true)
            return;
        }


        //Se a senha for 
        if(senha){
            var user = firebase.auth().currentUser;

            user.updatePassword(senha).then(() => {
                console.log("Password updated!");
            }).catch((error) => { 
                console.log(error); 

                switch (error.message) {
                    case 'Firebase: This operation is sensitive and requires recent authentication. Log in again before retrying this request. (auth/requires-recent-login).':
                        setMsg('Essa operação é muito sensiva e requer uma autenticação recente, por favor realizar o login novamente antes de alterar.')
                        setMsgTipo('erro');
                        setTitle(' Oops!')
                        setOpen(true)
                        break;
                    default:
                        setMsg('Não foi possível cadastrar. Tente novamente mais tarde ou contate o administrador!')
                        setMsgTipo('erro');
                        setTitle(' Oops!')
                        setOpen(true)
                        break;
                }

            });
        }


        let dataUser = {
            email: email,
            perfil: perfil,
            name: name,
            cpf: cpf,
            ativo: ativo,
            phoneNumber: phoneNumber,
            accountUpdate: new Date(),
            nameShipper: nameShipper,
            uidShipper: shipper
        }

        console.log(dataUser)

        firebase.firestore().collection('user_web').doc(id).update(dataUser).then(() => {
            setCarregando(0)
            setMsgTipo('sucesso')    

            navigate("/userList");
            
        }).catch(error => {
            setMsgTipo('erro')
            setCarregando(0)
        });

    }

    const handleStatus = (event) => {
        setAtivo(event.target.value);
    };

    
    return(
        <>
            <NewMiniDrawer divOpen={ 

                <div className="form-cadastro" style={{ alignContent: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="text-center form-login mx-auto mt-5">

                        <h1 className="h3 mb-3 text-black font-weight-bold" >Cadastro de usuário ao sistema</h1>

                        <div className="row">
                            <div className="col-md-2">
                            </div>
                            <div className="col-md-8">
                                <input  onChange={(e)=> setName(e.target.value)} type="text" value={name && name} className="form-control my-2" placeholder="Nome" />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-2">
                            </div>

                            <div className="col-md-4">
                                <InputMask mask="999.999.999-99" 
                                    placeholder="CPF"
                                    value={cpf && cpf}
                                    className="form-control" 
                                    onChange={(e)=> setCpf(e.target.value)}
                                />
                            </div>
                            <div className="col-md-4">
                                <InputMask mask="(99) 99999-9999" 
                                    placeholder="Telefone"
                                    value={phoneNumber && phoneNumber}
                                    className="form-control" 
                                    onChange={(e)=> setPhoneNumber(e.target.value)}
                                />
                            </div>

                        </div>

                        <div className="row">
                            <div className="col-md-2">
                            </div>

                            <div className="col-md-8">
                                <input  onChange={(e)=> setEmail(e.target.value)} disabled={id ? true : false} value={email && email} type="email" className="form-control my-2" placeholder="E-mail" />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-2">
                            </div>

                            <div className="col-4">
                                <input  onChange={(e)=> setSenha(e.target.value)} type="password" className="form-control my-2" placeholder="Senha" />
                            </div>
                            <div className="col-4">
                                <input  onChange={(e)=> setSenha2(e.target.value)} type="password" className="form-control my-2" placeholder="Repetir a senha" />
                            </div>

                        </div>

                        <div className="row " >
                            <div className="col-md-2">
                            </div>

                            <div className="col-8">
                                <select className="form-select" id="formPerfil" value={perfil && perfil} onChange={(e)=> setPerfil(e.target.value)} aria-label="">
                                    <option defaultValue="0">Escolha o perfil</option>
                                    {user.uidShipper == "N9wCdHa6NmKCudo6FUtK" ? 
                                            <option value="Master">Master </option>
                                        : 
                                            ""
                                    }
                                    <option value="Admin">Admin </option>
                                    <option value="Comercial">Comercial </option>
                                    <option value="Operacional">Operacional </option>
                                    {user.uidShipper == "N9wCdHa6NmKCudo6FUtK" ? 
                                            <option value="Terceiros">Terceiros </option>
                                        : 
                                            ""
                                    }
                                    
                                    
                                </select>

                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-md-2">
                            </div>

                            <div className="col-8">
                                <select className="form-select" id="companyShipper" value={shipper && shipper} onChange={(e)=> setShipper(e.target.value)} aria-label="">
                                    <option defaultValue="0">Embarcadora</option>
                                    {
                                        shippers.map(item => (
                                            <option value={item.id}>{item.dataPersonal.socialName}</option>
                                        ))
                                    }
                                </select>

                            </div>
                        </div>

                        <div className="row mt-4">
                            <div className="col-md-2">
                            </div>
                            <div className="col-md-2">

                                <Radio
                                    checked={ativo === 'Ativo'}
                                    onChange={handleStatus}
                                    value="Ativo"
                                    name="radio-buttons"
                                    inputProps={{ 'aria-label': 'A' }}
                                />
                                <label class="" for="btnradio1">Ativo</label>

                            </div>
                                
                            <div className="col-2">
                                <Radio
                                    checked={ativo === 'Inativo'}
                                    onChange={handleStatus}
                                    value="Inativo"
                                    name="radio-buttons"
                                    inputProps={{ 'aria-label': 'A' }}
                                />
                                <label class="" for="btnradio1">Inativo</label>

                            </div>
                        </div>

                        {
                            carregando ? 
                            <div class="spinner-border text-danger" role="status">
                            <span class="visually-hidden">Loading...</span></div>
                            :
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginRight: '25%', marginLeft: '25%'}}>
                                <Link style={{ flex: 1 }} to={"/userList"}>
                                    <BackButton />
                                </Link>
                                <button style={{ flex: 1 }} onClick={id ? update : save} type="button" className="w-100 btn btn-primary btn-cadastrar">Cadastrar</button>
                            </div>
                        }

                        <div className="msg-login text-black text-center my-5">
                            {msgTipo == 'sucesso' && <span><strong>WOW,</strong> Usuário cadastrado com sucesso!</span>}
                            {msgTipo == 'erro' && <span><strong>WOW,</strong> {msg}</span>}
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
            }/>
        </>
    )
}

export default NewUser;