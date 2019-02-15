const dbPromise = idb.openDb('posts-store', 1, db => {
    if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', {
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