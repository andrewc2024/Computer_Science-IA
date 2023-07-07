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