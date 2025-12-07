import firebase, { collection, getDocs } from '../../src/config/firebase';
require('firebase/auth')

const db = firebase.firestore();

const freightService = {

    async deleteFreight(id){

        db.collection('freight')
        .doc(id)
        .delete()
        .catch(error => {
            alert('Erro ao deletar esse frete, contate o adm do sistema')
            console.log('Erro ao deletar esse frete')

        });
    },

    async saveStatusQueueFreight(id, idQueue, status){
        console.log("[saveStatusQueueFreight] Salvando status na fila do frete " + status)
        
        var data = {
            status: status,
            updatedAt: new Date().toISOString()
        }

        return db.collection('freight')
            .doc(id)
            .collection('queue')
            .doc(idQueue)
            .update(data)
            .catch(error => {
                console.log(error)
                throw error;
            });
    },

    async saveDriverQueueFreight(idFreight, idDriver, data){
        console.log("[saveDriverQueueFreight] Salvando status na fila do frete ")
        
        console.log(data)
        
        db.collection('freight')
                .doc(idFreight)
                .collection('queue')
                .doc(idDriver)
                .set(data)
            .catch(error => {
                console.log(error)
            });
    },

    async deleteDriverQueueFreight(idFreight, idDriver) {
        console.log("[deleteDriverQueueFreight] Removendo motorista da fila do frete");
    
        try {
            await db.collection('freight')
                .doc(idFreight)
                .collection('queue')
                .doc(idDriver)
                .delete();
            console.log(`Motorista ${idDriver} removido da fila do frete ${idFreight}`);
        } catch (error) {
            console.error("Erro ao remover motorista da fila do frete:", error);
        }
    },

    async updateStatusFreight(idFreight, status, codeStatus){
        console.log("[updateStatusFreight] Salvando status no frete" + status + "Codigo: " + codeStatus)
        
        var chosenStatus = {
            describe: status,
            code: codeStatus
        }
        
        var data = {
            status: chosenStatus
        }

        

        db.collection('freight')
            .doc(idFreight)
            .update(data)
            .catch(error => {
                console.log(error)
            });
    },

    async searchCurrentWay(idFreight){


        // return {
        //     latitude: -8.071562122327835,
        //     longitude: -34.927362241277,
        //     timestamp: 1725113176452
        // }

        return db.collection('freight')
            .doc(idFreight)
            .collection('positions')
            .orderBy('timestamp', "desc")
            .limit(1)  
        .get();
    },


    async getFreightByIdContractNumber(contractNumber) {
        // console.log(contractNumber)
        return db.collection('freight')
        .where("numberSerial", "==", contractNumber)
        .get();
    },

    //#busca a posição mais antiga do frete, posição inicial
    async searchFirstWay(idFreight){
        return await db.collection('freight')
            .doc(idFreight)
            .collection('positions') 
            .orderBy('timestamp') 
            .limit(1) 
        .get();
    },
    //#busca as posições após a ultima recebida 
    async searchLatestPositions(idFreight, lastPositionReceived){

        return await db.collection('freight')
            .doc(idFreight)
            .collection('positions') 
            .orderBy('timestamp') 
            .startAfter(lastPositionReceived) 
        .get();
    },

    async freightDeliveredEffect(){

        return db
        .collection('freight').doc()  
        .collection('stopping_points')
        // .where('concluded', '==', true)
        .get()
    },

    async getAllFreights() {
        return db.collection('freight').orderBy('createData', 'desc').get();
    },

    async getFreightById(idFreight) {
        return db.collection('freight')
        .doc(idFreight)
        .get();
    },
    

    async getFreightsInProgress(idShipper) {

        console.log(idShipper)

        return db.collection('freight')
        .where("status.describe", "==", "Em transito")
        .where("shipper.uid", "==", idShipper)
        .orderBy('createData', 'desc')
        // .where('status.describe', 'not-in', ['Em Analise do motorista', 'Em Analise de perfil', 'Pendente de contratação'])
        .get()
        // .where('status.describe', 'not-in', ['Em Analise do motorista'])
    },

    async getFreightsInPendente(idShipper) {
        return db.collection('freight')
        .where("status.describe", "==", "Pendente de contratação")
        .where("shipper.uid", "==", idShipper)
        .orderBy('createData', 'desc')
        // .where('status.describe', 'not-in', ['Em Analise do motorista', 'Em Analise de perfil', 'Pendente de contratação'])
        .get()
        // .where('status.describe', 'not-in', ['Em Analise do motorista'])
    },

    async getFreightsHired(idShipper) {
        return db.collection('freight')
        .where('status.describe', '==', "Contratado")
        .where("shipper.uid", "==", idShipper)
        .orderBy('createData', 'desc')
        // .where('status.describe', 'not-in', ['Em Analise do motorista', 'Em Analise de perfil', 'Pendente de contratação'])
        .get()
        // .where('status.describe', 'not-in', ['Em Analise do motorista'])
    },


    async freightAllFinalizado(idShipper) {
        return db.collection('freight')
            .where("status.describe", "==", "Finalizado")
            .where("shipper.uid", "==", idShipper)
            .get(); 
    },

    async getFreightsByDriverId(idDriver) {

        var retorno = await db.collection('freight')
        .where('freight.getDriverFreight.uidDriver', '==', idDriver)
        .get()
        
        return retorno
    },

    // async getFreightById(idFreight) {
    //     return db.collection('freight')
    //     .doc(idFreight)
    //     .get()
    // },

    async getPositionsByFreight(idFreight) {
        return db
        .collection('freight')
        .doc(idFreight)
        .collection('positions')
        .orderBy('timestamp', "desc")
        .get();
    },

    async getStoppingPointsByFreight(idFreight) {
        return db.collection('freight')
        .doc(idFreight)
        .collection('stopping_points')
        .orderBy('stop_order')
        .get()
    },

    async freightInTravel(idShipper){
        return db.collection('freight')
        .where('status.describe', '==', 'Em transito')
        .where("shipper.uid", "==", idShipper)
        .get();
    },

    async freightDelivered(idFreight){
        return db
        .collection('freight')
        .doc(idFreight)
        .collection('stopping_points')
        .where('concluded', '==', true)
        .get()
    },

    async freightAllDeliveredEfeccts(idShipper) {
        try {
          let qtdDelivery = 0;
      
          const freightsSnapshot = await db.collection('freight')
                .where("shipper.uid", "==", idShipper)
                .get();
      
          const deliveriesPromises = freightsSnapshot.docs.map(async (frete) => {
            const stoppingPointsSnapshot = await db
              .collection('freight')
              .doc(frete.id)
              .collection('stopping_points')
              .where('concluded', '==', true)
              .get();
            return stoppingPointsSnapshot.size;
          });
      
          const deliveriesCounts = await Promise.all(deliveriesPromises);
      
          // Somar todas as entregas
          qtdDelivery = deliveriesCounts.reduce((total, count) => total + count, 0);

          console.log(qtdDelivery)
      
          return qtdDelivery;
        } catch (error) {
          console.error("Erro ao buscar entregas:", error);
          throw error; // ou retorne algo padrão, se preferir
        }
      },

    async freightAllDeliveredNeedEfeccts(idShipper) {
        try {
            let qtdDelivery = 0;
        
            const freightsSnapshot = await db.collection('freight')
            .where("shipper.uid", "==", idShipper)
            .get();
        
            const deliveriesPromises = freightsSnapshot.docs.map(async (frete) => {
            const stoppingPointsSnapshot = await db
                .collection('freight')
                .doc(frete.id)
                .collection('stopping_points')
                .where('concluded', '==', false)
                .get();
            return stoppingPointsSnapshot.size;
            });
        
            const deliveriesCounts = await Promise.all(deliveriesPromises);
        
            // Somar todas as entregas
            qtdDelivery = deliveriesCounts.reduce((total, count) => total + count, 0);

            console.log(qtdDelivery)
        
            return qtdDelivery;
        } catch (error) {
            console.error("Erro ao buscar entregas:", error);
            throw error; // ou retorne algo padrão, se preferir
        }
    },

   
      

    async freightAllDelivered(){

        let qtdDelivery = 0;

        db.collection('freight').get().then(async item=> {

            item.docs.forEach(async frete => {

                db.collection('freight').doc(frete.id).collection('stopping_points')
                .get().then(async (result) => {
                    qtdDelivery = qtdDelivery + result.size;
                });

                return qtdDelivery;
            });

        }).catch(error=> {
            console.error(error)
        });

    },

    async freightWithOcurrency(){

    return db
        .collection('freight')
        .doc()
        .collection('stopping_points')
        .get();

    },

    async allFreightsFinished(idShipper){
        return db
        .collection('freight')
        .where("status.describe", "==", "Finalizado")
        .where("shipper.uid", "==", idShipper)
        .get()
    }

}

export default freightService;