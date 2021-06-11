export const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
 export const admin = require('firebase-admin');
 

 const ipInfo = require("ipinfo");
 //run npm install -g ipinfo
 //npm install --save ipinfo

export class Constant{
  static  COL_registerUsersData:String="registerUsersData";
  static COL_scannedQR:String="scannedQR";
  static COL_spclQR:String="specialQRcodes";
  static URL_firestore:String="https://firebasestorage.googleapis.com/v0/b/mahjong-c2571.appspot.com/o/";
  static FOL_image:String="combinationImages%2F";
  static FOL_video:String="combinationAni%2F";
  static FOLIMAGE_ACCESS:String="?alt=media";
  static FOLVID_ACCESS:String="?alt=media";
  static RANKS : number[]= [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
  static RANKS_REVERSE : number[]= [21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1];
  static scores: number[]= [ /*1*/300, 300,900,
    /*4*/900,900,1200,  
    /*7*/1500,1800,2100,
    /*10*/2400,3000,3000,
    /*13*/3000,3900,3900,
    /*16*/8000,8000,8000,
    /*19*/8000,8000,8000
  ];
  static async saveLocatocation( ipAddress: string, userName:string){
    try{
    console.log(ipAddress);
    ipInfo(ipAddress, async (err:any, cLoc:any) => {
      console.log(err || cLoc);
      if(!err ){
        try{
          const db = admin.firestore();
          var userref = db.collection(Constant.COL_registerUsersData).doc(userName);
         await userref.update({
            location: cLoc
          });
        }catch(err){
            console.error("error while saving location"+userName)
          }
        }
     
  });
    return;
}catch(err){
  console.error("occurred while getting location"+err);
}
  }

}


 var serviceAccount = require("../keys/admin.json");
 admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://vitawater-9b375-default-rtdb.firebaseio.com"
});

//admin.initializeApp();