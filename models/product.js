const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, 
    trim: true,     
  },
  image: {
    type: String,
    required: true, 
  },
  countInStock: {
    type: Number,
    required: true,
    min: 0,         
  }
});

module.exports = mongoose.model("Product", ProductSchema);
