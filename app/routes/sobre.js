var express = require("express");
var router = express.Router();
const Sobre = require("../models/sobre");
const User = require("../models/user");
const withAuth = require("../middlewares/withAuth");
const uploadImageSobre = require("../middlewares/uploadImageSobre");
require("dotenv").config();
const link_image = process.env.LINK_IMAGE_SOBRE;

/* WithAUTH */
const secret = process.env.JWT_TOKEN;
const jwt = require("jsonwebtoken");

/* FS */
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

router.post("/", withAuth,async(req,res) => {
    const { text, image } = req.body;
    const response = await Sobre.find({});
    let responseString = JSON.stringify(response);
    let responseJson = JSON.parse(responseString);
    
    try{
        if(responseJson.length < 1){
            let sobre = new Sobre({text: text, image: image});
            await sobre.save();
            res.status(200).json(sobre);
        } else {
            res.status(500).json({erro: true, mensagem: "Erro ao criar um novo texto para a Sobre"});
        }
    }catch(error){
        res.status(500).json({erro: true, mensagem: "Erro ao criar um novo texto para a Sobre"});
    }
});

router.get("/", async(req,res) => {
    try{
        let sobre = await Sobre.find({});
        res.status(200).json({sobre: sobre,link_image: link_image});
    }catch(error){
        res.status(500).json({error: error});
    }
});

router.put("/", uploadImageSobre.single('image'),async(req,res) => {
    const { text, id } = req.body;
    const token = req.headers['x-access-token'];

    if(!token){
        if(req.file){
            promisify(fs.unlink)(
                path.resolve(__dirname, "..", "..", "public", "images", "sobre", req.file.filename)
            );
        }

        res.status(401).json({error: "Unauthorized: No token provided"});
    } else {
        jwt.verify(token, secret, (err, decoded) => {
            if(err){
                if(req.file){
                    promisify(fs.unlink)(
                        path.resolve(__dirname, "..", "..", "public", "images", "sobre", req.file.filename)
                    );
                }

                res.status(401).json({error: "Unauthorized: token invalid"});
            } else {
                req.email = decoded.email;
                User.findOne({email: decoded.email})
                .then(async (user) => {
                    if(req.file){
                        let imageDelete = await Sobre.findById(id);
                        if(fs.existsSync(`${__dirname}/../../public/images/sobre/${imageDelete.image}`)){
                            promisify(fs.unlink)(
                                path.resolve(__dirname, "..", "..", "public", "images", "sobre", imageDelete.image)
                            );
                        }
                        
                        let sobre = await Sobre.findByIdAndUpdate(
                            { _id: id},
                            { $set : {text: text,image: req.file.filename} },
                            { upsert: true, "new": true }
                        );

                        res.status(200).json({sobre,mensagem: "Upload realizado com sucesso!"});
                    } else {
                        let sobre = await Sobre.findByIdAndUpdate(
                            { _id: id},
                            { $set : {text: text} },
                            { upsert: true, "new": true }
                        );

                        res.status(200).json({sobre,mensagem: "Upload realizado com sucesso!"});
                    }
                })
                .catch(err => {
                    if(req.file){
                        promisify(fs.unlink)(
                            path.resolve(__dirname, "..", "..", "public", "images", "sobre", req.file.filename)
                        );
                    }

                    res.status(401).json({error: err});
                })
            }
        })
    }
});

module.exports = router;