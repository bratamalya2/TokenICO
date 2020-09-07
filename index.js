const express=require('express');
const helmet = require('helmet');
const config = require('config');
const Hash = require('./util/hash');
const cors = require('cors');
const { readdirSync } = require('fs');
const { SlowBuffer } = require('buffer');

const getPass = require('./util/getPass').getPass;
const jwt=require('jsonwebtoken');
const Query=require('./util/Query.js');
const auth = require('./util/auth');
const adminAuth = require('./util/adminAuth');
const emailsender = require('./util/send-email');

const hashedFun = Hash.hashFun;
const hashCompare = Hash.hashCompare;

const app=express();

app.use(cors());
app.use(helmet());
//let token;

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
    else{
        res.status(400).send({ success: false, error: 'Invalid token' });
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
    let token;
    if(res.locals.result.res){
        Query.adminLogin(req.headers.email,res.locals.result.pass)
            .then((result) => {
                if(result[0][0]["count(*)"]!==1){
                    res.send({success: false});
                }
                else{
                    Query.getAdminId(req.headers.email)
                            .then( id => {
                                token=jwt.sign({ email: req.headers.email, adminId: id[0][0]["adminId"] }, config.get('jwtPrivateKey'));
                                console.log("token: ",token);
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
                    kycVerified: arr[0][0]["kycVerified"],
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
                res.status(400).send({success: false, error: 'User doesnot exist!'});
            });
    }
    else
        res.status(400).send({ success: false, error: 'Invalid token' });
});

/*
    create Transaction
*/

app.post('/admin/addNewToken', adminAuth, (req,res) => {
    console.log(res.locals.result);
    if(res.locals.result.success == true){
        Query.addToken(req.headers.name, req.headers.symbol, req.headers.decimalmin, 
                        req.headers.decimalmax, req.headers.kycbeforepurchase, res.locals.result.adminId)
                .then(() => res.send({ success: true, error: 'None' }))
                .catch( err => res.status(400).send({ success: false, error: err}));
    }
    else 
        res.status(400).send({ success: false, error: 'Invalid token' });
});

app.post('/user/createTxn', auth, (req,res) => {
    console.log('Accept payment and proceed!');
    if(res.locals.result.success == true){
        Query.createTxn(req.headers.amount,req.headers.from,req.headers.to, req.headers.type,
                        req.headers.timestamp,req.headers.status,req.headers.tokenid)
                .then(()=> {
                    Query.getLatestTxnId()
                        .then((x) => res.send({ success: true, txnId: x[0][0]["no"]}))
                        .catch( err => res.status(500).send({ success: false, error: err}));
                })
                .catch(err => { console.log(err); res.status(500).send({ success: false, error: err }) });
    }
    else
        res.status(400).send({ success: false, error: 'Invalid token' });
});

app.post('/admin/confirmTxn', adminAuth, (req,res) => {
    console.log(res.locals.result);
    if(res.locals.result.success == true){
        Query.confirmTxn(req.headers.txnid)
            .then(() => res.send( { success: true, error:'none' }))
            .catch(err => res.status(500).send( { success: false, error: err} ));
    }
    else
        res.status(400).send('Invalid admin credentials!');
});

// get Transactions

app.get('/user/getTransactions', auth, (req,res) => {
    if(res.locals.result.success == true){
        Query.getLatestTxnUser(req.headers.addr)
                .then(arr => { 
                    //console.log(arr[0][0]);  
                    res.send({success: true, res: arr[0][0]});
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).send({success: false, error: err});            
                });
    }
    else
        res.status(400).send({success: false, error: 'Invalid user'});
});

app.get('/admin/getTransactions', adminAuth, (req,res) => {
    Query.getLatestTxnAdmin()
        .then((arr) => { 
            res.send({ success: true, res: arr[0] });
        })
        .catch( err => { 
            console.log(err);
            res.status(400).send( { success: false, error: err } );
        });
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