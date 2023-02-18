import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { searchImg} from './js/searchImg';

const form = document.querySelector('#search-form');
const input = form.elements[0];
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 0;

const lightbox = new SimpleLightbox('.gallery', {
  captionsData: "alt",
  captionPosition: "bottom",
  captionDelay: "250",
})

form.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  event.preventDefault();
  let searchQuery = event.target[0].value.trim();
  page += 1;
  if (!loadMoreBtn.classList.contains('is-hidden')) {
    loadMoreBtn.classList.add('is-hidden');
  }
  if (searchQuery === '') {
    clearGallery();
    Notify.info('Please, enter a query to search');
  } else {
    searchImg(searchQuery, page)
      .then(galleryMarkup => {
        gallery.innerHTML = galleryMarkup;
        lightbox.refresh();
      })
      .catch(error => {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        console.log(error);
      });
  }
}

function onloadMoreBtnClick() {
  let searchQuery = input.value.trim();
  page += 1;
  if (searchQuery !== '') {
    searchImg(searchQuery, page)
      .then(galleryMarkup => {
        gallery.insertAdjacentHTML('beforeend', galleryMarkup);
        lightbox.refresh();
      })
      .catch(error => {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        console.log(error);
      });
  }
}

export function clearGallery () {
gallery.innerHTML = '';
}

export function makeBtnVisible () {
loadMoreBtn.classList.remove('is-hidden');
      loadMoreBtn.addEventListener('click', onloadMoreBtnClick);
}