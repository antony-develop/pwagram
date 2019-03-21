const functions = require('firebase-functions');
const admin = require("firebase-admin");
const cors = require('cors')({
    origin: true
});
const webPush = require('web-push');
const {Storage} = require('@google-cloud/storage');
const googleCloudStorage = new Storage({
    projectId: 'pwagram-4967b',
    keyFilename: 'firebase-adminsdk-key.json'
});

const fs = require('fs');
const UUID = require('uuid-v4');
const os = require('os');
const Busboy = require('busboy');
const path = require('path');
const geoCoder = require('city-reverse-geocoder');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const serviceAccount = require("./firebase-adminsdk-key.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pwagram-4967b.firebaseio.com"
});

exports.storePostData = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        const uuid = UUID();
        const busboy = new Busboy({
            headers: request.headers
        });
        let postImage;
        const fields = {};

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            postImage = {
                path: path.join(os.tmpdir(), filename),
                type: mimetype
            };
            file.pipe(fs.createWriteStream(postImage.path));
        });

        busboy.on('field', (fieldname, value) => {
            fields[fieldname] = value;
        });

        busboy.on('finish', () => {
            let bucket = googleCloudStorage.bucket('pwagram-4967b.appspot.com');
            bucket.upload(postImage.path, {
                uploadTime: 'media',
                metadata: {
                    metadata: {
                        contentType: postImage.type,
                        firebaseStorageDownloadTokens: uuid
                    }
                }
            }, (error, file) => {
                if (error) {
                    console.log(error);
                } else  {
                    admin.database().ref('posts').push({
                        id: fields.id,
                        title: fields.title,
                        location: fields.location,
                        image: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media&token=${uuid}`
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
                                id: fields.id
                            });
                        })
                        .catch(error => {
                            response.status(500).json({
                                error: error
                            });
                        });
                }
            });
        });

        busboy.end(request.rawBody);
    });
});

exports.reverseGeocode = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        let { latitude, longitude } = request.query;

        decodedCity = geoCoder(latitude, longitude)[0];

        return response.status(200).json(decodedCity);
    });
});

