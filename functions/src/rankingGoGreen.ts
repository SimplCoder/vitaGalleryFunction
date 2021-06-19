
import{admin,Constant} from "./config"
export class RankingGoGreenFunction {
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
                var topUsers = await userref.orderBy("goGreenscore", "desc").get();
                let ranking: number = 0;
                topUsers.forEach(function (doc: any) {
                    ranking=ranking+1;
                    let id: string = doc.id;
                    tempRankUser.set(ranking, id);
                    tempUserRankMap.set(id, ranking);
                    console.log(doc.id, ' => ', ranking);
                });
                console.log("tempRankUser"+tempRankUser.size);
                this.rankUserMap = tempRankUser;
                this.userRankMap = tempUserRankMap;
                this.inProgress = false;
                console.log("rankUserMap"+this.rankUserMap)
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

        if (!(rank && rank >= 1)) {
            rank = this.userRankMap.size + 1;
        }
        try {
            var docRef = db.collection(Constant.COL_registerUsersData).doc(userId);
            var doc = await docRef.get()
            if (doc.exists) {
                let name: string = doc.data().firstName + " " + doc.data().lastName;
                let score: number = doc.data().goGreenscore;
                let userscore: UserScoreRank = new UserScoreRank(rank, name, score);
                console.log("Document data:", doc.data());
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
    static async getTopTenRecords() {
        console.log("this.rankUserMap"+this.rankUserMap.size);
        let topuser: Array<UserScoreRank> = new Array<UserScoreRank>();
        if (!(this.rankUserMap && this.rankUserMap.size > 0)) {
            this.inProgress = false;
            await this.calculateRanking();
        }
        const db = admin.firestore();
        let index: number = 0;
        while (index <= 9) {
            index = index + 1;
            let userId = this.rankUserMap.get(index);
            if (userId) {
                try {
                    var docRef = db.collection(Constant.COL_registerUsersData).doc(userId);
                    var doc = await docRef.get();
                    if (doc.exists) {
                        let name: string = doc.data().firstName + " " + doc.data().lastName;
                        let score: number = doc.data().goGreenscore;
                        let userscore: UserScoreRank = new UserScoreRank(index, name, score);
                        topuser.push(userscore);
                        console.log("Document data:", doc.data());

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
    static async getRankingDetails(userId:string){
        try{
        let LeaderBoard: Array<UserScoreRank> = await this.getTopTenRecords();
        let Own:UserScoreRank= await this.getUserRanking(userId);
        return new UserRanking(LeaderBoard,Own);
        }catch(error){
            console.error(error);
            return UserRanking.UserRanking();
        }

    }
}


export class UserRanking {
    LeaderBoard: Array<UserScoreRank>;
    Own: UserScoreRank;
    constructor(LeaderBoard: Array<UserScoreRank>, Own: UserScoreRank) {
        this.LeaderBoard = LeaderBoard;
        this.Own = Own;

    }
    static UserRanking(){
        return new UserRanking(Array<UserScoreRank>(),UserScoreRank.UserScoreRank())
    }

}
export class UserScoreRank {
    rank: number | undefined;
    name: string;
    score: number;
    constructor(rank: number | undefined, name: string, score: number) {
        this.rank = rank;
        this.name = name;
        this.score = score;
    }
    static UserScoreRank(){
        return new UserScoreRank( 0,"",0);
    }
}