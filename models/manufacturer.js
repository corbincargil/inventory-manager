const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ManufacturerSchema = new Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  founded: { type: Date },
  logo: { type: String },
});

ManufacturerSchema.virtual("url").get(function () {
  return `/manufacturers/${this.id}`;
});

module.exports = mongoose.model("Manufacturer", ManufacturerSchema);
