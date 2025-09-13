import React, { useState } from "react";
import styled from 'styled-components';
import firebase from '../../config/firebase';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { useSelector, useDispatch } from 'react-redux';
import { Link, Navigate } from "react-router-dom";
import logoImage from '../../image/logo.jpeg';
import { Button } from "@mui/material";
import packageJson from '../../../package.json'
import { Footer } from "antd/es/layout/layout";
require('firebase/auth')

const auth = getAuth(firebase);

const Card = styled.div`
    display: flex;
    background-color: #f7f7f7;
    box-shadow: 0 0 60px rgba(0, 0, 0, 0.1);
    border-radius: 14px;
    max-width: 800px; /* Largura máxima do card */
    margin: 0 auto; /* Centralizar o card na tela */
    overflow: hidden; /* Para evitar que o conteúdo ultrapasse as bordas */
    margin-top: 200px;
    text-align: left;
`;
 
const LeftSide = styled.div`
  flex: 1;
  background-color: #012442;
  color: #fff;
  padding: 10px;
  text-align: center;
  // height: 50vh;
  width: 30px;
`;

const RightSide = styled.div`
  flex: 1.5;
  padding: 50px;

`;

const Title = styled.h1`
  font-size: 30px;
  margin-top: 50px;
  padding: 30px;
`;

const TitleRight = styled.h1`
  font-size: 30px;
  padding: 10px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin-bottom: 10px;
`;

const Logo = styled.img`
  max-width: 100%;
  height: auto;
  margin-bottom: 10px;
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 8px;
  align-items: left;
  width: 100% 
`;

const Input = styled.input`
  width: 100%;
  margin: 5px 0;
  padding: 10px;
  border: 0px;
  border-radius: 10px;
`;

// const Button = styled.button`
//   background-color: red;
//   color: white;
//   padding: 10px 20px;
//   border: none;
//   cursor: pointer;
//   width: 100%;
// `;


