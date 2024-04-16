const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  products: Array,
});

schema.virtual("id").get(function () {
  return this._id.toString();
});

module.exports = mongoose.model("Cart", schema, "carts");
