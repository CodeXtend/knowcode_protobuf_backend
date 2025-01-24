import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/utils/dbConnect.js";
import morgan from "morgan";
import userRoutes from './routes/userRoute.js';
// import wasteRoutes from './routes/wasteRoute.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize MongoDB connection
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Add routes
app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/waste', wasteRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
