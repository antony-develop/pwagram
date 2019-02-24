var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var createPostForm = createPostArea.querySelector('form');
var titleInput = createPostForm.querySelector('#title');
var locationInput = createPostForm.querySelector('#location');

function openCreatePostModal() {
  createPostArea.style.display = 'block';

  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiseResult) => {
      console.log(choiseResult.outcome);

      if (choiseResult.outcome === 'dissmissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User add to home screen');
      }
    });

    deferredPrompt = null;
  }

}

function unregisterServiceWorkers() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
        .then(registrations => {
          for (let registration of registrations) {
            registration.unregister();
          }
        });
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function onSaveButtonClicked(event) {
  console.log('clicked');
  if ('caches' in window) {
    caches.open('user_requested')
        .then(cache => {
          cache.add('https://httpbin.org/get');
          cache.add('/src/images/sf-boat.jpg');
        });
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url("${data.image}")`;
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function updateUI(data) {
  clearCards();
  for (let item of data) {
    createCard(item);
  }
}

const dynamicContentUrl = 'https://pwagram-4967b.firebaseio.com/posts.json';
let networkDataReceived = false;

fetch(dynamicContentUrl)
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      networkDataReceived = true;
      console.log('From web', data);
      updateUI(Object.values(data));
    });

if ('indexedDB' in window) {
  readAllData('posts')
      .then(data => {
        if (!networkDataReceived) {
          console.log('From cache', data);
          updateUI(data);
        }
      });

  // caches.match(dynamicContentUrl)
  //     .then(response => {
  //       if (response) {
  //         return response.json();
  //       }
  //     })
  //     .then(data => {
  //       console.log('From cache', data);
  //       if (!networkDataReceived && data) {
  //         updateUI(Object.values(data));
  //       }
  //     });
}

createPostForm.addEventListener('submit', event => {
  event.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid form data')
    return;
  }

  closeCreatePostModal();
  
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
        .then(serviceWorker => {
          let post = {
              id: (new Date).toISOString(),
              title: titleInput.value,
              location: locationInput.value
          };

          writeData('sync-posts', post)
              .then(() => {
                  return serviceWorker.sync.register('sync-new-post');
              })
              .then(() => {
                let snackbarContainer = document.querySelector('#confirmation-toast');
                snackbarContainer.MaterialSnackbar.showSnackbar({
                    message: 'Your post was saved for syncing'
                });
              })
              .catch(error => {
                console.log(error);
              });
        });
  }

});