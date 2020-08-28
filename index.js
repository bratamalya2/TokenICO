const express=require('express');
const helmet = require('helmet');
const config = require('config');
const Hash = require('./util/hash');
const cors = require('cors');
const jwt=require('jsonwebtoken');

const Query=require('./util/Query.js');
const { readdirSync } = require('fs');
const bcrypt=require('bcrypt');
const auth = require('./util/auth');

const app=express();
app.use(cors());
app.use(helmet());
let token;


app.post('/user/signup',(req,res)=>{
    // username,pass,fname,dob,email
    let result=(async function(){Hash.hashFun(req.headers.pass);})();
    console.log(result);
    if(!result.res){
        Query.signup(result.resultPass,req.headers.fname,req.headers.dob,req.headers.email,req.headers.mobile,req.headers.nationality)
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

app.post('/user/login',auth, (req,res)=>{
    let resultPass=async function(){await hashFun(req.headers.pass);}();
    if(resultPass!==false){
        Query.login(req.headers.username,req.headers.pass)
            .then((result) => {
                if(result[0][0]["count(*)"]===0){
                    res.send({success: false});
                }
                else{
                    token=jwt.sign({ username: req.headers.username }, config.get('jwtPrivateKey'));
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

app.get('/user/checkuserexists', (req,res)=>{
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

app.get('/user/isconfirmed', (req,res)=>{
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

app.post('/user/reset', (req,res)=>{
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