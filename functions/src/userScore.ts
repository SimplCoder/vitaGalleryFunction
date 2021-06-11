import{admin, Constant} from "./config";

export class Score {
    score: number;
    cardUrl: String;
    cardVideoUrl : String;
    cardName: String
    scoreRank:number;
    gifUrl:String;
    audUrl:String;
    gifTime:number;
    constructor( score:number, cardUrl: String,cardVideoUrl:String,cardName:String ,scoreRank: number
       , gifUrl:String,audUrl:String,gifTime:number){
        this.score= score;
        this.cardUrl=cardUrl;
        this.cardVideoUrl=cardVideoUrl;
        this.cardName=cardName;
        this.scoreRank=scoreRank;
        this.gifUrl=gifUrl;
        this.audUrl=audUrl;
        this.gifTime=gifTime;
    }
 

}


export class scoreFunction{
 static randomWithProbability() {
  let notRandomNumbers : number[]= [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
  let idx:number = Math.floor(Math.random() * notRandomNumbers.length);
  return notRandomNumbers[idx];
}
static getUserScore( scoreRank:number){
  let scoreInder:number=scoreRank-1;
  let carUrl :String = `${Constant.URL_firestore}${Constant.FOL_image}${scoreRank}.png${Constant.FOLIMAGE_ACCESS}`;
  let cardVideoUrl:String=`${Constant.URL_firestore}${Constant.FOL_video}${scoreRank}.mp4${Constant.FOLVID_ACCESS}`
  let cardGifUrl:String='https://firebasestorage.googleapis.com/v0/b/mahjong-c2571.appspot.com/o/gif%2Fgif1.gif?alt=media';
  let cardMusicUrl:String="https://firebasestorage.googleapis.com/v0/b/mahjong-c2571.appspot.com/o/gif%2F1.mp3?alt=media";
  let cardGifTime:number=5;
  let cardNames: string[] = [ /*1*/ '平糊 Common Hand', /*2*/'三元牌 Three Dragons',
  /*3*/ '對對糊 All Triplets',/*4*/'混一色 Mixed One-Suit',
 /*5*/ '嚦咕嚦咕 Seven Pairs',/*6*/'花幺九 Orphans',/*7*/'小三元Three Little Dragons',
/*8*/'小四喜 Small Four Winds',/*9*/'清一色 Pure One-Suit',/*10*/'大三元 Three Great Dragons',
/*11*/'字一色 All Honor Tiles',/*12*/'清幺九 All Terminals',/*13*/'九子連環 Nine Gates',
/*14*/'十三幺 Thirteen Orphans',/*15*/'大四喜 Big Four Winds',/*16*/'維他奶清一色對對糊  Vitasoy Pure One-Suit',
/*17*/'菊花茶混一色對對糊 Chrysanthemum tea Mixed One-Suit',
/*18*/'VLT 大三元  VLT Big Three Dragons',
/*19*/'嚦咕嚦咕維他奶 Vitasoy Seven Pairs',
/*20*/'四大天王大四喜 Big Four Winds',
/*21*/'維他十三幺 Vita Thirteen Orphans'
]; 
  let scores: number[]= [ /*1*/300, 300,900,
    /*4*/900,900,1200,  
    /*7*/1500,1800,2100,
    /*10*/2400,3000,3000,
    /*13*/3000,3900,3900,
    /*16*/8000,8000,8000,
    /*19*/8000,8000,8000
  ];
  let score: Score=new Score(scores[scoreInder],carUrl,cardVideoUrl,cardNames[scoreInder],scoreRank
    ,cardGifUrl,cardMusicUrl,cardGifTime);
  return score;

 }

static async getUserTotalScore(userId:String){
  const db = admin.firestore();
        var userref = db.collection(Constant.COL_registerUsersData).doc(userId);
        let userDoc= await userref.get();
        if(!userDoc.exists){    
          return 0; 
        }
        console.log(" taotl userDoc.score "+userDoc.score);
        return userDoc.data().score  ? userDoc.data().score:0;
}

}


