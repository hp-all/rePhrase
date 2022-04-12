export function getProfileByUID(uid: number) {
    // MYSQLRequest("_________.php", Data).then((Response)=>{

    // });
    return {uid: 0, username: ""};
}

export class Profile {
    uid: number = 0;
    username: string;
    friends: FriendProfile[] = [];
    
    constructor(uid: number, username: string) {
        this.uid = uid;
        this.username = username;
        // DO SQL LOOKUP to get list of friends
    }
    toJSON() {
        return {
            uid: this.uid,
            username: this.username,
        }
    }
    static parseJSON(json: any) {
        return new Profile(json.uid, json.username);
    }
}
Profile.prototype.toString = function toString() {
    return "Profile -> uid: " + this.uid + ", username: " + this.username;
}

export default class UserProfile extends Profile {
    // point of this is just so that only the userprofile has a password value
    password: string;
    constructor(uid: number, username: string, password: string) {
        super(uid, username);
        this.password = password;
    }

    addFriend(friend: FriendProfile) {
        // Somehow this is gonna interact with the database
    }
    removeFriend(friend: FriendProfile) {

    }
    toJSON() {
        return {
            uid: this.uid,
            username: this.username,
            password: this.password,
        }
    }
    copy(u: UserProfile) {
        this.uid = u.uid;
        this.username = u.username;
        this.password = u.password;
    }
    static parseJSON(json: any) {
        return new UserProfile(json.uid, json.username, json.password);
    }
}


UserProfile.prototype.toString = function toString() {
    return "Profile -> uid: " + this.uid + ", username: " + this.username + ", password: " + this.password;
}

export const thisAppUser: UserProfile = new UserProfile(-1, "", "");

export class FriendProfile { 
    // Um idk, he baby
    constructor() {
        
    }
}