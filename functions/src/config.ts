export const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
 export const admin = require('firebase-admin');
 

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
  static GAME_RACING:string="Racing";
  static GAME_PHOTO:string="Photo";
  static GAME_GOGREEN:string="GoGreen";
  static SCORE_RACING: string="racingScore";
  static SCORE_PHOTO: string="photoScore";
  static SCORE_GOGREEN: string="goGreenScore";
  static SCORE_TOTAL: string="totalScore";
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
    return;
}catch(err){
  console.error("occurred while getting location"+err);
}
  }

}


var serviceAccount = require("../keys/admin.json");
 admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//admin.initializeApp();