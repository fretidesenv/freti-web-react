import React, { useEffect } from 'react';
import {
  Layout,
  Tabs,
  Card,
  Button,
  Row,
  Col
} from 'antd';
import {
  FileTextOutlined,
  CarOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import NewMiniDrawer from '../../../components/navMenu/menu-nav';
import InputMask from 'react-input-mask'
import freightService from '../../../service/freight.service';
import shipperService from '../../../service/shipper.service';
import driverService from '../../../service/driver.service';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import invoiceService from '../../../service/invoice.service';
import CompTableMdfe from '../../../components/table-mdfe/comp-table-mdfe';
import firebase from "../../../config/firebase";
import mdfeService from '../../../service/mdfe.service';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Utils from '../../../util/utils';
require("firebase/auth");

const { Content, Footer } = Layout;
const { TabPane } = Tabs;

export default function CadastroMdfe() {

    const { id } = useParams();

    const [serie, setSerie] = React.useState('');
    const [number, setNumber] = React.useState('');
    const [numberContract, setNumberContract] = React.useState('');
    const [cnpjIssuer, setCnpjIssuer] = React.useState('');
    const [corporateName, setCorporateName] = React.useState('');
    const [startState, setStartState] = React.useState('');
    const [endState, setEndState] = React.useState('');
    const [startData, setStartData] = React.useState('');
    const [customerService, setCustomerService] = React.useState('');
    const [cargoDescription, setCargoDescription] = React.useState('');
    const [totalValueCargo, setTotalValueCargo] = React.useState('');
    const [totalWeight, setTotalWeight] = React.useState('');
    const [unitOfMeasurement, setUnitOfMeasurement] = React.useState('');
    const [insuranceCompany, setInsuranceCompany] = React.useState('AKAD SEGUROS S.A.');
    const [insurancePolicy, setInsurancePolicy] = React.useState('27982025010621000407');
    const [insuranceCnpj, setInsuranceCnpj] = React.useState('14868712000131');
    const [insuranceRegistrationNumber, setInsuranceRegistrationNumber] = React.useState('');
    const [ciotNumber, setCiotNumber] = React.useState('');
    const [paymentReceipt, setPaymentReceipt] = React.useState('');
    const [documentResponsible, setDocumentResponsible] = React.useState('');
    const [documentNumberDriver, setDocumentNumberDriver] = React.useState('');
    const [nameDriver, setNameDriver] = React.useState('');
    const [cnhNumber, setCnhNumber] = React.useState('');
    const [uidDriver, setUidDriver] = React.useState('');
    const [typeTransport, setTypeTransport] = React.useState('Normal');
    const [modal, setModal] = React.useState('rodoviario');

    const [openPercurso, setOpenPercurso] = React.useState(false);
    const [percurso, setPercurso] = React.useState([{
        index: 1,  
        state: 'SP'
    }]);

    const db = firebase.firestore();

    const users = useSelector((state) => state.user);

    const [openXml, setOpenXml] = React.useState(false);

    const [invoices, setInvoices] = React.useState([]);

    const [invoicesSelected, setInvoicesSelected] = React.useState([
        {
            chave: '',
            valorNf: '',
            pesoB: '',
            pesoL: '',
            numeroNfe: ''
        }
    ]);


    const [reboques, setReboques] = React.useState([
        {
            numberPlate: '',//placa do reboque
            statePlate: '',//estado da placa
            rntrc: '',//registro nacional de transportadores rodoviários de cargas
            typeVehicle: '', //tipo de rodado
            typeBodywork: '',//tipo de carroceria
            grossWeight: ''//peso bruto total
        }
    ]);


    useEffect(() => {

        // Buscar os dados do frete
        
        if(id) {

            mdfeService.get(id)
            .then(mdfe => {

                // console.log(mdfe.data())

                var data = mdfe.data();

                setSerie(data.infoMdfe.serie)
                setNumber(data.infoMdfe.number)
                setNumberContract(data.infoMdfe.numberContract)
                setCorporateName(data.infoEmit.corporateName)
                setCnpjIssuer(data.infoEmit.cnpjIssuer)
                setStartState(data.infoTrip.startState)
                setEndState(data.infoTrip.endState)
                setStartData(data.infoTrip.startData)
                setModal(data.infoTrip.modal)
                setTypeTransport(data.infoTrip.typeTransport)

                setDocumentNumberDriver(data.vehicleDriver.documentNumberDriver)
                setNameDriver(data.vehicleDriver.nameDriver)
                setCnhNumber(data.vehicleDriver.cnhNumber)

                setCargoDescription(data.infoCargo.cargoDescription)
                setTotalValueCargo(data.infoCargo.totalValueCargo)
                setTotalWeight(data.infoCargo.totalWeight)
                setUnitOfMeasurement(data.infoCargo.unitOfMeasurement)

                setInsuranceCompany(data.securityCargo.insuranceCompany)
                setInsurancePolicy(data.securityCargo.insurancePolicy)
                setInsuranceRegistrationNumber(data.securityCargo.insuranceRegistrationNumber)
                setCiotNumber(data.fiscal.ciotNumber)

                setPaymentReceipt(data.receiptPayment.paymentReceipt)
                setDocumentResponsible(data.receiptPayment.documentResponsible)

                setInvoicesSelected(data.invoicesSelected)
                setPercurso(data.percurso)
                setReboques(data.reboques)
            }).catch(error=> {
                console.log(error)
            })

        } 

    //         freightService.getFreightById("S3mAuiXV3GO7xyqjaqKo")//1753212245954 - BEM FERTIL AGRONEGOCIOS LTDA	motorista = ANTONIO RAIMUNDO DA SILVA
    //         .then(async freight => {
                
    //             // console.log(freight.data());

    //             // var freightData = freight.data();
    //             // // Aqui você pode definir os estados com os dados recebidos
    //             // setNumberContract(freightData.numberSerial);
    //             // setStartState(freightData.firstDelivery.uf);
    //             // setEndState(freightData.lastDelivery.uf);
    //             // setUidDriver(freightData.freight.getDriverFreight.uidDriver) //Id do motorista
            
                
    //             // var shipper = await shipperService.getShipper(Utils.apenasNumerico(freightData.clientPayment.cnpj.trim()))
                
    //             // const embarc = shipper.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        
    //             // debugger
                
    //             // Buscar os dados do embarcador
    //             // shipperService.getShipper(freightData.clientPayment.cnpj)
    //             // .then(shipper => {
    //             //     console.log(shipper.data());
    //             //     var shi = shipper.data();
    
    //                 // Aqui você pode definir os estados com os dados recebidos
    //                 // setCnpjIssuer(embarc[0].dataPersonal.documentNumber);
    //                 // setCorporateName(embarc[0].dataPersonal.socialName);
    //                 // setSerie(embarc[0]?.mdfe.serie);
    //                 // setNumber(embarc[0]?.mdfe.number);
    
    //             // })
    //             // .catch(error => {
    //             //     console.error("Erro ao buscar os dados do embarcador:", error);
    //             // });
                
                
    
    //             // Buscar os dados do motorista
    //             // driverService.getDriverAvailableById(freightData.freight.getDriverFreight.uidDriver)
    //             driverService.getDriverAvailableById(freightData.freight.getDriverFreight.uidDriver)
    //             .then(driver => {
    //                 // console.log(driver.data());
    //                 var driverData = driver.data();
                    
    //                 setDocumentNumberDriver(driverData.personalData?.documentCpf ? driverData.personalData.documentCpf : '');
    //                 setNameDriver(driverData.personalData?.fullName);
    //                 setCnhNumber(driverData.personalData?.documentCnh ? driverData.personalData.documentCnh : '');
    
    //                 // Verifica se o motorista possui reboques
    //                 if (driverData.vehicle?.reboques.length === 0) {
    //                     // Se não houver reboques, adiciona um reboque vazio
    //                     setReboques([{
    //                         numberPlate: '',
    //                         statePlate: '',
    //                         rntrc: '',
    //                         typeVehicle: '',
    //                         typeBodywork: '',
    //                         grossWeight: ''
    //                     }]);
    //                 } else {
    
    //                     // Se houver reboques, define o estado com os dados dos reboques
    //                     const reboquesData = driverData.vehicle.reboques.map(reboque => ({
    //                         numberPlate: reboque.placaReboque   || '', // Verifica se a placa do reboque está definida
    //                         statePlate: reboque.ufReboque   || '', // Verifica se o estado da placa está definido
    //                         rntrc: reboque.rntrcReboque || '', // Verifica se o RNTRC está definido
    //                         typeVehicle: reboque.vehicleType || '', // Verifica se o tipo de veículo está definido
    //                         typeBodywork: reboque.TipoCarroceriaReboque || '', // Verifica se o tipo de carroceria está definido
    //                         grossWeight: reboque.pesoTaraReboque || '' // Verifica se o peso bruto total está definido
    //                     }));
    
    //                     const vehicleData = driverData.vehicle;
    //                     const vehicle = {
    //                         numberPlate: vehicleData.vehiclePlate,
    //                         statePlate: vehicleData.ufVeiculo,
    //                         rntrc: vehicleData.rntrc,
    //                         typeVehicle: vehicleData.vehicleType,
    //                         typeBodywork: vehicleData.bodyworkType,
    //                         grossWeight: vehicleData.pesoTara
    //                     };
    
    //                     // Cria uma nova lista com o veículo principal e todos os reboques
    //                     const allVehicles = [vehicle, ...reboquesData];
    
    //                     // Define o estado com a nova lista combinada
    //                     setReboques(allVehicles);
    
    //                 }
    
    //             }).catch(error => {
    //                 console.error("Erro ao buscar os dados do motorista:", error);
    //             });
    //         })
    //         .catch(error => {
    //             console.error("Erro ao buscar os dados do frete:", error);
    //         });

    //     }


    }, []);



    // Função para adicionar um novo reboque
    // const addReboque = () => {
    //     setReboques([...reboques, {
    //         numberPlate: '',
    //         statePlate: '',
    //         rntrc: '',
    //         typeRodado: '',
    //         typeCarroceria: '',
    //         grossWeight: ''
    //     }]);
    // };

    // Função para remover um reboque
    // const removeReboque = (index) => {
    //     const newReboques = [...reboques];
    //     newReboques.splice(index, 1);
    //     setReboques(newReboques);
    // };

    // Função para atualizar os dados de um reboque específico
    // const updateReboque = (index, field, value) => {
    //     const newReboques = [...reboques];
    //     newReboques[index][field] = value;
    //     setReboques(newReboques);
    // };

    // Função para salvar o MDF-e
    async function saveMdfe(){
        // Aqui você pode implementar a lógica para salvar o MDF-e
        console.log("MDF-e salvo com sucesso!");

        let shipper = {
            uid: users.uidShipper
        };

        let driver = {
            uid: uidDriver,
            nameDriver: nameDriver
        }

        let infoMdfe = {
            serie: serie,
            number: number, 
            numberContract: numberContract
        }

        let infoEmit = {
            cnpjIssuer: cnpjIssuer,
            corporateName: corporateName
        }

        let infoTrip = {
            modal: modal, 
            startState: startState,
            endState: endState,
            typeTransport: typeTransport,
            startData: startData,
        }
        let participant = {
            customerService: customerService
        }
        
        let vehicleDriver = {
            documentNumberDriver: documentNumberDriver,
            nameDriver: nameDriver,
            cnhNumber: cnhNumber
        }

        let infoCargo = {
            cargoDescription: cargoDescription,
            totalValueCargo: totalValueCargo,
            totalWeight: totalWeight,
            unitOfMeasurement: unitOfMeasurement
        }

        let securityCargo = {
            insuranceCompany: insuranceCompany,
            insuranceCnpj: insuranceCnpj,
            insurancePolicy: insurancePolicy,
            insuranceRegistrationNumber: insuranceRegistrationNumber
        }

        let fiscal = {
            ciotNumber: ciotNumber
        }

        let receiptPayment = {
            paymentReceipt: paymentReceipt,
            documentResponsible: documentResponsible
        }

        let audit = {
            dateInsert: new Date(),
            createBy: users.uid
        }

        const mdfeData = {
            infoMdfe: infoMdfe,
            infoMdfe: infoMdfe,
            infoEmit: infoEmit,
            infoTrip: infoTrip,
            participant: participant,
            vehicleDriver: vehicleDriver,
            infoCargo: infoCargo,
            securityCargo: securityCargo,
            fiscal: fiscal,
            receiptPayment: receiptPayment,            
            driver: driver,
            percurso: percurso, // Percurso deve ser salvo também
            reboques: reboques, // Reboques devem ser salvos também
            invoicesSelected: invoicesSelected, // Invoices selecionadas devem ser salvas também
            shipper: shipper,
            audit: audit
        };

        console.log("Dados do MDF-e:", mdfeData);

        await db
            .collection("mdfe")
            .add(mdfeData)
            .then(() => {
                console.log("MDF-e salvo com sucesso!");
                // Aqui você pode adicionar qualquer lógica adicional após salvar o MDF-e
            })
            .catch(error => {
                console.error("Erro ao salvar o MDF-e:", error);
            })
    }

    
    const handleFormChange = (index, field, value) => {
        const updatedReboques = [...reboques];
        updatedReboques[index][field] = value;
        setReboques(updatedReboques);
    }


    //Criar um handleChange para incoicesSelected
    const handleInvoicesSelectedChange = (index, field, value) => {
        const updatedInvoicesSelected = [...invoicesSelected];
        updatedInvoicesSelected[index][field] = value;
        setInvoicesSelected(updatedInvoicesSelected);
    }


    const handleClose = () => {
        setOpenXml(false);
    }
    const handleOpen = () => {
        
        setOpenXml(true);
        findNotaFiscal();
    }


    const findNotaFiscal = () => {

        invoiceService.getInvoices().then(response => {

            response.forEach(notaFiscal => {

                // console.log("notaFiscal.data()  : ", notaFiscal.data());

                invoices.push({
                    chave: notaFiscal.data().chave,
                    valorNf: notaFiscal.data().valorNF,
                    pesoB: notaFiscal.data().pesoB,
                    pesoL: notaFiscal.data().peso,
                    numeroNfe: notaFiscal.data().numeroNF
                });


            })
            
        }).catch(error => {
            console.error("Erro ao buscar a nota fiscal:", error);
        });

    }

    const rowSelection = {

        onChange: (selectedRowKeys, selectedRows) => {
            // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);


            setInvoicesSelected(selectedRows.map(row => ({
                chave: row.chave ? row.chave : '',
                valorNf: row.valorNf ? row.valorNf : '0',
                pesoB: row.pesoB ? row.pesoB : '0',
                pesoL: row.pesoL ? row.pesoL : '0',
                numeroNfe: row.numeroNfe ? row.numeroNfe : ''
            })));

        },
        getCheckboxProps: record => ({
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
        }),
    };

    const addIncoicesSelected = () => {
        // console.log("invoicesSelected : ", invoicesSelected);

        //Adicionar mais uma linha de invoiceSelected vazia
        setInvoicesSelected([...invoicesSelected, {
            cteNfe: '',
            chave: '',
            valorNf: '',
            pesoB: '',
            pesoL: '',
            numeroNfe: ''
        }]);
    }

    const addPercurso = () => {

        //quando adicionar percurso o index deve ser o tamanho do percurso + 1

        // e o state deve ser vazio
        setPercurso([...percurso, { index: percurso.length + 1, state: '' }]);

        // setPercurso([...percurso, {
        //     index: '',
        //     state: ''
        // }]);
    }

    const handlePercursoClose = () => {
        setOpenPercurso(false);
    }

    const handleRouteChange = (index, field, value) => {
        const updatePercurso = [...percurso];
        if( field === 'index') {
            updatePercurso[index][field] = index + 1; // Atualiza o índice para ser 1-based
        } else {
            updatePercurso[index][field] = value;
        }
        setPercurso(updatePercurso);
    }
    


  return (

    <>
     <NewMiniDrawer divOpen={ 

        <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '24px', backgroundColor: '#F2F2F2' }}>
          <Tabs
            defaultActiveKey="1"
            tabBarStyle={{ backgroundColor: '#F2F2F2' }}
            tabBarGutter={32}
            tabBarExtraContent={null}
            type="line"
            className="custom-tabs"
          >
            <TabPane tab="Dados do Emitente" key="1">
                <Card title={<><FileTextOutlined /> Informação do MDF-e </>} className="custom-card" style={{marginBottom: '10px'}}>
                  <Row gutter={16}>
                    <Col span={4}>
                      <div className="col-md-12">
                          <label htmlFor="serieMdfe" className="form-label">Série <span style={{ color: 'red' }}>*</span></label>
                           <input type="text"  
                              onChange={(e)=> setSerie(e.target.value)} 
                              value={serie && serie}  className={`form-control ${serie === '' ? 'empty-field' : ''}`}
                              id="serieMdfe"
                          />
                      </div>
                      
                    </Col>
                    <Col span={6}>
                      <div className="col-md-12">

                          <label htmlFor="numero" className="form-label">Número MDF <span style={{ color: 'red' }}>*</span></label>
                          <input type="text"  
                              onChange={(e)=> setNumber(e.target.value)} 
                              value={number && number}  className={`form-control ${number === '' ? 'empty-field' : ''}`}
                              id="number"
                          />

                      </div>
                    </Col>
                    <Col span={5}>
                          <label htmlFor="numberContract" className="form-label">Nº Contrato de Transporte <span style={{ color: 'red' }}>*</span></label>
                          <input type="text" 
                              onChange={(e)=> setNumberContract(e.target.value)} 
                              value={numberContract && numberContract}  className={`form-control ${numberContract === '' ? 'empty-field' : ''}`}
                              id="numberContract"
                          />
                    </Col>
                    
                  </Row>
                </Card>


              <Card title={<><FileTextOutlined /> Dados do Emitente</>} className="custom-card" style={{marginBottom: '10px'}}>
                  <Row gutter={16}>
                    <Col span={4}>
                      <div className="col-md-12">
                          <label htmlFor="cnpj" className="form-label">CNPJ <span style={{ color: 'red' }}>*</span></label>
                          <InputMask mask="99.999.999/9999-99" className="form-control" 
                          onChange={(e)=> setCnpjIssuer(e.target.value)} value={cnpjIssuer && cnpjIssuer}
                          id="cnpjIssuer" />
                      </div>
                      
                    </Col>
                    <Col span={6}>
                      <div className="col-md-12">

                          <label htmlFor="corporateName" className="form-label">Razão social <span style={{ color: 'red' }}>*</span></label>
                          <input type="text"  
                              onChange={(e)=> setCorporateName(e.target.value)} 
                              value={corporateName && corporateName}  className={`form-control ${corporateName === '' ? 'empty-field' : ''}`}
                              id="corporateName"
                          />

                      </div>
                    </Col>                    
                  </Row>
                  
              </Card>

              <Card title={<><FileTextOutlined /> Informações da Viagem</>} className="custom-card" style={{marginBottom: "10px"}}>

                <Row gutter={16}>
                  <Col span={4}>
                    <div className="col-md-12">
                        <label htmlFor="modal"  className="form-label">Modal <span style={{ color: 'red' }}>*</span></label>
                        <select className="form-select" value={modal && modal} onChange={(e)=> setModal(e.target.value)} id="formOfPayment" >
                            <option value="rodoviario">Rodoviário</option>
                        </select>
                    </div>
                  </Col>
                  <Col span={2}>
                      <div className="col-md-12">
                          <label htmlFor="startState" className="form-label">UF Início <span style={{ color: 'red' }}>*</span></label>
                          <input type="text"  
                              onChange={(e)=> setStartState(e.target.value)} 
                              value={startState && startState}  className={`form-control ${startState === '' ? 'empty-field' : ''}`}
                              id="startState"
                          />

                      </div>
                  </Col>
                  <Col span={2}>
                      <div className="col-md-12">

                        <label htmlFor="endState" className="form-label">UF Término <span style={{ color: 'red' }}>*</span></label>
                        <input type="text"   
                            onChange={(e)=> setEndState(e.target.value)} 
                            value={endState && endState}  className={`form-control ${endState === '' ? 'empty-field' : ''}`}
                            id="endState"
                        />
                      </div>
                  </Col>
                  <Col span={4}>
                        <div className="col-md-12">
                            <label htmlFor="TipodeTransporte" className="form-label">Tipo de Transporte <span style={{ color: 'red' }}>*</span></label>
                            <select className="form-select" value={typeTransport && typeTransport} onChange={(e)=> setTypeTransport(e.target.value)} id="formOfPayment" >
                                <option value="Normal">Normal</option>
                                <option value="Subcontratacao">Subcontratação</option>
                                <option value="Redespacho">Redespacho</option>3
                                <option value="Intermediario">Intermediário </option>
                            </select>
                        </div>
                  </Col>
                  <Col span={4}>
                        <div className="col-md-12">
                            <label htmlFor="datahorainicio" className="form-label">Data e Hora de Início <span style={{ color: 'red' }}>*</span></label>
                            <input type='datetime-local' onChange={(e)=> setStartData(e.target.value)} value={startData && startData} className='form-control'  id=""/>
                        </div>
                  </Col>
                  <Col span={4}>
                        <div className="col-md-12">
                            <label htmlFor="datahorainicio" className="form-label">Percurso <span style={{ color: 'red' }}>*</span></label>
                            <input type='button' className='form-control' onClick={(e) => setOpenPercurso(true)}  id="" value="Percurso"/>
                        </div>
                  </Col>
                </Row> 
              </Card>

              <Card title={<><FileTextOutlined /> Dados dos Participantes</>} className="custom-card" style={{marginBottom: '10px'}}>

                <Row gutter={16}>
                    <Col span={4}>
                        <div className="col-md-12">
                            <label htmlFor="customerService" className="form-label">Tomador do Serviço <span style={{ color: 'red' }}>*</span></label>
                            <select className="form-select"
                             value={customerService && customerService} 
                             onChange={(e)=> setCustomerService(e.target.value)}
                             id="formOfPayment" >
                                <option value="Remetente">Remetente</option>
                                <option value="Destinatário">Destinatário</option>
                                <option value="Outros">Outros</option>3
                            </select>
                        </div>
                    </Col> 
                  </Row> 

              </Card>
            </TabPane>

            <TabPane tab="Dados do Veículo" key="2">
              <Card title={<><CarOutlined /> Dados do Veículo</>} className="custom-card" style={{marginBottom: '10px'}}>
                    {
                        reboques.map((reboque, index) => (
                            <>
                                <h6 htmlFor="numberPlate" className="form-label" style={{marginTop: '20px'}}>{index == 0 ? "Veículo " : "Reboque " + index} <span style={{ color: 'red'}}>*</span></h6>
                                <Row gutter={16}>
                                    <Col span={4}>
                                        <div className="col-md-12">
                                            <label htmlFor="numberPlate" className="form-label">Placa do Veículo <span style={{ color: 'red' }}>*</span></label>
                                            <input type="text"  
                                                onChange={(e)=> handleFormChange(index, 'numberPlate', e.target.value)} 
                                                value={reboque.numberPlate && reboque.numberPlate}  className={`form-control ${reboque.numberPlate === '' ? 'empty-field' : ''}`}
                                                id="numberPlate"
                                            />

                                        </div>
                                    </Col>
                                    <Col span={2}>
                                        <div className="col-md-12">
                                            <label htmlFor="statePlate" className="form-label">UF da Placa <span style={{ color: 'red' }}>*</span></label>
                                            <input type="text"  
                                                onChange={(e)=>handleFormChange(index, 'statePlate', e.target.value)} 
                                                value={reboque.statePlate && reboque.statePlate}  className={`form-control ${reboque.statePlate === '' ? 'empty-field' : ''}`}
                                                id="statePlate"
                                            />

                                        </div>
                                    </Col>
                                    <Col span={2}>
                                        <div className="col-md-12">

                                        <label htmlFor="rntrc" className="form-label">RNTRC <span style={{ color: 'red' }}>*</span></label>
                                        <input type="text"  
                                            onChange={(e)=> handleFormChange(index, 'rntrc', e.target.value)} 
                                            value={reboque.rntrc && reboque.rntrc}  className={`form-control ${reboque.rntrc === '' ? 'empty-field' : ''}`}
                                            id="rntrc"
                                        />
                                        </div>
                                    </Col>
                                    {
                                        reboque.typeVehicle ? 
                                             <Col span={4}>
                                            <div className="col-md-12">
                                                <label htmlFor="typeVehicle" className="form-label">Tipo de veículo <span style={{ color: 'red' }}>*</span></label>
                                                    <select className="form-select" id="formOfPayment" value={reboque.typeVehicle && reboque.typeVehicle}  onChange={(e)=> handleFormChange(index, 'typeVehicle', e.target.value)} aria-label="">
                                                        <option defaultValue="Selecione">Selecione</option>
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
                                        </Col>
                                        : 
                                        ""
                                    }
                                   
                            

                                </Row>
                                <Row gutter={16}>
                                    <Col span={4}>
                                            <div className="col-12" >
                                            <label htmlFor="bodyworkType"  className="form-label">Tipo Carroceria</label>

                                            <select className="form-select" id="typeBodywork" value={reboque.typeBodywork && reboque.typeBodywork}  onChange={(e)=> handleFormChange(index, 'typeBodywork', e.target.value)} aria-label="">
                                                <option defaultValue="Selecione">Selecione</option>
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
                                        </Col>
                                        <Col span={4}>
                                            <div className="col-md-12">
                                                <label htmlFor="grossWeight" className="form-label">Peso Bruto Total <span style={{ color: 'red' }}>*</span></label>
                                                <input type="text"  
                                                onChange={(e)=> handleFormChange(index, 'grossWeight', e.target.value)} 
                                                value={reboque.grossWeight && reboque.grossWeight}  className={`form-control ${reboque.grossWeight === '' ? 'empty-field' : ''}`}
                                                id="grossWeight"
                                            />
                                            </div>
                                        </Col>
                                </Row>
                            </>
                        ))
                    }

              </Card>
            
              <Card title={<><CarOutlined /> Dados dos Condutores</>} className="custom-card" style={{marginBottom: '10px'}}>

              <Row gutter={16}>
                    <Col span={4}>
                        <div className="col-md-12">
                            <label htmlFor="documentNumberDriver" className="form-label">CPF do Motorista <span style={{ color: 'red' }}>*</span></label>
                            <input type="text"  
                                onChange={(e)=> setDocumentNumberDriver(e.target.value)} 
                                value={documentNumberDriver && documentNumberDriver}  className={`form-control ${documentNumberDriver === '' ? 'empty-field' : ''}`}
                                id="documentNumberDriver"
                            />

                        </div>
                    </Col>
                    <Col span={4}>
                        <div className="col-md-12">
                            <label htmlFor="nameDriver" className="form-label">Nome Completo <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" 
                                onChange={(e)=> setNameDriver(e.target.value)} 
                                value={nameDriver && nameDriver}  className={`form-control ${nameDriver === '' ? 'empty-field' : ''}`}
                                id="nameDriver"
                            />

                        </div>
                    </Col>
                    <Col span={4}>
                        <div className="col-md-12">

                          <label htmlFor="cnhNumber" className="form-label">CNH <span style={{ color: 'red' }}>*</span></label>
                          <input type="text"   
                              onChange={(e)=> setCnhNumber(e.target.value)} 
                              value={cnhNumber && cnhNumber}  className={`form-control ${cnhNumber === '' ? 'empty-field' : ''}`}
                              id="cnhNumber"
                          />
                        </div>
                    </Col>
                    
                  </Row>

              </Card>
            </TabPane>

           <TabPane tab="Documentos Fiscais" key="3">
                <Card
                    title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                        <InfoCircleOutlined style={{ marginRight: 8 }} />
                        Documentos Fiscais Vinculados
                        </div>
                        <div>
                        <Button onClick={handleOpen} type="primary" style={{ marginRight: 8 }}>
                            Importar XML
                        </Button>
                        <Button onClick={addIncoicesSelected} type="primary" style={{ background: "red" }}>
                            Adicionar Manualmente
                        </Button>
                        </div>
                    </div>
                    }
                    className="custom-card"
                    style={{ marginBottom: '10px' }}
                >
                    {
                    invoicesSelected.map((invoice, index) => (
                        <Row gutter={16} key={index}>
                        <Col span={4}>
                            <div className="col-md-12">
                            <label htmlFor="chave" className="form-label">Chave <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                onChange={(e) => handleInvoicesSelectedChange(index, 'chave', e.target.value)}
                                value={invoice.chave || ''}
                                className={`form-control ${invoice.chave === '' ? 'empty-field' : ''}`}
                                id="chave"
                            />
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="col-md-12">
                            <label htmlFor="numeroNfe" className="form-label">Numero <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                onChange={(e) => handleInvoicesSelectedChange(index, 'numeroNfe', e.target.value)}
                                value={invoice.numeroNfe || ''}
                                className={`form-control ${invoice.numeroNfe === '' ? 'empty-field' : ''}`}
                                id="numeroNfe"
                            />
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="col-md-12">
                            <label htmlFor="valorNf" className="form-label">Valor <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                onChange={(e) => handleInvoicesSelectedChange(index, 'valorNf', e.target.value)}
                                value={invoice.valorNf || ''}
                                className={`form-control ${invoice.valorNf === '' ? 'empty-field' : ''}`}
                                id="valorNf"
                            />
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="col-md-12">
                            <label htmlFor="pesoL" className="form-label">Peso Liquído <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                onChange={(e) => handleInvoicesSelectedChange(index, 'pesoL', e.target.value)}
                                value={invoice.pesoL || ''}
                                className={`form-control ${invoice.pesoL === '' ? 'empty-field' : ''}`}
                                id="pesoL"
                            />
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="col-md-12">
                            <label htmlFor="pesoL" className="form-label">Peso Bruto <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                onChange={(e) => handleInvoicesSelectedChange(index, 'pesoB', e.target.value)}
                                value={invoice.pesoB || ''}
                                className={`form-control ${invoice.pesoB === '' ? 'empty-field' : ''}`}
                                id="pesoB"
                            />
                            </div>
                        </Col>
                        </Row>
                    ))
                    }

                    {/* Rodapé com totalizadores */}
                    {(() => {
                    const getTotalizadores = (invoices) => {
                        const totalPesoB = invoices.reduce((sum, item) => {
                        const pesoB = parseFloat((item.pesoB || '0').toString().replace(',', '.'));
                        return sum + (isNaN(pesoB) ? 0 : pesoB);
                        }, 0);

                        const totalPesoL = invoices.reduce((sum, item) => {
                        const pesoL = parseFloat((item.pesoL || '0').toString().replace(',', '.'));
                        return sum + (isNaN(pesoL) ? 0 : pesoL);
                        }, 0);

                        const totalValor = invoices.reduce((sum, item) => {
                        const valor = parseFloat((item.valorNf || '0').toString().replace(',', '.'));
                        return sum + (isNaN(valor) ? 0 : valor);
                        }, 0);

                        return {
                        totalPesoB: totalPesoB.toFixed(2),
                        totalPesoL: totalPesoL.toFixed(2),
                        totalValor: totalValor.toFixed(2)
                        };
                    };

                    const { totalPesoB, totalPesoL, totalValor } = getTotalizadores(invoicesSelected);

                    return (
                        <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                        <Row gutter={16}>
                            <Col span={4}></Col>
                            <Col span={4}></Col>
                            <Col span={4}><strong>Total Valor:</strong> R$ {totalValor}</Col>
                            <Col span={4}><strong>Total Peso Líquido:</strong> {totalPesoL}</Col>
                            <Col span={4}><strong>Total Peso Bruto:</strong> {totalPesoB}</Col>
                        </Row>
                        </div>
                    );
                    })()}

                </Card>
                </TabPane>
            <TabPane tab="Demais Informações" key="4">
              
              <Card title={<><InfoCircleOutlined /> Informações da Carga</>} className="custom-card" style={{marginBottom: '10px'}}>

                  <Row gutter={16}>
                    <Col span={4}>
                        <div className="col-md-12">
                            <label htmlFor="cargoDescription" className="form-label">Descrição da Carga <span style={{ color: 'red' }}>*</span></label>
                            <input type="text"    
                                onChange={(e)=> setCargoDescription(e.target.value)} 
                                value={cargoDescription && cargoDescription}  className={`form-control ${cargoDescription === '' ? 'empty-field' : ''}`}
                                id="cargoDescription"
                            />

                        </div>
                    </Col>
                    <Col span={4}>
                        <div className="col-md-12">
                            <label htmlFor="totalValueCargo" className="form-label">Valor Total da Carga <span style={{ color: 'red' }}>*</span></label>
                            <input type="text"   
                                onChange={(e)=> setTotalValueCargo(e.target.value)} 
                                value={totalValueCargo && totalValueCargo}  className={`form-control ${totalValueCargo === '' ? 'empty-field' : ''}`}
                                id="totalValueCargo"
                            />

                        </div>
                    </Col>
                    <Col span={4}>
                        <div className="col-md-12">

                          <label htmlFor="totalWeight" className="form-label">Peso Total <span style={{ color: 'red' }}>*</span></label>
                          <input type="text"  
                              onChange={(e)=> setTotalWeight(e.target.value)} 
                              value={totalWeight && totalWeight}  className={`form-control ${totalWeight === '' ? 'empty-field' : ''}`}
                              id="totalWeight"
                          />
                        </div>
                    </Col>

                    <Col span={4}>
                        <div className="col-md-12">

                          <label htmlFor="unitOfMeasurement" className="form-label">Unidade de Medida <span style={{ color: 'red' }}>*</span></label>

                            <select className="form-select" 
                                onChange={(e)=> setUnitOfMeasurement(e.target.value)} 
                                value={unitOfMeasurement && unitOfMeasurement} 
                                id="unitOfMeasurement">
                                <option value="01">KG</option>
                                <option value="02">TON</option>                                  
                            </select>
                        </div>
                    </Col>

                  </Row>

              </Card>

              <Card title={<><InfoCircleOutlined /> Seguro de Transporte </>} className="custom-card" style={{marginBottom: '10px'}}>

                  <Row gutter={16}>
                    <Col span={4}>
                        <div className="col-md-12">
                            <label htmlFor="insuranceCompany" className="form-label">Nome da Seguradora <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" 
                                onChange={(e)=> setInsuranceCompany(e.target.value)} 
                                value={insuranceCompany && insuranceCompany}  className={`form-control ${insuranceCompany === '' ? 'empty-field' : ''}`}
                                id="insuranceCompany"
                            />

                        </div>
                    </Col>
                    <Col span={4}>
                        <div className="col-md-12">
                            <label htmlFor="InsurancePolicy" className="form-label">Apólice de Seguro <span style={{ color: 'red' }}>*</span></label>
                            <input type="text"  
                                onChange={(e)=> setInsurancePolicy(e.target.value)} 
                                value={insurancePolicy && insurancePolicy}  className={`form-control ${insurancePolicy === '' ? 'empty-field' : ''}`}
                                id="InsurancePolicy"
                            />

                        </div>
                    </Col>
                    <Col span={4}>
                        <div className="col-md-12">
                            <label htmlFor="InsuranceCnpj" className="form-label">CNPJ <span style={{ color: 'red' }}>*</span></label>
                            <input type="text"  
                                onChange={(e)=> setInsuranceCnpj(e.target.value)} 
                                value={insuranceCnpj && insuranceCnpj}  className={`form-control ${insuranceCnpj === '' ? 'empty-field' : ''}`}
                                id="InsuranceCnpj"
                            />

                        </div>
                    </Col>

                    <Col span={4}>
                        <div className="col-md-12">
                            <label htmlFor="insuranceRegistrationNumber" className="form-label">Nº Averbação <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" 
                                onChange={(e)=> setInsuranceRegistrationNumber(e.target.value)} 
                                value={insuranceRegistrationNumber && insuranceRegistrationNumber}  className={`form-control ${insuranceRegistrationNumber === '' ? 'empty-field' : ''}`}
                                id="insuranceRegistrationNumber"
                            />

                        </div>
                    </Col>

                  </Row>

              </Card>
              <Card title={<><InfoCircleOutlined /> CIOT (se aplicável)</>} className="custom-card" style={{marginBottom: '10px'}}>

                  <Row gutter={16}>
                    <Col span={4}>
                        <div className="col-md-12">
                            <label htmlFor="ciotNumber" className="form-label">Número do CIOT <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" 
                                onChange={(e)=> setCiotNumber(e.target.value)} 
                                value={ciotNumber && ciotNumber}  className={`form-control ${ciotNumber === '' ? 'empty-field' : ''}`}
                                id="ciotNumber"
                            />

                        </div>
                    </Col>
                  </Row>

              </Card>
              <Card title={<><InfoCircleOutlined /> Dados do Responsável pelo Pagamento do Vale-Pedágio </>} className="custom-card" style={{marginBottom: '10px'}}>

                    <Row gutter={16}>
                        <Col span={5}>
                            <div className="col-md-12">
                                <label htmlFor="paymentReceipt" className="form-label">Nº Comprovante de Pagamento <span style={{ color: 'red' }}>*</span></label>
                                <input type="text" 
                                    onChange={(e)=> setPaymentReceipt(e.target.value)} 
                                    value={paymentReceipt && paymentReceipt}  className={`form-control ${paymentReceipt === '' ? 'empty-field' : ''}`}
                                    id="paymentReceipt"
                                />

                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="col-md-12">
                                <label htmlFor="documentResponsible" className="form-label">CNPJ da Empresa Responsável <span style={{ color: 'red' }}>*</span></label>
                                <input type="text"    
                                    onChange={(e)=> setDocumentResponsible(e.target.value)} 
                                    value={documentResponsible && documentResponsible}  className={`form-control ${documentResponsible === '' ? 'empty-field' : ''}`}
                                    id="documentResponsible"
                                />

                            </div>
                        </Col>

                    </Row>

              </Card>
            </TabPane>
          </Tabs>
        </Content>


        <Dialog open={openXml} 
            onClose={handleClose}
            fullWidth={"lg"}
            maxWidth={"lg"}
            >
            <DialogTitle>Lista de notas importadas </DialogTitle>
            <DialogContent>
                <div className="mb-4">
                    <DialogContentText>
                      Selecione o XML do MDF-e para importar os dados.
                    </DialogContentText>
                </div>

                <div className="form-signin mx-auto mb-12 mb-lg-12">
                    
                    <CompTableMdfe data={invoices} rowSelection={rowSelection}/>

                </div>
            </DialogContent>
            <DialogActions>
                {/* <Button onClick={handleClose}> Cencelar </Button> */}
                <Button onClick={handleClose}> Selecionar </Button>
            </DialogActions>
        </Dialog>

        <Dialog open={openPercurso} 
            onClose={handlePercursoClose}
            fullWidth={"lg"}
            maxWidth={"lg"}
            >
            <DialogTitle>Adicionar rotas do percurso </DialogTitle>
            <DialogContent>
                <div className="mb-4">
                    <DialogContentText>
                      Adicione a rota a esse percurso
                    </DialogContentText>
                </div>

                <Card title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <InfoCircleOutlined style={{ marginRight: 8 }} />
                            Adicionar Percurso
                        </div>
                        <div>
                            <Button onClick={addPercurso} type="primary" style={{ background: "red" }}>
                                Adicionar 
                            </Button>
                        </div>
                        </div>} className="custom-card" style={{marginBottom: '10px'}}>
                {

                    percurso.map((route, index) => (
                        <Row gutter={16} key={index}>
                            <Col span={4}>
                                <div className="col-md-12">
                                    <label htmlFor="ordenacao" className="form-label">Ordenação <span style={{ color: 'red' }}>*</span></label>
                                    <input type="text" 
                                        onChange={(e)=> handleRouteChange(index, 'index', e.target.value)} 
                                        value={route.index && route.index}  className={`form-control ${route.index === '' ? 'empty-field' : ''}`}
                                        id="ordenacao"
                                    />
                                </div>
                            </Col>
                            <Col span={4}>
                                <div className="col-md-12">
                                    <label htmlFor="estado" className="form-label">Estado <span style={{ color: 'red' }}>*</span></label>
                                    <select className="form-select" 
                                        onChange={(e)=> handleRouteChange(index, 'state', e.target.value)} 
                                        value={route.state && route.state}  
                                        id="estado">
                                        <option value="SP">São Paulo</option>
                                        <option value="RJ">Rio de Janeiro</option>
                                        <option value="MG">Minas Gerais</option>
                                        <option value="RS">Rio Grande do Sul</option>
                                        <option value="SC">Santa Catarina</option>
                                        <option value="PR">Paraná</option>
                                        <option value="ES">Espírito Santo</option>
                                        <option value="BA">Bahia</option>
                                        <option value="PE">Pernambuco</option>
                                        <option value="CE">Ceará</option>
                                        <option value="MA">Maranhão</option>
                                        <option value="PI">Piauí</option>
                                        <option value="AL">Alagoas</option>
                                        <option value="SE">Sergipe</option>
                                        <option value="PB">Paraíba</option>
                                        <option value="RN">Rio Grande do Norte</option>
                                        <option value="GO">Goiás</option>
                                        <option value="DF">Distrito Federal</option>
                                        <option value="MT">Mato Grosso</option>
                                        <option value="MS">Mato Grosso do Sul</option>
                                        <option value="TO">Tocantins</option>
                                        <option value="AM">Amazonas</option>
                                        <option value="PA">Pará</option>
                                        <option value="AP">Amapá</option>
                                        <option value="RO">Rondônia</option>
                                        <option value="RR">Roraima</option>
                                        <option value="AC">Acre</option>                                        
                                    </select>
                                </div>
                            </Col>
                        </Row>
                    ))
                }

              </Card>
            </DialogContent>
            <DialogActions>
                <Button onClick={handlePercursoClose}> Cencelar </Button>
            </DialogActions>
        </Dialog>


        <Footer style={{ textAlign: 'right', padding: '16px 24px' }}>
          <Button danger style={{ marginRight: 8, borderColor: '#FF3100', color: '#FF3100' }}>Cancelar</Button>
          <Button type="primary" onClick={saveMdfe} style={{ backgroundColor: '#FF3100', borderColor: '#FF3100' }}>Salvar MDF-e</Button>
        </Footer>
      </Layout>
    
    
     }/>
    
    </>

  );
}