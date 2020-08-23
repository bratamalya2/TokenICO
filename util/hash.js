const bcrypt=require('bcrypt');
class Hash{
    async hashFun(x){
        console.log(x);
        bcrypt.genSalt(15, function(err, salt) {
            bcrypt.hash(x, salt, function(err, hash) {
                if(err){
                    return false;
                }
                else{
                    return hash;
                }
            });
        });
    }
}



module.exports=Hash;