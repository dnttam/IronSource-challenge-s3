const jwt = require("jsonwebtoken");
console.log(
  jwt.sign({ name: "user1", id: "qAzef32F" }, "EZ3-IronSource-S3-Challenge")
);

console.log(
  jwt.sign({ name: "user2", id: "hT9Lmdx’" }, "EZ3-IronSource-S3-Challenge")
);
