export function getSong(songname: string) {
    // Get a song from SQL here
    // set param to either the name, or the sid, or idk man

    var Data = {
        songname: songname,
    }
    // MYSQLRequest("_________.php", Data).then((Response)=>{

    // });

    return new SongListItem("song name", "album", "artist");
}
export function searchForSongs(searchterm: string) {
    // Search for songs based on a searchterm here
    // Return a list of SongListItems
    var resultList = new Playlist(searchterm);
    var Data = {
        searchterm: searchterm,
    }
    // MYSQLRequest("_________.php", Data).then((Response)=>{

    // });
    
    return resultList;
}
export function getUsersPlaylists(userID: number) {
    // Get all playlists for a given user
    // Return a list of SongListItems

    var playlist1 = new Playlist("Playlist 1");
    var playlist2 = new Playlist("Playlist 2");
    var playlist3 = new Playlist("Playlist 3");

    playlist1.setSongsFromList([testSong1, testSong2]);
    playlist2.setSongsFromList([testSong2, testSong3]);
    playlist3.setSongsFromList([testSong1, testSong4]);

    var playlistList: Playlist[] = [playlist1, playlist2, playlist3];

    var Data = {
        uid: userID,
    }
    // MYSQLRequest("_________.php", Data).then((Response)=>{

    // });

    return playlistList;
}
export function getSongsByArtistFromPlaylists(userID: number) {
    var artist1 = new Playlist("Artist 1");
    var artist2 = new Playlist("Artist 2");
    
    artist1.setSongsFromList([testSong1, testSong2, testSong3]);
    artist2.setSongsFromList([testSong4]);
    
    var artists: Playlist[] = [artist1, artist2];

    var Data = {
        uid: userID,
    }
    return artists;
}
export function getSongsByAlbumFromPlaylists(userID: number) {
    var album1 = new Playlist("Artist 1");
    var album2 = new Playlist("Artist 2");    
    var album3 = new Playlist("Artist 3");

    album1.setSongsFromList([testSong1, testSong2]);
    album2.setSongsFromList([testSong3]);
    album3.setSongsFromList([testSong4]);
    
    var albums: Playlist[] = [album1, album2, album3];

    var Data = {
        uid: userID,
    }
    return albums;
}
export function getAllFromPlaylists(userID: number) {
    var allsongs = new Playlist("All Songs");
    allsongs.setSongsFromList([testSong1, testSong2, testSong3, testSong4]);

    var Data = {
        uid: userID,
    }

    return allsongs;
}
export function UploadMP3ToDB(userID: number, songName: string, albumName: string, artistName: string, mp3: any) {
    console.log("Uploading " + songName + "!");
}

export class SongListItem {
    name: string;
    album: string;
    artist: string;
    albumImg: any = null;
    constructor(name: string, album: string, artist: string) {
        this.name = name;
        this.album = album;
        this.artist = artist;
    }
}

export class Playlist {
    uid: number;
    pid: number;
    name: string;
    songs: SongListItem[];

    constructor(name: string) {
        this.uid = 1;
        this.pid = 1;
        this.name = name;
        this.songs = [];
    }
    setSongsFromList(songs: SongListItem[]) {
        this.songs = songs;
    }
    setSongsFromJSON(json: JSON) {

    }
    getPlaylist() {
        // TODO:: Get song from SQL Playlist
    }
    addSong(item: SongListItem) {
        this.songs.push(item);

        // TODO:: Add song to SQL playlist
    }
    removeSong(item: SongListItem) {
        var index = this.songs.indexOf(item);
        if(index >= 0)
            this.songs.splice(index, 1);
        
        // TODO:: Remove song from SQL playlist
    }
}


var testSong1 = new SongListItem("Song 1 Test", "Album 1 Test", "Artist 1 Test");
var testSong2 = new SongListItem("Song 2 Test", "Album 1 Test", "Artist 1 Test");
var testSong3 = new SongListItem("Song 3 Test", "Album 2 Test", "Artist 1 Test");
var testSong4 = new SongListItem("Song 4 Test", "Album 3 Test", "Artist 2 Test");
