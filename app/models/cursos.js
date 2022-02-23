const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

let cursoSchema = new mongoose.Schema({
    image: String,
    title: String,
    body: String,
    url: String
});

cursoSchema.pre("remove", function(){
    return promisify(fs.unlink)(
        path.resolve(__dirname, "..", "..", "public", "images", "cursos", this.image)
    )
});

module.exports = mongoose.model("Curso", cursoSchema);