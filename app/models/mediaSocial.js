const mongoose = require("mongoose");

let socialMediaSchema = new mongoose.Schema({
    instagram: String,
    facebook: String,
    whatsapp: String
});

module.exports = mongoose.model("SocialMedia", socialMediaSchema);