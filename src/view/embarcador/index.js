import React, { useEffect, useState } from "react";
import firebase, { storage } from '../../config/firebase';
import { useNavigate, useParams, Link } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import { Card, IconButton } from "@mui/material";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import InputMask from 'react-input-mask';
import BackButton from "../../components/backButton/BackButton";
import { useSelector } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageZoom from '../../components/imageZoom';
import Button from '@mui/material/Button';
import { ref, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage";
import NewMiniDrawer from "../../components/navMenu/menu-nav";
import AlertDialog from "../../components/dialog";
import AlertDialogCertificate from "../../components/dialog/indexCertificate";
import { set } from "date-fns";
require('firebase/auth')

function NewEmbarcador(){
    
    const {id} = useParams();

    let navigate = useNavigate();

    const user = useSelector(state => state.user);

    const [socialName, setSocialName] = useState("");
    const [nameFantasy, setNameFantasy] = useState("");
    const [documentNumber, setDocumentNamber] = useState("");
    const [inscricaoEstadual, setInscricaoEstadual] = useState("");
    
    const [phoneNumberFirst, setPhoneNumberFirst] = useState("");
    const [phoneNumberSecond, setPhoneNumberSecond] = useState("");

    const [cep, setCep] = useState("");
    const [neighborhood, setNeighborhood] = useState("");//bairro
    const [street, setStreet] = useState("");//endereço
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [numeroEndereco, setNumeroEndereco] = useState("");
    const [complement, setComplement] = useState("");

    const [serie, setSerie] = useState("");
    const [number, setNumber] = useState("");
    const [typeEmitente, setTypeEmitente] = useState("");
    const [typeEmissao, setTypeEmissao] = useState("Normal");
    const [responsavelSeguro, setResponsavelSeguro] = useState("Próprio");

    const [msgTipo, setMsgTipo] = useState();
    const [carregando, setCarregando] = useState(0);
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState();
    const [title, setTitle] = useState();

    const [photo, setPhoto] = useState(null);
    const [photoURL, setPhotoURL] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [passwordCertificate, setPasswordCertificate] = useState(null);
    const [documentCertificate, setDocumentCertificate] = useState(null);
    const [openCertificate, setOpenCertificate] = useState(false);
    const [origem, setOrigem] = useState(null);

    const [serialNumber, setSerialNumber] = useState(null);
    const [issuerName, setIssuerName] = useState(null);
    const [notValidBefore, setNotValidBefore] = useState(null);
    const [notValidAfter, setNotValidAfter] = useState(null);
    const [thumprint, setThumprint] = useState(null);
    const [subjectName, setSubjectName] = useState(null);
    const [cpfCnpj, setCpfCnpj] = useState(null);
    const [nameCompany, setNameCompany] = useState(null);

    const [documentCertificateInfo, setDocumentCertificateInfo] = useState(null);

    const [contatos, setContatos] = useState([createContatos()]);

    function createContatos() {
        return {
            nome: '',
            funcao: '',
            telefone: '',
            email: '',
            recebeEmail: false,
        };
    }

    const handleChangeMaisContato = (index, field, value) => {
        const newContatos = [...contatos];
        newContatos[index][field] = value;
        setContatos(newContatos);
    };

    const adicionarContato = () => {
        setContatos([...contatos, createContatos()]);
    };
    const removerContato = (index) => {
        setContatos(contatos.filter((_, i) => i !== index));
    };

    const db = firebase.firestore();

    useEffect(() => {

        if (id) {

            firebase.firestore().collection('shipper').doc(id)
                .get().then( async (result) => {
                    
                    var data = result.data();
                    if(id) {
                        setSocialName(data.dataPersonal.socialName)
                        setDocumentNamber(data.dataPersonal.documentNumber)
                        setNameFantasy(data.dataPersonal.nameFantasy)
                        setInscricaoEstadual(data.dataPersonal.inscricaoEstadual)
                        setPhoneNumberFirst(data.contact.phoneNumberFirst)
                        setPhoneNumberSecond(data.contact.phoneNumberSecond)

                        setCep(data.address.cep)
                        setStreet(data?.address.street)
                        setNeighborhood(data?.address.neighborhood)
                        setCity(data?.address.city)
                        setState(data?.address.state)
                        setNumeroEndereco(data?.address.numeroEndereco)
                        setComplement(data?.address.complement)

                        setSerie(data.mdfe.serie)
                        setNumber(data.mdfe.number)
                        setTypeEmitente(data.mdfe.typeEmitente)
                        setTypeEmissao(data.mdfe.typeEmissao)
                        setResponsavelSeguro(data.mdfe.responsavelSeguro)
                        setDocumentCertificate(data.infoCertificate?.certificate)

                        setPhotoPreview(data.logo)

                        setPasswordCertificate(data.infoCertificate?.passwordCertificate ? data.infoCertificate?.passwordCertificate : "")
                        setSerialNumber(data.infoCertificate?.serialNumber ? data.infoCertificate?.serialNumber : "")
                        setIssuerName(data.infoCertificate?.issuerName ? data.infoCertificate?.issuerName : "")
                        setNotValidBefore(data.infoCertificate?.notValidBefore ? data.infoCertificate?.notValidBefore : "")
                        setNotValidAfter(data.infoCertificate?.notValidAfter ? data.infoCertificate?.notValidAfter : "")
                        setThumprint(data.infoCertificate?.thumbprint ? data.infoCertificate?.thumbprint : "")
                        setSubjectName(data.infoCertificate?.subjectName ? data.infoCertificate?.subjectName : "")
                        setCpfCnpj(data.infoCertificate?.cpfCnpj ? data.infoCertificate?.cpfCnpj : "")
                        setNameCompany(data.infoCertificate?.nameCompany ? data.infoCertificate?.nameCompany : "")
                    }

                }).catch(error => {
                    setCarregando(0)
                    console.log(error)
                });
        }
            
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
                    setNumeroEndereco(data?.numero)
                    setComplement(data?.complemento)

                }
            })
            .catch(err => console.log(err));
        }
    }

    function buscarCNPJ(input) {
        if(input.length === 14) {
            fetch('https://open.cnpja.com/office/'+input, {mode: 'cors'})
            .then((res) => res.json())
            .then((data) => {
                if (data.hasOwnProperty("erro")) {
                    alert('CNPJ não existente');
                } else {
                    setSocialName(data?.company?.name)
                    setDocumentNamber(data?.taxId)
                    setNameFantasy(data?.alias ? data?.alias : data?.company?.name)
                    // setPhoneNumberFirst(data?.telefone1)
                    // setPhoneNumberSecond(data?.ddd_telefone_2 ? "" : data?.telefone1)
                    // setCep(data?.endereco.cep)
                    // setStreet(data?.endereco.logradouro)
                    // setNeighborhood(data?.endereco.bairro)
                    // setCity(data?.endereco.municipio)
                    // setState(data?.endereco.uf)
                    // setNumeroEndereco(data?.endereco.numero)
                    // setComplement(data?.endereco.complemento)
                }
            })
            .catch(err => console.log(err));
        } else if (input.length === 18) {
            const inputLimpo = input.replace(/[^\d]/g, "");
            fetch('https://open.cnpja.com/office/'+inputLimpo, {mode: 'cors'})
            .then((res) => res.json())
            .then((data) => {
                if (data.hasOwnProperty("erro")) {
                    alert('CNPJ não existente');
                } else {
                    setSocialName(data?.company?.name)
                    setDocumentNamber(data?.taxId)
                    setNameFantasy(data?.alias ? data?.alias : data?.company?.name)
                    // setSocialName(data?.razao_social)
                    // setDocumentNamber(data?.cnpj)
                    // setNameFantasy(data?.nome_fantasia ? data?.nome_fantasia : data?.razao_social)
                    // setPhoneNumberFirst(data?.telefone1)
                    // setPhoneNumberSecond(data?.ddd_telefone_2 ? "" : data?.telefone1)
                    // setCep(data?.endereco.cep)
                    // setStreet(data?.endereco.logradouro)
                    // setNeighborhood(data?.endereco.bairro)
                    // setCity(data?.endereco.municipio)
                    // setState(data?.endereco.uf)
                    // setNumeroEndereco(data?.endereco.numero)
                    // setComplement(data?.endereco.complemento)
                }
            })
            .catch(err => console.log(err));
        } else {
            return;
        }
    }

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);

            const reader = new FileReader();
            reader.onload = (event) => {
                setPhotoPreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    async function save(){
        setCarregando(1)

        let photoURL = null;
        if (photo) {
            try {
                const imageBitmap = await createImageBitmap(photo);
                const { width, height } = imageBitmap;

                if (width > 606 || height > 242) {
                    alert("A imagem selecionada é grande. Ela será redimensionada para no máximo 606x242 pixels.");
                }

                const storageRef = ref(storage, `files/logo/${nameFantasy}`);

                await uploadBytesResumable(storageRef, photo);

                photoURL = await getDownloadURL(storageRef);

            } catch (error) {
                console.error("Erro ao salvar:", error);
            }
        };

        var history = {
            created: new Date()
        }

        var dataPersonal = {
            socialName: socialName,
            documentNumber: documentNumber,
            nameFantasy: nameFantasy,
            inscricaoEstadual: inscricaoEstadual,
        }

        var contact = {
            phoneNumberFirst: phoneNumberFirst,
            phoneNumberSecond: phoneNumberSecond
        }

        var address = {
            cep: cep,
            street: street,
            neighborhood: neighborhood,
            city: city,
            state: state,
            numeroEndereco: numeroEndereco,
            complement: complement,
        }

        var mdfe = {
            serie: serie,
            number: number,
            typeEmitente: typeEmitente,
            typeEmissao: typeEmissao,
            responsavelSeguro: responsavelSeguro
        }

        var infoCertificate = {
            certificate: documentCertificate ? documentCertificate : "",
            passwordCertificate: passwordCertificate ? passwordCertificate : "",
            serialNumber: documentCertificateInfo?.serial_number ? documentCertificateInfo?.serial_number : "",
            issuerName: documentCertificateInfo?.issuer_name ? documentCertificateInfo?.issuer_name : "",
            notValidBefore: documentCertificateInfo?.not_valid_before ? documentCertificateInfo?.not_valid_before : "",
            notValidAfter: documentCertificateInfo?.not_valid_after ? documentCertificateInfo?.not_valid_after : "",
            thumbprint: documentCertificateInfo?.thumbprint ? documentCertificateInfo?.thumbprint : "",
            subjectName: documentCertificateInfo?.subject_name ? documentCertificateInfo?.subject_name : "",
            cpfCnpj: documentCertificateInfo?.cpf_cnpj ? documentCertificateInfo?.cpf_cnpj : "",
            nameCompany: documentCertificateInfo?.nome_razao_social ? documentCertificateInfo?.nome_razao_social : ""
        }

        var dataAll = {
            dataPersonal: dataPersonal,
            contact: contatos,
            address: address,
            history: history,
            logo: photoURL,
            mdfe: mdfe,
            infoCertificate: infoCertificate,
        }

        try {
            await db.collection("shipper").add(dataAll);

            setCarregando(0);
            setMsgTipo('sucesso');
            navigate("/embarcador");
        } catch (error) {
            setMsgTipo('erro');
            setCarregando(0);
            setTitle('Ops!');
            setMsg('Houve um problema interno ao recuperar os dados do Embarcador');
            setOpen(true);
        }
    }

    const handleClose = () => {
        setOpen(false);
    };

    const handleCloseCertificate = () => {

        setOpenCertificate(false);
    };

    async function update(){
        setCarregando(1)

        let photoURL = null;
        if (photo) {
            try {

                const imageBitmap = await createImageBitmap(photo);
                const { width, height } = imageBitmap;

                if (width > 606 || height > 242) {
                    alert("A imagem selecionada é grande. Ela será redimensionada para no máximo 606x242 pixels.");
                }

                const storageRef = ref(storage, `files/logo/${nameFantasy}`);

                await uploadBytesResumable(storageRef, photo);

                photoURL = await getDownloadURL(storageRef);

            } catch (error) {
                console.error("Erro ao salvar:", error);
            }
        };
        
        var history = {
            created: new Date()
        }

        var dataPersonal = {
            socialName: socialName,
            documentNumber: documentNumber,
            nameFantasy: nameFantasy,
            inscricaoEstadual: inscricaoEstadual ? inscricaoEstadual : '',
        }

        var contact = {
            phoneNumberFirst: phoneNumberFirst ? phoneNumberFirst : '',
            phoneNumberSecond: phoneNumberSecond ?  phoneNumberSecond : ''
        }

        var address = {
            cep: cep ? cep : '',
            street: street ? street : '',
            neighborhood: neighborhood ? neighborhood : '',
            city: city? city : '',
            state: state ?  state : '',
            numeroEndereco: numeroEndereco ? numeroEndereco : '',
            complement: complement ? complement : '',
        }

        var mdfe = {
            serie: serie ? serie : '',
            number: number ? number : '',
            typeEmitente: typeEmitente ? typeEmitente : '',
            typeEmissao: typeEmissao ? typeEmissao : 'Normal',
            responsavelSeguro: responsavelSeguro ? responsavelSeguro : 'Proprio'
        }

        if (documentCertificate && Object.keys(documentCertificate).length > 0) {
            var infoCertificate = {
                certificate: documentCertificate || infoCertificate?.certificate || "",
                passwordCertificate: passwordCertificate || infoCertificate?.passwordCertificate || "",
                serialNumber: documentCertificateInfo?.serial_number || serialNumber || "",
                issuerName: documentCertificateInfo?.issuer_name || issuerName || "",
                notValidBefore: documentCertificateInfo?.not_valid_before || notValidBefore || "",
                notValidAfter: documentCertificateInfo?.not_valid_after || notValidAfter || "",
                thumbprint: documentCertificateInfo?.thumbprint || thumprint || "",
                subjectName: documentCertificateInfo?.subject_name || subjectName || "",
                cpfCnpj: documentCertificateInfo?.cpf_cnpj || cpfCnpj || "",
                nameCompany: documentCertificateInfo?.nome_razao_social || nameCompany || ""
            }
        }
        else {
            var infoCertificate = {
                certificate: "",
                passwordCertificate: "",
                serialNumber: "",
                issuerName: "",
                notValidBefore: "",
                notValidAfter: "",
                thumbprint: "",
                subjectName: "",
                cpfCnpj: "",
                nameCompany: ""
            }
        }

        var dataAll = {
            dataPersonal: dataPersonal,
            contact: contatos,
            address: address,
            history: history,
            logo: photoURL,
            mdfe: mdfe,
            infoCertificate: infoCertificate,
        }

        try {
            await db.collection("shipper").doc(id).update(dataAll);

            setCarregando(0);
            setMsgTipo('sucesso');
            if (user?.perfil === "Master") {
                navigate("/embarcador");
            }
            else {
                setTitle('Sucesso!');
                setMsg('Embarcador atualizado com sucesso!');
                setOpen(true);
            }
        } catch (error) {
            setMsgTipo('erro');
            setCarregando(0);
            setTitle('Ops!');
            setMsg('Houve um problema interno ao recuperar os dados do Embarcador');
            setOpen(true);
        }

    }


    const handleCreateSerie = (e) => {
        const value = e.target.value;
        
        if (value.length <= 3) {  
            setSerie(value);

            //cria um sequencial para o campo number
            const sequencial = parseInt(0, 10) + 1;
            setNumber(sequencial.toString().padStart(9, '0')); // Preenche com zeros à esquerda até 9 dígitos

        }
    }


    const handleDelete = async (downloadUrl) => {
        try {
            // Extrair o caminho do arquivo a partir da URL
            const pathStart = downloadUrl.indexOf("/o/") + 3;
            const pathEnd = downloadUrl.indexOf("?", pathStart);
            const encodedPath = downloadUrl.substring(pathStart, pathEnd);
            const filePath = decodeURIComponent(encodedPath);

            // Referência ao arquivo no Firebase Storage
            const fileRef = ref(storage, filePath);

            // Deletar o arquivo
            await deleteObject(fileRef);

            console.log("Certificado excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir o arquivo:", error);
            alert("Erro ao excluir o arquivo.");
        }
    };

    const handleClickOpen = () => {
        setOpenCertificate(true);
    };

    const handleUpload = (file, passwordCertificate, certInfo) => {

        if(!file) return;

        if (file && passwordCertificate) {

            if (certInfo) {
                setDocumentCertificateInfo(certInfo);
                setPasswordCertificate(passwordCertificate);
            }
            // return;
        }

        // return;

        var contest = file;

        const storageRef = ref(storage, `shipper/certificate/${id}/${contest.name}`);

        const uploadTask = uploadBytesResumable(storageRef, contest);

        uploadTask.on("state_changed", 
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            },
            (error) => {
                alert(error)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    if(origem === "documentCertificate"){
                        setDocumentCertificate(downloadURL)
                        setOpenCertificate(false)
                        setOrigem("")
                    }
                    
                });
        })
    }

    function formatDate(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date)) return "";
        return date.toLocaleDateString('pt-BR');
    }

    return(
        <>
            <NewMiniDrawer divOpen={ 

                <div 
                    className="freight-content align-items-center"
                    style={{ paddingTop: '0px' }}
                >

                {origem === "documentCertificate" ? (
                    <AlertDialogCertificate
                        handleClose={handleCloseCertificate}
                        open={openCertificate}
                        origem={origem}
                        handleUpload={handleUpload}
                    />
                ) : (
                    <AlertDialog
                        handleClose={handleCloseCertificate}  
                        open={openCertificate}
                        origem={origem}
                        handleUpload={handleUpload}
                    />
                )}
                    
                    <div className="form-cadastro">
                        
                        <h2>
                            Cadastro de Embarcador
                        </h2>
                        
                        <div className="form-signin mx-auto mb-4 mb-lg-6">

                            <Card style={{padding: 8}} className="mb-3 mt-4">
                                <div className="col-12">
                                    <h4 className="mb-3">Veículo Tração</h4>
                                </div>

                                <div className="form-signin mx-auto mb-4 mb-lg-6">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <label htmlFor="documentNumber" className="form-label">CNPJ</label>
                                            <input type="text" 
                                                    onChange={(e)=> {
                                                    buscarCNPJ(e.target.value);
                                                    setDocumentNamber(e.target.value);
                                                }} 
                                                value={documentNumber && documentNumber} 
                                                className="form-control" id="documentNumber"/>
                                        </div>

                                        <div className="col-md-4">
                                            <label htmlFor="socialName" className="form-label">Razão Social</label>
                                            <input type="text" 
                                                onChange={(e)=> setSocialName(e.target.value)} 
                                                value={socialName && socialName} 
                                                className="form-control" id="socialName"/>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-3">
                                            <label htmlFor="inscricaoEstadual" className="form-label">Inscrição Estadual</label>
                                            <input type="text" onChange={(e)=> setInscricaoEstadual(e.target.value)} value={inscricaoEstadual && inscricaoEstadual} className="form-control" id="inscricaoEstadual"/>
                                        </div>

                                        <div className="col-md-4">
                                            <label htmlFor="nameFantasy" className="form-label">Nome Fantasia</label>
                                            <input type="text" 
                                                onChange={(e)=> setNameFantasy(e.target.value)} 
                                                value={nameFantasy && nameFantasy} 
                                                className="form-control" id="nameFantasy"/>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card style={{padding: 8}} className="mb-3 mt-4">
                                <div className="form-signin mx-auto mb-4 mb-lg-6">
                                    <div className="row">
                                        <div className="col-12">
                                            <h4 className="mb-3">Endereço</h4>
                                        </div>

                                        <div className="row">
                                            <div className="col-3">
                                                <label htmlFor="cep"  className="form-label">CEP</label>
                                                <InputMask mask="99999-999" type="text"  
                                                    onChange={(e)=> {
                                                        buscarCep(e.target.value);
                                                        setCep(e.target.value);
                                                        
                                                    }}
                                                    value={cep && cep}  
                                                    className="form-control" 
                                                    id="cep" 
                                                />
                                            </div>

                                            <div className="col-4">
                                                <label htmlFor="street" className="form-label">Logradouro</label>
                                                <input type="text"  
                                                    onChange={(e)=> setStreet(e.target.value)} 
                                                    value={street && street}  
                                                    className="form-control" 
                                                    id="street" 
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-3">
                                                <label htmlFor="numeroEndereco" className="form-label">Número</label>
                                                <input type="text" onChange={(e)=> setNumeroEndereco(e.target.value)} value={numeroEndereco && numeroEndereco} className="form-control" id="numeroEndereco"/>
                                            </div>

                                            <div className="col-md-2">
                                                <label htmlFor="neighborhood" className="form-label">Bairro</label>
                                                <input type="text" 
                                                    onChange={(e)=> setNeighborhood(e.target.value)} 
                                                    value={neighborhood && neighborhood} 
                                                    className="form-control" 
                                                    id="neighborhood"/>
                                            </div>

                                            <div className="col-md-2">
                                                <label htmlFor="city" className="form-label">Cidade</label>
                                                <input type="text" 
                                                    onChange={(e)=> setCity(e.target.value)} 
                                                    value={city && city} 
                                                    className="form-control" 
                                                    id="neighborhood"/>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-3">
                                                <label htmlFor="state" className="form-label">Estado</label>
                                                <input type="text"  
                                                    onChange={(e)=> setState(e.target.value)} 
                                                    value={state && state}  
                                                    className="form-control" id="state"/>
                                            </div>

                                            <div className="col-md-4">
                                                <label htmlFor="complement" className="form-label">Complemento</label>
                                                <input type="text" onChange={(e)=> setComplement(e.target.value)} value={complement && complement} className="form-control" id="complement"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card style={{padding: 8}} className="mb-3 mt-4">
                                <div className="form-signin mx-auto mb-4 mb-lg-6">
                                    <div className="row">
                                        <div className="col-12">
                                            <h4 className="mb-3">Contatos</h4>
                                        </div>

                                        {contatos.map((contato, index) => (
                                            <Card style={{ padding: 8, position: 'relative', marginBottom: 16, marginTop: 16, }} className="mb-3 mt-4" key={index}>
                                            <Button
                                                style={{ position: 'absolute', top: 8 , right: 8 , padding: 4, zIndex: 100 }}
                                                color="error"
                                                onClick={() => removerContato(index)}
                                                disabled={contatos.length === 1}
                                                title="Remover contato"
                                            >
                                                <DeleteIcon />
                                            </Button>

                                            <div key={index}>
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        <label htmlFor="nome" className="form-label">Nome</label>
                                                        <input type="text" onChange={(e) => handleChangeMaisContato(index, 'nome', e.target.value)} value={contato.nome} className="form-control" id="nome"/>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <label htmlFor="funcao" className="form-label">Função</label>
                                                        <input type="text" onChange={(e) => handleChangeMaisContato(index, 'funcao', e.target.value)} value={contato.funcao} className="form-control" id="funcao"/>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-2">
                                                        <label htmlFor="telefone" className="form-label">Telefone</label>
                                                        <InputMask mask="(99) 99999-9999" type="text" onChange={(e) => handleChangeMaisContato(index, 'telefone', e.target.value)} value={contato.telefone} className="form-control" id="telefone"/>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <label htmlFor="email" className="form-label">E-mail</label>
                                                        <input type="text" onChange={(e) => handleChangeMaisContato(index, 'email', e.target.value)} value={contato.email} className="form-control" id="email"/>
                                                    </div>
                                                    <div className="col-md-2" style={{ marginTop: 30 }}>
                                                        <input type="checkbox" onChange={(e) => handleChangeMaisContato(index, 'recebeEmail', e.target.checked)} checked={contato.recebeEmail} className="form-check-input" id="recebeEmail"/>
                                                        Receber E-mail
                                                    </div>
                                                </div>
                                            </div>
                                            </Card>
                                        ))}

                                        <button style={{
                                            width: "auto",
                                            minWidth: 180,
                                            marginTop: 16,
                                            marginBottom: 8,
                                            marginLeft: 16,
                                            alignSelf: "flex-end",
                                            fontWeight: 500,
                                            borderRadius: 6,
                                            boxShadow: "0 2px 8px rgba(0,123,255,0.08)",
                                            transition: "background 0.2s, color 0.2s, box-shadow 0.2s"
                                        }} 
                                        type="button" 
                                        className="btn btn-primary" 
                                        onClick={adicionarContato}>
                                            + Adicionar Contato
                                        </button>

                                    </div>
                                </div>
                            </Card>

                            <Card style={{padding: 8}} className="mb-3 mt-4">
                                <div className="col-12">
                                    <h4 className="mb-3">Parametros MDF-e</h4>
                                </div>

                                <div className="form-signin mx-auto mb-4 mb-lg-4">
                                    <div className="row">
                                        <div className="col-md-1">
                                            <label htmlFor="serie" className="form-label">Série</label>
                                            <input type="text" 
                                                    onChange={handleCreateSerie} 
                                                value={serie && serie} 
                                                className="form-control" id="documentNumber"/>
                                        </div>

                                        <div className="col-md-3">
                                            <label htmlFor="number" className="form-label">Número</label>
                                            <input type="text" 
                                                onChange={(e)=> setNumber(e.target.value)} 
                                                value={number && number} 
                                                className="form-control" id="socialName"/>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-2">
                                            <label htmlFor="typeEmitente" className="form-label">Tipo emitente </label>
                                                <select
                                                    className="form-select"
                                                    onChange={(e) => setTypeEmitente(e.target.value)}
                                                    value={typeEmitente && typeEmitente}
                                                    aria-label=""
                                                >
                                                    <option defaultValue="">Selecione</option>
                                                    <option value="1">Prestador de serviço</option>
                                                    <option value="2">Carga própria{" "}</option>
                                                    <option value="3">Contratante{" "}</option>
                                                </select>
                                        </div>

                                        <div className="col-md-2">
                                            <label htmlFor="typeEmissao" className="form-label">Tipo emissão</label>
                                            <select
                                                    className="form-select"
                                                    onChange={(e) => setTypeEmissao(e.target.value)}
                                                    value={typeEmissao && typeEmissao}
                                                    aria-label=""
                                                >
                                                    <option defaultValue="">Selecione</option>
                                                    <option value="1">Normal</option>
                                                    <option value="2">Contigencia</option>
                                                </select>
                                        </div>
                                         <div className="col-md-2">
                                            <label htmlFor="responsavelSeguro" className="form-label">Responsável pelo seguro</label>
                                                <select
                                                    className="form-select"
                                                    onChange={(e) => setResponsavelSeguro(e.target.value)}
                                                    value={responsavelSeguro && responsavelSeguro}
                                                    aria-label=""
                                                >
                                                    <option defaultValue="">Selecione</option>
                                                    <option value="Proprio">Próprio</option>
                                                    <option value="Fracionado">Fortio{" "}</option>
                                                </select>
                                        </div>
                                    </div>

                                     <div className="row">
                                        <div className="col-md-2">
                                            <label htmlFor="typeEmitente" className="form-label">Importar certificado </label>

                                                {documentCertificate ? (
                                                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                                        <li
                                                            style={{
                                                                background: "#f8f9fa",
                                                                border: "1px solid #e0e0e0",
                                                                borderRadius: "8px",
                                                                padding: "2px 3px",
                                                                marginBottom: "4px",
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                                                transition: "all 0.3s ease"
                                                            }}
                                                        >
                                                            <span style={{ whiteSpace: 'nowrap' }}>
                                                                Certificado Validado ✔ - Validade: {formatDate(documentCertificateInfo?.not_valid_after) || formatDate(notValidBefore)} - {documentCertificateInfo?.nome_razao_social || subjectName}
                                                            </span>
                                                            <IconButton
                                                                aria-label="Excluir"
                                                                size="small"
                                                                color="error"
                                                                onClick={() => {handleDelete(documentCertificate); setDocumentCertificate(null);}}
                                                                sx={{
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                                                        transform: 'scale(1.1)',
                                                                    },
                                                                    transition: 'all 0.2s ease-in-out',
                                                                    padding: '4px',
                                                                    borderRadius: '50%',
                                                                    border: '1px solid transparent',
                                                                    '&:focus': {
                                                                        outline: 'none',
                                                                        border: '1px solid #d32f2f'
                                                                    }
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </li>
                                                    </ul>
                                                )
                                                : 
                                                <Button 
                                                    variant="outlined" 
                                                    onClick={(e) => {
                                                        handleClickOpen();
                                                        setOrigem("documentCertificate");
                                                    }}
                                                >
                                                    Importar
                                                </Button>
                                            }
                                        </div>

                                    </div>
                                </div>
                            </Card>


                            { user?.perfil !== ''  ? (

                                <Card style={{padding: 8}} className="mb-3 mt-4">
                                    <div className="form-signin mx-auto mb-4 mb-lg-6">
                                        <div className="row">
                                            <div className="col-12">
                                                <h4 className="mb-3">Logo</h4>
                                            </div>

                                            <div className="col-md-2">
                                                {photoPreview ? (
                                                    <div className="row">
                                                        <div className="col-md-2">
                                                            <ImageZoom 
                                                                title=""
                                                                name="photo"
                                                                source={photoPreview}
                                                                height="100"
                                                                width="100"
                                                            /> 
                                                            <Button variant="outlined" onClick={() => setPhotoPreview(null)}>
                                                                Remover
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleFileChange}
                                                            style={{ display: "none" }}
                                                            id="upload-image"
                                                        />
                                                        <label htmlFor="upload-image">
                                                            <Button variant="outlined" component="span">
                                                                Importar Logo
                                                            </Button>
                                                        </label>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ) : (null)}

                            <div className="container">
                                <div className="row">
                                    <div className="col-4"></div>
                                    <div className="col-4"></div>
                                    <div className="col-4" style={{ display: 'flex', gap: '10px' }}>
                                        <div className="btn-class-cadastrar" style={{ flex: 1 }}>
                                            <Link to={"/embarcador"}>
                                                <BackButton />
                                            </Link>
                                        </div>
                                        <div className="btn-class-cadastrar" style={{ flex: 1 }}>
                                            {
                                                carregando ? 
                                                <div className="spinner-border text-danger" role="status">
                                                <span className="visually-hidden ">Loading...</span></div>
                                                :
                                                <button type="submit" onClick={id ? update : save} className="w-100 btn btn-primary btn-cadastrar">{id ? 'Salvar' : 'Cadastrar'}</button>
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

export default NewEmbarcador;