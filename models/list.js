const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
  person: {
    type: Array,
  },
});

const List = mongoose.model("List", listSchema);
module.exports = List;
