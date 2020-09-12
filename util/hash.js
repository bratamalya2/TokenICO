const bcrypt = require('bcrypt');
const Query = require('./Query');

function hashFun(req,res,next){   
    const rounds = 10; 
    bcrypt.genSalt(rounds, (err, salt) => {
        bcrypt.hash(req.headers.pass, salt, (err, hash) => {            
            if(err){
                console.log(err);
                res.locals.hashed={res: false , err: err};
                next();
            }
            else{
                res.locals.hashed=({res: true, resultPass: hash});
                next();
            }   
            return;     
        });
    });
};

function updatePassHashFun(req,res,next){
    const rounds = 10; 
    bcrypt.genSalt(rounds, (err, salt) => {
        bcrypt.hash(req.headers.passOriginal, salt, (err, hash) => {            
            if(err){
                console.log(err);
                res.locals.hashed={res: false , err: err};
                next();
            }
            else{
                res.locals.hashed=({res: true, resultPass1: hash, resultPass2: ''});
                bcrypt.hash(req.headers.passOriginal, salt, (err, hash) => {            
                    if(err){
                        console.log(err);
                        res.locals.hashed={res: false , err: err};
                        next();
                    }
                    else{
                        res.locals.hashed.resultPass2=hash;
                        next();
                    }   
                    return;     
                });
                next();
            }   
            return;     
        });
    });
}

function hashCompare(req,res,next){
    Query.getHashedPassword(req.headers.email,req.headers.isadmin)
            .then( result => { 
                var x=result[0][0]["pass"];
                bcrypt.compare(req.headers.pass, x, function(err, result) {
                    if(result){
                        res.locals.result = {res: true, pass: x}; 
                        next(); 
                    }
                    else{
                        res.locals.result = { res: false, err: 'Invalid credentials'};
                        next();
                    }
                });                
            })
            .catch( err => { 
                res.locals.result = {res: false, err: 'Failed to generate hash'}; 
                next(); 
            });
    return;    
}


module.exports.hashFun = hashFun;
module.exports.hashCompare = hashCompare;
module.exports.updatePassHashFun = updatePassHashFun; 