const mongoose = require("mongoose");

let SobreSchema = new mongoose.Schema({
    text: { type : Array , "default" : [] },
    image: {type: String}
});

module.exports = mongoose.model("Sobre", SobreSchema);