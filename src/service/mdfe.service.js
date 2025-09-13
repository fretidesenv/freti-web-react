import axios from 'axios';
import firebase from '../config/firebase';
import Utils from '../util/utils';
import driverService from './driver.service';
import freightService from './freight.service';
import { format } from 'date-fns';
require('firebase/auth')

const mdfeService = {

  async get(id){
    return await firebase.firestore()
      .collection('tb_mdfe')
      .doc(id)
      .get();
  },

  async getShipper(idFreight){
    
    return await firebase.firestore()
      .collection("shipper")
      .doc(idFreight)
      .get();
  },

  async getShipperByCnpj(cnpj){
    
    return await firebase.firestore()
      .collection("shipper")
      .where("dataPersonal.documentNumber", "==", cnpj)
      .get();
  },
// -------------------------- calculo chave MDF-e --------------------------
  
  gerarChaveMDFe(
    cUF, 
    ano,
    mes,
    cnpj,
    mod,
    serie,
    numero,
    tipoEmissao,
    codigoNumerico ) {

      const chaveSemDV =
        cUF.toString().padStart(2, '0') +
        ano.toString().padStart(2, '0') +
        mes.toString().padStart(2, '0') +
        cnpj.toString().padStart(14, '0') +
        mod.toString().padStart(2, '0') +
        serie.toString().padStart(3, '0') +
        numero.toString().padStart(9, '0') +
        tipoEmissao.toString().padStart(1, '0') +
        codigoNumerico.toString().padStart(8, '0');

      return chaveSemDV;
  },

  calcularDV (chave) {
      const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
      let soma = 0;
      let pesoIndex = 0;

      for (let i = chave.length - 1; i >= 0; i--) {
        soma += Number(chave[i]) * pesos[pesoIndex];
        pesoIndex = (pesoIndex + 1) % pesos.length;
      }

      const resto = soma % 11;
      return resto === 0 || resto === 1 ? 0 : 11 - resto;
  },

  gerarCodigoNumerico() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  },


  typeVehicle(type){

    console.log("Tipo de veículo: " + type);
    debugger

    switch (type) { 
        case "TRUCK" :
            return "01"; 
        case "BI-TRUCK" :
            return "01"; 
        case "TOCO":
            return "02"; 
        case "3/4":
            return "02"; 
        case "CARRETA S" :
            return "03";    
        case "CARRETA LS" :
            return "03";    
        case "RODOTREM" :
            return "03";    
        case "VANDERLEIA" :
            return "03";    
        case "VAN":
            return "04"; 
        case "FIORINO": 
            return "05";     
        case "VUC": 
            return "05";     
    }
  },


  typeCarroceria(tipoCarroceria, typeVehicleGlobal){

    console.log("Tipo de carroceria: " + tipoCarroceria);
    console.log("Tipo de veículo global: " + typeVehicleGlobal);

      if(typeVehicleGlobal == "03"){
        return "00";
      }else if(tipoCarroceria == "CAÇAMBA" || "GRADE BAIXA" || "PLATAFORMA" || "PRANCHA" || "CAVAQUEIRA" || "CEGONHEIRO" || "GAIOLA" || "HOPPER" || "MUNCK"){
        return "01";
      }else if(tipoCarroceria == "BAÚ" || "BAÚ FRIGORIFICO" || "BAÚ REFRIGERADO" || "SILLO" || "TANQUE"){
        return "02";
      }else if(tipoCarroceria == "GRANELEIRO"){
        return "03";
      }else if(tipoCarroceria == "BUG PORTA CONTAINER"){
        return "04";
      }else if(tipoCarroceria == "SIDER"){
        return "05";
      }
  },

  gerarChaveAcessoMDFe(codigoGerado, documentNumber, estado, serie, number) {

    console.log("Estado: " + estado);
    console.log("Série: " + serie);
    console.log("Número: " + number);
    console.log("Código gerado: " + codigoGerado);
    console.log("Documento: " + documentNumber);


    var chaveSemDV = this.gerarChaveMDFe(estado, 
                      Utils.extrairAno(new Date()),
                      Utils.extrairMes(new Date()),
                      Utils.removerCaracteresEspeciais(documentNumber.trim()),
                      "58",
                      serie,
                      number,
                      1, //Emissão normal (online, autorizada na hora)
                      codigoGerado); //codigoNumerico deve ser 8 digitos, por isso o zero

        return chaveSemDV;

  },

  
  async sendMdfe(idMdfe) {

    var retorno = null;

      await this.get(idMdfe).then(async item=> {
            var mdf = item.data();
            var mdfe = item.data().infMDFe;


            let dataEmiss = mdfe.ide.dhEmi ? format(new Date(mdfe.ide.dhEmi.seconds * 1000), 'yyyy-MM-dd') : "";
            let dataIniViagem = mdfe.ide.dhIniViagem ? format(new Date(mdfe.ide.dhIniViagem.seconds * 1000), 'yyyy-MM-dd') : "";

            var ide = {
                cUF: mdfe.ide.cUF || 0,
                tpAmb: parseInt(mdfe.ide.tpAmb ? mdfe.ide.tpAmb : 2),//ambiente 1 produção 2 homologação
                tpEmit: mdfe.ide.tpEmit ? parseInt(mdfe.ide.tpEmit) : 2, //tipo do emitente (1 – prestador de serviço, 2 – carga própria)
                
                tpTransp: mdfe.ide.tpTransp ? parseInt(mdfe.ide.tpTransp) : 2,

                mod: mdfe.ide.mod || 58,//modelo do MDF-e (deve ser 58)
                serie: parseInt(mdfe.ide.serie) || 0,
                nMDF: parseInt(mdfe.ide.nMDF ? mdfe.ide.nMDF : 0),
                cMDF: mdfe.ide.cMDF + "" || "00000000",//modulo gerado automaticamente
                cDV: mdfe.ide.cDV || 0, //digito verificador do MDF-e, deve ser preenchido com o dígito verificador da chave de acesso do MDF-e
                modal: mdfe.ide.modal || 1,//tipo de modal (01 a 05)
                dhEmi: dataEmiss || "", //AAAA-MM-DDTHH:MM:DD TZD
                tpEmis: mdfe.ide.tpEmis || 1,
                procEmi: mdfe.ide.procEmi || "0", //0 - emissão de MDF-e com aplicativo do contribuinte
                verProc: mdfe.ide.verProc || "1.0.0",//Versão do processo de emissão. Informar a versão do aplicativo emissor de MDF-e
                UFIni: mdfe.ide.UFIni || "",
                UFFim: mdfe.ide.UFFim || "",
                infMunCarrega: mdfe.ide.infMunCarrega || [],
                infPercurso:  mdfe.ide.infPercurso || [],
                dhIniViagem: dataIniViagem || "", //AAAA-MM-DDTHH:MM:DD TZD
                 ...(mdfe.ide.indCarregaPosterior === 1) ? {
                    indCarregaPosterior: parseFloat(mdfe.ide.indCarregaPosterior ? mdfe.ide.indCarregaPosterior : 0)
                  } : {}
            }
            var emit = {
              CNPJ: Utils.removerCaracteresEspeciais(mdfe.emit.CNPJ ? mdfe.emit.CNPJ : ""),
              IE: Utils.removerCaracteresEspeciais(mdfe.emit.IE ? mdfe.emit.IE : ""),
              xNome: mdfe.emit.xNome ? mdfe.emit.xNome : "",
              xFant: mdfe.emit.xFant ? mdfe.emit.xFant : "",
              enderEmit: {
                xLgr: mdfe.emit.enderEmit.xLgr ? mdfe.emit.enderEmit.xLgr : "",
                nro: mdfe.emit.enderEmit.nro ? mdfe.emit.enderEmit.nro : "",
                xCpl: mdfe.emit.enderEmit.xCpl ? mdfe.emit.enderEmit.xCpl : "",
                xBairro: mdfe.emit.enderEmit.xBairro ? mdfe.emit.enderEmit.xBairro : "",
                cMun: mdfe.emit.enderEmit.cMun + "" || "0000000", //Código do município (utilizar a tabela do IBGE), Caso não seja informado, será utilizado o do cadastro da empresa
                xMun: mdfe.emit.enderEmit.xMun || "",
                CEP: Utils.apenasNumerico(mdfe.emit.enderEmit.CEP ? mdfe.emit.enderEmit.CEP : ""),
                UF: mdfe.emit.enderEmit.UF || "",
                fone: Utils.apenasNumerico(mdfe.emit.enderEmit.fone ? mdfe.emit.enderEmit.fone : ""),
                email: mdfe.emit.enderEmit.email || ""
              }
            }
            
            var infModal = {
                versaoModal: "3.00",
                rodo: {
                  infANTT: {
                    RNTRC: mdfe.infModal.rodo.infANTT.RNTRC || "",
                    infCIOT: [
                    ],
                    infContratante: [{
                        xNome: mdfe.infModal.rodo.infANTT.infContratante[0]?.xNome || "",
                        CNPJ: Utils.removerCaracteresEspeciais(mdfe.infModal.rodo.infANTT.infContratante[0]?.CNPJ.trim()) || "",

                        ...(mdfe.infModal.rodo.infANTT.infContratante[0]?.infContrato?.NroContrato != "" 
                            && parseFloat(mdfe.infModal.rodo.infANTT.infContratante[0].infContrato.vContratoGlobal) > 0) ? {
                              infContrato: {
                                NroContrato: mdfe.infModal.rodo.infANTT.infContratante[0]?.infContrato?.NroContrato || "",
                                vContratoGlobal: parseFloat(mdfe.infModal.rodo.infANTT.infContratante[0]?.infContrato.vContratoGlobal ? mdfe.infModal.rodo.infANTT.infContratante[0]?.infContrato.vContratoGlobal : 0)
                              }
                            } : {}                        
                    }],
                    infPag: [
                        {
                          xNome: mdfe.infModal.rodo.infANTT?.infPag[0]?.xNome || "",
                          CNPJ: mdfe.infModal.rodo.infANTT?.infPag[0]?.CNPJ || "",
                          Comp: [
                              {
                                tpComp: mdfe.infModal.rodo.infANTT?.infPag[0]?.Comp[0]?.tpComp || "",//Despesas (bancarias, meios de pagamento, outras)
                                vComp: parseFloat(mdfe.infModal.rodo.infANTT?.infPag[0]?.Comp[0].vComp ? mdfe.infModal.rodo.infANTT.infPag[0]?.Comp[0].vComp : 0),
                              }
                            ],
                            vContrato: parseFloat(mdfe.infModal.rodo.infANTT?.infPag[0]?.vContrato ? mdfe.infModal.rodo.infANTT.infPag[0]?.vContrato : 0),
                            indPag: parseInt(mdfe.infModal.rodo.infANTT?.infPag[0]?.indPag ? mdfe.infModal.rodo.infANTT.infPag[0]?.indPag : 1), //1 - Pagamento à Prazo
                          infPrazo: [
                            {
                              nParcela: parseInt(mdfe.infModal.rodo.infANTT?.infPag[0]?.infPrazo[0]?.nParcela ? mdfe.infModal.rodo.infANTT.infPag[0]?.infPrazo[0]?.nParcela : 0),
                              dVenc: mdfe.infModal.rodo.infANTT?.infPag[0]?.infPrazo[0]?.dVenc ? mdfe.infModal.rodo.infANTT?.infPag[0]?.infPrazo[0]?.dVenc : "",
                              vParcela: parseFloat(mdfe.infModal.rodo.infANTT?.infPag[0]?.infPrazo[0]?.vParcela ? mdfe.infModal.rodo.infANTT.infPag[0]?.infPrazo[0]?.vParcela : 0)
                            }
                          ],
                          infBanc: {
                            codBanco: "341",
                            codAgencia: "0001",
                          }
                        }
                    ]
                  },
                  veicTracao: mdfe.infModal.rodo.veicTracao || {},
                  veicReboque: mdfe.infModal.rodo.veicReboque || [],
                },
              }

            var infMun = [];

            mdfe.infDoc.infMunDescarga.forEach(item => {
                infMun.push({
                    cMunDescarga: item.cMunDescarga || "",
                    xMunDescarga: item.xMunDescarga || "",
                    infNFe: [
                        {
                            chNFe: item.chNFe || ""
                        }
                    ],
                })
            })

            //Essa tag será enviada várias vezes, caso tenha mais de uma entrega ? 
            var infDoc = {
                infMunDescarga: infMun || []
            }

            var prodPred = mdfe.prodPred || {}

            var seg = [
                {
                  infResp: {
                    respSeg: mdfe.seg[0].infResp.respSeg || "", 
                    CNPJ: mdfe.seg[0].infResp.CNPJ || "", 
                  },
                  infSeg: {
                    xSeg: mdfe.seg[0].infSeg.xSeg || "",
                    CNPJ: mdfe.seg[0].infSeg.CNPJ || "",
                  },
                    nApol: mdfe.seg[0].nApol || "",
                    nAver: mdfe.seg[0].nAver || "",
                }
            ]

            var tot = mdfe.tot || {}

            var data = {
              infMDFe : {
                versao: mdfe.versao,
                Id: mdfe.Id,
                ide: ide,
                emit: emit,
                infModal: infModal,
                infDoc: infDoc,
                prodPred: prodPred,
                seg: seg,
                tot: tot,
              },
              ambiente: mdf.ambiente,
              referencia: mdf.referencia,

            }

            console.log("OBJETO PARA ENVIO DE MDFE")
            console.log(data)

            retorno = data;

        })

        return retorno;
  },


  getChaveAcesso(codigoGerado, documentNumberEmbarcador, codigo_ibge, serie, numberMdfe){

        var chaveSemDV = this.gerarChaveAcessoMDFe(codigoGerado, documentNumberEmbarcador, codigo_ibge, serie, numberMdfe)
        var chaveSemLabel = chaveSemDV.replace("MDFe", "");
        var digitoDV = this.calcularDV(chaveSemLabel);
        
        var chaveMDFSemLabel = chaveSemDV + digitoDV;
        var chaveMDFe = 'MDFe' + chaveMDFSemLabel.trim();

        return chaveMDFe;
  },

  getOwnerVehicleTracao(driver){
    console.log("Tipo proprietário: " + driver.vehicle.tipoProprietario);

    var cnpjOuCpf = Utils.removerCaracteresEspeciais(driver.vehicle.cpfoucnpj);

    if(cnpjOuCpf.length > 11) {
      return {
          CNPJ: cnpjOuCpf, 
          RNTRC: driver.vehicle.rntrc.trim(), 
          xNome: driver.vehicle.nomeProprietario.trim(),
          tpProp: parseInt(1) // 1 - CNPJ, 0 - CPF
      }
    }else {
      return {
          CPF: cnpjOuCpf,
          RNTRC: driver.vehicle.rntrc.trim(), 
          xNome: driver.vehicle.nomeProprietario.trim(),
          tpProp: parseInt(0) // 1 - CNPJ, 0 - CPF
      }
    }

  },

  verifyOwnerVehicleReboque(reboque){

      if( Utils.removerCaracteresEspeciais(reboque.cpfoucnpjReboque).length > 11) {
        return {
            CNPJ: Utils.removerCaracteresEspeciais(reboque.cpfoucnpjReboque), 
            RNTRC: reboque.rntrcReboque.trim(), 
            xNome: reboque.nomeProprietarioReboque.trim(),
            tpProp: parseInt(1)// 1 - CNPJ, 0 - CPF
      }     
      }else{
        return {
              CPF: Utils.removerCaracteresEspeciais(reboque.cpfoucnpjReboque),
              RNTRC: reboque.rntrcReboque.trim(), 
              xNome: reboque.nomeProprietarioReboque.trim(),
              tpProp: parseInt(0) // 1 - CNPJ, 0 - CPF
        }     
      }
  },

  getReboque(reboqueDriver, tipoVeiculo){
      const reboques = [];

    reboqueDriver.forEach(reboque => {

        const reboqueData = {
          cInt: this.gerarCodigoNumerico(), // Identificador do reboque
          placa: Utils.removerCaracteresEspeciais(reboque?.placaReboque), 
          RENAVAM: reboque?.renavamReboque.trim() || "null",
          tara: reboque?.pesoTaraReboque ? parseInt(reboque?.pesoTaraReboque) : 0,
          capKG: reboque?.capacidadeKGReboque ? parseInt(reboque?.capacidadeKGReboque) : 0,
          capM3: reboque?.capacidadeM3Reboque ? parseInt(reboque?.capacidadeM3Reboque) : 0,
          prop: this.verifyOwnerVehicleReboque(reboque),
          tpCar: this.typeCarroceria(reboque?.TipoCarroceriaReboque, tipoVeiculo),
          UF: reboque?.ufReboque.trim() || "null"
        };

        reboques.push(reboqueData);
    });

    return reboques;
  },



  async verifyMdfeExiste(idFreight){



  },


   isCPF(value) {
      value = value.replace(/[^\d]+/g, ""); // remove tudo que não for número
      if (value.length !== 11 || /^(\d)\1{10}$/.test(value)) return false;

      let soma = 0;
      for (let i = 0; i < 9; i++) soma += parseInt(value.charAt(i)) * (10 - i);
      let resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(value.charAt(9))) return false;

      soma = 0;
      for (let i = 0; i < 10; i++) soma += parseInt(value.charAt(i)) * (11 - i);
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(value.charAt(10))) return false;

      return true;
    },

    isCNPJ(value) {
      value = value.replace(/[^\d]+/g, "");
      if (value.length !== 14 || /^(\d)\1{13}$/.test(value)) return false;

      let tamanho = value.length - 2;
      let numeros = value.substring(0, tamanho);
      let digitos = value.substring(tamanho);
      let soma = 0;
      let pos = tamanho - 7;
      for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      if (resultado !== parseInt(digitos.charAt(0))) return false;

      tamanho = tamanho + 1;
      numeros = value.substring(0, tamanho);
      soma = 0;
      pos = tamanho - 7;
      for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      if (resultado !== parseInt(digitos.charAt(1))) return false;

      return true;
    },


  async createPreMdfe(idFreight){

      console.log("INICIO CRIAÇÃO DE MDFE ")
      console.log(idFreight)

      freightService.getFreightById(idFreight).then(async item=> {

        //Frete
      var frete = item.data();

      //Embarcador -  numberSerial
      var shipper = await this.getShipperByCnpj(frete.clientPayment.cnpj)
      var embarcador = shipper.docs[0].data();

      //Motorista
      var driverData = await driverService.getDriverAvailableById(frete.freight.getDriverFreight.uidDriver);
      var driverDocuments = driverData.data();

      var points = await freightService.getStoppingPointsByFreight(idFreight);

      const pointsData = points.docs.map((doc) => doc.data());
      const sortedPoints = pointsData.sort((a, b) => a.stop_order - b.stop_order);

      const firstCepCargo = sortedPoints[0]?.cep || "";
      const lastCepCargo = sortedPoints.at(-1)?.cep || "";

      const ibge = Utils.buscarMunicipiosPorNome(frete.firstDelivery.city);

      const cMunicipioEmbarcador = Utils.buscarMunicipiosEmitentePorNome(embarcador.address.city);

      const infoMunDescarga = Utils.buscarMunicipiosDedescargaPorNome(frete.lastDelivery.city);

      const estado = Utils.buscarEstadoPorNome(embarcador.address.state);

      const codigoGerado = this.gerarCodigoNumerico();

      var driver = await driverService.getDriverAvailable(frete?.freight.getDriverFreight?.uidDriver);
      var fistDataDriver = driver.data();


      var chaveSemDV = this.gerarChaveAcessoMDFe(codigoGerado, embarcador.dataPersonal.documentNumber, estado[0].codigo_ibge, embarcador.mdfe.serie, embarcador.mdfe.number)
      var chaveSemLabel = chaveSemDV.replace("MDFe", "");
      var digitoDV = this.calcularDV(chaveSemLabel);
      var chaveMDFSemLabel = chaveSemDV + digitoDV;
      var chaveacesso = 'MDFe' + chaveMDFSemLabel.trim();

      var tipoVeiculo = this.typeVehicle(driverDocuments.vehicle.vehicleType);
 
      var ide = {
          cUF: parseInt(estado[0].codigo_ibge),
          tpAmb: parseInt(2),//ambiente 1 produção 2 homologação
          tpEmit: 2, //tipo do emitente (1 – prestador de serviço, 2 – carga própria)
          
          tpTransp: this.isCPF(driverDocuments.vehicle.cpfoucnpj) ? 2 : 1,// Tipo de transporte ETC, TAC, CTC

          mod: 58,//modelo do MDF-e (deve ser 58)
          serie: parseInt(embarcador.mdfe.serie),
          nMDF: parseInt(embarcador.mdfe.number),
          cMDF: codigoGerado + "",//modulo gerado automaticamente
          cDV: digitoDV, //digito verificador do MDF-e, deve ser preenchido com o dígito verificador da chave de acesso do MDF-e
          modal: 1,//tipo de modal (01 a 05)
          dhEmi: new Date(),
          tpEmis: 1,
          procEmi: "0", //0 - emissão de MDF-e com aplicativo do contribuinte
          verProc: "1.0.0",//Versão do processo de emissão. Informar a versão do aplicativo emissor de MDF-e
          UFIni: frete.firstDelivery.uf,
          UFFim: frete.lastDelivery.uf,
          infMunCarrega: ibge,
          infPercurso:  [],
          dhIniViagem: new Date(), //AAAA-MM-DDTHH:MM:DD TZD
          // indCanalVerde: 1,
          indCarregaPosterior: 0
      }

      var emit = {
        CNPJ: Utils.removerCaracteresEspeciais(embarcador.dataPersonal.documentNumber.trim()),
        IE: Utils.removerCaracteresEspeciais(embarcador.dataPersonal.inscricaoEstadual),
        xNome: embarcador.dataPersonal.socialName ? embarcador.dataPersonal.socialName.trim() : "",
        xFant: embarcador.dataPersonal.nameFantasy ? embarcador.dataPersonal.nameFantasy.trim() : "",
        enderEmit: {
          xLgr: embarcador.address.street ? embarcador.address.street.trim() : "",
          nro: embarcador.address.numeroEndereco ? embarcador.address.numeroEndereco.trim() : "",
          xCpl: embarcador.address.complement ? embarcador.address.complement.trim() : "",
          xBairro: embarcador.address.neighborhood ? embarcador.address.neighborhood.trim() : "",
          cMun: cMunicipioEmbarcador[0].codigo ? cMunicipioEmbarcador[0].codigo.toString().trim() : "", //Código do município (utilizar a tabela do IBGE), Caso não seja informado, será utilizado o do cadastro da empresa
          xMun: embarcador.address.city ? embarcador.address.city.trim() : "",
          CEP: Utils.apenasNumerico(embarcador.address.cep),
          UF: embarcador.address.state ? embarcador.address.state.trim() : "",
          fone: Utils.apenasNumerico(embarcador.contact.phoneNumberFirst),
          email: "fortio@fortio.com.br"
        }
      }
      

      var infModal = {
          versaoModal: "3.00",
          rodo: {
            infANTT: {
              RNTRC: driverDocuments.vehicle.rntrc ? driverDocuments.vehicle.rntrc.trim() : "",//cadastro do motorista
              infCIOT: [
              ],
              infContratante: [
                  {
                      xNome: embarcador.dataPersonal.socialName ? embarcador.dataPersonal.socialName.trim() : "",
                      CNPJ: Utils.removerCaracteresEspeciais(embarcador.dataPersonal.documentNumber),
                      infContrato: {
                          NroContrato: "",
                          vContratoGlobal: 0
                      } 
                  }
              ],
              infPag: [
                {
                  xNome: embarcador.dataPersonal.socialName.trim(),
                  CNPJ: embarcador.dataPersonal.documentNumber.trim(),
                  Comp: [
                      {
                        tpComp: "03",//ver depois //Despesas (bancarias, meios de pagamento, outras)
                        vComp: 500.00,//ver depois
                        // xComp: "string"
                      }
                    ],
                  vContrato: 500.00,//ver depois
                  // indAltoDesemp: 0,
                  indPag: 1, //1 - Pagamento à Prazo
                  // vAdiant: 0,
                  // indAntecipaAdiant: 0,
                  infPrazo: [
                    {
                      nParcela: 1,//ver depois
                      dVenc: "2025-12-31",//ver depois
                      vParcela: 500.00//ver depois
                    }
                  ],
                // tpAntecip: 0,
                  infBanc: {
                    codBanco: "341",//ver depois
                    codAgencia: "0001",//ver depois
                    // CNPJIPEF: "string",
                    // PIX: "string"
                  }
                }
              ]
            },
            veicTracao: {
              cInt: this.gerarCodigoNumerico(),//Identificador do veículo de tração
              placa: Utils.removerCaracteresEspeciais(driverDocuments.vehicle.vehiclePlate),
              RENAVAM: driverDocuments.vehicle.renavam ? driverDocuments.vehicle.renavam.trim() : "",
              tara: driverDocuments.vehicle.pesoTara ? parseInt(driverDocuments.vehicle.pesoTara) : 0,
              capKG: driverDocuments.vehicle.capacidadeKG ? parseInt(driverDocuments.vehicle.capacidadeKG) : 0,
              capM3: driverDocuments.vehicle.capacidadeM3 ? parseInt(driverDocuments.vehicle.capacidadeM3) : 0,
              //Proprietário ou possuidor do Veículo. Só preenchido quando o veículo não pertencer à empresa emitente do MDF-e.
              prop: this.getOwnerVehicleTracao(driverDocuments), //quando for proprietário devemos pegar o cnpj ou cpf do campo CPF/CNPJ Proprietário ?
              condutor: [//Informações do motorista
                {
                  xNome: driverDocuments.personalData.fullName ? driverDocuments.personalData.fullName.trim() : "",
                  CPF: Utils.removerCaracteresEspeciais(fistDataDriver.cpf),
                }
              ],
              tpRod: tipoVeiculo,
              tpCar: this.typeCarroceria(driverDocuments.vehicle.bodyworkType, tipoVeiculo),
              UF: driverDocuments.vehicle.ufVeiculo ? driverDocuments.vehicle.ufVeiculo.trim() : ""
            },
            veicReboque: this.getReboque(driverDocuments.vehicle.reboques, tipoVeiculo),
          },
        }

      //Essa tag será enviada várias vezes, caso tenha mais de uma entrega ? 
      var infDoc = {
          infMunDescarga: [
              {
                cMunDescarga: infoMunDescarga[0].cMunDescarga.toString().trim(), //Pegar o coleta 
                xMunDescarga: infoMunDescarga[0].xMunDescarga.trim(), //Pegar o coleta
                infCTe: [
                ],
                infNFe: [],
              
                infMDFeTransp: [] //getInfoMdfeTransp(mdf),              
                
              }
            ]
      }

      var prodPred = {
          tpCarga: "05",
          xProd: "",
          NCM: "23061000", //ver depois 
          infLotacao: 
          {
            infLocalCarrega: {
              CEP: Utils.removerCaracteresEspeciais(firstCepCargo ? firstCepCargo.trim() : ""),
            },
            infLocalDescarrega: {
              CEP: Utils.removerCaracteresEspeciais(lastCepCargo ? lastCepCargo.trim() : ""),
            }
          }
      }

      var seg = [
          {
            infResp: {
              respSeg: 1, //1 - Emitente do MDF-e 22 - Responsável pela contratação do serviço de transporte (contratante) Dados obrigatórios apenas no modal Rodoviário, depois da lei 11.442/07. Para os demais modais esta informação é opcional.
              CNPJ: embarcador.dataPersonal.documentNumber.trim(), //cnpj do embarcador 
            },
            infSeg: {
              xSeg: "AKAD SEGUROS S.A.",//o que está no MDF
              CNPJ: "14868712000131"
            },
              nApol: "27982025010621000407",//o que está no MDF
              nAver: [ //Nº Averbação
                "0279810255442364900022555001000000025141"
              ]
          }
      ]

      var tot = {
        qCTe: 0,
        qNFe: 0,
        qMDFe: 0,
        vCarga: 0,
        cUnid: "",
        qCarga: 0
      } 

      var dataOrigin = {
        idFreight: idFreight,
        idDriver: fistDataDriver.uid,
        idShipper: shipper.id ? shipper.id : frete.shipper.uid,
        freigthNumber: frete.numberSerial ? frete.numberSerial : "",
        dataInclusao: new Date(),
        numberFreight: frete.numberSerial + "",
      }

      var data = {
        infMDFe : {
          versao: "3.00",
          Id: chaveacesso,
          ide: ide,
          emit: emit,
          infModal: infModal,
          infDoc: infDoc,
          prodPred: prodPred,
          seg: seg,
          tot: tot,
          dataOrigin: dataOrigin
        },
        ambiente: "homologacao",
        referencia: idFreight,

      }

      console.log("OBJETO PARA SALVAR DE MDFE")
      console.log(data)

      debugger;

      firebase.firestore()
        .collection("tb_mdfe")
        .add(data)
        .then(() => {
            console.log("Pré MDF-e salvo com sucesso!");
            // Aqui você pode adicionar qualquer lógica adicional após salvar o MDF-e
        })
        .catch(error => {
            console.error("Erro ao salvar o MDF-e:", error);
        })


      }).catch(error => {
        console.log(error)
      })

  },
  

}

export default mdfeService;