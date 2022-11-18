const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SubcategorySchema = new Schema({
  name: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, required: true },
});

SubcategorySchema.virtual("url").get(function () {
  return `/categories/${this.category}/${this.id}`;
});
