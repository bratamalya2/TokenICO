const db=require('./database.js');

class Query{
    login(email,pass){
        return db.execute(`select count(*) from dbs.users where strcmp(email,"${email}")=0 and strcmp(pass,"${pass}")=0;`);
    }
    updateLastLogin(email,dtime){
        return db.execute(`update dbs.users set lastLogin="${dtime}" where email="${email}";`);
    }
    adminLogin(email,pass){
        return db.execute(`select count(*) from dbs.admin where strcmp(email,"${email}")=0 and strcmp(pass,"${pass}")=0;`);
    }
    signup(pass,fname,dob,email,mobile,nationality,tokenId){
        return db.execute(`insert into dbs.users(email,fullname,mobile,DOB,nationality,pass,tokenId) 
        values("${email}","${fname}","${mobile}","${dob}","${nationality}","${pass}","${tokenId}");`);
    }
    adminSignup(pass,email){
        return db.execute(`insert into dbs.admin(pass,email) values("${pass}","${email}");`);
    }
    getAdminId(email){
        return db.execute(`select adminId from dbs.admin where email="${email}";`);
    }
    getHashedPassword(email,isAdmin){
        if(isAdmin == 'true')
            return db.execute(`select pass from dbs.admin where email="${email}";`);
        else
            return db.execute(`select pass from dbs.users where email="${email}";`);
    }
    checkUserExists(email){
        return db.execute(`select count(*) from dbs.users where email="${email}";`);
    }
    checkAdminExists(email){
        return db.execute(`select count(*) from dbs.admin where email="${email}";`);
    }
    isEmailVerified(email){
        return db.execute(`select emailVerified from dbs.users where email="${email}";`);
    }
    reset(email,pass){
        return db.execute(`update dbs.users set pass="${pass}" where email="${email}";`);
    }
    getUserIdTokenId(email){
        return db.execute(`select id,tokenId from dbs.users where email="${email}";`);
    }
    createConfirmation(userId){
        return db.execute(`insert into dbs.confirmations(id) values("${userId}");`);
    }
    setEmailVerification(userId){
        return db.execute(`update dbs.users set emailVerified="1" where id="${userId}";`);
    }
    setUserBalance(userId, balance){
        return db.execute(`update dbs.users set balance="${balance}" where id="${userId}";`);
    }
    getUserDetails(userId){
        return db.execute(`select * from dbs.users where id="${userId}";`);
    }
    addToken(name, symbol, decimalMin, decimalMax, kycBeforePurchase, adminId){
        return db.execute(`insert into dbs.token(name,symbol,decimalMin,decimalMax,kycBeforePurchase,adminId) values ("${name}","${symbol}","${decimalMin}","${decimalMax}","${kycBeforePurchase}","${adminId}") ;`);
    }
    createTxn(amt,from,to,type,timestamp,status,tokenId){
        return db.execute(`insert into dbs.txn(tokensamt,fromAddress,toAddress,txnType,txnTimestamp,txnStatus,tokenId) 
        values("${amt}","${from}","${to}","${type}","${timestamp}","${status}","${tokenId}");`);
    }
    getLatestTxnId(){
        return db.execute(`select no from dbs.txn order by no desc;`);
    }
    confirmTxn(txnId){
        return db.execute(`update dbs.txn set txnStatus="Confirmed" where no="${txnId}";`);
    }
    updateUserBalance(amt,userId){
        return db.execute(`update dbs.users set balance="${amt}" where userId="${userId}";`);
    }
    getLatestTxnUser(addr){
        return db.execute(`select * from dbs.txn where fromAddress="${addr}" or toAddress="${addr}" order by no desc;`);
    }
    getLatestTxnAdmin(){
        return db.execute(`select * from dbs.txn order by no desc;`);
    }
    submitKyc(email,userId,docType,docLink,timestamp,status){
        return db.execute(`insert into dbs.kyc(username,id,docType,docLink,submittedTimestamp,status) 
        values("${email}","${userId}","${docType}","${docLink}","${timestamp}","${status}");`);
    }
    getKyc(){
        return db.execute(`select * from dbs.kyc order by submittedTimestamp desc`);
    }
    createTokenStage(tokenId,tokenIssued,endTimestamp,softCap,hardCap,stageName,startTimestamp,baseBonus,basePrice,minTxn,maxTxn){
        return db.execute(`insert into dbs.tokensales(tokenId,tokenIssued,endTimestamp,softCap,hardCap,stageName,startTimestamp,baseBonus,basePrice,minTxn,maxTxn) 
        values ("${tokenId}","${tokenIssued}","${endTimestamp}","${softCap}","${hardCap}","${stageName}","${startTimestamp}","${baseBonus}","${basePrice}","${minTxn}","${maxTxn}");`);
    }
    getTokenStage(tokenId){
        return db.execute(`select * from dbs.tokensales where tokenId="${tokenId}";`);
    }
}

module.exports=new Query();