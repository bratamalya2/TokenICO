const db=require('./database.js');

class Query{
    login(username,pass){
        return db.execute(`select count(*) from dbs.users where username="${username}" and pass="${pass}" and emailVerified=1;`);
    }
    signup(pass,fname,dob,email,mobile,nationality){
        return db.execute(`insert into dbs.users(email,fullname,mobile,DOB,nationality,pass) 
        values("${email}","${fname}","${mobile}","${dob}","${nationality}","${pass}");`);
    }
    checkUserExists(username){
        return db.execute(`select count(*) from dbs.users where username="${username}";`);
    }
    isVerified(username){
        return db.execute(`select emailVerified from dbs.users where username="${username}";`);
    }
    reset(username,pass){
        return db.execute(`update dbs.users set pass="${pass}" where username="${username}";`);
    }
}

module.exports=new Query();