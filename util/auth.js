const jwt=require('jsonwebtoken');
const config=require('config'); 

function auth(req,res,next){
    const token=req.headers['x-auth-token'];
    try{
        const decoded=jwt.verify(token,config.get('jwtPrivateKey'));
        res.locals.result={ success: true, err: 'None', email: decoded.email, userId: decoded.userId};
        next();
    }
    catch(e){
        console.log(e);
        res.locals.result={ success: false, err: 'Invalid token' };
        next();
    }
    return;
}

module.exports=auth;