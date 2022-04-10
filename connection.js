const mysql = require("mysql2");

// database connection

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "EAsri@mysql16",
    database: "project",
    port: 3306,
  });
  
  // check db conn
  
  db.connect((err) => {
    if (err) {
      console.log(err, "db error");
    }
    console.log("db connected...");
  }); 

module.exports=db;