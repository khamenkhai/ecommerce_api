const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Category = require("../models/category");
const productsData = require("../seeders/products.json");
const categoriesData = require("../seeders/categories.json");

// Seed products to MongoDB
router.post("/seedProducts", async (req, res) => {
  try {
    await Product.deleteMany(); // Clear existing products
    const inserted = await Product.insertMany(productsData);
    res.status(201).json({ message: "Seed success", count: inserted.length });
  } catch (err) {
    res.status(500).json({ message: "Seed failed", error: err.message });
  }
});

router.post("/seedCategories", async (req, res) => {
  try {
    // await Category.deleteMany(); // optional reset
    const inserted = await Category.insertMany(categoriesData);
    res.status(201).json({ message: "Seed success", count: inserted.length });
  } catch (err) {
    res.status(500).json({ message: "Seed failed", error: err.message });
  }
});

// Optional: Add endpoint to get seed data (for reference)
router.get("/seed-data", (req, res) => {
  res.json({
    success: true,
    count: categoriesData.length,
    data: categoriesData
  });
});


module.exports = router;
