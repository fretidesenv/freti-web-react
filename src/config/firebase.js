import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyC2H0gwG8qBBihzpXh6pWN5aHGVKYDRsCs",
    authDomain: "app-freti.firebaseapp.com",
    projectId: "app-freti",
    storageBucket: "app-freti.firebasestorage.app",
    messagingSenderId: "82127319035",
    appId: "1:82127319035:web:ce1f0becc15b786a78e55e",
    measurementId: "G-G1M56ST7HX"
};
// const firebaseConfig = {
//   apiKey: "AIzaSyBjxzvK6c5BkMo2VQQMEombew60_wDNDGo",
//   authDomain: "app-fortio.firebaseapp.com",
//   projectId: "app-fortio",
//   storageBucket: "app-fortio.appspot.com",
//   messagingSenderId: "631554619185",
//   appId: "1:631554619185:web:8644ff80d3e8752325a210",
//   measurementId: "G-ZFEFDCHQ4T"
// };
// const firebaseConfig = {
//   apiKey: "AIzaSyBPBIqCA0IA3s1WTCjdqh8izvQmTeeTWD8",
//   authDomain: "fortio-homol.firebaseapp.com",
//   projectId: "fortio-homol",
//   storageBucket: "fortio-homol.firebasestorage.app",
//   messagingSenderId: "323958413561",
//   appId: "1:323958413561:web:7e3b1bb9293fd973eb6a28",
//   measurementId: "G-EL7XXNHJVP"
// };

// export const firebase = initializeApp(firebaseConfig);
export default firebase.initializeApp(firebaseConfig);
export const storage = getStorage(firebase.initializeApp(firebaseConfig));


// export default firebase.initializeApp(firebaseConfig);
