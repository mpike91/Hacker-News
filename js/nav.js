"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */
function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */
function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}
$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

// Show/hide submit-story form when click "submit"
function clickSubmit(evt) {
  console.debug("clickSubmit", evt);
  if (currentUser) $submitForm.slideToggle(750);
}
$submitLink.on("click", clickSubmit);

// Show list of favorites
function clickFavorites(evt) {
  console.debug("clickFavorites", evt);
  if (currentUser) {
    const favs = [...currentUser.favorites].reverse();
    if (!$submitForm.is("hidden")) $submitForm.slideUp(750);
    putStoriesOnPage(favs);
  }
}
$favoritesLink.on("click", clickFavorites);

// Show list of my stories
function clickMyStories(evt) {
  console.debug("clickMyStories", evt);
  if (currentUser) {
    const myStories = [...currentUser.ownStories].reverse();
    if (!$submitForm.is("hidden")) $submitForm.slideUp(750);
    putStoriesOnPage(myStories)
    $(".fa-trash-alt").show();
    $(".fa-trash-alt").on("click", deleteStories);
  }
}
$myStoriesLink.on("click", clickMyStories);