function auth(req,res,next){
    const token=req.headers['x-auth-token'];
    try{
        const decoded=jwt.verify(token,config.get('jwtPrivateKey'));
        res.locals.result={ success: true, err: 'None', adminId: decoded.adminId};
        next();
    }
    catch(e){
        res.locals.result={ success: false, err: 'Invalid token' };
        next();
    }
    return;
}

module.exports=auth;