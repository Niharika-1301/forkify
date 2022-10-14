import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime  ';

// if (module.hot) {
//   module.hot.accept();
// }

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

// https://forkify-api.herokuapp.com/v2

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0.) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //1.) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2.) Loading recipe // calling the function from model
    await model.loadRecipe(id);

    //3.) Rendering recipe
    recipeView.render(model.state.recipe); // const recipeView = new recipeView(model.state.recipe);
  } catch (err) {
    console.log('Error occured in Controller');
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // console.log(resultsView);

    // 1 get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2 load search results
    await model.loadSearchResults(query);

    //3 Render results
    // console.log(model.state.search.results);
    resultsView.render(model.getSearchResultsPage(1));

    //4 Render initial pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  //3 Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //4 Render new pagination button
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe serving (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1. Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2. Update recipe view
  recipeView.update(model.state.recipe);

  //3. Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // show loading spiner
    addRecipeView.renderSpinner();

    //Upload  the new recipe data
    await model.uploadrecipe(newRecipe);
    console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //Change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toogleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('X_X 🤦‍♀️ X_X', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  // debugger;
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addhandlerUpdateServings(controlServings);
  recipeView.addhandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
