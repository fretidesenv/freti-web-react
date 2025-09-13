import axios from "axios";


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

    } 

} 

export default notification;

