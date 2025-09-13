import firebase from "../config/firebase";
require("firebase/auth");

const xmlDocumentNFeService = {
  async getAllXMLDocumentsNFe() {
    return firebase
      .firestore()
      .collection("xml_document_nfe")
      .limit(1000)
      .get();
  },

  async getProviderByCnpj(cnpj) {
    return await firebase
      .firestore()
      .collection("xml_document_nfe")
      .where("cpfcnpj", "==", cnpj)
      .get();
  },

  async getProviderByChaveNFe(chaveNFe) {
    return await firebase
      .firestore()
      .collection("xml_document_nfe")
      .where("chave", "==", chaveNFe)
      .get();
  },

  async getProviderByNumberNF(numberNF) {
    return await firebase
      .firestore()
      .collection("xml_document_nfe")
      .where("nNF", "==", numberNF)
      .get();
  },
  async getProviderByDateInitialAndFinaly(initialDate, finallyDate) {    
    try {
      return await firebase
        .firestore()
        .collection("xml_document_nfe")
        .where("dhEmi", ">=", initialDate)
        .where("dhEmi", "<=", finallyDate)
        .get();
    } catch (error) {      
      console.error("Error ### Erro  ao consultar NF por Data 'getProviderByNumberNF'!", error);
      throw error; // Propaga o erro para tratamento posterior, se necessário
    }
  },

  async createDocumentProvider(data) {
    try {
      const docRef = await firebase
        .firestore()
        .collection("xml_document_nfe")
        .add(data);
      return docRef.id; // Retorna o ID do regsitro criado.
    } catch (error) {
      console.error("Error ### Erro  ao salvar o documento XML NFe!", error);
      throw error; // Propaga o erro para tratamento posterior, se necessário
    }
  },

  async updateDocumentProvider(id, newData) {
    firebase
      .firestore()
      .collection("xml_document_nfe")
      .doc(id)
      .update(newData)
      .catch((error) => {
        console.log(error);
      });
  },

  async deleteDocumentProvider(id) {
    try {
      const docRef = firebase
        .firestore()
        .collection("xml_document_nfe")
        .doc(id);
      await docRef.delete();
    } catch (error) {
      console.error("Erro ao excluir documento: ", error);
    }
  },
};

export default xmlDocumentNFeService;
