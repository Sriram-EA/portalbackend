const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const mysql = require("./connection");

const app = express();

app.use(cors());
app.use(bodyparser.json());

// Register User   for Registeration page

app.post("/createuser", (req, res) => {
  let reqFirstName = req.body.firstName;
  let reqLastName = req.body.lastName;
  let reqEmailId = req.body.emailId; 
  reqEmailId = reqEmailId.toLowerCase();
  let reqPassword = req.body.password;
  console.log("First name", reqFirstName);
  console.log("Last Name", reqLastName);
  console.log("Email Id", reqEmailId);
  console.log("Password", reqPassword); 
  var isEmailPresent = 0;

  // Search if Email Id already exists.

  let searchQry = `select emailid from user`;
  mysql.query(searchQry, (err, result) => {
    console.log(result);
    console.log(reqEmailId);
    console.log(result.length);
    if(err)
    {
      console.log("Db Query Error")
    } 
    else 
    {    
      for (let i = 0; i < result.length; i++) {
        if (result[i].emailid === reqEmailId) {
          isEmailPresent = 1;
          break;
        }
      }

      if (isEmailPresent) {
        // sending message that already user exists
        console.log("Email ID already Exists");
        res.send({ message: "User Already Exists" });
      } else {
        console.log("Email Id not present");
  
        // Inserting the form values into the table
        let qry = `insert into user(firstname,lastname,emailid,passwords) values('${reqFirstName}','${reqLastName}','${reqEmailId}','${reqPassword}')`;
        mysql.query(qry, (err, result) => {
          console.log(result);
          if (err) {
            console.log(err, "Insertion Error");
          } else {
            console.log("User Registered Successfully..");
            res.send({ message: "User Registered Successfully" });
          }
        });
      }

    }
  });
});

// Login User for Login page

app.post("/isemailvalid", (req, res) => {
  console.log("Check if email is valid and exists");
  let reqEmailId = req.body.emailId;
  let reqPassword = req.body.password;
  var searchMsg = 0;
  var isEmailPresent = 0;

  let searchQry = `select emailid from user`;
  mysql.query(searchQry, (err, result) => {
    if (err) {
      console.log(err, "DB Query Error");
    } else {
      console.log(result);
      // If email Id is present
      for (let i = 0; i < result.length; i++) {
        if (result[i].emailid === reqEmailId) {
          isEmailPresent = 1;
          break;
        }
      }
      if (isEmailPresent) {
        console.log("Email Exists so login");
        console.log(reqEmailId, reqPassword);

        // Query to find whether the emailId and password matches.

        let emailPasswordCheckQry = `select emailid,passwords from user`;
        mysql.query(emailPasswordCheckQry, (err, result) => {
          if (err) {
            console.log(err, "Db Query Error");
          } else {
            //console.log(result[0].emailId,result[0].password);
            //console.log(result[1].emailid,result.length);
            for (let i = 0; i < result.length; i++) {
              console.log(
                result[i].emailid,
                reqEmailId,
                result[i].passwords,
                reqPassword
              );
              if (
                result[i].emailid === reqEmailId &&
                result[i].passwords === reqPassword
              ) {
                console.log("matching");
                searchMsg = 1;
                console.log(searchMsg);
                break;
              }
            }
            if (searchMsg) {
              console.log("Matching Successful"); 
              let idQry=`select id from user where emailid = '${reqEmailId}'`;
              mysql.query(idQry,(err,result)=>{
                if(err)
                {
                  console.log("DB query error",err);
                } 
                else 
                {
                  console.log(result[0].id); 
                  res.send({ message: "Matching Successful", id: result[0].id });
                }

              }); 
              
            } else {
              console.log("Incorrect Password");
              res.send({ message: "Incorrect Password" });
            }
          }
        });
      } // If email id is not present
      else {
        console.log("Email doesnot exist so navigate to Registration page");
        res.send({ message: "User Does not exist" });
      }
    }
  });
});


// forgot password method check if email is in DB 

app.post("/checkemailexists", (req, res) => {
    console.log("Check if email is valid and exists");
    let reqEmailId = req.body.emailId; 
    console.log(reqEmailId);  
    var isEmailPresent = 0;

     let searchQry = `select emailid from user`;
     mysql.query(searchQry, (err, result) => {
        if (err) {
            console.log(err, "DB Query Error");
          } else {
            
            // If email Id is present
            for (let i = 0; i < result.length; i++) {
              if (result[i].emailid === reqEmailId) {
                isEmailPresent = 1;
                break;
              }
            } 
            if(isEmailPresent) // If email is present in database
            { 
                console.log("User Exists");
                res.send({message: "User Exists" })
            } 
            else   // If no email exists
            { 
                console.log("User Does not Exist");
                res.send({message: "User Does not Exist" })
            }
        }

     });
      
});


// Update password in forgot password page  

app.post("/updatepassword", (req, res) =>{ 

    let reqEmailId = req.body.emailId;
  let reqPassword = req.body.password; 
  console.log(reqEmailId,reqPassword); 

  let qry = `update user set passwords='${reqPassword}' where emailid='${reqEmailId}'`; 
  mysql.query(qry, (err,result)=>{ 
    if (err) {
        console.log(err, "Error");
      } else { 
          console.log("Password Updated");
        res.send({ message: "Password Updated" });
      }

  });


});


// User Dashboard Get user data

app.get("/getuserdetails/:id", (req, res) => { 
 
  let gId = req.params.id;
  let qry = `select * from user where id = '${gId}'` ; 
  mysql.query(qry, (err,result)=>{

    if(err)
    {
      console.log("DB Query Error"); 
      res.send({ message: "DB Query Error" })
    } 
    else 
    {
      console.log(result); 
      res.send(result);
    }

   });
});























// Server running in port 3000;

app.listen(3000, () => {
  console.log("Listening to port 3000");
});
