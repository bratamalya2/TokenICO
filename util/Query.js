const db=require('./database.js');

class Query{
    login(username,pass){
        return db.execute(`select count(*) from dbs.users where username="${username}" and pass="${pass}" and emailVerified=1;`);
    }
    signup(username,pass,fname,dob,email){
        return db.execute(`insert into dbs.users(username,pass,fullname,date,mobile,nationality) 
        values("${username}","${pass}","${fname}","${dob}","${email}","${name}","${mobile}","${nationality}");`);
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