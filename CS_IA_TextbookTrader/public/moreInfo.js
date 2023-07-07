const firebaseConfig = {
    apiKey: "AIzaSyB-PnEoZ5qbXu85N4W8vUjM19CXUu_qUJ8",
    authDomain: "textbooktrader-f0b58.firebaseapp.com",
    projectId: "textbooktrader-f0b58",
    storageBucket: "textbooktrader-f0b58.appspot.com",
    messagingSenderId: "1092788020904",
    appId: "1:1092788020904:web:aeed51e9dcd4424702449d"
};

// document.getElementById("Logout").addEventListener ("click", logout, false);

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

document.getElementById("addInfo").addEventListener("click", addInfo, false);

function addInfo() {
    let name = document.getElementById("name").value;
    let phoneNumber = document.getElementById("phoneNumber").value;
    let userType = document.getElementById("userType").value;
    const userID = localStorage.getItem("userID");
    if (!(name && phoneNumber)) {
        window.alert("Please fil in the fields!");
        return;
    }else if(phoneNumber >= 100000000){
        window.alert("Please enter a valid HK phone number!");
        return;
    }
    db.collection("users").doc(userID).get().then((u) => {
        db.collection("users").doc(userID).update({
            name: name,
            phoneNumber: phoneNumber,
            userType: userType,
        })
        .then(() => {
            window.location.href = "/public/shoppingPage.html";
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
    });    
}