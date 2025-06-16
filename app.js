require("dotenv").config(); 
const express = require("express");
const connectDB = require("./data/connect");
const productsRoutes = require("./routes/products_routes");
const seedRoutes = require("./routes/seederRoutes");
const errorHandler = require("./middleware/error_handler");
const app = express();

app.use(express.json());


app.use("/api/products", productsRoutes)
app.use("/api/seed", seedRoutes)


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



const port =  process.env.PORT; 

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
