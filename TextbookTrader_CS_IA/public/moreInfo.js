const firebaseConfig = {
    //Add your own personal project config
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
    if (!(name && phoneNumber)) { // Ensure fields are not empty
        window.alert("Please fill in the fields!");
        return;
    }else if(phoneNumber >= 10000000){ // Validate phone number is 8-digits (can be modified for different countries)
        window.alert("Please enter a valid HK phone number!");
        return;
    }
    // Update the user's account with corresponding information
    // And redirect to shopping page.
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