const functions = require('firebase-functions');
const admin = require("firebase-admin");
const cors = require('cors')({
    origin: true
});
const webPush = require('web-push');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const serviceAccount = require("./firebase-adminsdk-key.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pwagram-4967b.firebaseio.com"
});

exports.storePostData = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        const post = request.body;
        admin.database().ref('posts').push({
            id: post.id,
            title: post.title,
            location: post.location,
            image:  post.image
        })
            .then(() => {
                const webPushData = require('./web-push-data.json');
                webPush.setVapidDetails(
                    webPushData.email,
                    webPushData.publicKey,
                    webPushData.privateKey
                );

                return admin.database().ref('subscriptions').once('value');
            })
            .then(subscriptions => {
                subscriptions.forEach(subscription => {
                    const pushConfig = {
                        endpoint: subscription.val().endpoint,
                        keys: {
                            auth: subscription.val().keys.auth,
                            p256dh: subscription.val().keys.p256dh,
                        }
                    };

                    webPush.sendNotification(pushConfig, JSON.stringify({
                        title: 'New Post',
                        content: 'New post have been added. Check it out!',
                        openUrl: '/help'
                    }))
                        .catch(error => {
                            console.log('Error while sending notification', error);
                        });
                });

                response.status(201).json({
                    message: 'Data have been added',
                    id: post.id
                });
            })
            .catch(error => {
                response.status(500).json({
                    error: error
                });
            });
    });
});

