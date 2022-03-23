import Track from "../ModelStuff/Track.js";



/*  
 *  TrackList 
 *      A class that contains the users entire list of added tracks
 *      Tracks will be added from the search song feature of the app that will
 *          pull tracks from apple music, spotify, or youtube
 *      Maybe make this a static Class? Just because there will only be one per app
 */
export default class TrackList {
    name: string;
    
    constructor(nn : string) {
        this.name = nn;
    }
}

/*
 *  Playlist
 *      A user defined list of tracks that Will contain a subsection of the tracklist 
 */
export class Playlist {
    name: string;
    trackList: Track[]

    constructor(nn : string) {
        this.name = nn;
        this.trackList = [];
    }

    addTrack(track: Track) {
        this.trackList.push(track);
    }
    removeTrack(track: Track) {
        
    }
    getFilteredList(filter: Track) {
        //TODO idk but this might be useful 
    }
}
