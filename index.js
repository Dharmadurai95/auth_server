const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
const User = require('./user');
dotenv.config();
const jwt = require('jsonwebtoken');

mongoose.connect(process.env.DB_CONNECT,()=>{
    console.log('connected to database');
});

app.post('/api/login',  (req, res) => {
    User.findOne({username:req.body.username,password:req.body.password},(err,user)=>{
        if(err || !user){
            res.status(200).send({error:'Unauthorized',status:false, message:'Invalid username or password'});
        }
        else{
            res.json({user,authToken:generateAccessToken(req.body.username),status:true});
        }
    });
})
app.post('/api/signup',async (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    try {
        const saveUser = await user.save();
        res.send(saveUser);
    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
});

app.get('/api/authUser', authentication, (req, res) => {
    res.send(req.user); 
});

function authentication(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(200).send({ error: 'No token, authorization denied' ,status:false,message:'Authorization denied'});
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.status(200).send({ error: 'Token is not valid' ,status:false,message:'Invalid token'});
        req.user = user;
        res.status(200).send({status:true,user});
    });
}   
    

function generateAccessToken(username) {
    return jwt.sign({username}, process.env.TOKEN_SECRET, { expiresIn: '23h' });
  }
app.listen(4000, () => {
    console.log('Server started on port 4000');
});