import axios from 'axios';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const input = form.elements[0];
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: '150',
  captionClass:	'caption',
});

form.addEventListener('submit', onFormSubmit);
loadMoreBtn.addEventListener('click', onloadMoreBtnClick);

// On-event functions
async function onFormSubmit(event) {
  event.preventDefault();
  hideBtn();
  let searchQuery = event.target[0].value.trim();
  if (searchQuery === '') {
    Notify.info('Please, enter a query to search');
    return clearGallery();
  }
  try {
    const data = await searchImg(page);
    const pictures = data.hits;
    const totalHits = data.totalHits;
    const pagesAmount = Math.ceil(totalHits / 40);
    console.log(page, 'before notification');
    if (pictures.length === 0) {
      onError();
    } else {
      if (page === 1) {
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }
      if (pagesAmount > 1) {
        makeBtnVisible();
      }
      const galleryMarkup = createMarkup(pictures);
      gallery.innerHTML = galleryMarkup;
      page += 1;
      lightbox.refresh();
      smoothScroll();
    }
  } catch (error) {
    return onError(error);
  }
}

async function onloadMoreBtnClick() {
  try {
    const data = await searchImg(page);
    const pictures = data.hits;
    const pagesAmount = Math.ceil(data.totalHits / 40);
    if (page === pagesAmount) {
      hideBtn();
      return Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
    const galleryMarkup = createMarkup(pictures);
    gallery.insertAdjacentHTML('beforeend', galleryMarkup);
    lightbox.refresh();
    page += 1;
  } catch (error) {
    return onError(error);
  }
}

// Basic functions
async function searchImg(page) {
  searchQuery = input.value.trim();
  const params = {
    key: '33623115-47a36c1983cc36082c4bb974d',
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page: page,
  };
  const searchParams = new URLSearchParams(params);
  const response = await axios.get(
    `https://pixabay.com/api/?${searchParams.toString()}`
  );
  // const data = await response.data;
  return response.data;
}

function createMarkup(pictures) {
  return pictures
    .map(picture => {
      return `<div class="photo-card"><div class="photo-card__thumb"><a class="photo-card__link" href=${picture.largeImageURL}><img src=${picture.webformatURL} alt="${picture.tags}" loading="lazy" /></a></div><div class="info"><p class="info-item"><b>Likes</b> ${picture.likes}</p><p class="info-item"><b>Views</b> ${picture.views}</p><p class="info-item"><b>Comments</b> ${picture.comments}</p><p class="info-item"><b>Downloads</b> ${picture.downloads}</p></div></div>`;
    })
    .join('');
}

function onError(error) {
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
  // console.log(error);
  page = 1;
  hideBtn();
  return clearGallery;
}

// Auxiliary functions
function clearGallery() {
  gallery.innerHTML = '';
}

function makeBtnVisible() {
  loadMoreBtn.classList.remove('is-hidden');
}

function hideBtn() {
  if (!loadMoreBtn.classList.contains('is-hidden')) {
    loadMoreBtn.classList.add('is-hidden');
    // loadMoreBtn.removeEventListener('click', onloadMoreBtnClick());
  }
}


//For scroll
// function smoothScroll () {
//   console.log(gallery.firstElementChild);
// const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();

// window.scrollBy({
//   top: cardHeight * 2,
//   behavior: "smooth",
// });
// }