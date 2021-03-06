const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const mysql = require("./connection");
const { json } = require("body-parser");
const e = require("express");

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
  let reqIsAdmin = req.body.dropdown
  var searchMsg = 0;
  var isEmailPresent = 0; 
  console.log(reqIsAdmin);

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
              // If Normal User
              if(reqIsAdmin==="participant")
              {
                console.log("Matching Successful for Participant");  
                // Update date and time

                let date_ob = new Date();
                let date =("0" + date_ob.getDate()).slice(-2);
                let month =("0" + (date_ob.getMonth() + 1)).slice(-2);
                let year = date_ob.getFullYear();  
                let hours = date_ob.getHours();
                let minutes =date_ob.getMinutes();
                let seconds =date_ob.getSeconds();  
                let consolidatedDate = year + "-" + month + "-" + date; 
                let consolidatedTime = hours + ":" + minutes + ":" + seconds; 
   
                console.log("date ", consolidatedDate);   
                console.log("time ", consolidatedTime); 
       
                let idQry=`update users set logindate='${consolidatedDate}',logintime='${consolidatedTime}',loginflag='Active' where psno = '${reqPsno}'`;
                mysql.query(idQry,(err,result)=>{
                  if(err)
                  {
                    console.log("DB query error",err); 
                    res.send({ message: "DB Query Error" })
                  } 
                  else 
                  {
                    res.send({ message: "Matching Successful participant", psno: reqPsno });
                  }

                }); 
              } 
              else if(reqIsAdmin==="admin")
              {
                console.log("Matching Successful for Admin");   
                let idQry=`select count(*) as isadmin from admintable where psno='${reqPsno}'`;
                mysql.query(idQry,(err,result)=>{
                  if(err)
                  {
                    console.log("DB query error",err); 
                    res.send({ message: "DB Query Error" })
                  } 
                  else 
                  {
                    console.log(result[0].isadmin);  
                    if(result[0].isadmin == 0)
                    {
                      res.send({ message: "You are not an admin", psno: reqPsno });
                    } 
                    else 
                    {  
                      // update date and time 

                      let date_ob = new Date();
                      let date =("0" + date_ob.getDate()).slice(-2);
                      let month =("0" + (date_ob.getMonth() + 1)).slice(-2);
                      let year = date_ob.getFullYear();  
                      let hours = date_ob.getHours();
                      let minutes =date_ob.getMinutes();
                      let seconds =date_ob.getSeconds();  
                      let consolidatedDate = year + "-" + month + "-" + date; 
                      let consolidatedTime = hours + ":" + minutes + ":" + seconds; 
   
                      console.log("date ", consolidatedDate);   
                      console.log("time ", consolidatedTime);

              
                      let updateQry=`update users set logindate='${consolidatedDate}',logintime='${consolidatedTime}',loginflag='Active' where psno = '${reqPsno}'`;
                      mysql.query(updateQry,(err,result)=>{ 
                        if(err)
                        {
                          console.log("DB query error",err); 
                          res.send({ message: "DB Query Error" });
                        } 
                        else 
                        {
                          res.send({ message: "Matching Successful admin", psno: reqPsno });
                        }
                      });
                    }                   
                  }
                }); 
              }
              
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

