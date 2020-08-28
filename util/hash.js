const bcrypt=require('bcrypt');
let result={
    res: false,
    resultPass: ''
};
async function hashFun(x){    
    bcrypt.genSalt(12, (err, salt) => {
        bcrypt.hash(x, salt, (err, hash) => {
            if(err){
                console.log(err);
            }
            else{
                result = {res: true, resultPass: hash};
            }
        });
    });
    return result;
}


module.exports.hashFun=hashFun;