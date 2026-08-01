import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyB0N63P4yxJANQMsp5XKr76VxF3vB7I4NE",
  authDomain: "ravenweb-bc6a6.firebaseapp.com",
  projectId: "ravenweb-bc6a6",
  storageBucket: "ravenweb-bc6a6.firebasestorage.app",
  messagingSenderId: "317720628714",
  appId: "1:317720628714:web:6bfdf70a4604d6fc307693"
};


const app = initializeApp(firebaseConfig);


const db = getFirestore(app);


async function testFirebase(){

    try{

        const docRef = await addDoc(
            collection(db,"test"),
            {
                name:"HorseBet",
                time:new Date()
            }
        );

        console.log("บันทึกสำเร็จ :",docRef.id);

    }
    catch(err){

        console.error(err);

    }

}


export {
    db,
    testFirebase,
    collection,
    addDoc,
    getDocs
};