// Login Admin in admin Login Page 
app.post("/adminlogin",(req,res)=>{ 

  let reqPsno = req.body.psno;
  let reqPassword = req.body.password; 

  console.log("Inside adminlogin", reqPsno, reqPassword);
  let searchQry=`select * from admintable where psno='${reqPsno}'`; 
  mysql.query(searchQry,(err,result)=>{ 
    if(err)
    {
      console.log(err, "DB Query Error"); 
      res.send({ message: "DB Query Error" });
    } 
    else 
    {
      if(reqPassword===result[0].passwords)
      {
        res.send({ message: "Matching Successful admin", psno: reqPsno });
      } 
      else 
      {
        res.send({ message: "Incorrect Password", psno: reqPsno });
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

//Get Login time of user in User Dashboard Page 

app.get("/getuserlogintime/:psno",(req,res)=>{ 

    let reqPsno = req.params.psno;
    let selectTimeQry=`select logindate,logintime,loginflag from users where psno='${reqPsno}'`;  
    mysql.query(selectTimeQry,(err,result)=>{
      if(err)
      {

      } 
      else 
      {
        console.log("Result in login time", result[0].logindate); 
        res.send({date: result[0].logindate, time: result[0].logintime, loginflag : result[0].loginflag});
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

// Get Pending Items to be Scored in Items page 

app.get("/getpendingitemstobescored/:psno/:eventid",(req,res)=>{
   
  let reqPsno =req.params.psno; 
  let reqEventId =req.params.eventid; 

  console.log("Inside Get pending Items in the backend"); 
  console.log(reqPsno , "event id: ", reqEventId);  
 
  let searchQry=`select count(*) as scoreditems from scores where psno='${reqPsno}' and eventid=${reqEventId}`; 
  mysql.query(searchQry,(err,result)=>{
    if(err)
    {
      console.log("DB Query error", err);  
      res.send({ message: "DB Query Error" });
    } 
    else 
    {
      console.log("Count of pending items to be scored", result[0]); 
      res.send(result[0]);
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
      console.log("DB Query Error",err);
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
            // Calculate score date and time  
            let date_ob = new Date();
            let date =("0" + date_ob.getDate()).slice(-2);
            let month =("0" + (date_ob.getMonth() + 1)).slice(-2);
            let year = date_ob.getFullYear();  
            let hours = date_ob.getHours();
            let minutes =date_ob.getMinutes();
            let seconds =date_ob.getSeconds();  
            let consolidatedDate = year + "-" + month + "-" + date; 
            let consolidatedTime = hours + ":" + minutes + ":" + seconds; 
   
            console.log("date ", consolidatedDate);   
            console.log("time ", consolidatedTime); 

            let insertQry=`insert into scores values('${reqPsno}',${reqScore},${eventid},${reqItemid},'${consolidatedDate}','${consolidatedTime}')`;  
            mysql.query(insertQry,(err,result)=>{ 
              if(err)
              {
                console.log("DB Query Error",err); 
                res.send({ message: "DB Query Error" });
              } 
              else{
                console.log("Data Inserted"); 
                res.send({ message: "Score submitted successfully", "eventid": eventid });
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


// get particular event detail in Event detail page in Admin Dashboard 

app.get("/getparticularadmineventdetail/:eventid",(req,res)=>{ 

  let eventid= req.params.eventid; 
  console.log("Event id in admindashboard: ", eventid); 

  let searchQry =`select * from events where eventid= ${eventid}`; 
  mysql.query(searchQry,(err,result)=>{
    if(err)
    {
      console.log("DB Query Error", err); 
      res.send({ message: "DB Query Error" });
    } 
    else 
    {
      console.log("Result of Particular event", result); 
      res.send(result);
    }
  });
});


// Check event Flag details in event detail page in admin Dashboard 

app.get("/getparticulareventflag/:eventid",(req,res)=>{ 
  
  let eventid= req.params.eventid;   

  let searchQry =`select eventflag from events where eventid= ${eventid}`;
  mysql.query(searchQry,(err,result)=>{

    if(err)
    { 
      console.log("DB Query Error", err); 
      res.send({ message: "DB Query Error" });
    } 
    else 
    {
      console.log("Result in event details for event flag is :",result); 
      res.send(result);
    }
  });


});


// Update event flag as R in events table in Event Detail Page

app.get("/updatestartevent/:eventid",(req,res)=>{ 

  let eventid= req.params.eventid;  

  let updateQry= `update events set eventflag='R' where eventid=${eventid}`;

  mysql.query(updateQry,(err,result)=>{ 

    if(err)
    { 
      console.log("DB Query Error", err); 
      res.send({ message: "DB Query Error" });
    } 
    else 
    {
      console.log("Updated as R successfully");  
      res.send({ message: "Updated as R successfully" });
     
    }

  });

});



// Update event flag as S in events table in Event Detail Page 

app.get("/updatescheduleevent/:eventid",(req,res)=>{  

  let eventid= req.params.eventid; 

  let updateQry= `update events set eventflag='S' where eventid=${eventid}`; 

  mysql.query(updateQry,(err,result)=>{ 

    if(err)
    { 
      console.log("DB Query Error", err); 
      res.send({ message: "DB Query Error" });
    } 
    else 
    {
      console.log("Updated as S successfully");  
      res.send({ message: "Updated as S successfully" });
      
    }

  });

});


// Update event flag as C in events table in Event Detail Page

app.get("/updatecloseevent/:eventid",(req,res)=>{
 
  let eventid= req.params.eventid; 

  let updateQry= `update events set eventflag='C' where eventid=${eventid}`; 

  mysql.query(updateQry,(err,result)=>{
 
    if(err)
    { 
      console.log("DB Query Error", err); 
      res.send({ message: "DB Query Error" });
    } 
    else 
    {
      console.log("Updated as C successfully"); 
      res.send({ message: "Updated as C successfully" });
    }

  });
}); 

// Update date and time in Events table 

app.post("/updatedateandtime/:eventid",(req,res)=>{
  
  let reqEventId=req.params.eventid; 
  let reqDate=req.body.eventdate; 
  let reqStartTime=req.body.starttime; 
  let reqEndTime=req.body.endtime; 

  console.log("Inside update and time method", reqEventId,reqDate,reqStartTime,reqEndTime);  

  let updQry=`update events set eventdate='${reqDate}', starttime='${reqStartTime}', endtime='${reqEndTime}' where eventid=${reqEventId}`;  

  mysql.query(updQry,(err,result)=>{
    if(err)
    {
      console.log("DB Query Error", err); 
      res.send({ message: "DB Query Error" });
    } 
    else 
    { 
      console.log("Updated Date and Time successfully"); 
      res.send({ message: "Updated Date and Time successfully" });
    }

  });
  
  

});


// Calculate average result in result page for normal users 

app.get("/getaverageuserresult/:itemid/:eventid",(req,res)=>{

  let itemid = req.params.itemid;  
  let reqEventId = req.params.eventid;
 
  console.log("Inside User Result method in node js: ")
  let searchQry=`select avg(score) as userscore from scores where psno not in (select psno from panelist where eventid=${reqEventId}) and itemid=${itemid}`;
  
  mysql.query(searchQry,(err,result)=>{ 

    if(err)
    { 
      console.log("DB Query Error", err); 
      res.send({ message: "DB Query Error" });
    } 
    else 
    { 
      console.log(result[0]); 
      res.send(result[0]);
    }

  });

});
 

// Calculate average result in result page for Panelist users

app.get("/getaveragepanelistresult/:itemid/:eventid",(req,res)=>{

  let itemid = req.params.itemid;  
  let reqEventid = req.params.eventid;
 
  console.log("Inside final Result method in node js: " , "Item id", itemid, "Event id", reqEventid);
  let searchQry=`select avg(score) as panelistscore from scores where psno in (select psno from panelist where eventid=${reqEventid}) and itemid=${itemid}`;
  
  mysql.query(searchQry,(err,result)=>{ 

    if(err)
    { 
      console.log("DB Query Error", err); 
      res.send({ message: "DB Query Error" });
    } 
    else 
    { 
      console.log(result[0]); 
      res.send(result[0]);
    }

  });

});

// logout user

app.get("/logoutuser/:psno",(req,res)=>{ 

  let reqPsno = req.params.psno; 
  console.log("Log out in Backend", reqPsno);  

  let date_ob = new Date();
  let date =("0" + date_ob.getDate()).slice(-2);
  let month =("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();  
  let hours = date_ob.getHours();
  let minutes =date_ob.getMinutes();
  let seconds =date_ob.getSeconds();  
  let consolidatedDate = year + "-" + month + "-" + date; 
  let consolidatedTime = hours + ":" + minutes + ":" + seconds; 
   
  console.log("date ", consolidatedDate);   
  console.log("time ", consolidatedTime);   

  let updateQry=`update users set logoutdate='${consolidatedDate}',logouttime='${consolidatedTime}',loginflag='Inactive' where psno = '${reqPsno}'`;
  mysql.query(updateQry,(err,result)=>{ 
    if(err)
    {
      console.log("DB query error",err); 
      res.send({ message: "DB Query Error" });
    } 
    else 
    {
      res.send({ message: "Logged Out Successfully"});
    }
  });
});


// Authenticating if the user is valid 

app.get("/isauthvalid/:psno",(req,res)=>{ 

  let reqPsno= req.params.psno;  

  let srchQry=`select loginflag from users where psno='${reqPsno}'`; 

  mysql.query(srchQry,(err,result)=>{
    if(err)
    {
      console.log("DB query error",err); 
      res.send({ message: "DB Query Error" });
    } 
    else 
    {
      console.log("Result in Auth Guard backend is", result[0].loginflag); 
      res.send({ message: result[0].loginflag });
    }

  });


});






// Server running in port 3000;

app.listen(3000, () => {
  console.log("Listening to port 3000");
});
