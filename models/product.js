const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  manufacturer: { type: Schema.Types.ObjectId, required: true },
  category: { type: Schema.Types.ObjectId, required: true },
  subcategory: { type: Schema.Types.ObjectId },
  price: { type: Number, required: true },
  pic: { type: String },
  inStock: { type: Boolean, required: true },
  qty: { type: Number, required: true },
});

ProductSchema.virtual("url").get(function () {
  return `/products/${this.categoty}/${this.subcategory}/${this.id}`;
});

module.exports = mongoose.model("Product", ProdcutSchema);
