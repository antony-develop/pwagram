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
            displayConfirmNotification();
        }
    });
}

function displayConfirmNotification() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then(serviceWorker => {
                serviceWorker.showNotification('PWAGram (from SW)', {
                    body: 'You are successfully subscribed for push notifications'
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