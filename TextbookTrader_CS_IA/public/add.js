const firebaseConfig = {
  //Add your own personal project config
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
var storageRef = firebase.storage().ref();

const userID = localStorage.getItem("userID");
document.getElementById("post").addEventListener("click", addTextbook, false);

var selectedFile;

document.getElementById("image").addEventListener(
  "change",
  () => {
    selectedFile = document.getElementById("image").files[0];
    console.log(selectedFile);
  },
  false
);

function generateID() {
  return Math.round(Math.random() * 10000000000);
}

function addTextbook() {
  document.getElementById("post").disabled = true;

  if(selectedFile == null){
    window.alert("Please upload an image of your textbook!");
    return;
  }
  var uploadTask = storageRef
    .child(generateID() + "." + selectedFile.type.split("/").pop())
    .put(selectedFile);
  var imageURL;

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED:
          console.log("Upload is paused");
          break;
        case firebase.storage.TaskState.RUNNING:
          console.log("Upload is running");
          break;
      }
    },
    (error) => {
      console.log(error);
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log("File available at", downloadURL);
        imageURL = downloadURL;

        let textbook = {
          name: document.getElementById("name").value,
          description: document.getElementById("description").value,
          price: document.getElementById("price").value,
          yearLevel: document.getElementById("yearLevel").value,
          subject: document.getElementById("subject").value,
          subjectLevel: document.getElementById("subjectLevel").value,
          donate: document.getElementById("donate").ariaChecked,
          sold: false,
          vendor: userID,
          numRatings: 0,
          numStars: 0,
          dateAdded: new Date(),
          image: imageURL,
        };

        db.collection("textbooks")
          .add(textbook)
          .then((d) => {
            db.collection("textbooks").doc(d.id).update({ textbookid: d.id });
            textbook.textbookid = d.id;

            db.collection("users")
              .doc(userID)
              .get()
              .then((u) => {
                let listings = u.data().listings;
                listings.push(textbook.textbookid);

                db.collection("users").doc(userID).update({
                  listings: listings,
                }).then(() => {
                    window.alert("Successfully added!");
                  window.location.href = "/public/shoppingPage.html";
                });
              })
              .catch((error) => {
                console.error("Error: ", error);
              });
          })
          .catch((error) => {
            console.error("Error adding document: ", error);
          });
      });
    }
  );
}
