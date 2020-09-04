Execution instructions:

        ** Expecting a windows machine **

Postman collection link: https://www.getpostman.com/collections/cf5131897afdab62a1a0

1. Setup mysql (in Legacy mode for development process), the credentials needed can be modified in the util/database.js or you can proceed with the following:-

{
  host: 'localhost' (Need not change it for development),
  user: 'root',
  database: 'dbs'  (For the sake of simplicity, don't change this),
  password: '*****'
}

Just ensure the above details don't conflict with mysql settings

2. Create the appropriate database files using the mysql files

3. To export for production create ENV variables (windows):

    set TokenICO_jwtPrivateKey = <your key>
    set node_env=development&&nodemon index.js
    
4. Execute using Postman collection
    
