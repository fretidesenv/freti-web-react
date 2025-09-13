import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { PDFDocument, rgb } from 'pdf-lib';
import driverService from '../../src/service/driver.service';
import shipperService from '../../src/service/shipper.service';
import freightService from './freight.service';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function formatarDataISOparaBR(dataISO) {
    const [data] = dataISO.split('T');
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatCNPJ(cnpj) {
    if (!cnpj) return '';

    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return cnpj;

    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

const pdf = {
    async processPDF(dados, filePath) {

        const datas = [];

        const dadoUID = dados.driver?.uid;
        const dadoCNPJ = dados.infoEmit?.cnpjIssuer;
        const numberSerialDados = dados.infoMdfe.numberContract;

        async function getDataFromDriver(uid) {
            try {
                const data = await driverService.getDriverAllByUID(uid);
                datas.push(data);
            } catch (error) {
                console.error("Erro ao obter dados do motorista:", error);
            }
        }

        async function getDataFromCNPJ(cnpj) {
            try {
                const data = await shipperService.getShipperAllbyCNPJ(cnpj);
                datas.push(data);
            } catch (error) {
                console.error("Erro ao obter dados do embarcador:", error);
                alert("Erro ao obter dados do embarcador: " + error.message);
            }
        }

        async function getDataFromNumberSerial(numberSerialDados) {
            try {
                const data = await freightService.getFreightByIdContractNumber(numberSerialDados);
                datas.push(data);
            } catch (error) {
                console.error("Erro ao obter dados do número de série:", error);
            }
        }

        console.log("[processPDF] Iniciando processamento do PDF...");

        // Validação dos dados
        if (!dados || dados.length === 0 || !filePath) {
        console.warn("[processPDF] Nenhum dado fornecido.");
        return;
        }

        if (datas.length === 0) {
            await getDataFromDriver(dadoUID);
            await getDataFromCNPJ(dadoCNPJ);
            await getDataFromNumberSerial(numberSerialDados);
            // console.log(datas);
        }

        // Etapa 1: Carregar o PDF original
        const file = await fetch(filePath);
        if (!file.ok) {
        throw new Error(`Erro ao buscar o arquivo: ${file.statusText}`);
        }

        const existingPdfBytes = await file.arrayBuffer();

        try {
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const secondPage = pages[1];
        const sixthPage = pages[5];

        // console.log(dados);
        // Dados do Locatário
        // Inserir Nome do motorista
        firstPage.drawText(dados.driver.nameDriver || "", {
            x: 195,
            y: 671,
            size: 7.5,
            color: rgb(0, 0, 0),
        });

        // Inserir Cpf ou Cnpj do motorista
        firstPage.drawText(dados.vehicleDriver.documentNumberDriver || "", {
            x: 140,
            y: 656,
            size: 10,
            color: rgb(0, 0, 0),
        });

        // Inserir Endereço do motorista
        firstPage.drawText((datas[0].allData.address.street || "") + ", " + (datas[0].allData.address.number || "") + ", " + (datas[0].allData.address.district || ""), {
            x: 105,
            y: 628,
            size: 10,
            color: rgb(0, 0, 0),
        });

        // Inserir Continuidade do Endereço do motorista
        firstPage.drawText((datas[0].allData.address.city || "") + " - " + (datas[0].allData.address.state || "") + " - " + (datas[0].allData.address.cep || ""), {
            x: 105,
            y: 613,
            size: 10,
            color: rgb(0, 0, 0),
        });

        // Inserir Email do motorista
        firstPage.drawText(datas[0].driverData.email || "", {
            x: 125,
            y: 594,
            size: 10,
            color: rgb(0, 0, 0),
        });

        // Inserir Telefone do motorista
        firstPage.drawText(datas[0].allData.personalData.contact || "", {
            x: 195,
            y: 580,
            size: 10,
            color: rgb(0, 0, 0),
        });

        // Dados do Locador
        // Inserir Nome do Locador
        firstPage.drawText(dados.infoEmit.corporateName || "", {
            x: 422,
            y: 671,
            size: 7.5,
            color: rgb(0, 0, 0),
        });

        // Inserir Cnpj do Locador
        firstPage.drawText(formatCNPJ(dados.infoEmit.cnpjIssuer) || "", {
            x: 422 - 55,
            y: 656,
            size: 10,
            color: rgb(0, 0, 0),
        });

        // Inserir Endereço do Locador
        firstPage.drawText((datas[1].address.street || "") + ", " + (datas[1].address.numeroEndereco || "") + ", " + (datas[1].address.neighborhood || ""), {
            x: 422 - 80,
            y: 628,
            size: 10,
            color: rgb(0, 0, 0),
        });

        // Inserir Continuidade do Endereço do Locador
        firstPage.drawText((datas[1].address.city || "") + " - " + (datas[1].address.state || "") + " - " + (datas[1].address.cep || ""), {
            x: 422 - 80,
            y: 613,
            size: 10,
            color: rgb(0, 0, 0),
        });

        // Inserir Email do Locador
        firstPage.drawText(datas[1].contact[0].email || "", {
            x: 422 - 50,
            y: 594,
            size: 10,
            color: rgb(0, 0, 0),
        });

        // Inserir Telefone do Locador
        firstPage.drawText(datas[1].contact[0].telefone || "", {
            x: 422 - 80,
            y: 580,
            size: 10,
            color: rgb(0, 0, 0),
        });

        //Inserir Retangulo Branco para esconder texto
        firstPage.drawRectangle({
            x: 80,
            y: 350,
            width: 500,
            height: 20,
            color: rgb(1, 1, 1),
        });

        //Inserir Retangulo Amarelo(Marca Texto)
        firstPage.drawRectangle({
            x: 83,
            y: 350,
            width: 455,
            height: 20,
            color: rgb(1, 1, 0), // Amarelo puro
            opacity: 0.8,        // Transparência para parecer marca-texto
            borderColor: undefined, // Sem borda
            borderWidth: 0,
        });

        //Inserir Texto do Contrato
        firstPage.drawText("R/RMC:____________________,Chassi:_____________,Placa:_________,Renavam:____________,", {
            x: 84,
            y: 356,
            size: 10,
            color: rgb(0, 0, 0),
        });

        //Inserir Modelo Marca do Veículo
        firstPage.drawText(datas[0].allData.vehicle.descricaoVeiculo || "Marca", {
            x: 120,
            y: 357,
            size: 7.5,
            color: rgb(0, 0, 0),
        });

        //Inserir Placa do Veículo
        firstPage.drawText(datas[0].allData.vehicle.vehiclePlate || "Placa", {
            x: 370,
            y: 357,
            size: 10,
            color: rgb(0, 0, 0),
        });

        //Inserir Renavam do Veículo
        firstPage.drawText(datas[0].allData.vehicle.renavam || "Placa", {
            x: 470,
            y: 358,
            size: 10,
            color: rgb(0, 0, 0),
        });

        //Inserir Retangulo Branco para esconder texto
        firstPage.drawRectangle({
            x: 320,
            y: 110,
            width: 60,
            height: 20,
            color: rgb(1, 1, 1),
        });

        //Inserir Retangulo Amarelo(Marca Texto)
        firstPage.drawRectangle({
            x: 320,
            y: 110,
            width: 60,
            height: 20,
            color: rgb(1, 1, 0), // Amarelo puro
            opacity: 0.8,        // Transparência para parecer marca-texto
            borderColor: undefined, // Sem borda
            borderWidth: 0,
        });

        //Inserir Data de inicio do Veículo
        firstPage.drawText( "_________.", {
            x: 323,
            y: 116,
            size: 10,
            color: rgb(0, 0, 0),
        });

        //Inserir Data de inicio do Veículo
        firstPage.drawText( formatarDataISOparaBR(dados.infoTrip.startData) || "Start Day", {
            x: 323,
            y: 116,
            size: 10,
            color: rgb(0, 0, 0),
        });

        //Segunda Página
        //Inserir Retangulo Branco para esconder texto
        secondPage.drawRectangle({
            x: 155,
            y: 690,
            width: 80,
            height: 33,
            color: rgb(1, 1, 1),
        });

        //Inserir valor do frete ao motorista
        secondPage.drawText(datas[2]?.driver?.valueNegotiated + " ." || "0,00", {
            x: 160,
            y: 710,
            size: 10,
            color: rgb(0, 0, 0),
        });

        //Inserir Segundo Retangulo Branco para esconder texto
        secondPage.drawRectangle({
            x: 453,
            y: 670,
            width: 20,
            height: 33,
            color: rgb(1, 1, 1),
        });

        //Inserir data de pagamento
        secondPage.drawText("15" , {
            x: 458,
            y: 675,
            size: 10,
            color: rgb(0, 0, 0),
        });

        //Sexta Pagina
        //Inserir Retangulo Branco para esconder texto Nome Locataria
        sixthPage.drawRectangle({
            x: 50,
            y: 615,
            width: 500,
            height: 20,
            color: rgb(1, 1, 1),
        });

        //Inserir Nome Locataria
        sixthPage.drawText(dados.driver.nameDriver || "", {
            x: 220,
            y: 615,
            size: 12,
            color: rgb(0, 0, 0),
        });

        //Inserir Retangulo Branco para esconder texto CPF Locataria
        sixthPage.drawRectangle({
            x: 290,
            y: 590,
            width: 120,
            height: 20,
            color: rgb(1, 1, 1),
        });

        //Inserir Retangulo Amarelo(Marca Texto)
        sixthPage.drawRectangle({
            x: 290,
            y: 590,
            width: 120,
            height: 20,
            color: rgb(1, 1, 0), // Amarelo puro
            opacity: 0.8,        // Transparência para parecer marca-texto
            borderColor: undefined, // Sem borda
            borderWidth: 0,
        });

        //Inserir CPF Locataria
        sixthPage.drawText(dados.vehicleDriver.documentNumberDriver || "", {
            x: 290,
            y: 595,
            size: 14,
            color: rgb(0, 0, 0),
        });

        //Inserir Retangulo Branco para esconder texto Nome Locadora
        sixthPage.drawRectangle({
            x: 50,
            y: 500,
            width: 500,
            height: 20,
            color: rgb(1, 1, 1),
        });

        //Inserir Nome da Locadora
        sixthPage.drawText(dados.infoEmit.corporateName || "", {
            x: 220,
            y: 505,
            size: 12,
            color: rgb(0, 0, 0),
        });

        //Inserir Retangulo Branco para esconder texto CPF Locadora
        sixthPage.drawRectangle({
            x: 290,
            y: 480,
            width: 120,
            height: 20,
            color: rgb(1, 1, 1),
        });

        //Inserir Retangulo Amarelo(Marca Texto)
        sixthPage.drawRectangle({
            x: 290,
            y: 480,
            width: 125,
            height: 20,
            color: rgb(1, 1, 0), // Amarelo puro
            opacity: 0.8,        // Transparência para parecer marca-texto
            borderColor: undefined, // Sem borda
            borderWidth: 0,
        });

        // Inserir CPF/CNPJ do Locadora
        sixthPage.drawText(formatCNPJ(dados.infoEmit.cnpjIssuer) || "", {
            x: 290,
            y: 485,
            size: 14,
            color: rgb(0, 0, 0),
        });

        const pdfBytes = await pdfDoc.save();
        console.log("[processPDF] PDF modificado com sucesso.");
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Cria link para download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${dados.driver.nameDriver.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}-${dados.infoEmit.corporateName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}-Contrato.pdf`;
        document.body.appendChild(link);
        link.click();

        // Limpa o objeto após uso
        setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        }, 10000);

        return { pdfBytes };
        } catch (error) {
        console.error("[processPDF] Erro ao modificar PDF:", error);
        throw error;
        }
    }
};

export default pdf;
