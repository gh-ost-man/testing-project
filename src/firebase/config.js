import firebase from "firebase/compat"
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'


const firebaseConfig = {
  apiKey: "AIzaSyASXxELGdMT90rkmqwihp0qSuy8hg_4t1U",
  authDomain: "test-project-90289.firebaseapp.com",
  projectId: "test-project-90289",
  storageBucket: "test-project-90289.appspot.com",
  messagingSenderId: "529759357698",
  appId: "1:529759357698:web:d8c96dc981d6192c7b901b"
};

firebase.initializeApp(firebaseConfig)

const projectAuth = firebase.auth()

const db = firebase.firestore()

const projectFirestore = firebase.firestore()

const projectStorage = firebase.storage()

const timestamp = firebase.firestore.FieldValue.serverTimestamp

export {
  projectFirestore,
  projectAuth,
  timestamp,
  db,
  projectStorage
}