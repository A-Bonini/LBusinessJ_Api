/* EXPRESS */
var express = require("express");
var router = express.Router();
const uploadCursos = require("../middlewares/uploadImage");
const Curso = require("../models/cursos");
require("dotenv").config();
const link_image = process.env.LINK_IMAGE_CURSOS;

/* WithAUTH */
const withAuth = require("../middlewares/withAuth");
const secret = process.env.JWT_TOKEN;
const jwt = require("jsonwebtoken");
const User = require("../models/user");

/* FS */
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

//
//

router.post("/upload", uploadCursos.single('image'),async(req,res) => {
    const { title, body, url } = req.body;
    const token = req.headers['x-access-token'];

    if(!token){
        promisify(fs.unlink)(
            path.resolve(__dirname, "..", "..", "public", "images", "cursos", req.file.filename)
        );
        res.status(401).json({error: "Unauthorized: No token provided"});
    } else {
        jwt.verify(token, secret, (err, decoded) => {
            if(err){
                promisify(fs.unlink)(
                    path.resolve(__dirname, "..", "..", "public", "images", "cursos", req.file.filename)
                );
                res.status(401).json({error: "Unauthorized: token invalid"});
            }else{
                req.email = decoded.email;
                User.findOne({email: decoded.email})
                .then(async(user) => {
                    if(req.file){
                        try{
                            let curso = await new Curso({image: req.file.filename, title: title, body: body, url: url});
                            await curso.save();
                            
                            return res.json({
                                erro: false,
                                mensagem: "Upload realizado com sucesso!"});
                        } catch {
                            promisify(fs.unlink)(
                                path.resolve(__dirname, "..", "..", "public", "images", "cursos", req.file.filename)
                            );
                            res.status(400).json({
                                erro: true,
                                mensagem: "Erro: Upload não realizado com sucesso!"
                            })
                        }
                        
                    } else {
                        promisify(fs.unlink)(
                            path.resolve(__dirname, "..", "..", "public", "images", "cursos", req.file.filename)
                        );
                        res.status(400).json({
                            erro: true,
                            mensagem: "Erro: Upload não realizado com sucesso, necessário enviar uma imagem PNG ou JPG!"
                        });
                    }
                })
                .catch(err => {
                    promisify(fs.unlink)(
                        path.resolve(__dirname, "..", "..", "public", "images", "cursos", req.file.filename)
                    );
                    res.status(401).json({error: err});
                })
            }
        })
    }

});

router.get("/", async (req,res) => {
    try{
        let cursos = await Curso.find({});
        res.json({
            erro: false,
            cursos,
            link_image: link_image,
        })
    }catch(err){
        res.status(400).json({
            erro: true,
            mensagem: "Erro: Nenhuma imagem encontrada!"
        })
    }
});

router.delete("/:id", withAuth,async (req,res) => {
    const { id } = req.params;

    try{
        let curso = await Curso.findById(id);
        await curso.delete();
        res.json({message: 'OK'}).status(204);
    } catch(err){
        res.status(500).json({error: "Problem to delete a curso"});
    }
});

router.put("/:id/edit", uploadCursos.single('image'),async (req,res) => {
    const { title, body, url} = req.body;
    const { id } = req.params;
    const token = req.headers['x-access-token'];

    if(!token){
        if(req.file){
            promisify(fs.unlink)(
                path.resolve(__dirname, "..", "..", "public", "images", "cursos", req.file.filename)
            );
        }
        
        res.status(401).json({error: "Unauthorized: No token provided"});
    } else {
        jwt.verify(token, secret, (err, decoded) => {
            if(err){
                if(req.file){
                    promisify(fs.unlink)(
                        path.resolve(__dirname, "..", "..", "public", "images", "cursos", req.file.filename)
                    );
                }
                
                res.status(401).json({error: "Unauthorized: token invalid"});
            }else{
                req.email = decoded.email;
                User.findOne({email: decoded.email})
                .then(async(user) => {
                    if(req.file){
                        let imageDelete = await Curso.findById(id);
                        await promisify(fs.unlink)(
                            path.resolve(__dirname, "..", "..", "public", "images", "cursos", imageDelete.image)
                        );
                        let curso = await Curso.findByIdAndUpdate(
                            { _id: id},
                            { $set : {image: req.file.filename ,title: title, body: body, url: url} },
                            { upsert: true, "new": true }
                        );

                        res.status(200).json({curso,mensagem: "Upload realizado com sucesso!"});
                    } else {
                        let curso = await Curso.findByIdAndUpdate(
                            { _id: id},
                            { $set : {title: title, body: body, url: url} },
                            { upsert: true, "new": true }
                        );

                        res.status(200).json({curso,mensagem: "Upload realizado com sucesso!"});
                    }
                })
                .catch(err => {
                    if(req.file){
                        promisify(fs.unlink)(
                            path.resolve(__dirname, "..", "..", "public", "images", "cursos", req.file.filename)
                        );
                    }

                    res.status(401).json({error: err});
                })
            }
        })
    }
});

router.get("/:id", async(req,res) => {
    const { id } = req.params;
    
    try{
        let curso = await Curso.findById(id);
        res.status(200).json({curso,link_image: link_image});
    }catch(err){
        res.status(500).json({err: err});
    }
})

module.exports = router;