import firebase from '../config/firebase';
require('firebase/auth')
const db = firebase.firestore();

const shipperService = {
    
    
    async getShipperAvailable(id){

        return db
            .collection('shipper')
            .doc(id)
            .get();
    },

    async getShipperAllbyCNPJ(cnpj) {
        const shipperQuerySnapshot = await db
            .collection('shipper')
            .where("dataPersonal.documentNumber", "==", cnpj)
            .get();

        if (shipperQuerySnapshot.empty) {
            throw new Error("Transportadora não encontrada.");
        }

        // Assumindo que o CNPJ é único, pegue o primeiro documento
        const shipperDoc = shipperQuerySnapshot.docs[0];
        
        return shipperDoc.data();
    },

}

export default shipperService;