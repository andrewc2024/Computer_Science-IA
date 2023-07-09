const firebaseConfig = {
  //Add your own personal project config
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const userID = localStorage.getItem("userID");

document
  .getElementById("searchConfirm")
  .addEventListener("click", search, false);

function search() {
  let items = document.querySelectorAll("#resultsGrid .item");
  if (items) {
    console.log(items);
    for (let index = 0; index < items.length; index++) {
      items[index].remove();
    }
  }
  const otherParameter = document.querySelector(
    "#filters #otherParameter"
  ).value;
  const subject = document.querySelector("#filters #subject").value;
  const subjectLevel = document.querySelector("#filters #subjectLevel").value;
  const yearLevel = document.querySelector("#filters #yearLevel").value;
  const ascendingOrDescending = document.querySelector("#filters #order").value;
  var keywords = "";
  if (!(document.getElementById("keywords").value == null)) {
    keywords = document.getElementById("keywords").value;
  }

  console.log(otherParameter, subject, subjectLevel, yearLevel, keywords);
  // logic should be sort by subject --> subject level --> year level --> price --> rating
  var finalResult = [];
  let textbooks = [];
  db.collection("textbooks")
    .get()
    .then((t) => {
      t.forEach((key) => {
        if (!key.data().sold) textbooks.push(key.data());
      });
      console.log(textbooks);
      if (textbooks.exists) {
        console.log("Document data:", textbooks.data());
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }

      console.log("working");
      for (let i = 0; i < textbooks.length; i++) {
        if (
          (textbooks[i].subject == subject || subject == "-") &&
          (textbooks[i].subjectLevel == subjectLevel || subjectLevel == "-") &&
          (textbooks[i].yearLevel == yearLevel || yearLevel == "-")
        ) {
          finalResult.push(textbooks[i]);
        }
      }
      if (otherParameter != "-") {
        switch(otherParameter) {
          case "Sort by Rating":
            if (ascendingOrDescending == "Ascending") {
              finalResult.sort((b, a) => {
                return (
                  parseFloat(b.numStars) / parseFloat(Math.max(1, b.numRatings)) -
                  parseFloat(a.numStars) / parseFloat(Math.max(1, a.numRatings))
                );
              });
            } else {
              finalResult.sort((a, b) => {
                return (
                  parseFloat(b.numStars) / parseFloat(Math.max(1, b.numRatings)) -
                  parseFloat(a.numStars) / parseFloat(Math.max(1, a.numRatings))
                );
              });
            }
            break;
          case "Sort by Price":
            if (ascendingOrDescending == "Ascending") {
              finalResult.sort((b, a) => {
                return b.price - a.price;
              });
            } else {
              finalResult.sort((a, b) => {
                return b.price - a.price;
              });
            }
            break;
          case "Sort by Date":
            if (ascendingOrDescending == "Ascending") {
              finalResult.sort((b, a) => {
                return b.dateAdded.seconds - a.dateAdded.seconds;
              });
            } else {
              finalResult.sort((a, b) => {
                return b.dateAdded.seconds - a.dateAdded.seconds;
              });
            }
            break;
          default:
            console.log(`Error: otherparameter equal to '${otherParameter}'`);
            break;
        }
      }
      for (let i = finalResult.length - 1; i >= 0; i--) {
        if (
          !finalResult[i].name.toUpperCase().includes(keywords.toUpperCase())
        ) {
          finalResult.splice(i, 1);
        }
      }
      if (finalResult == null) {
        console.log("no results");
      }
      console.log(finalResult);

      let temp = document.getElementById("productTemplate");
      let likedBooks = [];

      db.collection("users")
        .doc(userID)
        .get()
        .then((u) => {
          likedBooks = u.data().liked;

          for (let i = 0; i < finalResult.length; i++) {
            let book = finalResult[i];
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
            document.getElementById("resultsGrid").appendChild(cl);
          }
        });
    })
    .catch((error) => {
      console.log("Error getting document:", error);
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

      db.collection("users").doc(userID).update({ liked: liked });
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
          document.querySelector("#overlay #description").innerText =
            description;
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
              db.collection("textbooks")
                .doc(textbook.textbookid)
                .get()
                .then((textbook) => {
                  textbook = textbook.data();
                  let textbookRatings = user.data().ratings;
                  cl.querySelector("#userRating").selectedIndex =
                    textbookRatings[textbook.textbookid];
                  cl.querySelector("#userRating").addEventListener(
                    "change",
                    userRating,
                    false
                  );
                  cl.querySelector("#userRating").textbookid =
                    textbook.textbookid;
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
      db.collection("textbooks")
        .doc(id)
        .get()
        .then((textbook) => {
          textbook = textbook.data();
          let textbookRatings = user.data().ratings;
          let rating = textbookRatings[id];
          let newRating = parseInt(
            document.querySelector("#overlay #userRating").value
          );

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
              textbook.numStars +=
                newRating - textbookRatings[textbook.textbookid];
              textbookRatings[id] = newRating;
            }
          }
          db.collection("textbooks")
            .doc(id)
            .update({
              numRatings: textbook.numRatings,
              numStars: textbook.numStars,
            });
          db.collection("users")
            .doc(userID)
            .update({ ratings: textbookRatings })
            .then(() => {
              location.href = "/public/search.html";
            });
        });
    });
}
