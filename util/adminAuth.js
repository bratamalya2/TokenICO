const jwt=require('jsonwebtoken');
const config=require('config'); 

function auth(req,res,next){
    const token=req.headers['x-auth-token'];
    try{
        const decoded=jwt.verify(token,config.get('jwtPrivateKey'));
        console.log(decoded);
        res.locals.result={ success: true, err: 'None', adminId: decoded.adminId, fname: decoded.fname };
        next();
    }
    catch(e){
        res.locals.result={ success: false, err: 'Invalid token' };
        next();
    }
    return;
}

module.exports=auth;