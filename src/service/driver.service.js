import firebase from '../../src/config/firebase';
require('firebase/auth')


const driverService = {
    

    async getDriverAvailable(id){
        
        return firebase.firestore()
            .collection('drivers_users')
            .doc(id)
            .get()
    },
    
    async getDriverAvailableById(id){
        // console.log("getDriverAvailableById: " + id)
        return firebase.firestore()
            .collection('drivers_users')
            .doc(id)
            .collection('documents')
            .doc("allData")
            .get()
    },

    async getDriverAllByUID(uid) {
        const driverQuerySnapshot = await firebase.firestore()
            .collection('drivers_users')
            .where("uid", "==", uid)
            .get();

        if (driverQuerySnapshot.empty) {
            throw new Error("Motorista não encontrado.");
        }

        // Assumindo que o uid é único, pegue o primeiro documento
        const driverDoc = driverQuerySnapshot.docs[0];
        
        // Agora acesse a subcoleção "documents"
        const allDataDoc = await driverDoc.ref
            .collection('documents')
            .doc('allData')
            .get();

        if (!allDataDoc.exists) {
            throw new Error("Documento 'allData' não encontrado.");
        }

        return {
            driverData: driverDoc.data(),
            allData: allDataDoc.data()
        };
    },

    async getDriverDocuments(id) {
        return firebase.firestore()
            .collection('drivers_users')
            .doc(id)
            .collection('documents')
            .get();
    },

    async getAllDriver(idShipper){

        const collectionRef = firebase.firestore()
            .collection('drivers_users')
            .where("uidShipper", "==", idShipper)
            .get();
        var count = await collectionRef;
        return count.size;
            
    },


    async saveMyFreightToDriver(idDriver, data){
        console.log("Adicionando o frete ao motorista " + data)

        console.log(data)

        firebase.firestore()
            .collection('drivers_users')
            .doc(idDriver)
            .collection('myFreightsList')
            .add(data)
            // .doc(idFreight)
            // .update(data)
            .catch(error => {
                console.log(error)
            });
    },


    async saveStatusMyFreight(idDriver, idFreight, status){
        console.log("salvando status na fila do MyFrete" + status)

        var data = {
            status: status,
            updatedAt: new Date().toISOString()
        }

        console.log(data)
 
        return firebase.firestore()
            .collection('drivers_users')
            .doc(idDriver)
            .collection('myFreightsList')
            .doc(idFreight)
            .update(data)
            .catch(error => {
                console.log(error)
                throw error;
            });
    },

    async saveMyFreight(idDriver, idFreight, data){
        console.log("salvando status na fila do MyFrete")

        console.log(data)

        firebase.firestore()
                .collection('drivers_users')
                .doc(idDriver)
                .collection('myFreightsList')
                .doc(idFreight)
                .set(data)
            .catch(error => {
                console.log(error)
            });
    },

    async saveClient(clientData) {

        try {
            await firebase.firestore()
                .collection("client")
                .doc()
                .set(clientData);
    
            // alert("Dados atualizados com sucesso!");
        } catch (error) {
            console.error("Erro ao adicionar dados:", error);
        }
    },

    async saveMessageInMyFreight(idDriver, title, message){
        console.log("salvando mensagens na fila do MyFrete ")
        // salvar em drivers_users/uidUser/notifications
        var data = {
            title: title,
            message: message,
            created: new Date()
        }

        console.log(data)

        firebase.firestore()
            .collection('drivers_users')
            .doc(idDriver)
            .collection('notifications')
            .add(data)
            .catch(error => {
                console.log(error)
            });

    },


    async deleteStatusMyFreight(idDriver, idFreight){
        console.log("Deletando status na fila do MyFrete")
        
        try {
            const docRef = firebase.firestore()
                .collection('drivers_users')
                .doc(idDriver)
                .collection('myFreightsList')
                .doc(idFreight);
            
            // Verifica se o documento existe antes de deletar
            const docSnapshot = await docRef.get();
            
            if (docSnapshot.exists) {
                await docRef.delete();
                console.log("Documento deletado com sucesso");
            } else {
                console.log("Documento não existe, nenhuma ação necessária");
            }
        } catch (error) {
            console.log("Erro ao deletar status na fila do MyFrete");
            console.log(error);
        }
    },


}

export default driverService;