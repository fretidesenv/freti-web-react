import firebase from '../../src/config/firebase';
require('firebase/auth')

const db = firebase.firestore();

const GroupService = {

    
    async getGroup(uidShipper){
    return db.collection('tb_group').where('uidShipper', '==', uidShipper)
        .get();
    },



}

export default GroupService;