function Login(){

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [msgTipo, setMsgTipo] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showResetPassword, setShowResetPassword] = useState(false);

    const dispatch = useDispatch()

    function logar(){

        firebase.auth().signInWithEmailAndPassword(email, senha).then(resultado => {

            let uid = resultado.user.uid;

            firebase.firestore().collection('user_web').where("uid", "==", uid)
            .get()
                .then(async (result) => {
                    
                    result.docs.forEach((doc) => {

                        let uidShipper = doc.data().uidShipper; 
                        firebase.firestore().collection('shipper').doc(uidShipper)
                        .get()
                            .then(async (item) => {

                                    console.log(item)
                                    setMsgTipo('sucesso')
                                    dispatch({type: 'LOG_IN', usuarioEmail: email, user: doc.data(), shipper: item.data()})
                    
                            }).catch(error => {
                                console.log(error)
                            });
                    });
                    
                }).catch(error => {
                    console.log(error)
                });

        })
        .catch(async error => {
            
            if(error.message.indexOf('(auth/too-many-requests)') > 0){
                setMsgTipo('O acesso a essa conta foi temporariamente desabilitado, tente mais tarde ou contacte o administrador da sua empresa para resetar a senha. ')
            }
            else if(error.message.indexOf('(auth/wrong-password)') > 0){
                setMsgTipo('E-mail ou senha incorreto, tente novamente.')
            }
            else if(error.message.indexOf('(auth/user-not-found)') > 0){
                setMsgTipo('Esse usuário ainda não existe, por favor, solicite a sua empresa o devido acesso.')
            }
            else if(error.message.indexOf('(auth/invalid-email)') > 0){
                setMsgTipo('O e-mail informado não é um e-mail válido.')
            }
        });

    }

    const handleReset = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('E-mail de redefinição enviado. Verifique sua caixa de entrada.');
            setError('');
        } catch (err) {
            setError('Erro ao enviar e-mail. Verifique o endereço de e-mail.');
            setMessage('');
        }
    };

    return(
        <>

            {
                useSelector(state => state.usuarioLogado) > 0 ? <Navigate to='/' /> : null
            }

            <Card>
                <LeftSide>
                    <Title><br/>Bem-vindo de volta!</Title>
                    <Subtitle>Acesse sua conta agora mesmo</Subtitle>
                    <Logo src={logoImage} alt="Logo" />
                    <div>
                        Versão: {packageJson.version}
                    </div> 
                </LeftSide>
                <RightSide>
                   
                        <TitleRight>Login</TitleRight>
                        <Label style={{textAlign: 'left'}}>Informe seu e-mail</Label>
                        <Input 
                            type="text" 
                            name='email' 
                            required={true}
                            placeholder="Digite seu login"
                            onChange={(e)=> setEmail(e.target.value)} 
                        />
                        <Label style={{textAlign: 'left'}}>Informe sua senha</Label>
                        <Input 
                            type="password" 
                            name='password' 
                            required={true}
                            placeholder="Digite sua senha"
                            onChange={(e)=> setSenha(e.target.value)}  
                            />

                    <Button     
                        style={{
                              backgroundColor: 'red',
                              color: 'white',
                              padding: '10px',
                              border: 'none',
                              cursor: 'pointer',
                              width: '100%',
                              paddingTop: '10px',
                              marginTop: '20px',                              
                              borderRadius: '10px'
                              
                        }}
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className=""
                        onClick={logar}
                    >
                        Acessar
                    </Button>
                        {/* <Button 
                            style={{marginTop: '20px', borderRadius: '10px'}} 
                            onClick={logar} >
                                Entrar
                        </Button> */}
                    <div className="msg-login text-white text-center my-5">
                        <span style={{color: 'red'}}><strong>{msgTipo}</strong></span>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Button
                        variant="text"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        >
                        Redefinir Senha
                        </Button>
                    </div>

                    {showResetPassword && (
                        <div style={{ marginTop: '20px' }}>
                        <Input
                            type="email"
                            placeholder="Digite seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            style={{ marginTop: '10px' }}
                            onClick={handleReset}
                        >
                            Enviar link de redefinição
                        </Button>
                        {message && <p style={{ color: 'green' }}>{message}</p>}
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        </div>
                    )}
                </RightSide>

               
            </Card>




{/* 
            {
                useSelector(state => state.usuarioLogado) > 0 ? <Navigate to='/' /> : null
            }
            
            <Grid container style={{minHeight: '100vh'}} >

                <Grid item xs={12} sm={6}>
                    <div className="text-center md-4">
                        <img src={logo} 
                        style={{
                            width: '80%', 
                            height: '80%',
                            align: 'center',
                            paddingTop: '150px'
                         }} alt="brand" />
                    </div>
                </Grid>
                <Grid 
                    container
                    item
                    xs={12}
                    sm={6}
                    alignItems="center"
                    direction="column"
                    justify="space-between"
                    style={{paddingTop: "200px", minHeight: '100vh'}}
                >

                    <div/>
                    <div>

                        <Container component="main" maxWidth="xs">
                            <CssBaseline />
                            <div className="">
                                    <LocationOnIcon style={
                                        {
                                            color: '#FDC100', 
                                            height: '100px',
                                            display: "flex",
                                            direction: "column",
                                            alignItems: "center",
                                            width: '100%'
                                        }}/>
                                
                                <Typography component="h1" variant="h5" align="center">
                                    Área Reservada
                                </Typography>
                                    <TextField
                                        variant="outlined"
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Endereço de Email"
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                        // value={email}
                                        onChange={(e)=> setEmail(e.target.value)}
                                    />
                                    <TextField
                                        variant="outlined"
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="password"
                                        label="Senha"
                                        type="password"
                                        id="password"
                                        autoComplete="current-password"
                                        // value={senha}
                                        onChange={(e)=> setSenha(e.target.value)}
                                    />
                                    <FormControlLabel
                                        control={
                                        <Switch
                                            name="lembrar"
                                        />
                                        }
                                        label="Lembrar o usuário"
                                    />
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        className=""
                                        onClick={logar}
                                    >
                                        Acessar
                                    </Button>
                                    <Grid container>
                                        <Grid item xs>
                                            <Link to="#" variant="body2">
                                                Esqueceu a senha?
                                            </Link>
                                        </Grid>
                                        <Grid item>
                                            <Link to="/newUser" variant="body2">
                                                {"Ainda não tem uma conta?"}
                                            </Link>
                                        </Grid>
                                    </Grid> 
                            </div>
                        </Container>

                        <div className="msg-login text-white text-center my-5">
                            {msgTipo == 'sucesso' && <span style={{color: 'red'}}><strong>WOW, voce está conectado</strong></span>}
                            {msgTipo == 'erro' && <span style={{color: 'red'}}><strong>WOW, voce está DESconectado</strong></span>}
                        </div>
                    </div>

                    <Box mt={8}>
                        <Typography variant="body2" color="textSecondary" align="center">
                        Copyright © Fortio {" "}
                        {new Date().getFullYear()}
                        {"."}
                        </Typography>
                        
                    </Box>
                </Grid>
            </Grid> */}


            {/* {
                useSelector(state => state.usuarioLogado) > 0 ? <Navigate to='/' /> : null
            }

            <div className="form-signin mx-auto">
                <div className="text-center md-4">
                    <img className="mb-4" src="/docs/5.1/assets/brand/bootstrap-logo.svg" alt="" width="72" height="57"/>
                    <h1 className="h3 mb-3 font-weight text-white font-weight-bold ">Por favor, faça o login</h1>
                </div>
                
                <input onChange={(e)=> setEmail(e.target.value)} type="email" className="form-control my-2" id="inputEmail" placeholder="E-mail"/>
                <input onChange={(e)=> setSenha(e.target.value)} type="password" className="form-control my-2" id="inputPassword" placeholder="Senha"/>

                <button onClick={logar} className="w-100 btn btn-lg btn-login" type="submit">Login</button>

                <div className="msg-login text-white text-center my-5">
                    {msgTipo == 'sucesso' && <span><strong>WOW,</strong> voce está conectado</span>}
                    {msgTipo == 'erro' && <span><strong>WOW,</strong> voce está DESconectado</span>}
                </div>

                <div className="opcoes-login mt-5">
                    <a href="#" className="mx-2">Recuperar senha</a>
                    <Link to="/newUser" className="mx-2">Quero Cadastrar</Link>

                </div>
            </div> */}

        </>
    )
}

export default Login;