const db=require('./database.js');

class Query{
    login(email,pass){
        return db.execute(`select count(*) from dbs.users where strcmp(email,"${email}")=0 and strcmp(pass,"${pass}")=0;`);
    }
    adminLogin(email,pass){
        console.log(`Email: ${email} and pass: ${pass}`);
        return db.execute(`select count(*) from dbs.admin where strcmp(email,"${email}")=0 and strcmp(pass,"${pass}")=0;`);
    }
    signup(pass,fname,dob,email,mobile,nationality){
        return db.execute(`insert into dbs.users(email,fullname,mobile,DOB,nationality,pass) 
        values("${email}","${fname}","${mobile}","${dob}","${nationality}","${pass}");`);
    }
    adminSignup(pass,email){
        return db.execute(`insert into dbs.admin(pwd,email) values("${pass}","${email}");`);
    }
    getAdminId(email){
        return db.execute(`select adminId from dbs.admin where email="${email}";`);
    }
    getHashedPassword(email,isAdmin){
        console.log(`Email: ${email} , isAdmin: ${isAdmin}`);
        console.log(typeof isAdmin);
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
    setUserBalance(userId, balance){
        return db.execute(`update dbs.users set balance="${balance}" where id="${userId}";`);
    }
}

module.exports=new Query();