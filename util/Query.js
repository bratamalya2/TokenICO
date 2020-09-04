const db=require('./database.js');

class Query{
    login(email,pass){
        return db.execute(`select count(*) from dbs.users where strcmp(email,"${email}")=0 and strcmp(pass,"${pass}")=0;`);
    }
    signup(pass,fname,dob,email,mobile,nationality){
        return db.execute(`insert into dbs.users(email,fullname,mobile,DOB,nationality,pass) 
        values("${email}","${fname}","${mobile}","${dob}","${nationality}","${pass}");`);
    }
    getHashedPassword(email){
        return db.execute(`select pass from dbs.users where email="${email}";`);
    }
    checkUserExists(username){
        return db.execute(`select count(*) from dbs.users where username="${username}";`);
    }
    isEmailVerified(userId){
        return db.execute(`select emailVerified from dbs.users where id="${userId}";`);
    }
    reset(email,pass){
        return db.execute(`update dbs.users set pass="${pass}" where email="${email}";`);
    }
    getUserId(email){
        return db.execute(`select id from dbs.users where email="${email}";`);
    }
    createConfirmation(userId){
        return db.execute(`insert into dbs.confirmations(id) values("${userId}");`);
    }
    setEmailVerification(userId){
        return db.execute(`update dbs.users set emailVerified="1" where id="${userId}";`);
    }
}

module.exports=new Query();