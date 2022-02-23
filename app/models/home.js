const mongoose = require("mongoose");

let homeSchema = new mongoose.Schema({
    text: {type: String, required: true},
    image: {type: String},
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Home", homeSchema);

