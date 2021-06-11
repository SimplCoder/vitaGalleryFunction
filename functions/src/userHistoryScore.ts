import{admin, Constant} from "./config";
import { Score, scoreFunction } from "./userScore";
export class UserHistoryFunctions{

  static  async   getUserCards( userId:string){
        const db = admin.firestore();
        let cardCounts: Array<CardCount> = new Array(); 
        try {
            var docRef = db.collection(Constant.COL_scannedQR).doc(userId);
            var doc = await docRef.get();
            if (doc.exists) {
                let scores:Array<any>= doc.data().scores;
                Constant.RANKS.forEach(rank => {
                    let count: number=0;
                    if(scores && scores.length>0 ){
                      count=  scores.filter(x => x.scoreRank==rank).length  ;
                    }
                   let score: Score= scoreFunction.getUserScore(rank);
                   let totalScore: number = count* score.score;
                   let cardCount: CardCount = new CardCount(score.cardName,score.cardUrl,count,score.score,totalScore);
                   cardCounts.push(cardCount);
                });
                //let count: number=0;
                
            } else {
                Constant.RANKS.forEach(rank => {
                    let count: number=0;
                     let score: Score= scoreFunction.getUserScore(rank);
                   let totalScore: number = count* score.score;
                   let cardCount: CardCount = new CardCount(score.cardName,score.cardUrl,count,score.score,totalScore);
                   cardCounts.push(cardCount);
                });
            }
        } catch (error) {
            console.log(error);
        }
        return cardCounts;
    }
    
}




export class UserHistory{
totalScore:number;
cardCounts: Array<CardCount>;
constructor(totalScore:number,cardCounts: Array<CardCount>){
    this.totalScore=totalScore;
    this.cardCounts=cardCounts;
}
}
export class CardCount{
    tileName: String;
    tileUrl: String;
    tileCount: number;
    tileScore:number;
    totalTileScore:number;
    constructor(tileName: String,tileUrl: String,tileCount: number,tileScore:number,totalScore:number){
        this.tileName=tileName;
        this.tileUrl=tileUrl;
        this.tileCount=tileCount;
        this.tileScore=tileScore;
        this.totalTileScore=totalScore;
    }
}
