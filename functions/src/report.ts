
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
                let userscore: UserScoreRank =  UserScoreRank.userScoreRank();
               // console.log("Document data:", doc.data());
                return userscore;

            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        } catch (error) {
            console.log(error);
        }
        return  UserScoreRank.userScoreRank();

    }
    static async getUserRecords(){
                    let allUserRecords: Array<UserScoreRank> = new Array<UserScoreRank>();
            let duplicateRecods:Array<string>= new Array<string>();
            try {
                const db = admin.firestore();
                var userref = db.collection(Constant.COL_registerUsersData);
                var allUser = await userref.orderBy("totalScore", "desc").get();
                
               let index: number=0;
                allUser.forEach(function (doc: any) {
                    index++;
                    duplicateRecods.push(doc.id);
                    let name: string = doc.data().firstName + " " + doc.data().lastName;
                    let emailId:String= doc.data().email;
                    let mobileNo:String= doc.data().phoneNumber;
                    let communcation = "no";
                    if(doc.data().comm !==undefined ){
                        if(doc.data().comm===true){
                            communcation= "yes";
                        }
                    }
                    let createdOn:string="";
                    if(doc.data().regDate !==undefined && doc.data().regDate ){
                        var myDate:any =  doc.data().regDate; 
                        var createdOnDate= new Date(myDate._seconds * 1000);
                        createdOnDate.setHours(createdOnDate.getHours() + 8);
                        createdOn =createdOnDate.toISOString(); 
                    } 
                    let totalScore: number = doc.data().totalScore;
                    let photoScore: number = doc.data().photoScore;
                    let photoLastPlayedOn:string="";
                    if(doc.data().photoLastPlayedOn !==undefined && doc.data().photoLastPlayedOn ){
                        var myDate:any =  doc.data().photoLastPlayedOn; 
                        var createdOnDate= new Date(myDate._seconds * 1000);
                        createdOnDate.setHours(createdOnDate.getHours() + 8);
                        photoLastPlayedOn =createdOnDate.toISOString(); 
                    } 
                    let raceScore: number = doc.data().raceScore;
                    let raceLastPlayedOn:string="";
                    if(doc.data().raceLastPlayedOn !==undefined && doc.data().raceLastPlayedOn ){
                        var myDate:any =  doc.data().raceLastPlayedOn; 
                        var createdOnDate= new Date(myDate._seconds * 1000);
                        createdOnDate.setHours(createdOnDate.getHours() + 8);
                        raceLastPlayedOn =createdOnDate.toISOString(); 
                    }
                    let greenScore: number = doc.data().goGreenScore;
                    let goGreenLastPlayedOn:string="";
                    if(doc.data().goGreenLastPlayedOn !==undefined && doc.data().goGreenLastPlayedOn ){
                        var myDate:any =  doc.data().goGreenLastPlayedOn; 
                        var createdOnDate= new Date(myDate._seconds * 1000);
                        createdOnDate.setHours(createdOnDate.getHours() + 8);
                        goGreenLastPlayedOn =createdOnDate.toISOString(); 
                    }
                    let userscore: UserScoreRank = new UserScoreRank(index, name,emailId,mobileNo,communcation,createdOn, totalScore,raceScore,raceLastPlayedOn,photoScore,photoLastPlayedOn,greenScore, goGreenLastPlayedOn);
                    allUserRecords.push(userscore);

                });
               
                var userref1 = db.collection(Constant.COL_registerUsersData);
                var allUser1 = await userref1.get();

                allUser1.forEach(function (doc: any) {
                    if(!duplicateRecods.includes(doc.id)){

                    index++;
                    let name: string = doc.data().firstName + " " + doc.data().lastName;
                    let emailId:String= doc.data().email;
                    let mobileNo:String= doc.data().phoneNumber;
                    let communcation = "no";
                    if(doc.data().comm !==undefined ){
                        if(doc.data().comm===true){
                            communcation= "yes";
                        }
                    }
                    let createdOn:string="";
                    if(doc.data().regDate !==undefined && doc.data().regDate ){
                        var myDate:any =  doc.data().regDate; 
                        var createdOnDate= new Date(myDate._seconds * 1000);
                        createdOnDate.setHours(createdOnDate.getHours() + 8);
                        createdOn =createdOnDate.toISOString(); 
                    } 
                    let totalScore: number = doc.data().totalScore;
                    let photoScore: number = doc.data().photoScore;
                    let photoLastPlayedOn:string="";
                    if(doc.data().photoLastPlayedOn !==undefined && doc.data().photoLastPlayedOn ){
                        var myDate:any =  doc.data().photoLastPlayedOn; 
                        var createdOnDate= new Date(myDate._seconds * 1000);
                        createdOnDate.setHours(createdOnDate.getHours() + 8);
                        photoLastPlayedOn =createdOnDate.toISOString(); 
                    } 
                    let raceScore: number = doc.data().raceScore;
                    let raceLastPlayedOn:string="";
                    if(doc.data().raceLastPlayedOn !==undefined && doc.data().raceLastPlayedOn ){
                        var myDate:any =  doc.data().raceLastPlayedOn; 
                        var createdOnDate= new Date(myDate._seconds * 1000);
                        createdOnDate.setHours(createdOnDate.getHours() + 8);
                        raceLastPlayedOn =createdOnDate.toISOString(); 
                    }
                    let greenScore: number = doc.data().goGreenScore;
                    let goGreenLastPlayedOn:string="";
                    if(doc.data().goGreenLastPlayedOn !==undefined && doc.data().goGreenLastPlayedOn ){
                        var myDate:any =  doc.data().goGreenLastPlayedOn; 
                        var createdOnDate= new Date(myDate._seconds * 1000);
                        createdOnDate.setHours(createdOnDate.getHours() + 8);
                        goGreenLastPlayedOn =createdOnDate.toISOString(); 
                    }
                    let userscore: UserScoreRank = new UserScoreRank(index, name,emailId,mobileNo,communcation,createdOn, totalScore,raceScore,raceLastPlayedOn,photoScore,photoLastPlayedOn,greenScore, goGreenLastPlayedOn);
                    allUserRecords.push(userscore);
                    }

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
                        let userscore: UserScoreRank = UserScoreRank.userScoreRank();//new UserScoreRank(index, name, score,emailId,mobileNo,address,postalCode,country,state,city,null);
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
        return new UserRanking(Array<UserScoreRank>(),UserScoreRank.userScoreRank())
    }

}
export class UserScoreRank {
    ranking: number;
    name: string;
    emailId:String;
    mobileNo:String;
    communication:String;
    registrationDate:string;
    totalScore:number;
    raceScore:number;
    raceLastPlayedOn:string;
    photoScore:number;
    photoLastPlayedOn:string;
    speedieScore:number;
    speedieLastPlayedOn:string;

    constructor(ranking: number , name: string,emailId:String,
        mobileNo:String,communication:String,registrationDate:string,   totalScore:number,raceScore:number,raceLastPlayedOn:string, photoScore:number,photoLastPlayedOn:string, greenScore:number,speedieLastPlayedOn:string
    ) {
        this.ranking = ranking;
        this.name = name;
        this.emailId=emailId;
        this.mobileNo=mobileNo;
        this.communication=communication
        this.totalScore=totalScore;
        this.speedieScore=greenScore;
        this.speedieLastPlayedOn= speedieLastPlayedOn;
        this.photoScore=photoScore;
        this.photoLastPlayedOn= photoLastPlayedOn;
        this.raceScore=raceScore; 
        this.raceLastPlayedOn=raceLastPlayedOn;  
        this.registrationDate=registrationDate
    }
    static userScoreRank(){
        return new UserScoreRank( 0,"","","","","",0,0,"",0,"",0,"");
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