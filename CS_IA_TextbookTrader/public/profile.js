const firebaseConfig = {
  apiKey: "AIzaSyB-PnEoZ5qbXu85N4W8vUjM19CXUu_qUJ8",
  authDomain: "textbooktrader-f0b58.firebaseapp.com",
  projectId: "textbooktrader-f0b58",
  storageBucket: "textbooktrader-f0b58.appspot.com",
  messagingSenderId: "1092788020904",
  appId: "1:1092788020904:web:aeed51e9dcd4424702449d",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
document.getElementById("Logout").addEventListener("click", logout, false);

var likedBooks = [];
var listings = [];

const userID = localStorage.getItem("userID");

db.collection("users")
  .doc(userID)
  .get()
  .then((user) => {
    if (user.exists) {
      var data = user.data();
      console.log("Document data:", data);
      likedBooks = data.liked;
      listings = data.listings;

      for (let i = 0; i < likedBooks.length; i++) {
        let temp = document.querySelectorAll("template")[0];
        db.collection("textbooks")
          .doc(likedBooks[i])
          .get()
          .then((b) => {
            let book = b.data();
            if (book.sold) {
              return;
            }

            let cl = temp.content.firstElementChild.cloneNode(true);

            cl.querySelector("#subject").innerText = book.subject;
            cl.querySelector("#name").innerText = book.name;
            cl.querySelector("#price").innerText = `\$${book.price}`;
            cl.querySelector("#unlike").addEventListener(
              "click",
              toggleLike,
              false
            );

            cl.addEventListener("click", openWindow, false);
            cl.textbookid = book.textbookid;

            cl
              .querySelector("#unlike")
              .querySelector(".fa-heart.fa-solid").style.display = "block";
            cl
              .querySelector("#unlike")
              .querySelector(".fa-heart.fa-regular").style.display = "none";

            cl.querySelector("#unlike").textbookid = book.textbookid;

            let g = cl.firstElementChild
              .querySelector(".fa-solid.fa-star")
              .cloneNode(true);
            let black = cl.firstElementChild
              .querySelector(".fa-regular.fa-star")
              .cloneNode(true);

            cl.querySelector(".fa-solid.fa-star").remove();
            cl.querySelector(".fa-regular.fa-star").remove();

            if (book.numRatings > 0) {
              let goldStars = Math.round(book.numStars / book.numRatings);
              let blackStars = 5 - goldStars;

              for (let j = 0; j < goldStars; j++) {
                cl.querySelector(".star").appendChild(g.cloneNode(true));
              }

              for (let j = 0; j < blackStars; j++) {
                cl.querySelector(".star").appendChild(black.cloneNode(true));
              }
            }
            document.getElementById("likedBooks").appendChild(cl);
          });
      }

      for (let i = 0; i < listings.length; i++) {
        let temp = document.querySelectorAll("template")[1];
        db.collection("textbooks")
          .doc(listings[i])
          .get()
          .then((b) => {
            let book = b.data();
            console.log(book)
            if (book.sold) {
              return;
            }
            let cl = temp.content.firstElementChild.cloneNode(true);

            cl.querySelector("#subject").innerText = book.subject;
            cl.querySelector("#name").innerText = book.name;
            cl.querySelector("#price").innerText = `\$${book.price}`;
            cl.querySelector("#remove").addEventListener(
              "click",
              remove,
              false
            );
            cl.querySelector("#remove").textbookid = book.textbookid;

            cl.querySelector("#unlike").addEventListener(
              "click",
              toggleLike,
              false
            );

            cl.textbookid = book.textbookid;
            cl.addEventListener("click", openWindow, false);

            cl
              .querySelector("#unlike")
              .querySelector(".fa-heart.fa-solid").style.display =
              likedBooks.includes(book.textbookid) ? "block" : "none";
            cl
              .querySelector("#unlike")
              .querySelector(".fa-heart.fa-regular").style.display =
              likedBooks.includes(book.textbookid) ? "none" : "block";
            cl.querySelector("#unlike").textbookid = book.textbookid;

            let g = cl.firstElementChild
              .querySelector(".fa-solid.fa-star")
              .cloneNode(true);
            let black = cl.firstElementChild
              .querySelector(".fa-regular.fa-star")
              .cloneNode(true);

            cl.querySelector(".fa-solid.fa-star").remove();
            cl.querySelector(".fa-regular.fa-star").remove();

            if (book.numRatings > 0) {
              let goldStars = Math.round(book.numStars / book.numRatings);
              let blackStars = 5 - goldStars;

              for (let j = 0; j < goldStars; j++) {
                cl.querySelector(".star").appendChild(g.cloneNode(true));
              }

              for (let j = 0; j < blackStars; j++) {
                cl.querySelector(".star").appendChild(black.cloneNode(true));
              }
            }
            document.getElementById("listedBooks").appendChild(cl);
          });
      }

      document.getElementById("email").innerText = data.email;
      document.getElementById("username").innerText = data.name;
    } else {
      console.log("No such document!");
    }
  })
  .catch((error) => {
    console.log("Error getting document:", error);
  });

function logout() {
  window.location.href = "/public/index.html";
  localStorage.removeItem("userID");
}

function remove(event) {
  let id = event.currentTarget.textbookid;
  console.log("ID: ", id);

  db.collection("users")
    .doc(userID)
    .get()
    .then((user) => {
      let listings = user.data().listings;
      let liked = user.data().liked;
      for (let i = 0; i < listings.length; i++) {
        if (listings[i] == id) {
          db.collection("textbooks").doc(listings[i]).update({ sold: true });
          break;
        }
      }

      for (let i = 0; i < liked.length; i++) {
        if (liked[i] == id) {
          liked[i].sold = true;
          break;
        }
      }

      db.collection("textbooks")
        .doc(id)
        .update({
          sold: true,
        })
        .then(() => {
          db.collection("users")
            .doc(userID)
            .update({ listings: listings, liked: liked })
            .then(() => {
              window.alert("Deleted!");
              location.href = "/public/profile.html";
            });
        });
    });
}

function toggleLike(event) {
  let id = event.currentTarget.textbookid;

  db.collection("users")
    .doc(userID)
    .get()
    .then((user) => {
      let liked = user.data().liked;
      let isLiked = true;

      if (liked.includes(id)) {
        liked.splice(liked.indexOf(id), 1);
        isLiked = false;
      }

      if (isLiked) {
        event.target.parentNode.querySelector(
          ".fa-heart.fa-solid"
        ).style.display = "block";
        event.target.parentNode.querySelector(
          ".fa-heart.fa-regular"
        ).style.display = "none";
        liked.push(id);
      } else {
        event.target.parentNode.querySelector(
          ".fa-heart.fa-solid"
        ).style.display = "none";
        event.target.parentNode.querySelector(
          ".fa-heart.fa-regular"
        ).style.display = "block";
      }

      db.collection("users")
        .doc(userID)
        .update({ liked: liked })
        .then(() => {
          location.href = "/public/profile.html";
        });
    });
}

document
  .getElementById("closeWindow")
  .addEventListener("click", closeWindow, false);

function closeWindow() {
  document.getElementById("overlay").style.display = "none";
}

function openWindow(event) {
  let id = event.currentTarget.textbookid;

  db.collection("textbooks")
    .doc(id)
    .get()
    .then((t) => {
      let textbook = t.data(),
        name = textbook.name,
        description = textbook.description,
        yearLevel = textbook.yearLevel,
        subject = textbook.subject + " " + textbook.subjectLevel,
        averageRating = textbook.numStars / textbook.numRatings,
        price = textbook.price,
        image = textbook.image;
      let dateAdded = new Date(1970, 0, 1);
      dateAdded.setSeconds(textbook.dateAdded.seconds);
      let vendorEmail, vendorPhone;

      db.collection("users")
        .doc(textbook.vendor)
        .get()
        .then((vendor) => {
          vendor = vendor.data();
          vendorEmail = vendor.email;
          vendorPhone = vendor.phoneNumber;

          document.querySelector("#overlay #name").innerText = name;
          document.querySelector("#overlay #description").innerText = description;
          document.querySelector(
            "#overlay #yearLevel"
          ).innerText = `Year ${yearLevel}`;
          document.querySelector("#overlay #subject").innerText = subject;
          document.querySelector("#overlay #averageRating").innerText =
            textbook.numRatings > 0 ? `Average rating: ${averageRating}` : "";
          document.querySelector("#overlay #price").innerText = `\$${price}`;
          document.querySelector(
            "#overlay #vendor"
          ).innerText = `Owner: ${vendor.name}`;
          document.querySelector("#overlay #vendorEmail").innerText =
            vendorEmail;
          document.querySelector("#overlay #vendorPhone").innerText =
            vendorPhone;
          document.querySelector(
            "#overlay #dateAdded"
          ).innerText = `Listed on ${dateAdded}`;
          document.querySelector("#overlay #image").src = image;

          let cl = document.querySelector("#overlay");

          db.collection("users")
          .doc(userID)
          .get()
          .then((user) => {
              db.collection("textbooks").doc(textbook.textbookid).get().then((textbook) => {
                textbook = textbook.data();
                let textbookRatings = user.data().ratings;
              cl.querySelector("#userRating").selectedIndex = textbookRatings[textbook.textbookid];
              cl.querySelector("#userRating").addEventListener(
                "change",
                userRating,
                false
              );
              cl.querySelector("#userRating").textbookid = textbook.textbookid;
            });
          });

          let g = cl.firstElementChild
            .querySelector(".fa-solid.fa-star")
            .cloneNode(true);
          let black = cl.firstElementChild
            .querySelector(".fa-regular.fa-star")
            .cloneNode(true);

          g.style.display = "inline-block";
          black.style.display = "inline-block";

          let items = document.querySelectorAll("#overlay .itemPopup .fa-star");
          if (items) {
            for (let index = 0; index < items.length; index++) {
              items[index].remove();
            }
          }

          if (textbook.numRatings > 0) {
            let goldStars = Math.round(textbook.numStars / textbook.numRatings);
            let blackStars = 5 - goldStars;

            for (let j = 0; j < goldStars; j++) {
              cl.querySelector(".star").appendChild(g.cloneNode(true));
            }

            for (let j = 0; j < blackStars; j++) {
              cl.querySelector(".star").appendChild(black.cloneNode(true));
            }
          }

          let hiddenG = g.cloneNode(true);
          let hiddenB = black.cloneNode(true);
          hiddenG.style.display = "none";
          hiddenB.style.display = "none";

          cl.querySelector(".star").appendChild(hiddenG);
          cl.querySelector(".star").appendChild(hiddenB);

          document.getElementById("overlay").style.display = "block";
        });
    });
}

function userRating(event) {
  let id = event.currentTarget.textbookid;
  db.collection("users")
    .doc(userID)
    .get()
    .then((user) => {
        db.collection("textbooks").doc(id).get().then((textbook) => {
          textbook = textbook.data();
        let textbookRatings = user.data().ratings;
        let rating = textbookRatings[id];
        let newRating = parseInt(document.querySelector("#overlay #userRating").value);

        if (!rating || rating == 0) {
          textbook.numRatings += 1;
          textbook.numStars += newRating;
          textbookRatings[id] = newRating;
        } else {
          if (newRating == 0) {
            textbook.numRatings -= 1;
            textbook.numStars -= textbook.userRating;
            textbookRatings[id] = 0;
          } else {
            textbook.numStars += newRating - textbookRatings[textbook.textbookid];
            textbookRatings[id] = newRating;
          }
        }
        db.collection("textbooks").doc(id).update({numRatings: textbook.numRatings, numStars: textbook.numStars});
        db.collection("users").doc(userID).update({ratings: textbookRatings}).then(()=>{
          location.href = "/public/profile.html";
        });
      });
    });
}
