"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */
async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
  putStoriesOnPage();
  $loginForm.hide();
  $signupForm.hide();
}
$loginForm.on("submit", login);

/** Handle signup form submission. */
async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
  putStoriesOnPage();
  $loginForm.hide();
  $signupForm.hide();
  $signupForm.trigger("reset");
}
$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */
function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}
$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */
async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */
function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */
function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  $allStoriesList.show();
  updateNavOnLogin();
}

// This function is called when updateUIOnUserLogin is performed - ie, when a user logs in or the startup code logs the user in automatically using local storage.
// Thus, if a user is logged in, this function:
  // grabs all "stars" in the ol
  // creates array "favsArr" of all the user's favorites
  // loops through all stars (ie, stories on page) and sets the star to "solid" if the story is in user favorites
  // adds event listener to stars with callback function "clickStars"
  //  toggles stars "hidden" class to make them show
function updateFavoritesUI() {
  if (currentUser) {
    const $stars = $(".fa-star");
    const favsArr = currentUser.favorites.map(story => story.storyId);
    for (let star of $stars) {
      const id = star.parentElement.getAttribute("id");
      if (favsArr.includes(id)) star.classList.toggle("fas");
    }
    $stars.on("click", clickStars);
    $stars.toggleClass("hidden");
  }
}


// Performed when a star is clicked on, then:
  // grabs the LI id (the story id)
  // toggles the star "fas" solid class (changes to solid star or to hollow star)
  // if the star is changed to a solid star (favorite), add to favorites with post method
  // if the star is changed to an empty star (unfavorite), delete from favorites with delete method
  // update currentUser
async function clickStars(evt) {
  const target = evt.target;
  const clickedID = target.parentElement.getAttribute("id");
  target.classList.toggle("fas");
  if (target.className.includes("fas")) {
    await axios.post(`${BASE_URL}/users/${currentUser.username}/favorites/${clickedID}`, {token: currentUser.loginToken});
  } else {
    await axios.delete(`${BASE_URL}/users/${currentUser.username}/favorites/${clickedID}`, {params: {token: currentUser.loginToken}});
  }
  currentUser = await User.loginViaStoredCredentials(currentUser.loginToken, currentUser.username);
}