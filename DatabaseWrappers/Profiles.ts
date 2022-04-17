export class Profile {
    uid: number = 0;
    username: string;
    friends: FriendProfile[] = [];
    friendRequests: FriendProfile[] = [];

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
    hash: string;
    friendRequests: FriendProfile[];
    token: string;
    constructor(uid: number, username: string, password: string, hash:string) {
        super(uid, username);
        this.password = password;
        this.friendRequests = [];
        this.hash = hash;
        this.token = "";
    }

    setFriendRequests(friends: FriendProfile[]) {
        this.friendRequests = friends;
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
        this.hash = u.hash;
    }
    static parseJSON(json: any) {
        return new UserProfile(json.uid, json.username, json.password, json.hash);
    }
}
UserProfile.prototype.toString = function toString() {
    return "Profile -> uid: " + this.uid + ", username: " + this.username + ", password: " + this.password;
}

export const thisAppUser: UserProfile = new UserProfile(-1, "", "", "");

export class FriendProfile extends Profile { 
    // Um idk, he baby
    constructor(uid: number, username: string) {
        super(uid, username);
    }
    setUsername (username: string) {
        this.username = username;
    }
    static parseJSON(json: any) {
        return new FriendProfile(json.uid, json.username);
    }
}