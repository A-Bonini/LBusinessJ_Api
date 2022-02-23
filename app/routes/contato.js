var express = require("express");
var router = express.Router();
const Contato = require("../models/contato");
const withAuth = require("../middlewares/withAuth");

router.post("/", async(req,res) => {
    const { name, email, mensagem } = req.body;

    try{
        let response = await new Contato({name: name,email: email,mensagem: mensagem});
        await response.save();

        res.status(200).json(response);
    }catch(err){
        res.status(500).json(err);
    }
});

router.get("/", withAuth, async(req,res) => {
    try{
        let contatos = await Contato.find({});
        res.status(200).json(contatos);
    }catch(error){
        res.status(500).json({error: error});
    }
});

router.delete("/:id", withAuth,async (req,res) => {
    const { id } = req.params;

    try{
        let contato = await Contato.findById(id);
        await contato.delete();
        res.json({message: 'OK'}).status(204);
    } catch(err){
        res.status(500).json({error: "Problem to delete a curso"});
    }
});


module.exports = router;