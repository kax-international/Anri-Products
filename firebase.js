import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzAHkf9LIYgCxx9sV5WvUqaxwmIWnLc8Q",
    authDomain: "athletic-cloud-33538.firebaseapp.com",
    projectId: "athletic-cloud-33538",
    storageBucket: "athletic-cloud-33538.firebasestorage.app",
    messagingSenderId: "1020993809301",
    appId: "1:1020993809301:web:a31e28377788bef965249c"
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
