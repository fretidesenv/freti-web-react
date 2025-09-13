import React, { useRef, useState } from 'react';
import { InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table, Spin, message } from 'antd';
import { Link } from "react-router-dom";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useSelector } from 'react-redux';
import SendIcon from '@mui/icons-material/Send';
import firebase from '../../config/firebase';
import mdfeService from '../../service/mdfe.service';
import axios from 'axios';
import RetornoMdfeModal from '../alert-mdfe/alert-mdfe-retorno';
import AddToPhotosRoundedIcon from '@mui/icons-material/AddToPhotosRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CancelIcon from '@mui/icons-material/Cancel';
require('firebase/auth')

const DataMdfeCompTable = ({data}) => {

  console.log("DataMdfeCompTable data", data);

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState("");
  const [title, setTitle] = useState("");
  
  const [open, setOpen] = useState(false);

  const user = useSelector(state => state.user)

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    if (selectedKeys.length > 0) {
      if (selectedKeys[0].trim().length > 0) {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
      } else {
        confirm();
        setSearchText('');
        setSearchedColumn(dataIndex);
      }
    } else {
      confirm();
      setSearchText('');
      setSearchedColumn(dataIndex);
    }
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  function deleteMdfe(id) {
    if (user.perfil === "Master") {
      var result = window.confirm("Deseja mesmo excluir esse MDFe ? ");
      if (result === true) {
        firebase.firestore()
          .collection('mdfe')
          .doc(id)
          .delete()
          .then(() => {
            alert("Documento excluído com sucesso!");
          })
      } else {
        return;
      }
    }
  }

  const getInformation = (id) => {
    const mdfeRef = firebase.firestore().collection('tb_mdfe').doc(id);
      mdfeRef.get().then((doc) => {
        if (doc.exists) {
          const data = doc.data();

          if(!data.retornoSefaz || !data.retornoSefaz.autorizacao) {
            setMensagem("Ainda não há status disponível para este MDF-e.");
            setTitle("Status: Iniciado");
            setStatus("error");
            setOpen(true);
            return;
          }

          setMensagem(`Motivo: ${data.retornoSefaz?.autorizacao.motivo_status || "Nenhum motivo informado"}\n`);
          setTitle("Status: " + data.retornoSefaz.status);
          setStatus(data.retornoSefaz.autorizacao.status === "autorizado" ? "success" : "error");
          setOpen(true);
        }
      }).catch((error) => {
          setMensagem(`error: ${error.message}`);
          setTitle("Status: Erro ao buscar informações");
          setStatus("error");
          setOpen(true);
      })
    }

   // Função de validação do JSON para envio de MDF-e
// utils de validação
    function apenasNumerico(valor) {
      return /^\d+$/.test(valor);
    }

    function validarTamanho(valor, min, max) {
      return valor && valor.length >= min && valor.length <= max;
    }

    function placaValida(placa) {
      const antiga = /^[A-Z]{3}[0-9]{4}$/;
      const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
      return antiga.test(placa) || mercosul.test(placa);
    }

// função principal
  function validarMDFe(mdfe) {
    const erros = [];

      const { cUF, tpAmb, tpEmit, tpTransp, mod, serie, nMDF, cMDF, cDV, modal, dhEmi, tpEmis, procEmi, verProc, UFIni, UFFim } = mdfe.infMDFe.ide;

      if (!cUF || String(cUF).length !== 2) erros.push("cUF deve ter 2 dígitos numéricos.");
      if (![1, 2].includes(tpAmb)) erros.push("tpAmb deve ser 1 (produção) ou 2 (homologação).");
      if (![1, 2].includes(tpEmit)) erros.push("tpEmit deve ser 1 (prestador) ou 2 (contratado).");
      if (![1, 2].includes(tpTransp)) erros.push("tpTransp deve ser 1 (carga própria) ou 2 (prestação de serviço).");
      if (mod !== 58) erros.push("mod deve ser '58'.");
      if (!Number.isInteger(serie) || serie < 1 || serie > 999) erros.push("serie deve ser número entre 1 e 999.");
      if (!Number.isInteger(nMDF) || nMDF <= 0) erros.push("nMDF deve ser número positivo.");
      if (!cMDF || String(cMDF).length !== 8) erros.push("cMDF deve ter 8 dígitos.");
      if (!cDV || String(cDV).length !== 1) erros.push("cDV deve ter 1 dígito.");
      if (!["1", "2", "3", "4"].includes(String(tpEmis))) erros.push("tpEmis inválido (1-Normal, 2-Contingência, etc.).");
      if (!procEmi) erros.push("procEmi é obrigatório.");
      if (!verProc) erros.push("verProc é obrigatório.");
      if (!UFIni || UFIni.length !== 2) erros.push("UFIni deve ter 2 caracteres.");
      if (!UFFim || UFFim.length !== 2) erros.push("UFFim deve ter 2 caracteres.");
      if (!dhEmi) erros.push("dhEmi é obrigatório.");


      const { CNPJ, IE, xNome, xFant, enderEmit } = mdfe.infMDFe.emit;
      if (!CNPJ || !/^\d{14}$/.test(CNPJ)) erros.push("CNPJ deve ter 14 dígitos.");
      if (!IE || !apenasNumerico(IE)) erros.push("IE deve ser numérico.");
      if (!validarTamanho(xNome, 2, 60)) erros.push("xNome deve ter entre 2 e 60 caracteres.");
      if (xFant && xFant.length > 60) erros.push("xFant deve ter até 60 caracteres.");


        const isEmpty = (value) => {
          return value === null || value === undefined || value === "";
        };

        const { xLgr, nro, xBairro, cMun, xMun, CEP, UF, fone, email } = enderEmit;

        if (isEmpty(xLgr)) erros.push("Logradouro do emitente é obrigatório.");
        if (isEmpty(nro)) erros.push("Número do emitente é obrigatório.");
        if (isEmpty(xBairro)) erros.push("Bairro do emitente é obrigatório.");

        // cMun: precisa existir + ser numérico
        if (isEmpty(cMun)) {
          erros.push("Código do municipio do emitente é obrigatório.");
        } else if (!apenasNumerico(cMun)) {
          erros.push("Código do municipio do emitente deve ser numérico.");
        }

        if (isEmpty(xMun)) erros.push("Municipio do emitente é obrigatório.");

        // CEP: precisa existir + ter 8 dígitos
        if (isEmpty(CEP)) {
          erros.push("CEP do emitente é obrigatório.");
        } else if (!/^\d{8}$/.test(CEP)) {
          erros.push("CEP do emitente deve ter 8 dígitos.");
        }

        // UF: precisa existir + ter 2 caracteres
        if (isEmpty(UF)) {
          erros.push("UF do emitente é obrigatório.");
        } else if (UF.length !== 2) {
          erros.push("UF do emitente deve ter 2 caracteres.");
        }

        // fone: só valida se foi informado
        if (isEmpty(fone) ) {
          erros.push("Obrigatório informar um número de telefone para o emitente");
        }else if (!apenasNumerico(fone)){
          erros.push("fone deve ser numérico.");
        }

        // email: só valida se foi informado
        if (!isEmpty(email) && !/.+@.+\..+/.test(email)) {
          erros.push("Obrigatório informar um e-mail válido para o emitente");
        }

        const { infANTT, veicTracao, veicReboque } = mdfe.infMDFe.infModal.rodo;
      
          if (!infANTT.RNTRC || !/^\d{8,12}$/.test(infANTT.RNTRC)) erros.push("RNTRC deve ter de 8 a 12 dígitos.");
            if (!infANTT.infContratante || infANTT.infContratante.length === 0) {
              erros.push("infContratante é obrigatório.");
            } 

       
          infANTT.infPag.forEach((p, i) => {
            if (!p.CNPJ || !/^\d{14}$/.test(p.CNPJ)) erros.push(`infPag[${i}].CNPJ inválido.`);
            if (!p.xNome) erros.push(`infPag[${i}].xNome é obrigatório.`);
            if (!p.vContrato || isNaN(p.vContrato)) erros.push(`infPag[${i}].vContrato deve ser numérico.`);
            if (![0, 1].includes(p.indPag)) erros.push(`infPag[${i}].indPag deve ser 0 (à vista) ou 1 (a prazo).`);
            if (p.Comp) {
              p.Comp.forEach((c, j) => {
                if (!c.tpComp) erros.push(`infPag[${i}].Comp[${j}].tpComp obrigatório.`);
                if (isNaN(c.vComp)) erros.push(`infPag[${i}].Comp[${j}].vComp deve ser numérico.`);
              });
            }
            if (p.infPrazo) {
              p.infPrazo.forEach((prazo, k) => {
                if (!prazo.nParcela) erros.push(`infPag[${i}].infPrazo[${k}].nParcela obrigatório.`);
                if (!prazo.dVenc) erros.push(`infPag[${i}].infPrazo[${k}].dVenc obrigatório.`);
                if (isNaN(prazo.vParcela)) erros.push(`infPag[${i}].infPrazo[${k}].vParcela deve ser numérico.`);
              });
            }
          });
      
        // === Validação do veículo de tração (cavalo mecânico)
        if (!veicTracao) {
          erros.push("veículo tração é obrigatório.");
        } else {

          if (!veicTracao.placa || !placaValida(veicTracao.placa)) {
            erros.push("Placa do veículo tração no formato inválida.");
          }
          if (!veicTracao.RENAVAM || !/^\d{9,11}$/.test(veicTracao.RENAVAM)) {
            erros.push("RENAVAM do veículo tração deve ter entre 9 e 11 dígitos.");
          }
          
          if (typeof veicTracao.tara === "string") {
            erros.push("Tara do veículo tração deve ser numérico.");
          }

          if (typeof veicTracao.capKG === "string") {
            erros.push("O Campo capKG do veículo tração deve ser numérico.");
          }

          if (typeof veicTracao.capM3 === "string") {
            erros.push("O Campo capM3 do veículo tração deve ser numérico.");
          }

      
            const { CNPJ, CPF, RNTRC, xNome, IE, UF, tpProp } = veicTracao.prop;
            if (!CNPJ && !CPF) erros.push("Proprietário do veicTracao deve ter CNPJ ou CPF.");
            if (CNPJ && !/^\d{14}$/.test(CNPJ)) erros.push("CNPJ do proprietário do veicTracao inválido.");
            if (CPF && !/^\d{11}$/.test(CPF)) erros.push("CPF do proprietário do veicTracao inválido.");
            if (!RNTRC || !/^\d{8,12}$/.test(RNTRC)) erros.push("RNTRC do proprietário do veicTracao deve ter 8 a 12 dígitos.");
            if (!xNome) erros.push("Nome do proprietário do veicTracao é obrigatório.");
            if (![0, 1, 2].includes(tpProp)) erros.push("Tipo proprietário do veículo tração deve ser 0 (Outros), 1 (TAC), 2 (ETC).");
        }

        if (veicReboque && veicReboque.length > 0) {
          veicReboque.forEach((reb, i) => {
            if (!reb.cInt) erros.push(`cInt do veicReboque[${i}] é obrigatório.`);
            if (!reb.placa || !placaValida(reb.placa)) {
              erros.push(`Placa do reboque[${i}] inválida (padrão AAA9999).`);
            }
            if (!reb.RENAVAM || !/^\d{9,11}$/.test(reb.RENAVAM)) {
              erros.push(`RENAVAM do reboque[${i}] deve ter entre 9 e 11 dígitos.`);
            }


            if (typeof reb.tara === "string") {
              erros.push(`O Campo tara do veículo reboque[${i}] deve ser numérico.`);
            }

            if (typeof reb.capKG === "string") {
              erros.push(`O Campo capKG do veículo reboque[${i}] deve ser numérico.`);
            }

            if (typeof reb.capM3 === "string") {
              erros.push(`O Campo capM3 do veículo reboque[${i}] deve ser numérico.`);
            }

            if (reb.prop) {
              const { CNPJ, CPF, RNTRC, xNome, IE, UF, tpProp } = reb.prop;
              if (!CNPJ && !CPF) erros.push(`Proprietário do veicReboque[${i}] deve ter CNPJ ou CPF.`);
              if (CPF && !/^\d{11}$/.test(CPF)) erros.push(`CPF do proprietário do veicReboque[${i}] inválido.`);
              if (!RNTRC || !/^\d{8,12}$/.test(RNTRC)) erros.push(`RNTRC do proprietário do veicReboque[${i}] deve ter 8 a 12 dígitos.`);
              if (!xNome) erros.push(`Nome do proprietário do veicReboque[${i}] é obrigatório.`);
              if (![0, 1, 2].includes(tpProp)) erros.push(`tpProp do veicReboque[${i}] deve ser 0 (Outros), 1 (TAC), 2 (ETC).`);
            }
          });
        }

        const { cMunDescarga, xMunDescarga, infNFe } = mdfe.infMDFe.infDoc.infMunDescarga[0];

        if (cMunDescarga === "") erros.push(`Código do municipio precisa está prerenchido na aba Documentos`);
        if (xMunDescarga === "") erros.push(`Nome do municipio precisa está prerenchido na aba Documentos`);
        if (infNFe[0].chNFe === "") erros.push(`Nota fiscal precisa está prerenchido na aba Documentos`);

        const { NCM, infLotacao, tpCarga, xProd } = mdfe.infMDFe.prodPred;

        if (tpCarga === "") erros.push(`Tipo da carga precisa ser prerenchido na aba Produtos predominantes`);
        if (xProd === "") erros.push(`Descrição do produto precisa ser prerenchido na aba Produtos predominantes`);
        if (infLotacao.infLocalCarrega.CEP === "") erros.push(`CEP do local de carregamento precisa ser prerenchido na aba Produtos predominantes`);
        if (infLotacao.infLocalDescarrega.CEP === "") erros.push(`CEP do local de Descarga precisa ser prerenchido na aba Produtos predominantes`);
        if (!/^\d{8}$/.test(infLotacao.infLocalDescarrega.CEP) ) erros.push(`CEP do local de Descarga precisa ser está no formado inválido`);




    return {
      valido: erros.length === 0,
      erros
    };
  }


  const sendMdfe = async (idMdfe) => {
    setLoading(true);
    
      try {
        console.log("Enviando MDF-e...");
        setLoading(true);

        const data = await mdfeService.sendMdfe(idMdfe);

        const errors = validarMDFe(data);

        if (!errors.valido) { 
          console.log("Erros de validação:", errors);
          setTitle("Alguns campos precisam ser modificados");
          setStatus("error");

          setMensagem(errors); 
          setOpen(true);

        } else {
          const resposta = await axios.post("http://localhost:4000/api/send-mdfe", data);
  
            if (resposta.status === 200) {
    
              console.log(resposta);
    
              updateMdfeStatus(resposta.data, idMdfe);
    
              setTitle("Erro ao enviar MDF-e");
              setStatus("error");
              setMensagem("Erro ao enviar MDFe: " + resposta.data); 
              setOpen(true);

            } else {
              setTitle("Erro ao enviar MDF-e");
              setStatus("error");
              setMensagem("Erro ao enviar MDFe: " + resposta.data); 
              setOpen(true);
            }
          console.log("Todos os campos são válidos!");
        }

          
      } catch (error) {
        console.error("Erro ao enviar MDFe:", error);
        debugger
        if (error.response && error.response.data?.error?.message) {
          setTitle("Erro ao enviar MDF-e");
          setStatus("error");
          setMensagem(limparMensagemErro(error.response.data.error.message));
          setOpen(true);
        } else {

          setTitle("Erro ao enviar MDF-e");
          setStatus("error");
          setMensagem(error.response?.data.mensagem || "Erro desconhecido ao enviar MDF-e");
          setOpen(true);
        }

      } finally {
        setLoading(false);
      }

  }

  function updateMdfeStatus(data, idMdfe) {

    const update = { 
        id: data?.id ? data.id : 0,
        status: data?.status ? data.status : "",
        referencia: data?.referencia ? data.referencia : "",
        serie: data?.serie ? data.serie : "",
        numero: data?.numero ? data.numero : "",
        valor_total: data?.valor_total ? data.valor_total : 0,
        autorizacao: {
          id: data?.autorizacao?.id ? data.autorizacao.id : 0,
          status: data?.autorizacao?.status ? data.autorizacao.status : "",
          autor: data?.autorizacao?.autor?.cpf_cnpj ? data.autorizacao.autor.cpf_cnpj : "",
          motivo_status: data?.autorizacao?.motivo_status ? data.autorizacao.motivo_status : "",
          tipo_evento: data?.autorizacao?.tipo_evento ? data.autorizacao.tipo_evento : "",
          chave_acesso: data?.autorizacao?.chave_acesso ? data.autorizacao.chave_acesso : "",
          codigo_status: data?.autorizacao?.codigo_status ? data.autorizacao.codigo_status : "",
          data_evento: data?.autorizacao?.data_evento ? data.autorizacao.data_evento : new Date(),
          data_recebimento: data?.autorizacao?.data_recebimento ? data.autorizacao.data_recebimento : new Date(),
          ambiente: data?.autorizacao?.ambiente ? data.autorizacao.ambiente : "",
        },
        created_at: data?.created_at ? data.created_at : new Date(),
        data_emissao: data?.data_emissao ? data.data_emissao : new Date(),
        chave: data?.chave ? data.chave : ""

    }

    const mdfeRef = firebase.firestore().collection('tb_mdfe').doc(idMdfe);
    
      mdfeRef.update({
          retornoSefaz: update,
      }).then(() => {
        console.log("MDF-e atualizado com sucesso!");

        if(data?.autorizacao?.status === "rejeitado") {
          setTitle("MDF-e Rejeitado");
          setStatus("error");
          setMensagem("MDF-e rejeitado: " + data.autorizacao.motivo_status + " (Código: " + data.autorizacao.codigo_status + ")");
        } else if(data.autorizacao?.codigo_status === 100) {
          
          updateShipper(idMdfe);

          setTitle("MDF-e Enviado com Sucesso");
          setStatus("success");
          setMensagem("MDF-e enviado com sucesso! Número: " + data.numero + ", Chave: " + data.chave);
        }
        setOpen(true);   

        
      }).catch((error) => {
        console.error("Erro ao atualizar MDF-e:", error);
        message.error("Erro ao atualizar MDF-e: " + error.message);
        setTitle("Erro ao atualizar MDF-e");
        setStatus("error");
        setMensagem("Erro ao atualizar MDF-e: " + error.message);
        setOpen(true);  
      });

  }
  
  function updateShipper(idMdfe) {
    // Atualizar informações do shipper, se necessário
    console.log("Atualizando informações do shipper...");

    const mdfe = firebase.firestore().collection('tb_mdfe').doc(idMdfe);
      mdfe.get().then((doc) => {
          if (doc.exists) {
            const data = doc.data(); 
            updateShipperNumber(data.dataOrigin.idShipper);
          } else {
            console.log("Nenhum documento encontrado para o MDF-e com ID:", idMdfe);
          }
        }).catch((error) => {
          console.error("Erro ao buscar MDF-e:", error);
        });

  }

  function updateShipperNumber(idShipper) {
    
      const mdfeRef = firebase.firestore().collection('shipper').doc(idShipper);
        mdfeRef.get().then((doc) => {
            if (doc.exists) {
              const data = doc.data();

              var numberMdfe = parseInt(data.mdfe.number);
              // Incrementa o número do MDF-e
              numberMdfe += 1;

            mdfeRef.update({
              mdfe: {
                number: numberMdfe.toString().padStart(7, '0')
              }
          }).then(() => {
            console.log("Shipper atualizado com sucesso!");
          }).catch((error) => {
            console.error("Erro ao atualizar shipper:", error);
          });

          console.log("Dados do shipper:", data);
        } else {
          console.log("Nenhum documento encontrado para o shipper com ID:", idShipper);
        }
      }).catch((error) => {
        console.error("Erro ao buscar shipper:", error);
      });

  }
  
  function limparMensagemErro(mensagem) {

    var retorno = mensagem.replace(/^Validation failed:\s*/, "");

    if(retorno === "O campo 'infMDFe.infModal.rodo.infANTT.infContratante[0].infContrato.vContratoGlobal' deve ser maior que 0") {
      retorno = "O campo 'Valor do Contrato Global' deve ser maior que 0";
    }

    return retorno;
  }

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
  });

  const columns = [
    {
      title: 'Motorista',
      key: 'CPF',
      width: '30%',
      render: (_, record) => (
        <span>
          {record.infMDFe.infModal.rodo.veicTracao.condutor[0].xNome}
        </span>
      ),
    },
    {
      title: 'Série',
      key: 'serie',
      width: '10%',
      render: (_, record) => (
        <span>
          {record.infMDFe.ide.serie}
        </span>
      ),
      ...getColumnSearchProps(['infMDFe.ide', 'serie']),
      sorter: (a, b) => {
        const serieA = a?.infMDFe.ide.serie || '';
        const serieB = b?.infMDFe.ide.serie || '';
        return serieA.localeCompare(serieB);
      },
    },
    {
      title: 'Emitente',
      key: 'CPF',
      width: '30%',
      render: (_, record) => (
        <span>
          {record.infMDFe.emit.xNome}
        </span>
      ),
      ...getColumnSearchProps(['infMDFe.emit', 'xNome']),
      sorter: (a, b) => {
        const cpfA = a?.infMDFe.emit.xNome || '';
        const cpfB = b?.infMDFe.emit.xNome || '';
        return cpfA.localeCompare(cpfB);
      },
    },
    {
      title: 'Número',
      key: 'nMDF',
      render: (_, record) => (
        <span>
          {record.infMDFe.ide.nMDF}
        </span>
      ),
      ...getColumnSearchProps(['infMDFe.ide', 'nMDF']),
      sorter: (a, b) => {
        const nMdfa = a?.infMDFe?.ide?.nMDF || '';
        const nMdfb = b?.infMDFe?.ide?.nMDF || '';
        return nMdfa.localeCompare(nMdfb);
      },
    },
    {
      title: 'Valor',
      key: 'valor',
      render: (_, record) => (
        <span>
          {record.infMDFe.tot.vCarga}
        </span>
      ),
      ...getColumnSearchProps(['infMDFe.tot', 'vCarga']),
      sorter: (a, b) => {
        const nMdfa = a?.infMDFe.tot.vCarga || '';
        const nMdfb = b?.infMDFe.tot.vCarga || '';
        return nMdfa.localeCompare(nMdfb);
      },
    },
    {
      title: 'Ações',
      width: '10%',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">

          {record.retornoSefaz?.status === "autorizado" ? (
            <Link to={'/insertMdfe/' + record.id}>
              <VisibilityRoundedIcon />
            </Link>
          ) : 
            <Link to={'/insertMdfe/' + record.id}>
              <EditOutlinedIcon />
            </Link>
          }
          {(() => {
            const status = record.retornoSefaz?.status;
            const dataEvento = record.retornoSefaz?.autorizacao?.data_evento ? new Date(record.retornoSefaz.autorizacao.data_evento) : null;

            let diffHoras = 0;

            if (dataEvento) {
              const agora = new Date();
              diffHoras = (agora - dataEvento) / (1000 * 60 * 60); // diferença em horas
            }

            if (status === "autorizado") {
              if (diffHoras <= 24) { 
                return null; 
              }
              return <CancelIcon titleAccess="Cancelar MDFe" color="error" />;
            }

            return (
              <Link to={'#'}>
                <DeleteOutlinedIcon onClick={() => deleteMdfe(record.id)}  color="error" />
              </Link>
            );
          })()}

          {
          record.retornoSefaz?.status === "autorizado" ? 
            <Link to={'#'}>
              <AddToPhotosRoundedIcon title={"Encerrar MDFe"} color='success'/>
            </Link>
          : 
            <Link to={'#'}>
              <SendIcon title={"Enviar MDFe"} onClick={(e) => sendMdfe(record.id)} color='primary'/>
            </Link>
          }  
          <Link to={'#'}>
            <InfoCircleOutlined title={"Informação"} onClick={(e) => getInformation(record.id)} color='primary'/>
          </Link>
        </Space>
      ),
    },
  ];

  return (
      <>
          <Spin spinning={loading} tip="Enviando MDF-e..." size="large">
            <Table columns={columns} dataSource={data} />
          </Spin>

          <RetornoMdfeModal open={open} setOpen={setOpen} mensagem={mensagem} title={title} status={status}/>
    
      </>

  );
};

export default DataMdfeCompTable;
