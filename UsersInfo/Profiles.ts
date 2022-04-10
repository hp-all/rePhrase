export class Profile {
    uid: number = 0;
    username: string;
    friends: FriendProfile[] = [];
    
    constructor(uid: number, username: string) {
        this.uid = uid;
        this.username = username;
        // DO SQL LOOKUP to get list of friends
    }
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
}


export class FriendProfile { 
    // Um idk, he baby
    constructor() {
        
    }
}