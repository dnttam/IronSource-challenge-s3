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
    return docRef.id;
  }

  getFileByName(user, filename) {
    const db = admin.firestore();
    const filesRef = db.collection("files");
    const fileData = filesRef
      .where("originalname", "==", filename)
      .where("user", "==", user);

    return fileData.get();
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
          message: "You are not authorized to download this file"
        });
      }

      resolve(metadata);
    });
  }

  updateFileAccessModifier(id, newMetadata) {
    const db = admin.firestore();
    const filesRef = db.collection("files").doc(id);

    return filesRef.update(newMetadata);
  }
}

module.exports = FirestoreHelper;

//const firestore = new FirestoreHelper();

//firestore.getFileByName("user1", "letter.docx");

// firestore
//   .addFileData({
//     name: "letter.docx",
//     username: "user1",
//     size: 12540
//   })
//   .then(result => console.log({ data: result.data(), id: result.id }));

// const Firestore = require("@google-cloud/firestore");

// admin.initializeApp(functions.config().firebase);

// var db = admin.firestore();

// class FirestoreHelper {
//   addFileData(metadata) {
//     const firestore = new Firestore({
//       projectId: "msgv-8b8c2",
//       keyFilename: "../firestore.json"
//     });

//     firestore.
//     const document = firestore.doc("files");
//     document.set(metadata).then(() => {});
//   }
// }

// // const document = firestore.doc("posts/intro-to-firestore");

// // // Enter new data into the document.
// // document
// //   .set({
// //     title: "Welcome to Firestore",
// //     body: "Hello World"
// //   })
// //   .then(() => {
// //     // Document created successfully.
// //   })
// //   .catch(err => console.log(err));
