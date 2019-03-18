const dbPromise = idb.openDb('posts-store', 1, db => {
    if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', {
            keyPath: 'id'
        });
    }

    if (!db.objectStoreNames.contains('sync-posts')) {
        db.createObjectStore('sync-posts', {
            keyPath: 'id'
        });
    }
});

function writeData(store, data) {
    return dbPromise.then(db => {
        let tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).put(data);
        return tx.complete;
    });
}

function readAllData(store) {
    return dbPromise
        .then(db => {
            let tx = db.transaction(store, 'readonly');
            return tx.objectStore(store).getAll();
        });
}

function clearAllData(store) {
    return dbPromise.then(db => {
       let tx = db.transaction(store, 'readwrite');
       tx.objectStore(store).clear();
       return tx.complete;
    });
}

function deleteItemFromData(store, id) {
    return dbPromise
        .then(db => {
            let tx = db.transaction(store, 'readwrite');
            tx.objectStore(store).delete(id);
            return tx.complete;
        })
        .then(() => {
            console.log('item deleted', id);
        });
}

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab], {type: mimeString});
    return blob;
}