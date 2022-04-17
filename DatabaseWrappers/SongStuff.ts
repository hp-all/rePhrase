import React, { useState, useEffect } from 'react';
import { thisAppUser } from './Profiles';
import axios from "axios";
import Axios from "axios"
import { backendURLPrefix } from './DatabaseRequest';


// adding variable to keep track of what song the user has selected
// in the application
let selectedSongID: string = "";
let selectedTrackInfo= {title: "", artist_name: "", album: "", duration: 0, mp3_url: ""}
// accessor method to change the value of the selected song id
export function setSelectedSong(id: string) {
    selectedSongID = id;
}
export function getSelectedTrackInfo() {
    return selectedTrackInfo;
}

// accessor method to retrieve the value of the selected song id
export function getSelectedSong() {
    return selectedSongID;
}


export function getSongByID(trackID: string) {
    return axios.get(backendURLPrefix + `track/${trackID}`)
        .then(res => { 
            console.log('Successfully loaded data!');
            selectedTrackInfo = res.data[0];
            console.log("Set track to song: " + selectedTrackInfo.title);
            // create selected track once track metadata is loaded

        }, err => {
            console.log(err);
            console.log("Could not load song " + trackID);
    });
}
export function getAllSongs() {
    // get all song metadata from mysql database
    // returns Promise
    console.log("Getting all songs");
    return axios.get(backendURLPrefix + "tracks");
}

export function searchForSongs(searchterm: string) {
    // Search for songs based on a searchterm here
    // Return a list of SongListItems

    return axios.get(backendURLPrefix + `tracks/search/${searchterm}`);
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

export function addSongToPlaylist(playlistID: number, trackID: string) {
    console.log("Adding track " + trackID + ", to playlist " + playlistID);
    return Axios.post(backendURLPrefix + "playlists/track/add", {
        playlist_id: playlistID,
        track_id: trackID,
    });
}
export function addPlaylist(playlistID: number) {
    var userID = thisAppUser.uid;

}

export function UploadMP3ToDB(userID: number, songName: string, albumName: string, artistName: string, mp3: any) {
    console.log("Uploading " + songName + "!");
}

export class SongListItem {
    track_id: string;
    name: string;
    album: string;
    artist: string;
    albumImg: any = null;

    constructor (track_id: string, name: string, album: string, artist: string) {
        this.track_id = track_id;
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

    setSongsFromJSON(json: any) {
        // converts JSON data from GET /tracks response into a list of SongListItem
        this.songs = json.map((d: { artist_name: string, album: string, duration: number, interest: number, mp3_url: string, title: string, track_id: string }) => {
            return new SongListItem(d.track_id, d.title, d.album, d.artist_name);
        });
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


var testSong1 = new SongListItem("0", "Song 1 Test", "Album 1 Test", "Artist 1 Test");
var testSong2 = new SongListItem("1", "Song 2 Test", "Album 1 Test", "Artist 1 Test");
var testSong3 = new SongListItem("2", "Song 3 Test", "Album 2 Test", "Artist 1 Test");
var testSong4 = new SongListItem("3", "Song 4 Test", "Album 3 Test", "Artist 2 Test");

