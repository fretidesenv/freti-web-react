import React, { useEffect, useState } from "react";
import "./freight.css";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useSelector } from "react-redux";
import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import IntlCurrencyInput from "react-intl-currency-input";
import InputMask from "react-input-mask";
import driverService from "../../service/driver.service";
import freightService from "../../service/freight.service";
import { Autocomplete, Box, Button, Card, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, IconButton, Radio, RadioGroup, Stack, Switch, TextField, Typography, makeStyles, } from "@mui/material";
import "@trendmicro/react-datepicker/dist/react-datepicker.css";
import firebase, { storage } from "../../config/firebase";
import ImageZoom from "../../components/imageZoom";
import AlertDialog from "../../components/dialog";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import ShipperDialog from "../../components/popup-shipper/insert-shipper";
import LoopIcon from "@mui/icons-material/Loop";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import HorizontalStepper from "../../components/stepper/stepper";
import TextArea from "antd/es/input/TextArea";
import { useLocation } from "react-router-dom";
import BackButton from "../../components/backButton/BackButton";
import paymentService from "../../service/payment.service";
import NewMiniDrawer from "../../components/navMenu/menu-nav";
import notification from "../../service/sendMessage";
import mdfeService from "../../service/mdfe.service";

require("firebase/auth");

function Freight() {
    let navigate = useNavigate();

    const { id } = useParams();

    const [status, setStatus] = useState("Pendrente de contatação");
    const [code, setCode] = useState("01");
    const [numberSerial, setNumberSerial] = useState(Date.now());
    const [verifyPayment, setVerifyPayment] = useState(false);

    // Client Payment
    const [payingCustomer, setPayingCustomer] = useState("");
    const [cnpjPayingCustomer, setCnpjPayingCustomer] = useState("");

    //Veiculo
    const [occupation, setOccupation] = useState();
    const [freeOfCharge, setFreeOfCharge] = useState();

    var nameUser = useSelector((state) => state?.user?.name);

    //Frete
    const [product, setProduct] = useState("");
    const [seller, setSeller] = useState(nameUser);
    const [valueNF, setValueNF] = useState("");
    const [valueFreightage, setValueFreightage] = useState("");
    const [totalAmountRoute, setTotalAmountRoute] = useState("");
    const [weightCargo, setWeightCargo] = useState(0);
    const [phoneRespContractFreigtage, setPhoneRespContractFreigtage] = useState("");
    const [valueDriverInitial, setValueDriverInitial] = useState(0);
    const [valueNegotiated, setValueNegotiated] = useState(0);
    const [paymentCondition, setPaymentCondition] = useState("");
    const [valueDriverFinal, setValueDriverFinal] = useState(0);
    const [uidDriver, setUidDriver] = useState("");
    const [observation, setObservation] = useState();
    const [open, setOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [driversInFila, setDriversInFila] = useState([]);
    const [referenc, setReferenc] = useState("");
    const [driverChose, setDriverChose] = useState("");

    const [msgTipo, setMsgTipo] = useState();
    const [msg, setMsg] = useState();
    const [title, setTitle] = useState();

    const [carregando, setCarregando] = useState(0);
    const usuarioEmail = useSelector((state) => state.usuarioEmail);

    const users = useSelector((state) => state.user);
    const shippers = useSelector((state) => state.shipper);

    const [origem, setOrigem] = useState("");
    const [openOrigem, setOpenOrigem] = useState(false);
    const [openShipper, setOpenShipper] = useState(false);

    const db = firebase.firestore();

    const [typeBodyworkList, setTypeBodyworkList] = useState({
        dados: [
            { name: "BAÚ", selected: false },
            { name: "BAÚ FRIGORIFICO", selected: false },
            { name: "BAÚ REFRIGERADO", selected: false },
            { name: "SIDER", selected: false },
            { name: "CAÇAMBA", selected: false },
            { name: "GRADE BAIXA", selected: false },
            { name: "GRANELEIRO", selected: false },
            { name: "PLATAFORMA", selected: false },
            { name: "PRANCHA", selected: false },
            { name: "APENAS CAVALO", selected: false },
            { name: "BUG PORTA CONTAINER", selected: false },
            { name: "CAVAQUEIRA", selected: false },
            { name: "CEGONHEIRO", selected: false },
            { name: "GAIOLA", selected: false },
            { name: "HOPPER", selected: false },
            { name: "MUNCK", selected: false },
            { name: "SILLO", selected: false },
            { name: "TANQUE", selected: false },
        ],
    });

    const CanhotoViewer = ({ source }) => { // Esta função faz a verificação para exibir imagem ou PDF, na parte de canhoto do frete.
        // Função para verificar se o arquivo é um PDF
        const isPDF = (file) => {
            const fileName = file?.split("?")[0]; // Remove os parâmetros da URL
            return fileName?.toLowerCase().endsWith(".pdf");
        };

        return (
            <>
                {isPDF(source) ? (
                    <>
                        <div style={{ height: "70%", width: "100%" }}>
                            <a href={source} target="_blank" rel="noopener noreferrer">
                                <Button 
                                    variant="outlined"
                                    color="primary"
                                >
                                    Abrir PDF
                                </Button>
                            </a>
                        </div>
                    </>
                ) : (
                    <>
                        <ImageZoom
                            title=""
                            name="canhoto"
                            source={source}
                            height="100"
                            width="100"
                        />
                    </>
                )}
            </>
        );
    };

    const geraNumeroColeta = () => {
        const digitosUnicos = new Set();

        while (digitosUnicos.size < 7) {
            const digito = Math.floor(Math.random() * 10);
            digitosUnicos.add(digito);
        }

        const numero = Array.from(digitosUnicos).join("");
        return numero;
    };

    const [formFields, setFormFields] = useState([
        {
            id: "",
            stop_order: 1,
            name: "",
            cpf_cnpj: "",
            operation: [],
            responsible_phone: "",
            responsible_name: "",
            number_collect: geraNumeroColeta(),
            date_operation: "",
            time_operation: "",
            type: "",
            descricao: "",
            canhoto: "",
            cep: "",
            number: "",
            logradouro: "",
            city: "",
            uf: "",
            latitude: "",
            longitude: "",
            verify: false,
            observation: "",
            concluded: false,
            typeCarga: false,
            typeDescarga: false,
            checkItemLocation: false,
        },
    ]);

    const addFields = () => {
        let object = {
            id: "",
            stop_order: formFields.length + 1,
            name: "",
            cpf_cnpj: "",
            operation: [],
            responsible_phone: "",
            responsible_name: "",
            number_collect: geraNumeroColeta(),
            date_operation: "",
            time_operation: "",
            type: "",
            descricao: "",
            canhoto: "",
            cep: "",
            number: "",
            logradouro: "",
            city: "",
            latitude: "",
            longitude: "",
            verify: false,
            observation: "",
            concluded: false,
            typeCarga: "",
            typeDescarga: "",
            checkItemLocation: false,
        };
        setFormFields([...formFields, object]);
    };

    const [tipoVeiculo, setTipoVeiculo] = useState({
        dados: [
            { name: "FIORINO", selected: false },
            { name: "3/4", selected: false },
            { name: "TOCO", selected: false },
            { name: "VUC", selected: false },
            { name: "TRUCK", selected: false },
            { name: "BI-TRUCK", selected: false },
            { name: "CARRETA S", selected: false },
            { name: "CARRETA LS", selected: false },
            { name: "RODOTREM", selected: false },
            { name: "VANDERLEIA", selected: false },
        ],
    });

    const [formFieldsOriginal, setFormFieldsOriginal] = useState("");
    const [freightOrigin, setFreightOrigin] = useState("");

    const loadingPoints = (isCopy) => {
        var listResult = [];

        db.collection("freight")
            .doc(id)
            .collection("stopping_points")
            .get()
            .then((result) => {
                result.docs.forEach((doc) => {
                    if (isCopy === true) {
                        listResult.push({
                            id: doc.id,
                            stop_order: doc.data().stop_order,
                            name: doc.data().name,
                            cpf_cnpj: doc.data().cpf_cnpj,
                            operation: doc.data().operation,
                            responsible_phone: doc.data().responsible_phone,
                            responsible_name: doc.data().responsible_name,
                            number_collect: doc.data().number_collect,
                            date_operation: (doc.data().date_operation = ""),
                            time_operation: (doc.data().time_operation = ""),
                            canhoto: (doc.data().canhoto = null),
                            cep: doc.data().cep,
                            number: doc.data().number,
                            logradouro: doc.data().logradouro,
                            city: doc.data().city,
                            uf: doc.data().uf,
                            latitude: doc.data().latitude,
                            longitude: doc.data().longitude,
                            verify: (doc.data().verify = false),
                            observation: (doc.data().observation = ""),
                            concluded: (doc.data().concluded = false),
                            type: "",
                            descricao: "",
     
                        });
                        setFormFieldsOriginal(listResult);
                    } else {
                        listResult.push({
                            id: doc.id,
                            stop_order: doc.data().stop_order,
                            name: doc.data().name,
                            cpf_cnpj: doc.data().cpf_cnpj,
                            operation: doc.data().operation,
                            responsible_phone: doc.data().responsible_phone,
                            responsible_name: doc.data().responsible_name,
                            number_collect: doc.data().number_collect,
                            date_operation: doc.data().date_operation,
                            time_operation: doc.data().time_operation,
                            canhoto: doc.data().canhoto,
                            cep: doc.data().cep,
                            number: doc.data().number,
                            logradouro: doc.data().logradouro,
                            city: doc.data().city,
                            uf: doc.data().uf,
                            latitude: doc.data().latitude,
                            longitude: doc.data().longitude,
                            verify: doc.data().verify,
                            observation: doc.data().observation,
                            concluded: doc.data().concluded,
                            type: doc.data().type,
                            descricao: doc.data().descricao,
                        });
                        setFormFieldsOriginal(listResult);
                    }
                });

                setFormFieldsOriginal(listResult);
                setFormFields(listResult);
                setCarregando(0);
            })
            .catch((error) => {
                setCarregando(0);
                console.log(error);
            });

        return listResult;
    };

    var listClientIn = [];

    const [listClient, setListClient] = useState([]);
    const [listECClient, setListECClient] = useState([]);

    const handleChangeClient = (event) => {
        setPayingCustomer(event?.dataPersonal?.socialName);
        setCnpjPayingCustomer(event?.dataPersonal?.documentNumber);
        setListECShipper(event);
    };

    var listShipperIn = [];

    const [listShipper, setListShipper] = useState([]);
    const [listECShipper, setListECShipper] = useState("Embarcador");

    async function loadingShipper() {

        if(users?.perfil == "Operacional") {

            try {
                const result = await db.collection("shipper").doc(users.uidShipper).get();


                if (result.exists) {
                    // const shipperData = {
                        // id: result.id,
                        // ...result.data(),

                    setListShipper([{
                        id: result.id,
                        ...result.data()
                    }]);
                };

                // const listClientIn = result.docs.map((doc) => ({
                //     id: doc.id,
                //     ...doc.data(),
                // }));

                // setListShipper(listClientIn);
                setCarregando(0);
            } catch (error) {
                setCarregando(0);
                console.error("Erro ao buscar clientes:", error);
            }



            // await db
            //     .collection("shipper")
            //     .doc(users.uidShipper)
            //     .get()
            //     .then((result) => {
            //         result.docs.forEach((doc) => {
            //             listShipperIn.push({
            //                 id: doc.id,
            //                 ...doc.data(),
            //             });
            //         });

            //         setListShipper(listShipperIn);
            //         setCarregando(0);

            //         console.log("Embarcador carregado:", listShipperIn.length);
            //     })
            //     .catch((error) => {
            //         setCarregando(0);
            //         console.log(error);
            //     });


        }else {

            await db
                .collection("shipper")
                .get()
                .then((result) => {
                    result.docs.forEach((doc) => {
                        listShipperIn.push({
                            id: doc.id,
                            ...doc.data(),
                        });
                    });

                    setListShipper(listShipperIn);
                    setCarregando(0);
                })
                .catch((error) => {
                    setCarregando(0);
                    console.log(error);
                });
        }

        
    }

    async function loadingCustomer() {
        await db
            .collection("client")
            .get()
            .then((result) => {
                result.docs.forEach((doc) => {
                    listClientIn.push({
                        id: doc.id,
                        ...doc.data(),
                    });
                });

                setListClient(listClientIn);
                setListECClient([]);

                setCarregando(0);
            })
            .catch((error) => {
                setCarregando(0);
                console.log(error);
            });
    }

    function loadingQueue() {
        db.collection("drivers_users")
        .where("uidShipper", "==", users.uidShipper)
            .get()
            .then((result) => {
                const listDriverInFila = [];

                result.docs.forEach(async (doc) => {
                    const driverData = {
                        id: doc.id,
                        ...doc.data(),
                    };

                    // Verifica se a coleção myFreightList existe
                    const myFreightListRef = db
                        .collection("drivers_users")
                        .doc(doc.id)
                        .collection("myFreightsList");

                    const myFreightListSnapshot = await myFreightListRef.get();

                    // Adiciona uma propriedade para priorizar quem possui myFreightList
                    driverData.hasMyFreightList = !myFreightListSnapshot.empty;

                    listDriverInFila.push(driverData);

                    // Após verificar todos os motoristas, organiza a lista
                    if (listDriverInFila.length === result.docs.length) {
                        const sortedList = listDriverInFila.sort((a, b) => {
                            return b.hasMyFreightList - a.hasMyFreightList;
                        });

                        const withMyFreightList = sortedList.filter(
                            (driver) => driver.hasMyFreightList
                        );
                        const withoutMyFreightList = sortedList.filter(
                            (driver) => !driver.hasMyFreightList
                        );

                        const separatedList = [
                            {
                                name: "-----------------",
                                cpf: "",
                                value: "",
                                id: "",
                                uid: "",
                            },
                            ...withMyFreightList,
                            {
                                name: "-----------------",
                                cpf: "",
                                value: "",
                                id: "",
                                uid: "",
                            },
                            ...withoutMyFreightList,
                        ];

                        setDriversInFila(separatedList);
                        setCarregando(0);
                    }
                });
            })
            .catch((error) => {
                setCarregando(0);
                console.error(error);
            });
    }

    async function searchIdPayment(id) {
        try {
            const dataDadoPayment = await paymentService.getEspecifico(id)

            const verifyData = dataDadoPayment.filter((item) => item.status?.toLowerCase() === "pago" || item.status?.toLowerCase() === "solicitar pagamento");

            if (verifyData.length > 0) {
                debugger;
                setVerifyPayment(true);
            }
        }
        catch (error) {
            console.error("Erro ao buscar pagamento:", error);
        }
    }

    function loadingInit(isCopy) {
        db.collection("freight")
            .doc(id)
            .get()
            .then(async (result) => {
                var freight = result.data();
                setFreightOrigin(freight);

                var clientPayment = freight.clientPayment;
                var vehicle = freight.vehicle;
                var driver = freight.driver;
                var freightTage = freight.freight;

                if (isCopy === true) {
                    // cabeçalho
                    setNumberSerial(numberSerial);
                    setStatus();
                    setCode();
                    // Frete - motorista
                    setUidDriver();
                    setDriverChose("");
                    // Dados da Entrega
                    setObservation("");
                } else {
                    setNumberSerial(freight.numberSerial);
                    setStatus(freight.status.describe);
                    setCode(freight.status.code);

                    setUidDriver(freight.freight.getDriverFreight?.uidDriver);

                    // Dados da Entrega
                    setObservation(freightTage.observation);

                    if (isCopy === false) {
                        await driverService
                            .getDriverAvailable(
                                freight.freight.getDriverFreight?.uidDriver
                            )
                            .then(async (itemDriver) => {
                                setDriverChose(itemDriver.data());
                            })
                            .catch((erro) => {
                                console.log(erro);
                            });
                    }
                }

                // pagador
                setPayingCustomer(clientPayment.name);
                setCnpjPayingCustomer(clientPayment.cnpj);
                setListECShipper(clientPayment.name);

                // veiculo
                setTipoVeiculo(vehicle.typeVehicle);
                setTypeBodyworkList(vehicle.typeBodywork);
                setOccupation(vehicle.occupation);
                setFreeOfCharge(vehicle.freeOfCharge);

                // Motorista
                setValueDriverInitial(driver.valueInitial);
                setValueDriverFinal(driver.valueFinal);
                setValueNegotiated(driver.valueNegotiated);
                setPaymentCondition(driver.paymentCondition);

                // Frete
                setProduct(freightTage.product);
                setSeller(freightTage.seller);
                setPhoneRespContractFreigtage(
                    freightTage.phoneRespContractFreigtage
                );
                setWeightCargo(freightTage.weightCargo);
                setValueNF(freightTage.valueNF);
                setValueFreightage(freightTage.valueFreightage);

                // ???
                setTotalAmountRoute(freightTage.totalAmountRoute);

                setCarregando(0);
            })
            .catch((error) => {
                console.log(error);
                setMsgTipo("erro");
                setCarregando(0);
                setTitle(" Ops!");
                setMsg(
                    "Não foi possível carregar o frete no momento, por favor tente mais tarde."
                );
                setOpen(true);
                return;
            });
    }

    const { search } = useLocation();
    const params = new URLSearchParams(search);
    var isCopy = params.get("copy") === null ? false : true;

    const [idVerify, setId] = useState(id);

    useEffect(() => {
        let isCopyTemp = isCopy === false ? false : true;

        if (isCopyTemp === false) {
            if (idVerify) {
                loadingInit(isCopyTemp);
                loadingPoints();
                searchIdPayment(idVerify);
            }
        } else {
            loadingInit(isCopyTemp);
            loadingPoints(isCopyTemp);
            setId(null);
        }

        loadingQueue();
        loadingCustomer();
        loadingShipper();
    }, [idVerify, isCopy]);

    async function save() {
        setMsgTipo("erro");
        setCarregando(1);

        validInput();

        var chosenStatus = {
            describe: "Pendente de contratação",
            code: "01",
        };

        let customerPayment = {
            name: payingCustomer,
            cnpj: cnpjPayingCustomer,
        };

        let vehicle = {
            typeVehicle: tipoVeiculo,
            typeBodywork: typeBodyworkList,
            occupation: occupation,
            freeOfCharge: freeOfCharge,
        };

        let driverFreight = {
            uidDriver: uidDriver ? uidDriver : "",
        };

        let driver = {
            valueInitial: valueDriverInitial,
            valueFinal: valueDriverFinal,
            valueNegotiated: valueNegotiated,
            paymentCondition: paymentCondition,
        };

        let freight = {
            product: product,
            seller: seller,
            valueNF: valueNF,
            weightCargo: weightCargo,
            valueFreightage: valueFreightage,
            totalAmountRoute: totalAmountRoute ? totalAmountRoute : "",
            observation: observation ? observation : "",
            phoneRespContractFreigtage: withoutMaskPhone(
                phoneRespContractFreigtage
            ),
            getDriverFreight: driverFreight,
        };

        let shipper = {
            uid: users.uidShipper,
            name: shippers.dataPersonal.socialName,
        };

        let user = {
            uid: users.uid,
            name: users.name,
        };

        let history = {
            initialDate: new Date(),
            initialDateContrate: status === "Contratado" ? new Date() : "",
            partiallyDate:
                status === "Pendente de contratação" ? new Date() : "",
            atAnaliseDate: status === "Em Analise de perfil" ? new Date() : "",
            atAnaliseDateDriver:
                status === "Em Analise do motorista" ? new Date() : "",
        };

        //Ultima rota
        var primeiraRota = formFields
            .filter((item) => item.stop_order)
            .slice(0, 1)[0];

        var ultimaRota = formFields
            .filter((item) => item.stop_order)
            .slice(-1)[0];

        var firstDelivery = {
            name: primeiraRota.name,
            cep: primeiraRota.cep,
            address: primeiraRota.logradouro,
            city: primeiraRota.city,
            uf: primeiraRota.uf,
            dateColeta: primeiraRota.date_operation,
            coordinates: {
                latitude: primeiraRota.latitude,
                longitude: primeiraRota.longitude,
            },
        };

        var lastDelivery = {
            name: ultimaRota?.name,
            cep: ultimaRota?.cep,
            address: ultimaRota?.logradouro,
            city: ultimaRota?.city,
            uf: ultimaRota?.uf,
            dateColeta: ultimaRota.date_operation,
            coordinates: {
                latitude: ultimaRota?.latitude,
                longitude: ultimaRota?.longitude,
            },
        };

        var data = {
            clientPayment: customerPayment,
            firstDelivery: firstDelivery,
            lastDelivery: lastDelivery,
            status: chosenStatus,
            numberSerial: numberSerial,
            vehicle: vehicle,
            driver: driver,
            freight: freight,
            user: user,
            shipper: shipper,
            createUser: usuarioEmail,
            createData: new Date(),
            history: history,
        };

        // debugger;
        // return;

        if (!ultimaRota.date_operation) {
            showMessage("O data de coleta precisa ser preenchido");
            document.getElementById("datacoleta").focus();
        } else {
            if (uidDriver) {
                if (valueNegotiated === 0 || paymentCondition === "") { // Validação dos campos necessários para status 'Contratado'
                    showMessage("O Valor Negociado e a Condição de Pagamento são obrigatórios para fretes contratados.");
                    if (valueNegotiated === 0) {
                        document.getElementById("valueNegotiated").focus();
                    } else {
                        document.getElementById("paymentCondition").focus();
                    }
                    return;
                }
            }
            console.log("[Criando frete] Inserindo novo frete com dados : ");

            //Salvando dados do frete
            await db
                .collection("freight")
                .add(data)
                .then(async (item) => {
                    //Salvar os pontos de paradas 
                    formFields.forEach(async (doc) => {
                        await db
                            .collection("freight")
                            .doc(item.id)
                            .collection("stopping_points")
                            .add(doc);
                    });

                    

                    if (uidDriver) {

                        //Adicionar o myFreightList ao motorista para que ele tenha acessso no app ao frete
                        await driverService
                            .getDriverAvailable(uidDriver)
                            .then(async (itemDriver) => {
                                var driverUser = itemDriver.data();

                                var dataDriver = {
                                    driver_name: driverUser.name,
                                    driver_user: driverUser.uid,
                                    freightInitialized: false,
                                    // hired: new Date(),
                                    registrationInLineTime: new Date(),
                                    status: "hired",
                                };

                                //Salvando dados do motorista na fila de fretes
                                await freightService.saveDriverQueueFreight(
                                    item.id,
                                    driverUser.uid,
                                    dataDriver
                                );
                                //Salvando dados do motorista na aba meus fretes do app
                                await driverService.saveMyFreight(
                                    driverUser.uid,
                                    item.id,
                                    dataDriver
                                );

                                await freightService.updateStatusFreight(
                                    item.id,
                                    "Contratado",
                                    "04"
                                );

                                //Salvar na tabela payment os dados do pagamento
                                if(driver.paymentCondition || driver.valueNegotiated) {

                                    const paymentArray = driver.paymentCondition.split("/");

                                    // Percorrendo o array para acessar os valores
                                    paymentArray.forEach(async (value, index) => {
                                        
                                        // Nome Motorista / Número Orçamento / R$ 7.000,00 / Adiantamento / Status: Bloqueado
                                        var data = {
                                            idFreight: item.id,
                                            driver: driverFreight.uidDriver,
                                            order: numberSerial,
                                            value: driver.valueNegotiated * parseInt(value) / 100, //Retirando a porcentagem
                                            status: "Bloqueado"
                                        }

                                        //Salvando dados do pagamento
                                        await paymentService.save(data);

                                        mdfeService.createPreMdfe(item.id)

                                    });                                    

                                }

                                console.log("[Criando frete] Enviando notificação para o motorista : " + driverUser.idNotification);

                                // Enviar notificação para o motorista
                                var title = "Viagem: " + numberSerial;
                                var msg = "Viagem: " + numberSerial + " Foi atribuída a você."
                                + " Navegue até a aba Meus Fretes para iniciar viagem."
                                + "Data: "  + new Date();
                                
                                notification.sendNotification(driverUser.idNotification, msg);
                                
                                driverService.saveMessageInMyFreight(uidDriver, title, msg)
                            })
                            .catch((erro) => {
                                console.log(erro);
                            });
                    }
                    setCarregando(0);
                    setMsgTipo("sucesso");
                    navigate("/freightlist");

                    // try {
                    //     await paymentService.prepareEmailFreight(data, "Solicitação de Envio de Frete");
                    // }
                    // catch (error) {
                    //     console.error("Erro ao preparar email:", error);
                    // }
                })
                .catch((error) => {
                    setMsgTipo("erro");
                    setCarregando(0);
                });
        }
    }

    async function getDataPayment(value, driver, status, index) {
            var data = {
                idFreight: id,
                driver: uidDriver,
                order: numberSerial,
                value: driver.valueNegotiated * parseInt(value) / 100,
                type: index == 1 ? "Saldo" : "Adiantamento",
                status: status,
            };

            await paymentService.save(data);
    }



    // Função para verificar alterações
    async function update(isFinalize, isCopy) {
        setMsgTipo("erro");
        setCarregando(1);
        validInput();

        let chosenStatus = { describe: status, code: code };

        let customerPayment = {
            name: payingCustomer,
            cnpj: cnpjPayingCustomer,
        };

        let user = {
            uid: users.uid,
            name: users.name,
        };

        let shipper = {
            uid: users.uidShipper,
            name: shippers.dataPersonal.socialName,
        };

        // Dados organizados
        let freight = {
            product,
            seller,
            valueNF,
            weightCargo,
            valueFreightage,
            totalAmountRoute: totalAmountRoute || "",
            observation: observation || "",
            phoneRespContractFreigtage,
            getDriverFreight: { uidDriver: uidDriver || "" },
        };

        let vehicle = {
            typeVehicle: tipoVeiculo,
            typeBodywork: typeBodyworkList,
            occupation,
            freeOfCharge,
        };

        let driver = {
            valueInitial: valueDriverInitial,
            valueFinal: valueDriverFinal,
            valueNegotiated: valueNegotiated,
            paymentCondition: paymentCondition,
        };

        let history = {
            dateFinished: isCopy ? "" : isFinalize ? new Date() : "",
            dateUpdate: new Date(),
        };

        // Cálculo da primeira e última rota
        let primeiraRota = formFields
            .filter((item) => item.stop_order)
            .slice(0, 1)[0];
        let ultimaRota = formFields
            .filter((item) => item.stop_order)
            .slice(-1)[0];

        let firstDelivery = {
            name: primeiraRota?.name,
            cep: primeiraRota?.cep,
            address: primeiraRota?.logradouro,
            city: primeiraRota?.city,
            uf: primeiraRota?.uf,
            dateColeta: primeiraRota?.date_operation,
            coordinates: {
                latitude: primeiraRota?.latitude,
                longitude: primeiraRota?.longitude,
            },
        };

        let lastDelivery = {
            name: ultimaRota?.name,
            cep: ultimaRota?.cep,
            address: ultimaRota?.logradouro,
            city: ultimaRota?.city,
            uf: ultimaRota?.uf,
            dateColeta: ultimaRota?.date_operation,
            coordinates: {
                latitude: ultimaRota?.latitude,
                longitude: ultimaRota?.longitude,
            },
        };

        let data = {
            clientPayment: customerPayment,
            firstDelivery: firstDelivery,
            lastDelivery: lastDelivery,
            freight,
            vehicle,
            driver,
            user,
            shipper,
            createUser: usuarioEmail,
            createData: new Date(),
            history,
            status: chosenStatus,
        };

        if (!ultimaRota.date_operation) {
            showMessage("O data de coleta precisa ser preenchido");
            document.getElementById("datacoleta").focus();
            return;
        }

        if (status === "Contratado" || status === "Em transito" || uidDriver) {
            if (valueNegotiated === 0 || paymentCondition === "") { // Validação dos campos necessários para status 'Contratado'
                showMessage("O Valor Negociado e a Condição de Pagamento são obrigatórios para fretes contratados.");
                if (valueNegotiated === 0) {
                    document.getElementById("valueNegotiated").focus();
                } else {
                    document.getElementById("paymentCondition").focus();
                }
                return;
            }
        }

        // Verificar alterações nos campos críticos
        const originalFreight = {
            product,
            seller,
            valueNF,
            weightCargo,
            valueFreightage,
            totalAmountRoute: totalAmountRoute || "",
            observation: observation || "",
            phoneRespContractFreigtage,
            getDriverFreight: { uidDriver: uidDriver || "" },
        };

        // Comparar rotas originais e atuais
        const originalRoutes = JSON.stringify(formFieldsOriginal); // Salva a versão original das rotas antes da edição
        const currentRoutes = JSON.stringify(formFields);

        const fieldsChanged =
            hasFieldsChanged(originalFreight, freightOrigin.freight) ||
            JSON.stringify(vehicle) !== JSON.stringify(data.vehicle) ||
            JSON.stringify(driver) !== JSON.stringify(data.driver) ||
            originalRoutes !== currentRoutes;

        if (isFinalize) {
            if (code === "04" || code === "05" || code === "06") {
                //Status em transito ou entregue pode ser finalizado

                if (
                    formFields.every(
                        (field) =>
                            field.canhoto === undefined ||
                            field.canhoto === "" ||
                            field.canhoto === null
                    )
                ) {
                    showMessage(
                        "Atenção: É necessário preencher os conhotos de entrega antes de finalizar o frete"
                    );
                    return;
                }

                chosenStatus = {
                    describe: "Finalizado",
                    code: "07",
                };

                // Atualiza o campo 'concluded' para true
                formFields.forEach((field) => {
                    field.verify = true;
                    field.concluded = true;
                });

                // atualizar o status da fila dentro do motorista
                driverService.saveStatusMyFreight(uidDriver, id, "finished");
                // atualizar o status da fila dentro do frete
                freightService.saveStatusQueueFreight(
                    id,
                    uidDriver,
                    "finished"
                );
                // exluir o frete da fila do myFrete
                driverService.deleteStatusMyFreight(uidDriver, id);
            }

            if (status === "Finalizado" && !fieldsChanged) {
                chosenStatus = { describe: "Finalizado", code: "07" };
            }
        }

        if (status === "Finalizado" && fieldsChanged) {
            chosenStatus = { describe: "Em transito", code: "05" };
        }

        if (fieldsChanged) {
            if (!uidDriver) {
                // Verifica se uidDriver é vazio, nulo ou undefined
                chosenStatus = {
                    code: "01",
                    describe: "Pendente de contratação",
                };
            }
        }

        // Atualização no banco
        try {
            await db.collection("freight").doc(id).update({ ...data, status: chosenStatus });

            for (const doc of formFields) {
                if (doc.id) {
                    await db
                        .collection("freight")
                        .doc(id)
                        .collection("stopping_points")
                        .doc(doc.id)
                        .update(doc);
                } else {
                    await db
                        .collection("freight")
                        .doc(id)
                        .collection("stopping_points")
                        .add(doc);
                }
            }

            

             //Salvar na tabela payment os dados do pagamento
            if(paymentCondition || valueNegotiated) {

                const paymentArray = paymentCondition.split("/");

                try {
                    const dadosData = await paymentService.getEspecifico(id);
                    await paymentService.deleteAll(id);

                    if(dadosData.length > 0) {
                        // Percorrendo o array para acessar os valores
                        paymentArray.forEach(async (value, index) => {
                            let statusPagamento = index == 1 ? dadosData[1].status : dadosData[0].status;

                            getDataPayment(value, driver, statusPagamento, index);
                        });
                    } else {
                            paymentArray.forEach(async (value, index) => {
    
                            getDataPayment(value, driver, "Bloqueado", index);
                        });
                    }
                }
                catch (error) {
                    console.error(error);
                }

            }

            if (!uidDriver || uidDriver === "") {
                
                await driverService.deleteStatusMyFreight(freightOrigin.freight.getDriverFreight.uidDriver,id);
                await freightService.deleteDriverQueueFreight(id,freightOrigin.freight.getDriverFreight.uidDriver);
                
            } else if (uidDriver && ["Pendente de contratação","Em Analise de perfil","Em Analise do motorista",].includes(status)) {
                const driverData = await driverService.getDriverAvailable(uidDriver);
                const driverUser = driverData.data();
                const dataDriver = {
                    driver_name: driverUser.name,
                    driver_user: driverUser.uid,
                    freightInitialized: false,
                    registrationInLineTime: new Date(),
                    status: "hired",
                };
               
                await freightService.saveDriverQueueFreight(
                    id,
                    driverUser.uid,
                    dataDriver
                );
                await driverService.saveMyFreight(
                    driverUser.uid,
                    id,
                    dataDriver
                );
                await freightService.updateStatusFreight(
                    id,
                    "Contratado",
                    "04"
                );

                console.log("[Criando frete] Enviando notificação para o motorista : " + driverUser.idNotification);

                // Enviar notificação para o motorista
                var title = "Viagem: " + numberSerial;
                var msg = "Viagem: " + numberSerial + " foi atribuída a você."
                + " Navegue até a aba Meus Fretes para iniciar viagem."
                + "Data: "  + new Date();
                
                notification.sendNotification(driverUser.idNotification, msg);
                
                driverService.saveMessageInMyFreight(uidDriver, title, msg)
                
            }

            debugger;
            mdfeService.createPreMdfe(id);

            setMsgTipo("sucesso");
            setCarregando(0);
            navigate("/freightlist");

            try {
                await paymentService.prepareEmailFreight(data, "Solicitação de Envio de Frete - Update");
            }
            catch (error) {
                console.error("Erro ao preparar email:", error);
            }
        } catch (error) {
            console.error(error);
            setMsgTipo("erro");
            setCarregando(0);
        }
    }

    function hasFieldsChanged(original, updated) {
        return Object.keys(original).some(
            (key) =>
                JSON.stringify(original[key]) !== JSON.stringify(updated[key])
        );
    }

    // Função para lidar com a seleção ou remoção de um motorista
    const handleDriver = (event, isCopy) => {
        // Chama a função addDriverVerify com o ID do motorista (ou uma string vazia, se event for nulo/indefinido)
        addDriverVerify(event ? event.id : "");

        // Verifica se o parâmetro `isCopy` é "true" ou se o parâmetro `event` é nulo/indefinido
        if (isCopy === "true" || !event) {
            setUidDriver("");
            setDriverChose("");
        } else {
            setUidDriver(event.id ? event.id : "");
            setDriverChose(event ? event : "");
        }
    };

    //------------- Validações -----------------

    function validInput() {
        if (!cnpjPayingCustomer) {
            showMessage(
                "O campo CNPJ da cessão Cliente Pagador precisa ser preenchido"
            );
            document.getElementById("cnpjPayingCustomer").focus();
            return;
        }
        if (!payingCustomer) {
            showMessage(
                "O campo Cliente da cessão Cliente Pagador precisa ser preenchido"
            );
            document.getElementById("payingCustomer").focus();
            return;
        }
        if (!valueDriverInitial) {
            showMessage(
                "O campo Pagamento De: e descarga da cessão Motorista precisa ser preenchido"
            );
            document.getElementById("valueDriverInitial").focus();
            return;
        }
        if (!valueDriverFinal) {
            showMessage(
                "O campo Pagamento Até: e descarga da cessão Motorista precisa ser preenchido"
            );
            document.getElementById("valueDriverFinal").focus();
            return;
        }
        if (!occupation) {
            showMessage(
                "O campo Ocupação da cessão Veículo precisa ser preenchido"
            );
            document.getElementById("occupation").focus();
            return;
        }
        if (!freeOfCharge) {
            showMessage(
                "O campo Livre de Carga e descarga da cessão Veículo precisa ser preenchido"
            );
            document.getElementById("freeOfCharge").focus();
            return;
        }
        if (!product) {
            showMessage(
                "O campo Produto e descarga da cessão Frete precisa ser preenchido"
            );
            document.getElementById("product").focus();
            return;
        }
        if (!seller) {
            showMessage(
                "O campo Vendedor e descarga da cessão Frete precisa ser preenchido"
            );
            document.getElementById("seller").focus();
            return;
        }
        if (!valueNF) {
            showMessage(
                "O campo Valor NF e descarga da cessão Frete precisa ser preenchido"
            );
            document.getElementById("valueNF").focus();
            return;
        }
        if (!weightCargo) {
            showMessage(
                "O campo Peso da Carga (Kg) e descarga da cessão Frete precisa ser preenchido"
            );
            document.getElementById("weightCargo").focus();
            return;
        }
        if (!valueFreightage) {
            showMessage(
                "O campo Valor do Frete e descarga da cessão Frete precisa ser preenchido"
            );
            document.getElementById("valueFreightage").focus();
            return;
        }
        if (!valueNegotiated) {
            showMessage(
                "O campo Valor Negociado e descarga da cessão Frete precisa ser preenchido"
            );
            document.getElementById("valueNegotiated").focus();
            return;
        }
        if (!paymentCondition) {
            showMessage(
                "O campo Condição de Pagamento e descarga da cessão Frete precisa ser preenchido"
            );
            document.getElementById("paymentCondition").focus();
            return;
        }
    }

    function showMessage(msg) {
        setMsgTipo("erro");
        setCarregando(0);
        setTitle(" Ops!");
        setMsg(msg);
        setOpen(true);
        return;
    }

    const handleClickOpen = (id) => {
        setOpenOrigem(true);
        setReferenc(id);
    };

    function choseStatus(status) {
        //Se não tiver motorista na fila é Pendente de contratação
        if (!uidDriver) {
            setStatus("Pendente de contratação");
            return "01";
        } else if (status === "Pendente de contratação") {
            return "01";
        } else if (status === "Em Analise de perfil") {
            return "02";
        } else if (status === "Em Analise do motorista") {
            return "03";
        } else if (status === "Contratado") {
            return "04";
        } else if (status === "Em transito") {
            return "05";
        } else if (status === "Entregue") {
            return "06";
        } else if (status === "Finalizado") {
            return "07";
        }
    }

    function withoutMaskPhone(input) {
        return input
            ? input
                  .replace("(", "")
                  .replace(")", "")
                  .replace(" ", "")
                  .replace("-", "")
            : "";
    }

    const currencyConfig = {
        locale: "pt-BR",
        formats: {
            number: {
                BRL: {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                },
            },
        },
    };

    const currencyConfigKm = {
        locale: "pt-BR",
        formats: {
            number: {
                BRL: {
                    //   style: "Km",
                    currency: "BRL",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                },
            },
        },
    };

    function buscaAPISecondario(input, form, index, data) {
        fetch(`https://open.cnpja.com/office/${input}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Erro na requisição: ${res.status}`);
                }
                return res.json();
            })
            .then((fallbackData) => {
                // console.log("Dados do fallback:", fallbackData);
                form[index]["name"] = fallbackData?.company.name;
                form[index]["cpf_cnpj"] = fallbackData?.taxId;
                form[index]["cep"] = fallbackData?.address.zip;
                form[index]["number"] = fallbackData?.address.number;
                form[index]["logradouro"] = fallbackData?.address.street + " - " + fallbackData?.address.district;
                form[index]["city"] = fallbackData?.address.city;
                form[index]["uf"] = fallbackData?.address.state;
                form[index]["responsible_phone"] = fallbackData?.phones.area + fallbackData?.phones.number;
                fetch(
                    "https://maps.googleapis.com/maps/api/geocode/json?address=" + form[index]["cep"] + "&key=" + key, { mode: "cors" } )
                    .then((res) => res.json())
                    .then((data2) => {
                        if (data2.hasOwnProperty("erro")) {
                            alert("Cep não existente");
                        } else {
                            var address = data2.results[0];

                            form[index]["latitude"] = Number(data?.location?.coordinates.latitude? data?.location.coordinates.latitude: address?.geometry.location.lat);
                            form[index]["longitude"] = Number(data?.location?.coordinates.longitude? data?.location.coordinates.longitude: address?.geometry.location.lng);
                        }
                    });
                const clientData = {
                    name: fallbackData?.company.name,
                    nameFantasy: fallbackData?.company.name,
                    cnpj: fallbackData?.taxId,
                    address: {
                        cep: fallbackData?.address.zip,
                        city: fallbackData?.address.city,
                        complement: fallbackData?.address.street + " - " + fallbackData?.address.district,
                        neighborhood: fallbackData?.address.district,
                        number: fallbackData?.address.number,
                        state: fallbackData?.address.state,
                        street: fallbackData?.address.street,
                    },
                    coordinates: {
                        latitude: form[index][ "latitude" ],
                        longitude: form[index][ "longitude" ],
                    },
                    telefone: fallbackData?.phones.area + fallbackData?.phones.number,
                    typePerson: 2,
                }
                setFormFields(form);
                driverService.saveClient(clientData)
                .then(() => {
                    console.log("Cliente salvo com sucesso! Api secondary");
                })
                .catch((err) => {
                    console.error("Erro ao salvar cliente:", err);
                });

            })
            .catch((fetchErr) => console.error("Erro ao buscar no fallback da secondary api:", fetchErr));
    }

    //Função para consultar CNPJ
    function buscarCNPJBancoClient(input, index) {

        if (input.length < 14) {
            return;
        } else if (input.length === 14) {
            db.collection("client")
                .where("cnpj", "==", input)
                .get()
                .then((result) => {

                    // console.log(result)

                    var form = [...formFields];
                    if (result.empty) {
                        fetch("https://api.cnpjs.dev/v1/" + input, {mode: "cors",})
                            .then((res) => res.json())
                            .then((data) => {

                                if (data.hasOwnProperty("erro") || data.empty) {
                                    alert("CNPJ não existente");
                                } else if(data.status == 404){
                                    buscaAPISecondario(input, form, index, data);
                                } else {
                                    form[index]["name"] = data?.razao_social;
                                    form[index]["cpf_cnpj"] = data?.cnpj;
                                    form[index]["cep"] = data.endereco.cep;
                                    form[index]["number"] =
                                        data?.endereco.numero;
                                    form[index]["logradouro"] =
                                        data?.endereco.logradouro +
                                        " - " +
                                        data?.endereco.complemento;
                                    form[index]["city"] =
                                        data?.endereco.municipio;
                                    form[index]["uf"] = data?.endereco.uf;
                                    form[index]["responsible_phone"] =
                                        data?.telefone1;
                                    fetch(
                                        "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                                            form[index]["cep"] +
                                            "&key=" +
                                            key,
                                        { mode: "cors" }
                                    )
                                        .then((res) => res.json())
                                        .then((data2) => {
                                            if (data2.hasOwnProperty("erro")) {
                                                alert("Cep não existente");
                                            } else {
                                                var address = data2.results[0];

                                                form[index]["latitude"] =
                                                    Number(
                                                        data?.location
                                                            ?.coordinates
                                                            .latitude
                                                            ? data?.location
                                                                  .coordinates
                                                                  .latitude
                                                            : address?.geometry
                                                                  .location.lat
                                                    );
                                                form[index]["longitude"] =
                                                    Number(data?.location?.coordinates.longitude? data?.location.coordinates.longitude: address?.geometry.location.lng);
                                                // alert("Dados preenchidos");
                                                const clientData = {
                                                    name: data?.razao_social,
                                                    nameFantasy:
                                                        data?.nome_fantasia,
                                                    cnpj: data?.cnpj,
                                                    address: {
                                                        cep: data?.endereco.cep,
                                                        city: data?.endereco
                                                            .municipio,
                                                        complement:
                                                            data?.endereco
                                                                .complemento,
                                                        neighborhood:
                                                            data?.endereco
                                                                .bairro,
                                                        number: data?.endereco
                                                            .numero,
                                                        state: data?.endereco
                                                            .uf,
                                                        street: data?.endereco
                                                            .logradouro,
                                                    },
                                                    coordinates: {
                                                        latitude:
                                                            form[index][
                                                                "latitude"
                                                            ],
                                                        longitude:
                                                            form[index][
                                                                "longitude"
                                                            ],
                                                    },
                                                    telefone: data?.telefone1,
                                                    typePerson: 2,
                                                };
                                                driverService.saveClient(
                                                    clientData
                                                );
                                            }
                                        });
                                    setFormFields(form); 
                                }
                            })
                            .catch((err) => console.log(err));

                    } else {
                        result.docs.forEach((doc) => {
                            const data = doc.data();

                            form[index]["name"] = data.name;
                            form[index]["cpf_cnpj"] = data.cnpj;

                            if ( data.responsible && data.responsible.phoneResp && data.responsible.responsible) {

                                form[index]["responsible_phone"] = data.responsible.phoneResp;
                                form[index]["responsible_name"] = data.responsible.responsible;
                            } else {
                                console.log("Dados de responsável ausentes ou vazios para o documento:",doc.id);
                            }

                            form[index]["cep"] = data.address.cep;
                            form[index]["number"] = data.address.number;
                            form[index]["logradouro"] =
                                data.address.street +
                                " - " +
                                data.address.neighborhood;
                            form[index]["city"] = data.address.city;
                            form[index]["uf"] = data.address.state;

                            if (
                                data.coordinates &&
                                data.coordinates.latitude &&
                                data.coordinates.longitude
                            ) {
                                form[index]["latitude"] =
                                    data?.coordinates.latitude;
                                form[index]["longitude"] =
                                    data?.coordinates.longitude;
                            } else {
                                fetch(
                                    "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                                        form[index]["cep"] +
                                        "&key=" +
                                        key,
                                    { mode: "cors" }
                                )
                                    .then((res) => res.json())
                                    .then((data2) => {
                                        if (data2.hasOwnProperty("erro")) {
                                            alert("Cep não existente");
                                        } else {
                                            var address = data2.results[0];

                                            form[index]["latitude"] = Number(
                                                data.location?.coordinates
                                                    .latitude
                                                    ? data.location.coordinates
                                                          .latitude
                                                    : address?.geometry.location
                                                          .lat
                                            );
                                            form[index]["longitude"] = Number(
                                                data.location?.coordinates
                                                    .longitude
                                                    ? data.location.coordinates
                                                          .longitude
                                                    : address?.geometry.location
                                                          .lng
                                            );
                                            // alert("Dados preenchidos");
                                        }
                                    });
                            }
                        });
                        setFormFields(form);
                    }
                })
                .catch((err) => console.log(err));
        } else if (input.length === 18) {
            const inputLimpo = input.replace(/[^\d]/g, "");
            db.collection("client")
                .where("cnpj", "==", inputLimpo)
                .get()
                .then((result) => {
                    var form = [...formFields];
                    if (result.empty) {
                        fetch("https://api.cnpjs.dev/v1/" + inputLimpo, {
                            mode: "cors",
                        })
                            .then((res) => res.json())
                            .then((data) => {

                                // console.log(data)

                                if (data.hasOwnProperty("erro") || data.empty) {
                                    alert("CNPJ não existente");
                                } else if(data.status == 404){
                                    buscaAPISecondario(inputLimpo, form, index, data);
                                } else {
                                    form[index]["name"] = data?.razao_social;
                                    form[index]["cpf_cnpj"] = data?.cnpj;
                                    form[index]["cep"] = data.endereco.cep;
                                    form[index]["number"] =
                                        data?.endereco.numero;
                                    form[index]["logradouro"] =
                                        data?.endereco.logradouro +
                                        " - " +
                                        data?.endereco.complemento;
                                    form[index]["city"] =
                                        data?.endereco.municipio;
                                    form[index]["uf"] = data?.endereco.uf;
                                    form[index]["responsible_phone"] =
                                        data?.telefone1;
                                    fetch(
                                        "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                                            form[index]["cep"] +
                                            "&key=" +
                                            key,
                                        { mode: "cors" }
                                    )
                                        .then((res) => res.json())
                                        .then((data2) => {
                                            if (data2.hasOwnProperty("erro")) {
                                                alert("Cep não existente");
                                            } else {
                                                var address = data2.results[0];

                                                form[index]["latitude"] =
                                                    Number(
                                                        data?.location
                                                            ?.coordinates
                                                            .latitude
                                                            ? data?.location
                                                                  .coordinates
                                                                  .latitude
                                                            : address?.geometry
                                                                  .location.lat
                                                    );
                                                form[index]["longitude"] =
                                                    Number(
                                                        data?.location
                                                            ?.coordinates
                                                            .longitude
                                                            ? data?.location
                                                                  .coordinates
                                                                  .longitude
                                                            : address?.geometry
                                                                  .location.lng
                                                    );
                                                // alert("Dados preenchidos");
                                                const clientData = {
                                                    name: data?.razao_social,
                                                    nameFantasy:
                                                        data?.nome_fantasia,
                                                    cnpj: data?.cnpj,
                                                    address: {
                                                        cep: data?.endereco.cep,
                                                        city: data?.endereco
                                                            .municipio,
                                                        complement:
                                                            data?.endereco
                                                                .complemento,
                                                        neighborhood:
                                                            data?.endereco
                                                                .bairro,
                                                        number: data?.endereco
                                                            .numero,
                                                        state: data?.endereco
                                                            .uf,
                                                        street: data?.endereco
                                                            .logradouro,
                                                    },
                                                    coordinates: {
                                                        latitude:
                                                            form[index][
                                                                "latitude"
                                                            ],
                                                        longitude:
                                                            form[index][
                                                                "longitude"
                                                            ],
                                                    },
                                                    telefone: data?.telefone1,
                                                    typePerson: 2,
                                                };
                                                driverService.saveClient(
                                                    clientData
                                                );
                                            }
                                        });
                                    setFormFields(form);
                                }
                            })
                            .catch((err) => console.log(err));
                    } else {
                        result.docs.forEach((doc) => {
                            const data = doc.data();

                            form[index]["name"] = data.name;
                            form[index]["cpf_cnpj"] = data.cnpj;

                            if (
                                data.responsible &&
                                data.responsible.phoneResp &&
                                data.responsible.responsible
                            ) {
                                form[index]["responsible_phone"] =
                                    data.responsible.phoneResp;
                                form[index]["responsible_name"] =
                                    data.responsible.responsible;
                            } else {
                                console.log(
                                    "Dados de responsável ausentes ou vazios para o documento:",
                                    doc.id
                                );
                            }

                            let address;

                            if (
                                data.addressDelivery &&
                                Object.keys(data.addressDelivery).length > 0
                            ) {
                                address = data.addressDelivery;
                            } else {
                                address = data.address;
                            }

                            form[index]["cep"] = address.cep;
                            form[index]["number"] = address.number;
                            form[index]["logradouro"] =
                                address.street + " - " + address.neighborhood;
                            form[index]["city"] = address.city;
                            form[index]["uf"] = address.state;

                            if (
                                data.coordinates &&
                                data.coordinates.latitude &&
                                data.coordinates.longitude
                            ) {
                                form[index]["latitude"] =
                                    data.coordinates.latitude;
                                form[index]["longitude"] =
                                    data.coordinates.longitude;
                            } else {
                                fetch(
                                    "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                                        form[index]["cep"] +
                                        "&key=" +
                                        key,
                                    { mode: "cors" }
                                )
                                    .then((res) => res.json())
                                    .then((data2) => {
                                        if (data2.hasOwnProperty("erro")) {
                                            alert("Cep não existente");
                                        } else {
                                            var address = data2.results[0];

                                            form[index]["latitude"] = Number(
                                                data.location?.coordinates
                                                    .latitude
                                                    ? data.location.coordinates
                                                          .latitude
                                                    : address?.geometry.location
                                                          .lat
                                            );
                                            form[index]["longitude"] = Number(
                                                data.location?.coordinates
                                                    .longitude
                                                    ? data.location.coordinates
                                                          .longitude
                                                    : address?.geometry.location
                                                          .lng
                                            );
                                            // alert("Dados preenchidos");
                                        }
                                    });
                            }
                        });
                        setFormFields(form);
                    }
                })
                .catch((err) => console.log(err));
        } else {
            alert("CNPJ invalido");
        }
    }

    const key = "AIzaSyAds1TwGzvflRvD8KHrbRHrnF3DvATFM1k";

    //Função para consultar CEP
    function buscarCepPaying(input, index) {
        if (input.length < 8) {
            return;
        } else {
            fetch("https://brasilapi.com.br/api/cep/v1/" + input, {
                mode: "cors",
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.hasOwnProperty("erro")) {
                        alert("Cep não existente");
                    } else {
                        var form = [...formFields];

                        form[index]["logradouro"] =
                            data.street + " - " + data.neighborhood;
                        form[index]["city"] = data.city;
                        form[index]["uf"] = data.state;

                        /**
                         * Adicionando esse trecho de código para quando não vinher latitude e longitude
                         *
                         */
                        fetch(
                            "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                                input +
                                "&key=" +
                                key,
                            { mode: "cors" }
                        )
                            .then((res) => res.json())
                            .then((data2) => {
                                if (data2.hasOwnProperty("erro")) {
                                    alert("Cep não existente");
                                } else {
                                    var address = data2.results[0];

                                    form[index]["latitude"] = Number(
                                        data.location?.coordinates.latitude
                                            ? data.location.coordinates.latitude
                                            : address?.geometry.location.lat
                                    );
                                    form[index]["longitude"] = Number(
                                        data.location?.coordinates.longitude
                                            ? data.location.coordinates
                                                  .longitude
                                            : address?.geometry.location.lng
                                    );
                                }
                            });

                        setFormFields(form);
                    }
                })
                .catch((err) => console.log(err));
        }
    }

    function consultStreetByStreet(index) {
        //https://maps.googleapis.com/maps/api/geocode/json?address=53190010&key=AIzaSyAds1TwGzvflRvD8KHrbRHrnF3DvATFM1k
        // fetch('https://maps.googleapis.com/maps/api/geocode/json?address='+ input +'&key='+key, {mode: 'cors'})
        //  fetch('https://brasilapi.com.br/api/cep/v2/'+input, {mode: 'cors'})
        //     .then((res) => res.json())
        //     .then((data) => {
        //         if (data.hasOwnProperty("erro")) {
        //             alert('Cep não existente');
        //         } else {

        var form = [...formFields];

        if (
            !form[index]["number"] ||
            !form[index]["logradouro"] ||
            !form[index]["city"] ||
            !form[index]["uf"]
        ) {
            setCarregando(0);
            setTitle("Por favor!");
            setMsg(
                "Preencher o Endereço, Número, Cidade e Estado para atualizar a localização do ponto de parada "
            );
            setOpen(true);
        } else {
            var logradouro = form[index]["logradouro"];
            var numero = form[index]["number"];
            var cidade = form[index]["city"];
            var uf = form[index]["uf"];

            var enderecoCompleto =
                logradouro + " " + numero + " " + cidade + " " + uf;

            /**
             * Adicionando esse trecho de código para quando não vinher latitude e longitude
             *
             */
            fetch(
                "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                    enderecoCompleto +
                    "&key=" +
                    key,
                { mode: "cors" }
            )
                .then((res) => res.json())
                .then((data2) => {
                    if (data2.hasOwnProperty("erro")) {
                        alert("Cep não existente");
                    } else {
                        var address = data2.results[0];

                        form[index]["latitude"] =
                            address?.geometry.location.lat;
                        form[index]["longitude"] =
                            address?.geometry.location.lng;

                        form[index]["checkItemLocation"] = true;

                        // setCarregando(0);
                        // setTitle('Muito bem!');
                        // setMsg('Endereço atualizado com sucesso!');
                        // setOpen(true);
                    }
                })
                .catch((err) => console.log(err));

            setFormFields(form);
        }

        //     }
        // })
        // .catch(err => console.log(err));
        // }
    }

    //Função para consultar CEP
    // function buscarCepCustomer(input) {

    //     if(input.length < 8) {
    //         return;
    //     } else {

    //             fetch('https://brasilapi.com.br/api/cep/v2/'+input, {mode: 'cors'})
    //             .then((res) => res.json())
    //             .then((data) => {
    //                 if (data.hasOwnProperty("erro")) {
    //                     alert('Cep não existente');
    //                 } else {
    //                     setAddressOrigin(data.street + ' - ' + data.neighborhood)
    //                     setOriginCity(data.city)
    //                     setOriginStateInitial(data.state)
    //                     setTypeLocationCustomer(data.location.type)
    //                     setLongitudeCustomer(data.location.coordinates.longitude)
    //                     setLatitudeCustomer(data.location.coordinates.latitude)
    //                 }
    //             })
    //             .catch(err => console.log(err));
    //     }
    // }

    //Função para consultar CEP
    // function buscarCepClient(input) {

    //     if(input.length < 8) {
    //         return;
    //     } else {

    //             fetch('https://brasilapi.com.br/api/cep/v2/'+input, {mode: 'cors'})
    //             .then((res) => res.json())
    //             .then((data) => {
    //                 if (data.hasOwnProperty("erro")) {
    //                     alert('Cep não existente');
    //                 } else {
    //                     setAddressDelivery(data.street + ' - ' + data.neighborhood)
    //                     setCityDelivery(data.city)
    //                     setStateInitialDelivery(data.state)
    //                     setTypeLocationDelivery(data.location.type)
    //                     setLongitudeDelivery(data.location.coordinates.longitude)
    //                     setLatitudeDelivery(data.location.coordinates.latitude)
    //                 }
    //             })
    //             .catch(err => console.log(err));
    //     }
    // }

    // const copyPaymentToOrigin = ()=> {

    //     setOriginCustomer(payingCustomer)
    //     // setCepOrigin(cepPaying)
    //     // setAddressOrigin(addressPaying)
    //     // setOriginCity(cityPaying)
    //     // setOriginStateInitial(payingStateInitial)
    //     // setResponsibleOrigin(responsiblePaying)
    //     // setPhoneRespOrigin(phoneRespPaying)
    //     // setTypeLocationCustomer(typeLocationPaying)
    //     // setLongitudeCustomer(longitudePaying)
    //     // setLatitudeCustomer(latitudePaying)
    // }

    // const copyPaymentToDelivery = ()=> {

    //     setClientDelivery(payingCustomer)
    //     // setCepDelivery(cepPaying)
    //     // setAddressDelivery(addressPaying)
    //     // setCityDelivery(cityPaying)
    //     // setStateInitialDelivery(payingStateInitial)
    //     // setResponsibleDelivery(responsiblePaying)
    //     // setPhoneRespDelivery(phoneRespPaying)
    //     // setTypeLocationDelivery(typeLocationPaying)
    //     // setLatitudeDelivery(longitudePaying)
    //     // setLongitudeDelivery(latitudePaying)
    // }

    const handleClose = () => {
        setOpen(false);
        setCarregando(0);
    };

    const handleChangeInitial = (event, value, maskedValue) => {
        event.preventDefault();
        setValueDriverInitial(value);
    };

    const handleChangeFinal = (event, value, maskedValue) => {
        event.preventDefault();
        setValueDriverFinal(value);
    };

    const handleChangeValueNegotiated = (event, value, maskedValue) => {
        event.preventDefault();
        setValueNegotiated(value);
    }

    const handleChangePaymentCondition = (event, value, maskedValue) => {
        const selectedValue = event.target.value;
        setPaymentCondition(selectedValue);
    }

    const handleChangeWeightCargo = (event, value, maskedValue) => {
        event.preventDefault();
        setWeightCargo(value);
    };

    const handleChangeValueNF = (event, value, maskedValue) => {
        event.preventDefault();
        setValueNF(value);
    };

    const handleChangeValueFreightage = (event, value, maskedValue) => {
        event.preventDefault();
        setValueFreightage(value);
    };

    const handleClickDialog = () => {
        setOpenDialog(false);
    };

    const verifyUiDriver = (event) => {
        addDriverVerify(event.target.value);
        setUidDriver(event.target.value && event.target.value);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        return;
    };

    const addDriverVerify = (id) => {
        if (id !== "Selecione" && id !== "") {
            setCarregando(0);
            setTitle("Notificação para o motorista");
            setMsg(
                "Uma notificação será enviada para o motorista solicitando a sua aprovação"
            );
            setOpen(true);
        }
    };

    const msgHaveContract = () => {
        if (!uidDriver) {
            setCarregando(0);
            setTitle("Atenção!");
            setMsg(
                "Esse status geralmente é mudado automaticamente quando o motorista aceita a carga," +
                    "tem certeza que deseja mudar esse status manualmente ?"
            );
            setOpen(true);
        }
    };

    const varifyHavingDriver = () => {
        if (!uidDriver) {
            setCarregando(0);
            setTitle("Ops!");
            setMsg(
                "Para esse tipo de Status precisará selecionar um Motorista disponível da fila no campo Motorista(s)"
            );
            setOpen(true);
        }
    };

    const getStatus = (status) => {
        if (status === "Contratado") {
            return "hired";
        }
        if (status === "Entregue") {
            return "delivered";
        }
        if (status === "Em transito") {
            return "inTransit";
        } else if (
            (status === "Pendente de contratação" ||
                status === "Em Analise do motorista") &&
            uidDriver
        ) {
            return "approved";
        }
    };

    //----------------------------- checked box ------------------------------------

    const handleOnChange = (e, type) => {
        const { name, checked } = e.target;
        const newTypeVehicle = [...tipoVeiculo[type]];
        const index = newTypeVehicle.findIndex((h) => h.name === name);
        if (index > -1) {
            newTypeVehicle[index] = { name, selected: checked };
        }
        setTipoVeiculo((h) => ({ ...h, [type]: newTypeVehicle }));
    };

    const renderCheckboxList = (options, type) =>
        options.map((opt) => (
            <div key={opt.name} className="checkbox-container">
                <input
                    type="checkbox"
                    name={opt.name}
                    onChange={(e) => handleOnChange(e, type)}
                    checked={opt.selected}
                />
                {opt.name}
            </div>
        ));

    const categories = {
        Leve: ["FIORINO", "3/4", "TOCO", "VUC"],
        Médio: ["TRUCK", "BI-TRUCK"],
        Pesado: ["BITREM", "CARRETA S", "CARRETA LS", "RODOTREM", "VANDERLEIA"],
    }

    const renderCategories = () => {
        return Object.keys(categories).map((category) => {
            const filteredOptions = tipoVeiculo.dados.filter((vehicle) =>
                categories[category].includes(vehicle.name)
            );
            return (
                <Card className="mb-3">
                    <div key={category} class="category-column">
                        <h8 style={{ fontWeight: 'bold', fontSize: "14px" }}>{category}</h8>
                        {renderCheckboxList(filteredOptions, "dados")}
                    </div>
                </Card>
            )
        })
    };

    const handleOnChangeBodyWork = (e, type) => {
        const { name, checked } = e.target;
        const newTypeBodyWork = [...typeBodyworkList[type]];
        const index = newTypeBodyWork.findIndex((h) => h.name === name);
        if (index > -1) {
            newTypeBodyWork[index] = { name, selected: checked };
        }
        setTypeBodyworkList((h) => ({ ...h, [type]: newTypeBodyWork }));
    };

    const renderCheckboxListBodyWork = (options, type) =>
        options.map((opt) => (
            <div key={opt.name} className="checkbox-container">
                <input
                    type="checkbox"
                    name={opt.name}
                    onChange={(e) => handleOnChangeBodyWork(e, type)}
                    checked={opt.selected}
                />
                {opt.name}
            </div>
        ));

        const categoriesBodyWork = {
            Fechada: ["BAÚ", "BAÚ FRIGORIFICO", "BAÚ REFRIGERADO", "SIDER"],
            Aberta: ["CAÇAMBA", "GRADE BAIXA", "GRANELEIRO", "PLATAFORMA", "PRANCHA"],
            Especial: ["BUG PORTA CONTAINER", "CAVAQUEIRA", "CEGONHEIRO", "GAIOLA", "HOPPER", "MUNCK", "SILLO", "TANQUE"],
        }

        const renderCategoriesBodyWork = () => {
            return Object.keys(categoriesBodyWork).map((category) => {
                const filteredOptions = typeBodyworkList.dados.filter((vehicle) =>
                    categoriesBodyWork[category].includes(vehicle.name)
                );
                return (
                    <Card className="mb-3">
                        <div key={category} class="category-column">
                            <h8 style={{ fontWeight: 'bold', fontSize: "14px" }}>{category}</h8>
                            {renderCheckboxListBodyWork(filteredOptions, "dados")}
                        </div>
                    </Card>
                )
            })
        };

    const handleUpload = (file) => {
        if (!file) return;

        const storageRef = ref(
            storage,
            `freight/${id}/stoppingPoints/${referenc}/deliveryReceipt/${file.name}`
        );

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setCarregando(progress);
            },
            (error) => {
                alert(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(
                    async (downloadURL) => {
                        formFields.forEach(async (doc) => {
                            if (doc.id === referenc) {
                                let updatedData = {
                                    id: doc.id,
                                    stop_order: doc.stop_order,
                                    name: doc.name,
                                    cpf_cnpj: doc.cpf_cnpj,
                                    operation: doc.operation,
                                    responsible_phone: doc.responsible_phone,
                                    responsible_name: doc.responsible_name,
                                    number_collect: doc.number_collect,
                                    date_operation: doc.date_operation,
                                    time_operation: doc.time_operation,
                                    type: doc.type,
                                    descricao: doc.descricao,
                                    canhoto: downloadURL,
                                    cep: doc.cep,
                                    number: doc.number,
                                    logradouro: doc.logradouro,
                                    city: doc.city,
                                    latitude: doc.latitude,
                                    longitude: doc.longitude,
                                    verify: true,
                                    observation: doc.observation,
                                    concluded: true,
                                };

                                setFormFields(
                                    formFields.map((field) =>
                                        field.id === referenc
                                            ? { ...field, ...updatedData }
                                            : field
                                    )
                                );

                                setCarregando(0);
                                setOpenOrigem(false);
                                setOrigem("");
                            }
                        });
                    }
                );

                setReferenc("");
            }
        );
    };

    const handleCloseModal = () => {
        setOpenOrigem(false);
    };

    const handleShipperCloseModal = () => {
        setOpenShipper(false);
    };

    const getDadaClient = (cnpj, razaosocial) => {
        setPayingCustomer(razaosocial);
        setCnpjPayingCustomer(cnpj);
    };

    const handleFormChange = (event, index) => {
        let data = [...formFields];

        if (event.target.name === "carga" || event.target.name === "descarga") {
            if (event.target.checked) {
                data[index]["operation"].push(event.target.name);
            } else if (!event.target.checked) {
                data[index]["operation"].splice(
                    data[index]["operation"].indexOf(event.target.name),
                    1
                );
            }
        }

        if (event.target.name === "stop_order") {
            data[index]["stop_order"] = parseInt(event.target.value);
        } else if (event.target.name === "verify") {
            data[index][event.target.name] = event.target.checked;
        } else {
            data[index][event.target.name] = event.target.value;
        }

        setFormFields(data);
    };

    const deleteItem = (item, index) => {
        var data = [...formFields];
        data.splice(index, 1);
        setFormFields(data);
    };

    const duplicateForm = (index) => {
        // Pega o formulário que será duplicado
        const formToDuplicate = formFields[index];

        // Verifica se o formulário a ser duplicado existe
        if (!formToDuplicate) {
            console.error("Formulário não encontrado no índice:", index);
            return;
        }

        // Cria uma cópia profunda do formulário original
        let newForm = JSON.parse(JSON.stringify(formToDuplicate));

        // Modifica os campos específicos do novo formulário
        newForm.stop_order = formToDuplicate.stop_order + 1;
        newForm.date_operation = "";
        newForm.time_operation = "";
        newForm.observation = "";
        newForm.number_collect = geraNumeroColeta();

        // Adiciona o novo formulário à lista de formulários
        setFormFields([...formFields, newForm]);
    };

    // Função para formatar o CPF
    const formatCPF = (cpf) => {
        if (!cpf) return "";
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    };

    return (
        <>
            {useSelector((state) => state.usuarioLogado) > 0 ? (
                <NewMiniDrawer
                    divOpen={
                        <Box
                            component="span"
                            sx={{
                                display: "inline-block",
                                mx: "1px",
                                transform: "scale(1.0)",
                            }}
                        >
                            <div
                                className="freight-content align-items-center"
                                style={{ paddingTop: "0px" }}
                            >
                                {/* Dialog de upload de arquivo  */}
                                <AlertDialog
                                    handleClose={handleCloseModal}
                                    open={openOrigem}
                                    origem={origem}
                                    handleUpload={handleUpload}
                                />

                                <ShipperDialog
                                    handleClose={handleShipperCloseModal}
                                    open={openShipper}
                                    dadosClient={getDadaClient}
                                />

                                <div className="container">
                                    <div className="row">
                                        <div className="col-5">
                                            <p className="help-block">
                                                {" "}
                                                Número Orçamento:{" "}
                                                <strong>
                                                    {" "}
                                                    {numberSerial}{" "}
                                                </strong>{" "}
                                            </p>
                                        </div>
                                        <div className="col-5"></div>
                                        <div className="col-2">
                                            <div className="col-md-11 control-label">
                                                <p className="help-block">
                                                    <span className="h11">
                                                        *
                                                    </span>
                                                    <strong>
                                                        {" "}
                                                        Campo Obrigatório{" "}
                                                    </strong>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-12">
                                    <div
                                        class="btn-group"
                                        role="group"
                                        aria-label="Basic radio toggle button group"
                                    >
                                        <HorizontalStepper status={code} />
                                    </div>

                                    <hr className="my-4" />
                                </div>

                                <Card
                                    sx={{ padding: 2 }}
                                    className="mb-3"
                                    style={{ background: "#ffffff" }}
                                >
                                    <div className="form-signin mx-auto mb-4 mb-lg-6">
                                        <h4 className="mb-3">Pagador</h4>

                                        <div className="row">
                                            <div className="col-4">
                                                <label
                                                    htmlFor="payingCustomerLabel"
                                                    className="form-label"
                                                >
                                                    Cliente
                                                </label>

                                                <Autocomplete
                                                    id="chose-1"
                                                    size="small"
                                                    value={
                                                        listECShipper &&
                                                        listECShipper
                                                    }
                                                    getOptionLabel={(option) =>
                                                        option?.dataPersonal
                                                            ?.socialName ||
                                                        listECShipper
                                                    }
                                                    options={listShipper} // Use listShipper directly
                                                    isOptionEqualToValue={(
                                                        option,
                                                        value
                                                    ) =>
                                                        option?.dataPersonal
                                                            ?.socialName ===
                                                        value?.dataPersonal
                                                            ?.socialName
                                                    }
                                                    onChange={(event, value) =>
                                                        handleChangeClient(
                                                            value
                                                        )
                                                    }
                                                    noOptionsText="Nenhum Embarcador com esse nome foi encontrado"
                                                    sx={{ width: "100%" }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label=""
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <label
                                                    htmlFor="cnpjPayingCustomerLabel"
                                                    className="form-label"
                                                >
                                                    CNPJ
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cnpjPayingCustomer"
                                                    onChange={(e) =>
                                                        setCnpjPayingCustomer(
                                                            e.target.value
                                                        )
                                                    }
                                                    value={
                                                        cnpjPayingCustomer &&
                                                        cnpjPayingCustomer
                                                    }
                                                    className="form-control"
                                                    id="cnpjPayingCustomer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <div className="row g-12 ">
                                    <div className="form-signin mx-auto mb-4 mb-lg-8">
                                        <div className="row ">
                                            <div className="col-12">
                                                <h4 className="mb-3">
                                                    Pontos de paradas
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="form-signin mx-auto mb-4 mb-lg-6">
                                            {formFields
                                                .sort(
                                                    (a, b) =>
                                                        a.stop_order -
                                                        b.stop_order
                                                )
                                                .map((form, index) => {
                                                    return (
                                                        <Box
                                                            component="span"
                                                            sx={{
                                                                display:
                                                                    "inline-block",
                                                                mx: "1px",
                                                                transform:
                                                                    "scale(0.9)",
                                                            }}
                                                        >
                                                            <Card
                                                                sx={{
                                                                    padding: 2,
                                                                }}
                                                                style={{
                                                                    background:
                                                                        form.canhoto
                                                                            ? "#f2f8fb"
                                                                            : "#ffffff",
                                                                }}
                                                            >
                                                                <div className="row mb-5">
                                                                    <div className="row">
                                                                        <div className="col-1 mb-4">
                                                                            <label
                                                                                htmlFor="ordenacaoLabel"
                                                                                className="form-label"
                                                                            >
                                                                                Ordenação
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                name="stop_order"
                                                                                min={
                                                                                    1
                                                                                }
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    handleFormChange(
                                                                                        event,
                                                                                        index
                                                                                    )
                                                                                }
                                                                                value={
                                                                                    form.stop_order &&
                                                                                    form.stop_order
                                                                                }
                                                                                // disabled={form.concluded && isCopy !== "true"}
                                                                                size={
                                                                                    "small"
                                                                                }
                                                                                className="form-control"
                                                                                id="ordenacao"
                                                                                placeholder=""
                                                                            />
                                                                        </div>

                                                                        <div className="col-1 mb-2"></div>

                                                                        <div className="col-3 mb-2">
                                                                            <FormControl component="fieldset">
                                                                                <FormLabel id="demo-row-radio-buttons-group-label">
                                                                                    Tipo
                                                                                    de
                                                                                    Parada
                                                                                </FormLabel>
                                                                                <div className="row">
                                                                                    <div className="col-6 mb-2">
                                                                                        <FormControlLabel
                                                                                            value="carga"
                                                                                            name="carga"
                                                                                            // disabled={form.concluded && isCopy !== "true"}
                                                                                            onChange={(
                                                                                                event
                                                                                            ) =>
                                                                                                handleFormChange(
                                                                                                    event,
                                                                                                    index,
                                                                                                    "carga"
                                                                                                )
                                                                                            }
                                                                                            // control={<Checkbox value={form.typeCarga && form.typeCarga}  />}
                                                                                            control={
                                                                                                <Checkbox
                                                                                                    value={
                                                                                                        form
                                                                                                            .operation[0] &&
                                                                                                        form
                                                                                                            .operation[0]
                                                                                                    }
                                                                                                    checked={
                                                                                                        form
                                                                                                            .operation[1] ===
                                                                                                            "carga" ||
                                                                                                        form
                                                                                                            .operation[0] ===
                                                                                                            "carga"
                                                                                                            ? true
                                                                                                            : false
                                                                                                    }
                                                                                                />
                                                                                            }
                                                                                            label="Carga"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="col-6 mb-2">
                                                                                        <FormControlLabel
                                                                                            value="descarga"
                                                                                            name="descarga"
                                                                                            // disabled={form.concluded && isCopy !== "true"}
                                                                                            onChange={(
                                                                                                event
                                                                                            ) =>
                                                                                                handleFormChange(
                                                                                                    event,
                                                                                                    index,
                                                                                                    "descarga"
                                                                                                )
                                                                                            }
                                                                                            // control={<Checkbox value={form.typeDescarga && form.typeDescarga}  />}
                                                                                            control={
                                                                                                <Checkbox
                                                                                                    value={
                                                                                                        form
                                                                                                            .operation[1] &&
                                                                                                        form
                                                                                                            .operation[1]
                                                                                                    }
                                                                                                    checked={
                                                                                                        form
                                                                                                            .operation[1] ===
                                                                                                            "descarga" ||
                                                                                                        form
                                                                                                            .operation[0] ===
                                                                                                            "descarga"
                                                                                                            ? true
                                                                                                            : false
                                                                                                    }
                                                                                                />
                                                                                            }
                                                                                            label="Descarga"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </FormControl>
                                                                        </div>

                                                                        <div className="col-6 mb-2">
                                                                            <FormGroup>
                                                                                {/* <FormControlLabel style={{color: 'red'}} control={<Switch name="verify" 
                                                                                                checked={form.verify ? true : false} 
                                                                                                onChange={event => handleFormChange(event, index)} />} 
                                                                                                label="Motorista realizou a carga ou a descarga ?" /> */}
                                                                            </FormGroup>
                                                                        </div>

                                                                        <div
                                                                            className="col-1 mb-2"
                                                                            direction="row"
                                                                        >
                                                                            <div>
                                                                                <FormGroup>
                                                                                    <Stack
                                                                                        spacing={
                                                                                            1
                                                                                        }
                                                                                    >
                                                                                        <IconButton
                                                                                            size="large"
                                                                                            onClick={() =>
                                                                                                duplicateForm(
                                                                                                    index
                                                                                                )
                                                                                            }
                                                                                            color="primary"
                                                                                            aria-label="duplicate"
                                                                                        >
                                                                                            <ContentCopyIcon />
                                                                                        </IconButton>
                                                                                    </Stack>
                                                                                </FormGroup>
                                                                            </div>
                                                                            <div>
                                                                                <FormGroup>
                                                                                    <Stack
                                                                                        spacing={
                                                                                            1
                                                                                        }
                                                                                    >
                                                                                        <IconButton
                                                                                            size="large"
                                                                                            onClick={(
                                                                                                e
                                                                                            ) => {
                                                                                                deleteItem(
                                                                                                    form,
                                                                                                    index
                                                                                                );
                                                                                            }}
                                                                                            color="error"
                                                                                            aria-label="delete"
                                                                                        >
                                                                                            <DeleteForeverIcon />
                                                                                        </IconButton>
                                                                                    </Stack>
                                                                                </FormGroup>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="row">
                                                                        <div className="col-4">
                                                                            <label
                                                                                htmlFor="cnpjLabel"
                                                                                className="form-label"
                                                                            >
                                                                                CNPJ
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                name="cpf_cnpj"
                                                                                // disabled={form.concluded && isCopy !== "true"}
                                                                                onChange={(
                                                                                    event
                                                                                ) => {
                                                                                    buscarCNPJBancoClient(event.target.value,index);
                                                                                    handleFormChange(event,index);
                                                                                }}
                                                                                value={
                                                                                    form.cpf_cnpj &&
                                                                                    form.cpf_cnpj
                                                                                }
                                                                                className="form-control"
                                                                                id="cnpj"
                                                                                placeholder=""
                                                                            />
                                                                        </div>

                                                                        <div className="col-8">
                                                                            <label
                                                                                htmlFor="nomeLabel"
                                                                                className="form-label"
                                                                            >
                                                                                Nome
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                // disabled={form.concluded && isCopy !== "true"}
                                                                                name="name"
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    handleFormChange(
                                                                                        event,
                                                                                        index
                                                                                    )
                                                                                }
                                                                                value={
                                                                                    form.name &&
                                                                                    form.name
                                                                                }
                                                                                className="form-control"
                                                                                id="name"
                                                                                placeholder=""
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="row">
                                                                        <div className="col-2">
                                                                            <label
                                                                                htmlFor="cepLabel"
                                                                                className="form-label"
                                                                            >
                                                                                CEP
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                name="cep"
                                                                                // disabled={form.concluded && isCopy !== "true"}
                                                                                onChange={(
                                                                                    event
                                                                                ) => {
                                                                                    buscarCepPaying(
                                                                                        event
                                                                                            .target
                                                                                            .value,
                                                                                        index
                                                                                    );
                                                                                    handleFormChange(
                                                                                        event,
                                                                                        index
                                                                                    );
                                                                                }}
                                                                                value={
                                                                                    form.cep &&
                                                                                    form.cep
                                                                                }
                                                                                maxLength={
                                                                                    10
                                                                                }
                                                                                className="form-control"
                                                                                id="cep"
                                                                                placeholder=""
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label
                                                                                htmlFor="addressLabel"
                                                                                className="form-label"
                                                                            >
                                                                                Endereço
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                // disabled={form.concluded && isCopy !== "true"}
                                                                                name="logradouro"
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    handleFormChange(
                                                                                        event,
                                                                                        index
                                                                                    )
                                                                                }
                                                                                value={
                                                                                    form.logradouro &&
                                                                                    form.logradouro
                                                                                }
                                                                                className="form-control"
                                                                                id="address"
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-1">
                                                                            <label
                                                                                htmlFor="numberLabel"
                                                                                className="form-label"
                                                                            >
                                                                                N.º
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                // disabled={form.concluded && isCopy !== "true"}
                                                                                name="number"
                                                                                onChange={(
                                                                                    event
                                                                                ) => {
                                                                                    handleFormChange(
                                                                                        event,
                                                                                        index
                                                                                    );
                                                                                    consultStreetByStreet(
                                                                                        index
                                                                                    );
                                                                                }}
                                                                                value={
                                                                                    form.number &&
                                                                                    form.number
                                                                                }
                                                                                className="form-control"
                                                                                id="numberAddress"
                                                                            />
                                                                        </div>

                                                                        <div className="col-2">
                                                                            <label
                                                                                htmlFor="city"
                                                                                className="form-label"
                                                                            >
                                                                                Cidade
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                // disabled={form.concluded && isCopy !== "true"}
                                                                                name="city"
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    handleFormChange(
                                                                                        event,
                                                                                        index
                                                                                    )
                                                                                }
                                                                                value={
                                                                                    form.city &&
                                                                                    form.city
                                                                                }
                                                                                className="form-control"
                                                                                id="cityAddress"
                                                                                placeholder=""
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-1">
                                                                            <label
                                                                                htmlFor="stateInitialLabel"
                                                                                className="form-label"
                                                                            >
                                                                                Estado
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                // disabled={form.concluded && isCopy !== "true"}
                                                                                name="uf"
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    handleFormChange(
                                                                                        event,
                                                                                        index
                                                                                    )
                                                                                }
                                                                                value={
                                                                                    form.uf &&
                                                                                    form.uf
                                                                                }
                                                                                className="form-control"
                                                                                id="stateInitial"
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-2">
                                                                            <label
                                                                                htmlFor="stateInitialLabel"
                                                                                className="form-label"
                                                                            >
                                                                                Atualizar
                                                                            </label>
                                                                            {form.checkItemLocation ? (
                                                                                <Stack direction="row">
                                                                                    <Button
                                                                                        variant="contained"
                                                                                        size="small"
                                                                                        onClick={(
                                                                                            e
                                                                                        ) => {
                                                                                            consultStreetByStreet(
                                                                                                index
                                                                                            );
                                                                                        }}
                                                                                        color="success"
                                                                                        // disabled={form.concluded && isCopy !== "true"}
                                                                                        startIcon={
                                                                                            <CheckCircleOutlineIcon />
                                                                                        }
                                                                                    >
                                                                                        Atualizado!
                                                                                    </Button>
                                                                                </Stack>
                                                                            ) : (
                                                                                <Stack direction="row">
                                                                                    <Button
                                                                                        variant="contained"
                                                                                        size="small"
                                                                                        onClick={(
                                                                                            e
                                                                                        ) => {
                                                                                            consultStreetByStreet(
                                                                                                index
                                                                                            );
                                                                                        }}
                                                                                        color="primary"
                                                                                        // disabled={form.concluded && isCopy !== "true"}
                                                                                        startIcon={
                                                                                            <LoopIcon />
                                                                                        }
                                                                                    >
                                                                                        Atualizar
                                                                                    </Button>
                                                                                </Stack>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="row">
                                                                        <div className="col-md-3">
                                                                            <label
                                                                                htmlFor="responsibleLabel"
                                                                                className="form-label"
                                                                            >
                                                                                Responsável
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                name="responsible_name"
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    handleFormChange(
                                                                                        event,
                                                                                        index
                                                                                    )
                                                                                }
                                                                                // disabled={form.concluded && isCopy !== "true"}
                                                                                value={
                                                                                    form.responsible_name &&
                                                                                    form.responsible_name
                                                                                }
                                                                                className="form-control"
                                                                                id="responsible"
                                                                            />
                                                                        </div>

                                                                        <div className="col-3">
                                                                            <label
                                                                                htmlFor="phoneRespLabel"
                                                                                className="form-label"
                                                                            >
                                                                                Telefone
                                                                                Responsável
                                                                            </label>
                                                                            <InputMask
                                                                                mask="(99) 99999-9999"
                                                                                id="phoneResp"
                                                                                className="form-control"
                                                                                name="responsible_phone"
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    handleFormChange(
                                                                                        event,
                                                                                        index
                                                                                    )
                                                                                }
                                                                                // disabled={form.concluded && isCopy !== "true"}
                                                                                value={
                                                                                    form.responsible_phone &&
                                                                                    form.responsible_phone
                                                                                }
                                                                                placeholder="(99) 99999-9999"
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-2">
                                                                            <label
                                                                                htmlFor="numberColetaLabel"
                                                                                className="form-label"
                                                                            >
                                                                                Número
                                                                                da
                                                                                coleta
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    handleFormChange(
                                                                                        event,
                                                                                        index
                                                                                    )
                                                                                }
                                                                                // disabled={form.concluded && isCopy !== "true"}
                                                                                name="number_collect"
                                                                                value={
                                                                                    form.number_collect &&
                                                                                    form.number_collect
                                                                                }
                                                                                className="form-control"
                                                                                id="numbercoleta"
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-2 mb-4">
                                                                            <label
                                                                                htmlFor="datacoletaLabel"
                                                                                className="form-label"
                                                                            >
                                                                                Data
                                                                                da
                                                                                Coleta
                                                                            </label>
                                                                            <input
                                                                                type="date"
                                                                                name="date_operation"
                                                                                // disabled={form.concluded && isCopy !== "true"}
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    handleFormChange(
                                                                                        event,
                                                                                        index
                                                                                    )
                                                                                }
                                                                                value={
                                                                                    form.date_operation &&
                                                                                    form.date_operation
                                                                                }
                                                                                className="form-control"
                                                                                id="datacoleta"
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-2 mb-4">
                                                                            <label
                                                                                htmlFor="horacoletaLabel"
                                                                                className="form-label"
                                                                            >
                                                                                Hora
                                                                                da
                                                                                Coleta
                                                                            </label>

                                                                            <InputMask
                                                                                mask="99:99"
                                                                                id="phoneResp"
                                                                                className="form-control"
                                                                                name="time_operation"
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    handleFormChange(
                                                                                        event,
                                                                                        index
                                                                                    )
                                                                                }
                                                                                // disabled={form.concluded && isCopy !== "true"}
                                                                                value={
                                                                                    form.time_operation &&
                                                                                    form.time_operation
                                                                                }
                                                                                placeholder="99:99"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="row">
                                                                        <div className="col-md-2 mb-4">
                                                                            <label
                                                                                htmlFor="Latitude"
                                                                                className="form-label"
                                                                            >
                                                                                Latitude
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                name="latitude"
                                                                                disabled={
                                                                                    true
                                                                                }
                                                                                value={
                                                                                    form.latitude &&
                                                                                    form.latitude
                                                                                }
                                                                                className="form-control"
                                                                                id="latitude"
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-2 mb-4">
                                                                            <label
                                                                                htmlFor="Longitude"
                                                                                className="form-label"
                                                                            >
                                                                                Longitude
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                disabled={
                                                                                    true
                                                                                }
                                                                                name="time_operation"
                                                                                value={
                                                                                    form.longitude &&
                                                                                    form.longitude
                                                                                }
                                                                                className="form-control"
                                                                                id="longitude"
                                                                            />
                                                                        </div>

                                                                        {form.operation.includes("carga") && (
                                                                            <>
                                                                                <div style={{ marginLeft: "175px" }} className="col-md-2 mb-4">
                                                                                    <label htmlFor="Tipo" className="form-label"> Tipo </label>
                                                                                    <select
                                                                                        className="form-select"
                                                                                        onChange={(e) => {
                                                                                            const value = e.target.value || ""; 
                                                                                            const newFormFields = [...formFields];
                                                                                            newFormFields[index].type = value;
                                                                                            setFormFields(newFormFields);
                                                                                        }}
                                                                                        value={form.type && form.type}
                                                                                        aria-label=""
                                                                                    >
                                                                                        <option defaultValue="">Selecione</option>
                                                                                        <option value="01">01 - Granel Sólido</option>
                                                                                        <option value="02">02 - Granel líquido</option>
                                                                                        <option value="03">03 - Frigorificada</option>
                                                                                        <option value="04">04 - Conteinerizada</option>
                                                                                        <option value="05">05 - Carga Geral</option>
                                                                                        <option value="06">06 - Neogranel</option>
                                                                                        <option value="07">07 - Perigosa (granel sólido)</option>
                                                                                        <option value="08">08 - Perigosa (granel líquido)</option>
                                                                                        <option value="09">09 - Perigosa (carga frigorificada)</option>
                                                                                        <option value="10">10 - Perigosa (conteinerizada)</option>
                                                                                        <option value="11">11 - Perigosa (carga geral)</option>
                                                                                    </select>
                                                                                </div>

                                                                                <div className="col-md-4 mb-4">
                                                                                    <label htmlFor="descricao" className="form-label">
                                                                                        Descrição
                                                                                    </label>
                                                                                    <input
                                                                                        type="text"
                                                                                        name="descricao"
                                                                                        className="form-control"
                                                                                        value={form.descricao && form.descricao}
                                                                                        onChange={e => {
                                                                                            const value = e.target.value || ""; 
                                                                                            const newFormFields = [...formFields];
                                                                                            newFormFields[index].descricao = value;
                                                                                            setFormFields(newFormFields);
                                                                                        }}
                                                                                        placeholder="Descrição do ponto"
                                                                                    />
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>

                                                                    <div className="row">
                                                                        <div className="col-md-12 mb-2">
                                                                            <label
                                                                                htmlFor="observation"
                                                                                className="form-label"
                                                                            >
                                                                                Observação
                                                                            </label>
                                                                            <TextArea
                                                                                name="observation"
                                                                                value={
                                                                                    form.observation &&
                                                                                    form.observation
                                                                                }
                                                                                // disabled={form.concluded && isCopy !== "true"}
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    handleFormChange(
                                                                                        event,
                                                                                        index
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-2 ">
                                                                            {form.canhoto ? (
                                                                                <>
                                                                                    <div className="row">
                                                                                        <div className="col-md-6">
                                                                                            <label
                                                                                                htmlFor="datacoletaLabel"
                                                                                                className="form-label"
                                                                                            >
                                                                                                Canhoto
                                                                                            </label>
                                                                                            <CanhotoViewer
                                                                                                source={
                                                                                                    form.canhoto
                                                                                                }
                                                                                            />
                                                                                            <Button
                                                                                                variant="outlined"
                                                                                                onClick={(
                                                                                                    e
                                                                                                ) => {
                                                                                                    setReferenc(
                                                                                                        null
                                                                                                    );
                                                                                                    handleClickOpen(
                                                                                                        form.id
                                                                                                    );
                                                                                                    setOrigem(
                                                                                                        "Canhoto"
                                                                                                    );
                                                                                                }}
                                                                                            >
                                                                                                Editar
                                                                                            </Button>
                                                                                        </div>

                                                                                        <div className="col-md-4"></div>
                                                                                    </div>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <span
                                                                                        style={{
                                                                                            color: "red",
                                                                                        }}
                                                                                    >
                                                                                        Ainda
                                                                                        não
                                                                                        há
                                                                                        comprovante
                                                                                        de
                                                                                        entrega
                                                                                    </span>
                                                                                    <Button
                                                                                        variant="outlined"
                                                                                        onClick={(
                                                                                            e
                                                                                        ) => {
                                                                                            setReferenc(
                                                                                                null
                                                                                            );
                                                                                            handleClickOpen(
                                                                                                form.id
                                                                                            );
                                                                                            setOrigem(
                                                                                                "Canhoto"
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        Importar
                                                                                        Canhoto
                                                                                    </Button>
                                                                                </>
                                                                            )}
                                                                        </div>

                                                                        {/* <div className="col-md-4">
                                                                        {
                                                                            form.canhoto && !form.verify ? 
                                                                                <Box sx={{ width: '100%', maxWidth: 500, padding: 4, color: 'red' }}>
                                                                                    <Typography variant="h7" gutterBottom>
                                                                                        Este ponto de parada está pronto para ser verificado, por favor confirme com a empresa responsável e marque como verificada. 
                                                                                    </Typography>
                                                                                </Box>
                                                                            : 
                                                                            ""
                                                                        }
                                                                    </div> */}
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        </Box>
                                                    );
                                                })}
                                            <div className="row">
                                                <div className="col-8"></div>
                                                <div className="col-4">
                                                    <Button onClick={addFields}>
                                                        {" "}
                                                        + pontos de paradas{" "}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-signin mx-auto mb-4 mb-lg-6">
                                        <Card
                                            sx={{ padding: 2 }}
                                            className="mb-3"
                                            style={{ background: "#ffffff" }}
                                        >
                                            <h4 className="mb-3">Veículo</h4>
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <strong>
                                                        <label htmlFor="occupation" className="form-label" >
                                                            Tipo de Veículo
                                                        </label>
                                                    </strong>
                                                    <div className="list-container">
                                                        <div className="toppings-list-item">
                                                            <div className="left-section">
                                                                {renderCategories()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="row">
                                                <div className="col-md-4">
                                                    <strong>
                                                        <label htmlFor="occupation" className="form-label">
                                                            Tipo de
                                                            Carroceria
                                                        </label>
                                                    </strong>
                                                    <div className="col-md-6">
                                                        <div className="list-container">
                                                            <div className="toppings-list-item">
                                                                <div className="left-section">
                                                                    {renderCategoriesBodyWork()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row" style={{ marginTop: "2%" }}>
                                                <div className="col-4">
                                                    <label style={{ fontWeight: "bold" }} htmlFor="occupation" className="form-label">
                                                        Ocupação
                                                    </label>

                                                    <div className="col-md-5">
                                                        <select
                                                            className="form-select"
                                                            onChange={(e) =>
                                                                setOccupation(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            value={
                                                                occupation &&
                                                                occupation
                                                            }
                                                            aria-label=""
                                                        >
                                                            <option defaultValue="">
                                                                Selecione
                                                            </option>
                                                            <option value="Fracionado">
                                                                Fracionado{" "}
                                                            </option>
                                                            <option value="Dedicado">
                                                                Dedicado{" "}
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="col-6">
                                                    <div className="row">
                                                        <div className="col-6 ">
                                                            <label style={{ fontWeight: "bold" }} htmlFor="freeOfCharge" className="form-label">
                                                                Livre de Carga e
                                                                descarga
                                                            </label>
                                                            <div className="col-12 ">
                                                                <input
                                                                    type="radio"
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setFreeOfCharge(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    checked={
                                                                        freeOfCharge &&
                                                                        freeOfCharge ===
                                                                            "SIM"
                                                                    }
                                                                    value="SIM"
                                                                    className="btn-check my-2"
                                                                    name="freeOfCharge"
                                                                    id="btnradiofreeGargoyes"
                                                                    autoComplete="off"
                                                                />
                                                                <label
                                                                    className="btn btn-outline-primary"
                                                                    htmlFor="btnradiofreeGargoyes"
                                                                >
                                                                    SIM
                                                                </label>

                                                                <input
                                                                    type="radio"
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setFreeOfCharge(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    checked={
                                                                        freeOfCharge &&
                                                                        freeOfCharge ===
                                                                            "NAO"
                                                                    }
                                                                    value="NAO"
                                                                    className="btn-check my-2"
                                                                    name="freeOfCharge"
                                                                    id="btnradiofreeGargonop"
                                                                    autoComplete="off"
                                                                />
                                                                <label
                                                                    className="btn btn-outline-danger"
                                                                    htmlFor="btnradiofreeGargonop"
                                                                >
                                                                    NÃO
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    <div className="form-signin mx-auto mb-4 mb-lg-6">
                                        <Card
                                            sx={{ padding: 2 }}
                                            className="mb-3"
                                            style={{ background: "#ffffff" }}
                                        >
                                            <h4 className="mb-3">Motorista</h4>
                                            <div className="row">
                                                <div className="col-2">
                                                    <label
                                                        htmlFor="valueDriverInitial"
                                                        className="form-label"
                                                    >
                                                        Pagamento De:
                                                    </label>
                                                    <IntlCurrencyInput
                                                        currency="BRL"
                                                        config={currencyConfig}
                                                        placeholder="00.00"
                                                        onChange={
                                                            handleChangeInitial
                                                        }
                                                        value={
                                                            valueDriverInitial &&
                                                            valueDriverInitial
                                                        }
                                                        className="form-control"
                                                        id="valueDriverInitial"
                                                    />
                                                </div>
                                                <div className="col-2">
                                                    <label
                                                        htmlFor="valueDriverFinal"
                                                        placeholder="0,00"
                                                        className="form-label"
                                                    >
                                                        Pagamento Até:{" "}
                                                    </label>
                                                    <IntlCurrencyInput
                                                        currency="BRL"
                                                        config={currencyConfig}
                                                        placeholder="00.00"
                                                        onChange={
                                                            handleChangeFinal
                                                        }
                                                        value={
                                                            valueDriverFinal &&
                                                            valueDriverFinal
                                                        }
                                                        className="form-control"
                                                        id="valueDriverFinal"
                                                    />
                                                </div>
                                                <div className="col-2">
                                                    <label htmlFor="valueNegotiated" placeholder="0,00" className="form-label">
                                                        Valor Negociado:
                                                    </label>
                                                    <IntlCurrencyInput
                                                        currency="BRL"
                                                        config={currencyConfig}
                                                        placeholder="00.00"
                                                        onChange={handleChangeValueNegotiated}
                                                        value={valueNegotiated && valueNegotiated}
                                                        className="form-control"
                                                        id="valueNegotiated"
                                                        disabled={verifyPayment}
                                                    />

                                                    { verifyPayment && (
                                                        <small className="text-danger">
                                                        O status do lançamento financeiro não permite alteração!
                                                        </small>
                                                    )}
                                                    
                                                </div>
                                                <div class="col-2">
                                                    <label htmlFor="paymentCondition" class="form-label" placeholder="0,00" style={{ whiteSpace: 'nowrap' }}>
                                                        Condições de Pagamento:
                                                    </label>
                                                    <select disabled={verifyPayment} value={paymentCondition && paymentCondition} id="paymentCondition" className="form-select" onChange={handleChangePaymentCondition}>
                                                        <option value="">Selecione</option>
                                                        <option value="70/30">70%/30%</option>
                                                        <option value="80/20">80%/20%</option>
                                                        <option value="50/50">50%/50%</option>
                                                        <option value="0/100">0%/100%</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    <div className="form-signin mx-auto mb-4 mb-lg-6">
                                        <Card
                                            sx={{ padding: 2 }}
                                            className="mb-3"
                                            style={{ background: "#ffffff" }}
                                        >
                                            <h4 className="mb-3">Frete</h4>

                                            <div className="row">
                                                <div className="col-md-3">
                                                    <label
                                                        htmlFor="product"
                                                        className="form-label"
                                                    >
                                                        Produto
                                                    </label>
                                                    <input
                                                        type="text"
                                                        onChange={(e) =>
                                                            setProduct(
                                                                e.target.value
                                                            )
                                                        }
                                                        value={
                                                            product && product
                                                        }
                                                        className="form-control"
                                                        id="product"
                                                    />
                                                </div>
                                                <div className="col-3">
                                                    <label
                                                        htmlFor="seller"
                                                        className="form-label"
                                                    >
                                                        Vendedor
                                                    </label>
                                                    <input
                                                        type="text"
                                                        onChange={(e) =>
                                                            setSeller(
                                                                e.target.value
                                                            )
                                                        }
                                                        value={seller && seller}
                                                        disabled={
                                                            seller && seller
                                                        }
                                                        className="form-control"
                                                        id="seller"
                                                        placeholder=""
                                                    />
                                                </div>
                                                <div className="col-2">
                                                    <label
                                                        htmlFor="nameDriver"
                                                        className="form-label"
                                                    >
                                                        Motorista
                                                    </label>
                                                    <Autocomplete
                                                        id="chose-1"
                                                        size="small"
                                                        value={driverChose === "" ? "" : driverChose}
                                                        getOptionLabel={(
                                                            option
                                                        ) => option.name || ""}
                                                        options={[
                                                            {
                                                                name: "Não aplicar motorista",
                                                                cpf: "",
                                                                value: "",
                                                                id: "",
                                                                uid: "",
                                                            },
                                                            ...driversInFila,
                                                        ]}
                                                        isOptionEqualToValue={(
                                                            option,
                                                            value
                                                        ) =>
                                                            option.name ===
                                                            value.name
                                                        }
                                                        onChange={(
                                                            event,
                                                            value
                                                        ) =>
                                                            handleDriver(value)
                                                        }
                                                        clearOnBlur
                                                        noOptionsText="Nenhum Motorista com esse nome foi encontrado"
                                                        sx={{ width: "100%" }}
                                                        renderInput={(
                                                            params
                                                        ) => (
                                                            <TextField
                                                                {...params}
                                                                label=""
                                                            />
                                                        )}
                                                        renderOption={(
                                                            props,
                                                            option
                                                        ) => (
                                                            <li
                                                                {...props}
                                                                key={
                                                                    option.id ||
                                                                    "default"
                                                                }
                                                            >
                                                                {option.name &&
                                                                option.cpf
                                                                    ? `${
                                                                          option.name
                                                                      } - CPF: ${formatCPF(
                                                                          option.cpf
                                                                      )}`
                                                                    : option.name}
                                                            </li>
                                                        )}
                                                        filterOptions={(
                                                            options,
                                                            { inputValue }
                                                        ) => {
                                                            const normalizedInput =
                                                                inputValue.trim();
                                                            const normalizedCPFInput =
                                                                normalizedInput.replace(
                                                                    /\D/g,
                                                                    ""
                                                                ); // Remove todos os caracteres não numéricos

                                                            // Verifica se o inputValue é um número
                                                            const isNumber =
                                                                normalizedCPFInput !==
                                                                    "" &&
                                                                !isNaN(
                                                                    normalizedCPFInput
                                                                );

                                                            return options.filter(
                                                                (option) => {
                                                                    if (
                                                                        isNumber
                                                                    ) {
                                                                        // Se for um número, faça algo específico
                                                                        return option.cpf.includes(
                                                                            normalizedCPFInput
                                                                        );
                                                                    } else {
                                                                        // Se não for um número, faça a verificação normal
                                                                        const nameMatch =
                                                                            option.name
                                                                                ?.toLowerCase()
                                                                                .includes(
                                                                                    normalizedInput.toLowerCase()
                                                                                );
                                                                        return nameMatch;
                                                                    }
                                                                }
                                                            );
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-2">
                                                    <label
                                                        htmlFor="phoneRespContractFreigtage"
                                                        className="form-label"
                                                    >
                                                        Resp. contratação frete
                                                    </label>
                                                    <InputMask
                                                        mask="(99) 99999-9999"
                                                        className="form-control"
                                                        onChange={(e) =>
                                                            setPhoneRespContractFreigtage(
                                                                e.target.value
                                                            )
                                                        }
                                                        value={
                                                            phoneRespContractFreigtage &&
                                                            phoneRespContractFreigtage
                                                        }
                                                        placeholder="(99) 99999-9999"
                                                    />

                                                    {/* <input type="text" onChange={(e)=> setResponsibleContractFreigtage(e.target.value)} value={phoneRespContractFreigtage && phoneRespContractFreigtage} className="form-control" id="respContFreight" placeholder=""/> */}
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-2">
                                                    <label
                                                        htmlFor="weightCargo"
                                                        className="form-label"
                                                    >
                                                        Peso da Carga (Kg)
                                                    </label>
                                                    <IntlCurrencyInput
                                                        currency="BRL"
                                                        config={
                                                            currencyConfigKm
                                                        }
                                                        placeholder="00.00"
                                                        onChange={
                                                            handleChangeWeightCargo
                                                        }
                                                        value={
                                                            weightCargo &&
                                                            weightCargo
                                                        }
                                                        className="form-control"
                                                        id="weightCargo"
                                                    />
                                                    {/* <input type="text" onChange={(e)=> setWeightCargo(e.target.value)} value={weightCargo && weightCargo} className="form-control" id="weightCargo"/> */}
                                                </div>

                                                <div className="col-2">
                                                    <label
                                                        htmlFor="valueNF"
                                                        className="form-label"
                                                    >
                                                        Valor NF
                                                    </label>
                                                    <IntlCurrencyInput
                                                        currency="BRL"
                                                        config={currencyConfig}
                                                        placeholder="00.00"
                                                        onChange={
                                                            handleChangeValueNF
                                                        }
                                                        value={
                                                            valueNF && valueNF
                                                        }
                                                        className="form-control"
                                                        id="valueNF"
                                                    />
                                                    {/* <input type="number" onChange={(e)=> setValueNF(e.target.value)} value={valueNF && valueNF} className="form-control" id="valueNF" placeholder=""/> */}
                                                </div>

                                                <div className="col-2">
                                                    <label
                                                        htmlFor="valueFreightage"
                                                        className="form-label"
                                                    >
                                                        Valor do Frete
                                                    </label>
                                                    <IntlCurrencyInput
                                                        currency="BRL"
                                                        config={currencyConfig}
                                                        placeholder="00.00"
                                                        onChange={
                                                            handleChangeValueFreightage
                                                        }
                                                        value={
                                                            valueFreightage &&
                                                            valueFreightage
                                                        }
                                                        className="form-control"
                                                        id="valueFreightage"
                                                    />
                                                    {/* <input type="number" onChange={(e)=> setValueFreightage(e.target.value)} value={valueFreightage && valueFreightage} className="form-control" id="valueFreightage" placeholder=""/> */}
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    <div className="form-signin mx-auto mb-4 mb-lg-6">
                                        <Card
                                            sx={{ padding: 2 }}
                                            className="mb-3"
                                            style={{ background: "#ffffff" }}
                                        >
                                            <div className="form-signin mx-auto">
                                                <div className="col-12">
                                                    <h4 className="mb-3">
                                                        Dados da entrega
                                                    </h4>
                                                </div>
                                                <div className="row">
                                                    <div className="col-12">
                                                        <label
                                                            htmlFor="observation"
                                                            className="form-label"
                                                        >
                                                            Observação
                                                        </label>
                                                        <textarea
                                                            className="form-control"
                                                            onChange={(e) =>
                                                                setObservation(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            value={
                                                                observation &&
                                                                observation
                                                            }
                                                            id="observation"
                                                            rows="3"
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>

                                <div className="container">
                                    <div className="row">
                                        <div className="col-4"></div>
                                        <div className="col-4"></div>
                                        <div
                                            className="col-4"
                                            style={{
                                                display: "flex",
                                                gap: "10px",
                                            }}
                                        >
                                            <div
                                                className="btn-class-cadastrar"
                                                style={{ flex: 1 }}
                                            >
                                                <Link to={"/freightlist"}>
                                                    <BackButton />
                                                </Link>
                                            </div>

                                            {id &&
                                            (code === "04" || code === "05" || code === "06") ? (
                                                <div
                                                    className="btn-class-cadastrar"
                                                    style={{ flex: 1 }}
                                                >
                                                    {carregando ? (
                                                        <div
                                                            className="spinner-border text-danger"
                                                            role="status"
                                                        >
                                                            <span className="visually-hidden ">
                                                                Loading...
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="submit"
                                                            onClick={(e) =>
                                                                update(true)
                                                            }
                                                            className="w-100 btn btn-primary btn-cadastrar"
                                                        >
                                                            {"Finalizar"}
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                ""
                                            )}

                                            <div
                                                className="btn-class-cadastrar"
                                                style={{ flex: 1 }}
                                            >
                                                {carregando ? (
                                                    <div
                                                        className="spinner-border text-danger"
                                                        role="status"
                                                    >
                                                        <span className="visually-hidden ">
                                                            Loading...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="submit"
                                                        onClick={(e) =>
                                                            idVerify === null ||
                                                            idVerify ===
                                                                undefined
                                                                ? save()
                                                                : update(false)
                                                        }
                                                        className="w-100 btn btn-primary btn-cadastrar"
                                                    >
                                                        {"Salvar"}
                                                    </button>
                                                )}
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
                                                <i
                                                    class="fa fa-exclamation-triangle"
                                                    aria-hidden="true"
                                                ></i>
                                            </h1>
                                            <h1 id="titleInform">{title}</h1>
                                        </DialogTitle>
                                        <DialogContent>
                                            <DialogContentText id="alert-dialog-description">
                                                <h6> {msg} </h6>
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <button
                                                class="OK"
                                                type="button"
                                                onClick={handleClose}
                                                // className="btn btn-primary btn-cadastrar"
                                            >
                                                Ok
                                            </button>
                                        </DialogActions>
                                    </Dialog>
                                </div>

                                <div>
                                    <Dialog
                                        open={openDialog}
                                        keepMounted
                                        onClose={handleCloseDialog}
                                        aria-describedby="alert-dialog-slide-description"
                                    >
                                        <DialogTitle>{title}</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText id="alert-dialog-slide-description">
                                                {msg}
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleCloseDialog}>
                                                Cancelar
                                            </Button>
                                            <Button onClick={handleClickDialog}>
                                                OK
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </div>
                            </div>
                        </Box>
                    }
                />
            ) : (
                <Navigate to="/login" />
            )}
        </>
    );
}

export default Freight;
