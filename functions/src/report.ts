
import{admin,Constant} from "./config"
export class ReportFunction {
    static rankUserMap = new Map<number, String>();
    static userRankMap = new Map<String, number>();
    static inProgress: Boolean = false;
    static async calculateRanking() {
        console.log("calculateRanking called"+this.inProgress);
        try {
            if (!this.inProgress) {
                let tempRankUser = new Map<number, String>();
                let tempUserRankMap = new Map<String, number>();
                this.inProgress = true;
                const db = admin.firestore();
                var userref = db.collection(Constant.COL_registerUsersData);
                var topUsers = await userref.orderBy("score", "desc").get();
                let ranking: number = 0;
                topUsers.forEach(function (doc: any) {
                    ranking=ranking+1;
                    let id: string = doc.id;
                    tempRankUser.set(ranking, id);
                    tempUserRankMap.set(id, ranking);
                    //console.log(doc.id, ' => ', ranking);
                });
                //console.log("tempRankUser"+tempRankUser.size);
                this.rankUserMap = tempRankUser;
                this.userRankMap = tempUserRankMap;
                this.inProgress = false;
                //console.log("rankUserMap"+this.rankUserMap)
            }
        } catch (error) {
            console.error(error);
            this.inProgress = false;
        }
    }

    static async getUserRanking(userId: string) {
        if (!(this.rankUserMap && this.rankUserMap.size > 0)) {
            this.inProgress = false;
            await this.calculateRanking();
        }
        const db = admin.firestore();

        let rank: number | undefined = this.userRankMap.get(userId);

        if (!(rank && rank > 1)) {
            rank = this.userRankMap.size + 1;
        }
        try {
            var docRef = db.collection(Constant.COL_registerUsersData).doc(userId);
            var doc = await docRef.get()
            if (doc.exists) {
                let name: string = doc.data().firstName + " " + doc.data().lastName;
                let score: number = doc.data().score;
                let emailId:String= doc.data().email;
                let mobileNo:String= doc.data().mobileNumber;
                let address:String= doc.data().address;
        
                let userscore: UserScoreRank = new UserScoreRank(rank, name, score,emailId,mobileNo,address,"","","","",null);
               // console.log("Document data:", doc.data());
                return userscore;

            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        } catch (error) {
            console.log(error);
        }
        return UserScoreRank.UserScoreRank();

    }
    static async getUserRecords(){
                    let allUserRecords: Array<UserScoreRank> = new Array<UserScoreRank>();
        try {
                const db = admin.firestore();
                var userref = db.collection(Constant.COL_registerUsersData);
                var allUser = await userref.orderBy("firstName", "desc").get();
                //let ranking: number = 0;
                let tempUserRankMap :Map<String, number> = this.userRankMap;
                allUser.forEach(function (doc: any) {
                    let index: number | undefined = tempUserRankMap.get(doc.id);
                    let name: string = doc.data().firstName + " " + doc.data().lastName;
                    let emailId:String= doc.data().email;
                    let mobileNo:String= doc.data().mobileNumber;
                    let address:String= doc.data().address;
                    let postalCode:String= doc.data().postalCode;
                    let score: number = doc.data().score;
                    let city:string="";
                    let state:string="";
                    let country:string="";
                    let specialCode=doc.data().specialCodes;
                    try{
                        if(doc.data().location){
                            city=doc.data().location.city;
                            state=doc.data().location.region;
                            country=doc.data().location.country;
                        }
                    }catch(err){
                        console.error(err);
                    }
                    let userscore: UserScoreRank = new UserScoreRank(index, name, score,emailId,mobileNo,address,postalCode,country,state,city,specialCode);
                    allUserRecords.push(userscore);

                });
               
                console.log("allUserRecords"+allUserRecords.length);
                return allUserRecords;
            
        } catch (error) {
            console.error(error);
    
        }
        return allUserRecords;
    }


static async getUserQRcode( isSpcl:boolean){
        let allUserRecords: Array<UserQRCode> = new Array<UserQRCode>();
try {
    const db = admin.firestore();
    var userref = db.collection(Constant.COL_registerUsersData);
    var allUser = await userref.orderBy("firstName", "desc").get();
    let tempUserMap = new Map<String, any>();
    allUser.forEach(function (doc: any) {
      tempUserMap.set(doc.id,doc.data());
    });
    
console.log("tempUserMap size"+ tempUserMap.size);
//var allUserData= allUser.data();
    const db1 = admin.firestore();
    var scannedQrRef = db1.collection(Constant.COL_scannedQR);
    var allScannedQR = await scannedQrRef.get();
   
   console.log("allScannedQR"+allScannedQR.size)
   
   const spclQRRef=  db.collection(Constant.COL_spclQR).doc("specialCode");
   let docSnapshotS= await  spclQRRef.get();
   let specialCodes: string[]=[];
   if (!docSnapshotS.exists) {
    await  spclQRRef.set({}); 
   }else{
     specialCodes= docSnapshotS.data().qrcodes;
   }
   //let ranking: number = 0;
    allScannedQR.forEach(function (doc: any) {
        var user =tempUserMap.get(doc.id);
        if(user!=null){
        let name: string = user.firstName + " " + user.lastName;
        let emailId:String= user.email;
        let mobileNo:String= user.mobileNumber;
        let address:String= user.address;
        let postalCode:String= user.postalCode;
        if(doc.data().scores!=null){
            doc.data().scores.forEach(function (qrScan: any) { 
                var myDate = qrScan.createdOm;
                let createdOn:String=new Date(myDate._seconds * 1000).toISOString(); 
                if(isSpcl){
                    if(specialCodes.includes(qrScan.qrCode)){
                        let userscore: UserQRCode = new UserQRCode( name, emailId,mobileNo,address,postalCode,
                            Constant.scores[qrScan.scoreRank-1],createdOn,qrScan.qrCode);
                        allUserRecords.push(userscore);
                    }

                }else{
                let userscore: UserQRCode = new UserQRCode( name, emailId,mobileNo,address,postalCode,
                    Constant.scores[qrScan.scoreRank-1],createdOn,qrScan.qrCode);
                allUserRecords.push(userscore);
             }
             });
        }
    }
        
    });
   
    console.log("allUserRecords"+allUserRecords.length);
    return allUserRecords;

} catch (error) {
console.error(error);

}
return allUserRecords;
}

    static async getRecords() {
        console.log("this.rankUserMap"+this.rankUserMap.size);
        let topuser: Array<UserScoreRank> = new Array<UserScoreRank>();
        if (!(this.rankUserMap && this.rankUserMap.size > 0)) {
            this.inProgress = false;
            await this.calculateRanking();
        }
        const db = admin.firestore();
        let index: number = 0;
        while (index <= this.rankUserMap.size-1) {
            index = index + 1;
            let userId = this.rankUserMap.get(index);
            if (userId) {
                try {
                    var docRef = db.collection(Constant.COL_registerUsersData).doc(userId);
                    var doc = await docRef.get();
                    if (doc.exists) {
                        let name: string = doc.data().firstName + " " + doc.data().lastName;
                        let emailId:String= doc.data().email;
                        let mobileNo:String= doc.data().mobileNumber;
                        let address:String= doc.data().address;
                        let postalCode:String= doc.data().postalCode;
                        let score: number = doc.data().score;
                        let city:string="";
                        let state:string="";
                        let country:string="";
                        try{
                            if(doc.data().location){
                                city=doc.data().location.city;
                                state=doc.data().location.region;
                                country=doc.data().location.country;
                            }
                        }catch(err){
                            console.error(err);
                        }
                        let userscore: UserScoreRank = new UserScoreRank(index, name, score,emailId,mobileNo,address,postalCode,country,state,city,null);
                        topuser.push(userscore);
                        //console.log("Document data:", doc.data());

                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error(userId);
                    console.error(error);
                }


            } else {
                break;
            }

        }
        return topuser;
    }
   
}


export class UserRanking {
    topUser: Array<UserScoreRank>;
    currentUserrank: UserScoreRank;
    constructor(topUser: Array<UserScoreRank>, currentUserrank: UserScoreRank) {
        this.topUser = topUser;
        this.currentUserrank = currentUserrank;

    }
    static UserRanking(){
        return new UserRanking(Array<UserScoreRank>(),UserScoreRank.UserScoreRank())
    }

}
export class UserScoreRank {
    ranking: number | undefined;
    name: string;
    score: number;
    emailId:String;
    mobileNo:String;
    address:String;
    postalCode:String;
    locCountry:String;
    locState:String;
    locCity:String;
    specialCodes:any;
    constructor(ranking: number | undefined, name: string, score: number,emailId:String,
        mobileNo:String,address:String,postCode:String, locCountry:String,locState:String,locCity:String,specialCodes:any) {
        this.ranking = ranking;
        this.name = name;
        this.score = score;
        this.emailId=emailId;
        this.mobileNo=mobileNo;
        this.address=address;
        this.postalCode=postCode
        this.locCountry=locCountry;
        this.locState=locState;
        this.locCity=locCity;
        this.specialCodes= specialCodes;
    }
    static UserScoreRank(){
        return new UserScoreRank( 0,"",0,"","","","","","","",null);
    }    
}

export class UserQRCode {
    name: string;
    scanScore: number;
    qrCode:String;
    emailId:String;
    mobileNo:String;
    address:String;
    postalCode:String;
    scannedOn:String;
    
    constructor(name: string,emailId:String,
        mobileNo:String,address:String,postCode:String,scanScore: number, scannedOn:String,
        qrCode:String) {
        this.name = name;
        this.emailId=emailId;
        this.mobileNo=mobileNo;
        this.address=address;
        this.postalCode=postCode
        this.scanScore=scanScore;
        this.qrCode=qrCode;
        this.scannedOn=scannedOn    
    }
   

    
}