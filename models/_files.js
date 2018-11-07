const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const Firestore = require("@google-cloud/firestore");

const firestore = new Firestore({
  projectId: "msgv-8b8c2",
  keyFilename: "../firestore.json"
});

class FileHandler {
  getMetadata(fileID, accessToken) {
    return new Promise((resolve, reject) => {
      // verfiy that such a file exists
      const filePath = `metadataFiles/${fileID}.json`;

      if (!fs.existsSync(filePath)) {
        reject(new Error(`File with ID:'${fileID} doesn't exist`));
      }

      // read the metadata
      const metadata = JSON.parse(fs.readFileSync(filePath));

      // verify that you are authorized to get the metadata of the file
      if (!this.isAuthorized(metadata, accessToken)) {
        reject(new Error("You are not authorized to access this file"));
      }
      resolve(metadata);
    });
  }

  getFilePath(accessToken, metadata) {
    return new Promise((resolve, reject) => {
      // verify that you are authorized to get the metadata of the file
      if (!this.isAuthorized(metadata, accessToken)) {
        reject(new Error("You are not authorized to access this file"));

        resolve(path.resolve(`${__dirname}/../files/${metadata.filename}`));
      }
    });
  }

  //   //   create(file) {}
  //   //   update(file) {}
  //   //   delete(file) {}
  isAuthorized(metadata, accessToken) {
    try {
      return (
        metadata.isPublic ||
        (accessToken && jwt.verify(accessToken, "EZ3-IronSource-S3-Challenge"))
      );
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

module.exports = FileHandler;
