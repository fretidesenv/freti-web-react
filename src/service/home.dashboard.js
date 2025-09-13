import firebase from '../../src/config/firebase';
require('firebase/auth')

const db = firebase.firestore();

const homeDashboardService = {

    
    async freightAvaliable(){
    return db.collection('freight').where('status.describe', '==', 'Pendente de contratação')
        .get();
    },

    async freightInTravel(){
        return db.collection('freight').where('status.describe', '==', 'Em transito')
        .get();
    },

    async waitingDriver(){
        return db.collection('freight').where('status.describe','==', 'Em Analise do motorista')
        .get();
    },

    async driverPending(){
        return db.collection('drivers_users').where('statusDriver','not-in', ['authorized'])
            .get();
    },


}

export default homeDashboardService;