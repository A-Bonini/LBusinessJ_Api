var express = require('express');
var router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const withAuth = require("../middlewares/withAuth");
require("dotenv").config();
const secret = process.env.JWT_TOKEN;
const userEmail = process.env.USER_EMAIL_DEFAULT;
const userPassword = process.env.USER_PASSWORD_DEFAULT;

router.post("/register", withAuth, async(req,res) => {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
  
    try{
      await user.save();
      res.status(200).json(user);
    }catch(error){
      res.status(500).json({error: "Error registering new user"})
    }
});

router.post("/login", async (req,res) => {
    const { email, password} = req.body;
    
    try{
        let user = await User.findOne({ email });
        if(!user){
            if(email == userEmail){
              const userCreate = await new User({name:"Admin", email: userEmail, password: userPassword});
              try{
                await userCreate.save();
                const tokenLogin = await jwt.sign({ email: userEmail }, secret, { expiresIn: "10d" });
                res.status(200).json({user: userCreate, token: tokenLogin});
              }catch(err){
                res.status(500).json({error: "Incorrect email or password"});
              }
            } else {
                res.status(200).json({error: 'Incorrect email or password'});
            }
          }else{
            user.isCorrectPassword(password, function(err, same){
              if(!same){
                res.status(401).json({error: "Incorrect email or password"});
              }else{
                const token = jwt.sign({ email }, secret, { expiresIn: "10d" });
                res.json({user: user, token: token});
              }
            })
          }
    }catch(error){
        res.status(500).json({error: 'Internal error please try again'});
    }
});

router.get("/", withAuth, async(req,res) => {
    try{
        let users = await User.find({});
        res.status(200).json(users);
    }catch(err){
        res.status(500).json(err);
    }
});

router.put("/edit/info", withAuth, async(req,res) => {
  const {name,email} = req.body;

  try{
    let user = await User.findOneAndUpdate(
      {_id: req.user._id},
      {$set : {name: name, email: email}},
      {upsert: true, 'new': true}
    )
    res.status(200).json(user);
  }catch(err){
    res.status(401).json({error: error});
  }
});

router.put("/edit/pass", withAuth, async(req,res) => {
  const { password } = req.body;

  try{
      let user = await User.findById(req.user._id);
      user.password = password;
      await user.save();

      res.status(200).json(user);
  } catch(err){
      res.status(401).json({error: error});
  }
});

router.delete("/:id", withAuth, async(req,res) => {
    const { id } = req.params;
  
    try{
        let user = await User.findById(id);
        await user.delete();
        res.status(200).json(user);
    }catch(err){
        res.status(500).json({error: "Problem to delete a user"});
    }
}); 

module.exports = router;