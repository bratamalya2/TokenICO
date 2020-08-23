const mysql = require('mysql2');

const pool=mysql.createPool({
    host: 'localhost',
    user:'root',
    database: 'dbs',
    password: 'CUIM123'
});

module.exports=pool.promise();