const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const productsData = require("../products.json");

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

module.exports = router;
