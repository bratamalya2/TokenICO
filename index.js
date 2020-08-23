const express=require('express');
const helmet = require("helmet");
const cors = require('cors');
const jwt=require('jsonwebtoken');

const Query=require('./util/Query.js');
const { readdirSync } = require('fs');
const bcrypt=require('bcrypt');

const app=express();
app.use(cors());
app.use(helmet());
let token;

async function hashFun(x){
    console.log(x);
    bcrypt.genSalt(15, function(err, salt) {
        bcrypt.hash(x, salt, function(err, hash) {
            if(err){
                return Promise.resolve(false);
            }
            else{
                console.log(hash);
                return Promise.resolve(hash);
            }
        });
    });
}

app.post('/user/signup',(req,res)=>{

    let resultPass=async function(){await hashFun(req.headers.pass);}();
    if(resultPass!==false){
        Query.signup(req.headers.username,resultPass,req.headers.name)
            .then(() => {
                res.send({success: true});
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({success: false, error:'Bad request', errno: err.errno});
            });
    }
    else{
        console.log('Failed to generate password');
        res.send({success: false, error: 'Failed to generate password'});
    }
});

app.post('/user/login',(req,res)=>{
    let resultPass=async function(){await hashFun(req.headers.pass);}();
    if(resultPass!==false){
        Query.login(req.headers.username,req.headers.pass)
            .then((result) => {
                if(result[0][0]["count(*)"]===0){
                    res.send({success: false});
                }
                else{
                    token=jwt.sign({ username: req.headers.username }, 'jwtPrivateKey');
                    //above code needs to be modified before production
                    res.send({success: true, jwt: token});
                }
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({success: false, error:'Bad request'});
            });
    }
    else {
        console.log('Failed to generate password');
        res.send({success: false, error: 'Failed to generate password'});
    }
});

app.get('/user/checkuserexists',(req,res)=>{
    Query.checkUserExists(req.query.username)
            .then((result) => {
                if(result[0][0]["count(*)"]===0){
                    res.send({success: false});
                }
                else
                    res.send({success: true});
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({success: false, error:'Bad request'});
            });
});

app.get('/user/isconfirmed',(req,res)=>{
    Query.isConfirmed(req.query.username)
            .then((result) => {
                console.log(result);
                if(result[0][0]["isConfirmed"]===0){
                    res.send({success: false});
                }
                else
                    res.send({success: true});
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({success: false, error:'Bad request'});
            });
});

app.post('/user/reset',(req,res)=>{
    Query.reset(req.headers.username,req.headers.pass)
            .then(()=>{
                res.send({success: true});
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({success: false, error:'Bad request'});
            });

});

/*

Hashing
app.get('/user/hash',(req,res)=>{
    console.log(req.headers.pass);
    
});
*/

app.listen(3005);