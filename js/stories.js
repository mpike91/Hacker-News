"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <i class="fas fa-trash-alt hidden"></i>
        <i class="far fa-star hidden"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server (or from passed array), generates their HTML, and puts on page. */
function putStoriesOnPage(stories) {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();
  // If stories was passed, only generate list of passed stories. Else, generate fresh page of stories from server.
  if (stories) {
    for (let story of stories) {
      const $story = generateStoryMarkup(story);
      $allStoriesList.append($story);
    }
  } else {
    for (let story of storyList.stories) {
      const $story = generateStoryMarkup(story);
      $allStoriesList.append($story);
    }
  }
  updateFavoritesUI();
  $(".fa-trash-alt").hide();
  $allStoriesList.show();
}

// Performed when the submit form is submitted:
  // grab submit-input elements
  // pass the values to storyList.addStory method
  // "getAndShowStoriesOnStart" to update list to include the submitted story
async function submitStory (evt) {
  evt.preventDefault();
  const $submitAuthor = $("#submit-author");
  const $submitTitle = $("#submit-title");
  const $submitUrl = $("#submit-url");
  await storyList.addStory(currentUser, {
    author: $submitAuthor.val(),
    title: $submitTitle.val(),
    url: $submitUrl.val()
  });
  storyList = await StoryList.getStories();
  currentUser = await User.loginViaStoredCredentials(currentUser.loginToken, currentUser.username);
  putStoriesOnPage();
  console.log(evt.target);
  $submitForm.trigger("reset");
  $submitAuthor.focus();
}
$submitForm.on("submit", submitStory);

// Performed when trash icon is clicked to delete a user's story:
  // grab parent element id (ie, the li's id or story id)
  // delete the story using the API
  // update the story list
  // update current user
  // remove the li from "my stories" list
async function deleteStories(evt) {
  const id = evt.target.parentElement.getAttribute("id");
  await axios.delete(`${BASE_URL}/stories/${id}`, {params: {token: currentUser.loginToken}});
  storyList = await StoryList.getStories();
  currentUser = await User.loginViaStoredCredentials(currentUser.loginToken, currentUser.username);
  evt.target.parentElement.remove();
}