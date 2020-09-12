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

const port = process.env.PORT || 3005;
const app=express();

app.use(cors());
app.use(helmet());
//let token;

/*
        SignUp, Login APIs
*/

app.post('/user/signup', hashedFun, (req,res)=>{
    if(res.locals.hashed.res){
        Query.signup(req.headers.email,res.locals.hashed.resultPass,req.headers.fname)
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

app.post('/user/updateProfile', auth, (req,res) => {    
    // (email,fname,dob,mobile,nationality,tokenId)
    if(res.locals.result.success == true)
        Query.updateUserDetails(res.locals.result.email, req.headers.fname, req.headers.dob, req.headers.mobile,
            req.headers.nationality, req.headers.tokenid)
                .then( () => res.send({ success: true, error: 'none' }))   
                .catch( err => res.status(400).send({ success: false, error: err }));
    else
            res.status(400).send({ success: false, error: 'Invalid token'});
});

app.post('/user/login', hashCompare, (req,res)=>{
    if(res.locals.result.res){
        Query.login(req.headers.email,res.locals.result.pass)
            .then((result) => {
                if(result[0][0]["count(*)"]!==1){
                    res.send({success: false});
                }
                else{
                    Query.getUserIdTokenId(req.headers.email)
                            .then( id_arr => {
                                token=jwt.sign({ email: req.headers.email, userId: id_arr[0][0]["id"], tokenId: id_arr[0][0]["tokenId"] }, config.get('jwtPrivateKey'));
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
    let x;
    if(res.locals.result.success == true)   
        x=res.locals.result.email;
    else 
        x=req.headers.email;
    Query.isEmailVerified(x)
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

app.post('/user/confirmUserEmail/1', auth, emailsender, (req,res) => {
    console.log(res.locals.result)
    if(res.locals.result.success == true){
        if(res.locals.result.resultEmail.success)
            res.send( { success: true, error: 'none' } );                
        else
            res.status(500).send({ success: false, error: 'Could not send email' });
    }
    else{
        res.status(400).send({ success: false, error: 'Invalid token' });
    }
});

app.get('/user/confirmUserEmail/2', (req,res) => {
    console.log(req);
    Query.setEmailVerification(req.query.id)
        .then(() => res.send({ success: true, error: 'none'}))
        .catch(err => { 
            console.log(err);
            res.status(400).send({ sucess: false, error: err });
        });
})

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
        Query.adminSignup(res.locals.hashed.resultPass, req.headers.email, req.headers.fname)
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
                                Query.getAdminName(req.headers.email)
                                        .then( fname => {
                                            token=jwt.sign({ email: req.headers.email, fname: fname[0][0]["fullname"], adminId: id[0][0]["adminId"] }, config.get('jwtPrivateKey'));
                                            res.send({success: true, jwt: token});
                                        })
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

app.get('/admin/getAdminName', adminAuth, (req,res) => {
    if(res.locals.result.success == true)
        res.send({ success: true, adminName: res.locals.result.fname});
    else
        res.status(400).send({ success: false, error: 'Invalid admin credentials!'});
});

/*

        User details

*/

app.get('/user/getUserDetails', auth, (req,res) => {    
    if(res.locals.result.success == true){
        Query.getUserDetails(res.locals.result.userId)
            .then(arr => {
                let dob;
                console.log(arr[0]); 
                if(arr[0][0]["DOB"])
                {
                    dob=arr[0][0]["DOB"].toString().substring(4,15);
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
                }
                else{
                    res.send({
                        sucess: true,
                        id: arr[0][0]["id"],
                        balance: arr[0][0]["balance"],
                        emailVerified: arr[0][0]["emailVerified"],
                        kycVerified: arr[0][0]["kycVerified"],
                        email: arr[0][0]["email"],
                        fullname: arr[0][0]["fullname"]
                    });
                }
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
                        req.headers.timestamp,req.headers.status,req.headers.tokenid,req.headers.payfrom,res.locals.result.userId)
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

app.post('/admin/cancelTxn', adminAuth, (req,res) =>{
    if(res.locals.result.success == true){
        Query.cancelTxn(req.headers.txnid)
        .then(() => res.send( { success: true, error:'none' }))
        .catch(err => res.status(500).send( { success: false, error: err} ));
}
else
    res.status(400).send('Invalid admin credentials!');
});

// get Transactions

app.get('/user/getTransactions', auth, (req,res) => {
    if(res.locals.result.success == true){
        Query.getLatestTxnUser(res.locals.result.userId)
                .then(arr => { 
                    console.log(arr[0]);  
                    res.send({success: true, res: arr[0]});
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).send({success: false, error: err});            
                });
    }
    else
        res.status(400).send({ success: false, error: 'Invalid user' });
});

app.get('/admin/getTransactions', adminAuth, (req,res) => {
    Query.getLatestTxnAdmin()
        .then((arr) => { 
            res.send({ success: true, res: arr[0] });
        })
        .catch( err => { 
            console.log(err);
            res.status(400).send({ success: false, error: err });
        });
});

//get users

app.get('/admin/getUsers', adminAuth, (req,res)=>{
    if(res.locals.result.success == true){
        Query.getUserDetailsForAdmin(res.locals.result.adminId)
            .then(arr2 => { console.log(arr2); })
            .then(arr =>{
                let x,y;
                console.log(arr);
                if(arr["fullname"].length>0)
                    x=arr["fullname"];
                else
                    x='';
                if(arr["lastLogin"].length>0)
                    y=arr["lastLogin"];
                else
                    y='';
                
                return res.send({ 
                    user: x,
                    email: arr["email"],
                    tokens: arr["balance"],
                    emailVerified: arr["emailVerified"],
                    kycVerified: arr["kycVerified"],
                    lastLogin: y
                 })})
                .catch( err => console.log(err));
    }
    else
        res.status(400).send({ success: false, error: 'Invalid user' });
});

app.post('/user/addAddress', auth, (req,res)=>{
    if(res.locals.result.success == true){
        Query.submitAddress(req.headers.address,res.locals.result.userId)
            .then( () => res.send({ success: true, error: 'none' }))
            .catch( err => res.send({ success: false, error: err }));
    }
    else
        res.status(400).send( { success: false, error: 'Invalid token' } );
});

app.post('/user/submitKyc', auth, (req,res) => {
    if(res.locals.result.success == true){
        Query.submitKyc(res.locals.result.email,res.locals.result.userId,req.headers.doctype,
                        req.headers.doclink,req.headers.timestamp,req.headers.status)
                    .then(() => res.send( { success: true, error: 'none' } ))
                    .catch( err => res.status(500).send( { success: false, error: err } ));
    }
    else 
        res.status(400).send( { success: false, error: 'Invalid token' } );
});

app.get('/admin/getKyc', adminAuth, (req,res) => {
    if(res.locals.result.success == true){
        Query.getKyc()
                .then((arr) => { res.send({success: true, res: arr[0]})})
                .catch( err => res.status(500).send({ success: false, error: err }));
    }
    else
        res.status(400).send({ success: false, error: 'Invalid admin credentials!' });
});

app.post('/admin/createTokenSale', adminAuth, (req,res) => {
    if(res.locals.result.success == true){
        Query.createTokenStage(req.headers.tokenid,req.headers.tokenissued,req.headers.endtimestamp,req.headers.softcap,
            req.headers.hardcap,req.headers.stagename,req.headers.starttimestamp,req.headers.basebonus,req.headers.baseprice,
            req.headers.mintxn,req.headers.maxtxn)
            .then(() => res.send({ success: true, error: 'none' }))
            .catch(err => res.status(400).send({ success: false, error: err }));
    }
    else{
        res.status(400).send({ success: false, error: 'Invalid admin credentials!'});
    }
});

app.get('/admin/getTokenSaleInfo', adminAuth, (req,res) => {
    if(res.locals.result.success == true){
        Query.getTokenStage(req.headers.tokenid)
            .then((arr) => res.send({ success: true, res: arr[0] }))
            .catch( err => res.status(400).send({ success: false, error: err }));
    }
    else
        res.status(400).send({ success: false, error: 'Invalid admin credentials!'});
});


app.post('/admin/setPaymentMethod', adminAuth, (req,res) => {
    // title,description,ethWalletStatus,bitcoinWalletStatus,ethGasPrice,ethGasLimit,tokenId,adminId
    if(res.locals.result.success == true){
        Query.setPaymentMethod(req.headers.title,req.headers.description,req.headers.ethwalletstatus,req.headers.bitcoinwalletstatus,
            req.headers.ethgasprice,req.headers.ethgaslimit,req.headers.tokenid,res.locals.result.adminId,
            req.headers.ethaddress,req.headers.bitcoinaddress)
                .then(() => { res.send({ success: true, error: 'none'}) })
                .catch( err => res.status(400).send({ success: false, error: err }));
    }
    else
        res.status(400).send({ success: false, error: 'Invalid admin credentials!'});
});

app.post('/admin/setWebSettings', adminAuth, (req,res) => {
    // (url,timeZone,dateFormat,maintenanceMode,adminId,tokenId)
    if(res.locals.result.success == true){
        Query.setWebsiteSettings(req.headers.url,req.headers.timezone,req.headers.dateformat,
            req.headers.maintenancemode,res.locals.result.adminId,req.headers.tokenid)
                .then(() =>  res.send({ success: true, error: 'none' }))
                .catch( err => res.status(400).send({ success: false, error: 'none' }));
    }
    else
        res.status(400).send({ success: false, error: 'Invalid admin credentials!'});
});

/*
app.post('/user/send-email', emailsender, (req,res) =>{
    console.log('Works');
});

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

app.listen(port, () => {
    console.log(`Server running at port `+port);
});