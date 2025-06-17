require("dotenv").config();
const express = require("express");
const connectDB = require("./data/connect");
const productsRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const seedRoutes = require("./routes/seederRoutes");
const userRoutes = require("./routes/user_routes");
const orderRoutes = require("./routes/orderRoutes");
const errorHandler = require("./middleware/error_handler");
const authJwt = require("./helpers/jwt");
const cors = require("cors");
const app = express();

app.use(cors());

app.use(express.json());
// app.use(authJwt);

app.use("/api/products", authJwt, productsRoutes);
app.use("/api/products", categoryRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/user", userRoutes);
app.use("/api/order", authJwt, orderRoutes);


app.get("/helloworld", (req, res) => {
  res.json({ data: "helloworld" });
});

// Not Found Route (404)
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);


const port = process.env.PORT;

const start = async () => {
  try {
    console.log("Starting application...");
    console.log("Connecting to database...");
    await connectDB(process.env.MONGO_URL);
    console.log("Starting server...");
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log("Application failed to start:", error);
  }
};

start();
