const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const serviceAccount = require("../firestore.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

class FirestoreHelper {
  async addFileData(metadata) {
    const db = admin.firestore();

    const docRef = db.collection("files").doc();
    await docRef.set(metadata);

    return docRef.get();
  }

  getFileByName(user, filename) {
    return new Promise(async (resolve, reject) => {
      const db = admin.firestore();
      const filesRef = db.collection("files");
      const fileData = filesRef
        .where("originalname", "==", filename)
        .where("user", "==", user);

      const metadataSnapshot = await fileData.get();

      // not found?
      if (metadataSnapshot.docs.length == 0) {
        return resolve(null);
      }

      // extract the metadata
      resolve({
        metadata: metadataSnapshot.docs[0].data(),
        id: metadataSnapshot.docs[0].ref.id
      });
    });
  }

  getFileByID(id, accessToken) {
    return new Promise(async (resolve, reject) => {
      // access token provided?
      if (!accessToken) {
        reject({
          code: 401,
          message: "Access token not provided on ID search"
        });
      }

      // verift access token and get user
      let user = "";
      try {
        const decoded = jwt.verify(accessToken, "EZ3-IronSource-S3-Challenge");
        user = decoded.name;
      } catch (ex) {
        reject({
          code: 401,
          message: "Invalid access token"
        });
      }

      // look for metadat in firestore
      const db = admin.firestore();
      const filesRef = db.collection("files").doc(id);
      const metadataSnapshot = await filesRef.get();

      // not found?
      if (!metadataSnapshot.exists) {
        reject({
          code: 404,
          message: "file not found"
        });
      }

      // extract the metadata
      const metadata = metadataSnapshot.data();

      // verify user
      if (metadata.user !== user) {
        reject({
          code: 401,
          message: "You are not authorized to access this file"
        });
      }

      resolve(metadata);
    });
  }

  updateMetadata(id, newMetadata) {
    const db = admin.firestore();
    const filesRef = db.collection("files").doc(id);

    return filesRef.update(newMetadata);
  }
}

module.exports = FirestoreHelper;
