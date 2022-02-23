var express = require("express");
var router = express.Router();
const SocialMedia = require("../models/mediaSocial");
const withAuth = require("../middlewares/withAuth");

router.post("/", withAuth ,async(req,res) => {
    const { instagram, facebook, whatsapp } = req.body;
    const response = await SocialMedia.find({});
    let responseString = JSON.stringify(response);
    let responseJson = JSON.parse(responseString);
    
    try{
        if(responseJson.length < 1){
            let social = new SocialMedia({instagram: instagram, facebook: facebook, whatsapp: whatsapp});
            await social.save();
            res.status(200).json(social);
        } else {
            res.status(500).json({erro: true, mensagem: "Erro ao criar SocialMedia"});
        }
    }catch(error){
        res.status(500).json({erro: true, mensagem: "Erro ao criar SocialMedia"});
    }
});

router.get("/", async(req,res) => {
    try{
        let social = await SocialMedia.find({});
        res.status(200).json(social);
    }catch(error){
        res.status(500).json({error: error});
    }
});

router.put("/", withAuth,async(req,res) => {
    const { instagram, facebook, whatsapp, id } = req.body;

    try{
        let social = await SocialMedia.findByIdAndUpdate(
            { _id: id},
            { $set : {instagram: instagram, facebook: facebook, whatsapp: whatsapp} },
            { upsert: true, "new": true }
        );

        res.status(200).json(social);
    }catch(error){
        res.status(500).json({error: error});
    }
});

module.exports = router;

