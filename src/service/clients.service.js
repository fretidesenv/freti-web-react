import firebase from '../../src/config/firebase';
require('firebase/auth')

const clientsService = {
  
  async getClients() {
    const snapshot = await firebase.firestore().collection('client').get();
    
    // Mapeie os documentos para obter os dados reais e os IDs
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return clients;
  },
  
  async getClient(id){
    return await firebase.firestore()
      .collection('client')
      .doc(id)
      .get();
  },
  
  async getClientByCpf(cpf) {
    return firebase
      .firestore()
      .collection("client")
      .where("cpf", "==", cpf)
      .get();
  },

  async getClientByCnpj(cnpj) {    
    return firebase
      .firestore()
      .collection("client")
      .where("cnpj", "==", cnpj)
      .get();
  },
  
  async updateClientByXmlID(xmlID, newData) {
    console.log("Atualizando fatura pelo xmlID");
    
    try {
      // Consulta para encontrar o documento com base no xmlID
      const querySnapshot = await firebase
        .firestore()
        .collection("client")
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
  
  async saveClient(data){    
    console.log("insert cliente ")
    
    await firebase.firestore()
      .collection('client')
      .add(data)
      .catch(error => {
        
        console.log(error)
      });
  },

  async updateClient(id, newData){
    console.log("update cliente ")
    
    await firebase.firestore()
      .collection('client')
      .doc(id)
      .update(newData)
      .catch(error => {
        
        console.log(error)
      });
  },

  async deleteClient(id){
    try {
      console.log("Excluindo cliente");
      const docRef = firebase.firestore()
        .collection('client')
        .doc(id);
      await docRef.delete();
      console.log("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir cliente: ", error);
    }
  },
  
  
  
}

export default clientsService;