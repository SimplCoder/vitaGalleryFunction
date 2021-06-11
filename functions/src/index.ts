import { Score, scoreFunction } from "./userScore";
import { QrcodeVal } from "./qrCodeValidation";
import{ RankingFunction } from "./ranking";
//import { RankingFunction } from "./ranking";
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import{admin,functions,Constant} from "./config";
import { UserHistoryFunctions } from "./userHistoryScore";
import { ReportFunction } from "./report";
const cors = require("cors")
const express = require("express")
//const json2csv = require("json2csv").parse;
const { Parser } = require('json2csv');
const bodyParser = require("body-parser");
const request = require("request");
//npm install -g json2csv
//npm install --save request request-promise
/* Express with CORS */
const app = express()

 const authenticate = async (req:any, res:any, next:any) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthorized');
    return;
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch(e) {
    res.status(403).send('Unauthorized');
    return;
  }
};

//app.use(cors({ origin: true })); 

app.use(cors({ origin: true }));
app.use( authenticate);
app.get("*", async (req:any, res:any) => {
      try{
        //console.log(req.user);
        const userName: string= req.user.user_id;
       
        console.error(req.query.qrcode);
        let original:string = req.query.qrcode;
        console.log(original);
        const db = admin.firestore();
        var userref = db.collection(Constant.COL_registerUsersData).doc(userName);
        let userDoc= await userref.get();
        if(!userDoc.exists){
          res.status(500).send("user is invalid ");
          return; 
        }

        const spclQRRef=  db.collection(Constant.COL_spclQR).doc("specialCode");
          let docSnapshotS= await  spclQRRef.get();
          let specialCodes: string[]=[];
          if (!docSnapshotS.exists) {
           await  spclQRRef.set({}); 
          }else{
            specialCodes= docSnapshotS.data().qrcodes;
          }
        console.log("spcl qcode"+specialCodes);
        const isSpclCode=  specialCodes.includes(original);
        console.log("is spcl" +isSpclCode);
        let scorePrev :number = userDoc.data().score  ? userDoc.data().score:0;
        console.log(userName+"userDoc.score"+userDoc.data().score);
        console.log(userName+"scorePrev"+scorePrev)
        Constant.saveLocatocation(req.headers['x-forwarded-for'],userName).catch(() => 'obligatory catch')
        if( QrcodeVal.validateQRCode(original)===true || isSpclCode){
          if(isSpclCode){
            let scannedQR1 = db.collection(Constant.COL_scannedQR).doc(userName);
            let docSnapshot2= await  scannedQR1.get();
            let userCodes: string[]=[];

            if (!docSnapshot2.exists) {
            // await  spclQRRef.set({}); 
            }else if( docSnapshot2.data().qrcodes){
              userCodes= docSnapshot2.data().qrcodes;
            }
          console.log("existing qcode"+userCodes);
          const isScannedAlready=  userCodes.includes(original);
            if (isScannedAlready) {
              res.status(500).send("QR code is already scanned 二維碼已經被用過了，請重掃新的二維碼");
            return;
            }

          }else{
          let scannedQR1 = db.collection(Constant.COL_scannedQR);
          console.log(original);
          let previousSc=  scannedQR1.where('qrcodes', 'array-contains', original)
          let  previousScn=await  previousSc.get();
          console.log("used previously",previousScn._size);
          if (previousScn._size>0) {
            res.status(500).send("QR code is already scanned 二維碼已經被用過了，請重掃新的二維碼");
          return;
          }
        }
          const scoreCard : Score=  getScoreObjects(userName);
          const scannedQRRef=  db.collection(Constant.COL_scannedQR).doc(userName);
          let docSnapshot= await  scannedQRRef.get();
          let userPrevious=null;
          if (!docSnapshot.exists) {
           await  scannedQRRef.set({}); 
          }else{
            userPrevious= docSnapshot.data().qrcodes;
          }
          await scannedQRRef.update({
            scores:  admin.firestore.FieldValue.arrayUnion(
              {
                "userName":userName, "qrCode": original,"scoreRank":scoreCard.scoreRank,"createdOm" :new Date()
              } )
              , qrcodes:  admin.firestore.FieldValue.arrayUnion(original)
            });
          let totalScore:number=scorePrev+scoreCard.score;
          if(isSpclCode){
            await userref.update({
              score: totalScore, specialCodes:  admin.firestore.FieldValue.arrayUnion(
                {
                   "qrCode": original,"createdOn" :new Date().toISOString()
                } )
              });
            
          }else{
          await userref.update({
            score: totalScore
            });
          }
            res.status(200).send({
             "scoreCard":scoreCard, "totalScore":totalScore,"prevScore":scorePrev,"qrCodes":userPrevious
            });
         return;
        }
       
          res.status(500).send("QR code is invalid 二維碼已失效");
          return;
      }catch(error){
        console.log(error);
        res.status(500).send(error);
        return;
      }
    });

    const topScorers = express()
    topScorers.use(cors({ origin: true }))
    //topScorers.use(authenticate);
    topScorers.get("*", async (req:any, res:any) => {
      try{
        const userName: string= req.query.uid;
      let data =await RankingFunction.getRankingDetails(userName);
      res.status(200).send(data);
      return;   
      }catch(error){
        console.error(error);
        res.status(500).send(error);
      }
    });


    exports.ranking =  functions.https.onRequest( async (req:any, res:any) => {
      try{
        const db = admin.firestore();
        var userref = db.collection(Constant.COL_registerUsersData);
        const snap = await userref.orderBy('score', 'desc').get();
        let topuser: Array<any> = new Array<any>();
        snap.forEach(function (doc: any) {
          console.log(doc.id, " => ", doc.data());  
          topuser.push(doc.data());
        });
        res.status(200).send(topuser); 
      return;   
      }catch(error){
        console.error(error);
        res.status(500).send(error);
        return;
      }
    });
  
    const userHistory = express()
    userHistory.use(cors({ origin: true }));
    userHistory.use(authenticate);
    userHistory.get("*", async (req:any, res:any) => {
    console.log("userHistory");
    try{ 
      const userId: string= req.user.user_id;
     let countData= await UserHistoryFunctions.getUserCards(userId);
     let score= await scoreFunction.getUserTotalScore(userId);
     res.status(200).send({
      "countData":countData, "totalScore":score
     });
    }catch(error){
      console.error(error);
      res.status(500).send(error);
    }
     
    });


    

    const userReport = express()
    userReport.use(cors({ origin: true }));
    userReport.get("*", async (req:any, res:any) => {
      const fields = ['ranking', 'name', 'score','emailId','mobileNo','address','locCountry','locState','locCity'];
      // You should you how to prepare an object
      // It could be anything that you like from your collections for example.
      
      const data= await ReportFunction.getRecords();
      // Return JSON to screen
    //  res.status(200).json(report);
    
      // If you want to download a CSV file, you need to convert the object to CSV format
      // Please read this for other usages of json2csv - https://github.com/zemirco/json2csv
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(data);
      res.setHeader(
        "Content-disposition",
        "attachment; filename=report.csv"
      )
      res.set("Content-Type", "text/csv")
      res.status(200).send(csv)
    
    })
  

    function getScoreObjects(userName:string){
    let scoreCard:Score= scoreFunction.getUserScore(scoreFunction.randomWithProbability()); 
  return scoreCard;
  } 
  const userAddtoHomeCredit = express()
  userAddtoHomeCredit.use(cors({ origin: true }));
  userAddtoHomeCredit.use( authenticate);
  userAddtoHomeCredit.get("*", async (req:any, res:any) => {
    try{
      //console.log(req.user);
      const userName: string= req.user.user_id;
     
      
      const db = admin.firestore();
      var userref = db.collection(Constant.COL_registerUsersData).doc(userName);
      let userDoc= await userref.get();
      if(!userDoc.exists){
        res.status(500).send("user is invalid ");
        return; 
      }
      if( userDoc.data().addedToHome==0 ){
      let scorePrev :number = userDoc.data().score  ? userDoc.data().score:0;
      let totalScore:number=scorePrev+1000;
        await userref.update({
          score: totalScore,
          addedToHome:1
          });
          res.status(200).send({
           "msg":"You have earned 1000 points", "new":"Y","totalScore":totalScore
          });
          return;
        }
       
        res.status(200).send({"new":"N"});
        return;
    }catch(error){
      console.log(error);
      res.status(500).send(error);
      return;
    }
  });


  const getUserStatus = express()
  getUserStatus.use(cors({ origin: true }));
  getUserStatus.use( authenticate);
  getUserStatus.get("*", async (req:any, res:any) => {
    var showAddToHomePrompt=false;
    var showAddedHomeSuccess =false;
    try{
      //console.log(req.user);
      const userName: string= req.user.user_id;
      const db = admin.firestore();
      var userref = db.collection(Constant.COL_registerUsersData).doc(userName);
      let userDoc= await userref.get();
      if(!userDoc.exists){
        res.status(500).send("user is invalid ");
        return; 
      }
      
      if(userDoc.data().addedToHome ==0 || userDoc.data().addedToHome ==1){
        showAddToHomePrompt=false
        }else{
          showAddToHomePrompt=true
          userref.update({
            addedToHome:0
            });
        }
        console.log(userDoc.data().addedToHome && userDoc.data().addedToHome!==1);
        console.log(userDoc.data().addedToHome!==1);
        console.log(userDoc.data().addedToHome==0);
        if(userDoc.data().addedToHome==0 ){
          showAddedHomeSuccess=true;
        }
        res.status(200).send({
          "showAddToHomePrompt":showAddToHomePrompt, "showAddedHomeSuccess":showAddedHomeSuccess
         });

        return;
    }catch(error){
      console.log(error);
      res.status(200).send({
        "showAddToHomePrompt":false, "showAddedHomeSuccess":false,"error":"occurred"
       });
      return;
    }
  });


  const allUserReport = express()
  allUserReport.use(cors({ origin: true }));
  allUserReport.get("*", async (req:any, res:any) => {
    const fields = ['ranking', 'name', 'score','emailId','mobileNo','postalCode','address','locCountry','locState','locCity','specialCodes'];
    // You should you how to prepare an object
    // It could be anything that you like from your collections for example.
    
    const data= await ReportFunction.getUserRecords();
    // Return JSON to screen
  //  res.status(200).json(report);
  
    // If you want to download a CSV file, you need to convert the object to CSV format
    // Please read this for other usages of json2csv - https://github.com/zemirco/json2csv
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);
    res.setHeader(
      "Content-disposition",
      "attachment; filename=report.csv"
    )
    res.set("Content-Type", "text/csv")
    res.status(200).send(csv)
  
  })

  const qrCodeScannReport = express()
  qrCodeScannReport.use(cors({ origin: true }));
  qrCodeScannReport.get("*", async (req:any, res:any) => {
    const fields = [ 'name','emailId','qrCode','scanScore','scannedOn','mobileNo','postalCode','address'];
    // You should you how to prepare an object
    // It could be anything that you like from your collections for example.
    
    const data= await ReportFunction.getUserQRcode(false);
    // Return JSON to screen
  //  res.status(200).json(report);
  
    // If you want to download a CSV file, you need to convert the object to CSV format
    // Please read this for other usages of json2csv - https://github.com/zemirco/json2csv
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);
    res.setHeader(
      "Content-disposition",
      "attachment; filename=report.csv"
    )
    res.set("Content-Type", "text/csv")
    res.status(200).send(csv)
  
  })

  const spclQrCodeScannReport = express()
  spclQrCodeScannReport.use(cors({ origin: true }));
  spclQrCodeScannReport.get("*", async (req:any, res:any) => {
    const fields = [ 'name','emailId','qrCode','scanScore','scannedOn','mobileNo','postalCode','address'];
    // You should you how to prepare an object
    // It could be anything that you like from your collections for example.
    
    const data= await ReportFunction.getUserQRcode(true);
    // Return JSON to screen
  //  res.status(200).json(report);
  
    // If you want to download a CSV file, you need to convert the object to CSV format
    // Please read this for other usages of json2csv - https://github.com/zemirco/json2csv
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);
    res.setHeader(
      "Content-disposition",
      "attachment; filename=report.csv"
    )
    res.set("Content-Type", "text/csv")
    res.status(200).send(csv)
  
  })


  const userSaveScore = express()
  userSaveScore.use(cors({ origin: true }));
  //userSaveScore.use( authenticate);
  userSaveScore.get("*", async (req:any, res:any) => {
    try{
      //console.log(req.user);
      const userName: string= req.query.uid;
      let score :number =req.query.score;
      console.log(userName);
      const db = admin.firestore();
      var userref = db.collection(Constant.COL_registerUsersData).doc(userName);
      let userDoc= await userref.get();
      console.log("user got");
      if(!userDoc.exists){
        res.status(500).send("user is invalid ");
        return; 
      }

      let scorePrev :number = userDoc.data().score  ? userDoc.data().score:0;
      let totalScore:number=scorePrev> score ? scorePrev:score;
        await userref.update({
          score: totalScore
          });
          res.status(200).send({
           "msg":"you scored save"
          });
          return;
          console.log("user saved");
    }catch(error){
      console.log(error);
      res.status(500).send(error);
      return;
    }
  });

  const token_validateMethod = express()
  token_validateMethod.use(cors({ origin: true }));
  token_validateMethod.use(bodyParser.json());
  token_validateMethod.use(bodyParser.urlencoded({ extended: true }));
  //userSaveScore.use( authenticate);
  token_validateMethod.post("*", async (req:any, res:any) => {
         
  let token = req.body.recaptcha;
  const secretKey = "6Ld2mLQaAAAAAP6RPVyK7VIuSPNHgc-QIX_Gmd4u"; //the secret key from your google admin console;
  
  //token validation url is URL: https://www.google.com/recaptcha/api/siteverify 
  // METHOD used is: POST
  
  const url =  `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}&remoteip=${req.connection.remoteAddress}`
   
  //note that remoteip is the users ip address and it is optional
  // in node req.connection.remoteAddress gives the users ip address
  
  if(token === null || token === undefined){
    res.status(201).send({success: false, message: "Token is empty or invalid"})
    return console.log("token empty");
  }
  
  request(url, function(err:any, response:any, body:any){
    //the body is the data that contains success message
    body = JSON.parse(body);
    
    //check if the validation failed
    if(body.success !== undefined && !body.success){
         res.send({success: false, 'message': "recaptcha failed"});
         return console.log("failed")
     }
    
    //if passed response success message to client
     res.send({"success": true, 'message': "recaptcha passed"});
    
  })
  });



  //const scanQRScodeApi = functions.https.onRequest(app);
  const topScorersAPi = functions.https.onRequest(topScorers);
 // const userHistoryApi = functions.https.onRequest(userHistory);
 // const userReportApi = functions.runWith({ memory: '512MB', timeoutSeconds: 540}).https.onRequest(userReport);
  //const userAddToHomeApi = functions.https.onRequest(userAddtoHomeCredit);
 // const getUserStatusApi = functions.https.onRequest(getUserStatus);
 // const allUserReportApi = functions.runWith({ memory: '512MB', timeoutSeconds: 540}).https.onRequest(allUserReport);
 // const qrCodeScannReportApi = functions.runWith({ memory: '512MB', timeoutSeconds: 540}).https.onRequest(qrCodeScannReport);
  //const spclQrCodeScannReportApi = functions.runWith({ memory: '512MB', timeoutSeconds: 540}).https.onRequest(spclQrCodeScannReport);
  const saveScore = functions.https.onRequest(userSaveScore);
  const token_validate = functions.https.onRequest(token_validateMethod);
  module.exports = {
    saveScore,topScorersAPi,token_validate //scanQRScodeApi,topScorersAPi,userHistoryApi,userReportApi,userAddToHomeApi,getUserStatusApi,allUserReportApi,qrCodeScannReportApi,spclQrCodeScannReportApi
  }

  


