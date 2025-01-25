import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/utils/dbConnect.js";
import morgan from "morgan";
import userRoutes from "./routes/userRoute.js";
import wasteRoutes from "./routes/wasteRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize MongoDB connection
connectDB();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Health check passed",
  });
});

// Add routes
app.use("/api/v1/users", userRoutes); 
app.use("/api/v1/waste", wasteRoutes);
app.use("/api/v1/dashboards", wasteRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
