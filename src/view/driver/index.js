import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import InputMask from 'react-input-mask'
import firebase, { storage } from '../../config/firebase';
import { format } from 'date-fns';
import { ref, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage";
import PasswordInput from "../../components/PasswordInput/passwordInput";
import AlertDialog from "../../components/dialog";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { sendPasswordResetEmail, getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { Layout, Card, Row, Col, Tabs, Avatar, Rate, Typography, Radio, Button, Tooltip } from 'antd';
import { Card as Cards } from "@mui/material";
import NewMiniDrawer from "../../components/navMenu/menu-nav";
import Utils from "../../util/utils";
import paymentService from "../../service/payment.service";

const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;
const { Title } = Typography;

require('firebase/auth')

const auth = getAuth(firebase);

function Driver(){

    const {id} = useParams();

    // Listas de UseStates
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [erroForm, setErroForm] = useState({});

    const [carregando, setCarregando] = useState();
    const [totalDocuments, setTotalDocuments] = useState("");
    const [totalFinalized, setTotalFinalized] = useState(0);

    const [status, setStatus] = useState("authorized");
    const [name, setName] = useState("");
        
    const [created, setCreated] = useState("");
    const [lastUpdated, setLastUpdated] = useState("");
    const [birthDate, setBirthDate] = useState();
    const [documentCnhExpiration, setDocumentCnhExpiration] = useState("");
    const [documentCnh, setDocumentCnh] = useState("");
    const [lastUpdatedBackOffice, setLastUpdatedBackOffice] = useState("");
    
    //Address
    const [cep, setCep] = useState("");
    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("");
    const [number, setNumber] = useState("");
    const [state, setState] = useState("");
    const [street, setStreet] = useState("");
    const [comprovanteEndereco, setComprovanteEndereco] = useState(null);
    const [complementoEndereco, setComplementoEndereco] = useState("");

    //dataBank
    const [accountDigit, setAccountDigit] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [agency, setAgency] = useState("");
    const [bankName, setBankName] = useState("");
    const [code, setCode] = useState("");
    const [holderAccount, setHolderAccount] = useState("");
    const [ispb, setIspb] = useState("");
    const [pix, setPix] = useState("");

    //kinships
    const [contactKinships1, setContactKinships1] = useState("");
    const [degreeKinships1, setDegreeKinships1] = useState("");
    const [nameKinships1, setNameKinships1] = useState("");
    const [contactKinships2, setContactKinships2] = useState("");
    const [degreeKinships2, setDegreeKinships2] = useState("");
    const [nameKinships2, setNameKinships2] = useState("");     
    //PersonalData

    const [contact, setContact] = useState("");
    const [documentAnttFrontImg, setDocumentAnttFrontImg] = useState(null);
    const [documentCRLV, setdocumentCRLV] = useState(null);
    const [documentCnhFrontImg, setDocumentCnhFrontImg] = useState(null);
    const [cnhReboque, setcnhReboque] = useState(null);
    const [fullName, setFullName] = useState("");
    const [sexGender, setSexGender] = useState("");
    const [anttReboque, setanttReboque] = useState(null);

    //ProfessionalRerence
    const [contactProfessional, setContactProfessional] = useState("");
    const [nameProfessional, setNameProfessional] = useState("");
    const [contactProfessional1, setContactProfessional1] = useState("");
    const [nameProfessional1, setNameProfessional1] = useState("");

    // vehicle
    const [bodyworkPlate, setBodyworkPlate] = useState("");
    const [bodyworkType, setBodyworkType] = useState("");
    const [vehicleImg, setVehicleImg] = useState(null);
    const [vehiclePlate, setVehiclePlate] = useState("");
    const [vehicleType, setVehicleType] = useState("");

    const [renavam, setRenavam] = useState("");
    const [ufVeiculo, setUfVeiculo] = useState("");
    const [descricaoVeiculo, setDescricaoVeiculo] = useState("");
    const [rntrc, setRntrc] = useState("");
    const [tipoRNTRC, setTipoRNTRC] = useState("");
    const [pesoTara, setPesoTara] = useState("");
    const [capacidadeKG, setCapacidadeKG] = useState("");
    const [capacidadeM3, setCapacidadeM3] = useState("");
    const [tipoProprietario, setTipoProprietario] = useState("");
    const [cpfoucnpj, setCpfouCnpj] = useState("");
    const [nomeProprietario, setNomeProprietario] = useState("");
    const [veiculoProprio, setVeiculoProprio] = useState(false);

    const [erroNomeCpfIgual, setErroNomeCpfIgual] = useState(false);
    const [showPerguntaVeiculoProprio, setShowPerguntaVeiculoProprio] = useState(false);

    const [cpf, setCpf] = useState();
    const [verifyCpf, setVerifyCpf] = useState([]);
    const [email, setEmail] = useState();
    const [profilePicture, setProfilePicture] = useState();
    const [dateRenovation, setDateRenovation] = useState();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');

    const [passwordTouched, setPasswordTouched] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const [msgTipo, setMsgTipo] = useState();
    const [msg, setMsg] = useState();
    const [title, setTitle] = useState();

    const [open, setOpen] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [origem, setOrigem] = useState("");

    const [reboques, setReboques] = useState([createReboque()]);
    const [contacts, setContacts] = useState([createContact()]);
    const [contactsProfessional, setContactsProfessional] = useState([createContactProfessional()]);

    const [disabledList, setDisabledList] = useState(false);

    // const [errorFirebase, setErrorFirebase] = useState(false);

    //Lista de useSelectors
    const users = useSelector(state => state.user);
    const shippers = useSelector(state => state.shipper);

    // Conexão com o banco de dados
    const db = firebase.firestore();

    // Movimentação entre páginas
    let navigate = useNavigate();

    // Listas de Constantes e Variaveis
    const listDisabled = [ "CARRETA S", "CARRETA LS", "BITREM", "RODOTREM", "VANDERLEIA" ];
    const mask = tipoProprietario === "cpf" ? "999.999.999-99" : tipoProprietario === "cnpj" ? "99.999.999/9999-99" : "";
    const statesUF = [
        { value: 'AC', label: 'Acre' },
        { value: 'AL', label: 'Alagoas' },
        { value: 'AP', label: 'Amapá' },
        { value: 'AM', label: 'Amazonas' },
        { value: 'BA', label: 'Bahia' },
        { value: 'CE', label: 'Ceará' },
        { value: 'DF', label: 'Distrito Federal' },
        { value: 'ES', label: 'Espírito Santo' },
        { value: 'GO', label: 'Goiás' },
        { value: 'MA', label: 'Maranhão' },
        { value: 'MT', label: 'Mato Grosso' },
        { value: 'MS', label: 'Mato Grosso do Sul' },
        { value: 'MG', label: 'Minas Gerais' },
        { value: 'PA', label: 'Pará' },
        { value: 'PB', label: 'Paraíba' },
        { value: 'PR', label: 'Paraná' },
        { value: 'PE', label: 'Pernambuco' },
        { value: 'PI', label: 'Piauí' },
        { value: 'RJ', label: 'Rio de Janeiro' },
        { value: 'RN', label: 'Rio Grande do Norte' },
        { value: 'RS', label: 'Rio Grande do Sul' },
        { value: 'RO', label: 'Rondônia' },
        { value: 'RR', label: 'Roraima' },
        { value: 'SC', label: 'Santa Catarina' },
        { value: 'SP', label: 'São Paulo' },
        { value: 'SE', label: 'Sergipe' },
        { value: 'TO', label: 'Tocantins' },
    ];
    var campos = ['fullName', 'cpf', 'password', 'confirmPassword', 'contact', 'formOfPayment', 'email', 'documentCnhExpiration'];
    for (var i = 0; i < campos.length; i++) {
        var campo = document.getElementById(campos[i]);
        if(campo) { campo.addEventListener('input', function() { this.style.borderColor = ""; });
        }
    }

    // Lista dos UseEffects
    // UseEffect Principal
    useEffect(() => {

        db.collection('drivers_users').get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
            const driver = doc.data();
            setVerifyCpf(prev => [...prev, driver.cpf] );
            });
        })
        .catch((error) => {
            console.error("Erro ao buscar drivers:", error);
        });

        if(id){

            db.collection('drivers_users').doc(id).get().then(result => {
                    var driver = result.data();

                    setStatus(driver?.statusDriver) 
                    setEmail(driver?.email)
                    setProfilePicture(driver?.profilePicture)
                    setCpf(driver?.cpf)
                    
                    setName(driver?.name)
            });

            db.collection('drivers_users').doc(id).collection('documents').doc("allData")
            .get().then( async (result) => {
                
                var allData = result.data();

                let birthDate = allData?.birthDate;
                let created = allData?.created;
                let lastUpdated = allData?.lastUpdated;
                let personalData = allData?.personalData;
                let dataBank = allData?.dataBank;
                let dataCnhExpiration = allData?.documentCnhExpiration;
                let kinships = allData?.kinships;
                let profissionalReference = allData?.professionalReference;
                let vehicle = allData?.vehicle;
                let address = allData?.address;
                let lastUpdatedBackOffice = allData?.lastUpdatedBackOffice;
                let dateRenovation = allData?.dateRenovation;
                let documentCnh = allData?.documentCnh;

                let dataCreated = created ? format(new Date(created.seconds * 1000), 'yyyy-MM-dd') : "";
                let dataLastUpdate = lastUpdated ? format(new Date(lastUpdated.seconds * 1000), 'yyyy-MM-dd') : "";
                let dataCnhExpired = dataCnhExpiration ? format(new Date(dataCnhExpiration.seconds * 1000), 'yyyy-MM-dd') : "";
                let dataBirthDay = birthDate ? format(new Date(birthDate.seconds * 1000), 'yyyy-MM-dd') : "";
                let dataLastUpdateBack =  lastUpdatedBackOffice ?  format(new Date(lastUpdatedBackOffice.seconds * 1000), 'yyyy-MM-dd') : "";
                let dateRenovationParse =  dateRenovation ?  format(new Date(dateRenovation.seconds * 1000), 'yyyy-MM-dd') : "";
    
                setBirthDate(dataBirthDay)
                // setCreated(dataCreated)
                setLastUpdated(dataLastUpdate)
                setLastUpdatedBackOffice(dataLastUpdateBack)
                setDateRenovation(dateRenovationParse)
    
                //Personal data
                setContact(personalData?.contact);
                if(personalData?.documentAnttFrontImg){
                    setDocumentAnttFrontImg(personalData?.documentAnttFrontImg != undefined ? personalData?.documentAnttFrontImg : "");
                }
                if(personalData?.documentCRLV){
                    setdocumentCRLV(personalData?.documentCRLV != undefined ? personalData?.documentCRLV : "");
                }
                if(personalData?.documentCnhFrontImg){
                    setDocumentCnhFrontImg(personalData?.documentCnhFrontImg != undefined ? personalData?.documentCnhFrontImg : "");    
                }
                if(personalData?.cnhReboque){
                    setcnhReboque(personalData?.cnhReboque != undefined ? personalData?.cnhReboque : "");
                }
                if(personalData?.anttReboque){
                    setanttReboque(personalData?.anttReboque != undefined ? personalData?.anttReboque : "");
                }

                setFullName(personalData?.fullName ? personalData?.fullName : name);
                setSexGender(personalData?.sexGender);
                setDocumentCnhExpiration(dataCnhExpired)
                setDocumentCnh(personalData?.documentCnh);

                //Vehicle
                setBodyworkPlate(vehicle?.bodyworkPlate)
                setBodyworkType(vehicle?.bodyworkType)
                setVehicleImg(vehicle?.vehicleImg)
                setVehiclePlate(vehicle?.vehiclePlate)
                setVehicleType(vehicle?.vehicleType)

                setRenavam(vehicle?.renavam)
                setUfVeiculo(vehicle?.ufVeiculo)
                setDescricaoVeiculo(vehicle?.descricaoVeiculo)
                setRntrc(vehicle?.rntrc)
                setTipoRNTRC(vehicle?.tipoRNTRC)
                setPesoTara(vehicle?.pesoTara)
                setCapacidadeKG(vehicle?.capacidadeKG)
                setCapacidadeM3(vehicle?.capacidadeM3)
                setTipoProprietario(vehicle?.tipoProprietario)
                setCpfouCnpj(vehicle?.cpfoucnpj)
                setNomeProprietario(vehicle?.nomeProprietario)
                setVeiculoProprio(vehicle?.veiculoProprio)
                if (vehicle?.reboques && Array.isArray(vehicle.reboques)) {
                    setReboques( vehicle?.reboques );
                }

                //address 
                setCep(address?.cep)
                setCity(address?.city)
                setDistrict(address?.district)
                setNumber(address?.number)
                setState(address?.state)
                setStreet(address?.street)
                setComprovanteEndereco(address?.comprovanteEndereco)
                setComplementoEndereco(address?.complementoEndereco)

                //professionalData
                setContactProfessional(profissionalReference[0]?.contact)
                setNameProfessional(profissionalReference[0]?.name)
    
                setContactProfessional1(profissionalReference[1].contact)
                setNameProfessional1(profissionalReference[1].name)

                if (profissionalReference[2]?.contactsProfessional && Array.isArray(profissionalReference[2]?.contactsProfessional)) {
                    setContactsProfessional(profissionalReference[2]?.contactsProfessional);
                }
    
                //kinships 
                setContactKinships1(kinships[0].contact)
                setDegreeKinships1(kinships[0].degree)
                setNameKinships1(kinships[0].name)
    
                setContactKinships2(kinships[1].contact)
                setDegreeKinships2(kinships[1].degree)
                setNameKinships2(kinships[1].name)

                if (kinships[2]?.contacts && Array.isArray(kinships[2]?.contacts)) {
                    setContacts(kinships[2]?.contacts);
                }
    
                //dataBank
                setAccountDigit(dataBank.accountDigit)
                setAccountNumber(dataBank.accountNumber) 
                setAgency(dataBank.agency)
                setBankName(dataBank.bankName)
                setCode(dataBank.code)
                setHolderAccount(dataBank.holderAccount)
                setIspb(dataBank.ispb)
                setPix(dataBank.pix)

                try { /* Quantidade de viagens */
                    const result = await db.collection('freight').get();
                    if (!result.empty) {
                        const freights = result.docs.reduce((acc, doc) => {
                            const data = doc.data();
                            const uidDriver = data?.freight?.getDriverFreight?.uidDriver;
                            if (uidDriver === id) {
                                acc.push({
                                    id: doc.id,
                                    ...data,
                                });
                            }
                            return acc;
                        }, []);
                        setTotalDocuments(freights.length);
                    } else {
                        console.log("Nenhum frete encontrado para o uidDriver:", id);
                    }
                } catch (error) {
                    console.error("Erro na busca do frete: " + error);
                }

                try { /* Entregas efetuadas */
                    const result = await db.collection('freight').get();
                    if (!result.empty) {
                        const freights = result.docs.reduce((acc, doc) => {
                            const data = doc.data();
                            const uidDriver = data?.freight?.getDriverFreight?.uidDriver;
                            if (uidDriver === id) {
                                acc.push({
                                    id: doc.id,
                                    ...data,
                                });
                            }
                            return acc;
                        }, []);

                        let totalDateOperation = 0;
                        await Promise.all( // Processar os fretes e calcular os date_operation
                            freights.map(async (freight) => {
                                const stoppingPointsSnapshot = await db.collection('freight').doc(freight.id).collection('stopping_points').get();
                                if (!stoppingPointsSnapshot.empty) {
                                    stoppingPointsSnapshot.forEach((doc) => {
                                        const data = doc.data();
                                        if (data?.date_operation) {
                                            totalDateOperation += 1;
                                        }
                                    });
                                }
                            })
                        );
                        setTotalFinalized(totalDateOperation);
                    } else {
                        console.log("Nenhum frete encontrado para o uidDriver:", id);
                    }
                } catch (error) {
                    console.error("Erro na busca do frete: " + error);
                }

                setCarregando(0)
            }).catch(error => {
                setCarregando(0)
                console.log(error)
            });

        }
    },[carregando]);

    // Atualiza os reboques quando veiculoProprio, fullName ou cpf mudam
    useEffect(() => {
        let hasChanged = false;

        // Só atualiza reboques se necessário
        setReboques(prevReboques => {
            if (!Array.isArray(prevReboques)) return prevReboques;
            const novosReboques = prevReboques.map(reboque => {
                if (reboque.veiculoProprioReboque === true) {
                    const atualizado = {
                        ...reboque,
                        nomeProprietarioReboque: fullName || "",
                        cpfoucnpjReboque: formatMask(cpf) || "",
                        tipoProprietarioReboque: "cpf"
                    };
                    if (
                        reboque.nomeProprietarioReboque !== atualizado.nomeProprietarioReboque ||
                        reboque.cpfoucnpjReboque !== atualizado.cpfoucnpjReboque ||
                        reboque.tipoProprietarioReboque !== atualizado.tipoProprietarioReboque
                    ) {
                        hasChanged = true;
                        return atualizado;
                    }
                    return reboque;
                } else {
                    const limpo = {
                        ...reboque,
                        nomeProprietarioReboque: "",
                        cpfoucnpjReboque: "",
                        tipoProprietarioReboque: ""
                    };
                    if (
                        // reboque.nomeProprietarioReboque === fullName ||
                        // reboque.cpfoucnpjReboque === cpf
                        (!!fullName && reboque.nomeProprietarioReboque === fullName) ||
                        (!!cpf && reboque.cpfoucnpjReboque === cpf)
                    ) {
                        hasChanged = true;
                        return limpo;
                    }
                    return reboque;
                }
            });
            return hasChanged ? novosReboques : prevReboques;
        });
    }, [reboques, fullName, cpf, veiculoProprio]);

    // Validações de nome e CPF do proprietário
    useEffect(() => {

        if (!validarCPF(cpf)) {
            if (!cpf) {
                setErroForm(prev => ({...prev, cpf: { hasError: true, message: "" }}));
            }
            else {
                setErroForm(prev => ({...prev, cpf: { hasError: true, message: "Esse CPF é inválido!" }}));
            }
        }
        else if (verifyCpf.includes(withoutMaskCPF(cpf))) {
            if (!id) {
                setErroForm(prev => ({...prev, cpf: { hasError: true, message: "Esse CPF já esta cadastrado!" }}));
            }
            else {
                setErroForm(prev => ({...prev, cpf: { hasError: false, message: "" }}));
            }
        }
        else {
            setErroForm(prev => ({...prev, cpf: { hasError: false, message: "" }}));
        }

        if (veiculoProprio === true) {
            setNomeProprietario(fullName || "");
            setCpfouCnpj(formatMask(cpf) || "");
            setTipoProprietario("cpf");
            setErroNomeCpfIgual(false);
            return;
        }

        if (nomeProprietario && cpfoucnpj) {
            const isSameAsUser = nomeProprietario === fullName && withoutMaskCPF(cpfoucnpj) === withoutMaskCPF(cpf);
            setErroNomeCpfIgual(isSameAsUser);
        } 
        else {
            setErroNomeCpfIgual(false);
        }

    }, [fullName, cpf, nomeProprietario, cpfoucnpj, veiculoProprio]);

    // Controla a exibição da pergunta sobre veículo próprio
    useEffect(() => {
        setDisabledList(listDisabled.includes(vehicleType));
    }, [vehicleType, listDisabled]);

    // Define a máscara automatica correta para CPF/CNPJ
    useEffect(() => {
        if (erroNomeCpfIgual) {
            setShowPerguntaVeiculoProprio(true);
        }
    }, [erroNomeCpfIgual]);

    // Validação dos campos de CPF/CNPJ, para sicronização das informações
    useEffect(() => {

        const digits = cpfoucnpj && cpfoucnpj.replace(/\D/g, "");

        // só roda se o usuário parar de digitar por 500ms
        const timeout = setTimeout(() => {
            if (digits && digits.length === 11) {
            setTipoProprietario("cpf");
            } else if (digits && digits.length === 14) {
            setTipoProprietario("cnpj");
            }
            else {
            setTipoProprietario("");
            }
        }, 500);

        // cleanup: cancela timeout se o usuário continuar digitando
        return () => clearTimeout(timeout);

    }, [cpfoucnpj]);

    // Validação dos campos de CPF/CNPJ dos reboques, para sicronização das informações
    useEffect(() => {
        reboques.forEach((reboque, index) => {
            const digits = (reboque.cpfoucnpjReboque || "").replace(/\D/g, "");

            const timeout = setTimeout(() => {
            let novoTipo = "";
            if (digits.length === 11) {
                novoTipo = "cpf";
                handleChangeReboques(index, "tipoProprietarioReboque", novoTipo);
            } 
            else if (digits.length === 14) {
                novoTipo = "cnpj";
                handleChangeReboques(index, "tipoProprietarioReboque", novoTipo);
            }

            if (!digits) {
                if (novoTipo !== reboque.tipoProprietarioReboque) {
                    handleChangeReboques(index, "tipoProprietarioReboque", novoTipo);
                }
            }
        }, 500);

        return () => clearTimeout(timeout);
        });
    }, [reboques.map(r => r.cpfoucnpjReboque).join(",")]);

    // useEffect(() => {
    //     if (errorFirebase) {
    //     }
    // }, [errorFirebase]);

    function createReboque() {
        return {
            placaReboque: '',
            renavamReboque: '',
            ufReboque: '',
            descricaoReboque: '',
            rntrcReboque: '',
            tipoRNTRCReboque: '',
            TipoCarroceriaReboque: '',
            pesoTaraReboque: '',
            capacidadeKGReboque: '',
            capacidadeM3Reboque: '',
            tipoProprietarioReboque: '',
            cpfoucnpjReboque: '',
            nomeProprietarioReboque: '',
            veiculoProprioReboque: false,
            cnhReboque: '',
            anttReboque: '',
        };
    }

    function createContact() {
        return {
            nameKinships1: '',
            degreeKinships1: '',
            contactKinships1: '',
        }
    }

    function createContactProfessional() {
        return {
            contactProfessional: '',
            nameProfessional: '',
        }
    }

    const handleChangeReboques = (index, field, value) => {
        const newReboque = [...reboques];

        if (field === 'cpfoucnpjReboque') {
            newReboque[index][field] = formatMask(value);
        } else {
            newReboque[index][field] = value;
        }

        setReboques(newReboque);
    };
    
    const handleChangeContacts = (index, field, value) => {
        const newContact = [...contacts];

        newContact[index][field] = value;
        setContacts(newContact);
    };

    const handleChangeContactsProfessional = (index, field, value) => {
        const newContactProfessional = [...contactsProfessional];
        newContactProfessional[index][field] = value;
        setContactsProfessional(newContactProfessional);
    };

    const adicionarReboque = () => { setReboques([...reboques, createReboque()]); };

    const adicionarContact = () => { setContacts([...contacts, createContact()]); };

    const adicionarContactProfessional = () => { setContactsProfessional([...contactsProfessional, createContactProfessional()]); };

    const removerReboque = (index) => { setReboques(reboques.filter((_, i) => i !== index)); };

    const removerContact = (index) => { setContacts(contacts.filter((_, i) => i !== index)); };

    const removerContactProfessional = (index) => { setContactsProfessional(contactsProfessional.filter((_, i) => i !== index)); };

    const handleUploadCnhReboque = (index, url) => {
        setReboques(prev => {
            const novos = [...prev];
            novos[index]['cnhReboque'] = url;
            return novos;
        });
    };
    const handleUploadAnttReboque = (index, url) => {
        setReboques(prev => {
            const novos = [...prev];
            novos[index].anttReboque = url;
            return novos;
        });
    };

    function showMessage(msg){
        setMsgTipo('erro');
        setCarregando(0)
        setTitle(' Ops!')
        setMsg(msg);
        setOpenDialog(true)
        return;
    }

    const handlePasswordBlur = () => {
        setPasswordTouched(true);
        if (!password) {
            setPasswordError("Senha não obrigatória! Será enviado um email ao motorista com as informações de primeiro acesso!");
        } else {
            setPasswordError("");
        }
    };

    // Valida CPF (retorna true se válido)
    function validarCPF(cpf) {
        // Mantém só dígitos
        cpf = String(cpf).replace(/\D/g, '');

        // Deve ter 11 dígitos e não pode ser todos iguais
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        // --- 1º dígito verificador ---
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += Number(cpf[i]) * (10 - i);
        }
        let resto = soma % 11;
        const dig1 = resto < 2 ? 0 : 11 - resto;

        // --- 2º dígito verificador ---
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += Number(cpf[i]) * (11 - i);
        }
        resto = soma % 11;
        const dig2 = resto < 2 ? 0 : 11 - resto;

        // Confere com os dígitos originais
        return cpf.endsWith(String(dig1) + String(dig2));
    }

    function validInput(){
        var retorno = true;
        if (!cpf) {
            showMessage("O CPF precisa ser preenchido corretamente");
            const input = document.getElementById("cpf");
            if (input) {
                input.focus();
                input.style.borderColor = "red";
            }
            retorno = false;
        }
        if(!id) {
            if(!password){
                showMessage("Motorista cadastrado com sucesso!\n Será enviado ao motorista um email com as informações de primeiro acesso!");
                setPassword(withoutMaskCPF(cpf));
                setConfirmPassword(withoutMaskCPF(cpf));
            }
            if(password !== confirmPassword) {
                showMessage("Senha diverge da confirmação");
                const input = document.getElementById("confirmPassword");
                if (input) {
                    input.focus();
                    input.style.borderColor = "red";
                }
                retorno = false;
            }
        }

        if(!fullName){
            showMessage("O Nome do motorista precisa ser preenchido corretamente");
            const input = document.getElementById("fullName");
            if (input) {
                input.focus();
                input.style.borderColor = "red";
            }
            retorno = false;
        }
        if (!birthDate) {
            showMessage("A Data de Nascimento precisa ser preenchido corretamente");
            const input = document.getElementById("birthDateDriver");
            if (input) {
                input.focus();
                input.style.borderColor = "red";
            }
            retorno = false;
        }
        if (!contact) {
            showMessage("O Contato precisa ser preenchido corretamente");
            const input = document.getElementById("contact");
            if (input) {
                input.focus();
                input.style.borderColor = "red";
            }
            retorno = false;
        }
        if (!sexGender) {
            showMessage("O Gênero precisa ser preenchido corretamente");
            const input = document.getElementById("formOfPayment");
            if (input) {
                input.focus();
                input.style.borderColor = "red";
            }
            retorno = false;
        }
        if (!email) {
            showMessage("O email precisa ser preenchido corretamente");
            const input = document.getElementById("email");
            if (input) {
                input.focus();
                input.style.borderColor = "red";
            }
            retorno = false;
        }
        if (!documentCnhExpiration) {
            showMessage("A data de expiração do CNH precisa ser preenchido corretamente");
            const input = document.getElementById("documentCnhExpiration");
            if (input) {
                input.focus();
                input.style.borderColor = "red";
            }
            retorno = false;
        }
        if (!documentCnh) {
            showMessage("O campo 'CNH' precisa ser preenchido corretamente");
            const input = document.getElementById("documentCnh");
            if (input) {
                input.focus();
                input.style.borderColor = "red";
            }
            retorno = false;
        }
        if ( cpfoucnpj.length !== 14 && cpfoucnpj.length !== 18 ) {
            showMessage("O CPF ou CNPJ precisa ser preenchido corretamente");
            const input = document.getElementById("cpfoucnpj");
            if (input) {
                input.focus();
                input.style.borderColor = "red";
            }
            retorno = false;
        }
        if (disabledList) {
            for (let i = 0; i < reboques.length; i++) {
                const reboque = reboques[i];

                var cnpjcpf = Utils.apenasNumerico(reboque.cpfoucnpjReboque);

                if (cnpjcpf.length !== 11 && cnpjcpf.length !== 14) {
                    showMessage(`O CPF ou CNPJ do reboque ${i + 1} precisa ser preenchido corretamente`);
                    const input = document.getElementById(`CPF_CNPJProprietarioReboque${i}`);
                    if (input) {
                        input.focus();
                        input.style.borderColor = "red";
                    }
                    retorno = false;
                    break;
                }

                if (!reboque.tipoProprietarioReboque) {
                    showMessage(`O tipo do proprietário do reboque ${i + 1} precisa ser selecionado`);
                    const input = document.getElementById(`TipoProprietarioReboque${i}`);
                    if (input) {
                        input.focus();
                        input.style.borderColor = "red";
                    }
                    retorno = false;
                    break;
                }

                if (!reboque.nomeProprietarioReboque) {
                    showMessage(`O nome do proprietário do reboque ${i + 1} precisa ser preenchido`);
                    const input = document.getElementById(`NomeProprietarioReboque${i}`);
                    if (input) {
                        input.focus();
                        input.style.borderColor = "red";
                    }
                    retorno = false;
                    break;
                }

                if (!reboque.placaReboque) {
                    showMessage(`A placa do reboque ${i + 1} precisa ser preenchida`);
                    const input = document.getElementById(`PlacaReboque${i}`);
                    if (input) {
                        input.focus();
                        input.style.borderColor = "red";
                    }
                    retorno = false;
                    break;
                }

                if (!reboque.renavamReboque) {
                    showMessage(`O RENAVAM do reboque ${i + 1} precisa ser preenchido`);
                    const input = document.getElementById(`RenavamReboque${i}`);
                    if (input) {
                        input.focus();
                        input.style.borderColor = "red";
                    }
                    retorno = false;
                    break;
                }

                if (!reboque.ufReboque) {
                    showMessage(`A UF do reboque ${i + 1} precisa ser selecionada`);
                    const input = document.getElementById(`UFReboque${i}`);
                    if (input) {
                        input.focus();
                        input.style.borderColor = "red";
                    }
                    retorno = false;
                    break;
                }

                if (!reboque.descricaoReboque) {
                    showMessage(`A descrição do reboque ${i + 1} precisa ser preenchida`);
                    const input = document.getElementById(`DescricaoReboque${i}`);
                    if (input) {
                        input.focus();
                        input.style.borderColor = "red";
                    }
                    retorno = false;
                    break;
                }

                if (!reboque.rntrcReboque) {
                    showMessage(`O RNTRC do reboque ${i + 1} precisa ser preenchido`);
                    const input = document.getElementById(`RNTRCReboque${i}`);
                    if (input) {
                        input.focus();
                        input.style.borderColor = "red";
                    }
                    retorno = false;
                    break;
                }

                if (!reboque.tipoRNTRCReboque || reboque.tipoRNTRCReboque === "Selecione") {
                    showMessage(`O tipo de RNTRC do reboque ${i + 1} precisa ser selecionado`);
                    const input = document.getElementById(`TipoRNTRCReboque${i}`);
                    if (input) {
                        input.focus();
                        input.style.borderColor = "red";
                    }
                    retorno = false;
                    break;
                }

                if (!reboque.TipoCarroceriaReboque || reboque.TipoCarroceriaReboque === "Selecione") {
                    showMessage(`O tipo de carroceria do reboque ${i + 1} precisa ser selecionado`);
                    const input = document.getElementById(`TipoCarroceriaReboque${i}`);
                    if (input) {
                        input.focus();
                        input.style.borderColor = "red";
                    }
                    retorno = false;
                    break;
                }
            }
        }
        if (!documentAnttFrontImg) {
            showMessage("O campo 'Doc ANTT' precisa ter uma imagem importada");
            document.getElementById("documentAnttFrontImg").focus();
            retorno = false;
        }
        if (!documentCnhFrontImg) {
            showMessage("O campo 'CNH' precisa ter uma imagem importada");
            document.getElementById("documentCnhFrontImg").focus();
            retorno = false;
        }
        if (!documentCRLV) {
            showMessage("O campo 'CRLV' precisa ser cadastrado!")
            document.getElementById("documentCRLV").focus();
            retorno = false;
        }
        return retorno;
    }

    function save(){
        console.log('Salvando...') 
        if(validInput()){

            var history = {
                created: new Date(),
                userCreated: users.name
            }

            var address = {
                cep: withoutMaskCEP(cep),
                city: city ? city : "",
                district: district ? district : "",
                number: number ? number : "",
                state: state ? state : "",
                street: street ? street : "",
                comprovanteEndereco: comprovanteEndereco ? comprovanteEndereco : "",
                complementoEndereco: complementoEndereco ? complementoEndereco : "",
            }
    
            var dataBank = {
                accountDigit: accountDigit ? accountDigit : "",
                accountNumber: accountNumber ? accountNumber : "",
                agency: agency ? agency : "",
                bankName: bankName ? bankName : "",
                code: code ? code : "",
                holderAccount: holderAccount ? holderAccount : "",
                pix: pix ? pix : ""
            }
    
            var kinships = [
                {
                    contact: withoutMaskPhone(contactKinships1),
                    degree: degreeKinships1 ? degreeKinships1 : "",
                    name: nameKinships1 ? nameKinships1 : ""
        
                },
                {
                    contact: withoutMaskPhone(contactKinships2),
                    degree: degreeKinships2 ? degreeKinships2 : "",
                    name: nameKinships2 ? nameKinships2 : ""
                },
                {
                    contacts: contacts
                }
            ]
    
            var personalData = {
                contact: contact ? contact : "",
                documentAnttFrontImg: documentAnttFrontImg ? documentAnttFrontImg : "",
                documentCRLV: documentCRLV ? documentCRLV : "",
                documentCnhFrontImg:  documentCnhFrontImg ? documentCnhFrontImg : "",
                cnhReboque: cnhReboque ? cnhReboque : "",
                fullName: fullName ? fullName : "",
                sexGender: sexGender ? sexGender : "",
                documentCpf: cpf,
                documentCnh: documentCnh ? documentCnh : "",
                anttReboque: anttReboque ? anttReboque : "",
            }
    
            var professionalData = [
                {
                    contact: withoutMaskPhone(contactProfessional),
                    name: nameProfessional ? nameProfessional : ""
                },
                {
                    contact: withoutMaskPhone(contactProfessional1),
                    name: nameProfessional1 ? nameProfessional1 : ""
                },
                {
                    contactsProfessional: contactsProfessional
                }
            ]
    
            var vehicle = {
                bodyworkPlate: bodyworkPlate ? bodyworkPlate : "",
                bodyworkType: bodyworkType ? bodyworkType : "",
                vehicleImg: vehicleImg ? vehicleImg : "",
                vehiclePlate: vehiclePlate ? vehiclePlate : "",
                vehicleType: vehicleType ? vehicleType : "",
                renavam: renavam ? renavam : "",
                ufVeiculo: ufVeiculo ? ufVeiculo : "",
                descricaoVeiculo: descricaoVeiculo ? descricaoVeiculo : "",
                rntrc: rntrc ? rntrc : "",
                tipoRNTRC: tipoRNTRC ? tipoRNTRC : "",
                pesoTara: pesoTara ? pesoTara : "",
                capacidadeKG: capacidadeKG ? capacidadeKG : "",
                capacidadeM3: capacidadeM3 ? capacidadeM3 : "",
                tipoProprietario: tipoProprietario ? tipoProprietario : "",
                cpfoucnpj: cpfoucnpj ? cpfoucnpj : "",
                nomeProprietario: nomeProprietario ? nomeProprietario : "",
                veiculoProprio: veiculoProprio ? veiculoProprio : false,
                reboques: reboques,
            }

            let shipper = {
                uid: users.uidShipper,
                name: shippers.dataPersonal.socialName
            }

            if (birthDate && birthDate !== "") {
                let dataComSplit = birthDate.split("-");
                var dataNova = new Date(`${dataComSplit[0]}/${dataComSplit[1]}/${dataComSplit[2]}`);
            }

            if (dateRenovation && dateRenovation !== "") {
                let dataRenovSplit = dateRenovation.split("-");
                var dataRenovNova = new Date(`${dataRenovSplit[1]}/${dataRenovSplit[2]}/${dataRenovSplit[0]}`);
            }

            firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(async resultado => {

                let uid = resultado.user.uid;

                var data = {
                    birthDate: birthDate ? new Date(dataNova.toString()) : "",
                    documentCnhExpiration: documentCnhExpiration ? new Date(documentCnhExpiration) : "",
                    lastUpdatedBackOffice: new Date(),
                    dateRenovation: dateRenovation ? new Date(dataRenovNova.toString()) : "",
                    address: address,
                    dataBank: dataBank,
                    kinships: kinships,
                    personalData: personalData,
                    professionalReference: professionalData,
                    vehicle: vehicle,
                    shipper: shipper,
                    
                }

                var fistData = {
                    cpf: withoutMaskCPF(cpf),
                    email: email,
                    name: fullName,
                    uid: uid,
                    statusDriver: status,
                    accountCreated: new Date(),
                    history: history,
                    idNotification: '',
                    uidShipper: users.uidShipper
                }

                await db.collection('drivers_users').doc(uid).set(fistData);

                await db.collection('drivers_users').doc(uid)
                .collection('documents').doc('allData').set(data).then(() => {
                        setCarregando(0) 
                        setMsgTipo('sucesso');
                        navigate("/driverList");
                });

                await paymentService.prepareEmailDriver(password, email);

            })
            .catch(error => {
                // setCarregando(0)
                setMsgTipo('erro')
                switch (error.message) {
                    case 'Firebase: Password should be at least 6 characters (auth/weak-password).':
                        setMsg('A senha deve ter pelo menos 6 caracteres')
                        setMsgTipo('erro');
                        setTitle(' Oops!')
                        setOpenDialog(true)
                        break;
                    case 'Firebase: The email address is already in use by another account. (auth/email-already-in-use).':
                        setMsg('Este e-mail já está sendo utilizado por outro usuário')
                        setMsgTipo('erro');
                        setTitle(' Oops!')
                        setOpenDialog(true)
                        break;
                    case 'Firebase: The email address is badly formatted. (auth/invalid-email).':
                        setMsg('O formato do seu e-mail é inválido!')
                        setMsgTipo('erro');
                        setTitle(' Oops!')
                        setOpenDialog(true)
                        break;
                    default:
                        setMsg('Não foi possível cadastrar. Tente novamente mais tarde ou contate o administrador!')
                        setMsgTipo('erro');
                        setTitle(' Oops!')
                        setOpenDialog(true)
                        // setErrorFirebase(true);
                        break;
                }
            });
        }
    }

    function update(){
        setCarregando(1);

        if(!validInput()){ return };

        var history = {
            lastUpdateAutorized: new Date()
            // (status === "" ? new Date() : "")
        }
        var data = {
            email: email ? email : "",
            cpf: withoutMaskCPF(cpf),
            statusDriver: status ? status : "",
            history: history
        }

        var address = {
            cep: withoutMaskCEP(cep),
            city: city ? city : "",
            district: district ? district : "",
            number: number ? number : "",
            state: state ? state : "",
            street: street ? street : "",
            comprovanteEndereco: comprovanteEndereco ? comprovanteEndereco : "",
            complementoEndereco: complementoEndereco ? complementoEndereco : "",
        }

        var dataBank = {
            accountDigit: accountDigit ? accountDigit : "",
            accountNumber: accountNumber ? accountNumber : "",
            agency: agency ? agency : "",
            bankName: bankName ? bankName : "",
            code: code ? code : "",
            holderAccount: holderAccount ? holderAccount : "",
            ispb: ispb ? ispb : "",
            pix: pix ? pix : ""
        }

        var kinships = [
            {
                contact: withoutMaskPhone(contactKinships1),
                degree: degreeKinships1 ? degreeKinships1 : "",
                name: nameKinships1 ? nameKinships1 : ""
            },
            {
                contact: withoutMaskPhone(contactKinships2),
                degree: degreeKinships2 ? degreeKinships2 : "",
                name: nameKinships2 ? nameKinships2 : ""
            }
        ]

        var personalData = {
            contact: contact ? contact : "",
            documentAnttFrontImg: documentAnttFrontImg ? documentAnttFrontImg : "",
            documentCRLV: documentCRLV ? documentCRLV : "",
            documentCnhFrontImg:  documentCnhFrontImg ? documentCnhFrontImg : "",
            cnhReboque: cnhReboque ? cnhReboque : "",
            fullName: fullName ? fullName : "",
            sexGender: sexGender ? sexGender : "",
            documentCnh: documentCnh ? documentCnh : "",
            anttReboque: anttReboque ? anttReboque : "",
        }

        var professionalData = [
            {
                contact: withoutMaskPhone(contactProfessional),
                name: nameProfessional ? nameProfessional : ""
            },
            {
                contact: withoutMaskPhone(contactProfessional1),
                name: nameProfessional1 ? nameProfessional1 : ""
            }
        ]

        var vehicle = {
            bodyworkPlate: bodyworkPlate ? bodyworkPlate : "",
            bodyworkType: bodyworkType ? bodyworkType : "",
            vehicleImg: vehicleImg ? vehicleImg : "",
            vehiclePlate: vehiclePlate ? vehiclePlate : "",
            vehicleType: vehicleType ? vehicleType : "",
            renavam: renavam ? renavam : "",
            ufVeiculo: ufVeiculo ? ufVeiculo : "",
            descricaoVeiculo: descricaoVeiculo ? descricaoVeiculo : "",
            rntrc: rntrc ? rntrc : "",
            tipoRNTRC: tipoRNTRC ? tipoRNTRC : "",
            pesoTara: pesoTara ? pesoTara : "",
            capacidadeKG: capacidadeKG ? capacidadeKG : "",
            capacidadeM3: capacidadeM3 ? capacidadeM3 : "",
            tipoProprietario: tipoProprietario ? tipoProprietario : "",
            cpfoucnpj: cpfoucnpj ? cpfoucnpj : "",
            nomeProprietario: nomeProprietario ? nomeProprietario : "",
            veiculoProprio: veiculoProprio ? veiculoProprio : false,
            reboques: reboques,
        }

        if (birthDate && birthDate !== "") {
            let dataComSplit = birthDate.split("-");
            var dataNova = new Date(`${dataComSplit[0]}/${dataComSplit[1]}/${dataComSplit[2]}`);
        }

        if (dateRenovation && dateRenovation !== "") {
            let dataRenovSplit = dateRenovation.split("-");
            var dataRenovNova = new Date(`${dataRenovSplit[1]}/${dataRenovSplit[2]}/${dataRenovSplit[0]}`);
        }

        let shipper = {
            uid: users.uidShipper,
            name: shippers.dataPersonal.socialName
        }

        var dataAll = {
            birthDate: birthDate ? new Date(dataNova.toString()) : "",
            documentCnhExpiration: documentCnhExpiration ? new Date(documentCnhExpiration) : "",
            lastUpdatedBackOffice: new Date(),
            dateRenovation: dateRenovation ? new Date(dataRenovNova.toString()) : "",
            address: address,
            dataBank: dataBank,
            kinships: kinships,
            personalData: personalData,
            professionalReference: professionalData,
            vehicle: vehicle,
            shipper: shipper
        }

        //Se a senha for 
        if(password && currentPassword){

            // 1. Pegue o usuário atual
            var user = firebase.auth().currentUser;

            // 2. Crie as credenciais novamente (com email e senha do usuário)
            const credential = EmailAuthProvider.credential( email, currentPassword );

            // 3. Reautentique
            reauthenticateWithCredential(user, credential).then(() => { return updatePassword(user, password); }).then(() => { console.log("Senha atualizada com sucesso"); })
            .catch((error) => {
                switch (error.message) {
                    case 'Firebase: This operation is sensitive and requires recent authentication. Log in again before retrying this request. (auth/requires-recent-login).':
                        setMsg('Essa operação é muito sensiva e requer uma autenticação recente, por favor realizar o login novamente antes de alterar.')
                        setMsgTipo('erro');
                        setTitle(' Oops!')
                        setOpenDialog(true)
                        break;
                    default:
                        setMsg('Não foi possível atualizar a senha. Tente novamente mais tarde ou contate o administrador!')
                        setMsgTipo('erro');
                        setTitle(' Oops!')
                        setOpenDialog(true)
                        break;
                }

                console.error("Erro ao atualizar senha:", error);
            });
        }

        db.collection('drivers_users').doc(id).update(data).then(() => {
            db.collection('drivers_users').doc(id)
                .collection('documents')
                .doc("allData")
                .update(dataAll).then(() => {
                    setCarregando(0)
                    navigate("/driverList");        

            });

        }).catch(error => {
            setCarregando(0)
        });

    }

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
                    setDistrict(data?.bairro)
                    setCity(data?.localidade)
                    setState(data?.uf)
                }
            })
            .catch(err => console.log(err));
        }
    }

    function withoutMaskPhone(input){  return (input ? input.replace("(","").replace(")","").replace(" ","").replace("-","") : ""); }

    function withoutMaskCPF(input){ return (input ? input.replace(".","").replace(".","").replace("-",""): ""); }

    function withoutMaskCEP(input){ return (input ? input.replace("-",""): ""); }

    const handleReset = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('E-mail de redefinição enviado. Contate o(a) motorista para verificar sua caixa de e-mail.');
            setError('');
            setShowResetPassword(true)
        } catch (err) {
            setError('Erro ao enviar e-mail. Verifique o endereço de e-mail.');
            setMessage('');
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleUpload = (file) => {

        if(!file) return;

        var contest = file;

        const storageRef = ref(storage, `drivers_users/${id}/${contest.name}`);

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

                    if(origem === "ANTT Frente"){
                            setDocumentAnttFrontImg(downloadURL)
                            setOpen(false)                
                            setOrigem("")
                            contest = null;
                    }else
                        if(origem === "ANTT Verso"){
                            setdocumentCRLV(downloadURL)
                            setOpen(false)
                            setOrigem("")
                    }else 
                        if(origem === "CNH Frente"){
                            setDocumentCnhFrontImg(downloadURL)
                            setOpen(false)
                            setOrigem("")
                    }else  
                        if(origem.startsWith("CNH Verso")) {
                            const index = parseInt(origem.replace("CNH Verso ", ""));
                            handleUploadCnhReboque(index, downloadURL);
                            setOpen(false)
                            setOrigem("")
                        return;
                    }else 
                        if(origem === "Imagem veiculo"){
                            setVehicleImg(downloadURL)    
                            setOpen(false)
                            setOrigem("")
                    }else if(origem.startsWith("Antt Reboque")) {
                        const index = parseInt(origem.replace("Antt Reboque ", ""));
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            handleUploadAnttReboque(index, downloadURL);
                            setOpen(false)
                            setOrigem("")
                        });
                        return;
                    } else if (origem === "Comprovante Endereco") {
                        setComprovanteEndereco(downloadURL)
                        setOpen(false)
                        setOrigem("")
                    }
                });
        })
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

            console.log("Arquivo excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir o arquivo:", error);
            alert("Erro ao excluir o arquivo.");
        }
    };

    const onChangeStatus = (e) => {
        setStatus(e.target.value);
    };

    const formatMask = (value) => {
        if (!value) return value;

        const raw = value.replace(/\D/g, '');
        if (raw.length === 11) {
            return raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (raw.length === 14) {
            return raw.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        return value;
    };

    const handleChange = (e) => {
        setCpfouCnpj(formatMask(e.target.value));
    };

    const handleCheckboxChange = (e) => {
        setVeiculoProprio(e.target.checked);
    };

    const formatarPeso = (valor) => {
        let valorFormatado = "0";
        if (valor !== undefined && valor !== null && valor !== "") {
            const numeros = valor.replace(/\D/g, '');
            valorFormatado = parseInt(numeros || "0", 10).toLocaleString('pt-BR');
            return valorFormatado;
        }
        return valorFormatado;
    };

    const handlePesoChange = (index, campo, valor) => {
        let valorFormatado = "0,00";
        if (valor !== undefined && valor !== null && valor !== "") {
            valorFormatado = formatarPeso(valor);
        }
        handleChangeReboques(index, campo, valorFormatado);
    };

    const handleChangeTypeVeiculo = (value) => {

        if(value == "CARRETA S" || value == "CARRETA LS" || value == "BITREM" || value == "RODOTREM" || value == "VANDERLEIA") {
            setPesoTara("0");
            setCapacidadeKG("0");
            setCapacidadeM3("0");
            setDisabledList(true);
        }

        setVehicleType(value)

    };

    return (
    <>
        { 
        useSelector(state => state.usuarioLogado) > 0 ?

            <NewMiniDrawer divOpen={

                <Layout style={{ minHeight: '100vh' }}>
                    
                    <AlertDialog
                        handleClose={handleClose} 
                        open={open} 
                        origem={origem} 
                        handleUpload={handleUpload}
                    />

                    <Header
                        style={{
                            backgroundColor: '#fff',
                            padding: '10px 20px',
                            borderBottom: '1px solid #ddd',
                            display: 'flex',
                            alignItems: 'center',
                            paddingTop: '30px'
                        }}
                        >
                        <Avatar
                            size={120}
                            src="https://via.placeholder.com/150"
                            style={{ marginRight: '16px' }}
                        />
                        <div>
                            <Title level={4} style={{ margin: 0 }}>
                            {fullName ? fullName : ""}
                            </Title>
                            <Rate allowHalf defaultValue={1.0} value={1}/>
                        </div>
                    </Header>
                    
                    <Content style={{ padding: '20px', marginTop: '20px' }}>

                        <Row gutter={10}>
                            <Col span={14}>
                            <Card title="Cadastro de Motorista" bordered={false}>

                                    <Row gutter={16}>
                                    
                                        <Col span={14}>
                                            <div className="col-md-12">
                                                <label htmlFor="fullName" className="form-label">Nome Completo <span style={{ color: 'red' }}>*</span></label>
                                                <input type="text"  onChange={(e)=> setFullName(e.target.value)} 
                                                    value={fullName && fullName}  className={`form-control ${fullName === '' ? 'empty-field' : ''}`}
                                                    id="fullName"
                                                />
                                            </div>
                                        </Col>
                                        <Col span={10}>
                                                <label htmlFor="cpf" className="form-label">CPF <span style={{ color: 'red' }}>*</span></label>
                                                <InputMask mask="999.999.999-99" className="form-control" onChange={(e)=> setCpf(e.target.value)} value={cpf && cpf} id="cpf" maskChar={null} alwaysShowMask={false} />
                                                {erroForm?.cpf?.hasError && (
                                                    <div className="fade-message">
                                                        <small className="text-danger">{erroForm.cpf.message}</small>
                                                    </div>
                                                )}
                                        </Col>
                                        
                                    </Row>

                                    <Row gutter={16} style={{ marginTop: '16px' }}>
                                        <Col span={8}>
                                            <div className="col-md-12">
                                            <label htmlFor="nome" className="form-label">Data nascimento <span style={{ color: 'red' }}>*</span></label>
                                             <input type="date" onChange={(e)=> setBirthDate(e.target.value)}  value={birthDate && birthDate}  className="form-control" id="birthDateDriver"/>
                                          </div>
                                            
                                        </Col>
                                        <Col span={8}>
                                            <div className="col-md-12">
                                                <label htmlFor="nome" className="form-label">Celular <span style={{ color: 'red' }}>*</span></label>
                                                <InputMask mask="(99) 99999-9999" className="form-control" 
                                                    onChange={(e)=> setContact(e.target.value)} 
                                                    value={contact && contact} 
                                                    id="contact"/>
                                            </div>
                                        </Col>
                                        <Col span={8}>
                                            <div className="col-md-12">
                                                <label htmlFor="sexGender" className="form-label">Gênero <span style={{ color: 'red' }}>*</span></label>
                                                <select className="form-select" id="formOfPayment" value={sexGender && sexGender}  onChange={(e)=> setSexGender(e.target.value)} aria-label="">
                                                    <option defaultValue="">Selecione</option>
                                                    <option value="Masculino">Masculino</option>
                                                    <option value="Feminino">Feminino</option>
                                                    <option value="Outro">Outro</option>
                                                    <option value="Prefiro não dizer">Prefiro não dizer</option>
                                                </select>
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row gutter={16} style={{ marginTop: '16px' }}>

                                        <Col span={8}>
                                            <div className="col-md-12">
                                                <label htmlFor="numeroCNH" className="form-label">Número CNH <span style={{ color: 'red' }}>*</span></label>
                                                {/* <input type="text" onChange={(e)=> setDocumentCnh(e.target.value)} value={documentCnh && documentCnh} className="form-control" id="numeroCNH"/> */}
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    className="form-control"
                                                    id="numeroCNH"
                                                    value={documentCnh && documentCnh}
                                                    onChange={(e) => {
                                                        const onlyNumbers = e.target.value.replace(/\D/g, '');
                                                        setDocumentCnh(onlyNumbers);
                                                    }}
                                                    maxLength={20} // previne que o usuário digite muito mais do que 11
                                                    placeholder="Somente números"
                                                />
                                                {(documentCnh || "").length > 11 && (
                                                    <div className="fade-message">
                                                        <small className="text-danger">A CNH não pode ter mais de 11 dígitos.</small>
                                                    </div>
                                                )}
                                            </div>
                                        </Col>
                                        <Col span={8}>
                                            <div className="col-md-12">
                                                <label htmlFor="documentCnhExpiration" className="form-label">Validade CNH <span style={{ color: 'red' }}>*</span></label>
                                                <input type="date"  onChange={(e)=> setDocumentCnhExpiration(e.target.value)} value={documentCnhExpiration && documentCnhExpiration}  className="form-control" id="documentCnhExpiration"/>
                                            </div>
                                        </Col>
                                        <Col span={8}>
                                            <div className="col-md-12" >
                                                <div >
                                                    <label tabIndex={"0"} id="documentCnhFrontImg" htmlFor="documentCnhFrontImg" className="form-label">CNH  <span style={{ color: 'red' }}>*</span></label>
                                                </div>

                                                {documentCnhFrontImg ? (
                                                    <ul className="col-md-12" style={{ listStyle: "none", padding: 0, margin: 0 }}>
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
                                                            <a
                                                                href={documentCnhFrontImg}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    width: "100%",
                                                                    textDecoration: "none",
                                                                    color: "#007bff",
                                                                    fontWeight: 500,
                                                                    marginRight: 10,
                                                                    padding: "6px 14px",
                                                                    borderRadius: 6,
                                                                    background: "linear-gradient(90deg, #e3f0ff 0%, #f6faff 100%)",
                                                                    // border: "1px solid #b6d4fe",
                                                                    boxShadow: "0 2px 8px rgba(0,123,255,0.08)",
                                                                    transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                                                                    display: "inline-block",
                                                                    cursor: "pointer"
                                                                }}
                                                                onMouseOver={e => {
                                                                    e.currentTarget.style.background = "#d0e7ff";
                                                                    e.currentTarget.style.color = "#0056b3";
                                                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,123,255,0.15)";
                                                                }}
                                                                onMouseOut={e => {
                                                                    e.currentTarget.style.background = "linear-gradient(90deg, #e3f0ff 0%, #f6faff 100%)";
                                                                    e.currentTarget.style.color = "#007bff";
                                                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,123,255,0.08)";
                                                                }}
                                                            >
                                                                CNH
                                                            </a>
                                                            <IconButton
                                                                aria-label="Excluir"
                                                                size="small"
                                                                color="error"
                                                                onClick={() => {handleDelete(documentCnhFrontImg); setDocumentCnhFrontImg(null);}}
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
                                                    ) : (
                                                    <Button
                                                        className="col-md-12"
                                                        variant="outlined"
                                                        onClick={() => {
                                                        handleClickOpen();
                                                        setOrigem("CNH Frente");
                                                        }}
                                                    >
                                                        Importar Documento
                                                    </Button>
                                                )}

                                            </div>
                                        </Col>

                                    </Row>

                                    <Row gutter={16} style={{ marginTop: '16px' }}>
                                        <Col span={8}>
                                            <div className="col-md-12">
                                                <label htmlFor="email" className="form-label">E-mail (Login do motorista) <span style={{ color: 'red' }}>*</span></label>
                                                <input type="text" disabled={id ? true : false}  onChange={(e)=> setEmail(e.target.value)} 
                                                value={email && email}  className="form-control" id="email"/>
                                            </div>
                                        </Col>

                                        <>
                                        {id &&  (
                                            <Col span={8}>
                                                <div className="col-md-12">
                                                    <label htmlFor="email" className="form-label">Redefinir senha do motorista <span style={{ color: 'red' }}>*</span></label>
                                                    <Tooltip title="Será enviado um link para o motorista por e-mail para redefinição de senha">
                                                        <Button type="primary" danger
                                                            variant="text"
                                                            onClick={handleReset}
                                                        >
                                                        Redefinir Senha
                                                        </Button>
                                                        {showResetPassword && (
                                                            <>
                                                                {message && <p style={{ color: 'green' }}>{message}</p>}
                                                                {error && <p style={{ color: 'red' }}>{error}</p>}
                                                            </>
                                                        )}
                                                    </Tooltip>
                                                </div>
                                            </Col>
                                        )}
                                        </>

                                        {!id && ( 

                                            <>
                                                <Col span={8}>
                                                    <div className="col-md-12">
                                                        <label htmlFor="password" className="form-label">Senha {/* <span style={{ color: 'red' }}>*</span> */}</label>
                                                            <PasswordInput onBlur={handlePasswordBlur} onChange={(value) => {
                                                                    setPassword(value)
                                                                    if (passwordTouched && value) setPasswordError("");
                                                                }}
                                                                id="password"
                                                            />
                                                            {passwordError && (
                                                                <div style={{ color: "red", fontSize: "0.9em" }}>{passwordError}</div>
                                                            )}
                                                    </div>
                                                </Col> 
                                                <Col span={8}>
                                                    <div className="col-md-12">
                                                        <label htmlFor="passwordConfirm" className="form-label">Confirme senha <span style={{ color: 'red' }}>*</span></label>
                                                        <PasswordInput onChange={(value) => setConfirmPassword(value)} id="confirmPassword" />
                                                    </div>
                                                </Col>
                                            </>

                                        )} 
                                    </Row>

                            </Card>
                            </Col>
                
                            {/* Right Side - Statistics */}
                            <Col span={10}>
                                <Card  bordered={false}>
                                    <Row gutter={16}>
                                        <Radio.Group onChange={onChangeStatus} value={status && status}>
                                            <Radio value={"authorized"}>Autorizado</Radio>
                                            <Radio value={"informed"}>Pendente</Radio>
                                            <Radio value={"incomplete"}>Incompleto</Radio>
                                        </Radio.Group>
                                    </Row>
                                </Card>
                                <Card bordered={false} style={{ marginTop: '10px' }}>
                                    <Row>
                                    <Col span={12}>
                                        <div>
                                            <Title level={5}>Quantidade de viagens</Title> {/* TODO Colocar função aq */}
                                            <h1 style={{ color: '#1890ff' }}>{totalDocuments}</h1> 
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div>
                                        <Title level={5}>Total recebido</Title>
                                        <h3 level={3} style={{ color: '#52c41a' }}>R$ 0,00</h3>
                                        </div>
                                    </Col>
                                    </Row>
                                    <Row style={{ marginTop: '20px' }}>
                                    <Col span={12}>
                                        <div>
                                        <Title level={5}>Entregas efetuadas</Title>
                                        <h1 level={3} style={{ color: '#1890ff' }}>{totalFinalized}</h1>
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div>
                                        <Title level={5}>Ocorrências</Title>
                                        <h1 level={3} style={{ color: '#ff4d4f' }}>0</h1>
                                        </div>
                                    </Col>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
            
                    {/* Tabs */}
                        <Card style={{ marginTop: '20px' }}>
                            <Tabs defaultActiveKey="1">
                           
                            <TabPane tab="Veículos Tração" key="2">
                                <div className="row">
                                    <div className="col-2">
                                        <label htmlFor="vehiclePlate" className="form-label">Placa do veículo</label>
                                        <InputMask
                                            mask="aaa-9*99"
                                            maskChar=""
                                            value={vehiclePlate}
                                            onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                                        >
                                            {(inputProps) => <input {...inputProps} className="form-control" id="vehiclePlate" placeholder="ABC-1234" />}
                                        </InputMask>
                                    </div>
                                    <div className="col-2">
                                        <label htmlFor="renavam" className="form-label">Renavam</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            className="form-control"
                                            id="renavam"
                                            value={renavam && renavam}
                                            onChange={(e) => {
                                                const onlyNumbers = e.target.value.replace(/\D/g, '');
                                                setRenavam(onlyNumbers)
                                            }}
                                            maxLength={11} // previne que o usuário digite muito mais do que 11
                                            placeholder="Somente números"
                                        />
                                        {(renavam || "").length > 11 && (
                                            <div className="fade-message">
                                                <small className="text-danger">O RENAVAM não pode ter mais de 11 dígitos.</small>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ width: "20%" }} >
                                        <label htmlFor="ufVeiculo" className="form-label">UF Veículo</label>
                                        <select 
                                            className="form-select"
                                            id="ufVeiculo"
                                            value={ufVeiculo || ""} 
                                            onChange={(e) => setUfVeiculo(e.target.value)}
                                        >
                                            <option value="">Selecione um estado</option>
                                            {statesUF.map((state) => (
                                                <option key={state.value} value={state.value}>
                                                    {state.label} ({state.value})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-2">
                                        <div>
                                            <label tabIndex={"0"} id="documentCRLV" htmlFor="documentCRLV"  className="form-label">CRLV <span style={{ color: 'red' }}>*</span> </label>
                                        </div>
                                        {
                                            documentCRLV ? (
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
                                                        <a
                                                            href={documentCRLV}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                width: "100%",
                                                                textDecoration: "none",
                                                                color: "#007bff",
                                                                fontWeight: 500,
                                                                marginRight: 10,
                                                                padding: "6px 14px",
                                                                borderRadius: 6,
                                                                background: "linear-gradient(90deg, #e3f0ff 0%, #f6faff 100%)",
                                                                // border: "1px solid #b6d4fe",
                                                                boxShadow: "0 2px 8px rgba(0,123,255,0.08)",
                                                                transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                                                                display: "inline-block",
                                                                cursor: "pointer"
                                                            }}
                                                            onMouseOver={e => {
                                                                e.currentTarget.style.background = "#d0e7ff";
                                                                e.currentTarget.style.color = "#0056b3";
                                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,123,255,0.15)";
                                                            }}
                                                            onMouseOut={e => {
                                                                e.currentTarget.style.background = "linear-gradient(90deg, #e3f0ff 0%, #f6faff 100%)";
                                                                e.currentTarget.style.color = "#007bff";
                                                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,123,255,0.08)";
                                                            }}
                                                        >
                                                            CRLV
                                                        </a>
                                                        <IconButton
                                                            aria-label="Excluir"
                                                            size="small"
                                                            color="error"
                                                            onClick={() => {handleDelete(documentCRLV); setdocumentCRLV(null);}}
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
                                                    setOrigem("ANTT Verso");
                                                }}
                                            >
                                                Importar Documento
                                            </Button>
                                        }
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-4">
                                        <label htmlFor="descricaoVeiculo" className="form-label">Descrição Veículo</label>
                                        <input type="text"  onChange={(e)=> setDescricaoVeiculo(e.target.value)} value={descricaoVeiculo && descricaoVeiculo}  className="form-control" id="descricaoVeiculo"/>
                                    </div>
                                    <div className="col-md-2">
                                        <label htmlFor="vehicleType" className="form-label">Tipo de veículo</label>
                                        <select className="form-select" id="formOfPayment" value={vehicleType && vehicleType}  onChange={(e)=> handleChangeTypeVeiculo(e.target.value)} aria-label="">
                                            <option defaultValue="">Selecione</option>
                                            <option value="FIORINO">FIORINO</option>
                                            <option value="TRUCK">TRUCK</option>
                                            <option value="BI-TRUCK">BI-TRUCK</option>
                                            <option value="CARRETA S">CARRETA S</option>
                                            <option value="CARRETA LS">CARRETA LS</option>
                                            <option value="TOCO">TOCO</option>
                                            <option value="3/4">3/4</option>
                                            <option value="VUC">VUC</option>
                                            <option value="BITREM">BITREM</option>
                                            <option value="RODOTREM">RODOTREM</option>
                                            <option value="MUNK">MUNK</option>
                                            <option value="VANDERLEIA">VANDERLEIA</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div className="col-2">
                                        <label htmlFor="RNTRC" className="form-label">RNTRC</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            className="form-control"
                                            id="RNTRC"
                                            value={rntrc}
                                            onChange={(e) => {
                                                let valor = e.target.value.replace(/\D/g, '');
                                                setRntrc(valor);
                                            }}
                                            maxLength={8}
                                            placeholder="Apenas números"
                                        />
                                        {rntrc && ((rntrc[0] === '0' ? rntrc.length - 1 : rntrc.length) > 8) && (
                                            <div className="fade-message">
                                                <small className="text-danger">
                                                    O RNTRC deve conter no máximo 8 dígitos válidos!
                                                </small>
                                            </div>
                                        )}
                                    </div>

                                    <div class="col-2">
                                        <label htmlFor="tipoRNTRC" className="form-label">Tipo RNTRC</label>
                                        <select className="form-select" id="formOfPayment" value={tipoRNTRC && tipoRNTRC}  onChange={(e)=> setTipoRNTRC(e.target.value)} aria-label="">
                                            <option defaultValue="">Selecione</option>
                                            <option value="tac">TAC</option>
                                            <option value="etc">ETC</option>
                                            <option value="ctc">CTC</option>
                                        </select>
                                    </div>
                                    <div className="col-2" >
                                        <label htmlFor="bodyworkType"  className="form-label">Tipo Carroceria</label>

                                        <select className="form-select" id="formOfPayment" value={bodyworkType && bodyworkType}  onChange={(e)=> setBodyworkType(e.target.value)} aria-label="" disabled={disabledList}>
                                            <option defaultValue="">Selecione</option>
                                            <option value="BOBINEIRA">BOBINEIRA</option>
                                            <option value="GRADE BAIXA">GRADE BAIXA</option>
                                            <option value="BAÚSECO">BAÚSECO</option>
                                            <option value="BAÚ FRIGORIFICO">BAÚ FRIGORIFICO</option>
                                            <option value="ABERTO">ABERTO</option>
                                            <option value="BAÚ">BAÚ</option>
                                            <option value="DOLLY">DOLLY</option>
                                            <option value="GRANELEIRO">GRANELEIRO</option>
                                            <option value="SIDER">SIDER</option>
                                            <option value="PRANCHA">PRANCHA</option>
                                            <option value="TANQUE">TANQUE</option>
                                            <option value="CAÇAMBA">CAÇAMBA</option>
                                            <option value="PORTA CONTEINER">PORTA CONTEINER</option>
                                            <option value="CILO">CILO</option>
                                            <option value="CEGONHA">CEGONHA</option>
                                        </select>
                                    </div>
                                    <div className="col-2">
                                        <div> 
                                            <label tabIndex={"0"} id="documentAnttFrontImg" htmlFor="documentAnttFrontImg"  className="form-label"> Doc ANTT <span style={{ color: 'red' }}>*</span> </label>
                                        </div>
                                        {
                                            documentAnttFrontImg ? (
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
                                                        <a
                                                            href={documentAnttFrontImg}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                width: "100%",
                                                                textDecoration: "none",
                                                                color: "#007bff",
                                                                fontWeight: 500,
                                                                marginRight: 10,
                                                                padding: "6px 14px",
                                                                borderRadius: 6,
                                                                background: "linear-gradient(90deg, #e3f0ff 0%, #f6faff 100%)",
                                                                // border: "1px solid #b6d4fe",
                                                                boxShadow: "0 2px 8px rgba(0,123,255,0.08)",
                                                                transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                                                                display: "inline-block",
                                                                cursor: "pointer"
                                                            }}
                                                            onMouseOver={e => {
                                                                e.currentTarget.style.background = "#d0e7ff";
                                                                e.currentTarget.style.color = "#0056b3";
                                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,123,255,0.15)";
                                                            }}
                                                            onMouseOut={e => {
                                                                e.currentTarget.style.background = "linear-gradient(90deg, #e3f0ff 0%, #f6faff 100%)";
                                                                e.currentTarget.style.color = "#007bff";
                                                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,123,255,0.08)";
                                                            }}
                                                        >
                                                            ANTT Veículo
                                                        </a>
                                                        <IconButton
                                                            aria-label="Excluir"
                                                            size="small"
                                                            color="error"
                                                            onClick={() => {handleDelete(documentAnttFrontImg); setDocumentAnttFrontImg(null);}}
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
                                                    setOrigem("ANTT Frente");
                                                }}
                                            >
                                                Importar Documento
                                            </Button>
                                        }

                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-2">
                                        <label htmlFor="pesoTara" className="form-label">Peso (Tara)</label>
                                        <input type="text"  onChange={(e)=> setPesoTara(formatarPeso(e.target.value))} 
                                            value={pesoTara || "0"} className="form-control" 
                                            id="pesoTara" placeholder="0" disabled={disabledList} />
                                    </div>
                                    <div class="col-2">
                                        <label htmlFor="capacidadeKG" className="form-label">Capacidade (KG)</label>
                                        <input type="text"  onChange={(e)=> setCapacidadeKG(formatarPeso(e.target.value))} value={capacidadeKG || "0"} className="form-control" id="capacidadeKG" placeholder="0" disabled={disabledList} />
                                    </div>
                                    <div class="col-2">
                                        <label htmlFor="capacidadeM3" className="form-label">Capacidade (M³)</label>
                                        <input type="text"  onChange={(e)=> setCapacidadeM3(formatarPeso(e.target.value))} value={capacidadeM3 || "0"} className="form-control" id="capacidadeM3" placeholder="0" disabled={disabledList} />
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-2">
                                        <label htmlFor="tipoProprietario" className="form-label">Tipo Proprietário</label>
                                        <select className="form-select" id="formOfPayment" value={tipoProprietario && tipoProprietario}  onChange={(e)=> setTipoProprietario(e.target.value)} aria-label="">
                                            <option defaultValue="">Selecione</option>
                                            <option value="cpf">CPF</option>
                                            <option value="cnpj">CNPJ</option>
                                        </select>
                                    </div>
                                    <div class="col-2">
                                        <label htmlFor="CPF_CNPJProprietario" className="form-label">CPF/CNPJ Proprietário</label>
                                        <InputMask id="CPF_CNPJProprietario" value={cpfoucnpj && cpfoucnpj} mask={mask} onChange={handleChange} className="form-control" />
                                        {(() => {
                                            if (!cpfoucnpj || typeof cpfoucnpj !== "string") return "";
                                            
                                            const digits = cpfoucnpj.replace(/\D/g, '');
                                            const hasValue = digits.length > 0;
                                            const isValid = digits.length === 11 || digits.length === 14;
                                            
                                            // return hasValue && !isValid && (
                                            if (hasValue && !isValid) {
                                                return (
                                                    <div className="fade-message">
                                                        <small className="text-danger">
                                                            O CPF deve conter 11 dígitos ou CNPJ 14 dígitos válidos!
                                                        </small>
                                                    </div>
                                                );
                                            }
                                            if (erroNomeCpfIgual === true) {
                                                return (
                                                    <div className="fade-message">
                                                        <small className="text-danger">
                                                            O cpf é igual ao do motorista!
                                                            Selecione a opção Veículo Proprio!
                                                        </small>
                                                    </div>
                                                )
                                            }

                                            return null;
                                        })()}
                                    </div>
                                    <div class="col-2">
                                        <label htmlFor="nomeProprietario" className="form-label">Nome Proprietário</label>
                                        <input type="text"  onChange={(e)=> setNomeProprietario(e.target.value)} value={nomeProprietario && nomeProprietario}  className="form-control" id="nomeProprietario"/>
                                        { (() => {
                                            if (erroNomeCpfIgual === true) {
                                                return (
                                                    <div className="fade-message">
                                                        <small className="text-danger">
                                                            O nome é igual ao do motorista!
                                                            Selecione a opção Veículo Proprio!
                                                        </small>
                                                    </div>
                                                )
                                            }
                                        })()}
                                    </div>
                                    <div class="row">
                                        <div class="col-2">
                                        </div>
                                        <div class="col-2">
                                        </div>
                                        <div style={{ marginTop: "5px" }} class="col-2">
                                            <input type="checkbox" name="VeiculoProprio" id="veiculoProprio" checked={veiculoProprio} onChange={handleCheckboxChange} />
                                            <label style={{ marginLeft: "5px" }} htmlFor="veiculoProprio" className="form-label">Veículo Próprio</label>
                                        </div>
                                    </div>
                                </div>
                            </TabPane>

                            {Array.isArray(reboques) && reboques.filter(r => r && typeof r === 'object').map((reboque, index) => (
                                <TabPane key={`reboque-${index}`} 
                                    tab={
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {`Veículos Reboque ${index + 1}`}
                                            {reboques.length > 1 && (
                                                <IconButton
                                                    aria-label="Excluir reboque"
                                                    size="small"
                                                    color="error"
                                                    style={{ marginLeft: 4 }}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        removerReboque(index);
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </span>
                                    }
                                >
                                    <Cards>
                                        <div className="row">
                                            <div className="col-2">
                                                <label htmlFor={`placaReboque${index}`} className="form-label">Placa Reboque</label>
                                                <InputMask
                                                    mask="aaa-9*99"
                                                    maskChar=""
                                                    value={reboque.placaReboque}
                                                    onChange={(e) => handleChangeReboques(index, 'placaReboque', e.target.value.toUpperCase())}
                                                >
                                                    {(inputProps) => (
                                                    <input {...inputProps} className="form-control" id={`placaReboque${index}`} placeholder="ABC-1234" />
                                                    )}
                                                </InputMask>
                                            </div>
                                            <div className="col-2">
                                                <label htmlFor={`renavamReboque${index}`} className="form-label">Renavam Reboque</label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    className="form-control"
                                                    id={`renavamReboque${index}`}
                                                    value={reboque.renavamReboque}
                                                    onChange={(e) => {
                                                    const onlyNumbers = e.target.value.replace(/\D/g, '');
                                                    handleChangeReboques(index, 'renavamReboque', onlyNumbers);
                                                    }}
                                                    maxLength={11}
                                                    placeholder="Somente números"
                                                />
                                                {reboque.renavamReboque.length > 11 && (
                                                    <div className="fade-message">
                                                        <small className="text-danger">O RENAVAM não pode ter mais de 11 dígitos.</small>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ width: "20%" }}>
                                                <label htmlFor={`ufReboque${index}`} className="form-label">UF Reboque</label>
                                                <select
                                                    className="form-select"
                                                    id={`ufReboque${index}`}
                                                    value={reboque.ufReboque || ""}
                                                    onChange={(e) => handleChangeReboques(index, 'ufReboque', e.target.value)}
                                                >
                                                    <option value="">Selecione um estado</option>
                                                    {statesUF.map((state) => (
                                                        <option key={state.value} value={state.value}>
                                                            {state.value} - {state.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-2">
                                            <div>
                                                <label tabIndex={"0"} id="cnhReboque" htmlFor="originStateInitial" className="form-label">CRLV Reboque </label>
                                            </div>
                                            {
                                                reboque.cnhReboque ? (
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
                                                            <a
                                                                href={reboque.cnhReboque}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    width: "100%",
                                                                    textDecoration: "none",
                                                                    color: "#007bff",
                                                                    fontWeight: 500,
                                                                    marginRight: 10,
                                                                    padding: "6px 14px",
                                                                    borderRadius: 6,
                                                                    background: "linear-gradient(90deg, #e3f0ff 0%, #f6faff 100%)",
                                                                    // border: "1px solid #b6d4fe",
                                                                    boxShadow: "0 2px 8px rgba(0,123,255,0.08)",
                                                                    transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                                                                    display: "inline-block",
                                                                    cursor: "pointer"
                                                                }}
                                                                onMouseOver={e => {
                                                                    e.currentTarget.style.background = "#d0e7ff";
                                                                    e.currentTarget.style.color = "#0056b3";
                                                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,123,255,0.15)";
                                                                }}
                                                                onMouseOut={e => {
                                                                    e.currentTarget.style.background = "linear-gradient(90deg, #e3f0ff 0%, #f6faff 100%)";
                                                                    e.currentTarget.style.color = "#007bff";
                                                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,123,255,0.08)";
                                                                }}
                                                            >
                                                                CRLV Reboque
                                                            </a>
                                                            <IconButton
                                                                aria-label="Excluir"
                                                                size="small"
                                                                color="error"
                                                                onClick={async () => {
                                                                    try {
                                                                        await handleDelete(reboque.cnhReboque);
                                                                        handleChangeReboques(index, 'cnhReboque', '');
                                                                    } catch (error) {
                                                                        console.error("Erro ao excluir:", error);
                                                                    }
                                                                }}
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
                                                <Button variant="outlined" 
                                                    onClick={(e) => {
                                                        handleClickOpen();
                                                        setOrigem(`CNH Verso ${index}`);
                                                    }}>
                                                    Importar Documento
                                                </Button>
                                            }
                                        </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-4">
                                                <label htmlFor={`descricaoReboque${index}`} className="form-label">Descrição Reboque</label>
                                                <input type="text" onChange={(e)=> handleChangeReboques(index, 'descricaoReboque', e.target.value)} value={reboque.descricaoReboque} className="form-control" id={`descricaoReboque${index}`}/>
                                            </div>
                                            
                                        </div>

                                        <div className="row">
                                            <div className="col-2">
                                                <label htmlFor={`RNTRCReboque${index}`} className="form-label">RNTRC Reboque</label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    className="form-control"
                                                    id={`RNTRCReboque${index}`}
                                                    value={reboque.rntrcReboque}
                                                    onChange={(e) => {
                                                        let valor = e.target.value.replace(/\D/g, '');
                                                        handleChangeReboques(index, 'rntrcReboque', valor);
                                                    }}
                                                    maxLength={8}
                                                    placeholder="Apenas números"
                                                />
                                                {reboque.rntrcReboque && ((reboque.rntrcReboque[0] === '0' ? reboque.rntrcReboque.length - 1 : reboque.rntrcReboque.length) > 8) && (
                                                    <div className="fade-message">
                                                        <small className="text-danger">
                                                            O RNTRC deve conter no máximo 8 dígitos válidos!
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-2">
                                                <label htmlFor={`tipoRNTRCReboque${index}`} className="form-label">Tipo RNTRC Reboque</label>
                                                <select className="form-select" id={`tipoRNTRCReboque${index}`} value={reboque.tipoRNTRCReboque} onChange={(e)=> handleChangeReboques(index, 'tipoRNTRCReboque', e.target.value)} aria-label="">
                                                    <option defaultValue="">Selecione</option>
                                                    <option value="tac">TAC</option>
                                                    <option value="etc">ETC</option>
                                                    <option value="ctc">CTC</option>
                                                </select>
                                            </div>
                                            <div className="col-2">
                                                <label htmlFor={`TipoCarroceriaReboque${index}`} className="form-label">Tipo Carroceria Reboque</label>
                                                <select className="form-select" id={`TipoCarroceriaReboque${index}`} value={reboque.TipoCarroceriaReboque} onChange={(e)=> handleChangeReboques(index, 'TipoCarroceriaReboque', e.target.value)} aria-label="">
                                                    <option defaultValue="">Selecione</option>
                                                    <option value="BOBINEIRA">BOBINEIRA</option>
                                                    <option value="GRADE BAIXA">GRADE BAIXA</option>
                                                    <option value="BAÚSECO">BAÚSECO</option>
                                                    <option value="BAÚ FRIGORIFICO">BAÚ FRIGORIFICO</option>
                                                    <option value="ABERTO">ABERTO</option>
                                                    <option value="BAÚ">BAÚ</option>
                                                    <option value="DOLLY">DOLLY</option>
                                                    <option value="GRANELEIRO">GRANELEIRO</option>
                                                    <option value="SIDER">SIDER</option>
                                                    <option value="PRANCHA">PRANCHA</option>
                                                    <option value="TANQUE">TANQUE</option>
                                                    <option value="CAÇAMBA">CAÇAMBA</option>
                                                    <option value="PORTA CONTEINER">PORTA CONTEINER</option>
                                                    <option value="CILO">CILO</option>
                                                    <option value="CEGONHA">CEGONHA</option>
                                                </select>
                                            </div>

                                            <div className="col-2">
                                            <div>
                                                <label tabIndex={"0"} id={`anttReboque%{index}`} htmlFor="originStateInitial" className="form-label">ANTT Reboque </label>
                                            </div>
                                            {
                                                reboque.anttReboque ? (
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
                                                            <a
                                                                href={reboque.anttReboque}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    width: "100%",
                                                                    textDecoration: "none",
                                                                    color: "#007bff",
                                                                    fontWeight: 500,
                                                                    marginRight: 10,
                                                                    padding: "6px 14px",
                                                                    borderRadius: 6,
                                                                    background: "linear-gradient(90deg, #e3f0ff 0%, #f6faff 100%)",
                                                                    // border: "1px solid #b6d4fe",
                                                                    boxShadow: "0 2px 8px rgba(0,123,255,0.08)",
                                                                    transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                                                                    display: "inline-block",
                                                                    cursor: "pointer"
                                                                }}
                                                                onMouseOver={e => {
                                                                    e.currentTarget.style.background = "#d0e7ff";
                                                                    e.currentTarget.style.color = "#0056b3";
                                                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,123,255,0.15)";
                                                                }}
                                                                onMouseOut={e => {
                                                                    e.currentTarget.style.background = "linear-gradient(90deg, #e3f0ff 0%, #f6faff 100%)";
                                                                    e.currentTarget.style.color = "#007bff";
                                                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,123,255,0.08)";
                                                                }}
                                                            >
                                                                ANTT Reboque
                                                            </a>
                                                            <IconButton
                                                                aria-label="Excluir"
                                                                size="small"
                                                                color="error"
                                                                onClick={async () => {
                                                                    try {
                                                                        await handleDelete(reboque.anttReboque);
                                                                        handleChangeReboques(index, 'anttReboque', '');
                                                                    } catch (error) {
                                                                        console.error("Erro ao excluir:", error);
                                                                    }
                                                                }}
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
                                                <Button variant="outlined" 
                                                    onClick={(e) => {
                                                        handleClickOpen();
                                                        setOrigem(`Antt Reboque ${index}`);
                                                    }}>
                                                    Importar Documento
                                                </Button>
                                            }
                                        </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-2">
                                                <label htmlFor={`pesoTaraReboque${index}`} className="form-label">Peso (Tara)</label>
                                                <input type="text" onChange={(e)=> handlePesoChange(index, 'pesoTaraReboque', e.target.value)} value={reboque.pesoTaraReboque} className="form-control" id={`pesoTaraReboque${index}`} placeholder="0"/>
                                            </div>

                                            <div className="col-2">
                                                <label htmlFor={`capacidadeKGReboque${index}`} className="form-label">Capacidade Reboque (KG)</label>
                                                <input type="text" onChange={(e)=> handlePesoChange(index, 'capacidadeKGReboque', e.target.value)} value={reboque.capacidadeKGReboque} className="form-control" id={`capacidadeKGReboque${index}`} placeholder="0"/>
                                            </div>

                                            <div className="col-2">
                                                <label htmlFor={`capacidadeM3Reboque${index}`} className="form-label">Capacidade Reboque (M³)</label>
                                                <input type="text" onChange={(e)=> handlePesoChange(index, 'capacidadeM3Reboque', e.target.value)} value={reboque.capacidadeM3Reboque} className="form-control" id={`capacidadeM3Reboque${index}`} placeholder="0"/>
                                            </div>

                                        </div>

                                        <div className="row">
                                            <div className="col-2">
                                                <label htmlFor={`tipoProprietarioReboque${index}`} className="form-label">Tipo Proprietário Reboque</label>
                                                <select className="form-select" id={`tipoProprietarioReboque${index}`} value={reboque.tipoProprietarioReboque} onChange={(e)=> handleChangeReboques(index, 'tipoProprietarioReboque', e.target.value)} aria-label="">
                                                    <option defaultValue="">Selecione</option>
                                                    <option value="cpf">CPF</option>
                                                    <option value="cnpj">CNPJ</option>
                                                </select>
                                            </div>

                                            <div style={{ width: "20%" }}>
                                                <label htmlFor={`CPF_CNPJProprietarioReboque${index}`} className="form-label">CPF/CNPJ Proprietário Reboque</label>
                                                <InputMask id={`CPF_CNPJProprietarioReboque${index}`} value={reboque.cpfoucnpjReboque} onChange={(e) => handleChangeReboques(index, 'cpfoucnpjReboque', e.target.value)} className="form-control" maxLength={18} />
                                                {(() => {
                                                    const value = reboque.cpfoucnpjReboque;
                                                    if (!value || typeof value !== "string") return null;

                                                    const digits = value.replace(/\D/g, '');
                                                    const hasValue = digits.length > 0;
                                                    const isValid = digits.length === 11 || digits.length === 14;

                                                    return hasValue && !isValid && (
                                                        <div className="fade-message">
                                                            <small className="text-danger">
                                                                O CPF deve conter 11 dígitos ou CNPJ 14 dígitos válidos!
                                                            </small>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            <div style={{ width: "20%" }}>
                                                <label htmlFor={`nomeProprietarioReboque${index}`} className="form-label">Nome Proprietário Reboque</label>
                                                <input type="text" onChange={(e)=> handleChangeReboques(index, 'nomeProprietarioReboque', e.target.value)} value={reboque.nomeProprietarioReboque} className="form-control" id={`nomeProprietarioReboque${index}`}/>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-2"></div>
                                            <div className="col-2"></div>
                                            <div style={{ marginTop: "5px", width: "18%" }} >
                                                <input type="checkbox" name={`veiculoProprioReboque${index}`} id={`veiculoProprioReboque${index}`} checked={reboque.veiculoProprioReboque} onChange={(e) => handleChangeReboques(index, 'veiculoProprioReboque', e.target.checked)} />
                                                <label style={{ marginLeft: "10px" }} htmlFor={`veiculoProprioReboque${index}`} className="form-label">Veículo Próprio Reboque</label>
                                            </div>
                                            <div style={{ marginTop: "5px" }} className="col-2">
                                                <span 
                                                    style={{
                                                        color: "#007bff",
                                                        cursor: "pointer",
                                                        fontSize: "14px",
                                                        fontWeight: "normal",
                                                    }}
                                                    onClick={adicionarReboque}
                                                >
                                                    + Adicionar Reboque
                                                </span>
                                            </div>
                                        </div>
                                    </Cards>
                                </TabPane>
                            ))}

                            <TabPane tab="Endereço" key="4">
                                <div className="row">
                                    <div className="row">
                                        <div className="col-2">
                                            <label htmlFor="cnpjDriver" className="form-label">CEP</label>
                                                <InputMask mask="99999-999" className="form-control" 
                                                    onChange={(e)=> {
                                                        buscarCep(e.target.value);
                                                        setCep(e.target.value);
                                                    }} value={cep && cep} placeholder="99999-999"
                                                />
                                        </div>

                                        <div className="col-md-3">
                                            <label htmlFor="streetDriver" className="form-label">Logradouro</label>
                                            <input type="text"  onChange={(e)=> setStreet(e.target.value)} value={street && street}  className="form-control" id="streetDriver"/>
                                        </div>

                                        <div className="col-md-2">
                                            <div>
                                                <label tabIndex={"0"} id="comprovanteEndereco" htmlFor="originStateInitial" className="form-label">Comprovante Endereço </label>
                                            </div>
                                            { comprovanteEndereco ? (
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
                                                        <a
                                                            href={comprovanteEndereco}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                width: "100%",
                                                                textDecoration: "none",
                                                                color: "#007bff",
                                                                fontWeight: 500,
                                                                marginRight: 10,
                                                                padding: "6px 14px",
                                                                borderRadius: 6,
                                                                background: "linear-gradient(90deg, #e3f0ff 0%, #f6faff 100%)",
                                                                boxShadow: "0 2px 8px rgba(0,123,255,0.08)",
                                                                transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                                                                display: "inline-block",
                                                                cursor: "pointer"
                                                            }}
                                                            onMouseOver={e => {
                                                                e.currentTarget.style.background = "#d0e7ff";
                                                                e.currentTarget.style.color = "#0056b3";
                                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,123,255,0.15)";
                                                            }}
                                                            onMouseOut={e => {
                                                                e.currentTarget.style.background = "linear-gradient(90deg, #e3f0ff 0%, #f6faff 100%)";
                                                                e.currentTarget.style.color = "#007bff";
                                                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,123,255,0.08)";
                                                            }}
                                                        >
                                                            Comprovante Endereço
                                                        </a>
                                                        <IconButton
                                                            aria-label="Excluir"
                                                            size="small"
                                                            color="error"
                                                            onClick={() => {handleDelete(comprovanteEndereco); setComprovanteEndereco(null);}}
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
                                            ) : (
                                                <Button
                                                    className="col-md-12"
                                                    variant="outlined"
                                                    onClick={() => {
                                                    handleClickOpen();
                                                    setOrigem("Comprovante Endereco");
                                                    }}
                                                >
                                                    Importar Documento
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-1">
                                            <label htmlFor="numberDriver" className="form-label">Número</label>
                                            <input type="text"  onChange={(e)=> setNumber(e.target.value)} value={number && number}  className="form-control" id="numberDriver" placeholder=""/>
                                        </div>

                                        <div className="col-md-2">
                                            <label htmlFor="districtDriver" className="form-label">Bairro</label>
                                            <input type="text" onChange={(e)=> setDistrict(e.target.value)} value={district && district} className="form-control" id="districtDriver"/>
                                        </div>

                                        <div className="col-2">
                                            <label htmlFor="cityDriver"  className="form-label">Cidade</label>
                                            <input type="text" onChange={(e)=> {
                                                setCity(e.target.value)
                                            }} value={city && city} maxLength={10} className="form-control" id="cityDriver" placeholder=""/>
                                        </div>
                                    </div>

                                    <div className="row">    
                                        <div className="col-md-2">
                                            <label htmlFor="originStateInitial" className="form-label">Estado</label>
                                            <input type="text"  onChange={(e)=> setState(e.target.value)} value={state && state}  className="form-control" id="stateDriver"/>
                                        </div>
                                        <div className="col-md-3">
                                            <label htmlFor="complementoEndereco" className="form-label">Complemento</label>
                                            <input type="text" onChange={(e)=> setComplementoEndereco(e.target.value)} value={complementoEndereco && complementoEndereco} className="form-control" id="complementoEndereco"/>
                                        </div>
                                    </div>
                                </div>
                            </TabPane>
                            <TabPane tab="Contato" key="5">
                                <div className="row">
                                    <div className="col-12">
                                        <h4 className="mb-3">Contatos de parentes</h4>
                                    </div>
                                    <div className="row">

                                        <div className="col-md-4">
                                            <label htmlFor="birthDateDriver" className="form-label">Nome</label>
                                            <input type="text"  onChange={(e)=> setNameKinships1(e.target.value)} 
                                            value={nameKinships1 && nameKinships1}  className="form-control" id="birthDateDriver"/>
                                        </div>
                                        <div className="col-md-2">
                                        <label htmlFor="fullName" className="form-label">Contato</label>
                                            <InputMask mask="(99) 99999-9999" className="form-control" 
                                            onChange={(e)=> setContactKinships1(e.target.value)} 
                                            value={contactKinships1 && contactKinships1} 
                                            placeholder="(99) 99999-9999"/>

                                        </div>
                                        <div className="col-md-2">
                                            <label htmlFor="fullName" className="form-label">Grau</label>

                                            <select className="form-select" id="degreeKinship1" value={degreeKinships1 && degreeKinships1} onChange={(e)=> setDegreeKinships1(e.target.value)} aria-label="">
                                                <option defaultValue="">Selecione</option>
                                                <option value="Mãe/Pai">Mãe/Pai</option>
                                                <option value="Esposa/Marido">Esposa/Marido</option>
                                                <option value="Filha/filho">Filha/filho</option>
                                                <option value="Irmã/Irmão">Irmã/Irmão</option>
                                                <option value="Tia/Tio">Tia/Tio</option>
                                                <option value="Prima/Primo">Prima/Primo</option>
                                            </select>

                                        </div>

                                    </div>

                                    <div className="row">

                                        <div className="col-4">
                                            <label htmlFor="nameKinships2"  className="form-label">Nome</label>
                                            <input type="text" onChange={(e)=> {
                                                setNameKinships2(e.target.value)
                                            }} value={nameKinships2 && nameKinships2} className="form-control" id="nameKinships2" placeholder=""/>

                                        </div>
                                        <div className="col-2">
                                            <label htmlFor="documentAnttFrontImg"  className="form-label">Contato</label>
                                            <InputMask mask="(99) 99999-9999" className="form-control" 
                                                onChange={(e)=> setContactKinships2(e.target.value)} 
                                                value={contactKinships2 && contactKinships2} 
                                                placeholder="(99) 99999-9999"/>
                                        </div>

                                        <div className="col-md-2">
                                            <label htmlFor="fullName" className="form-label">Grau</label>

                                            <select className="form-select" id="formOfPayment" value={degreeKinships2 && degreeKinships2}  onChange={(e)=> setDegreeKinships2(e.target.value)} aria-label="">
                                                <option defaultValue="">Selecione</option>
                                                <option value="Mãe/Pai">Mãe/Pai</option>
                                                <option value="Esposa/Marido">Esposa/Marido</option>
                                                <option value="Filha/filho">Filha/filho</option>
                                                <option value="Irmã/Irmão">Irmã/Irmão</option>
                                                <option value="Tia/Tio">Tia/Tio</option>
                                                <option value="Prima/Primo">Prima/Primo</option>
                                            </select>

                                        </div>

                                    </div>

                                    {Array.isArray(contacts) &&
                                        contacts
                                        .filter((r) => r && typeof r === "object")
                                        .map((contato, index) => (
                                            <div className="row mb-2" key={index}>
                                            <div className="col-md-4">
                                                <label htmlFor="nameKinships2"  className="form-label">Nome</label>
                                                <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Nome"
                                                value={contato.name || ""}
                                                onChange={(e) => handleChangeContacts(index, "name", e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <label htmlFor="documentAnttFrontImg"  className="form-label">Contato</label>
                                                <InputMask
                                                mask="(99) 99999-9999"
                                                className="form-control"
                                                placeholder="(99) 99999-9999"
                                                value={contato.contact || ""}
                                                onChange={(e) => handleChangeContacts(index, "contact", e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <label htmlFor="fullName" className="form-label">Grau</label>
                                                <select
                                                className="form-select"
                                                value={contato.degree || ""}
                                                onChange={(e) => handleChangeContacts(index, "degree", e.target.value)}
                                                >
                                                <option value="">Selecione</option>
                                                <option value="Mãe/Pai">Mãe/Pai</option>
                                                <option value="Esposa/Marido">Esposa/Marido</option>
                                                <option value="Filha/filho">Filha/filho</option>
                                                <option value="Irmã/Irmão">Irmã/Irmão</option>
                                                <option value="Tia/Tio">Tia/Tio</option>
                                                <option value="Prima/Primo">Prima/Primo</option>
                                                </select>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {contacts.length > 1 && (
                                                    <IconButton
                                                        aria-label="Excluir Contato"
                                                        size="small"
                                                        color="error"
                                                        style={{ marginLeft: 4 }}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            removerContact(index);
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </span>
                                            </div>
                                            </div>
                                        ))}
                                        <div className="col-2"></div>
                                        <div className="col-2"></div>
                                        <div className="col-2"></div>
                                        <div className="col-2"></div>
                                        <div style={{ marginTop: "5px" }} className="col-2">
                                            <span 
                                                style={{
                                                    color: "var(--secondary-color)",
                                                    cursor: "pointer",
                                                    fontSize: "14px",
                                                    fontWeight: "normal",
                                                }}
                                                onClick={adicionarContact}
                                            >
                                                + Adicionar Contato
                                            </span>
                                        </div>

                                </div>

                                <div className="row">

                                    <div className="col-12">
                                        <h4 className="mb-3">Contato profissional</h4> 
                                    </div>

                                    <div className="row">
                                        <div className="col-4">
                                            <label htmlFor="nameProfessional"  className="form-label">Nome</label>
                                            <input type="text" onChange={(e)=> {
                                                setNameProfessional(e.target.value)
                                            }} value={nameProfessional && nameProfessional} className="form-control" id="nameProfessional" placeholder=""/>

                                        </div>
            
                                        <div className="col-3">
                                            <label htmlFor="contactProfessional" className="form-label">Contato </label>
                                            <InputMask mask="(99) 99999-9999" className="form-control" 
                                                onChange={(e)=> setContactProfessional(e.target.value)} 
                                                value={contactProfessional && contactProfessional}
                                                placeholder="(99) 99999-9999"/>

                                        </div>
                                        
                                    </div>

                                    <div className="row">
                                        <div className="col-4">
                                            <label htmlFor="nameProfessional1"  className="form-label">Nome</label>
                                            <input type="text" onChange={(e)=> {
                                                setNameProfessional1(e.target.value)
                                            }} value={nameProfessional1 && nameProfessional1} className="form-control" id="nameProfessional1" placeholder=""/>

                                        </div>
                                        <div className="col-3">
                                            <label htmlFor="contactProfessional1" className="form-label">Contato </label>
                                            <InputMask mask="(99) 99999-9999" className="form-control" 
                                                onChange={(e)=> setContactProfessional1(e.target.value)} 
                                                value={contactProfessional1 && contactProfessional1}
                                                placeholder="(99) 99999-9999"/>

                                        </div>
                                    </div>

                                    {Array.isArray(contactsProfessional) &&
                                    contactsProfessional
                                        .filter((r) => r && typeof r === "object")
                                        .map((contato, index) => (
                                        <div className="row mb-2" key={index}>
                                            <div className="col-4">
                                            <label htmlFor={`nameProfessional${index}`} className="form-label">Nome</label>
                                            <input
                                                type="text"
                                                onChange={(e) => handleChangeContactsProfessional(index, "nameProfessional", e.target.value)}
                                                value={contato.nameProfessional || ""}
                                                className="form-control"
                                                id={`nameProfessional${index}`}
                                                placeholder=""
                                            />
                                            </div>

                                            <div className="col-3">
                                            <label htmlFor={`contactProfessional${index}`} className="form-label">Contato</label>
                                            <InputMask
                                                mask="(99) 99999-9999"
                                                className="form-control"
                                                onChange={(e) => handleChangeContactsProfessional(index, "contactProfessional", e.target.value)}
                                                value={contato.contactProfessional || ""}
                                                placeholder="(99) 99999-9999"
                                                id={`contactProfessional${index}`}
                                            />
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {contactsProfessional.length > 1 && (
                                                    <IconButton
                                                        aria-label="Excluir Contato"
                                                        size="small"
                                                        color="error"
                                                        style={{ marginLeft: 4 }}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            removerContactProfessional(index);
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="col-2"></div>
                                    <div className="col-2"></div>
                                    <div className="col-2"></div>
                                    <div className="col-2"></div>
                                    <div style={{ marginTop: "5px" }} className="col-2">
                                        <span 
                                            style={{
                                                color: "var(--secondary-color)",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                fontWeight: "normal",
                                            }}
                                            onClick={adicionarContactProfessional}
                                        >
                                            + Adicionar Contato Profissional
                                        </span>
                                    </div>
                                </div>

                            </TabPane>
                            <TabPane tab="Dados bancários" key="6">
                                <div className="row">

                                    <div className="row">
                                        
                                        <div className="row">

                                            <div className="col-3">
                                                <label htmlFor="bankName" className="form-label">Nome do banco</label>
                                                <input type="text"  onChange={(e)=> setBankName(e.target.value)} 
                                                value={bankName && bankName}  className="form-control" id="bankName"/>
                                            </div>

                                            <div className="col-1">
                                                <label htmlFor="code" className="form-label">Código</label>
                                                <input type="text"  onChange={(e)=> setCode(e.target.value)} 
                                                value={code && code}  className="form-control" id="code"/>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-2">
                                                <label htmlFor="agency" className="form-label">Agência</label>
                                                <input type="text" onChange={(e)=> setAgency(e.target.value)} 
                                                value={agency && agency} className="form-control" id="agency"/>
                                            </div>
                                            <div className="col-3">
                                                <label htmlFor="accountNumber"  className="form-label">Número da conta</label>
                                                <input type="text" onChange={(e)=> {
                                                    setAccountNumber(e.target.value)
                                                }} value={accountNumber && accountNumber} className="form-control" id="accountNumber" placeholder=""/>

                                            </div>

                                            <div className="col-1">
                                                <label htmlFor="accountDigit" className="form-label">Digito</label>
                                                <input type="text" onChange={(e)=> {
                                                    setAccountDigit(e.target.value)
                                                }} value={accountDigit && accountDigit} className="form-control" id="accountDigit" placeholder=""/>

                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <label htmlFor="holderAccount" className="form-label">Propríetário da conta</label>
                                            <input type="text"  onChange={(e)=> setHolderAccount(e.target.value)} 
                                            value={holderAccount && holderAccount}  className="form-control" id="holderAccount"/>
                                        </div>
                                        
                                        <div className="col-md-3">
                                            <label htmlFor="pix" className="form-label">PIX</label>
                                            <input type="text"  onChange={(e)=> setPix(e.target.value)} 
                                            value={pix && pix}  className="form-control" id="pix"/>
                                        </div>
                                    </div>

                                </div>
                            </TabPane>
                            </Tabs>
                        </Card>
                    </Content>

                    {/* Footer */}
                    <Footer style={{ textAlign: 'center' }}>
                        <div className="row">

                                        
                            <div className="col-md-2">
                                <label htmlFor="createdDriver" className="form-label">Data de criação</label>
                                <input type="date"  onChange={(e)=> setCreated(e.target.value)} disabled={true} value={created && created}  className="form-control" id="createdDriver"/>
                            </div>
                        
                            <div className="col-md-2">
                                <label htmlFor="originStateInitial" className="form-label">Atualizacão app</label>
                                <input type="date"  onChange={(e)=> setLastUpdated(e.target.value)} disabled={true} value={lastUpdated && lastUpdated}  className="form-control" id="lastUpdatedDriver"/>
                            </div>

                            <div className="col-md-2">
                                <label htmlFor="lastUpdatedBackOffice" className="form-label">BackOffice</label>
                                <input type="date"  onChange={(e)=> setLastUpdatedBackOffice(e.target.value)} disabled={true} value={lastUpdatedBackOffice && lastUpdatedBackOffice}  className="form-control" id="lastUpdatedBackOffice"/>
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="dateRenovation" className="form-label">Data renovação</label>
                                <input type="date"  onChange={(e)=> setDateRenovation(e.target.value)} value={dateRenovation && dateRenovation}  className="form-control" id="dateRenovation"/>
                            </div>
                        
                            <hr className="my-4"/>

                            <div className="container">
                        
                                <div className="row">
                                    <div className="col-5">
                                
                                    </div>
                                    <div className="col-5">
                                
                                    </div>
                                    <div className="col-2">
                                        <div className="btn-class-cadastrar">
                                                {
                                                carregando ? 
                                                <div className="spinner-border text-danger" role="status">
                                                <span className="visually-hidden ">Loading...</span></div>
                                                :
                                                <button disabled={Object.values(erroForm).some((err) => err.hasError)} type="submit" onClick={id ? update : save} className="w-100 btn btn-primary btn-cadastrar">{'Salvar'}</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
            
                                <div>
                                    <Dialog
                                        open={openDialog}
                                        onClose={handleCloseDialog}
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
                                                onClick={handleCloseDialog} 
                                                className="btn btn-primary btn-cadastrar"> Ok</button>
        
                                        </DialogActions>
                                    </Dialog>

                                    <Dialog
                                        open={showPerguntaVeiculoProprio}
                                        onClose={() => setShowPerguntaVeiculoProprio(false)}
                                        aria-labelledby="alert-dialog-title-veiculo-proprio"
                                        aria-describedby="alert-dialog-description-veiculo-proprio"
                                    >
                                        <DialogTitle id="alert-dialog-title-veiculo-proprio">
                                            <h1>
                                                <i className="fa fa-question-circle" style={{color: '#007bff'}} aria-hidden="true"></i>
                                                {' Veículo próprio?'}
                                            </h1>
                                        </DialogTitle>
                                        <DialogContent>
                                            <DialogContentText id="alert-dialog-description-veiculo-proprio">
                                                <h6>O nome e CPF do proprietário são iguais ao do motorista. Deseja marcar como veículo próprio?</h6>
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setVeiculoProprio(true);
                                                    setShowPerguntaVeiculoProprio(false);
                                                }}
                                                className="btn btn-success"
                                            >
                                                Sim
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNomeProprietario("");
                                                    setCpfouCnpj(formatMask(""));
                                                    setTipoProprietario("");
                                                    setErroNomeCpfIgual(false);
                                                    setShowPerguntaVeiculoProprio(false);
                                                }}
                                                className="btn btn-danger"
                                            >
                                                Não
                                            </button>
                                        </DialogActions>
                                    </Dialog>
                                </div>
                        </div>
                    
                    </Footer>
              </Layout>


        }/>

        :
            <Navigate to='/login' />
        }
    </>
    )

}

export default Driver;