import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import InputMask from 'react-input-mask'
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import ImageZoom from "../../components/imageZoom";
import { 
    format, 
} from 'date-fns';
import ProfileCard from "../../components/Profile/cardprofile";
import AlertDialog from "../../components/dialog";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import DialogContentText from "@mui/material/DialogContentText";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import firebase, { storage } from '../../config/firebase';
import NewMiniDrawer from "../../components/navMenu/menu-nav";

require('firebase/auth')

function MyDriver(){

    const {id} = useParams();

    const [carregando, setCarregando] = useState();

    const [status, setStatus] = useState();
    const [name, setName] = useState("");
    
    const [created, setCreated] = useState("");
    const [lastUpdated, setLastUpdated] = useState("");
    const [birthDate, setBirthDate] = useState();
    const [documentCnhExpiration, setDocumentCnhExpiration] = useState("");
    const [lastUpdatedBackOffice, setLastUpdatedBackOffice] = useState("");
    
    //Address
    const [cep, setCep] = useState("");
    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("");
    const [number, setNumber] = useState("");
    const [state, setState] = useState("");
    const [street, setStreet] = useState("");

    //dataBank
    const [accountDigit, setAccountDigit] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [agency, setAgency] = useState("");
    const [bankFullName, setBankFullName] = useState("");
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
    const [documentAnttFrontImg, setDocumentAnttFrontImg] = useState("");
    const [documentAnttVerseImg, setDocumentAnttVerseImg] = useState("");
    const [documentCnhFrontImg, setDocumentCnhFrontImg] = useState("");
    const [documentCnhVerseImg, setDocumentCnhVerseImg] = useState("");
    const [fullName, setFullName] = useState("");
    const [sexGender, setSexGender] = useState("");

    //ProfessionalRerence
    const [contactProfessional, setContactProfessional] = useState("");
    const [nameProfessional, setNameProfessional] = useState("");
    const [contactProfessional1, setContactProfessional1] = useState("");
    const [nameProfessional1, setNameProfessional1] = useState("");

    // vehicle
    const [bodyworkPlate, setBodyworkPlate] = useState("");
    const [bodyworkType, setBodyworkType] = useState("");
    const [vehicleImg, setVehicleImg] = useState("");
    const [vehiclePlate, setVehiclePlate] = useState("");
    const [vehicleType, setVehicleType] = useState("");    


    const [cpf, setCpf] = useState();
    const [email, setEmail] = useState();
    const [profilePicture, setProfilePicture] = useState();
    const [dateRenovation, setDateRenovation] = useState();
    const [password, setPassword] = useState('');

    const [open, setOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [origem, setOrigem] = useState("");

    const [userCreated, setUserCreated] = useState();

    const [msgTipo, setMsgTipo] = useState();
    const [msg, setMsg] = useState();
    const [title, setTitle] = useState();

    const db = firebase.firestore();

    const users = useSelector(state => state.user);
    const shippers = useSelector(state => state.shipper);
    
    let navigate = useNavigate();

    useEffect(() => {

        if(id){

            db.collection('my_driver').doc(id)
            .get().then( async (result) => {
                
                var allData = result.data();
                
                let birthDate = allData?.birthDate;
                let firstData = allData?.firstData;
                let personalData = allData.personalData;
                let dataBank = allData.dataBank;
                let dataCnhExpiration = allData.documentCnhExpiration;
                let kinships = allData.kinships;
                let profissionalReference = allData.professionalData;
                let vehicle = allData.vehicle;
                let address = allData.address;
                let lastUpdatedBackOffice = allData.lastUpdatedBackOffice;
                let dateRenovation = allData?.dateRenovation;
                let history = allData?.history;
                
                let dataCreated = history.created ? format(new Date(history.created.seconds * 1000), 'yyyy-MM-dd') : "";
                let dataLastUpdate = history.lastUpdate ? format(new Date(history.lastUpdate.seconds * 1000), 'yyyy-MM-dd') : "";
                let dataCnhExpired = dataCnhExpiration ? format(new Date(dataCnhExpiration.seconds * 1000), 'yyyy-MM-dd') : "";
                let dataBirthDay = birthDate ? format(new Date(birthDate.seconds * 1000), 'yyyy-MM-dd') : "";
                let dataLastUpdateBack =  lastUpdatedBackOffice ?  format(new Date(lastUpdatedBackOffice.seconds * 1000), 'yyyy-MM-dd') : "";
                let dateRenovationParse =  dateRenovation ?  format(new Date(dateRenovation.seconds * 1000), 'yyyy-MM-dd') : "";
    
    
                setStatus(firstData.statusDriver)
                setEmail(firstData.email)
                // setProfilePicture(driver.profilePicture)
                setCpf(personalData.documentCpf)
    
                setBirthDate(dataBirthDay)
                setCreated(history.created)
                setLastUpdated(dataLastUpdate)
                setLastUpdatedBackOffice(dataLastUpdateBack)
                setDateRenovation(dateRenovationParse)
    
                //History
                setUserCreated(history.userCreated)
    
                //Personal data
                setContact(personalData?.contact);
                setDocumentAnttFrontImg(personalData?.documentAnttFrontImg);
                setDocumentAnttVerseImg(personalData?.documentAnttVerseImg);
                setDocumentCnhFrontImg(personalData?.documentCnhFrontImg);
                setDocumentCnhVerseImg(personalData?.documentCnhVerseImg);
                setFullName(personalData?.fullName);
                setSexGender(personalData?.sexGender);
                setDocumentCnhExpiration(dataCnhExpired)
    
                //Vehicle
                setBodyworkPlate(vehicle?.bodyworkPlate)
                setBodyworkType(vehicle?.bodyworkType)
                setVehicleImg(vehicle?.vehicleImg)
                setVehiclePlate(vehicle?.vehiclePlate)
                setVehicleType(vehicle?.vehicleType)
    
                //address 
                setCep(address?.cep)
                setCity(address?.city)
                setDistrict(address?.district)
                setNumber(address?.number)
                setState(address?.state)
                setStreet(address?.street)
    
                //professionalData
                setContactProfessional(profissionalReference[0]?.contact)
                setNameProfessional(profissionalReference[0]?.name)
    
                setContactProfessional1(profissionalReference[1].contact)
                setNameProfessional1(profissionalReference[1].name)
    
                //kinships 
                setContactKinships1(kinships[0].contact)
                setDegreeKinships1(kinships[0].degree)
                setNameKinships1(kinships[0].name)
    
                setContactKinships2(kinships[1].contact)
                setDegreeKinships2(kinships[1].degree)
                setNameKinships2(kinships[1].name)
    
                //dataBank
                setAccountDigit(dataBank.accountDigit)
                setAccountNumber(dataBank.accountNumber)
                setAgency(dataBank.agency)
                setBankFullName(dataBank.bankFullName)
                setBankName(dataBank.bankName)
                setCode(dataBank.code)
                setHolderAccount(dataBank.holderAccount)
                setIspb(dataBank.ispb)
                setPix(dataBank.pix)
    
                setCarregando(0)
            }).catch(error => {
                setCarregando(0)
                console.log(error)
            });


        }

        
    },[carregando]);


    function validInput(){
        var retorno = true;
        if(!password){
            showMessage("O campo senha precisa ter no minímo 6 caracteres alfa numericos");
            document.getElementById("password").focus() 
            retorno = false;
        }
        if(!fullName){
            showMessage("O Nome do motorista precisa ser preenchido corretamente");
            document.getElementById("fullName").focus()
            retorno = false;
        }


        return retorno;
        
    }


    function showMessage(msg){
        setMsgTipo('erro');
        setCarregando(0)
        setTitle(' Ops!')
        setMsg(msg);
        setOpen(true)
        return;
    }

    function save(){
        console.log('Salvando...') 
        if(validInput()){

            console.log('entreou')

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
                street: street ? street : ""
            }
    
            var dataBank = {
                accountDigit: accountDigit ? accountDigit : "",
                accountNumber: accountNumber ? accountNumber : "",
                agency: agency ? agency : "",
                bankFullName: bankFullName ? bankFullName : "",
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
                documentAnttVerseImg: documentAnttVerseImg ? documentAnttVerseImg : "",
                documentCnhFrontImg:  documentCnhFrontImg ? documentCnhFrontImg : "",
                documentCnhVerseImg: documentCnhVerseImg ? documentCnhVerseImg : "",
                fullName: fullName ? fullName : "",
                sexGender: sexGender ? sexGender : "",
                documentCpf: cpf
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
                vehicleType: vehicleType ? vehicleType : ""
            }
    
            let shipper = {
                uid: users.uidShipper,
                name: shippers.dataPersonal.socialName
            }
    
    
            let dataComSplit = birthDate.split("-");
    
            var dataNova = new Date(`${dataComSplit[0]}/${dataComSplit[1]}/${dataComSplit[2]}`);
    
            let dataRenovSplit = dateRenovation.split("-");
    
            var dataRenovNova = new Date(`${dataRenovSplit[0]}/${dataRenovSplit[1]}/${dataRenovSplit[2]}`);

    
            console.log('Salvando...')

            firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(async resultado => {
                

                let uid = resultado.user.uid;
    
                var data = {
                    // firstData: firstData,
                    birthDate: birthDate ? new Date(dataNova.toString()) : "",
                    documentCnhExpiration: documentCnhExpiration ? new Date(documentCnhExpiration) : "",
                    lastUpdatedBackOffice: new Date(),
                    dateRenovation: dateRenovation ? new Date(dataRenovNova.toString()) : "",
                    address: address,
                    dataBank: dataBank,
                    kinships: kinships,
                    personalData: personalData,
                    professionalData: professionalData,
                    vehicle: vehicle,
                    shipper: shipper,
                    
                }

                console.log(fullName)
                console.log(uid)

                var fistData = {
                    cpf: withoutMaskCPF(cpf),
                    email: email,
                    name: fullName,
                    uid: uid,
                    statusDriver: 'status',
                    accountCreated: new Date(),
                    history: history,
                    idNotification: '',
                }

                console.log(fistData)
    
                console.log('salvou usuário')

                await db.collection('drivers_users').doc(uid).set(fistData).then(async (item) => {
                    console.log('drivers_users')

                    await db.collection('drivers_users').doc(item.id)
                            .collection('documents').doc('allData').set(data).then(() => {
                                    console.log('allData')
                                    setCarregando(0)
                                    setMsgTipo('sucesso');
                                    navigate("/driverList");
                            });
    
                }).catch(error => {
                    setCarregando(0)
                });


                // await db.collection('drivers_users').add(fistData).then(async (item) => {
                //     console.log('drivers_users')

                //     await db.collection('drivers_users').doc(item.id)
                //             .collection('documents').doc('allData').set(data).then(() => {
                //                     console.log('allData')
                //                     setCarregando(0)
                //                     setMsgTipo('sucesso');
                //                     navigate("/driverList");
                //             });
                        


                //     // setCarregando(0)
                //     // navigate("/myDriverList");
    
                // }).catch(error => {
                //     setCarregando(0)
                // });
    
               
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



        
       

    }

    function update(){
        setCarregando(1);

        var history = {
            lastUpdate: new Date(),
            created: created,
            userCreated: userCreated

        }
        var firstData = {
            email: email ? email : "",
            cpf: withoutMaskCPF(cpf),
            statusDriver: "Não integrado"
        }

        var address = {
            cep: withoutMaskCEP(cep),
            city: city ? city : "",
            district: district ? district : "",
            number: number ? number : "",
            state: state ? state : "",
            street: street ? street : ""
        }

        var dataBank = {
            accountDigit: accountDigit ? accountDigit : "",
            accountNumber: accountNumber ? accountNumber : "",
            agency: agency ? agency : "",
            bankFullName: bankFullName ? bankFullName : "",
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
            documentAnttVerseImg: documentAnttVerseImg ? documentAnttVerseImg : "",
            documentCnhFrontImg:  documentCnhFrontImg ? documentCnhFrontImg : "",
            documentCnhVerseImg: documentCnhVerseImg ? documentCnhVerseImg : "",
            fullName: fullName ? fullName : "",
            sexGender: sexGender ? sexGender : "",
            documentCpf: cpf
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
            vehicleType: vehicleType ? vehicleType : ""
        }

        
        let shipper = {
            uid: users.uidShipper,
            name: shippers.dataPersonal.socialName
        }

        let dataComSplit = birthDate.split("-");

        var dataNova = new Date(`${dataComSplit[0]}/${dataComSplit[1]}/${dataComSplit[2]}`);

        let dataRenovSplit = dateRenovation.split("-");

        var dataRenovNova = new Date(`${dataRenovSplit[0]}/${dataRenovSplit[1]}/${dataRenovSplit[2]}`);

        var data = {
            firstData: firstData,
            birthDate: birthDate ? new Date(dataNova.toString()) : "",
            documentCnhExpiration: documentCnhExpiration ? new Date(documentCnhExpiration) : "",
            lastUpdatedBackOffice: new Date(),
            dateRenovation: dateRenovation ? new Date(dataRenovNova.toString()) : "",
            address: address,
            dataBank: dataBank,
            kinships: kinships,
            personalData: personalData,
            professionalData: professionalData,
            vehicle: vehicle,
            shipper: shipper,
            history: history
        }



            //Se a senha for 
            if(password){
                var user = firebase.auth().currentUser;
    
                user.updatePassword(password).then(() => {
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
    
        
        console.log(data)

        db.collection('drivers_users').doc(id).update(data).then(() => {
                    setCarregando(0)
                    navigate("/myDriverList");
        }).catch(error => {
            setCarregando(0)
        });

    }


    function withoutMaskPhone(input){
        return (input ? input.replace("(","").replace(")","").replace(" ","").replace("-","") : "");
    }

    function withoutMaskCPF(input){
        return (input ? input.replace(".","").replace(".","").replace("-",""): "");
    }

    function withoutMaskCEP(input){
        return (input ? input.replace("-",""): "");
    }

    const handleClickOpen = () => {
        setOpenDialog(true);
      };
    
      const handleClose = () => {
        setOpen(false);
      };

      const handleCloseDialog = () => {
        setOpenDialog(false);
      };


    const handleUpload = (file) => {
        // setCarregando(1)
        if(!file) return;

        const storageRef = ref(storage, `my_drivers/${id}/${file.name}`);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on("state_changed", 
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setCarregando(progress);
            },
            (error) => {
                alert(error)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {

                    if(origem == "ANTT Frente"){ 
                        setDocumentAnttFrontImg(downloadURL)
                        setCarregando(0)
                        setOpen(false)                
                        setOrigem("")
                    }else
                     if(origem == "ANTT Verso"){
                        setDocumentAnttVerseImg(downloadURL)
                        setCarregando(0)
                        setOpen(false)
                        setOrigem("")
                    }else 
                        if(origem == "CNH Frente"){
                        setDocumentCnhFrontImg(downloadURL)
                        setCarregando(0)
                        setOpen(false)
                        setOrigem("")
                    }else  
                        if(origem == "CNH Verso"){
                        setDocumentCnhVerseImg(downloadURL)
                        setCarregando(0)
                        setOpen(false)
                        setOrigem("")
                    }else 
                        if(origem == "Imagem veiculo"){
                            setVehicleImg(downloadURL)    
                            setCarregando(0)
                            setOpen(false)
                            setOrigem("")
                        }
                });

        })

    }

    return (
    <>
        { 
        useSelector(state => state.usuarioLogado) > 0 ?

            <NewMiniDrawer divOpen={

                <div 
                    className="freight-content align-items-center"
                    style={{ paddingTop: '0px' }}
                >

                    {/* Dialog de upload de arquivo  */}
                    <AlertDialog 
                        handleClose={handleCloseDialog} 
                        open={openDialog} 
                        origem={origem} 
                        handleUpload={handleUpload}
                        />


                    <div className="form-signin mx-auto mb-4 mb-lg-6">
                        <div className="row">
                            <div className="col-md-4">
                                <ProfileCard imgProfile={profilePicture} />
                            </div>
                        </div>
                    </div>
                {/** Personal data */}
                <div className="form-signin mx-auto mb-4 mb-lg-6">

                    <div className="col-12">
                        <h4 className="mb-3">Dados pessoais</h4>
                    </div>
                    <div className="row">

                        <div className="row">

                            <div className="col-md-3">
                                <label htmlFor="fullName" className="form-label">Nome Completo</label>
                                <input type="text"  onChange={(e)=> setFullName(e.target.value)} 
                                value={fullName && fullName}  className="form-control" id="fullName"/>
                            </div>

                            <div className="col-3">
                                <label htmlFor="cpf" className="form-label">CPF</label>

                                <InputMask mask="999.999.999-99" 
                                    className="form-control" 
                                    onChange={(e)=> setCpf(e.target.value)} value={cpf && cpf}
                                    /> 

                            </div>

                            <div className="col-md-2">
                                <label htmlFor="birthDateDriver" className="form-label">Data de nascimento</label>
                                <input type="date" onChange={(e)=> setBirthDate(e.target.value)}  value={birthDate && birthDate}  className="form-control" id="birthDateDriver"/>
                                
                            </div>
                        </div>

                        <div className="row">

                            <div className="col-md-3">

                                <label htmlFor="contactPersonal" className="form-label">Contato</label>
                                    <InputMask mask="(99) 99999-9999" className="form-control" 
                                        onChange={(e)=> setContact(e.target.value)} 
                                        value={contact && contact} 
                                        placeholder="(99) 99999-9999"/>
                            </div>

                            <div className="col-md-3 mb-3">
                                <label htmlFor="sexGender" className="form-label">Gênero</label>
                                <select className="form-select" id="formOfPayment" value={sexGender && sexGender}  onChange={(e)=> setSexGender(e.target.value)} aria-label="">
                                    <option defaultValue="">Selecione</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                    <option value="Outro">Outro</option>
                                    <option value="Prefiro não dizer">Prefiro não dizer</option>
                                </select>

                            </div>

                            <div className="col-md-2 mb-3">
                            </div>
                        </div>

                    </div>

                    <div className="row">

                        <div className="col-3 ">
                                    <label htmlFor="email" className="form-label">E-mail (Login do motorista)</label>
                                    <input type="text"  onChange={(e)=> setEmail(e.target.value)} 
                                    value={email && email}  className="form-control" id="email"/>
                        </div>

                        <div className="col-3">
                            <label htmlFor="email" className="form-label">E-mail</label>
                            <input type="password" onChange={(e)=> setPassword(e.target.value)} 
                            value={password && password}  className="form-control" id="password"/>
                        </div>

                    </div>
                </div>
                <div className="form-signin mx-auto mb-4 mb-lg-6">

                    <div className="col-12">
                        <h4 className="mb-3">Documentos Gerais</h4>
                    </div>
                    <div className="row">
                        <div className="row">
                            <div className="col-md-2">
                                <label htmlFor="documentCnhExpiration" className="form-label">Data de expiração CNH</label>
                                <input type="date"  onChange={(e)=> setDocumentCnhExpiration(e.target.value)} value={documentCnhExpiration && documentCnhExpiration}  className="form-control" id="documentCnhExpiration"/>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div>
                                <label htmlFor="documentAnttFrontImg"  className="form-label">Doc ANTT Frente</label>
                            </div>
                            {
                                documentAnttFrontImg ?
                                <>

                                    <div className="row">
                                        <div className="col-md-2">
                                            <ImageZoom 
                                                title=""
                                                source={documentAnttFrontImg && documentAnttFrontImg}
                                                height="100"
                                                width="100"
                                            />
                                            <Button variant="outlined" 
                                                onClick={(e) => {
                                                    handleClickOpen();
                                                    setOrigem("ANTT Frente");
                                                }} >
                                                Editar
                                            </Button>
                                        </div>
                                    </div>

                                </>
                                : 
                                <Button variant="outlined" 
                                onClick={(e) => {
                                    handleClickOpen();
                                    setOrigem("ANTT Frente");
                                }}>
                                    Importar imagem
                                </Button>
                            }

                        </div>

                        <div className="col-2">
                            
                            <div>
                                <label htmlFor="documentAnttVerseImg"  className="form-label">ANTT Verso</label>
                            </div>

                            {
                                documentAnttVerseImg ?
                                <>
                                    <div className="row">
                                        <div className="col-md-2">
                                        <ImageZoom 
                                            title=""
                                            source={documentAnttVerseImg && documentAnttVerseImg}
                                            height="100"
                                            width="100"
                                        />
                                        <Button variant="outlined" 
                                            onClick={(e) => {
                                                handleClickOpen();
                                                setOrigem("ANTT Verso");
                                            }} >
                                            Editar
                                        </Button>
                                        </div>
                                    </div>
                                </>
                                : 
                                <Button variant="outlined" 
                                onClick={(e) => {
                                    handleClickOpen();
                                    setOrigem("ANTT Verso");
                                }}>
                                    Importar imagem
                                </Button>
                            }

                        </div>
                        <div className="col-2">
                            <div>
                                <label htmlFor="documentCnhFrontImg3" className="form-label">CNH Frente</label>
                            </div>

                            
                            {
                                documentCnhFrontImg ?
                                <>
                                    <div className="row">
                                        <div className="col-md-2">
                                            <ImageZoom 
                                                title=""
                                                source={documentCnhFrontImg && documentCnhFrontImg}
                                                height="100"
                                                width="100"
                                            />
                                            <Button variant="outlined" 
                                                onClick={(e) => {
                                                    handleClickOpen();
                                                    setOrigem("CNH Frente");
                                                }} >
                                                Editar
                                            </Button>
                                        </div>
                                    </div>
                                </>
                                : 
                                <Button variant="outlined" 
                                    onClick={(e) => {
                                        handleClickOpen();
                                        setOrigem("CNH Frente");
                                    }}>
                                    Importar imagem
                                </Button>
                            }


                        </div>
                        <div className="col-md-2">
                            <div>
                                <label htmlFor="originStateInitial" className="form-label">CNH Verso</label>
                            </div>

                            {
                                documentCnhVerseImg ?
                                <>

                                    <div className="row">
                                        <div className="col-md-2">
                                        <ImageZoom 
                                            title=""
                                            source={documentCnhVerseImg && documentCnhVerseImg}
                                            height="100"
                                            width="100"
                                        />
                                        <Button variant="outlined" 
                                            onClick={(e) => {
                                                handleClickOpen();
                                                setOrigem("CNH Verso");
                                            }} >
                                            Editar
                                        </Button>

                                        </div>
                                    </div>        
                                </>
                                : 
                                <Button variant="outlined" 
                                    onClick={(e) => {
                                        handleClickOpen();
                                        setOrigem("CNH Verso");
                                    }}>
                                    Importar imagem
                                </Button>
                            }
                        </div>

                    </div>

                </div>
                
                {/** Address */}
                <div className="form-signin mx-auto mb-4 mb-lg-6">

                    <div className="col-12">
                        <h4 className="mb-3">Endereço</h4>
                    </div>
                    <div className="row">

                        <div className="row">
                            <div className="col-2">
                                <label htmlFor="cnpjDriver" className="form-label">CEP</label>                                

                                    <InputMask mask="99999-999" className="form-control" 
                                        onChange={(e)=> {
                                            setCep(e.target.value);    
                                        }} value={cep && cep} placeholder="99999-999"
                                    />
                            </div>

                            <div className="col-md-4">
                                <label htmlFor="streetDriver" className="form-label">Logradouro</label>
                                <input type="text"  onChange={(e)=> setStreet(e.target.value)} value={street && street}  className="form-control" id="streetDriver"/>
                            </div>
                            <div className="col-1">
                                <label htmlFor="numberDriver" className="form-label">Número</label>
                                <input type="text"  onChange={(e)=> setNumber(e.target.value)} value={number && number}  className="form-control" id="numberDriver" placeholder=""/>
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="districtDriver" className="form-label">Bairro</label>
                                <input type="text" onChange={(e)=> setDistrict(e.target.value)} value={district && district} className="form-control" id="districtDriver"/>
                            </div>

                        </div>
                        <div className="row">    
                            <div className="col-3">
                                <label htmlFor="cityDriver"  className="form-label">Cidade</label>
                                <input type="text" onChange={(e)=> {
                                    setCity(e.target.value)
                                }} value={city && city} maxLength={10} className="form-control" id="cityDriver" placeholder=""/>

                            </div>
                            <div className="col-md-1">
                                <label htmlFor="originStateInitial" className="form-label">Estado</label>
                                <input type="text"  onChange={(e)=> setState(e.target.value)} value={state && state}  className="form-control" id="stateDriver"/>
                            </div>

                        </div>

                    </div>
                </div>

                {/** Kinships */}
                <div className="form-signin mx-auto mb-4 mb-lg-6">

                        <div className="col-12">
                            <h4 className="mb-3">Contatos de parentes</h4>
                        </div>
                        <div className="row">

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
                                        <option value="Filha/filho">Filha/filho</option>
                                        <option value="Irmã/Irmão">Irmã/Irmão</option>
                                        <option value="Tia/Tio">Tia/Tio</option>
                                        <option value="Prima/Primo">Prima/Primo</option>
                                    </select>

                                </div>

                            </div>

                        </div>
                    </div>

                {/** Vehicle */}
                <div className="form-signin mx-auto mb-4 mb-lg-6">

                        <div className="col-12">
                            <h4 className="mb-3">Veículo</h4>
                        </div>
                        <div className="row">

                            <div className="row">
                                <div className="col-3">
                                    <label htmlFor="bodyworkPlate" className="form-label">Placa Carroceria</label>
                                    <input type="text" onChange={(e)=> {
                                        setBodyworkPlate(e.target.value)
                                    }} value={bodyworkPlate && bodyworkPlate} className="form-control" id="bodyworkPlate" placeholder=""/>

                                </div>
                                
                                <div className="col-3">
                                    <label htmlFor="bodyworkType"  className="form-label">Tipo de carroceria</label>

                                    <select className="form-select" id="formOfPayment" 
                                            value={bodyworkType && bodyworkType}  onChange={(e)=> setBodyworkType(e.target.value)} aria-label="">
                                        <option defaultValue="">Selecione</option>
                                        <option value="BOBINEIRA">BOBINEIRA</option>
                                        <option value="GRADE BAIXA">GRADE BAIXA</option>
                                        <option value="BAÚSECO">BAÚSECO</option>
                                        <option value="BAÚ FRIGORIFICO">BAÚ FRIGORIFICO</option>
                                        <option value="ABERTO">ABERTO</option>
                                        <option value="BAÚ">BAÚ</option>
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
                                
                                <div className="col-md-2">
                                    <div>
                                        <label htmlFor="vehicleImg" className="form-label">Imagem do veículo</label>
                                    </div>
                                    {
                                        vehicleImg ?
                                        <>

                                            <div className="row">
                                                <div className="col-md-2">
                                                    <ImageZoom 
                                                        title=""
                                                        source={vehicleImg && vehicleImg}
                                                        height="80"
                                                        width="50"
                                                    />
                                                    <Button variant="outlined" 
                                                        onClick={(e) => {
                                                            handleClickOpen();
                                                            setOrigem("Imagem veiculo");
                                                        }} >
                                                        Editar
                                                    </Button>
                                                </div>
                                            </div>                                            
                                        </>
                                        : 
                                        <Button variant="outlined" 
                                        onClick={(e) => {
                                            handleClickOpen();
                                            setOrigem("Imagem veiculo");
                                        }}>
                                            Importar imagem
                                        </Button>
                                    }


                                </div>

                                <div className="row">
                                    <div className="col-2">
                                        <label htmlFor="vehiclePlate" className="form-label">Placa do veículo</label>
                                        <input type="text"  onChange={(e)=> setVehiclePlate(e.target.value)} value={vehiclePlate && vehiclePlate}  className="form-control" id="vehiclePlate" placeholder=""/>
                                    </div>

                                    <div className="col-md-2">
                                        <label htmlFor="vehicleType" className="form-label">Tipo de veículo</label>
                                        <select className="form-select" id="formOfPayment" 
                                                value={vehicleType && vehicleType}  onChange={(e)=> setVehicleType(e.target.value)} aria-label="">
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
                            </div>
                            
                        </div>
                </div>



                {/** Dados bancários */}
                <div className="form-signin mx-auto mb-4 mb-lg-6">

                        <div className="col-12">
                            <h4 className="mb-3">Dados bancários</h4>
                        </div>
                        <div className="row">

                            <div className="row">
                                
                                <div className="row">

                                    <div className="col-2">
                                        <label htmlFor="bankFullName" className="form-label">Instituição financeira</label>
                                        <input type="text"  onChange={(e)=> setBankFullName(e.target.value)} 
                                        value={bankFullName && bankFullName}  className="form-control" id="bankFullName" placeholder=""/>
                                    </div>

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
                                    <label htmlFor="ispb" className="form-label">ispb</label>
                                    <input type="text"  onChange={(e)=> setIspb(e.target.value)} 
                                    value={ispb && ispb}  className="form-control" id="ispb"/>
                                </div>

                                <div className="col-md-3">
                                    <label htmlFor="pix" className="form-label">PIX</label>
                                    <input type="text"  onChange={(e)=> setPix(e.target.value)} 
                                    value={pix && pix}  className="form-control" id="pix"/>
                                </div>
                            </div>

                        </div>
                        
                    </div>
                
                {/** Profissional reference */}
                <div className="form-signin mx-auto mb-4 mb-lg-6">


                        <div className="col-12">
                            <h4 className="mb-3">Contato profissional</h4> 
                        </div>

                        <div className="row">

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

                        </div>
                    </div>

                <div className="form-signin mx-auto mb-4 mb-lg-6">

                    <div className="col-12">
                        <h4 className="mb-3">Histórico de atualização</h4> 
                    </div>

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
                    </div>
                </div>
                
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
                                        <button type="submit" onClick={id ? update : save} className="w-100 btn btn-primary btn-cadastrar">{id ? 'Editar' : 'Cadastrar'}</button>
                                    }
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

            </div> //div principal


 


        }/>

        :
            <Navigate to='/login' />
        }
    </>
    )

}

export default MyDriver;