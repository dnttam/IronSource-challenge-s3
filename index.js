const express = require("express");
const app = express();
const files = require("./routes/files");

app.use(express.json());
app.use("/api/files", files);

const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`Hey, yo! This express is alive and listening on port ${port}!`)
);
