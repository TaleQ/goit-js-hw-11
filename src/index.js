import axios from 'axios';
import { Notify } from 'notiflix';
import throttle from 'lodash.throttle';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const input = form.elements[0];
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page;
let pagesAmount;

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: '150',
  captionClass:	'caption',
});

form.addEventListener('submit', onFormSubmit);

// Loading more images
// Option 1: Using infinite scroll
window.addEventListener('scroll', throttle(checkPosition, 250));
window.addEventListener('resize', throttle(checkPosition, 250));
// Option 2: Using "Load More Btn"
// loadMoreBtn.addEventListener('click', loadMoreImg);

// Slow auto scroll
// window.addEventListener('scroll', smoothScroll);

async function onFormSubmit(event) {
  event.preventDefault();
  // hideBtn();
  page = 1;
  let searchQuery = input.value.trim();
  if (!searchQuery) {
    Notify.info('Please, enter a query to search');
    cleanGallery();
    return
  } 
  try {
    const data = await searchImg(page, searchQuery);
    const pictures = data.hits;
    pagesAmount = Math.ceil(data.totalHits / 40);
    if (pictures.length === 0) {
      nothingFound();
    } else {
      if (page === 1) {
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }
      // if (pagesAmount > 1) {
      //   makeBtnVisible();
      // }
      const galleryMarkup = createMarkup(pictures);
      gallery.innerHTML = galleryMarkup;
      window.scrollTo({ top: 0 });
      lightbox.refresh();
      page += 1;
      smoothScroll();
    }
  } catch (error) {
  console.log(error);
  }
}

async function loadMoreImg() {
  try {
    let searchQuery = input.value.trim();
    if (!searchQuery || !page) {
      return
    }
    // if (page === pagesAmount) {
    //       hideBtn();
    //   }
    if (page > 1 && page > pagesAmount) {
      Notify.info(
        "We're sorry, but you've reached the end of search results.")
    } else {
      showLoader();
      const data = await searchImg(page, searchQuery);
    const pictures = data.hits;
    page += 1;
const galleryMarkup = createMarkup(pictures);
    gallery.insertAdjacentHTML('beforeend', galleryMarkup);
      lightbox.refresh();
      hideLoader();
    smoothScroll();
    }
  } catch (error) {
    console.log(error);
  }
}

async function searchImg(page, searchQuery) {
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
  return response.data;
}

function createMarkup(pictures) {
  return pictures
    .map(picture => {
      return `<div class="photo-card"><a class="photo-card__link" href=${picture.largeImageURL}><img src=${picture.webformatURL} alt="${picture.tags}" loading="lazy" /></a><div class="info"><p class="info-item"><b>Likes</b> ${picture.likes}</p><p class="info-item"><b>Views</b> ${picture.views}</p><p class="info-item"><b>Comments</b> ${picture.comments}</p><p class="info-item"><b>Downloads</b> ${picture.downloads}</p></div></div>`;
    })
    .join('');
}

function cleanGallery() {
  gallery.innerHTML = '';
}

function nothingFound() {
  cleanGallery();
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
  page = 1;
  // hideBtn();
}

// Functions for "Load More Btn"
function makeBtnVisible() {
  loadMoreBtn.classList.remove('is-hidden');
}

function hideBtn() {
  if (!loadMoreBtn.classList.contains('is-hidden')) {
    loadMoreBtn.classList.add('is-hidden');
  }
}

// Functions for loader
function showLoader() {
  document.querySelector(".backdrop").classList.remove("is-hidden");
  document.querySelector(".loader").classList.remove("is-hidden");
}

function hideLoader() {
  document.querySelector(".backdrop").classList.add("is-hidden");
  document.querySelector(".loader").classList.add("is-hidden");
}

//Functions for scroll
function smoothScroll() {
  if (gallery.children.length) {
const { height: cardHeight } = gallery
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
  }
}

async function checkPosition() {
  const height = document.body.offsetHeight;
  const screenHeight = window.innerHeight;
  const scrolled = window.scrollY;
  const threshold = height - screenHeight / 4;
  const position = scrolled + screenHeight;
  if (position >= threshold) {
    await loadMoreImg();
  }
}