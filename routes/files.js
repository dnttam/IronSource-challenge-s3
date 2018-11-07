const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const FirestoreHelper = require("../models/firestore");
const firestore = new FirestoreHelper();
const multer = require("multer");
const fs = require("fs");

/* multer storage definition 
  Basically, files names are a concatenation of the username and the original file name
  files are kept in the "files" sub folder
*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.name}_${file.originalname}`);
  }
});
var upload = multer({ storage: storage });

/* Routes start here */

/*
  GET root route
*/
router.get("/", (req, res) => {
  //res.send(`<h1>Welocme to Ez (Goat) 3! </h1`);
  fs.readdir("./", (err, result) => {
    console.log(result);
  });
});

/* Public GET route  to download file (or metadata) by it's filename (of a specific user)
*/
router.get("/:user/:filename", async (req, res) => {
  // go to the database and look for this file for this user
  try {
    const metadataSnapshot = await firestore.getFileByName(
      req.params.user,
      req.params.filename
    );

    // not found?
    if (metadataSnapshot.docs.length == 0) {
      return res.status(404).send(`file not found`);
    }

    // extract the metadata
    const metadata = metadataSnapshot.docs[0].data();

    // prviate file? not this route..
    if (!metadata.isPublic) {
      return res.status(401).send(`You are not authorized to view this file`);
    }

    // metadata request?
    if (req.query.metadata) {
      return res.send(metadata);
    }

    // download the file
    return res.download(`${__dirname}/../files/${metadata.filename}`);
  } catch (err) {
    if (err.code == null) return res.status(500).send(err);
    return res.status(500).send(`${err}`);
  }
});

/* Private GET route to download file (or metadata) by file ID
   JWT access_token query param is required - and should match the secret key and the file owner
   see Firestore.getFileByID for more details - models/firestore.js
*/
router.get("/:id", async (req, res) => {
  try {
    const metadata = await firestore.getFileByID(
      req.params.id,
      req.query.access_token
    );

    // metadata request?
    if (req.query.metadata) {
      return res.send(metadata);
    }

    // download the file
    return res.download(`${__dirname}/../files/${metadata.filename}`);
  } catch (err) {
    if (err.code == null) return res.status(500).send(err);

    return res.status(err.code).send(err.message);
  }
});

/* POST route for uploading files.
    authenticaion: x-auth-token header with a valid JWT is required and is being verified in the "auth" middleware.
    see middleware/auth.js

    The actual uploading and storing of the file is done by the multer middleware
    Metadata for the file is stored in Firestore

*/
router.post("/", auth, upload.single("file"), async (req, res) => {
  const metdata = {
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
    createdAt: Date.now().toString(),
    updatedAt: Date.now().toString(),
    isPublic: req.body.isPublic === "true",
    user: req.user.name
  };

  try {
    const savedMetadata = await firestore.addFileData(metdata);
    res.send({ id: savedMetadata.id, data: savedMetadata.data() });
  } catch (err) {
    res.status(500).send(err);
  }
});

/* PUT route for updating file metadata (access modifies and updateDT) by file ID
    authenticaion: x-auth-token header with a valid JWT is required and is being verified in the "auth" middleware.
    see middleware/auth.js

    metadata is retreived from Firestore following the same principals as in the private GET route (using the getFileByID method);

    updates are pushed back to firestore.
    */
router.put("/:id", auth, async (req, res) => {
  try {
    // get the file metadata from firestore, using the provided
    const metadata = await firestore.getFileByID(
      req.params.id,
      req.header("x-auth-token")
    );

    // update the json
    const updatedMetadata = metadata;
    updatedMetadata.isPublic = req.body.isPublic;
    updatedMetadata.updatedAt = Date.now();

    // update the database
    await firestore.updateFileAccessModifier(req.params.id, updatedMetadata);

    res.send(updatedMetadata);
  } catch (err) {
    if (err.code == null) return res.status(500).send(err);

    return res.status(err.code).send(err.message);
  }
});

/* DELETE route for deleting files by file ID
    authenticaion: x-auth-token header with a valid JWT is required and is being verified in the "auth" middleware.
    see middleware/auth.js

    while the file is physcally deleted, the metadata remains in the database and being assigned with a deletedDT
    metadata is retreived from Firestore following the same principals as in the private GET route (using the getFileByID method);

    */
router.delete("/:id", auth, async (req, res) => {
  try {
    // get the file metadata from firestore, using the provided
    const metadata = await firestore.getFileByID(
      req.params.id,
      req.header("x-auth-token")
    );

    // deleted already?
    if (metadata.deletedAt)
      return res.status(404).send("File has been deleted already");

    // update the deleted DT
    const updatedMetadata = metadata;
    updatedMetadata.deletedAt = Date.now();

    // delete the file
    fs.unlink(`${__dirname}/../files/${metadata.filename}`);

    // update the metadata
    await firestore.updateFileAccessModifier(req.params.id, updatedMetadata);

    res.send(updatedMetadata);
  } catch (err) {
    if (err.code == null) return res.status(500).send(err);

    return res.status(err.code).send(err.message);
  }
});

module.exports = router;
