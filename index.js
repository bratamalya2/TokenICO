const express=require('express');
const helmet = require('helmet');
const config = require('config');
const Hash = require('./util/hash');
const getPass = require('./util/getPass').getPass;
const cors = require('cors');
const jwt=require('jsonwebtoken');
const Query=require('./util/Query.js');
const { readdirSync } = require('fs');

const auth = require('./util/auth');
const emailsender = require('./util/send-email');

const { SlowBuffer } = require('buffer');

const hashedFun = Hash.hashFun;
const hashCompare = Hash.hashCompare;

const app=express();

app.use(cors());
app.use(helmet());
let token;

/*
        SignUp, Login APIs
*/

app.post('/user/signup', hashedFun, (req,res)=>{
    if(res.locals.hashed.res){
        Query.signup(res.locals.hashed.resultPass,req.headers.fname,req.headers.dob,req.headers.email,req.headers.mobile,req.headers.nationality)
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

app.post('/user/login', hashCompare, (req,res)=>{
    if(res.locals.result.res){
        Query.login(req.headers.email,res.locals.result.pass)
            .then((result) => {
                if(result[0][0]["count(*)"]!==1){
                    res.send({success: false});
                }
                else{
                    Query.getUserId(req.headers.email)
                            .then( id => {
                                token=jwt.sign({ email: req.headers.email, userId: id[0][0]["id"] }, config.get('jwtPrivateKey'));
                                Query.updateLastLogin(req.headers.email, Date.now())
                                    .then(() => { 
                                        res.send({success: true, jwt: token});
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                        res.status(500).send({success: false, error: 'Internal server error'});
                                    });
                            })
                            .catch(err => res.status(500).send({ success: false, error: 'Internal error'}));                    
                }
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({ success: false, error:'Bad request' });
            });
    }
    else {
        console.log('Failed to generate password');
        res.send({ success: false, error: res.locals.result.err });
    }
});

app.get('/user/checkUserExists', (req,res)=>{
    Query.checkUserExists(req.query.email)
            .then((result) => {
                if(result[0][0]["count(*)"]===0){
                    res.send({ success: false });
                }
                else
                    res.send({ success: true });
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({ success: false, error:'Bad request' });
            });
});

app.get('/user/checkAdminExists', (req,res)=>{
    Query.checkAdminExists(req.query.email)
            .then((result) => {
                if(result[0][0]["count(*)"]===0){
                    res.send({ success: false });
                }
                else
                    res.send({ success: true });
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({ success: false, error:'Bad request' });
            });
});

app.get('/user/isEmailConfirmed', auth, (req,res) => {
    Query.isEmailVerified(req.query.userId)
            .then((result) => {
                if(result[0][0]["emailVerified"]===0){
                    res.send({success: false});
                }
                else
                    res.send({success: true});
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({ success: false, error:'Bad request' });
            });
});

app.post('/user/confirmUserEmail', auth, (req,res) => {
    console.log('send email now!');
    if(res.locals.result.success == true){
        Query.setEmailVerification(res.locals.result.userId)
                .then(() => {
                    res.send( { success: true } );                
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).json({ success: false, error:'Bad request' });
                });
    }
});

app.post('/user/reset', hashedFun, (req,res)=>{
    if(res.locals.hashed.res == true){
        Query.reset(req.headers.username,res.locals.hashed.resultPass)
                .then(()=>{
                    res.send({success: true});
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).json({success: false, error:'Bad request'});
                });
    } 
});

app.post('/admin/signup', hashedFun, (req,res) => {
    if(res.locals.hashed.res){
        Query.adminSignup(res.locals.hashed.resultPass, req.headers.email)
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

app.post('/admin/login', hashCompare, (req,res) => {
    if(res.locals.result.res){
        Query.adminLogin(req.headers.email,res.locals.result.pass)
            .then((result) => {
                if(result[0][0]["count(*)"]!==1){
                    res.send({success: false});
                }
                else{
                    Query.getAdminId(req.headers.email)
                            .then( id => {
                                token=jwt.sign({ email: req.headers.email, adminId: id[0][0]["id"] }, config.get('jwtPrivateKey'));
                                res.send({success: true, jwt: token});
                            })
                            .catch(err => res.status(500).send({ success: false, error: 'Internal error'}));                    
                }
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({ success: false, error:'Bad request' });
            });
    }
    else {
        console.log('Failed to generate password');
        res.send({ success: false, error: res.locals.result.err });
    }
});

/*

        User details

*/

app.get('/user/getUserDetails', auth, (req,res) => {    
    if(res.locals.result.success == true){
        Query.getUserDetails(res.locals.result.userId)
            .then(arr => {
                let dob=arr[0][0]["DOB"].toString().substring(4,15);
                res.send({
                    success: true, 
                    id: arr[0][0]["id"],
                    balance: arr[0][0]["balance"],
                    emailVerified: arr[0][0]["emailVerified"],
                    kycVerified: arr[0][0]["kysVerified"],
                    address: arr[0][0]["address"],
                    email: arr[0][0]["email"],
                    fullname: arr[0][0]["fullname"],
                    mobile: arr[0][0]["mobile"],
                    DOB: dob,
                    nationality: arr[0][0]["nationality"],
                    lastlogin: arr[0][0]["lastLogin"],
                    tokenId: arr[0][0]["tokenId"]
                });
            })
            .catch(err => {
                console.log(err);
                res.status(400).send({success: false});
            });
    }
});


/*
app.post('/user/setBalance', auth, (req,res) => {

    // after settingup admin
})


app.post('/user/send-email', emailsender, (req,res) =>{
    console.log('Works');
});



/*
app.get('/user/createConfirmationLink', (req,res)=>{
    // req.headers.userId
    Query.createConfirmation(req.headers.userId)
            .then(()=>{
                res.status(308).redidrect('/user/send-email');
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({success: false, error: 'Bad request'});
            });
});

app.post('/user/createConfirmationLink', (req,res) => {
    Query.setConfirmation(req.headers.userId)
            .then(()=>{
                res.send({success: true});
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({success: false, error: 'Bad request'});
            });
});
*/

app.listen(3005);