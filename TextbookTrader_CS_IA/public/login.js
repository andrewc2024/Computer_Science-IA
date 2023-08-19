const firebaseConfig = {
    //Add your own personal project config
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.getElementById ("SignUp").addEventListener ("click", signup, false);
document.getElementById ("Login").addEventListener ("click", login, false);

// Handles login once user clicks the button
function login() {
    var email = document.getElementById("email").value + "";
    var password = document.getElementById("password").value + "";

    db.collection("users").get().then((query) => {
        query.forEach((doc) => {
            // Check if there exists a user with the corresponding email and password
            if (doc.data()["email"].includes(email) && doc.data()["pwd"].includes(password)) {
                firebase.auth().signInWithEmailAndPassword(email, password)
                  .then((userCredential) => {
                      // Signed in
                      var user = userCredential.user;

                      // Store user id in localStorage
                      // This is used to verify a user's ID across pages.
                      localStorage.setItem("userID", doc.id);
                      window.location.href = "/public/shoppingPage.html";
                  })
                  .catch((error) => {
                      var errorCode = error.code;
                      var errorMessage = error.message;
                      console.log(errorCode + errorMessage);
                  });
            } else if (doc.data()["email"].includes(email)) {
              // If the email exists but password is incorrect, alert the user
              window.alert("Fields inputted incorrectly!");
            }
        })
    })
}

// Handles sign up
function signup(){
    var email = document.getElementById("email").value + "";
    var password = document.getElementById("password").value + "";
    console.log(email)
    console.log(password)

    // Ensure that the email and password fields are filled suitably
    if (email.length > 0 && password.length > 0) {
        // Validate the email address
        // This implementation can be changed to allow all emails by changing the checked conditions
        if (email.includes("cis.edu.hk") && email.includes("@")) {
            // Create a new user in the database
            firebase.auth().createUserWithEmailAndPassword(email, password)
              .then((userCredential) => {
                  var user = userCredential.user;
                  const userID = user.uid + "";
                  localStorage.setItem("userID", userID); // Store userID so that user info is accessible on another page

                  // Create a user with initially empty fields for listings, liked books, and ratings
                  db.collection("users").doc(userID).set({
                      email: email,
                      pwd: password,
                      listings: [],
                      liked: [],
                      ratings: {}
                  })
                    .then((docRef) => {
                        // console.log("Document written with ID: ", docRef.id);
                        // Redirects the user to obtain more information
                        // like name, phone, occupation
                        window.location.href = "/public/moreInfo.html"
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
                // Do not allow users to create multiple accounts with the same email
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
}

