import { useEffect, useState } from "react";
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import xmlDocumentNFeService from "../../service/xmlDocumentNFe.service";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import DataGrid from "../../components/DataGrid/DataGrid";
import clientsService from "../../service/clients.service";
import invoiceService from "../../service/invoice.service";
import { CircularProgress } from "@mui/material";
import './styleImport.css';
import { Button as CustomButton } from 'antd';
import NewMiniDrawer from "../../components/navMenu/menu-nav";

require("firebase/auth");

function formatarDataParaYYYYMMDD(dataString) {
  if (!dataString) {
    return "Data inválida";
  } 

  const isAlreadyFormatted = dataString.includes("T");

  if (isAlreadyFormatted) {
    return dataString.split("T")[0];
  }

  const dateObj = new Date(`${dataString}T00:00:00Z`);
  const localDate = new Date(
    dateObj.toLocaleString("en-US", { timeZone: "UTC" })
  );

  if (isNaN(localDate.getTime())) {
    return "Data inválida";
  }

  const ano = localDate.getFullYear();
  const mes = String(localDate.getMonth() + 1).padStart(2, "0");
  const dia = String(localDate.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

async function buscarCepForLatLon(input) {
  return { latitude: "", longitude: "" };

  // if (input != null && input.length < 8) {
  //   return { latitude: "", longitude: "" };
  // }

  try {
    const response = await fetch(
      "https://brasilapi.com.br/api/cep/v2/" + input,
      { mode: "cors" }
    );

    const data = await response.json();

    if (data.hasOwnProperty("erro")) {
      return { latitude: "", longitude: "" };
    } else {
      const locationData = {
        latitude: data?.location?.coordinates?.latitude || "",
        longitude: data?.location?.coordinates?.longitude || "",
      };

      // Aqui você pode fazer o que quiser com o objeto locationData
      // Se quiser, pode retorná-lo diretamente ou realizar outras operações.

      // Exemplo de retorno:
      return locationData;

      // Se você deseja realizar outras operações com os dados, faça-as aqui
      // Exemplo:
      // console.log('Latitude:', locationData.latitude);
      // console.log('Longitude:', locationData.longitude);
    }
  } catch (err) {
    return { latitude: "", longitude: "" };
  }
}

function getInvoiceAttributes(xmlDoc) {
  const dest = xmlDoc.getElementsByTagName("dest")[0];
  let cnpjDest =
    dest.getElementsByTagName("CNPJ")[0]?.childNodes[0].nodeValue ||
    dest.getElementsByTagName("CPF")[0]?.childNodes[0].nodeValue;
  let ide = xmlDoc.getElementsByTagName("ide")[0];
  let dhEmi = ide.getElementsByTagName("dhEmi")[0]?.childNodes[0].nodeValue;
  let nNF = ide.getElementsByTagName("nNF")[0]?.childNodes[0].nodeValue;
  let emit = xmlDoc.getElementsByTagName("emit")[0];
  let cnpjEmit = emit.getElementsByTagName("CNPJ")[0]?.childNodes[0].nodeValue;
  let vol = xmlDoc.getElementsByTagName("vol")[0];
  let qVol = vol.getElementsByTagName("qVol")[0]?.childNodes[0].nodeValue;
  let esp = vol.getElementsByTagName("esp")[0]?.childNodes[0].nodeValue;
  let pesoB = vol.getElementsByTagName("pesoB")[0]?.childNodes[0]?.nodeValue;
  let total = xmlDoc.getElementsByTagName("ICMSTot")[0];
  let vNF = total.getElementsByTagName("vNF")[0]?.childNodes[0].nodeValue;
  let infAdic = xmlDoc.getElementsByTagName("infAdic")[0];
  let observation =
    infAdic.getElementsByTagName("infCpl")[0]?.childNodes[0].nodeValue;
  let infProt = xmlDoc.getElementsByTagName("infProt")[0];
  let chave = infProt.getElementsByTagName("chNFe")[0]?.childNodes[0].nodeValue;
  const newInvoice = {
    cnpjEmit: cnpjEmit,
    cnpjDest: cnpjDest,
    numeroNF: nNF,
    chave: chave,
    dataEmit: dhEmi,
    valorNF: vNF,
    peso: pesoB,
    volumes: qVol,
    observacao: observation,
    especie: esp,
  };
  return newInvoice;
}

function ImportXml() {
  const [xmlProviderObjectList, setXmlProviderObjectList] = useState([]);
  const [xmlClientObjectList, setXmlClientObjectList] = useState([]);
  const [editFormData, setEditFormData] = useState({});

  const [paramsAdvancedSearch, setParamsAdvancedSearch] = useState({
    initialDate: "2000-01-01",
    endDate: "2000-01-01",
    NfNumer: "0",
  });

  const [isAdding, setIsAdding] = useState(false);

  const [openProvider, setOpenProvider] = useState(false);
  const [openClient, setOpenClient] = useState(false);
  const [openAdvancedSearchModal, setOpenAdvancedSearchModal] = useState(false);

  const [filesAdicionadas, setFilesAdicionadas] = useState(null);

  const [listaXmlRows, setListaXmlRows] = useState([
    {
      id: 0,
      dhEmi: "",
      nNF: "",
      nameEmit: "",
      nameDest: "",
      qVol: "",
      pesoB: "",
      vNF: "",
      observation: "",
    },
  ]);
  const [listaXmlRowsClient, setListaXmlRowsClient] = useState([
    {
      id: 0,
      dhEmi: "",
      nNF: "",
      nameEmit: "",
      nameDest: "",
      qVol: "",
      pesoB: "",
      vNF: "",
      observation: "",
    },
  ]);

  const handleOpenUpdateProvider = (item) => {
    setSelectedItem(item);
    setOpenProvider(true);
  };

  const handleOpenUpdateClient = (item) => {
    setSelectedItem(item);
    setOpenClient(true);
  };

  const openModalAdvancedSearchModal = () => {
    setOpenAdvancedSearchModal(true);
  };

  const handleCloseProvider = () => {
    setOpenProvider(false);
  };

  const handleCloseClient = () => setOpenClient(false);

  const handleClosedAdvancedSearchModal = () =>
    setOpenAdvancedSearchModal(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [totalVolumesSelect, setTotalVolumes] = useState("0");
  const [totalPesosSelect, setTotalPesos] = useState("0");
  const [totalValorNFSelect, setTotalValorNF] = useState("0");

  useEffect(() => {
    loadScreenXmlDocumentsNFe();

    if (!selectedItem) return;
    if (!selectedItem.rawXml) return;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(selectedItem.rawXml, "text/xml");
    let dest = xmlDoc.getElementsByTagName("dest")[0];
    if (!dest) return;

    let emit = xmlDoc.getElementsByTagName("emit")[0];
    let cnpjEmit = emit.getElementsByTagName("CNPJ")[0].childNodes[0].nodeValue;

    //Adicionando Mascara para exibir na tela de edição
    cnpjEmit = cnpjEmit.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );

    let cpfDest = dest.getElementsByTagName("CPF")[0]?.childNodes[0].nodeValue;
    let cnpjDest =
      dest.getElementsByTagName("CNPJ")[0]?.childNodes[0].nodeValue;

    if (cpfDest) {
      //Adicionando Mascara para exibir na tela de edição
      cpfDest = cpfDest.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "$1.$2.$3-$4");
    }

    if (cnpjDest) {
      //Adicionando Mascara para exibir na tela de edição
      cnpjDest = cnpjDest.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }

    let nameEmit =
      emit.getElementsByTagName("xNome")[0].childNodes[0].nodeValue;
    let nameDest =
      dest.getElementsByTagName("xNome")[0].childNodes[0].nodeValue;
    let qVol = xmlDoc.getElementsByTagName("qVol")[0].childNodes[0].nodeValue;
    let pesoB =
      xmlDoc.getElementsByTagName("pesoB")[0]?.childNodes[0]?.nodeValue;
    let total = xmlDoc.getElementsByTagName("ICMSTot")[0];
    let vNF = total.getElementsByTagName("vNF")[0].childNodes[0].nodeValue;
    let nNF = xmlDoc.getElementsByTagName("nNF")[0].childNodes[0].nodeValue;
    let nomeFantasia =
      emit.getElementsByTagName("xFant")[0].childNodes[0].nodeValue;
    let ie = xmlDoc.getElementsByTagName("IE")[0].textContent || "";
    let enderEmit = emit.getElementsByTagName("enderEmit")[0];
    let email = emit.getElementsByTagName("email")[0]?.textContent || "";
    let cep = enderEmit.getElementsByTagName("CEP")[0]?.textContent || "";

    //Adicionando Mascara para exibir na tela de edição
    const cepPart1 = cep.substring(0, 5);
    const cepPart2 = cep.substring(8, 5);
    cep = cepPart1 + "-" + cepPart2;

    // cep = cep.substring(0, 5) + "-" + cep.substring(8);

    let fone = enderEmit.getElementsByTagName("fone")[0]?.textContent || "";
    //Adicionando Mascara para exibir na tela de edição
    fone =
      "(" +
      fone.substring(0, 2) +
      ")" +
      fone.substring(2, 7) +
      "-" +
      fone.substring(7);

    let uf = enderEmit.getElementsByTagName("UF")[0].textContent || "";
    let enderecoEmit =
      enderEmit.getElementsByTagName("xLgr")[0].textContent || "";
    let numeroCasaEmit =
      enderEmit.getElementsByTagName("nro")[0].textContent || "";
    let bairroEmit =
      enderEmit.getElementsByTagName("xBairro")[0].textContent || "";
    let cidadeEmit =
      enderEmit.getElementsByTagName("xMun")[0].textContent || "";
    let enderDest = dest.getElementsByTagName("enderDest")[0];
    let enderecoDest =
      enderDest.getElementsByTagName("xLgr")[0].textContent || "";
    let numeroCasaDest =
      enderDest.getElementsByTagName("nro")[0].textContent || "";
    let bairroDest =
      enderDest.getElementsByTagName("xBairro")[0].textContent || "";
    let municipioDest =
      enderDest.getElementsByTagName("xMun")[0].textContent || "";
    let foneDest = enderDest.getElementsByTagName("fone")[0].textContent || "";
    //Adicionando Mascara para exibir na tela de edição
    foneDest =
      "(" +
      foneDest.substring(0, 2) +
      ")" +
      foneDest.substring(2, 7) +
      "-" +
      foneDest.substring(7);

    let ufDest = enderDest.getElementsByTagName("UF")[0].textContent || "";
    let cepDest = enderDest.getElementsByTagName("CEP")[0].textContent || "";

    //Adicionando Mascara para exibir na tela de edição
    cepDest = cepDest.substring(0, 5) + "-" + cepDest.substring(8, 5);

    let emailDest = dest.getElementsByTagName("email")[0]?.textContent || "";
    let infProt = xmlDoc.getElementsByTagName("infProt")[0];
    let chave =
      infProt.getElementsByTagName("chNFe")[0]?.childNodes[0].nodeValue;
    let esp = xmlDoc.getElementsByTagName("esp")[0]?.childNodes[0].nodeValue;
    let ide = xmlDoc.getElementsByTagName("ide")[0];

    let transp = xmlDoc.getElementsByTagName("transp")[0];
    let modalidade =
      transp.getElementsByTagName("modFrete")[0]?.childNodes[0].nodeValue;

    let dhEmi = ide.getElementsByTagName("dhEmi")[0]?.childNodes[0].nodeValue;
    let infAdic = xmlDoc.getElementsByTagName("infAdic")[0];
    let observation =
      infAdic.getElementsByTagName("infCpl")[0]?.childNodes[0].nodeValue || "";

    setEditFormData({
      cnpjEmit,
      nameEmit,
      nameDest,
      cnpjDest,
      cpfDest,
      qVol,
      pesoB,
      vNF,
      nNF,
      nomeFantasia,
      dataEmit: dhEmi,
      endereco: enderecoEmit,
      ie,
      email,
      numeroCasa: numeroCasaEmit,
      bairro: bairroEmit,
      cidade: cidadeEmit,
      uf,
      cep,
      fone,
      enderecoDest,
      numeroCasaDest,
      bairroDest,
      municipioDest,
      ufDest,
      cepDest,
      foneDest,
      emailDest,
      chave,
      esp,
      observation,
      modalidade: modalidade,
    });
  }, [selectedItem]);

  const columns = [
    {
      field: "dhEmi",
      headerName: "Data de emissão",
      type: "date",
      maxWidth: 130,
      align: "center",
      headerAlign: "center",
      flex: 1,
      sortable: false,
      valueFormatter: (params) => {
        return params.value
          ? new Date(
              params.value.replace("T", " ") + " UTC"
            ).toLocaleDateString("pt-br", { timeZone: "UTC" })
          : "";
      },
    },
    {
      field: "nNF",
      headerName: "Número da NF",
      type: "number",
      width: 150,
      align: "center",
      headerAlign: "center",
      flex: 1,
      sortable: false,
    },
    {
      field: "nameEmit",
      headerName: "Emissor",
      type: "string",
      width: 150,
      align: "center",
      headerAlign: "center",
      flex: 1,
      sortable: false,
    },
    {
      field: "nameDest",
      headerName: "Destinatário",
      type: "string",
      width: 150,
      align: "center",
      headerAlign: "center",
      flex: 1,
      sortable: false,
    },
    {
      field: "qVol",
      headerName: "Volumes",
      type: "number",
      maxWidth: 80,
      align: "center",
      headerAlign: "center",
      flex: 1,
      sortable: false,
    },
    {
      field: "pesoB",
      headerName: "Peso",
      type: "number",
      width: 100,
      align: "center",
      headerAlign: "center",
      flex: 1,
      sortable: false,
      valueFormatter: (params) => {
        // Verifica se o valor é um número antes de formatar
        if (params.value != null) {
          return Number(params.value).toLocaleString('pt-BR', {
            minimumFractionDigits: 3, // Define 3 casas decimais
            maximumFractionDigits: 3, // Define o limite de 3 casas decimais
          });
        }
        return params.value; // Caso seja null ou undefined, retorna o valor sem formatação
      },
    },
    {
      field: "vNF",
      headerName: "Valor NF",
      type: "number",
      width: 120,
      align: "center",
      headerAlign: "center",
      flex: 1,
      sortable: false,
      valueFormatter: (params) => {
        return Number(params.value).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
      },
    },
    {
      field: "observation",
      headerName: "Observação",
      width: 200,
      align: "center",
      headerAlign: "center",
      flex: 1,
      sortable: false,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      align: "center",
      headerAlign: "center",
      flex: 1,
      sortable: false,
      // renderCell: (params) => {
      //   return (
      //     <div
      //       style={{
      //         display: "flex",
      //         gap: 4,
      //       }}
      //     >
      //       <Button
      //         onClick={() => handleOpenUpdateProvider(params.row)}
      //         variant="text"
      //         // color="primary"
      //       >
      //         <EditOutlinedIcon />
      //       </Button>
      //       <Button
      //         onClick={(e) => handleDeleteDocumentProvider(e, params.row.id)}
      //         variant="text"
      //         // color="error"
      //       >
      //         <DeleteOutlinedIcon color="error" />
      //       </Button>
      //     </div>
      //   );
      // },
    },
  ];

  const handleMultipleFileChange = async (event) => {
    setIsAdding(true);

    const files = event.target.files;

    if (files.length === 0) {
      return;
    }

    let countXMLImported = 0;

    for (const file of files) {
      const parser = new DOMParser();
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop().toLowerCase();

      if (fileExtension !== "xml") {
        alert("Por favor selecione um arquivo xml");
        return; // Skip to the next iteration if the file is not XML
      }            

      const fileContent = await file.text();
      const xmlDocumentNFe = parser.parseFromString(fileContent, "text/xml");

      const ide = xmlDocumentNFe.getElementsByTagName("ide")[0];
      if (!ide) {
        alert(
          "Modelo de xml inválido. Não encontrado informações da tag 'ide' !"
        );
        return;
      }

      const dest = xmlDocumentNFe.getElementsByTagName("dest")[0];
      if (!dest) {
        alert(
          "Modelo de xml inválido. Não encontrado informações da tag 'dest' !"
        );
        return;
      }

      const emit = xmlDocumentNFe.getElementsByTagName("emit")[0];
      if (!emit) {
        alert(
          "Modelo de xml inválido. Não encontrado informações da tag 'emit' !"
        );
        return;
      }

      const infNFeElement = xmlDocumentNFe.getElementsByTagName("infNFe")[0];
      let chaveNFe = infNFeElement.getAttribute("Id");
      chaveNFe = chaveNFe.replace("NFe", "");

      // --------------------- Inicio Importação XML | Iniciando processo de verificar e se existe, se não Importar o XMl em questão.

      const xmlDocumentValidateByKeyNFe =
        await xmlDocumentNFeService.getProviderByChaveNFe(chaveNFe);      

      if (xmlDocumentValidateByKeyNFe.empty) {
        let cpfDest = dest.getElementsByTagName("CPF")[0];
        let cnpjDest = dest.getElementsByTagName("CNPJ")[0];
        cpfDest = cpfDest === undefined ? "" : cpfDest.textContent;
        cnpjDest = cnpjDest === undefined ? "" : cnpjDest.textContent;

        let cpfEmit = emit.getElementsByTagName("CPF")[0];
        let cnpjEmit = emit.getElementsByTagName("CNPJ")[0];
        cpfEmit = cpfEmit === undefined ? "" : cpfEmit.textContent;
        cnpjEmit = cnpjEmit === undefined ? "" : cnpjEmit.textContent;

        let nNF = ide.getElementsByTagName("nNF")[0];
        let dhEmi = ide.getElementsByTagName("dhEmi")[0];
        nNF = nNF == undefined ? "" : nNF.textContent;
        dhEmi = dhEmi == undefined ? "" : dhEmi.textContent;

        dhEmi = dhEmi.substring(0, 10);
        dhEmi = dhEmi.replace("-", "");
        dhEmi = dhEmi.replace("-", "");
        dhEmi = Number(dhEmi);

        const xmlDocumentNFeForInsert = {
          chave: chaveNFe,
          nNF: nNF,
          dhEmi: dhEmi,
          cpf: cpfDest,
          cnpj: cnpjDest,
          xmlContent: fileContent,
        };

        const xmlDocumentNFeID =
          await xmlDocumentNFeService.createDocumentProvider(
            xmlDocumentNFeForInsert
          );

        // --------------------- Inicio Destinatario | Iniciando processo de verificar, inserir ou Atualizar cliente tipo Destinatario.

        if (cpfDest) {
          const clientCPFDest = await clientsService.getClientByCpf(cpfDest);

          if (clientCPFDest.empty) {
            const xNome = dest.getElementsByTagName("xNome")[0].textContent;
            let email = dest.getElementsByTagName("email")[0].textContent;
            let IE = "";

            const enderDest = dest.getElementsByTagName("enderDest")[0];
            let CEP = enderDest.getElementsByTagName("CEP")[0].textContent;
            let xMun = enderDest.getElementsByTagName("xMun")[0].textContent;
            let UF = enderDest.getElementsByTagName("UF")[0].textContent;
            let xLgr = enderDest.getElementsByTagName("xLgr")[0].textContent;
            let nro = enderDest.getElementsByTagName("nro")[0].textContent;
            let xBairro =
              enderDest.getElementsByTagName("xBairro")[0].textContent;
            let fone = enderDest.getElementsByTagName("fone")[0].textContent;

            let xCpl = enderDest.getElementsByTagName("xCpl")[0]?.textContent;
            xCpl = xCpl === undefined ? "" : xCpl;

            const coordinates = await buscarCepForLatLon(CEP);

            const clientCPFForInsert = {
              cpf: cpfDest,
              cnpj: "",
              cnpj: "",
              typePerson: 1,
              name: xNome,
              nameFantasy: "",
              coordinates,
              address: {
                cep: CEP,
                city: xMun,
                state: UF,
                street: xLgr,
                number: nro,
                neighborhood: xBairro,
                complement: xCpl,
              },
              xmlDocumentNFeId: xmlDocumentNFeID,
              telefone: fone,
              email: email,
              inscEstadual: IE,
            };

            await clientsService.saveClient(clientCPFForInsert);
          } else {
            const xNome = dest.getElementsByTagName("xNome")[0].textContent;
            let email = dest.getElementsByTagName("email")[0].textContent;
            let IE = "";

            const enderDest = dest.getElementsByTagName("enderDest")[0];
            let CEP = enderDest.getElementsByTagName("CEP")[0].textContent;
            let xMun = enderDest.getElementsByTagName("xMun")[0].textContent;
            let UF = enderDest.getElementsByTagName("UF")[0].textContent;
            let xLgr = enderDest.getElementsByTagName("xLgr")[0].textContent;
            let nro = enderDest.getElementsByTagName("nro")[0].textContent;
            let xBairro =
              enderDest.getElementsByTagName("xBairro")[0].textContent;
            let fone = enderDest.getElementsByTagName("fone")[0].textContent;
            let xCpl = enderDest.getElementsByTagName("xCpl")[0]?.textContent;
            xCpl = xCpl === undefined ? "" : xCpl;

            const coordinates = await buscarCepForLatLon(CEP);

            const clientCPFForInsert = {
              cpf: cpfDest,
              cnpj: "",
              typePerson: 1,
              name: xNome,
              nameFantasy: "",
              coordinates,
              address: {
                cep: CEP,
                city: xMun,
                state: UF,
                street: xLgr,
                number: nro,
                neighborhood: xBairro,
                complement: xCpl,
              },
              xmlDocumentNFeId: xmlDocumentNFeID,
              telefone: fone,
              email: email,
              inscEstadual: IE,
            };

            let clientID = clientCPFDest.docs[0].id;
            await clientsService.updateClient(clientID, clientCPFForInsert);
          }
        }

        if (cnpjDest) {
          const clientCNPJDest = await clientsService.getClientByCnpj(cnpjDest);

          if (clientCNPJDest.empty) {
            const razaoSocial =
              dest.getElementsByTagName("xNome")[0].textContent;
            let nomeFantasia =
              dest?.getElementsByTagName("xFant")[0]?.textContent;
            nomeFantasia = nomeFantasia === undefined ? "" : nomeFantasia;

            const enderDest = dest.getElementsByTagName("enderDest")[0];
            let enderDestNRO =
              enderDest.getElementsByTagName("nro")[0].textContent;
            let enderDestxLgr =
              enderDest.getElementsByTagName("xLgr")[0].textContent;
            let enderDestCEP =
              enderDest.getElementsByTagName("CEP")[0].textContent;
            let enderDestxMun =
              enderDest.getElementsByTagName("xMun")[0].textContent;
            let enderDestUF =
              enderDest.getElementsByTagName("UF")[0].textContent;
            let enderDestxBairro =
              enderDest.getElementsByTagName("xBairro")[0].textContent;

            let enderDesttFone =
              enderDest.getElementsByTagName("fone")[0]?.textContent;
            enderDesttFone = enderDesttFone === undefined ? "" : enderDesttFone;

            let xCpl = enderDest.getElementsByTagName("xCpl")[0]?.textContent;
            xCpl = xCpl === undefined ? "" : xCpl;

            let emitEmail = "";
            let IE = emit.getElementsByTagName("IE")[0].textContent;

            const coordinates = await buscarCepForLatLon(enderDestCEP);

            const clientCNPJForInsert = {
              cpf: "",
              cnpj: cnpjDest,
              typePerson: 2,
              name: razaoSocial,
              nameFantasy: nomeFantasia,
              coordinates,
              address: {
                cep: enderDestCEP,
                city: enderDestxMun,
                state: enderDestUF,
                street: enderDestxLgr,
                number: enderDestNRO,
                neighborhood: enderDestxBairro,
                complement: xCpl,
              },
              xmlId: xmlDocumentNFeID,
              telefone: enderDesttFone,
              email: emitEmail,
              inscEstadual: IE,
            };

            // Cria nota fiscal para tabela Invoices
            let invoiceForInsert = await getInvoiceAttributes(xmlDocumentNFe);
            invoiceForInsert.xmlId = xmlDocumentNFeID;
            await invoiceService.saveInvoice(invoiceForInsert);

            await clientsService.saveClient(clientCNPJForInsert);
          } else {
            const razaoSocial =
              dest.getElementsByTagName("xNome")[0].textContent;
            let nomeFantasia =
              dest?.getElementsByTagName("xFant")[0]?.textContent;
            nomeFantasia = nomeFantasia === undefined ? "" : nomeFantasia;

            const enderDest = dest.getElementsByTagName("enderDest")[0];
            let enderDestNRO =
              enderDest.getElementsByTagName("nro")[0].textContent;
            let enderDestxLgr =
              enderDest.getElementsByTagName("xLgr")[0].textContent;
            let enderDestCEP =
              enderDest.getElementsByTagName("CEP")[0].textContent;
            let enderDestxMun =
              enderDest.getElementsByTagName("xMun")[0].textContent;
            let enderDestUF =
              enderDest.getElementsByTagName("UF")[0].textContent;
            let enderDestxBairro =
              enderDest.getElementsByTagName("xBairro")[0].textContent;

            let enderDestFone =
              enderDest.getElementsByTagName("fone")[0]?.textContent;
            enderDestFone = enderDestFone === undefined ? "" : enderDestFone;

            let xCpl = enderDest.getElementsByTagName("xCpl")[0]?.textContent;
            xCpl = xCpl === undefined ? "" : xCpl;

            let emitEmail = "";
            let IE = emit.getElementsByTagName("IE")[0].textContent;

            const coordinates = await buscarCepForLatLon(enderDestCEP);

            const clientCNPJForInsert = {
              cpf: "",
              cnpj: cnpjDest,
              typePerson: 2,
              name: razaoSocial,
              nameFantasy: nomeFantasia,
              coordinates,
              address: {
                cep: enderDestCEP,
                city: enderDestxMun,
                state: enderDestUF,
                street: enderDestxLgr,
                number: enderDestNRO,
                neighborhood: enderDestxBairro,
                complement: xCpl,
              },
              xmlId: xmlDocumentNFeID,
              telefone: enderDestFone,
              email: emitEmail,
              inscEstadual: IE,
            };

            let clientID = clientCNPJDest.docs[0].id;

            // Cria nota fiscal para tabela Invoices
            let invoiceForInsert = await getInvoiceAttributes(xmlDocumentNFe);
            invoiceForInsert.xmlId = xmlDocumentNFeID;
            await invoiceService.saveInvoice(invoiceForInsert);

            await clientsService.updateClient(clientID, clientCNPJForInsert);
          }
        }

        // --------------------- Encerrando Destinatario | Encerrando processo de verificar, inserir ou Atualizar cliente tipo Destinatario.

        // --------------------- Inicio Emitente | Iniciando processo de verificar, inserir ou Atualizar cliente tipo Emitente.

        if (cpfEmit) {
          const clientCPFEmit = await clientsService.getClientByCpf(cpfEmit);

          if (clientCPFEmit.empty) {
            const xNome = emit.getElementsByTagName("xNome")[0].textContent;
            let email = emit.getElementsByTagName("email")[0].textContent;
            let IE = "";

            const enderEmit = emit.getElementsByTagName("enderEmit")[0];
            let CEP = enderEmit.getElementsByTagName("CEP")[0]?.textContent;
            let xMun = enderEmit.getElementsByTagName("xMun")[0]?.textContent;
            let UF = enderEmit.getElementsByTagName("UF")[0]?.textContent;
            let xLgr = enderEmit.getElementsByTagName("xLgr")[0]?.textContent;
            let nro = enderEmit.getElementsByTagName("nro")[0]?.textContent;

            let xBairro =
              enderEmit.getElementsByTagName("xBairro")[0].textContent;
            xBairro = xBairro == undefined ? "" : xBairro;

            let fone = enderEmit.getElementsByTagName("fone")[0].textContent;
            fone = fone == undefined ? "" : fone;

            let xCpl = enderEmit.getElementsByTagName("xCpl")[0]?.textContent;
            xCpl = xCpl === undefined ? "" : xCpl;

            const coordinates = await buscarCepForLatLon(CEP);

            const clientCPFForInsert = {
              cpf: cpfEmit,
              cnpj: "",
              typePerson: 1,
              name: xNome,
              nameFantasy: "",
              coordinates,
              address: {
                cep: CEP,
                city: xMun,
                state: UF,
                street: xLgr,
                number: nro,
                neighborhood: xBairro,
                complement: xCpl,
              },
              xmlDocumentNFeId: xmlDocumentNFeID,
              telefone: fone,
              email: email,
              inscEstadual: IE,
            };

            await clientsService.saveClient(clientCPFForInsert);
          } else {
            const xNome = emit.getElementsByTagName("xNome")[0].textContent;
            let email = emit.getElementsByTagName("email")[0].textContent;
            let IE = "";

            const enderEmit = emit.getElementsByTagName("enderDest")[0];
            let CEP = enderEmit.getElementsByTagName("CEP")[0].textContent;
            let xMun = enderEmit.getElementsByTagName("xMun")[0].textContent;
            let UF = enderEmit.getElementsByTagName("UF")[0].textContent;
            let xLgr = enderEmit.getElementsByTagName("xLgr")[0].textContent;
            let nro = enderEmit.getElementsByTagName("nro")[0].textContent;
            let xBairro =
              enderEmit.getElementsByTagName("xBairro")[0].textContent;
            let fone = enderEmit.getElementsByTagName("fone")[0]?.textContent;
            let xCpl = enderEmit.getElementsByTagName("xCpl")[0]?.textContent;
            xCpl = xCpl === undefined ? "" : xCpl;

            const coordinates = await buscarCepForLatLon(CEP);

            const clientCPFForInsert = {
              cpf: cpfDest,
              cnpj: "",
              typePerson: 1,
              name: xNome,
              nameFantasy: "",
              coordinates,
              address: {
                cep: CEP,
                city: xMun,
                state: UF,
                street: xLgr,
                number: nro,
                neighborhood: xBairro,
                complement: xCpl,
              },
              xmlDocumentNFeId: xmlDocumentNFeID,
              telefone: fone,
              email: email,
              inscEstadual: IE,
            };

            let clientID = clientCPFEmit.docs[0].id;
            await clientsService.updateClient(clientID, clientCPFForInsert);
          }
        }

        if (cnpjEmit) {
          const clientCNPJEmit = await clientsService.getClientByCnpj(cnpjEmit);

          if (clientCNPJEmit.empty) {
            const razaoSocial =
              emit?.getElementsByTagName("xNome")[0]?.textContent;
            let nomeFantasia =
              emit?.getElementsByTagName("xFant")[0]?.textContent;
            nomeFantasia = nomeFantasia === undefined ? "" : nomeFantasia;

            const enderEmit = emit.getElementsByTagName("enderEmit")[0];
            let enderEmitNRO =
              enderEmit.getElementsByTagName("nro")[0]?.textContent;
            let enderEmitxLgr =
              enderEmit.getElementsByTagName("xLgr")[0]?.textContent;
            let enderEmitCEP =
              enderEmit.getElementsByTagName("CEP")[0]?.textContent;
            let enderEmitxMun =
              enderEmit.getElementsByTagName("xMun")[0]?.textContent;
            let enderEmitUF =
              enderEmit.getElementsByTagName("UF")[0]?.textContent;
            let enderEmitxBairro =
              enderEmit.getElementsByTagName("xBairro")[0]?.textContent;
            let enderEmitFone =
              enderEmit.getElementsByTagName("fone")[0]?.textContent;
            let xCpl = enderEmit.getElementsByTagName("xCpl")[0]?.textContent;
            xCpl = xCpl === undefined ? "" : xCpl;

            let emitEmail = "";
            let IE = emit.getElementsByTagName("IE")[0].textContent;

            const coordinates = await buscarCepForLatLon(enderEmitCEP);

            const clientCNPJForInsert = {
              cpf: "",
              cnpj: cnpjEmit,
              typePerson: 2,
              name: razaoSocial,
              nameFantasy: nomeFantasia,
              coordinates,
              address: {
                cep: enderEmitCEP,
                city: enderEmitxMun,
                state: enderEmitUF,
                street: enderEmitxLgr,
                number: enderEmitNRO,
                neighborhood: enderEmitxBairro,
                complement: xCpl,
              },
              xmlId: xmlDocumentNFeID,
              telefone: enderEmitFone,
              email: emitEmail,
              inscEstadual: IE,
            };

            // Cria nota fiscal para tabela Invoices
            let invoiceForInsert = await getInvoiceAttributes(xmlDocumentNFe);
            invoiceForInsert.xmlId = xmlDocumentNFeID;
            await invoiceService.saveInvoice(invoiceForInsert);

            await clientsService.saveClient(clientCNPJForInsert);
          } else {
            const razaoSocial =
              emit?.getElementsByTagName("xNome")[0]?.textContent;
            let nomeFantasia =
              emit?.getElementsByTagName("xFant")[0]?.textContent;
            nomeFantasia = nomeFantasia === undefined ? "" : nomeFantasia;

            const enderEmit = emit.getElementsByTagName("enderEmit")[0];
            let enderEmitNRO =
              enderEmit.getElementsByTagName("nro")[0].textContent;
            let enderEmitxLgr =
              enderEmit.getElementsByTagName("xLgr")[0].textContent;
            let enderEmitCEP =
              enderEmit.getElementsByTagName("CEP")[0].textContent;
            let enderEmitxMun =
              enderEmit.getElementsByTagName("xMun")[0].textContent;
            let enderEmitUF =
              enderEmit.getElementsByTagName("UF")[0].textContent;
            let enderEmitxBairro =
              enderEmit.getElementsByTagName("xBairro")[0].textContent;
            let enderEmitFone =
              enderEmit.getElementsByTagName("fone")[0].textContent;
            let xCpl = enderEmit.getElementsByTagName("xCpl")[0]?.textContent;
            xCpl = xCpl === undefined ? "" : xCpl;

            let emitEmail = "";
            let IE = emit.getElementsByTagName("IE")[0].textContent;

            const coordinates = await buscarCepForLatLon(enderEmitCEP);

            const clientCNPJForInsert = {
              cpf: "",
              cnpj: cnpjEmit,
              typePerson: 2,
              name: razaoSocial,
              nameFantasy: nomeFantasia,
              coordinates,
              address: {
                cep: enderEmitCEP,
                city: enderEmitxMun,
                state: enderEmitUF,
                street: enderEmitxLgr,
                number: enderEmitNRO,
                neighborhood: enderEmitxBairro,
                complement: xCpl,
              },
              xmlId: xmlDocumentNFeID,
              telefone: enderEmitFone,
              email: emitEmail,
              inscEstadual: IE,
            };

            let clientID = clientCNPJEmit.docs[0].id;

            // Cria nota fiscal para tabela Invoices
            let invoiceForInsert = await getInvoiceAttributes(xmlDocumentNFe);
            invoiceForInsert.xmlId = xmlDocumentNFeID;
            await invoiceService.saveInvoice(invoiceForInsert);

            await clientsService.updateClient(clientID, clientCNPJForInsert);
          }
        }

        // --------------------- Encerrando Emitente | Encerrando processo de verificar, inserir ou Atualizar cliente tipo Emitente.
        countXMLImported = countXMLImported + 1;
        alert(countXMLImported + " XML foram importados com sucesso!");
        setIsAdding(false);
        await loadScreenXmlDocumentsNFe();
      } else {
        alert(
          "O XML com chave NFe:" +
            chaveNFe +
            ", Já foi importado anteriormente!" 
        );
      }
    }
  };

  const GetXmlDocumentsNFe = async () => {
    setXmlProviderObjectList([]);
    const parser = new DOMParser();

    const response = await xmlDocumentNFeService.getAllXMLDocumentsNFe();

    const xmlProviderList = response.docs.map((doc) => {
      const xml = doc.data();
      const rawXml = xml.xmlContent;
      let xmlDoc = parser.parseFromString(rawXml, "text/xml");

      let dest = xmlDoc.getElementsByTagName("dest")[0];

      let verifyCNPJCPFDest = dest.getElementsByTagName("CNPJ")[0];
      if (verifyCNPJCPFDest) {
        verifyCNPJCPFDest =
          dest.getElementsByTagName("CNPJ")[0].childNodes[0]?.nodeValue;
      } else {
        verifyCNPJCPFDest =
          dest.getElementsByTagName("CPF")[0].childNodes[0]?.nodeValue;
      }

      let cnpjDest = verifyCNPJCPFDest;
      let nameDest =
        dest.getElementsByTagName("xNome")[0].childNodes[0]?.nodeValue;

      let ide = xmlDoc.getElementsByTagName("ide")[0];
      let dhEmi = ide.getElementsByTagName("dhEmi")[0].childNodes[0]?.nodeValue;

      let nNF = ide.getElementsByTagName("nNF")[0].childNodes[0]?.nodeValue;

      let emit = xmlDoc.getElementsByTagName("emit")[0];
      let cnpjEmit =
        emit.getElementsByTagName("CNPJ")[0].childNodes[0]?.nodeValue;
      let nameEmit =
        emit.getElementsByTagName("xNome")[0].childNodes[0]?.nodeValue;

      let vol = xmlDoc.getElementsByTagName("vol")[0];
      let qVol = "";
      let esp = 0;
      let pesoB = 0;
      if (vol) {
        qVol = vol.getElementsByTagName("qVol")[0].childNodes[0]?.nodeValue;
        esp = vol.getElementsByTagName("esp")[0].childNodes[0]?.nodeValue;
        pesoB = vol.getElementsByTagName("pesoB")[0]?.childNodes[0]?.nodeValue;
        pesoB = pesoB == undefined ? "0" : pesoB;
      }

      let total = xmlDoc.getElementsByTagName("ICMSTot")[0];
      let vNF = total.getElementsByTagName("vNF")[0].childNodes[0].nodeValue;

      let infAdic = xmlDoc.getElementsByTagName("infAdic")[0];
      let observation =
        infAdic.getElementsByTagName("infCpl")[0].childNodes[0]?.nodeValue;
      let infProt = xmlDoc.getElementsByTagName("infProt")[0];
      let chave =
        infProt.getElementsByTagName("chNFe")[0].childNodes[0].nodeValue;

      const newObjct = {
        id: doc.id,
        cnpjDest,
        nameDest,
        rawXml,
      };

      const entireObject = {
        id: doc.id,
        cnpjDest,
        nameDest,
        rawXml,
        dhEmi,
        nNF,
        cnpjEmit,
        nameEmit,
        qVol,
        pesoB,
        vNF,
        observation: observation ?? "",
      };

      return {
        newObjct,
        entireObject,
      };
    });

    setXmlProviderObjectList(
      xmlProviderList.map((item) => item && item.newObjct)
    );

    const rows = xmlProviderList.map((item) => item && item.entireObject);

    return rows;
  };

  const handleDeleteDocumentProvider = async (e, id) => {
    const isConfirm = window.confirm(
      "Deseja mesmo excluir esse documento de XML NFe ?"
    );
    if (isConfirm) {
      await xmlDocumentNFeService.deleteDocumentProvider(id);
      loadScreenXmlDocumentsNFe();
    }
  };

  const handleUpdateDocumentProvider = async () => {
    if (selectedItem) {
      // Clone the selectedItem to avoid modifying the original object
      const updatedItem = { ...selectedItem };

      const parser = new DOMParser();
      let xmlDoc = parser.parseFromString(updatedItem.rawXml, "text/xml");

      let dest = xmlDoc.getElementsByTagName("dest")[0];
      let cpfElement = dest.getElementsByTagName("CPF")[0];

      const dateInput = editFormData.dataEmit;
      const dateObject = new Date(dateInput);
      dateObject.setHours(dateObject.getHours() + 3);

      // Ajusta o fuso horário para UTC
      const dateToApi =
        new Date(dateObject).toISOString() === "Invalid Date"
          ? null
          : new Date(dateObject).toISOString();

      // Update the XML data with values from setEditFormData

      let emit = xmlDoc.getElementsByTagName("emit")[0];

      if (cpfElement) {
        const cpfDestCleanMask = await cleanMaskCPF(editFormData.cpfDest);
        dest.getElementsByTagName("CPF")[0].childNodes[0].nodeValue =
          cpfDestCleanMask;
        setEditFormData({
          ...editFormData,
          cpfDest: cpfDestCleanMask,
        });
      } else {
        const cnpjDestCleanMask = await cleanMaskCNPJ(editFormData.cnpjDest);
        dest.getElementsByTagName("CNPJ")[0].childNodes[0].nodeValue =
          cnpjDestCleanMask;
        setEditFormData({
          ...editFormData,
          cnpjDest: cnpjDestCleanMask,
        });
      }

      emit.getElementsByTagName("CNPJ")[0].childNodes[0].nodeValue =
        await cleanMaskCNPJ(editFormData.cnpjEmit);

      emit.getElementsByTagName("xNome")[0].childNodes[0].nodeValue =
        editFormData.nameEmit;

      let enderEmit = emit.getElementsByTagName("enderEmit")[0];

      enderEmit.getElementsByTagName("xLgr")[0].textContent =
        editFormData.endereco;
      enderEmit.getElementsByTagName("nro")[0].textContent =
        editFormData.numeroCasa;

      enderEmit.getElementsByTagName("CEP")[0].textContent = await cleanMaskCEP(
        editFormData.cep
      );
      enderEmit.getElementsByTagName("xMun")[0].textContent =
        editFormData.cidade;
      enderEmit.getElementsByTagName("UF")[0].textContent = editFormData.uf;
      enderEmit.getElementsByTagName("fone")[0].textContent =
        await cleanMaskPhone(editFormData.fone);
      enderEmit.getElementsByTagName("xBairro")[0].textContent =
        editFormData.bairro;

      dest.getElementsByTagName("xNome")[0].childNodes[0].nodeValue =
        editFormData.nameDest;

      xmlDoc.getElementsByTagName("qVol")[0].childNodes[0].nodeValue =
        editFormData.qVol;

      xmlDoc.getElementsByTagName("pesoB")[0].childNodes[0].nodeValue =
        editFormData.pesoB;

      let total = xmlDoc.getElementsByTagName("ICMSTot")[0];
      total.getElementsByTagName("vNF")[0].childNodes[0].nodeValue =
        editFormData.vNF;

      xmlDoc.getElementsByTagName("nNF")[0].childNodes[0].nodeValue =
        editFormData.nNF;

      xmlDoc.getElementsByTagName("esp")[0].childNodes[0].nodeValue =
        editFormData.esp;

      let infAdic = xmlDoc.getElementsByTagName("infAdic")[0];

      if (infAdic) {
        let infCpl = infAdic.getElementsByTagName("infCpl")[0];

        if (infCpl) {
          let textNode = infCpl.childNodes[0];

          if (textNode) {
            textNode.textContent = editFormData?.observation || "";
          } else {
            // Se o nó de texto não estiver presente, você pode criar um novo
            let newText = xmlDoc.createTextNode(
              editFormData?.observation || ""
            );
            infCpl.appendChild(newText);
          }
        } else {
          // Se o elemento infCpl não estiver presente, você pode criar um novo
          let newInfCpl = xmlDoc.createElement("infCpl");
          let newText = xmlDoc.createTextNode(editFormData?.observation || "");
          newInfCpl.appendChild(newText);
          infAdic.appendChild(newInfCpl);
        }
      }
      let infProt = xmlDoc.getElementsByTagName("infProt")[0];
      infProt.getElementsByTagName("chNFe")[0].childNodes[0].nodeValue =
        editFormData?.chave;

      let transp = xmlDoc.getElementsByTagName("transp")[0];
      transp.getElementsByTagName("modFrete")[0].childNodes[0].nodeValue =
        editFormData?.modalidade;

      let ide = xmlDoc.getElementsByTagName("ide")[0];
      // ide.getElementsByTagName("mod")[0].childNodes[0].nodeValue = editFormData?.modalidade;
      ide.getElementsByTagName("dhEmi")[0].childNodes[0].nodeValue = dateToApi
        ? dateToApi
        : ide.getElementsByTagName("dhEmi")[0].childNodes[0].nodeValue;

      dest.getElementsByTagName("xNome")[0].childNodes[0].nodeValue =
        editFormData.nameDest;
      let enderDest = dest.getElementsByTagName("enderDest")[0];
      enderDest.getElementsByTagName("xLgr")[0].textContent =
        editFormData.enderecoDest;
      enderDest.getElementsByTagName("nro")[0].textContent =
        editFormData.numeroCasaDest;
      enderDest.getElementsByTagName("CEP")[0].textContent = await cleanMaskCEP(
        editFormData.cepDest
      );
      enderDest.getElementsByTagName("xMun")[0].textContent =
        editFormData.municipioDest;
      enderDest.getElementsByTagName("UF")[0].textContent = editFormData.ufDest;
      enderDest.getElementsByTagName("fone")[0].textContent =
        await cleanMaskPhone(editFormData.foneDest);
      enderDest.getElementsByTagName("xBairro")[0].textContent =
        editFormData.bairroDest;
      dest.getElementsByTagName("email")[0].textContent =
        editFormData.emailDest;

      // Update the rawXml field in updatedItem
      updatedItem.rawXml = new XMLSerializer().serializeToString(xmlDoc);

      const dataFornecedor = {
        cnpj: editFormData.cnpjEmit,
        razaoSocial: editFormData.nameEmit,
        nomeFantasia: editFormData.nomeFantasia,
        endereco: editFormData.endereco,
        numeroCasa: editFormData.numeroCasa,
        bairro: editFormData.bairro,
        cidade: editFormData.cidade,
        estado: editFormData.uf,
        cep: editFormData.cep,
        telefone: editFormData.fone,
        email: editFormData.email,
        inscEstadual: editFormData.ie,
      };

      const dataCliente = {
        cpf:
          editFormData.cpfDest == undefined
            ? ""
            : await cleanMaskCPF(editFormData.cpfDest),
        cnpj:
          editFormData.cnpjDest == undefined
            ? ""
            : await cleanMaskCNPJ(editFormData.cnpjDest),
        name: editFormData.nameDest,
        nameFantasy: "",
        address: {
          cep: await cleanMaskCEP(editFormData.cepDest),
          city: editFormData.municipioDest,
          state: editFormData.ufDest,
          street: editFormData.enderecoDest,
          number: editFormData.numeroCasaDest,
          neighborhood: editFormData.bairroDest,
        },

        coordinates: await buscarCepForLatLon(editFormData.cepDest),

        telefone: await cleanMaskPhone(editFormData.foneDest),
        email: editFormData.emailDest,
      };

      if (editFormData.cnpjEmit <= 11) {
        const clientOnAPI = await clientsService.getClientByCpf(
          editFormData.cnpjDest
        );
        if (!clientOnAPI.empty) {
          await clientsService.updateClient(
            clientOnAPI.docs[0].id,
            dataCliente
          );
        }
      } else {
        let clientOnAPI;

        if (editFormData.cnpjDest != undefined) {
          const cnpjDestCleanMask = await cleanMaskCNPJ(editFormData.cnpjDest);
          clientOnAPI = await clientsService.getClientByCnpj(cnpjDestCleanMask);
        }

        if (editFormData.cpfDest != undefined) {
          const cpfDestCleanMask = await cleanMaskCPF(editFormData.cpfDest);
          clientOnAPI = await clientsService.getClientByCpf(cpfDestCleanMask);
        }

        if (!clientOnAPI.empty) {
          await clientsService.updateClient(
            clientOnAPI.docs[0].id,
            dataCliente
          );
        }
      }

      const dataInvoice = {
        cnpjEmit: await cleanMaskCNPJ(editFormData.cnpjEmit),
        cnpjDest:
          editFormData.cnpjDest == undefined
            ? ""
            : await cleanMaskCNPJ(editFormData.cnpjDest),
        cpfDest:
          editFormData.cpfDest == undefined
            ? ""
            : await cleanMaskCPF(editFormData.cpfDest),
        dataEmit: dateToApi,
        numeroNF: editFormData.nNF,
        chave: editFormData.chave,
        valorNF: editFormData.vNF,
        peso: editFormData.pesoB,
        volumes: editFormData.qVol,
        observacao: editFormData?.observation || "",
        especie: editFormData.esp,
      };

      await invoiceService.updateInvoice(updatedItem.xmlId, dataInvoice);
      try {
        await xmlDocumentNFeService.updateDocumentProvider(updatedItem.id, {
          xmlContent: updatedItem.rawXml,
        });
      } catch (error) {
        alert(error);
      }

      await loadScreenXmlDocumentsNFe();
      // Reset states or close modal as needed
      setSelectedItem(null);
      handleCloseProvider();
      setEditFormData(null);
    }
  };

  const handleFindAdvancedSearch = async (e) => {
    try {
      let numberNF = Number(paramsAdvancedSearch.NfNumer);
      let xmlDocumentsByAdvancedSearch = null;

      if (numberNF > 0) {
        xmlDocumentsByAdvancedSearch =
          await xmlDocumentNFeService.getProviderByNumberNF(
            paramsAdvancedSearch.NfNumer
          );
        if (xmlDocumentsByAdvancedSearch.empty) {
          alert("Nenhum registro foi localizado para o numero: " + numberNF);
        }
      } else {
        let initialDate = paramsAdvancedSearch.initialDate;
        initialDate = initialDate.replace("-", "");
        initialDate = initialDate.replace("-", "");
        initialDate = Number(initialDate);

        let endDate = paramsAdvancedSearch.endDate;
        endDate = endDate.replace("-", "");
        endDate = endDate.replace("-", "");
        endDate = Number(endDate);

        xmlDocumentsByAdvancedSearch =
          await xmlDocumentNFeService.getProviderByDateInitialAndFinaly(
            initialDate,
            endDate
          );

        if (xmlDocumentsByAdvancedSearch.empty) {
          alert(
            "Nenhum registro foi localizado para o intervalo de data '" +
              paramsAdvancedSearch.initialDate +
              "'" +
              "|" +
              "'" +
              paramsAdvancedSearch.endDate +
              "'."
          );
        }
      }

      if (xmlDocumentsByAdvancedSearch.docs.length > 0) {
        let resultAdvancedSearch = [];
        xmlDocumentsByAdvancedSearch.docs.forEach((element) => {
          let elementID = element.id;
          let xmlDocumentNFe = element.data();
          const parser = new DOMParser();
          const xmlDocument = parser.parseFromString(
            xmlDocumentNFe.xmlContent,
            "text/xml"
          );

          let dest = xmlDocument.getElementsByTagName("dest")[0];
          let nameDest =
            dest.getElementsByTagName("xNome")[0].childNodes[0].nodeValue;

          let ide = xmlDocument.getElementsByTagName("ide")[0];
          let dhEmi =
            ide.getElementsByTagName("dhEmi")[0].childNodes[0]?.nodeValue;
          let nNF = ide.getElementsByTagName("nNF")[0].childNodes[0]?.nodeValue;

          let ICMSTot = xmlDocument.getElementsByTagName("ICMSTot")[0];
          let vNF =
            ICMSTot.getElementsByTagName("vNF")[0].childNodes[0].nodeValue;

          let emit = xmlDocument.getElementsByTagName("emit")[0];
          let nameEmit =
            emit.getElementsByTagName("xNome")[0].childNodes[0]?.nodeValue;

          let qVol =
            xmlDocument.getElementsByTagName("qVol")[0].childNodes[0].nodeValue;

          let pesoB =
            xmlDocument.getElementsByTagName("pesoB")[0].childNodes[0]
              .nodeValue;

          let infAdic = xmlDocument.getElementsByTagName("infAdic")[0];
          let observation =
            infAdic.getElementsByTagName("infCpl")[0]?.childNodes[0].nodeValue;

          let xmlDocumentNFeForScreen = {
            id: elementID,
            dhEmi: dhEmi,
            nNF: nNF,
            nameEmit: nameEmit,
            nameDest: nameDest,
            qVol: qVol,
            pesoB: pesoB,
            vNF: vNF,
            observation: observation,
            rawXml: xmlDocumentNFe.xmlContent,
          };

          resultAdvancedSearch.push(xmlDocumentNFeForScreen);
        });

        setListaXmlRows(resultAdvancedSearch);
        setOpenAdvancedSearchModal(false);
      }
    } catch (error) {
      alert(error);
    }
  };

  async function loadScreenXmlDocumentsNFe() {
    const xmlDocumentsNFe = await GetXmlDocumentsNFe();
    const rows = xmlDocumentsNFe.filter((item) => item !== undefined);
    const totalVolumes = rows.reduce((acc, row) => acc + (+row.qVol || 0), 0);
    const totalPeso = rows.reduce(
      (acc, row) => acc + (+parseFloat(row.pesoB) || 0),
      0
    );
    const totalValor = rows.reduce((acc, row) => acc + (+row.vNF || 0), 0);

    let newListXmlDocuments = rows;
    newListXmlDocuments.push({
      id: "total",
      dhEmi: "",
      nNF: "",
      nameEmit: "",
      nameDest: "Total:",
      qVol: totalVolumes,
      pesoB: totalPeso,
      vNF: totalValor,
      observation: "",
    });

    setListaXmlRows(newListXmlDocuments);
  }

  async function changgeCNPJWhithMask(newValue, cnpjType) {
    try {
      let valueCount = newValue.length;
      if (newValue != "" && valueCount > 13) {
        newValue = await cleanMaskCNPJ(newValue);

        var regex = /^[0-9]+$/;
        let IsNumber = regex.test(newValue);

        if (IsNumber) {
          let withMaskCNPJ = await includeMaskCNPJ(newValue);
          switch (cnpjType) {
            case 1:
              setEditFormData({
                ...editFormData,
                cnpjEmit: withMaskCNPJ,
              });
              break;
            case 2:
              setEditFormData({
                ...editFormData,
                cnpjDest: withMaskCNPJ,
              });
              break;
          }
        } else {
          alert("Apenas numeros são aceitos para formatar o CNPJ.");
          return editFormData.cnpjEmit;
        }
      }
    } catch (error) {
      alert(error);
    }
  }

  async function changgeCPFWhithMask(newValue) {
    try {
      let valueCount = newValue.length;
      if (newValue != "" && valueCount > 11) {
        newValue = await cleanMaskCPF(newValue);

        var regex = /^[0-9]+$/;
        let IsNumber = regex.test(newValue);

        if (IsNumber) {
          let withMaskCPF = await includeMaskCPF(newValue);
          setEditFormData({
            ...editFormData,
            cpfDest: withMaskCPF,
          });
        } else {
          alert("Apenas numeros são aceitos para formatar o CPF.");
          return editFormData.cpfDest;
        }
      }
    } catch (error) {
      alert(error);
    }
  }

  async function changgeCEPWhithMask(newValue, cepType) {
    try {
      let valueCount = newValue.length;
      if (newValue != "" && valueCount >= 7) {
        newValue = await cleanMaskCEP(newValue);

        var regex = /^[0-9]+$/;
        let IsNumber = regex.test(newValue);
        if (IsNumber) {
          let withMaskCEP = await includeMaskCEP(newValue);
          switch (cepType) {
            case 1:
              setEditFormData({
                ...editFormData,
                cep: withMaskCEP,
              });
              break;
            case 2:
              setEditFormData({
                ...editFormData,
                cepDest: withMaskCEP,
              });
              break;
          }
        } else {
          alert("Apenas numeros são aceitos para formatar o CEP.");

          switch (cepType) {
            case 1:
              return editFormData.cep;
              break;
            case 2:
              return editFormData.cepDest;
              break;
          }
        }
      }
    } catch (error) {
      alert(error);
    }
  }

  async function changgePhoneWhithMask(newValue, phoneType) {
    try {
      let valueCount = newValue.length;
      if (newValue != "" && valueCount >= 7) {
        newValue = await cleanMaskPhone(newValue);

        var regex = /^[0-9]+$/;
        let IsNumber = regex.test(newValue);
        if (IsNumber) {
          let withMaskPhone = await includeMaskPhone(newValue);
          switch (phoneType) {
            case 1:
              setEditFormData({
                ...editFormData,
                fone: withMaskPhone,
              });
              break;
            case 2:
              setEditFormData({
                ...editFormData,
                foneDest: withMaskPhone,
              });
              break;
          }
        } else {
          alert("Apenas numeros são aceitos para formatar o Telefone.");
          switch (phoneType) {
            case 1:
              return editFormData.fone;
              break;
            case 2:
              return editFormData.foneDest;
              break;
          }
        }
      }
    } catch (error) {
      alert(error);
    }
  }

  async function includeMaskCNPJ(cnpjContent) {
    try {
      var regex = /^[0-9]+$/;
      let IsNumber = regex.test(cnpjContent);
      if (IsNumber) {
        cnpjContent = cnpjContent.replace(
          /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
          "$1.$2.$3/$4-$5"
        );
        return cnpjContent;
      } else {
        alert("Apenas numeros são aceitos para formatar o CNPJ.");
        return cnpjContent;
      }
    } catch (error) {
      alert(error);
    }
  }

  async function includeMaskCPF(cpfContent) {
    try {
      var regex = /^[0-9]+$/;
      let IsNumber = regex.test(cpfContent);
      if (IsNumber) {
        cpfContent = cpfContent.replace(
          /(\d{3})(\d{3})(\d{3})(\d{2})/g,
          "$1.$2.$3-$4"
        );
        return cpfContent;
      } else {
        alert("Apenas numeros são aceitos para formatar o CPF.");
        return cpfContent;
      }
    } catch (error) {
      alert(error);
    }
  }

  async function includeMaskCEP(cepContent) {
    try {
      var regex = /^[0-9]+$/;
      let IsNumber = regex.test(cepContent);
      if (IsNumber) {
        cepContent =
          cepContent.substring(0, 5) + "-" + cepContent.substring(8, 5);
        return cepContent;
      } else {
        alert("Apenas numeros são aceitos para formatar o CEP.");
        return cepContent;
      }
    } catch (error) {
      alert(error);
    }
  }

  async function includeMaskPhone(phoneContent) {
    try {
      var regex = /^[0-9]+$/;
      let IsNumber = regex.test(phoneContent);
      if (IsNumber) {
        phoneContent =
          "(" +
          phoneContent.substring(0, 2) +
          ")" +
          phoneContent.substring(2, 7) +
          "-" +
          phoneContent.substring(7);
        return phoneContent;
      } else {
        alert("Apenas numeros são aceitos para formatar o Telefone.");
        return phoneContent;
      }
    } catch (error) {
      alert(error);
    }
  }

  async function cleanMaskCNPJ(cnpjContent) {
    try {
      cnpjContent = cnpjContent.replace(".", "");
      cnpjContent = cnpjContent.replace(".", "");
      cnpjContent = cnpjContent.replace("/", "");
      cnpjContent = cnpjContent.replace("-", "");
      return cnpjContent;
    } catch (error) {
      alert(error);
    }
  }

  async function cleanMaskCPF(cpfContent) {
    try {
      cpfContent = cpfContent.replace(".", "");
      cpfContent = cpfContent.replace(".", "");
      cpfContent = cpfContent.replace("-", "");
      return cpfContent;
    } catch (error) {
      alert(error);
    }
  }

  async function cleanMaskCEP(cepjContent) {
    try {
      cepjContent = cepjContent.replace("-", "");
      return cepjContent;
    } catch (error) {
      alert(error);
    }
  }

  async function cleanMaskPhone(phonejContent) {
    try {
      phonejContent = phonejContent.replace("(", "");
      phonejContent = phonejContent.replace(")", "");
      phonejContent = phonejContent.replace("-", "");
      phonejContent = phonejContent.replace("-", "");
      return phonejContent;
    } catch (error) {
      alert(error);
    }
  }

  const handleItemsSelected = (selectedItems) => {
    
    let totalqVol = 0;
    let totalPesoB = 0;
    let totalVNF = 0;

    selectedItems.forEach(element => {          
      const numberqVol = Number(element["qVol"]);
      const numberPesoB = Number(element["pesoB"]);
      const numberVNF = Number(element["vNF"]);
      
      totalqVol = totalqVol + numberqVol;
      totalPesoB = totalPesoB + numberPesoB;
      totalVNF = totalVNF + numberVNF;
    });

    totalqVol = totalqVol.toFixed(2)
    totalPesoB = totalPesoB.toFixed(2)
    totalVNF = totalVNF.toFixed(2)
    
    setTotalVolumes(totalqVol);
    setTotalPesos(totalPesoB);
    setTotalValorNF(totalVNF);
  };

  return (
    <>
      <NewMiniDrawer
        divOpen={
          <div 
            className="freight-content align-items-center"
            style={{ paddingTop: '0px' }}
          >
            <div
              // style={{ backgroundColor: "red" }}
              className="form-signin mx-auto mb-4 mb-lg-6"
            >
              <div className="row" style={{ display: "flex" }}>
                <h2 style={{ margin:'0 0 20px 0', width: "25%" }}>Listagem XML</h2>
                <div style={{ justifyContent: "flex-end", width: "75%", display: "flex", gap: 10 }}>
                  <CustomButton
                    size="small"
                    type="primary"
                    style={{
                      backgroundColor: "var(--terciary-color)",
                      height: 32,
                      borderRadius: 6,
                    }}
                    className="col-md-3 CustomButton"
                    onClick={openModalAdvancedSearchModal}
                  >
                    Consulta Avançada
                  </CustomButton>

                  <div className="col-md-2">
                    <input
                      style={{ display: "none" }}
                      id="file-upload"
                      type="file"
                      accept=".xml"
                      onChange={async (event) => {
                        if (event.target.files.length === 0) {
                          // O usuário cancelou a seleção do arquivo
                          setIsAdding(false);
                        } else {
                          setIsAdding(true);
                          await handleMultipleFileChange(event);
                        }
                      }}
                      multiple
                    />
                    <CustomButton
                      type="primary"
                      htmlFor="file-upload"
                      style={{
                        padding: "0",
                      }}
                      className="CustomButton"
                    >
                      <label
                        htmlFor="file-upload"
                        className="custom-file-upload"
                        style={{
                          cursor: "pointer",
                          textAlign: "center",
                          borderColor: "var(--terciary-color)",
                        }}
                      >
                        {isAdding ? "Adicionando..." : "Importar XML"}
                      </label>
                    </CustomButton>
                  </div>
                </div>
                {isAdding && (
                  <div className="col-md-4">
                    <CircularProgress />
                  </div>
                )}
                {filesAdicionadas && (
                  <div className="col-md-4">
                    <p>{filesAdicionadas}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <DataGrid 
                columns={columns} 
                rows={listaXmlRows} 
                onItemsSelected={handleItemsSelected}
                handleOpenUpdateProvider={handleOpenUpdateProvider}
                handleDeleteDocumentProvider={handleDeleteDocumentProvider}
                totalVolumesSelect={totalVolumesSelect}
                totalPesosSelect={totalPesosSelect}
                totalValorNFSelect={totalValorNFSelect}
              />
            </div>
          </div> //div principal
        }
      />
      <Modal
        open={openProvider}
        onClose={handleCloseProvider}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 900,
            height: 700,
            overflow: "hidden",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <div>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Editar XML
            </Typography>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                overflowY: "scroll",
                maxHeight: 450,
                paddingTop: 10,
                width: "100%",
                Height: "80%",
                paddingX: "11px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 6,
                  paddingRight: 2,
                }}
              >
                <TextField
                  value={editFormData?.nNF ? editFormData.nNF : ""}
                  label={"Número da NF"}
                  onChange={(e) => {
                    setEditFormData({
                      ...editFormData,
                      nNF: e.target.value,
                    });
                  }}
                />
                <TextField
                  value={editFormData?.chave ? editFormData?.chave : ""}
                  label={"Chave"}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, chave: e.target.value });
                  }}
                />
                <TextField
                  value={
                    editFormData?.dataEmit
                      ? formatarDataParaYYYYMMDD(editFormData?.dataEmit)
                      : ""
                  }
                  type={"date"}
                  onChange={(e) => {
                    setEditFormData({
                      ...editFormData,
                      dataEmit: formatarDataParaYYYYMMDD(e.target.value),
                    });
                  }}
                />
              </div>
              <section
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  border: "1px solid #ccc",
                  padding: 6,
                }}
              >
                <h4>Emitente</h4>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <TextField
                    value={editFormData?.cnpjEmit ? editFormData?.cnpjEmit : ""}
                    label={"CNPJ"}
                    onChange={(e) => {
                      changgeCNPJWhithMask(e.target.value, 1);
                    }}
                  />
                  <TextField
                    value={editFormData?.nameEmit ? editFormData?.nameEmit : ""}
                    label={"Emissor"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        nameEmit: e.target.value,
                      });
                    }}
                  />
                  <TextField
                    value={editFormData?.cep ? editFormData?.cep : ""}
                    label={"CEP"}
                    onChange={(e) => {
                      changgeCEPWhithMask(e.target.value, 1);
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <TextField
                    value={editFormData?.endereco ? editFormData?.endereco : ""}
                    label={"Endereço"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        endereco: e.target.value,
                      });
                    }}
                  />
                  <TextField
                    value={
                      editFormData?.numeroCasa ? editFormData?.numeroCasa : ""
                    }
                    label={"Número"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        numeroCasa: e.target.value,
                      });
                    }}
                  />
                  <TextField
                    value={editFormData?.bairro ? editFormData?.bairro : ""}
                    label={"Bairro"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        bairro: e.target.value,
                      });
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 6,
                  }}
                >
                  <TextField
                    value={editFormData?.cidade ? editFormData?.cidade : ""}
                    label={"Cidade"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        cidade: e.target.value,
                      });
                    }}
                  />
                  <TextField
                    value={editFormData?.uf ? editFormData?.uf : ""}
                    label={"UF"}
                    sx={{
                      width: 60,
                    }}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, uf: e.target.value });
                    }}
                  />
                  <TextField
                    value={editFormData?.fone ? editFormData?.fone : ""}
                    label={"Telefone"}
                    onChange={(e) => {
                      changgePhoneWhithMask(e.target.value, 1);
                    }}
                  />
                  <TextField
                    value={editFormData?.email ? editFormData?.email : ""}
                    label={"Email"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      });
                    }}
                  />
                </div>
              </section>
              <section
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  border: "1px solid #ccc",
                  padding: 6,
                }}
              >
                <h4>Destinatario</h4>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 6,
                  }}
                >
                  <TextField
                    value={
                      editFormData?.cnpjDest == undefined
                        ? editFormData?.cpfDest
                        : editFormData?.cnpjDest
                    }
                    label={editFormData?.cnpjDest == undefined ? "CPF" : "CNPJ"}
                    onChange={(e) => {
                      if (editFormData?.cnpjDest != undefined) {
                        changgeCNPJWhithMask(e.target.value, 2);
                      }
                      if (editFormData?.cpfDest != undefined) {
                        changgeCPFWhithMask(e.target.value);
                      }
                    }}
                  />
                  <TextField
                    value={editFormData?.nameDest ? editFormData?.nameDest : ""}
                    label={"Destinatario"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        nameDest: e.target.value,
                      });
                    }}
                  />
                  <TextField
                    value={editFormData?.cepDest ? editFormData?.cepDest : ""}
                    label={"CEP"}
                    onChange={(e) => {
                      changgeCEPWhithMask(e.target.value, 2);
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 6,
                  }}
                >
                  <TextField
                    value={
                      editFormData?.enderecoDest
                        ? editFormData?.enderecoDest
                        : ""
                    }
                    label={"Endereço"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        enderecoDest: e.target.value,
                      });
                    }}
                  />
                  <TextField
                    value={
                      editFormData?.numeroCasaDest
                        ? editFormData?.numeroCasaDest
                        : ""
                    }
                    label={"Número"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        numeroCasaDest: e.target.value,
                      });
                    }}
                  />
                  <TextField
                    value={
                      editFormData?.bairroDest ? editFormData?.bairroDest : ""
                    }
                    label={"Bairro"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        bairroDest: e.target.value,
                      });
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 6,
                  }}
                >
                  <TextField
                    value={
                      editFormData?.municipioDest
                        ? editFormData?.municipioDest
                        : ""
                    }
                    label={"Cidade"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        municipioDest: e.target.value,
                      });
                    }}
                  />
                  <TextField
                    value={editFormData?.ufDest ? editFormData?.ufDest : ""}
                    label={"UF"}
                    sx={{
                      width: 60,
                    }}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        ufDest: e.target.value,
                      });
                    }}
                  />
                  <TextField
                    value={editFormData?.foneDest ? editFormData?.foneDest : ""}
                    label={"Telefone"}
                    onChange={(e) => {
                      changgePhoneWhithMask(e.target.value, 2);
                    }}
                  />
                  <TextField
                    value={
                      editFormData?.emailDest ? editFormData?.emailDest : ""
                    }
                    label={"Email"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        emailDest: e.target.value,
                      });
                    }}
                  />
                </div>
              </section>

              <section
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  border: "1px solid #ccc",
                  padding: 6,
                }}
              >
                <h4>Nota Fiscal</h4>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 6,
                  }}
                >
                  <TextField
                    value={
                      editFormData?.modalidade ? editFormData?.modalidade : ""
                    }
                    label={"Modalidade Frete"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        modalidade: e.target.value,
                      });
                    }}
                  />
                  <TextField
                    value={editFormData?.qVol ? editFormData?.qVol : ""}
                    label={"Volumes"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        qVol: e.target.value,
                      });
                    }}
                  />
                  <TextField
                    value={editFormData?.pesoB ? Number(editFormData.pesoB).toLocaleString('pt-BR', {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    }) : ""}
                    label={"Peso"}
                    onChange={(e) => {
                      // Remove a formatação ao capturar o valor para que o número seja armazenado corretamente
                      const rawValue = e.target.value.replace(/\./g, '').replace(/,/g, '.');
                      setEditFormData({
                        ...editFormData,
                        pesoB: rawValue, // Armazena o valor sem a formatação, substituindo vírgula por ponto
                      });
                    }}
                    inputProps={{
                      inputMode: "decimal", // Garante que o teclado numérico apareça em dispositivos móveis
                    }}
                  />
                  <TextField
                    value={editFormData?.vNF ? editFormData?.vNF : ""}
                    label={"Valor NF"}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        vNF: +e.target.value,
                      });
                    }}
                  />
                  <TextField
                    value={editFormData?.esp ? editFormData?.esp : ""}
                    label={"Espécie"}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, esp: e.target.value });
                    }}
                  />
                </div>
                <TextField
                  value={
                    editFormData?.observation ? editFormData?.observation : ""
                  }
                  label={"Observação"}
                  onChange={(e) => {
                    setEditFormData({
                      ...editFormData,
                      observation: e.target.value,
                    });
                  }}
                />
              </section>

              <div style={{ display: "flex", gap: 10, marginBottom: 30 }}></div>
              <div style={{ display: "flex", gap: 10, marginBottom: 30 }}></div>
            </div>

            <Stack
              pt={2}
              direction="row"
              width="100%"
              justifyContent="space-between"
            >
              <Button onClick={handleCloseProvider} color="error">
                Fechar
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdateDocumentProvider}
                className="CustomButton btn-cadastrar"
              >
                Salvar
              </Button>
            </Stack>
          </div>
        </Box>
      </Modal>

      <Modal
        open={openAdvancedSearchModal}
        onClose={handleClosedAdvancedSearchModal}
        aria-labelledby="modal-document-client"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: "50%",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Stack
            height="100%"
            alignItems="center"
            justifyContent="space-around"
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Consulta Avançada
            </Typography>
            <br></br>
            {/* <div className="col-md-4">
              <CircularProgress />
            </div> */}

            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 30 }}>
                <TextField
                  value={paramsAdvancedSearch.initialDate}
                  type={"date"}
                  label={"Data Inicial"}
                  onChange={(e) => {
                    setParamsAdvancedSearch({
                      ...paramsAdvancedSearch,
                      initialDate: e.target.value,
                      endDate: paramsAdvancedSearch.endDate,
                    });
                  }}
                />
                <TextField
                  value={paramsAdvancedSearch.endDate}
                  type={"date"}
                  label={"Data Final"}
                  onChange={(e) => {
                    setParamsAdvancedSearch({
                      ...paramsAdvancedSearch,
                      endDate: e.target.value,
                      initialDate: paramsAdvancedSearch.initialDate,
                    });
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 30 }}>
                <TextField
                  value={paramsAdvancedSearch.NfNumer}
                  label={"Numero NF"}
                  onChange={(e) => {
                    setParamsAdvancedSearch({
                      ...paramsAdvancedSearch,
                      NfNumer: e.target.value,
                    });
                  }}
                />
              </div>
            </div>

            <Stack
              pt={2}
              direction="row"
              width="100%"
              justifyContent="space-between"
            >
              <Button onClick={handleClosedAdvancedSearchModal} color="error">
                Fechar
              </Button>
              <Button variant="contained" onClick={handleFindAdvancedSearch}>
                Buscar
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}

export default ImportXml;
