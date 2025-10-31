import axios from "axios";
import firebase from '../../src/config/firebase';
import driverService from "./driver.service";
require('firebase/auth')

const notification = {
    
    async sendNotification(userIdNotification, message) {
  
      console.log("Enviando notificação para o motorista : " + userIdNotification)
      console.log(message)

      axios.post(
        "https://m80mhwbs12.execute-api.us-east-1.amazonaws.com/production/notificationapp",
        {
          userId: userIdNotification,
          message: message
        }
      )
      .then((response) => console.log(response.data))
      .catch((err) => {
        console.error("ops! não conseguimos comunicação com o push notification: " + err);
      });

    }, 

    async sendNotificationToAll(numerFreight, groupId) {
      console.log("Enviando notificação para todos os motoristas do grupo : " + groupId)
      //Listar todos os motoristas que são do grupo 
      const drivers = await firebase.firestore()
        .collection('drivers_users')
        .where('groupId', '==', groupId)
        .get();

      drivers.docs.forEach(driver => {

      var title = " FRETI - Chegou uma oportunidade de frete para você " + driver.data().name + ", confira o frete: " + numerFreight;
      var message = "O Frete " + numerFreight + " está dando sopa, confira na aba fretes disponíveis e poderá entrar na fila para adquirir, mas corre!"
        + "Data: "  + new Date().toLocaleString()


        console.log("Enviando notificação para o motorista : " + driver.data().idNotification)
        console.log(numerFreight)
  
        axios.post(
          "https://m80mhwbs12.execute-api.us-east-1.amazonaws.com/production/notificationapp",
          {
            userId: driver.data().idNotification,
            message: title
          }
        )
        .then(response => {
          console.log("mensagem enviada com sucesso");
          console.log(response.data);

          driverService.saveMessageInMyFreight(
            driver.data().uid, 
             title, 
             message
          );

          console.log(response.data);
        })
        .catch((err) => {
          console.error("ops! não conseguimos comunicação com o push notification: " + err);
        });

      });

    } 

} 

export default notification;

