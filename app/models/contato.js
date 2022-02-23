const mongoose = require("mongoose");

let contatoSchema = new mongoose.Schema({
    name: {type: String, required: true, maxLength: 20},
    email: {type: String, required: true},
    mensagem: {type: String, required: true}
});

module.exports = mongoose.model("Contato", contatoSchema);