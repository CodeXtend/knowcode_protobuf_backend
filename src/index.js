import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/utils/dbConnect.js";
import morgan from "morgan";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize MongoDB connection
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
