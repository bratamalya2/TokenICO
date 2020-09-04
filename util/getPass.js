const Query = require('./Query');

const getPass = (req,res,next) => {
    Query.getHashedPassword(req.headers.email)
            .then( result => { 
                res.locals.result = {res: true, pass: result[0][0].pass}; 
                next(); 
            })
            .catch( err => { 
                res.locals.result = {res: false}; 
                next(); 
            });
    return;
};

module.exports.getPass = getPass;