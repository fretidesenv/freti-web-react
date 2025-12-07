import axios from "axios";
import firebase from '../../src/config/firebase';
import driverService from "./driver.service";
require('firebase/auth')

const notification = {
    
    // Função para formatar data para o formato brasileiro (DD/MM/YYYY)
    formatDateToBrazilian(date) {
      if (!date) return "";
      
      try {
        let dateObj;
        
        // Se for string no formato YYYY-MM-DD
        if (typeof date === 'string' && date.includes('-')) {
          const [year, month, day] = date.split('-');
          return `${day}/${month}/${year}`;
        }
        
        // Se for um objeto Date
        if (date instanceof Date) {
          dateObj = date;
        } else if (typeof date === 'string') {
          dateObj = new Date(date);
        } else if (date && date.seconds) {
          // Se for um timestamp do Firebase
          dateObj = new Date(date.seconds * 1000);
        } else {
          dateObj = new Date(date);
        }
        
        if (isNaN(dateObj.getTime())) {
          return "";
        }
        
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        
        return `${day}/${month}/${year}`;
      } catch (error) {
        console.error("Erro ao formatar data:", error);
        return "";
      }
    },

    // Função para formatar data e hora para o formato brasileiro
    formatDateTimeToBrazilian(date) {
      if (!date) {
        date = new Date();
      }
      
      try {
        const dateObj = date instanceof Date ? date : new Date(date);
        
        if (isNaN(dateObj.getTime())) {
          return "";
        }
        
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
      } catch (error) {
        console.error("Erro ao formatar data/hora:", error);
        return "";
      }
    },
    
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

    async sendNotificationToAll(numerFreight, groupId, dateColeta) {
      console.log("Enviando notificação para todos os motoristas do grupo : " + groupId)
      //Listar todos os motoristas que são do grupo 
      const drivers = await firebase.firestore()
        .collection('drivers_users')
        .where('groupId', '==', groupId)
        .get();

      // Formatar datas uma vez antes do loop
      const dateColetaFormatted = this.formatDateToBrazilian(dateColeta);
      debugger;
      const currentDateTimeFormatted = this.formatDateTimeToBrazilian(new Date());

      drivers.docs.forEach(driver => {

      var title = " FRETI - Chegou uma oportunidade de frete para você " + driver.data().name + ", confira o frete: " + numerFreight;
      var message = "O Frete " + numerFreight + " com data para coleta em " + dateColetaFormatted + " está dando sopa, confira na aba fretes disponíveis e poderá entrar na fila para adquirir, mas corre!"
        + " Data: " + currentDateTimeFormatted


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

