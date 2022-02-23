var express = require("express");
var router = express.Router();
const Home = require("../models/home");
const User = require("../models/user");
const withAuth = require("../middlewares/withAuth");
const uploadImageHome = require("../middlewares/uploadImageHome");
require("dotenv").config();
const link_image = process.env.LINK_IMAGE_HOME;


/* WithAUTH */
const secret = process.env.JWT_TOKEN;
const jwt = require("jsonwebtoken");

/* FS */
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

router.post("/", withAuth ,async(req,res) => {
    const { text, image } = req.body;
    const response = await Home.find({});
    let responseString = JSON.stringify(response);
    let responseJson = JSON.parse(responseString);
    
    try{
        if(responseJson.length < 1){
            let home = new Home({text: text,image: image});
            await home.save();
            res.status(200).json(home);
        } else {
            res.status(500).json({erro: true, mensagem: "Erro ao criar um novo texto para a Home"});
        }
    }catch(error){
        res.status(500).json({erro: true, mensagem: "Erro ao criar um novo texto para a Home"});
    }
});

router.get("/", async(req,res) => {
    try{
        let home = await Home.find({});
        res.status(200).json({home: home,link_image: link_image});
    }catch(error){
        res.status(500).json({error: error});
    }
});

router.put("/", uploadImageHome.single('image'),async(req,res) => {
    const { text, id } = req.body;
    const token = req.headers['x-access-token'];

    if(!token){
        if(req.file){
            promisify(fs.unlink)(
                path.resolve(__dirname, "..", "..", "public", "images", "home", req.file.filename)
            );
        }

        res.status(401).json({error: "Unauthorized: No token provided"});
    } else {
        jwt.verify(token, secret, (err, decoded) => {
            if(err){
                if(req.file){
                    promisify(fs.unlink)(
                        path.resolve(__dirname, "..", "..", "public", "images", "home", req.file.filename)
                    );
                }

                res.status(401).json({error: "Unauthorized: token invalid"});
            } else {
                req.email = decoded.email;
                User.findOne({email: decoded.email})
                .then(async (user) => {
                    if(req.file){
                        let imageDelete = await Home.findById(id);
                        if(fs.existsSync(`${__dirname}/../../public/images/home/${imageDelete.image}`)){
                            promisify(fs.unlink)(
                                path.resolve(__dirname, "..", "..", "public", "images", "home", imageDelete.image)
                            );
                        }

                        let home = await Home.findByIdAndUpdate(
                            { _id: id},
                            { $set : {text: text,image: req.file.filename} },
                            { upsert: true, "new": true }
                        );

                        res.status(200).json({home,mensagem: "Upload realizado com sucesso!"});
                    } else {
                        let home = await Home.findByIdAndUpdate(
                            { _id: id},
                            { $set : {text: text} },
                            { upsert: true, "new": true }
                        );

                        res.status(200).json({home,mensagem: "Upload realizado com sucesso!"});
                    }
                })
                .catch(err => {
                    if(req.file){
                        promisify(fs.unlink)(
                            path.resolve(__dirname, "..", "..", "public", "images", "home", req.file.filename)
                        );
                    }

                    res.status(401).json({error: err});
                })
            }
        })
    }
});

module.exports = router;