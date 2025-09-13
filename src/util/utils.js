import municipios from './municipios-brasil.json'; 
import estados from './estados.json';

const Utils = {
    
    parseTimestamp({ seconds, nanoseconds }) {
        if (typeof seconds !== 'number') return null;

        const milliseconds = seconds * 1000 + Math.floor(nanoseconds / 1e6);
        const date = new Date(milliseconds);

        return date.toISOString(); // "2025-07-01T18:36:40.129Z"
    },

    buscarMunicipiosPorNome(nomeBuscado){
        const normalizar = str => {
            if (!str) return ''; // retorna string vazia se undefined ou null
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        };

        const nomeNormalizado = normalizar(nomeBuscado);

        const resultados = municipios
            .filter(m => normalizar(m.nome).includes(nomeNormalizado))
            .map(m => ({
                xMunCarrega: m.nome ? m.nome : "",//Retirar depois
                cMunCarrega: m.id ?  m.id.toString() + "" : "0000000"
            }));

        return resultados;
    },


    buscarMunicipiosDedescargaPorNome(nomeBuscado){
        const normalizar = str => {
            if (!str) return ''; // retorna string vazia se undefined ou null
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        };

        const nomeNormalizado = normalizar(nomeBuscado);

        const resultados = municipios
            .filter(m => normalizar(m.nome).includes(nomeNormalizado))
            .map(m => ({
                xMunDescarga: m.nome ? m.nome : "",
                cMunDescarga: m.id ?  m.id : "0000000"
            }));

        return resultados;
    },

        buscarMunicipiosEmitentePorNome(nomeBuscado){
            debugger
        const normalizar = str => {
            if (!str) return ''; // retorna string vazia se undefined ou null
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        };

        debugger
        const nomeNormalizado = normalizar(nomeBuscado);

        debugger
        const resultados = municipios
            .filter(m => normalizar(m.nome).includes(nomeNormalizado))
            .map(m => ({
                codigo: m.id ?  m.id : "0000000"
            }));

            debugger

        return resultados;
    },


    buscarEstadoPorNome(nomeBuscado){
        const normalizar = str => {
            if (!str) return ''; // retorna string vazia se undefined ou null
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        };

        const nomeNormalizado = normalizar(nomeBuscado);

        const resultados = estados
            .filter(m => normalizar(m.uf).includes(nomeNormalizado))
            .map(m => ({
                codigo_ibge: m.codigo_ibge ?  m.codigo_ibge : ""
            }));

        return resultados;
    },

    extrairAno(dataEntrada) {
        const data = new Date(dataEntrada);

        if (isNaN(data)) {
            return { ano: null, mes: null, erro: 'Data inválida' };
        }

        const anoCompleto = data.getFullYear();        // ex: 2025
        const ano = String(anoCompleto).slice(-2);     // pega os 2 últimos dígitos → "25"

        return ano;
    },
    
    extrairMes(dataEntrada) {
        const data = new Date(dataEntrada);

        if (isNaN(data)) {
            return { ano: null, mes: null, erro: 'Data inválida' };
        }

        const mes = String(data.getMonth() + 1).padStart(2, '0'); // mês com 2 dígitos

        return mes;
    },

    apenasNumerico(cep) {
        if(cep === undefined || cep === null) {
            return '';
        }
        return cep.replace(/\D/g, ''); // remove tudo que não for dígito
    },

    removerCaracteresEspeciais(texto) {
        return texto.replace(/[^a-zA-Z0-9 ]/g, '');
    },

    gerarQrCodMDFe(chave, tpAmb) {

        console.log("gerarQrCodMDFe", chave, tpAmb); //

        debugger

        const urlBase = 'https://mdfe.fazenda.mg.gov.br/mdfeqr/mdfeqrcode.aspx';

        if (!chave || chave.length !== 44) {
            throw new Error('A chave MDFe deve ter exatamente 44 dígitos.');
        }

        if (![1, 2].includes(tpAmb)) {
            throw new Error('tpAmb inválido. Use 1 para produção ou 2 para homologação.');
        }

        return `${urlBase}?chMDFe=${chave}&tpAmb=${tpAmb}`;
    },

    validarChaveMDFe(chave) {
        if (!/^\d{44}$/.test(chave)) {
            return { valido: false, erro: "A chave deve conter exatamente 44 dígitos numéricos." };
        }

        const base = chave.slice(0, 43); // primeiros 43 dígitos
        const dvInformado = parseInt(chave[43]);

        const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
        let soma = 0;
        let pesoIndex = 0;

        // percorre da direita para a esquerda (do penúltimo ao primeiro)
        for (let i = base.length - 1; i >= 0; i--) {
            soma += parseInt(base[i]) * pesos[pesoIndex];
            pesoIndex = (pesoIndex + 1) % pesos.length;
        }

        const resto = soma % 11;
        const dvCalculado = resto === 0 || resto === 1 ? 0 : 11 - resto;

        if (dvCalculado !== dvInformado) {
            return {
                valido: false,
                erro: `Dígito verificador inválido. Esperado: ${dvCalculado}, informado: ${dvInformado}`,
            };
        }

            return { valido: true };
    },  
    
    formatDateForInput(dateBR){
        if (!dateBR) return '';
        const [day, month, year] = dateBR.split('/');
        return `${year}-${month}-${day}`; // YYYY-MM-DD
    }

}

export default Utils;




