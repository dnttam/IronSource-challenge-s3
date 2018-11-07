const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const FirestoreHelper = require("../models/firestore");
const firestore = new FirestoreHelper();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.name}_${file.originalname}`);
  }
});
var upload = multer({ storage: storage });

router.get("/", (req, res) => {
  //res.send(`<h1>Welocme to Ez (Goat) 3! </h1`);
  fs.readdir("./", (err, result) => {
    console.log(result);
  });
});

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

    return res.download(`${__dirname}/../files/${metadata.filename}`);
  } catch (err) {
    console.log(err);
    return res.status(500).send(`${err}`);
  }
});

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

    return res.download(`${__dirname}/../files/${metadata.filename}`);
  } catch (err) {
    return res.status(err.code).send(err.message);
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const metadata = await firestore.getFileByID(
      req.params.id,
      req.header("x-auth-token")
    );
    const updatedMetadata = metadata;
    updatedMetadata.isPublic = req.body.isPublic;
    updatedMetadata.updatedAt = Date.now();

    console.log(req.body);
    const writeResult = await firestore.updateFileAccessModifier(
      req.params.id,
      updatedMetadata
    );
    res.send(updatedMetadata);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

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

// router.put("/:id", auth, async (req, res) =>{

//   try {
//     const decoded = jwt.verify(
//       req.query.access_token,
//       "EZ3-IronSource-S3-Challenge"
//     );
//     user = decoded.name;
//   } catch (ex) {
//     return res.status(401).send("Invalid access token.");
//   }

//   try {
//     const metadataSnapshot = await firestore.getFileByID(req.params.id);
//     // not found?
//     if (!metadataSnapshot.exists) {
//       return res.status(404).send(`file not found`);
//     }

//     // extract the metadata
//     const metadata = metadataSnapshot.data();

//     // verify user in case this is a prive file
//     if (!metadata.isPublic && metadata.user !== user) {
//       return res
//         .status(401)
//         .send("You are not authorized to download this file");
//     }

// }

// get the metadat
// fileHandler
//   .getMetadata(req.params.id, req.query.access_token)
//   .then(metadata => {
//     // if that's all we need, just send it back
//     if (req.query.metadata === "true") {
//       return res.send(metadata);
//     } else{
//       fileHandler.getFilePath(metadata, req.query.access_token).then(path => res.sendfile(path)).catch{
//         res.status(400).send(err);
//       }
//     }
//   })
//   .catch(err => {
//      res.status(400).send(err);
//   });

// const filePath = `metadataFiles/${req.params.id}.json`;

// if (!fs.existsSync(filePath)) {
//   return res.status(400).send("This file ID doesn't exist");
// }

// const metadata = JSON.parse(fs.readFileSync(filePath));

// const access_token = req.query.access_token;

// if (
//   !metadata.isPublic &&
//   (!access_token || jwt.verify(access_token, "EZ3-IronSource-S3-Challenge"))
//     .id != metadata.userID
// ) {
//   return res
//     .status(401)
//     .send("You are unauthorzied to download this file/metadata");
// }

// if (req.query.metadata === "true") {
//   return res.send(metadata);
// } else {
//   return res.sendFile
//     path.resolve(`${__dirname}/../files/${metadata.filename}`)
//   );
// }

// router.post("/", auth, upload.single("file"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send("No file was uploaded!");
//   }

//   console.log(req.body.isPublic);

//   const metdata = {
//     filename: req.file.filename,
//     size: req.file.size,
//     createdAt: Date.now().toLocaleString(),
//     updatedAt: null,
//     deletedAt: null,
//     isPublic: req.body.isPublic,
//     userID: req.user.id
//   };

//   const fileID = uniqid();

//   fs.writeFile(
//     `metadataFiles/${fileID}.json`,
//     JSON.stringify(metdata),
//     () => {}
//   );

//   return res.send(fileID);
// });

// router.put("/:id", auth, (req, res) => {});

module.exports = router;
