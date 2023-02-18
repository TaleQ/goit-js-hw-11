import axios from 'axios';
import { Notify } from 'notiflix';
import { clearGallery, makeBtnVisible } from '../index.js';

export async function searchImg(searchQuery, page) {
  const params = {
    key: '33623115-47a36c1983cc36082c4bb974d',
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
  };
  const searchParams = new URLSearchParams(params);

  const response = await axios.get(
    `https://pixabay.com/api/?${searchParams.toString()}&page=${page}`
  );
  const pictures = await response.data.hits;
  const totalHits = await response.data.totalHits;
  const pagesAmount = Math.ceil(
    totalHits / params.per_page
);
  if (pictures.length === 0) {
    clearGallery();
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  // } else if (page > 1 && page > pagesAmount) {
  //   console.log(page);
  //   console.log(totalHits);
  //   console.log(pagesAmount);
  //   Notify.info("We're sorry, but you've reached the end of search results.");
  } else {
    if (page === 1) {
      Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
    } 
    if (pagesAmount > 1) {
      makeBtnVisible()
    }
    return createMarkup(pictures);
  }
}

function createMarkup(pictures) {
  let galleryMarkup = pictures
    .map(picture => {
      return `<div class="photo-card"><a href=${picture.webformatURL}><img src=${picture.largeImageURL} alt="${picture.tags}" loading="lazy" /></a><div class="info"><p class="info-item"><b>Likes</b> ${picture.likes}</p><p class="info-item"><b>Views</b> ${picture.views}</p><p class="info-item"><b>Comments</b> ${picture.comments}</p><p class="info-item"><b>Downloads</b> ${picture.downloads}</p></div></div>`;
    })
    .join('');
  return galleryMarkup;
}