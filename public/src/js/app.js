let deferredPrompt;
const enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (window.Promise) {
    window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
            console.log('Service worker is registered');
        });
}

window.addEventListener('beforeinstallprompt', (event) => {
    console.log('beforeinstallprompt fired');
    event.preventDefault();
    deferredPrompt = event;

    return false;
});

function askNotificationPermission() {
    Notification.requestPermission(result => {
        console.log('User choice', result);
        if (result != 'granted') {
            console.log('No permission granted =(');
        } else {
            // displayConfirmNotification();
            configurePushSubscription();
        }
    });
}

function configurePushSubscription() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then(serviceWorker => {
                serviceWorker.pushManager.getSubscription()
                    .then(subscription => {
                        if (subscription) {
                            //
                        } else {
                            const vapidPublicKey = urlBase64ToUint8Array('BFRZdvB8qJ9iTsWcyQ6JZmRQpqCkSUGIzV3nc7SKyNy-T4Auna9PlicxHBHJZk7YFxEEeQdMy7_4wy6Z9V7wWPs');
                            return serviceWorker.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: vapidPublicKey
                            });
                        }
                    })
                    .then(subscription => {
                        return fetch('https://pwagram-4967b.firebaseio.com/subscriptions.json', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify(subscription)
                        });
                    })
                    .then(response => {
                        if (response.ok) {
                            displayConfirmNotification();
                        }
                    });
            })
            .catch(error => {
                console.log('Error:', error);
            });
    }
}

function displayConfirmNotification() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then(serviceWorker => {
                serviceWorker.showNotification('PWAGram', {
                    body: 'You are successfully subscribed for push notifications',
                    icon: '/src/images/icons/app-icon-96x96.png',
                    image: '/src/images/sf-boat.jpg',
                    dir: 'ltr',
                    lang: 'en-US',
                    vibrate: [100, 50, 500],
                    badge: '/src/images/icons/app-icon-96x96.png',
                    tag: 'confirm-notification',
                    renotify: false,
                    actions: [
                        {
                            action: 'confirm',
                            title: 'Ok',
                            icon: '/src/images/icons/app-icon-96x96.png'
                        },
                        {
                            action: 'cancel',
                            title: 'Cancel',
                            icon: '/src/images/icons/app-icon-96x96.png'
                        }
                    ]
                });
            });
    }
}

if ('Notification' in window) {
    console.log('Notifications in window');
    enableNotificationsButtons.forEach(elem => {
        elem.style.display = 'inline-block';
        elem.addEventListener('click', askNotificationPermission);
    });
}