const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');
const createPostForm = createPostArea.querySelector('form');
const titleInput = createPostForm.querySelector('#title');
const locationInput = createPostForm.querySelector('#location');

const videoPlayer = document.querySelector('#player');
const canvasElement = document.querySelector('#canvas');
const captureButton = document.querySelector('#capture-btn');
const imagePicker = document.querySelector('#image-picker');
const pickImageContainer = document.querySelector('#pick-image');

function initMedia() {
    if ('mediaDevices' in navigator) {
        //
    } else {
        navigator.mediaDevices = {
            getUserMedia: function (constraints) {
                let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                if (getUserMedia) {
                    return new Promise((resolve, reject) => {
                        getUserMedia.call(navigator, constraints, resolve, reject);
                    });
                } else {
                    return new Promise.reject(new Error('getUserMedia is not implemented in the browser'));
                }
            }
        };
    }

    navigator.mediaDevices.getUserMedia({
        video: true
    })
        .then(stream => {
            videoPlayer.srcObject = stream;
            videoPlayer.style.display = 'block';
        })
        .catch(error => {
            pickImageContainer.style.display = 'block';
        })
}

captureButton.addEventListener('click', event => {
   canvasElement.style.display = 'block';
   videoPlayer.style.display = 'none';
   captureButton.style.display = 'none';

   let context = canvasElement.getContext('2d');
   context.drawImage(videoPlayer, 0,0, canvasElement.width,
       videoPlayer.videoHeight / (videoPlayer.videoWidth / canvasElement.width));
   videoPlayer.srcObject.getVideoTracks().forEach(track => {
       track.stop();
   });
});

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  initMedia();

  if (deferredPrompt) {
    // deferredPrompt.prompt();

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
    pickImageContainer.style.display = 'none';
    videoPlayer.style.display = 'none';
    canvasElement.style.display = 'none';
    videoPlayer.srcObject.getVideoTracks().forEach(track => {
        track.stop();
    });
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

function sendNewPostData() {
  fetch('https://us-central1-pwagram-4967b.cloudfunctions.net/storePostData', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
      body: JSON.stringify({
          id: (new Date()).toISOString(),
          title: titleInput.value,
          location: locationInput.value,
          image: "https://firebasestorage.googleapis.com/v0/b/pwagram-4967b.appspot.com/o/sf-boat.jpg?alt=media&token=6c9cfcb1-c906-4b41-8fad-487f7c46fbca"
      })
  })
      .then(response => {
        console.log('Sent data', response);
        updateUI();
      })
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
  } else {
    sendNewPostData();
  }
});