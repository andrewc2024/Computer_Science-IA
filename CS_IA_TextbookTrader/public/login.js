const firebaseConfig = {
    apiKey: "AIzaSyB-PnEoZ5qbXu85N4W8vUjM19CXUu_qUJ8",
    authDomain: "textbooktrader-f0b58.firebaseapp.com",
    projectId: "textbooktrader-f0b58",
    storageBucket: "textbooktrader-f0b58.appspot.com",
    messagingSenderId: "1092788020904",
    appId: "1:1092788020904:web:aeed51e9dcd4424702449d"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.getElementById ("SignUp").addEventListener ("click", signup, false);
document.getElementById ("Login").addEventListener ("click", login, false);
function login() {
    var email = document.getElementById("email").value + "";
    var password = document.getElementById("password").value +"";
    db.collection("users").get().then((query) => {
        query.forEach((doc) => {
            if (doc.data()["email"].includes(email)&&doc.data()["pwd"].includes(password)) {
                firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                  // Signed in
                  var user = userCredential.user;
                  localStorage.setItem("userID", doc.id);
                  window.location.href="/public/shoppingPage.html";
                  // ...
                })
                .catch((error) => {
                  var errorCode = error.code;
                  var errorMessage = error.message;
                  console.log(errorCode+errorMessage);

                });
            } else if (doc.data()["email"].includes(email)) {
                window.alert("Fields inputted incorrectly!");
            }
        })
    })
}

function signup(){
    var email = document.getElementById("email").value + "";
    var password = document.getElementById("password").value + "";
    console.log(email)
    console.log(password)
    
    if(email.length > 0 && password.length > 0){
        if(email.includes("cis.edu.hk") && email.includes("@")){
            firebase.auth().createUserWithEmailAndPassword(email, password)
             .then((userCredential) => {
                var user = userCredential.user;
                const userID = user.uid + "";
                localStorage.setItem("userID", userID);
                db.collection("users").doc(userID).set({
                    email: email,
                    pwd: password,
                    listings: [],
                    liked: [],
                    ratings: {}
                })
                    .then((docRef) => {
                        // console.log("Document written with ID: ", docRef.id);
                        window.location.href="/public/moreInfo.html"
                    })
                    .catch((error) => {
                        console.error("Error adding document: ", error);
                    });
            }).catch((error) => {
                console.log(error)
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage);
                console.log(errorCode);
                if(errorCode.includes("auth/email-already-in-use")){
                    window.alert("Email already in use!");
                }
            });
        } else {
            window.alert("Please use a CIS email account");
        }
    } else {
        window.alert("Please fill in required fields");
    }
    // const provider = new firebase.auth.GoogleAuthProvider
}

