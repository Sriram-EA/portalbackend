const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const mysql = require("./connection");
const { json } = require("body-parser");

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
  let reqPsno = req.body.psno;
  let reqDob = req.body.dob;
  var searchMsg = 0;
  var isEmailPresent = 0;

  let searchQry = `select psno from users`;
  mysql.query(searchQry, (err, result) => {
    if (err) {
      console.log(err, "DB Query Error");
    } else {
      console.log(result);
      // If email Id is present
      for (let i = 0; i < result.length; i++) {
        if (result[i].psno === reqPsno) {
          isEmailPresent = 1;
          break;
        }
      }
      if (isEmailPresent) {
        console.log("Email Exists so login");
        console.log(reqPsno, reqDob);

        // Query to find whether the emailId and password matches.

        let emailPasswordCheckQry = `select psno,dob from users`;
        mysql.query(emailPasswordCheckQry, (err, result) => {
          if (err) {
            console.log(err, "Db Query Error");
          } else {
            //console.log(result[0].emailId,result[0].password);
            //console.log(result[1].emailid,result.length);
            for (let i = 0; i < result.length; i++) {
              console.log(
                result[i].psno,
                reqPsno,
                result[i].dob,
                reqDob
              );
              if (
                result[i].psno === reqPsno &&
                result[i].dob === reqDob
              ) {
                console.log("matching");
                searchMsg = 1;
                console.log(searchMsg);
                break;
              }
            }
            if (searchMsg) {
              console.log("Matching Successful"); 
              let idQry=`select psno from users where psno = '${reqPsno}'`;
              mysql.query(idQry,(err,result)=>{
                if(err)
                {
                  console.log("DB query error",err); 
                  res.send({ message: "DB Query Error" })
                } 
                else 
                {
                  console.log(result[0].psno); 
                  res.send({ message: "Matching Successful", psno: result[0].psno });
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
            res.send({ message: "DB Query Error" })
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
        res.send({ message: "DB Query Error" })
      } else { 
          console.log("Password Updated");
        res.send({ message: "Password Updated" });
      }

  });


});


// User Dashboard Get user data

app.get("/getuserdetails/:psno", (req, res) => { 
 
 

  //  Working with dates
  //  let date_ob = new Date();
  //  let date =("0" + date_ob.getDate()).slice(-2);
  //  let month =("0" + (date_ob.getMonth() + 1)).slice(-2);
  //  let year = date_ob.getFullYear();  
  //  let hours = date_ob.getHours();
  //  let minutes =date_ob.getMinutes();
  //  let seconds =date_ob.getSeconds();  
  //  var consolidatedDate = year + "-" + month + "-" + date; 
  //  var consolidatedTime = hours + ":" + minutes + ":" + seconds; 
   
  //  console.log("date ", consolidatedDate);   
  //  console.log("time ", consolidatedTime);
   
  //  console.log("date ",date,";","month ",month,";","year",year); 
  //  console.log("Hours ",hours,";","Minutes ",minutes,";","Seconds",seconds); 

  //Current date time insertion into db
  //  let datetimeqry=`insert into checkdatetime(eventdate,eventtime) values('${consolidatedDate}', '${consolidatedTime}')`; 
  //  mysql.query(datetimeqry,(err,result)=>
  //  {
  //    if(err)
  //    {
  //      console.log("Date time insertion error",err);
  //    } 
  //    else 
  //    {
  //     console.log("Date time inserted");
  //    }
  //  }); 
   
  // select date from db 
   
  // let datetimeqry =`select eventdate,eventtime from checkdatetime where id=1`; 
  // mysql.query(datetimeqry,(err,result)=>{
 
  //   if(err) 
  //   {
  //     console.log("DB query error", err); 
  //   } 
  //   else 
  //   {
  //     //console.log(result[0].eventdate); 
  //     var dateString = result[0].eventdate.toString(); 
  //     console.log("date from db",dateString); 
  //     console.log("Time from db",result[0].eventtime)
  //   }
  // });
 
  let gPsno = req.params.psno;
  let qry = `select * from users where psno = '${gPsno}'` ;  

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


// Get event details in User Dashboard page 

app.get("/geteventdetails",(req,res)=>{

  let qry= `select * from events`; 
  mysql.query(qry,(err,result)=>{
    if(err)
    {
      console.log("DB query error"); 
      res.send({ message: "DB Query Error" });
    }
    else 
    {
      console.log(result); 
      res.send(result);
    }

  });

}); 

// Get event flag details in User Dashboard page 

app.get("/getstatusflagdetails",(req,res)=>{ 

  let qry= `select eventflag from events`;   
  var running=0; 
  var scheduled=0; 
  var cancelled=0;
  mysql.query(qry,(err,result)=>{
    if(err)
    {
      console.log("Db qeury error");
    } 
    else
    {
      console.log("Event Flag details", result.length);   
      for (let i = 0; i < result.length; i++) {  
        if(result[i].eventflag=="R")
        {
          running=1;
        }  
        if(result[i].eventflag=="S")
        {
          scheduled=1;
        }  
        if(result[i].eventflag=="C")
        {
          cancelled=1;
        } 
      } 
      console.log("Running ", running, "Scheduled ", scheduled, "Cancelled", cancelled); 
      var eventFlagJson ={"running": running, "scheduled":scheduled,"cancelled":cancelled}; 
      res.send(eventFlagJson);
    }
  })

});

// Subscribe the user to subscribed event in subscribeevent table in UserDashboard.
app.post("/subscribeusertoevent",(req,res)=>{
 
  let reqPsno = req.body.psno;
  let reqEventid = req.body.eventid; 
  console.log(reqPsno, reqEventid);   
  var isEventAlreadyExists = 0;
  let selectqry=`select psno,eventid from subscribedevents`;  
  
  mysql.query(selectqry,(err,result)=>{ 
    if(err)
    { 
      console.log("Db Query Error") 
      res.send({ message: "DB Query Error" });

    } 
    else{
      console.log(result.length);   
      for (let i = 0; i < result.length; i++) {  
        if(result[i].psno===reqPsno && result[i].eventid===reqEventid)
        {
            console.log("Already exists"); 
            isEventAlreadyExists=1; 
            break;
        }
      } 
      if(isEventAlreadyExists)
      {
        //Cannot insert , since already subscribed 
        console.log("Event already subscribed by this current user");
        res.send({message: "Event Already Subscribed"});
      } 
      else 
      {
          // Insert into table 
          let qry=`insert into subscribedevents values('${reqPsno}',${reqEventid})`; 
          mysql.query(qry,(err,result)=>{
            if(err)
            {
              console.log("Db query Error",err); 
              res.send({ message: "DB Query Error" });
            }  
            else 
            {
              console.log("Data Inserted"); 
              res.send({message:"Data Inserted"});
            }
          });
      }
    }
  });

});

// get item detail in Item page 

app.get("/getitemdetail/:eventid",(req,res)=>{  
  
  let paramEventid=req.params.eventid;
  let qry=`select * from items where eventid=${paramEventid}`;
  mysql.query(qry,(err,result)=>{
    if(err)
    {
      console.log("Db query error",err); 
      res.send({ message: "DB Query Error" });
    }
    else 
    {
      console.log(result); 
      res.send(result);
    }
  })

}); 

// Get event name in items page

app.get("/geteventname/:eventid",(req,res)=>{
 
  let paramEventid=req.params.eventid;  
  let qry=`select eventname from events where eventid=${paramEventid}`;
  mysql.query(qry,(err,result)=>{  
    if(err)
    {
      console.log("DB query error", err); 
      res.send({ message: "DB Query Error" });
    } 
    else 
    {
      console.log(result); 
      res.send(result);
    }
  });
  

});


// Get if a score is given or not 

app.get("/getscoredetails/:psno",(req,res)=>{
  
  let reqPsno=req.params.psno;
  
  let qry = `select * from scores where psno=${reqPsno}`; 
  mysql.query(qry,(err,result)=>{
    if(err)
    {
      console.log("DB Query error",err);  
      res.send({ message: "DB Query Error" });
    } 
    else 
    {
      console.log("Score Details",result);  
      res.send(result); 

    }
  });

});

// Get particular Item Detail in score Page 

app.get("/getparticularitemdetail/:itemid",(req,res)=>{
 
  console.log("Inside Score page item details retrival method");
  let reqItemid= req.params.itemid; 
  
  let qry=`select * from items where itemid=${reqItemid}`; 
  mysql.query(qry,(err,result)=>{
    if(err)
    {
      console.log("DB Query error",err);  
      res.send({ message: "DB Query Error" });
      
    } 
    else 
    {
      console.log("Item detail", result);
      res.send(result);
    }
  })
})





// Submit score in the Score page 

app.post("/insertscoretodatabase",(req,res)=>{ 

  let reqPsno =req.body.psno; 
  let reqScore = req.body.score;  
  reqScore =Number(reqScore);
  let reqItemid = req.body.itemid;   
  var eventid; 
  let eventFlag;
  console.log(reqPsno,reqScore,reqItemid);

  let qry=`select eventid from items where itemid=${reqItemid}`;
  mysql.query(qry,(err,result)=>{
  
    if(err)
    {
      console.log("DB Query Error");
    } 
    else 
    {
      eventid=(result[0].eventid); 
      console.log(eventid); 
      // Check if the event is running  

      let checkEventRunningQry=`select eventflag from events where eventid=${eventid}`; 
      mysql.query(checkEventRunningQry,(err,result)=>{
        if(err)
        {
          console.log("DB Query error",err);  
          res.send({ message: "DB Query Error" });
        }
        else 
        {
          this.eventFlag=(result[0].eventflag); 
          if(this.eventFlag==="R")
          { 
            // Insert into scores table 
            let insertQry=`insert into scores values('${reqPsno}',${reqScore},${eventid},${reqItemid})`;  
            mysql.query(insertQry,(err,result)=>{ 
              if(err)
              {
                console.log("DB Query Error"); 
                res.send({ message: "DB Query Error" });
              } 
              else{
                console.log("Data Inserted"); 
                res.send({ message: "Score submitted successfully" });
              }

            });
          } 
          else 
          {
              // Send to frontend that event has closed. 
              res.send({ message: "This event has been closed" }); 
          }
        }
      })
      
    }
  });

});

// Check if score already submitted in the Score page
 
app.get("/checkifscorealreadysubmitted/:psno/:itemid",(req,res)=>{
  
  let reqPsno= req.params.psno; 
  let reqItemid= req.params.itemid; 
  console.log("PSno and Item id in Backend: ",reqPsno,reqItemid); 

  let searchQry=`select * from scores where psno='${reqPsno}' and itemid=${reqItemid}`; 
  mysql.query(searchQry,(err,result)=>{
    if(err)
    {   
        console.log("DB Query Error", err); 
        res.send({ message: "DB Query Error" });
    } 
    else{
      console.log("Result of scores table" ,result); 
      res.send(result);
    }
  })

});



















// Server running in port 3000;

app.listen(3000, () => {
  console.log("Listening to port 3000");
});
