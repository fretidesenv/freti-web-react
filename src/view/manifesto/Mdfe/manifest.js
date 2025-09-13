import React, { useEffect, useState } from 'react';
import { Layout, Tabs, Card, Button, Row, Col, Tooltip, Spin } from 'antd';
import { FileTextOutlined, CarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import NewMiniDrawer from '../../../components/navMenu/menu-nav';
import { Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid } from '@mui/material';
import Utils from '../../../util/utils';
import CompTableMdfe from '../../../components/table-mdfe/comp-table-mdfe';
import invoiceService from '../../../service/invoice.service';
import mdfeService from '../../../service/mdfe.service';
import { useNavigate, useParams } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';
import firebase from '../../../../src/config/firebase';
import { format } from 'date-fns';
import RetornoMdfeModal from '../../../components/alert-mdfe/alert-mdfe-retorno';

require('firebase/auth')


const db = firebase.firestore();

export default function CadastroMdfe() {
const { Content, Footer } = Layout;
const { TabPane } = Tabs;

    const { id } = useParams();

    let navigate = useNavigate();

    // INFMDFe
    const [versao, setVersao] = useState("");
    const [idMDFe, setIdMDFe] = useState("");

    // ide
    const [cUF, setCUF] = useState(0);
    const [tpAmb, setTpAmb] = useState(1);
    const [tpEmit, setTpEmit] = useState(2);
    const [tpTransp, setTpTransp] = useState(1);
    const [mod, setMod] = useState(58);
    const [serie, setSerie] = useState(2);
    const [nMDF, setNMDF] = useState(1);
    const [cMDF, setCMDF] = useState("");
    const [cDV, setCDV] = useState(9);
    const [modal, setModal] = useState(1);
    const [dhEmi, setDhEmi] = useState("");
    const [tpEmis, setTpEmis] = useState(1);
    const [procEmi, setProcEmi] = useState("");
    const [verProc, setVerProc] = useState("");
    const [UFIni, setUFIni] = useState("");
    const [UFFim, setUFFim] = useState("");
    const [infMunCarrega, setInfMunCarrega] = useState([{ xMunCarrega: "", cMunCarrega: "" }]);
    const [infPercurso, setInfPercurso] = useState([]);
    const [dhIniViagem, setDhIniViagem] = useState("");
    const [indCanalVerde, setIndCanalVerde] = useState(1);
    const [indCarregaPosterior, setIndCarregaPosterior] = useState(1);

    // emitente
    const [emitCNPJ, setEmitCNPJ] = useState("");
    const [emitIE, setEmitIE] = useState("");
    const [emitXNome, setEmitXNome] = useState("");
    const [emitXFant, setEmitXFant] = useState("");

    const [emitEndereco, setEmitEndereco] = useState({
        xLgr: "",
        nro: "",
        xCpl: "",
        xBairro: "",
        cMun: "",
        xMun: "",
        CEP: "",
        UF: "",
        fone: "",
        email: ""
    });

    // modal / rodo
    const [versaoModal, setVersaoModal] = useState("");
    const [RNTRC, setRNTRC] = useState("");
    const [infCIOT, setInfCIOT] = useState([]);

    const [contratante, setContratante] = useState([{
        xNome: "",
        CNPJ: "",
        infContrato: {
            NroContrato: "",
            vContratoGlobal: 0 
        }
    }]);


    const [cInt, setCInt] = useState();
    const [placa, setPlaca] = useState();
    const [renavam, setRenavam] = useState();
    const [tara, setTara] = useState();
    const [capKG, setCapKg] = useState();
    const [capM3, setCapM3] = useState();
    const [cnpjProp, setCnpjProp] = useState();
    const [rntrcProd, setRntrcProp] = useState();
    const [xNomeProp, setXNomeProp] = useState();
    const [tpProp, setTpProp] = useState();
    const [xNomeCondutor, setXNomeCondutor] = useState();
    const [cpfCondutor, setCpfCondutor] = useState();
    const [tpRod, setTpRod] = useState();
    const [tpCar, setTpCar] = useState();
    const [ufVeiculo, setUfVeiculo] = useState("");
    const [ncm, setNcm] = useState("");


    // veicReboque
    const [veicReboque, setVeicReboque] = useState([
        {
            cInt: "",
            placa: "",
            RENAVAM: "",
            tara: 0,
            capKG: 0,
            capM3: 0,
            prop: {
                CNPJ: "",
                CPF: "",
                RNTRC: "",
                xNome: "",
                tpProp: 0
            },
            tpCar: "",
            UF: ""
        }
    ]);

    // infDoc
    const [infDocument, setInfDocument] = useState([
        {
            cMunDescarga: "",
            xMunDescarga: "",
            chNFe: '',
            valorNf: '',
            pesoB: '',
            pesoL: ''
        }
    ]);

    // prodPred
    const [tpCarga, setTpCarga] = useState("");
    const [xProd, setXProd] = useState("");
    const [cepCarrega, setCepCarrega] = useState("");
    const [cepDescarrega, setCepDescarrega] = useState("");

    //Seguro
    const [respSeg, setRespSeg] = useState("");
    const [CNPJSeguro, setCNPJSeguro] = useState("");
    const [xSeg, setXseg] = useState("");
    const [CNPJInfSeg, setCNPJInfSeg] = useState("");
    const [nApol, setNapol] = useState("");
    const [nAver, setNaver] = useState("");


    // tot
    const [qCTe, setQCTe] = useState(0);
    const [qNFe, setQNFe] = useState(1);
    const [qMDFe, setQMDFe] = useState(0);
    const [vCarga, setVCarga] = useState(0);
    const [cUnid, setCUnid] = useState("");
    const [qCarga, setQCarga] = useState(0);

    // Data Origin
    const [dataInclusao, setDataInclusao] = useState("");
    const [idDriver, setIdDriver] = useState("");
    const [idShipper, setIdShipper] = useState("");
    const [idFreight, setIdFreight] = useState("");
    const [numberFreight, setNumberFreight] = useState("");


    const [ambiente, setAmbiente] = useState(0);
    const [referencia, setReferencia] = useState(0);

    const [statusSefaz, setStatusSefaz] = useState("");
    const [statusMDFe, setStatusMDFe] = useState("");

    const [infPagXnome, setInfPagXnome] = useState("");
    const [infPagCnpj, setInfPagCnpj] = useState("");
    const [infPagCompTpComp, setInfPagCompTpComp] = useState("");
    const [infPagCompVComp, setInfPagCompVComp] = useState("");
    const [infPagVContrato, setInfPagVContrato] = useState("");
    const [infPagIndPag, setInfPagIndPag] = useState("");
    const [infPrazo, setInfPrazo] = useState("");
    const [infPrazoNParcela, setInfPrazoNParcela] = useState("");
    const [infPrazoDVenc, setInfPrazoDVenc] = useState("");
    const [infPrazoVParcela, setInfPrazoVParcela] = useState("");
    const [infPagCodBanco, setInfPagCodBanco] = useState("");
    const [infPagCodAgencia, setInfPagCodAgencia] = useState("");

    const [open, setOpen] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("success");
    const [loading, setLoading] = useState(false);

    const [openXml, setOpenXml] = useState(false);

    const [invoices, setInvoices] = useState([]);
    
    const handleClose = () => {
        setOpenXml(false);
    }

        const addIncoicesSelected = () => {
        // console.log("invoicesSelected : ", invoicesSelected);

        //Adicionar mais uma linha de invoiceSelected vazia
        setInfDocument([...infDocument, {
            cteNfe: '',
            chave: '',
            valorNf: '',
            pesoB: '',
            pesoL: '',
            numeroNfe: ''
        }]);
    }

    
    const handleFormChange = (index, field, value) => {
        const updatedReboques = [...veicReboque];
        if(field == "tpProp"){
            updatedReboques[index][field] = parseInt(value);
        } else {
            updatedReboques[index][field] = value;
        }
        
        setVeicReboque(updatedReboques);
    }

    const handleFormChangeContratante = (index, field, value) => {
        const updatedContratante = [...contratante];
        // updatedContratante[index][field] = value;

        if(field == "vContratoGlobal"){
            updatedContratante[index].infContrato.vContratoGlobal = value ? parseFloat(value) : 0;
        }else if (field == "NroContrato"){
            updatedContratante[index].infContrato.NroContrato = value + "";
        }else {
            updatedContratante[index][field] = value + "";
        }


        setContratante(updatedContratante);
    }

    const addItem = (setFunc, state) => {
        setFunc([...state, {}]);
    };



    useEffect(() => {

        if(id){

            console.log("ID DO MDFE")
            console.log(id)

            mdfeService.get(id).then(item=> {
                var mdfe = item.data();

                var ide = mdfe.infMDFe.ide;
                var emit = mdfe.infMDFe.emit; 
                var modal = mdfe.infMDFe.infModal;
                
                var doc = mdfe.infMDFe.infDoc;
                var prod = mdfe.infMDFe.prodPred;
                var seg = mdfe.infMDFe.seg[0];
                var tot = mdfe.infMDFe.tot;
                var dataOrigin = mdfe.infMDFe.dataOrigin;


                let dataEmiss = ide.dhEmi ? format(new Date(ide.dhEmi.seconds * 1000), 'yyyy-MM-dd') : "";
                let dataIniViagem = ide.dhIniViagem ? format(new Date(ide.dhIniViagem.seconds * 1000), 'yyyy-MM-dd') : "";

                //Iniciais
                setIdMDFe(mdfe.infMDFe.Id)
                setVersao(mdfe.infMDFe.versao)

                //Ide 
                setCUF(ide.cUF)
                setTpAmb(ide.tpAmb)
                setTpEmit(ide.tpEmit)
                setTpTransp(ide.tpTransp)
                setMod(ide.mod)
                setSerie(ide.serie)
                setNMDF(ide.nMDF)
                setCMDF(ide.cMDF)
                setCDV(ide.cDV)
                setModal(ide.modal)
                setDhEmi(dataEmiss)
                setTpEmis(ide.tpEmis)
                setProcEmi(ide.procEmi)
                setVerProc(ide.verProc)
                setUFIni(ide.UFIni)
                setUFFim(ide.UFFim)
                setInfMunCarrega(ide.infMunCarrega)
                setInfPercurso(ide.infPercurso)
                setDhIniViagem(dataIniViagem)
                // setIndCanalVerde(ide.indCanalVerde)
                setIndCarregaPosterior(ide.indCarregaPosterior)


                //Emi
                setEmitCNPJ(emit.CNPJ)
                setEmitIE(emit.IE)
                setEmitXNome(emit.xNome)
                setEmitXFant(emit.xFant)
                setEmitEndereco(emit.enderEmit)


                //infModal
                setVersaoModal(modal.versaoModal)
                setRNTRC(modal.rodo.infANTT.RNTRC)
                setInfCIOT(modal.rodo.infANTT.infCIOT)
                setContratante(modal.rodo.infANTT.infContratante)
                
                setInfPagXnome(modal.rodo.infANTT.infPag[0].xNome)
                setInfPagCnpj(modal.rodo.infANTT.infPag[0].CNPJ)
                setInfPagCompTpComp(modal.rodo.infANTT.infPag[0].Comp[0].tpComp)
                setInfPagCompVComp(modal.rodo.infANTT.infPag[0].Comp[0].vComp)
                setInfPagVContrato(modal.rodo.infANTT.infPag[0].vContrato)
                setInfPagIndPag(modal.rodo.infANTT.infPag[0].indPag)
                setInfPrazoNParcela(modal.rodo.infANTT.infPag[0].infPrazo[0].nParcela)
                setInfPrazoDVenc(modal.rodo.infANTT.infPag[0].infPrazo[0].dVenc)
                setInfPrazoVParcela(modal.rodo.infANTT.infPag[0].infPrazo[0].vParcela)
                setInfPrazo(modal.rodo.infANTT.infPag[0].infPrazo)
                setInfPagCodBanco(modal.rodo.infANTT.infPag[0].infBanc.codBanco)
                setInfPagCodAgencia(modal.rodo.infANTT.infPag[0].infBanc.codAgencia)


                // setVeicTracao(modal.rodo.veicTracao)
                setCInt(modal.rodo.veicTracao.cInt)
                setPlaca(modal.rodo.veicTracao.placa)
                setRenavam(modal.rodo.veicTracao.RENAVAM)
                setTara(modal.rodo.veicTracao.tara)
                setCapKg(modal.rodo.veicTracao.capKG)
                setCapM3(modal.rodo.veicTracao.capM3)
                setCnpjProp(modal.rodo.veicTracao.prop.CNPJ ? modal.rodo.veicTracao.prop.CNPJ : modal.rodo.veicTracao.prop.CPF)
                setRntrcProp(modal.rodo.veicTracao.prop.RNTRC)
                setXNomeProp(modal.rodo.veicTracao.prop.xNome)
                setTpProp(modal.rodo.veicTracao.prop.tpProp)
                setXNomeCondutor(modal.rodo.veicTracao.condutor[0].xNome)
                setCpfCondutor(modal.rodo.veicTracao.condutor[0].CPF)
                setTpRod(modal.rodo.veicTracao.tpRod)
                setTpCar(modal.rodo.veicTracao.tpCar)
                setUfVeiculo(modal.rodo.veicTracao.UF)
                setVeicReboque(modal.rodo.veicReboque)




                // console.log(doc.infMunDescarga[0])

                //InfDoc
                // setInvoicesSelected(doc.infMunDescarga)
                setInfDocument(doc?.infMunDescarga ? doc?.infMunDescarga : [])

                //ProdPred
                setTpCarga(prod.tpCarga)
                setXProd(prod.xProd)
                setNcm(prod.NCM)
                setCepCarrega(prod.infLotacao.infLocalCarrega.CEP)
                setCepDescarrega(prod.infLotacao.infLocalDescarrega.CEP)

                //seg
                setRespSeg(seg.infResp.respSeg)
                setCNPJSeguro(seg.infResp.CNPJ)
                setXseg(seg.infSeg.xSeg)
                setCNPJInfSeg(seg.infSeg.CNPJ)
                setNapol(seg.nApol)
                setNaver(seg.nAver)

                //Tot
                setQCTe(tot.qCTe)
                setQNFe(tot.qNFe)
                setQMDFe(tot.qMDFe)
                setVCarga(tot.vCarga)
                setCUnid(tot.cUnid)
                setQCarga(tot.qCarga)


                setDataInclusao(dataOrigin.dataInclusao)
                setIdDriver(dataOrigin.idDriver)
                setIdShipper(dataOrigin.idShipper)
                setIdFreight(dataOrigin.idFreight)
                setNumberFreight(dataOrigin.numberFreight)
                
                setAmbiente(mdfe.ambiente)
                setReferencia(mdfe.referencia)

                //retorno sefaz
                setStatusSefaz(mdfe?.retornoSefaz?.status === "autorizado" ? true : false);
                setStatusMDFe(mdfe.retornoSefaz.status);

            }).catch(error => {
                console.log(error);
            })


        }


    },[])


    function getPropVeiculo(){
        if(cnpjProp.length > 11){
           return {
                CNPJ: cnpjProp ? cnpjProp : "",
                RNTRC: rntrcProd ? rntrcProd : "",
                xNome: xNomeProp ? xNomeProp : "",
                tpProp: tpProp ? tpProp : 1
            }
        }else{
           return {
                CPF: cnpjProp ? cnpjProp : "",
                RNTRC: rntrcProd ? rntrcProd : "",
                xNome: xNomeProp ? xNomeProp : "",
                tpProp: tpProp ? tpProp : 0
            }
        }
    }


    // Função para salvar o MDF-e
    async function updateMdfe(){

        let dataEmissComSplit = dhEmi.split("-");
        var dataNovaEmissao = new Date(`${dataEmissComSplit[0]}/${dataEmissComSplit[1]}/${dataEmissComSplit[2]}`);

        let dataInicViagemComSplit = dhIniViagem.split("-");
        var dataInicioViagem = new Date(`${dataInicViagemComSplit[0]}/${dataInicViagemComSplit[1]}/${dataInicViagemComSplit[2]}`);

        
        var ide = {
            cUF: parseInt(cUF),
            tpAmb: parseInt(tpAmb),//ambiente 1 produção 2 homologação
            tpEmit: tpEmit, //tipo do emitente (1 – prestador de serviço, 2 – carga própria)
            tpTransp: tpTransp,// Tipo de transporte ETC, TAC, CTC
            mod: mod,//modelo do MDF-e (deve ser 58)
            serie: parseInt(serie),
            nMDF: parseInt(nMDF),
            cMDF: cMDF,//modulo gerado automaticamente
            cDV: cDV, //digito verificador do MDF-e, deve ser preenchido com o dígito verificador da chave de acesso do MDF-e
            modal: modal,//tipo de modal (01 a 05)
            dhEmi: dataNovaEmissao,
            tpEmis: tpEmis,
            procEmi: procEmi, //0 - emissão de MDF-e com aplicativo do contribuinte
            verProc: verProc,//Versão do processo de emissão. Informar a versão do aplicativo emissor de MDF-e
            UFIni: UFIni,
            UFFim: UFFim,
            infMunCarrega: infMunCarrega,
            infPercurso:  infPercurso,
            dhIniViagem: dataInicioViagem, //AAAA-MM-DDTHH:MM:DD TZD
            // indCanalVerde: indCanalVerde,
            indCarregaPosterior: indCarregaPosterior
        }

        var emit = {
            CNPJ: Utils.removerCaracteresEspeciais(emitCNPJ.trim()),
            IE: Utils.removerCaracteresEspeciais(emitIE),
            xNome: emitXNome,
            xFant: emitXFant,
            enderEmit: {
                xLgr: emitEndereco.xLgr,
                nro: emitEndereco.nro,
                xCpl: emitEndereco.xCpl,
                xBairro: emitEndereco.xBairro,
                cMun: emitEndereco.cMun + "", //Código do município (utilizar a tabela do IBGE), Caso não seja informado, será utilizado o do cadastro da empresa
                xMun: emitEndereco.xMun,
                CEP: Utils.apenasNumerico(emitEndereco.CEP),
                UF: emitEndereco.UF,
                fone: Utils.apenasNumerico(emitEndereco.fone),
                email: emitEndereco.email
            }
        }

        var infModal = {
            versaoModal: versaoModal,
            rodo: {
            infANTT: {
                RNTRC: RNTRC,//cadastro do motorista
                infCIOT: infCIOT,
                infContratante: contratante,
                infPag: [
                {
                  xNome: emitXNome,
                  CNPJ: Utils.removerCaracteresEspeciais(emitCNPJ.trim()),
                  Comp: [
                      {
                        tpComp: infPagCompTpComp,//Despesas (bancarias, meios de pagamento, outras)
                        vComp: parseFloat(infPagCompVComp),
                        // xComp: "string"
                      }
                    ],
                  vContrato: parseFloat(infPagVContrato),
                  // indAltoDesemp: 0,
                  indPag: infPagIndPag, //1 - Pagamento à Prazo
                  // vAdiant: 0,
                  // indAntecipaAdiant: 0,
                  infPrazo: [
                    {
                      nParcela: parseInt(infPrazoNParcela),
                      dVenc: infPrazoDVenc,
                      vParcela: parseFloat(infPrazoVParcela)
                    }
                  ],
                // tpAntecip: 0,
                  infBanc: {
                    codBanco: infPagCodBanco ? infPagCodBanco : "341",
                    codAgencia: infPagCodAgencia ? infPagCodAgencia : "0001",
                    // CNPJIPEF: "string",
                    // PIX: "string"
                  }
                }
              ]
            },
            veicTracao: {
                cInt: cInt ? cInt : "",
                placa: placa? placa : "",
                RENAVAM: renavam ? renavam : "",
                tara: tara ? parseFloat(tara) : 0,
                capKG: capKG ? parseFloat(capKG) : 0,
                capM3: capM3 ? parseFloat(capM3) : 0,
                prop: getPropVeiculo(),
                condutor: [
                    {
                    xNome: xNomeCondutor ? xNomeCondutor : "",
                    CPF: cpfCondutor ? cpfCondutor : ""
                    }
                ],
                tpRod: tpRod ? tpRod : "",
                tpCar: tpCar ? tpCar : "", 
                UF: ufVeiculo ? ufVeiculo : ""
            },
            veicReboque: veicReboque,
            },
        }


        var selectNFSe = [];

        infDocument.forEach(item => {

            selectNFSe.push({
                cMunDescarga: item.cMunDescarga ? item.cMunDescarga : "", 
                xMunDescarga: item.xMunDescarga ? item.xMunDescarga : "", 
                chNFe: item.chNFe ? item.chNFe : "",
                valorNf: item.valorNf ? item.valorNf : "",
                pesoB: item.pesoB ? item.pesoB : "",
                pesoL: item.pesoL ? item.pesoL : ""
            });

        });


        //Essa tag será enviada várias vezes, caso tenha mais de uma entrega ? 
        var infDoc = {
            infMunDescarga: selectNFSe
            // [
            //     {
            //       cMunDescarga: infDocument.cMunDescarga, //Pegar o coleta 
            //       xMunDescarga: infDocument.xMunDescarga, //Pegar o coleta
            //       infCTe: [
            //       ],
            //       infNFe: infDocument.infNFe,
                
            //       infMDFeTransp: [] //getInfoMdfeTransp(mdf),              
                
            //     }
            //   ]
        }

        var prodPred = {
            tpCarga: tpCarga ? tpCarga : "",
            xProd: xProd ? xProd.trim() : "",
            NCM: ncm ? ncm.trim() : "",
            infLotacao: 
            {
            infLocalCarrega: {
                CEP: cepCarrega ? cepCarrega.trim() : "",
            },
            infLocalDescarrega: {
                CEP: cepDescarrega ? cepDescarrega.trim() : "",
            }
            }
        }

        var seg = [
            {
            infResp: {
                respSeg: respSeg, //1 - Emitente do MDF-e 22 - Responsável pela contratação do serviço de transporte (contratante) Dados obrigatórios apenas no modal Rodoviário, depois da lei 11.442/07. Para os demais modais esta informação é opcional.
                CNPJ: CNPJSeguro ? CNPJSeguro : "", //cnpj do embarcador 
            },
            infSeg: {
                xSeg: xSeg ? xSeg : "",//o que está no MDF
                CNPJ: CNPJInfSeg ? CNPJInfSeg : ""
            },
                nApol: nApol ? nApol : "",//o que está no MDF
                nAver: nAver ? nAver : ""
            }
        ]


        let valorVCarga = parseFloat(
            vCarga.replace("R$", "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".")
        );

        console.log(valorVCarga); 

        var tot = {
            qCTe: 0,
            qNFe: selectNFSe.length > 0 ? selectNFSe.length : 0,
            qMDFe: 0,
            vCarga: valorVCarga,
            cUnid: cUnid,
            qCarga: qCarga
        } 

        var dataOrigin = {
            dataInclusao: dataInclusao ? dataInclusao : new Date(),
            idDriver: idDriver ? idDriver : "",
            idShipper: idShipper ? idShipper : "",
            idFreight: idFreight ? idFreight : "",
            numberFreight: numberFreight ? numberFreight : ""
        }

        var data = {
            infMDFe : {
                versao: versao,
                Id: idMDFe,
                ide: ide,
                emit: emit,
                infModal: infModal,
                infDoc: infDoc,
                prodPred: prodPred,
                seg: seg,
                tot: tot,
                dataOrigin: dataOrigin
            },
            ambiente: ambiente,
            referencia: referencia,

        }
        console.log("Objeto MDF-e")
        console.log(data)
        

        setLoading(true);

        await db.collection("tb_mdfe").doc(id)
            .update(data).then(item => {
            setTitle("Salvando MDF-e");
            setStatus("success");
            setMensagem("Manifesto salvo com sucesso");
            setOpen(true);  
            setLoading(false);
            setTimeout(() => {
                navigate("/listMdfe");
            }, 2000);
            
            }).catch(error => {
                setTitle("Erro ao salvar manifesto");
                setStatus("error");
                setMensagem("Erro ao enviar MDFe: " + error.message); 
                setOpen(true);
                setLoading(false);
            });

    }

   const rowSelection = {

        onChange: (selectedRowKeys, selectedRows) => {
            // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);


            setInfDocument(selectedRows.map(row => ({
                chNFe: row.chave ? row.chave : '',
                valorNf: row.valorNf ? row.valorNf : '0',
                pesoB: row.pesoB ? row.pesoB : '0',
                pesoL: row.pesoL ? row.pesoL : '0',
                cMunDescarga: row.codMunDescarga,  
                xMunDescarga: row.descMunDescarga 

            })));

        },
        getCheckboxProps: record => ({
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
        }),
    };

    const handleOpen = () => {
        
        setOpenXml(true);
        findNotaFiscal();
    }

    const findNotaFiscal = () => {

        invoiceService.getInvoices().then(response => {

            response.forEach(notaFiscal => {

                invoices.push({
                    chave: notaFiscal.data().chave,
                    valorNf: notaFiscal.data().valorNF,
                    pesoB: notaFiscal.data().pesoB,
                    pesoL: notaFiscal.data().peso,
                    numeroNfe: notaFiscal.data().numeroNF,
                    codMunDescarga: "", 
                    descMunDescarga: "" 
                });

            })
            
        }).catch(error => {
            console.error("Erro ao buscar a nota fiscal:", error);
        });

    }
    
    const handleInvoicesSelectedChange = (index, field, value) => {
        const updatedInvoicesSelected = [...infDocument];
        updatedInvoicesSelected[index][field] = value;
        setInfDocument(updatedInvoicesSelected);
    }



    useEffect(() => {
        const getTotalizadores = (invoices) => {
            const totalValor = invoices.reduce((sum, item) => {
                const valor = parseFloat((item.valorNf || '0').toString().replace(',', '.'));
                return sum + (isNaN(valor) ? 0 : valor);
            }, 0);
            return totalValor;
        };

        const total = getTotalizadores(infDocument);
        setVCarga(total.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                    })
                ); // Atualiza o estado
    }, [infDocument]); // Executa sempre que invoicesSelected mudar



    const handleDataEmissao = (value)=> {
        console.log(value.target.value)
        setDhEmi(value.target.value)
    }   

    const handleDataVencimento = (value)=> {
        console.log(value.target.value)
        setInfPrazoDVenc(value.target.value)
    }   


    //Download do PDF e Xml do MDF-e
    const downloadFile = async (id, status, tipo) => {
        try {
            const response = await fetch(`http://localhost:4000/mdfe/${id}/${tipo}/${status}`);

            if (!response.ok) {
                const errorData = await response.json();
                // transforma objeto em string JSON
                const message = typeof errorData.msg === "object" ? JSON.stringify(errorData.msg, null, 2) : errorData.msg;
                throw new Error(message || errorData.erro || "Erro ao baixar arquivo");
            }

            const blob = await response.blob();

            const filename = `mdfe_${id}.${tipo}`;

            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error(err);
            setTitle("Erro ao Fazer download");
            setStatus("error");
            setMensagem(err.message);
            setOpen(true);
            setLoading(false);
        }
    };

  return (

    <>
     <NewMiniDrawer divOpen={ 

        <Layout style={{ minHeight: '100vh' }}>
            <Spin spinning={loading} tip="Salvando manifesto..." size="large">

                <Content style={{ padding: '24px', backgroundColor: '#F2F2F2' }}>

                        <Row gutter={16}>
                            <Col span={4}>
                                <div className="col-md-12">
                                <label htmlFor="versao" className="form-label">Versão <span style={{ color: 'red' }}>*</span></label>
                                <input 
                                    disabled={statusSefaz}
                                    onChange={(e) => setVersao(e.target.value)}
                                    value={versao}
                                    className={`form-control ${versao === '' ? 'empty-field' : ''}`}
                                    id="versao"
                                />
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className="col-md-12">
                                <label htmlFor="idMDFe" className="form-label">Chave de acesso <span style={{ color: 'red' }}>*</span></label>
                                <input 
                                    disabled={statusSefaz}
                                    onChange={(e) => setIdMDFe(e.target.value)}
                                    value={idMDFe}
                                    className={`form-control ${idMDFe === '' ? 'empty-field' : ''}`}
                                    id="idMDFe"
                                />
                                </div>
                            </Col>

                            <Col span={6} style={{ display: 'flex', alignItems: 'end', justifyContent: 'end' }}>
                                <Button
                                    type="primary"
                                    onClick={() => downloadFile(idMDFe, statusMDFe, "pdf")}
                                    style={{ marginRight: '8px', backgroundColor: '#012442', borderColor: '#012442' }}
                                >
                                    PDF
                                </Button>
                                <Button 
                                    type="primary"
                                    onClick={() => downloadFile(idMDFe, statusMDFe, "xml")}
                                    style={{ marginRight: '8px', backgroundColor: '#012442', borderColor: '#012442' }}
                                >
                                    XML
                                </Button>
                            </Col>

                        </Row>

                <Tabs
                    defaultActiveKey="1"
                    tabBarStyle={{ backgroundColor: '#F2F2F2' }}
                    tabBarGutter={32}
                    tabBarExtraContent={null}
                    type="line"
                    className="custom-tabs"
                >
                    <TabPane tab="Dados principais" key="1">


                    <Card title={<><FileTextOutlined /> IDE Identificação do MDF-e</>} className="custom-card" style={{marginBottom: "10px"}}>
                        
                        <Row gutter={16}>
                            <Col span={4}>
                                <div className="col-md-12">
                                    <label htmlFor="cUF" className="form-label">cUF <span style={{ color: 'red' }}>*</span></label>

                                    <select 
                                            disabled={statusSefaz}
                                            name="cUF" 
                                            onChange={(e) => setCUF(Number(e.target.value))} 
                                            id="cUF" 
                                            value={cUF} 
                                            className={`form-control ${cUF === '' ? 'empty-field' : ''}`}>
                                        <option value="12">Acre (AC)</option>
                                        <option value="27">Alagoas (AL)</option>
                                        <option value="16">Amapá (AP)</option>
                                        <option value="13">Amazonas (AM)</option>
                                        <option value="29">Bahia (BA)</option>
                                        <option value="23">Ceará (CE)</option>
                                        <option value="53">Distrito Federal (DF)</option>
                                        <option value="32">Espírito Santo (ES)</option>
                                        <option value="52">Goiás (GO)</option>
                                        <option value="21">Maranhão (MA)</option>
                                        <option value="51">Mato Grosso (MT)</option>
                                        <option value="50">Mato Grosso do Sul (MS)</option>
                                        <option value="31">Minas Gerais (MG)</option>
                                        <option value="15">Pará (PA)</option>
                                        <option value="25">Paraíba (PB)</option>
                                        <option value="41">Paraná (PR)</option>
                                        <option value="26">Pernambuco (PE)</option>
                                        <option value="22">Piauí (PI)</option>
                                        <option value="33">Rio de Janeiro (RJ)</option>
                                        <option value="24">Rio Grande do Norte (RN)</option>
                                        <option value="43">Rio Grande do Sul (RS)</option>
                                        <option value="11">Rondônia (RO)</option>
                                        <option value="14">Roraima (RR)</option>
                                        <option value="42">Santa Catarina (SC)</option>
                                        <option value="35">São Paulo (SP)</option>
                                        <option value="28">Sergipe (SE)</option>
                                        <option value="17">Tocantins (TO)</option>
                                    </select>
                                </div>

                            </Col>

                            <Col span={4}>
                                <div className="col-md-12">
                                <label htmlFor="tpAmb" className="form-label">tpAmb <span style={{ color: 'red' }}>*</span></label>

                                <select
                                        disabled={statusSefaz}
                                        id="cUnid"
                                        className="form-control"
                                        value={tpAmb}
                                        onChange={(e) => setTpAmb(e.target.value)}
                                    >
                                    <option value="1">Produção</option>
                                    <option value="2">Homologação</option>
                                </select>

                            </div>


                            </Col>

                            <Col span={4}>
                                <div className="col-md-12">
                                    <label htmlFor="tpEmit" className="form-label">tpEmit <span style={{ color: 'red' }}>*</span></label>

                                    <select
                                            disabled={statusSefaz}
                                            id="tpEmit"
                                            className={`form-control ${tpEmit === '' ? 'empty-field' : ''}`}
                                            value={tpEmit}
                                            onChange={(e) => setTpEmit(Number(e.target.value))}
                                        >
                                        <option value="1">Prestador de serviço de transporte</option>
                                        <option value="2">Transportador de Carga Própria</option>
                                        <option value="3">Prestador de serviço de transporte que emitirá CT-e Globalizado</option>
                                    </select>
                                </div>
                            </Col>

                            <Col span={4}>
                                <div className="col-md-12">
                                
                                    <Tooltip color="#012442"  title="ETC → Empresa de Transporte de Cargas (transportadora com CNPJ, frota própria e registro na ANTT).
                                                                        TAC → Transportador Autônomo de Cargas (pessoa física, motorista independente com registro na ANTT).
                                                                        CTC → Cooperativa de Transporte de Cargas (cooperativa de transportadores, com CNPJ e registro na ANTT).">
                                        <label htmlFor="tpTransp" className="form-label">tpTransp <span style={{ color: 'red' }}>*</span></label>
                                    </Tooltip>

                                    <select
                                            disabled={statusSefaz}
                                            id="tpTransp"
                                            onChange={(e) => setTpTransp(Number(e.target.value))}
                                            value={tpTransp}
                                            className={`form-control ${tpTransp === '' ? 'empty-field' : ''}`}
                                        >
                                        <option value="1">ETC</option>
                                        <option value="2">TAC</option>
                                        <option value="3">CTC</option>
                                    </select>

                                </div>
                            </Col>

                            <Col span={4}>
                                <div className="col-md-12">
                                <label htmlFor="mod" className="form-label">mod <span style={{ color: 'red' }}>*</span></label>
                                <input 
                                    disabled={statusSefaz}
                                    onChange={(e) => setMod(Number(e.target.value))}
                                    value={mod}
                                    className={`form-control ${mod === '' ? 'empty-field' : ''}`}
                                    id="mod"
                                />
                                </div>
                            </Col>

                            <Col span={4}>
                                <div className="col-md-12">
                                <label htmlFor="nMDF" className="form-label">nMDF <span style={{ color: 'red' }}>*</span></label>
                                <input 
                                    disabled={statusSefaz}
                                    onChange={(e) => setNMDF(Number(e.target.value))}
                                    value={nMDF}
                                    className={`form-control ${nMDF === '' ? 'empty-field' : ''}`}
                                    id="nMDF"
                                />
                                </div>
                            </Col>

                            <Col span={4}>
                                <div className="col-md-12">
                                <label htmlFor="serie" className="form-label">Serie <span style={{ color: 'red' }}>*</span></label>
                                <input 
                                    disabled={statusSefaz}
                                    onChange={(e) => setSerie(Number(e.target.value))}
                                    value={serie}
                                    className={`form-control ${serie === '' ? 'empty-field' : ''}`}
                                    id="serie"
                                />
                                </div>
                            </Col>

                            <Col span={4}>
                                <div className="col-md-12">
                                <label htmlFor="cMDF" className="form-label">cMDF <span style={{ color: 'red' }}>*</span></label>
                                <input type="text"
                                    disabled={statusSefaz}
                                    onChange={(e) => setCMDF(e.target.value)}
                                    value={cMDF}
                                    className={`form-control ${cMDF === '' ? 'empty-field' : ''}`}
                                    id="cMDF"
                                />
                                </div>
                            </Col>

                            <Col span={4}>
                                <div className="col-md-12">
                                <label htmlFor="cDV" className="form-label">cDV <span style={{ color: 'red' }}>*</span></label>
                                <input 
                                    disabled={statusSefaz}
                                    onChange={(e) => setCDV(Number(e.target.value))}
                                    value={cDV}
                                    className={`form-control ${cDV === '' ? 'empty-field' : ''}`}
                                    id="cDV"
                                />
                                </div>
                            </Col>

                            <Col span={4}>
                                <div className="col-md-12">
                                <label htmlFor="modal" className="form-label">modal <span style={{ color: 'red' }}>*</span></label>

                                <select
                                        disabled={statusSefaz}
                                        onChange={(e) => setModal(Number(e.target.value))}
                                        value={modal}
                                        className={`form-control ${modal === '' ? 'empty-field' : ''}`}
                                        id="modal"
                                    >
                                    <option value="1">Rodoviário</option>
                                    <option value="2">Aéreo</option>
                                    <option value="3">Aquaviário</option>
                                    <option value="4">Ferroviário</option>
                                </select>

                                </div>
                            </Col>

                            <Col span={3}>
                                <div className="col-md-12">
                                <label htmlFor="dhEmi" className="form-label">dhEmi <span style={{ color: 'red' }}>*</span></label>
                                <input type="date"
                                    disabled={statusSefaz}
                                    onChange={handleDataEmissao}
                                    value={dhEmi && dhEmi} 
                                    className={`form-control ${dhEmi === '' ? 'empty-field' : ''}`}
                                    id="dhEmi"
                                />
                                </div>
                            </Col>

                            <Col span={4}>
                                <div className="col-md-12">
                                <label htmlFor="tpEmis" className="form-label">tpEmis <span style={{ color: 'red' }}>*</span></label>

                                    <select
                                            disabled={statusSefaz}
                                            onChange={(e) => setTpEmis(Number(e.target.value))}
                                            value={tpEmis}
                                            className={`form-control ${tpEmis === '' ? 'empty-field' : ''}`}
                                            id="tpEmis"
                                        >
                                        <option value="1">Normal</option>
                                        <option value="2">Contingência</option>
                                        <option value="3">Regime Especial NFF</option>
                                    </select>

                                </div>
                            </Col>

                            <Col span={4}>
                                <div className="col-md-12">
                                    <label htmlFor="procEmi" className="form-label">procEmi <span style={{ color: 'red' }}>*</span></label>

                                    <select
                                            disabled={statusSefaz}
                                            onChange={(e) => setProcEmi(e.target.value)}
                                            value={procEmi}
                                            className={`form-control ${procEmi === '' ? 'empty-field' : ''}`}
                                            id="procEmi"
                                        >
                                        <option value="0">Emissão de MDF-e com aplicativo do contribuinte</option>
                                    </select> 
                                </div>
                            </Col>

                            <Col span={4}>
                                <div className="col-md-12">
                                <label htmlFor="verProc" className="form-label">verProc <span style={{ color: 'red' }}>*</span></label>
                                <input type="text"
                                    disabled={statusSefaz}
                                    onChange={(e) => setVerProc(e.target.value)}
                                    value={verProc}
                                    className={`form-control ${verProc === '' ? 'empty-field' : ''}`}
                                    id="verProc"
                                />
                                </div>
                            </Col>

                            <Col span={3}>
                                <div className="col-md-12">
                                <label htmlFor="UFIni" className="form-label">UF Ini <span style={{ color: 'red' }}>*</span></label>
                                {/* <input type="text"
                                    onChange={(e) => setUFIni(e.target.value)}
                                    value={UFIni}
                                    className={`form-control ${UFIni === '' ? 'empty-field' : ''}`}
                                    id="UFIni"
                                /> */}


                                <select name="UFIni" 
                                        disabled={statusSefaz}
                                        onChange={(e) => setUFIni(e.target.value)}
                                        value={UFIni}
                                        className={`form-control ${UFIni === '' ? 'empty-field' : ''}`}
                                        id="UFIni" >
                                    <option value="AC">Acre (AC)</option>
                                    <option value="AL">Alagoas (AL)</option>
                                    <option value="AP">Amapá (AP)</option>
                                    <option value="AM">Amazonas (AM)</option>
                                    <option value="BA">Bahia (BA)</option>
                                    <option value="CE">Ceará (CE)</option>
                                    <option value="DF">Distrito Federal (DF)</option>
                                    <option value="ES">Espírito Santo (ES)</option>
                                    <option value="GO">Goiás (GO)</option>
                                    <option value="MA">Maranhão (MA)</option>
                                    <option value="MT">Mato Grosso (MT)</option>
                                    <option value="MS">Mato Grosso do Sul (MS)</option>
                                    <option value="MG">Minas Gerais (MG)</option>
                                    <option value="PA">Pará (PA)</option>
                                    <option value="PB">Paraíba (PB)</option>
                                    <option value="PR">Paraná (PR)</option>
                                    <option value="PE">Pernambuco (PE)</option>
                                    <option value="PI">Piauí (PI)</option>
                                    <option value="RJ">Rio de Janeiro (RJ)</option>
                                    <option value="RN">Rio Grande do Norte (RN)</option>
                                    <option value="RS">Rio Grande do Sul (RS)</option>
                                    <option value="RO">Rondônia (RO)</option>
                                    <option value="RR">Roraima (RR)</option>
                                    <option value="SC">Santa Catarina (SC)</option>
                                    <option value="SP">São Paulo (SP)</option>
                                    <option value="SE">Sergipe (SE)</option>
                                    <option value="TO">Tocantins (TO)</option>
                                </select>


                                </div>
                            </Col>

                            <Col span={3}>
                                <div className="col-md-12">
                                <label htmlFor="UFFim" className="form-label">UF Fim <span style={{ color: 'red' }}>*</span></label>
                                {/* <input type="text"
                                    onChange={(e) => setUFFim(e.target.value)}
                                    value={UFFim}
                                    className={`form-control ${UFFim === '' ? 'empty-field' : ''}`}
                                    id="UFFim"
                                /> */}

                                    <select name="UFIni" 
                                            disabled={statusSefaz}
                                            onChange={(e) => setUFFim(e.target.value)}
                                            value={UFFim}
                                            className={`form-control ${UFFim === '' ? 'empty-field' : ''}`}
                                            id="UFFim">
                                        <option value="AC">Acre (AC)</option>
                                        <option value="AL">Alagoas (AL)</option>
                                        <option value="AP">Amapá (AP)</option>
                                        <option value="AM">Amazonas (AM)</option>
                                        <option value="BA">Bahia (BA)</option>
                                        <option value="CE">Ceará (CE)</option>
                                        <option value="DF">Distrito Federal (DF)</option>
                                        <option value="ES">Espírito Santo (ES)</option>
                                        <option value="GO">Goiás (GO)</option>
                                        <option value="MA">Maranhão (MA)</option>
                                        <option value="MT">Mato Grosso (MT)</option>
                                        <option value="MS">Mato Grosso do Sul (MS)</option>
                                        <option value="MG">Minas Gerais (MG)</option>
                                        <option value="PA">Pará (PA)</option>
                                        <option value="PB">Paraíba (PB)</option>
                                        <option value="PR">Paraná (PR)</option>
                                        <option value="PE">Pernambuco (PE)</option>
                                        <option value="PI">Piauí (PI)</option>
                                        <option value="RJ">Rio de Janeiro (RJ)</option>
                                        <option value="RN">Rio Grande do Norte (RN)</option>
                                        <option value="RS">Rio Grande do Sul (RS)</option>
                                        <option value="RO">Rondônia (RO)</option>
                                        <option value="RR">Roraima (RR)</option>
                                        <option value="SC">Santa Catarina (SC)</option>
                                        <option value="SP">São Paulo (SP)</option>
                                        <option value="SE">Sergipe (SE)</option>
                                        <option value="TO">Tocantins (TO)</option>
                                    </select>


                                </div>
                            </Col>

                            <Col span={3}>
                                <div className="col-md-12">
                                <label htmlFor="dhIniViagem" className="form-label">dhIniViagem <span style={{ color: 'red' }}>*</span></label>
                                <input type="date"
                                    disabled={statusSefaz}
                                    onChange={(e) => setDhIniViagem(e.target.value)}
                                    value={dhIniViagem?.substring(0, 16)}
                                    className={`form-control ${dhIniViagem === '' ? 'empty-field' : ''}`}
                                    id="dhIniViagem"
                                />
                                </div>
                            </Col>

                            {/* <Col span={2}>
                                <div className="col-md-12">
                                    <Tooltip color="#012442"  title="">
                                        <label htmlFor="indCanalVerde" className="form-label">indCanalVerde</label>
                                    </Tooltip>

                                <input 
                                    onChange={(e) => setIndCanalVerde(Number(e.target.value))}
                                    value={indCanalVerde}
                                    className={`form-control ${indCanalVerde === '' ? 'empty-field' : ''}`}
                                    id="indCanalVerde"
                                />
                                </div>
                            </Col> */}

                            <Col span={2}>
                                <div className="col-md-12">
                                    <Tooltip color="#012442"  title="0 → Não haverá carregamento posterior (toda a carga é embarcada no início da viagem).
                                                                    1 → Sim, haverá carregamento posterior (o veículo sairá e depois pegará mais carga em outro local durante o trajeto).">
                                        <label htmlFor="indCarregaPosterior" className="form-label">indCarregaPosterior</label>
                                    </Tooltip>
                                <input 
                                    disabled={statusSefaz}
                                    onChange={(e) => setIndCarregaPosterior(Number(e.target.value))}
                                    value={indCarregaPosterior}
                                    className={`form-control ${indCarregaPosterior === '' ? 'empty-field' : ''}`}
                                    id="indCarregaPosterior"
                                />
                                </div>
                            </Col>
                        </Row>
            
                        <Box p={2}>
                            {/* infMunCarrega */}
                            <Grid container spacing={2}>
                                {infMunCarrega.map((item, index) => (
                                <Grid container spacing={2} key={index} style={{paddingTop: '10px'}}>
                                    <Grid item xs={2}>
                                        <div className="col-md-12">
                                            <label htmlFor="idcarregamento" className="form-label">Código Município Carregamento</label>
                                            <input 
                                                disabled={statusSefaz}
                                                onChange={(e) => {
                                                    const list = [...infMunCarrega];
                                                    list[index].cMunCarrega = e.target.value;
                                                    setInfMunCarrega(list);
                                                }}
                                                value={item.cMunCarrega}
                                                className={`form-control ${item.cMunCarrega === '' ? 'empty-field' : ''}`}
                                                id="indCarregaPosterior"
                                            />
                                        </div>


                                    </Grid>
                                    <Grid item xs={2}>
                                        <div className="col-md-12">
                                            <label htmlFor="idcarregamento" className="form-label">Município Carregamento</label>
                                            <input 
                                                disabled={statusSefaz}
                                                onChange={(e) => {
                                                    const list = [...infMunCarrega];
                                                    list[index].xMunCarrega = e.target.value;
                                                    setInfMunCarrega(list);
                                                }}
                                                value={item.xMunCarrega}
                                                className={`form-control ${item.xMunCarrega === '' ? 'empty-field' : ''}`}
                                                id="indCarregaPosterior"
                                            />
                                        </div>
                                
                                    </Grid>
                                </Grid>
                                ))}
                                <Grid item xs={12}>
                                <Button disabled={statusSefaz} onClick={() => addItem(setInfMunCarrega, infMunCarrega)}>Adicionar Município</Button>
                                </Grid>
                            </Grid>

                            {/* infPercurso */}
                            <Grid container spacing={2} mt={3}>
                                {infPercurso.map((item, index) => (
                                    <Grid container spacing={2} key={index} style={{paddingTop: '10px'}}>
                                        <Grid item xs={2}>
                                            <div className="col-md-12">
                                                <label htmlFor="item.UFPer" className="form-label">UF Percurso</label>
                                                <input 
                                                    disabled={statusSefaz}
                                                    onChange={(e) => {
                                                        const list = [...infPercurso];
                                                        list[index].UFPer = e.target.value;
                                                        setInfPercurso(list);
                                                    }}
                                                    value={item.UFPer}
                                                    className={`form-control ${item.UFPer === '' ? 'empty-field' : ''}`}
                                                    id="item.UFPer"
                                                />
                                            </div>
                                            
                                        </Grid>
                                        
                                    </Grid>
                                ))}
                                <Grid item xs={12}>
                                    <Button disabled={statusSefaz} onClick={() => addItem(setInfPercurso, infPercurso)}>Adicionar UF Percurso</Button>
                                </Grid>
                            </Grid>
                        </Box>

                    </Card>
                {/* ------------- final do IDE ------------------- */}
                {/* ------------- Inicio do Emitente ------------------- */}

                    <Card title={<><FileTextOutlined /> Emitente </>} className="custom-card" style={{marginBottom: "10px"}}>
                        
                        <Row gutter={16}>
                            <Col span={6}>
                                <div className="col-md-12">
                                    <label htmlFor="emitXNome" className="form-label">Nome emitente <span style={{ color: 'red' }}>*</span></label>
                                    <input 
                                        disabled={statusSefaz}
                                        onChange={(e) => setEmitXNome(e.target.value)}
                                        value={emitXNome}
                                        className={`form-control ${emitXNome === '' ? 'empty-field' : ''}`}
                                        id="emitXNome"
                                    />
                                </div>
                            </Col>
                            <Col span={6}>
                                <div className="col-md-12">
                                    <label htmlFor="emitXFant" className="form-label">Nome fantasia <span style={{ color: 'red' }}>*</span></label>
                                    <input 
                                        disabled={statusSefaz}
                                        onChange={(e) => setEmitXFant(e.target.value)}
                                        value={emitXFant}
                                        className={`form-control ${emitXFant === '' ? 'empty-field' : ''}`}
                                        id="emitXFant"
                                    />
                                </div> 
                            </Col>
                            <Col span={3}>
                                <div className="col-md-12">
                                    <label htmlFor="emitCNPJ" className="form-label">CNPJ <span style={{ color: 'red' }}>*</span></label>
                                    <input 
                                        disabled={statusSefaz}
                                        onChange={(e) => setEmitCNPJ(e.target.value)}
                                        value={emitCNPJ}
                                        className={`form-control ${emitCNPJ === '' ? 'empty-field' : ''}`}
                                        id="emitCNPJ"
                                    />
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className="col-md-12">
                                    <label htmlFor="emitIE" className="form-label">Inscrição estadual <span style={{ color: 'red' }}>*</span></label>
                                    <input 
                                        disabled={statusSefaz}
                                        onChange={(e) => setEmitIE(e.target.value)}
                                        value={emitIE}
                                        className={`form-control ${emitIE === '' ? 'empty-field' : ''}`}
                                        id="emitIE"
                                    />
                                </div>
                            </Col>    
                        </Row>          

                        <Row gutter={16}>
                            <Col span={6}>
                                <div className="col-md-12">
                                <label htmlFor="xLgr" className="form-label">
                                    Logradouro <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    disabled={statusSefaz}
                                    type="text"
                                    id="xLgr"
                                    className={`form-control ${emitEndereco.xLgr === '' ? 'empty-field' : ''}`}
                                    value={emitEndereco.xLgr}
                                    onChange={(e) => setEmitEndereco({ ...emitEndereco, xLgr: e.target.value })}
                                />
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className="col-md-12">
                                <label htmlFor="nro" className="form-label">
                                    Número <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    disabled={statusSefaz}
                                    type="text"
                                    id="nro"
                                    className={`form-control ${emitEndereco.nro === '' ? 'empty-field' : ''}`}
                                    value={emitEndereco.nro}
                                    onChange={(e) => setEmitEndereco({ ...emitEndereco, nro: e.target.value })}
                                />
                                </div>
                            </Col>
                            <Col span={4}>
                                <div className="col-md-12">
                                <label htmlFor="xCpl" className="form-label">Complemento</label>
                                <input
                                    disabled={statusSefaz}
                                    type="text"
                                    id="xCpl"
                                    className="form-control"
                                    value={emitEndereco.xCpl}
                                    onChange={(e) => setEmitEndereco({ ...emitEndereco, xCpl: e.target.value })}
                                />
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className="col-md-12">
                                <label htmlFor="xBairro" className="form-label">
                                    Bairro <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    disabled={statusSefaz}
                                    type="text"
                                    id="xBairro"
                                    className={`form-control ${emitEndereco.xBairro === '' ? 'empty-field' : ''}`}
                                    value={emitEndereco.xBairro}
                                    onChange={(e) => setEmitEndereco({ ...emitEndereco, xBairro: e.target.value })}
                                />
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className="col-md-12">
                                <label htmlFor="cMun" className="form-label">Código Município</label>
                                <input
                                    disabled={statusSefaz}
                                    type="text"
                                    id="cMun"
                                    className="form-control"
                                    value={emitEndereco.cMun}
                                    onChange={(e) => setEmitEndereco({ ...emitEndereco, cMun: e.target.value })}
                                />
                                </div>
                            </Col>
                            </Row>

                            <Row gutter={16}>
                            <Col span={4}>
                                <div className="col-md-12">
                                <label htmlFor="xMun" className="form-label">
                                    Município <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    disabled={statusSefaz}
                                    type="text"
                                    id="xMun"
                                    className={`form-control ${emitEndereco.xMun === '' ? 'empty-field' : ''}`}
                                    value={emitEndereco.xMun}
                                    onChange={(e) => setEmitEndereco({ ...emitEndereco, xMun: e.target.value })}
                                />
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className="col-md-12">
                                <label htmlFor="CEP" className="form-label">
                                    CEP <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    disabled={statusSefaz}
                                    type="text"
                                    id="CEP"
                                    className={`form-control ${emitEndereco.CEP === '' ? 'empty-field' : ''}`}
                                    value={emitEndereco.CEP}
                                    onChange={(e) => setEmitEndereco({ ...emitEndereco, CEP: e.target.value })}
                                />
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className="col-md-12">
                                <label htmlFor="UF" className="form-label">UF</label>

                                <select name="UF" 
                                    disabled={statusSefaz}
                                    type="text"
                                    id="UF"
                                    className="form-control"
                                    value={emitEndereco.UF}
                                    onChange={(e) => setEmitEndereco({ ...emitEndereco, UF: e.target.value })}
                                >
                                    <option value="AC">Acre (AC)</option>
                                    <option value="AL">Alagoas (AL)</option>
                                    <option value="AP">Amapá (AP)</option>
                                    <option value="AM">Amazonas (AM)</option>
                                    <option value="BA">Bahia (BA)</option>
                                    <option value="CE">Ceará (CE)</option>
                                    <option value="DF">Distrito Federal (DF)</option>
                                    <option value="ES">Espírito Santo (ES)</option>
                                    <option value="GO">Goiás (GO)</option>
                                    <option value="MA">Maranhão (MA)</option>
                                    <option value="MT">Mato Grosso (MT)</option>
                                    <option value="MS">Mato Grosso do Sul (MS)</option>
                                    <option value="MG">Minas Gerais (MG)</option>
                                    <option value="PA">Pará (PA)</option>
                                    <option value="PB">Paraíba (PB)</option>
                                    <option value="PR">Paraná (PR)</option>
                                    <option value="PE">Pernambuco (PE)</option>
                                    <option value="PI">Piauí (PI)</option>
                                    <option value="RJ">Rio de Janeiro (RJ)</option>
                                    <option value="RN">Rio Grande do Norte (RN)</option>
                                    <option value="RS">Rio Grande do Sul (RS)</option>
                                    <option value="RO">Rondônia (RO)</option>
                                    <option value="RR">Roraima (RR)</option>
                                    <option value="SC">Santa Catarina (SC)</option>
                                    <option value="SP">São Paulo (SP)</option>
                                    <option value="SE">Sergipe (SE)</option>
                                    <option value="TO">Tocantins (TO)</option>
                                </select>



                                </div>
                            </Col>
                            <Col span={3}>
                                <div className="col-md-12">
                                <label htmlFor="fone" className="form-label">Telefone</label>
                                <input
                                    disabled={statusSefaz}
                                    type="text"
                                    id="fone"
                                    className="form-control"
                                    value={emitEndereco.fone}
                                    onChange={(e) => setEmitEndereco({ ...emitEndereco, fone: e.target.value })}
                                />
                                </div>
                            </Col>
                            <Col span={4}>
                                <div className="col-md-12">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    disabled={statusSefaz}
                                    type="email"
                                    id="email"
                                    className="form-control"
                                    value={emitEndereco.email}
                                    onChange={(e) => setEmitEndereco({ ...emitEndereco, email: e.target.value })}
                                />
                                </div>
                            </Col>
                        </Row>


                    </Card>

                        
                    </TabPane>

                    <TabPane tab="Dados do Veículo" key="2">
                        
                        <Card title={<><CarOutlined /> InfModal Rodoviário </>} className="custom-card" style={{marginBottom: '10px'}}>
                            
                            <Row gutter={16} style={{marginBottom: '10px'}}>
                                <Col span={2}>
                                    <div className="col-md-12">
                                        <label htmlFor="versaoModal" className="form-label">Versão <span style={{ color: 'red' }}>*</span></label>
                                        <input 
                                            disabled={statusSefaz}
                                            onChange={(e) => setVersaoModal(e.target.value)}
                                            value={versaoModal}
                                            className={`form-control ${versaoModal === '' ? 'empty-field' : ''}`}
                                            id="versaoModal"
                                        />
                                    </div>
                                </Col>
                                <Col span={4}>
                                    <div className="col-md-12">
                                        <label htmlFor="RNTRC" className="form-label">RNTRC <span style={{ color: 'red' }}>*</span></label>
                                        <input 
                                            disabled={statusSefaz}
                                            onChange={(e) => setRNTRC(e.target.value)}
                                            value={RNTRC}
                                            className={`form-control ${RNTRC === '' ? 'empty-field' : ''}`}
                                            id="RNTRC"
                                        />
                                    </div>
                                </Col>
                                <Col span={4}>
                                    <div className="col-md-12">
                                        <label htmlFor="infCIOT" className="form-label">CIOT <span style={{ color: 'red' }}>*</span></label>
                                        <input 
                                            disabled={statusSefaz}
                                            onChange={(e) => setInfCIOT(e.target.value)}
                                            value={infCIOT}
                                            className={`form-control ${infCIOT === '' ? 'empty-field' : ''}`}
                                            id="infCIOT"
                                        />
                                    </div>
                                </Col>
                            
                            </Row>
                            
                            <Row gutter={16} style={{marginBottom: '10px'}}>
                                { 
                                    contratante.map((item, index) => (
                                        <>
                                            <Col span={8}>
                                                <div className="col-md-12">
                                                <label htmlFor="xNome" className="form-label">
                                                    Nome do Contratante <span style={{ color: 'red' }}>*</span>
                                                </label>
                                                <input
                                                    disabled={statusSefaz}
                                                    type="text"
                                                    onChange={(e) =>
                                                        handleFormChangeContratante(index, 'xNome', e.target.value)
                                                    }
                                                    value={item.xNome}
                                                    className={`form-control ${item.xNome === '' ? 'empty-field' : ''}`}
                                                    id="xNome"
                                                />
                                                </div>
                                            </Col>

                                            <Col span={4}>
                                                <div className="col-md-12">
                                                <label htmlFor="CNPJ" className="form-label">
                                                    CNPJ do Contratante <span style={{ color: 'red' }}>*</span>
                                                </label>
                                                <input
                                                    disabled={statusSefaz}
                                                    type="text"
                                                    onChange={(e) =>
                                                        handleFormChangeContratante(index, 'CNPJ', e.target.value)
                                                    }
                                                    value={item.CNPJ}
                                                    className={`form-control ${item.CNPJ === '' ? 'empty-field' : ''}`}
                                                    id="CNPJ"
                                                />
                                                </div>
                                            </Col>

                                            <Col span={4}>
                                                <div className="col-md-12">
                                                    <label htmlFor="NroContrato" className="form-label">
                                                        Nº do Contrato <span style={{ color: 'red' }}>*</span>
                                                    </label>
                                                    <input
                                                        disabled={statusSefaz}
                                                        type="text"
                                                        onChange={(e) =>
                                                        
                                                            handleFormChangeContratante(index, 'NroContrato', e.target.value)
                                                        
                                                        }
                                                        value={item.infContrato.NroContrato}
                                                        className={`form-control ${item.infContrato.NroContrato === '' ? 'empty-field' : ''}`}
                                                        id="NroContrato"
                                                    />
                                                </div>
                                            </Col>

                                            <Col span={3}>
                                                <div className="col-md-12">
                                                <label htmlFor="vContratoGlobal" 
                                                className="form-label">
                                                    <Tooltip color="#012442"  title="Esse campo é obrigatório quando o tipo de transportador for: ETC (Empresa de Transporte de Cargas)
                                                                E estiver emitindo um MDF-e atrelado a um contrato de transporte global.
                                                                Por exemplo:
                                                                Um contrato de frete mensal, anual ou por período, com o embarcador.
                                                                Não há valores por NF específica, mas sim um contrato com valor total previamente acordado.">
                                                        Valor Global <span style={{ color: 'red' }}>*</span>
                                                    </Tooltip>
                                                </label>
                                                <input
                                                    disabled={statusSefaz}
                                                    onChange={(e) =>
                                                        handleFormChangeContratante(index, 'vContratoGlobal', e.target.value)                                                
                                                    }                                            
                                                    value={item.infContrato.vContratoGlobal} 
                                                    className={`form-control ${item.infContrato.vContratoGlobal === '' ? 'empty-field' : ''}`}
                                                    id="vContratoGlobal"
                                                />
                                                </div>
                                            </Col>
                                        </>
                                    ))
                                }
                                
                            </Row>

                        </Card>

                        <Card title={<><CarOutlined /> Veiculo Tração</>} className="custom-card" style={{marginBottom: '10px'}}>
                            <Row gutter={16} style={{marginBottom: '10px'}}>

                                <Col span={3}>
                                    <label className="form-label">Placa</label>
                                    <input
                                        disabled={statusSefaz}
                                    type="text"
                                    value={placa}
                                    onChange={(e) => setPlaca(e.target.value)}
                                    className="form-control"
                                    />
                                </Col>

                                <Col span={3}>
                                    <label className="form-label">Código Interno</label>
                                    <input
                                        disabled={statusSefaz}
                                    type="text"
                                    value={cInt}
                                    onChange={(e) => setCInt(e.target.value)}
                                    className="form-control"
                                    />
                                </Col>

                                <Col span={3}>
                                    <label className="form-label">RENAVAM</label>
                                    <input
                                        disabled={statusSefaz}
                                    type="text"
                                    value={renavam}
                                    onChange={(e) => setRenavam(e.target.value)}
                                    className="form-control"
                                    />
                                </Col>

                                <Col span={3}>
                                    <label className="form-label">Tara (KG)</label>
                                    <input  
                                        disabled={statusSefaz}
                                    value={tara}
                                    onChange={(e) => setTara(e.target.value)}
                                    className="form-control"
                                    />
                                </Col>

                                <Col span={3}>
                                    <label className="form-label">Capacidade (KG)</label>
                                    <input
                                        disabled={statusSefaz}
                                    value={capKG}
                                    onChange={(e) => setCapKg(e.target.value)}
                                    className="form-control"
                                    />
                                </Col>

                                <Col span={3}>
                                    <label className="form-label">Capacidade (m³)</label>
                                    <input
                                        disabled={statusSefaz}
                                    value={capM3}
                                    onChange={(e) => setCapM3(e.target.value)}
                                    className="form-control"
                                    />
                                </Col>
                                </Row>

                                <Row gutter={16} style={{ marginTop: 16 }}>
                                <Col span={4}>
                                    <label className="form-label">CNPJ do Proprietário</label>
                                    <input
                                        disabled={statusSefaz}
                                    type="text"
                                    value={cnpjProp}
                                    onChange={(e) => setCnpjProp(e.target.value)}
                                    className="form-control"
                                    />
                                </Col>

                                <Col span={4}>
                                    <label className="form-label">RNTRC</label>
                                    <input
                                        disabled={statusSefaz}
                                    type="text"
                                    value={rntrcProd}
                                    onChange={(e) => setRntrcProp(e.target.value)}
                                    className="form-control"
                                    />
                                </Col>

                                <Col span={6}>
                                    <label className="form-label">Nome do Proprietário</label>
                                    <input
                                        disabled={statusSefaz}
                                    type="text"
                                    value={xNomeProp}
                                    onChange={(e) => setXNomeProp(e.target.value)}
                                    className="form-control"
                                    />
                                </Col>

                                <Col span={4}>
                                    <label className="form-label">Tipo do Proprietário</label>

                                    <select
                                            disabled={statusSefaz}
                                            value={tpProp}
                                            onChange={(e) => setTpProp(e.target.value)}
                                            className={`form-control ${modal === '' ? 'empty-field' : ''}`}
                                            id="tpProp"
                                        >
                                        <option value="0">TAC Agregado</option>
                                        <option value="1">TAC Independente</option>
                                        <option value="2">Outros</option>
                                    </select>

                                </Col>
                                </Row>

                                <Row gutter={16} style={{ marginTop: 16 }}>
                                <Col span={6}>
                                    <label className="form-label">Nome do Condutor</label>
                                    <input
                                        disabled={statusSefaz}
                                    type="text"
                                    value={xNomeCondutor}
                                    onChange={(e) => setXNomeCondutor(e.target.value)}
                                    className="form-control"
                                    />
                                </Col>

                                <Col span={3}>
                                    <label className="form-label">CPF do Condutor</label>
                                    <input
                                        disabled={statusSefaz}
                                    type="text"
                                    value={cpfCondutor}
                                    onChange={(e) => setCpfCondutor(e.target.value)}
                                    className="form-control"
                                    />
                                </Col>

                                <Col span={3}>
                                    <label className="form-label">Tipo de Rodado</label>

                                    <select
                                            disabled={statusSefaz}
                                            type="text"
                                            value={tpRod}
                                            onChange={(e) => setTpRod(e.target.value)}
                                            className="form-control"
                                        >
                                        <option value="0">Truck</option>
                                        <option value="1">Toco</option>
                                        <option value="2">Cavalo Mecânico</option>
                                        <option value="3">VAN</option>
                                        <option value="4">Utilitário</option>
                                        <option value="5">Outros</option>

                                    </select>

                                </Col>

                                <Col span={3}>
                                    <label className="form-label">Tp Carroceria</label>

                                        <select
                                                disabled={statusSefaz}
                                                type="text"
                                                value={tpCar}
                                                onChange={(e) => setTpCar(e.target.value)}
                                                className="form-control"
                                            >
                                            <option value="00">não aplicável</option>
                                            <option value="01">Aberta</option>
                                            <option value="02">Fechada/Baú</option>
                                            <option value="03">Granelera</option>
                                            <option value="04">Porta Container</option>
                                            <option value="05">Sider</option>

                                        </select>

                                </Col>

                                <Col span={3} >
                                    <label className="form-label">UF</label>

                                    <select name="UF" 
                                            disabled={statusSefaz}
                                            type="text"
                                            value={ufVeiculo}
                                            onChange={(e) => setUfVeiculo(e.target.value)} 
                                            className="form-control"
                                        >

                                            <option defaultValue="">Selecione</option>
                                            <option value="AC">Acre (AC)</option>
                                            <option value="AL">Alagoas (AL)</option>
                                            <option value="AP">Amapá (AP)</option>
                                            <option value="AM">Amazonas (AM)</option>
                                            <option value="BA">Bahia (BA)</option>
                                            <option value="CE">Ceará (CE)</option>
                                            <option value="DF">Distrito Federal (DF)</option>
                                            <option value="ES">Espírito Santo (ES)</option> 
                                            <option value="GO">Goiás (GO)</option>
                                            <option value="MA">Maranhão (MA)</option>
                                            <option value="MT">Mato Grosso (MT)</option>
                                            <option value="MS">Mato Grosso do Sul (MS)</option>
                                            <option value="MG">Minas Gerais (MG)</option>
                                            <option value="PA">Pará (PA)</option>
                                            <option value="PB">Paraíba (PB)</option>
                                            <option value="PR">Paraná (PR)</option>
                                            <option value="PE">Pernambuco (PE)</option>
                                            <option value="PI">Piauí (PI)</option>
                                            <option value="RJ">Rio de Janeiro (RJ)</option>
                                            <option value="RN">Rio Grande do Norte (RN)</option>
                                            <option value="RS">Rio Grande do Sul (RS)</option>
                                            <option value="RO">Rondônia (RO)</option>
                                            <option value="RR">Roraima (RR)</option>
                                            <option value="SC">Santa Catarina (SC)</option>
                                            <option value="SP">São Paulo (SP)</option>
                                            <option value="SE">Sergipe (SE)</option>
                                            <option value="TO">Tocantins (TO)</option>
                                    </select>


                                </Col>
                            </Row>



                                <Row gutter={16} style={{marginBottom: '10px', marginTop: 16}}>

                               

                                    <Col span={3}>
                                        <label className="form-label">Nome pagador</label>
                                        <input
                                            disabled={statusSefaz}
                                        type="text"
                                        value={infPagXnome}
                                        onChange={(e) => setInfPagXnome(e.target.value)}
                                        className="form-control"
                                        />
                                    </Col>

                                    <Col span={3}>
                                        <label className="form-label">CNPJ pagador </label>
                                        <input  
                                            disabled={statusSefaz}
                                        value={infPagCnpj}
                                        onChange={(e) => setInfPagCnpj(e.target.value)}
                                        className="form-control"
                                        />
                                    </Col>

                                    <Col span={3}>
                                        <label className="form-label">Tipo Comprovante</label>
                                            <select
                                                    disabled={statusSefaz}
                                                    type="text"
                                                    value={infPagCompTpComp}
                                                    onChange={(e) => setInfPagCompTpComp(e.target.value)}
                                                    className="form-control"
                                                >
                                                <option value="01">Vale Pedágio</option>
                                                <option value="02">Impostos, taxas e contribuições</option>
                                                <option value="03">Despesas (bancárias, meios de pagamento, outras)</option>
                                                <option value="04">Frete</option>
                                                <option value="99">Outros</option>

                                            </select>

                                    </Col>

                                    <Col span={3}>
                                        <label className="form-label">Valor componente </label>
                                        <input
                                            disabled={statusSefaz}
                                        value={infPagCompVComp}
                                        onChange={(e) => setInfPagCompVComp(e.target.value)}
                                        className="form-control"
                                        />
                                    </Col>

                                </Row>

                                <Row gutter={16} style={{ marginTop: 16 }}>
                                    <Col span={2}>
                                        <label className="form-label">Valor contrato</label>
                                        <input
                                            disabled={statusSefaz}
                                        type="text"
                                        value={infPagVContrato}
                                        onChange={(e) => setInfPagVContrato(e.target.value)}
                                        className="form-control"
                                        />
                                    </Col>

                                    <Col span={2}>
                                        <label className="form-label">Ind. pagamento</label>
                                        <input
                                            disabled={statusSefaz}
                                        type="text"
                                        value={infPagIndPag}
                                        onChange={(e) => setInfPagIndPag(e.target.value)}
                                        className="form-control"
                                        />
                                    </Col>

                                    <Col span={3}>
                                        <label className="form-label">Prazo pagto</label>
                                            <select
                                                    disabled={statusSefaz}
                                                    type="text"
                                                    value={infPrazo}
                                                    onChange={(e) => setInfPrazo(e.target.value)}
                                                    className="form-control"
                                                >
                                                <option value="0">Pagamento à Vista</option>
                                                <option value="1">Pagamento à Prazo</option>
                                            </select>
                                    </Col>

                                    <Col span={2}>
                                        <label className="form-label">Numero parcela</label>
                                        <input
                                            disabled={statusSefaz}
                                        type="text"
                                        value={infPrazoNParcela}
                                        onChange={(e) => setInfPrazoNParcela(e.target.value)}
                                        className="form-control"
                                        />
                                    </Col>
                                    <Col span={3}>
                                        <label className="form-label">Data vencimento</label>
                                        <input type="date"
                                            disabled={statusSefaz}
                                            onChange={handleDataVencimento}
                                            value={infPrazoDVenc && infPrazoDVenc} 
                                            className={`form-control ${dhEmi === '' ? 'empty-field' : ''}`}
                                            id="dhEmi"
                                        />
                                    </Col> 
                                    <Col span={2}>
                                        <label className="form-label">Valor parcela</label> 
                                        <input
                                            disabled={statusSefaz}
                                        type="text"
                                        value={infPrazoVParcela}
                                        onChange={(e) => setInfPrazoVParcela(e.target.value)} 
                                        className="form-control"
                                        />
                                    </Col>
                                </Row>

                                

                        </Card>
                        <Card title={<><CarOutlined /> Veiculo Reboque</>} className="custom-card" style={{marginBottom: '10px'}}>
                            {
                                veicReboque.map((veicReboque, index) => (
                                    <>
                                        
                                        <h5 style={{ marginBottom: '20px', marginTop: '20px' }}>Veículo: {veicReboque.placa}</h5>

                                        <Row gutter={16} style={{marginBottom: '30px'}}>
                                            <Col span={4}>
                                                <div className="col-md-12">
                                                <label className="form-label">Placa</label>
                                                <input
                                                    disabled={statusSefaz}
                                                    type="text"
                                                    className="form-control"
                                                    value={veicReboque.placa}
                                                    onChange={(e)=> handleFormChange(index, 'placa', e.target.value)} 
                                                />
                                                </div>
                                            </Col>

                                            <Col span={4}>
                                                <div className="col-md-12">
                                                <label className="form-label">Código Interno</label>
                                                <input
                                                disabled={statusSefaz}
                                                    type="text"
                                                    className="form-control"
                                                    value={veicReboque.cInt}
                                                    onChange={(e)=> handleFormChange(index, 'cInt', e.target.value)} 
                                                />
                                                </div>
                                            </Col>


                                            <Col span={4}>
                                                <div className="col-md-12">
                                                <label className="form-label">RENAVAM</label>
                                                <input
                                                    disabled={statusSefaz}
                                                    type="text"
                                                    className="form-control"
                                                    value={veicReboque.RENAVAM}
                                                    onChange={(e)=> handleFormChange(index, 'RENAVAM', e.target.value)} 
                                                />
                                                </div>
                                            </Col>

                                            <Col span={4}>
                                                <div className="col-md-12">
                                                <label className="form-label">RNTRC</label>
                                                <input
                                                    disabled={statusSefaz}
                                                    type="text"
                                                    className="form-control" 
                                                    value={veicReboque.prop.RNTRC}
                                                    onChange={(e)=> handleFormChange(index, 'RNTRC', e.target.value)}
                                                    id="RNTRC"
                                                />
                                                </div>
                                            </Col>

                                            
                                            </Row>

                                            <Row gutter={16} style={{marginBottom: '30px'}}>
                                                <Col span={3}>
                                                    <div className="col-md-12">
                                                    <label className="form-label">Tara (kg)</label>
                                                    <input
                                                        disabled={statusSefaz}
                                                        className="form-control"
                                                        value={veicReboque.tara}
                                                        onChange={(e)=> handleFormChange(index, 'tara', e.target.value)} 
                                                    />
                                                    </div>
                                                </Col>
                                                <Col span={3}>
                                                    <div className="col-md-12">
                                                    <label className="form-label">Capacidade KG</label>
                                                    <input
                                                        disabled={statusSefaz}
                                                        className="form-control"
                                                        value={veicReboque.capKG}
                                                        onChange={(e)=> handleFormChange(index, 'capKG', e.target.value)} 
                                                        id="capKG"
                                                    />
                                                    </div>
                                                </Col>

                                                <Col span={3}>
                                                    <div className="col-md-12">
                                                    <label className="form-label">Capacidade M³</label>
                                                    <input
                                                        disabled={statusSefaz}
                                                        className="form-control"
                                                        value={veicReboque.capM3}
                                                        onChange={(e)=> handleFormChange(index, 'capM3', e.target.value)}
                                                        id="capM3"
                                                    />
                                                    </div>
                                                </Col>

                                                <Col span={3}>
                                                    <div className="col-md-12">
                                                    <label className="form-label">UF</label>

                                                        <select name="UF"
                                                                disabled={statusSefaz}
                                                                type="text"
                                                                className="form-control"
                                                                value={veicReboque.UF}
                                                                onChange={(e)=> handleFormChange(index, 'UF', e.target.value)}
                                                                id="UF"
                                                            >
                                                                <option value="AC">Acre (AC)</option>
                                                                <option value="AL">Alagoas (AL)</option>
                                                                <option value="AP">Amapá (AP)</option>
                                                                <option value="AM">Amazonas (AM)</option>
                                                                <option value="BA">Bahia (BA)</option>
                                                                <option value="CE">Ceará (CE)</option>
                                                                <option value="DF">Distrito Federal (DF)</option>
                                                                <option value="ES">Espírito Santo (ES)</option>
                                                                <option value="GO">Goiás (GO)</option>
                                                                <option value="MA">Maranhão (MA)</option>
                                                                <option value="MT">Mato Grosso (MT)</option>
                                                                <option value="MS">Mato Grosso do Sul (MS)</option>
                                                                <option value="MG">Minas Gerais (MG)</option>
                                                                <option value="PA">Pará (PA)</option>
                                                                <option value="PB">Paraíba (PB)</option>
                                                                <option value="PR">Paraná (PR)</option>
                                                                <option value="PE">Pernambuco (PE)</option>
                                                                <option value="PI">Piauí (PI)</option>
                                                                <option value="RJ">Rio de Janeiro (RJ)</option>
                                                                <option value="RN">Rio Grande do Norte (RN)</option>
                                                                <option value="RS">Rio Grande do Sul (RS)</option>
                                                                <option value="RO">Rondônia (RO)</option>
                                                                <option value="RR">Roraima (RR)</option>
                                                                <option value="SC">Santa Catarina (SC)</option>
                                                                <option value="SP">São Paulo (SP)</option>
                                                                <option value="SE">Sergipe (SE)</option>
                                                                <option value="TO">Tocantins (TO)</option>
                                                        </select>

                                                    </div>
                                                </Col>

                                                <Col span={4}>
                                                    <div className="col-md-12">
                                                        <label className="form-label">Tipo Carroceria</label>

                                                        <select
                                                                disabled={statusSefaz}
                                                                type="text"
                                                                className="form-control"
                                                                value={veicReboque.tpCar}
                                                                onChange={(e)=> handleFormChange(index, 'tpCar', e.target.value)}
                                                                id="tpCar"
                                                            >
                                                            <option value="00">não aplicável</option>
                                                            <option value="01">Aberta</option>
                                                            <option value="02">Fechada/Baú</option>
                                                            <option value="03">Granelera</option>
                                                            <option value="04">Porta Container</option>
                                                            <option value="05">Sider</option>

                                                        </select>

                                                    </div>
                                                </Col>

                                            </Row>

                                            <Row gutter={16} style={{ marginTop: 16 }}>
                                            <Col span={8}>
                                                <div className="col-md-12">
                                                <label className="form-label">Documento Proprietário</label>
                                                {
                                                veicReboque?.prop?.CNPJ ? 
                                                    <input
                                                        disabled={statusSefaz}
                                                        type="text"
                                                        className="form-control"
                                                        value={veicReboque?.prop?.CNPJ}
                                                        onChange={(e)=> handleFormChange(index, 'CNPJ', e.target.value)}
                                                        id="CNPJ"
                                                    />
                                                :

                                                    <input
                                                        disabled={statusSefaz}
                                                        type="text"
                                                        className="form-control"
                                                        value={veicReboque?.prop?.CPF}
                                                        onChange={(e)=> handleFormChange(index, 'CPF', e.target.value)}
                                                        id="CNPJ"
                                                    />

                                                }
                                                
                                                </div>
                                            </Col>

                                            <Col span={8}>
                                                <div className="col-md-12">
                                                <label className="form-label">Nome Proprietário</label>
                                                <input
                                                    disabled={statusSefaz}
                                                    type="text"
                                                    className="form-control"
                                                    value={veicReboque?.prop?.xNome}
                                                    onChange={(e)=> handleFormChange(index, 'xNome', e.target.value)}
                                                    id="xNome"
                                                />
                                                </div>
                                            </Col>

                                            
                                        </Row>
                                        
                                    </>
                                ))
                            }
                            

                        </Card>
                    </TabPane>

                    <TabPane tab="Documentos" key="3">

                        <Card
                            title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                <InfoCircleOutlined style={{ marginRight: 8 }} />
                                Documentos Fiscais Vinculados
                                </div>
                                <div>
                                <Button disabled={statusSefaz} onClick={handleOpen} type="primary" style={{ marginRight: 8 }}>
                                    Importar XML
                                </Button>
                                <Button disabled={statusSefaz} onClick={addIncoicesSelected} type="primary" style={{ background: "red" }}>
                                    Adicionar Manualmente
                                </Button>
                                </div>
                            </div>
                            }
                            className="custom-card"
                            style={{ marginBottom: '10px' }}
                        >
                            {
                                infDocument.map((invoice, index) => ( 
                                        <>
                                            <Row gutter={16} key={index}>
                                                <Col span={8}>
                                                    <div className="col-md-12">
                                                    <label htmlFor="chNFe" className="form-label">Chave <span style={{ color: 'red' }}>*</span></label>
                                                    <input
                                                        disabled={statusSefaz}
                                                        type="text"
                                                        onChange={(e) => handleInvoicesSelectedChange(index, 'chNFe', e.target.value)}
                                                        value={invoice.chNFe || ''}
                                                        className={`form-control ${invoice.chNFe === '' ? 'empty-field' : ''}`}
                                                        id="chNFe"
                                                    />
                                                    </div>
                                                </Col>

                                                <Col span={4}>

                                                    <div className="col-md-12">
                                                        <label htmlFor="valorNf" className="form-label">
                                                        Valor <span style={{ color: 'red' }}>*</span>
                                                        </label>

                                                        <NumericFormat
                                                            disabled={statusSefaz}
                                                            id="valorNf"
                                                            className={`form-control ${invoice.valorNf === '' ? 'empty-field' : ''}`}
                                                            value={invoice.valorNf || ''}
                                                            onValueChange={(values) => {
                                                                const { value } = values; // valor sem máscara
                                                                handleInvoicesSelectedChange(index, 'valorNf', value);
                                                            }}
                                                            thousandSeparator="."
                                                            decimalSeparator=","
                                                            prefix="R$ "
                                                            allowNegative={false}
                                                            decimalScale={2}
                                                            fixedDecimalScale
                                                        />
                                                    </div>

                                                </Col>

                                                <Col span={4}>
                                                    <div className="col-md-12">
                                                    <label htmlFor="cMunDescarga" className="form-label">Cód municipio descarga </label>
                                                    <input
                                                        disabled={statusSefaz}
                                                        type="text"
                                                        onChange={(e) => handleInvoicesSelectedChange(index, 'cMunDescarga', e.target.value)}
                                                        value={invoice.cMunDescarga || ''}
                                                        className={`form-control ${invoice.cMunDescarga === '' ? 'empty-field' : ''}`}
                                                        id="cMunDescarga"
                                                    />
                                                    </div>
                                                </Col>
                                                <Col span={4}>
                                                    <div className="col-md-12">
                                                    <label htmlFor="xMunDescarga" className="form-label">Municipio descarga <span style={{ color: 'red' }}>*</span></label>
                                                    <input
                                                        disabled={statusSefaz}
                                                        type="text"
                                                        onChange={(e) => handleInvoicesSelectedChange(index, 'xMunDescarga', e.target.value)}
                                                        value={invoice.xMunDescarga || ''}
                                                        className={`form-control ${invoice.xMunDescarga === '' ? 'empty-field' : ''}`}
                                                        id="xMunDescarga"
                                                    />
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row gutter={16} key={index}>
                                            <Col span={4}>

                                                <div className="col-md-12">
                                                    <label htmlFor="pesoB" className="form-label">
                                                    Peso Bruto <span style={{ color: 'red' }}>*</span>
                                                    </label>

                                                    <NumericFormat
                                                        disabled={statusSefaz}
                                                        id="pesoB"
                                                        className={`form-control ${invoice.pesoB === '' ? 'empty-field' : ''}`}
                                                        value={invoice.pesoB || ''}
                                                        onValueChange={(values) => {
                                                            const { value } = values; // valor sem máscara
                                                            handleInvoicesSelectedChange(index, 'pesoB', value);
                                                        }}
                                                        thousandSeparator="."
                                                        decimalSeparator=","
                                                        prefix="R$ "
                                                        allowNegative={false}
                                                        decimalScale={2}
                                                        fixedDecimalScale
                                                    />
                                                </div>

                                            </Col>

                                            <Col span={4}>

                                                <div className="col-md-12">
                                                    <label htmlFor="pesoL" className="form-label">
                                                    Peso líquido <span style={{ color: 'red' }}>*</span>
                                                    </label>

                                                    <NumericFormat
                                                        disabled={statusSefaz}
                                                        id="pesoL"
                                                        className={`form-control ${invoice.pesoL === '' ? 'empty-field' : ''}`}
                                                        value={invoice.pesoL || ''}
                                                        onValueChange={(values) => {
                                                            const { value } = values; // valor sem máscara
                                                            handleInvoicesSelectedChange(index, 'pesoL', value);
                                                        }}
                                                        thousandSeparator="."
                                                        decimalSeparator=","
                                                        prefix="R$ "
                                                        allowNegative={false}
                                                        decimalScale={2}
                                                        fixedDecimalScale
                                                    />
                                                </div>

                                            </Col>
                                        </Row>
                                        </>
                                    ))

                            }

                            {(() => {
                            
                                const totalValor = vCarga.toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                });

                                return (
                                    <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                                    <Row gutter={16}>
                                        <Col span={6}></Col>
                                        <Col span={4}><strong>Total Valor:</strong> {totalValor}</Col>
                                        <Col span={4}></Col>
                                    </Row>
                                    </div>
                                );
                            })()}

                        </Card>
                        
                    </TabPane>

                    <TabPane tab="Produto Predominante" key="4">

                        <Card title={<><CarOutlined />Produto Predominante </>} className="custom-card" style={{marginBottom: '10px'}}>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <div className="col-md-12">
                                    <label htmlFor="tpCarga" className="form-label">
                                        Tipo de Carga <span style={{ color: 'red' }}>*</span>
                                    </label>

                                        <select
                                                disabled={statusSefaz}
                                                type="text"
                                                id="tpCarga"
                                                className="form-control"
                                                value={tpCarga}
                                                onChange={(e) => setTpCarga(e.target.value)}
                                            >
                                            <option value="01">Granel sólido</option>
                                            <option value="02">Granel líquido</option>
                                            <option value="03">Frigorificada</option>
                                            <option value="04">Conteinerizada</option>
                                            <option value="05">Carga Geral</option>
                                            <option value="06">Neogranel</option>
                                            <option value="07">Perigosa (granel sólido)</option>
                                            <option value="08">Perigosa (granel líquido)</option>
                                            <option value="09">Perigosa (carga frigorificada)</option>
                                            <option value="10">Perigosa (conteinerizada)</option>
                                            <option value="11">Perigosa (carga geral)</option>
                                        </select>

                                    </div>
                                </Col>

                                <Col span={12}>
                                    <div className="col-md-12">
                                    <label htmlFor="xProd" className="form-label">
                                        Descrição do Produto Predominante <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <input
                                        disabled={statusSefaz}
                                        type="text"
                                        id="xProd"
                                        className="form-control"
                                        value={xProd}
                                        onChange={(e) => setXProd(e.target.value)}
                                    />
                                    </div>
                                </Col>
                                <Col span={3}>
                                    <div className="col-md-12">
                                    <label htmlFor="ncm" className="form-label">
                                        NCM <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <input
                                        disabled={statusSefaz}
                                        type="text"
                                        id="ncm"
                                        className="form-control"
                                        value={ncm}
                                        onChange={(e) => setNcm(e.target.value)}
                                    />
                                    </div>
                                </Col>
                                </Row>

                                <Row gutter={16}>
                                <Col span={6}>
                                    <div className="col-md-12">
                                    <label htmlFor="cepCarrega" className="form-label">
                                        CEP Carregamento <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <input
                                        disabled={statusSefaz}
                                        type="text"
                                        id="cepCarrega"
                                        className="form-control"
                                        value={cepCarrega}
                                        onChange={(e) => setCepCarrega(e.target.value)}
                                    />
                                    </div>
                                </Col>

                                <Col span={6}>
                                    <div className="col-md-12">
                                    <label htmlFor="cepDescarrega" className="form-label">
                                        CEP Descarregamento <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <input
                                        disabled={statusSefaz}
                                        type="text"
                                        id="cepDescarrega"
                                        className="form-control"
                                        value={cepDescarrega}
                                        onChange={(e) => setCepDescarrega(e.target.value)}
                                    />
                                    </div>
                                </Col>
                                </Row>

                        </Card>

                        <Card title={<><CarOutlined />Seguradora </>}>
                            <Row gutter={16}>
                                <Col span={4}>
                                    <div className="col-md-12">
                                        <label htmlFor="cepCarrega" className="form-label">
                                            <Tooltip  color="#012442"  title="1 - Emitente do MDF-e 22 - Responsável pela contratação do serviço de transporte (contratante) Dados obrigatórios apenas no modal Rodoviário, depois da lei 11.442/07. Para os demais modais esta informação é opcional.">
                                                Responsável Seguro <span style={{ color: 'red' }}>*</span>
                                            </Tooltip>
                                        </label>

                                        <select
                                            disabled={statusSefaz}
                                            id="respSeg"
                                            name="respSeg"
                                            className="form-control"
                                            value={respSeg}
                                            onChange={(e) => setRespSeg(e.target.value)}
                                        >
                                            <option defaultValue="">Selecione</option>
                                            <option value="1">Emitente do MDF-e</option>
                                            <option value="22">Responsável pela contratação do serviço de transporte</option>
                                        </select>

                                        {/* <input
                                            type="text"
                                            id="cepCarrega"
                                            className="form-control"
                                            value={respSeg}
                                            onChange={(e) => setRespSeg(e.target.value)}
                                        /> */}
                                    </div>
                                </Col>
                                <Col span={4}>
                                    <div className="col-md-12">
                                        <label htmlFor="CNPJSeguro" className="form-label">
                                            CNPJ Seguro <span style={{ color: 'red' }}>*</span>
                                        </label>
                                        <input
                                            disabled={statusSefaz}
                                            type="text"
                                            id="CNPJSeguro"
                                            className="form-control"
                                            value={CNPJSeguro}
                                            onChange={(e) => setCNPJSeguro(e.target.value)}
                                        />
                                    </div>
                                </Col>
                                <Col span={4}>
                                    <div className="col-md-12">
                                        <label htmlFor="xSeg" className="form-label">
                                            Nome Seguradora <span style={{ color: 'red' }}>*</span>
                                        </label>
                                        <input
                                            disabled={statusSefaz}
                                            type="text"
                                            id="xSeg"
                                            className="form-control"
                                            value={xSeg}
                                            onChange={(e) => setXseg(e.target.value)}
                                        />
                                    </div>
                                </Col>
                                <Col span={4}>

                                    <div className="col-md-12">
                                        <label htmlFor="CNPJInfSeg" className="form-label">
                                            CNPJ Info Seguradora <span style={{ color: 'red' }}>*</span>
                                        </label>
                                        <input
                                            disabled={statusSefaz}
                                            type="text"
                                            id="CNPJInfSeg"
                                            className="form-control"
                                            value={CNPJInfSeg}
                                            onChange={(e) => setCNPJInfSeg(e.target.value)}
                                        />
                                    </div>

                                </Col>
                                <Col span={4}>
                                    <div className="col-md-12">
                                        <label htmlFor="nApol" className="form-label">
                                            Nº Apólice <span style={{ color: 'red' }}>*</span>
                                        </label>
                                        <input
                                            disabled={statusSefaz}
                                            type="text"
                                            id="nApol"
                                            className="form-control"
                                            value={nApol}
                                            onChange={(e) => setNapol(e.target.value)}
                                        />
                                    </div>
                                </Col>
                                <Col span={4}>
                                    <div className="col-md-12">
                                        <label htmlFor="nAver" className="form-label">
                                            Nº Averbação <span style={{ color: 'red' }}>*</span>
                                        </label>
                                        <input
                                            disabled={statusSefaz}
                                            type="text"
                                            id="nAver"
                                            className="form-control"
                                            value={nAver}
                                            onChange={(e) => setNaver(e.target.value)}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Card>

                        

                    </TabPane>

                    <TabPane tab="Totalizadores" key="5">
                        <Card title={<><CarOutlined /> Totalizadores </>} className="custom-card" style={{marginBottom: '10px'}}>
                            <Row gutter={16}>
                            
                                <Col span={4}>
                                    <div className="col-md-12">
                                    <label htmlFor="qNFe" className="form-label">
                                        Quantidade de NF-e
                                    </label>
                                    <input
                                        disabled={statusSefaz}
                                        id="qNFe"
                                        className="form-control"
                                        value={qNFe}
                                        onChange={(e) => setQNFe(Number(e.target.value))}
                                    />
                                    </div>
                                </Col>

                                <Col span={4}>
                                    <div className="col-md-12">
                                    <label htmlFor="vCarga" className="form-label">
                                        Vl Total da Carga (R$)
                                    </label>
                                    <input
                                        disabled={statusSefaz}
                                        id="vCarga"
                                        className="form-control"
                                        value={vCarga}
                                        onChange={(e) => setVCarga(Number(e.target.value))}
                                    />
                                    </div>
                                </Col>

                                <Col span={4}>
                                    <div className="col-md-12">
                                    <label htmlFor="cUnid" className="form-label">
                                        Unidade de Medida
                                    </label>
                                    <select
                                        disabled={statusSefaz}
                                        id="cUnid"
                                        className="form-control"
                                        value={cUnid}
                                        onChange={(e) => setCUnid(e.target.value)}
                                    >
                                        <option defaultValue="">Selecione</option>
                                        <option value="01">KG</option>
                                        <option value="02">TON</option>
                                    </select>
                                    </div>
                                </Col>

                                <Col span={4}>
                                    <div className="col-md-12">
                                    <label htmlFor="qCarga" className="form-label">
                                        <Tooltip  color="#012442"  title="Informe a quantidade total da carga transportada. Deve estar de acordo com a unidade (ex: KG, TON, M3). Use até 4 casas decimais.">
                                            Quantidade da Carga <span style={{ color: 'red' }}>*</span>
                                        </Tooltip>

                                    </label>
                                        <NumericFormat
                                            disabled={statusSefaz}
                                            id="qCarga"
                                            name="qCarga"
                                            className="form-control"
                                            value={qCarga}
                                            onValueChange={(values) => {
                                                setQCarga(values.floatValue ?? 0);
                                            }}
                                            decimalScale={4}
                                            fixedDecimalScale
                                            allowNegative={false}
                                            placeholder="Ex: 2500.0000"
                                            thousandSeparator={false}
                                            allowLeadingZeros={false}
                                        />
                                    </div>

                                </Col>
                            </Row>

                        </Card>


                    </TabPane>

                </Tabs>

                <RetornoMdfeModal open={open} setOpen={setOpen} mensagem={mensagem} title={title} status={status}/>
                
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

                <Footer style={{ textAlign: 'right', padding: '16px 24px' }}>
                    <Button danger style={{ marginRight: 8, borderColor: '#FF3100', color: '#FF3100' }}>Cancelar</Button>
                    <Button disabled={statusSefaz} type="primary" onClick={updateMdfe} style={{ backgroundColor: '#FF3100', borderColor: '#FF3100' }}>Salvar MDF-e</Button>
                </Footer>
        </Spin>
      </Layout>
    
    
     }/>
    
    </>

  );
}