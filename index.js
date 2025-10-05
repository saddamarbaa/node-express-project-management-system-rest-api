import dotenv from "dotenv";

dotenv.config();

console.log(process.env.S3_BUCKET);
console.log(process.env.API_URL);

console.log("Hello, World! from nodemon");
