  const firebaseConfig = {
  //Add your own personal project config
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Link logout button with event handler
document.getElementById("Logout").addEventListener("click", logout, false);

// Global variable storing the user's liked books and listings
var likedBooks = [];
var listings = [];

// Obtain the user's ID to retrieve corresponding information
// from the database.
const userID = localStorage.getItem("userID");

db.collection("users")
  .doc(userID)
  .get()
  .then((user) => {
    if (user.exists) { // If the user exists, obtain data
      var data = user.data();
      console.log("Document data:", data);
      likedBooks = data.liked;
      listings = data.listings;

      // Add each liked book to the page so that it is visible
      for (let i = 0; i < likedBooks.length; i++) {
        // Copy data into a hidden template of the book card we want to show
        let temp = document.querySelectorAll("template")[0];
        db.collection("textbooks")
          .doc(likedBooks[i])
          .get()
          .then((b) => {
            let book = b.data();
            if (book.sold) { // If the book is sold, it is by considered deleted, so don't show it
              return;
            }

            // Copy the template and add corresponding information
            let cl = temp.content.firstElementChild.cloneNode(true);

            cl.querySelector("#subject").innerText = book.subject;
            cl.querySelector("#name").innerText = book.name;
            cl.querySelector("#price").innerText = `\$${book.price}`;

            // Add a button that allows the user to toggle whether they like the book or not
            cl.querySelector("#unlike").addEventListener(
              "click",
              toggleLike,
              false
            );

            // If the user clicks on the book,
            // show a popup window displaying more relevant information about the book
            cl.addEventListener("click", openWindow, false);
            cl.textbookid = book.textbookid;

            // Show the liked icon and hide the empty heart outline icon (that represents a book
            // that hasn't been liked).
            cl
              .querySelector("#unlike")
              .querySelector(".fa-heart.fa-solid").style.display = "block";
            cl
              .querySelector("#unlike")
              .querySelector(".fa-heart.fa-regular").style.display = "none";

            cl.querySelector("#unlike").textbookid = book.textbookid;

            // Update the template to show the corresponding rating of the book
            let g = cl.firstElementChild
              .querySelector(".fa-solid.fa-star")
              .cloneNode(true);
            let black = cl.firstElementChild
              .querySelector(".fa-regular.fa-star")
              .cloneNode(true);

            cl.querySelector(".fa-solid.fa-star").remove();
            cl.querySelector(".fa-regular.fa-star").remove();

            if (book.numRatings > 0) { // Check if the book has been rated before
              // Calculate how many stars should be filled and how many should be outlines
              // This can be modified to make the star rating display more accurate
              // (e.g., make 4.5 stars show four and a half stars instead of four)
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

      // Do the same for all of a user's listings
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

      // Update display with the email and username of the user obtained from the database
      document.getElementById("email").innerText = data.email;
      document.getElementById("username").innerText = data.name;
    } else {
      console.log("No such document!");
    }
  })
  .catch((error) => {
    console.log("Error getting document:", error);
  });

// Logging out is simply removing the userID from local storage
// and redirecting the user to the main page.
function logout() {
  window.location.href = "/public/index.html";
  localStorage.removeItem("userID");
}

// Removes a book from a user's listing
// This action is performed when the user clicks on the trash icon
function remove(event) {
  let id = event.currentTarget.textbookid;
  console.log("ID: ", id);

  db.collection("users")
    .doc(userID)
    .get()
    .then((user) => {
      let listings = user.data().listings;
      let liked = user.data().liked;
      // Toggle sold to true (effectively hides the book in the future)
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

      // Update the information on the database to reflect that the book is sold
      // In the future, an extension can be made to recover deleted textbooks
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

              // Refreshes the page so that the textbook listing is updated.
              location.href = "/public/profile.html";
            });
        });
    });
}

// Event handler for when the user toggles the like button
function toggleLike(event) {
  let id = event.currentTarget.textbookid;

  db.collection("users")
    .doc(userID)
    .get()
    .then((user) => {
      let liked = user.data().liked;
      let isLiked = true;

      // Check if the user previously liked the book
      // If so, remove it from the liked list
      if (liked.includes(id)) {
        liked.splice(liked.indexOf(id), 1);
        isLiked = false;
      }

      // Correspondingly update the icon to match
      // An empty outline is shown when the user unlikes an item
      // and the filled icon is shown when they like an item
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

      // Refresh the page to show the update information
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

// Hides window when closed
function closeWindow() {
  document.getElementById("overlay").style.display = "none";
}

// Displays the popup window
// The textbook's name, description, level, subject, etc. is displayed
function openWindow(event) {
  let id = event.currentTarget.textbookid;

  db.collection("textbooks")
    .doc(id)
    .get()
    .then((t) => {
      // Gather all the textbook's data
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

// Updates a user's rating on a textbook
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
          // If the user hasn't rated a book before or removed their rating,
          // simply increment the rating count and star count by number of stars
          textbook.numRatings += 1;
          textbook.numStars += newRating;
          textbookRatings[id] = newRating;
        } else {
          if (newRating == 0) {
            // If the user chooses to remove their rating
            // Decrement the rating count and subtract star count by previous rating
            textbook.numRatings -= 1;
            textbook.numStars -= textbook.userRating;
            textbookRatings[id] = 0;
          } else {
            // Otherwise, update the star count to match the change
            textbook.numStars += newRating - textbookRatings[textbook.textbookid];
            textbookRatings[id] = newRating;
          }
        }
        // Update the information on the database with the updated fields
        db.collection("textbooks").doc(id).update({numRatings: textbook.numRatings, numStars: textbook.numStars});
        db.collection("users").doc(userID).update({ratings: textbookRatings}).then(()=>{
          // refresh the page so that the display is updated
          location.href = "/public/profile.html";
        });
      });
    });
}
