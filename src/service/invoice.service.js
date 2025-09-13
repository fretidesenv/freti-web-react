import firebase from '../../src/config/firebase';
require('firebase/auth')
const invoiceService = {
    async getInvoices() {
        return firebase.firestore()
            .collection('invoices').get()
    },
    async getInvoice(id) {
        return firebase.firestore()
            .collection('invoices')
            .doc(id)
            .get();
    },
    async saveInvoice(data) {
        console.log("salvando invoice ")
        
        firebase.firestore()
            .collection('invoices')
            .add(data)
            .catch(error => {
                console.log(error)
            });
    },
    async updateInvoice(id, newData) {
        firebase.firestore()
            .collection('invoices')
            .doc(id)
            .update(newData)
            .catch(error => {
                console.log(error)
            });
    },
    async updateInvoiceByXmlID(xmlID, newData) {
        console.log("Atualizando fatura pelo xmlID");
        try {
            // Consulta para encontrar o documento com base no xmlID
            const querySnapshot = await firebase
              .firestore()
              .collection("invoices")
              .where("xmlID", "==", xmlID)
              .get();
            
            // Verifica se há algum documento correspondente
            if (querySnapshot.docs.length > 0) {
                const docRef = querySnapshot.docs[0].ref;
                
                // Atualiza o documento encontrado
                await docRef.update(newData);
                
                console.log("Documento atualizado com sucesso");
            } else {
                console.log("Nenhum documento encontrado com o xmlID fornecido");
            }
        } catch (error) {
            console.error("Erro ao atualizar o documento:", error);
            throw error; // Propaga o erro para tratamento posterior, se necessário
        }
    },
    async deleteInvoice(id) {
        try {
            console.log("Excluindo invoice");
            const docRef = firebase.firestore()
                .collection('invoices')
                .doc(id);
            await docRef.delete();
            console.log("Invoice excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir invoice: ", error);
        }
    },
}
export default invoiceService;