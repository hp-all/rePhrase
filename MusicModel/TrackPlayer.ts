import Track from "./Track";
import { Source } from "./Track";
import SongSection, { SectionType } from "./SongSection";
import Loop from "./Loop";
import { Audio } from 'expo-av';
var Sound = require('react-native-sound');

export default class TrackyPlayer {
    currentTrack?: Track;
    currentTempo?: number;
    currentLoop?: Loop|undefined;

    queuedLoop?: Loop|undefined;
    isQueued: boolean = false;

    // Some field variable to keep track of where in the song the player is
    mediaPlayer: MediaPlayer;
    playMode: PlayMode = PlayMode.Loop;
    statusUpdate: (s: any)=>void;


    constructor(statusUpdate:(s:any)=>void) {
        this.statusUpdate = (s: any) => {
            statusUpdate(s);
            if(this.currentTrack && s.songLen > 1 && s.songLen !== this.currentTrack.getLength()) {
                this.currentTrack.setLength(s.songLen);
            }
        }
        this.mediaPlayer = new MediaPlayer(this.statusUpdate);
    }
    setMode(mode: PlayMode) {
        this.playMode = mode;
    }
    toggleMode(mode: PlayMode) {
        //This will cycle through the play modes one by one
        this.playMode = (mode)%3 + 1;
    }
    setTrack(track: Track) {
        this.currentTrack = track;
        this.currentTempo = track.getDefaultTempo();
        this.currentLoop = undefined;
        switch(track.mediaSource) {
            case (Source.MP3): {
                var boy = (this.mediaPlayer as MP3Player).uri;
                if(track.uri != boy) {
                    // only reset the actual player if the uri source is different (i.e. a different song source)
                    console.log("Setting new distinct Track");
                    this.mediaPlayer = new MP3Player(track.uri, this.statusUpdate);
                    //Loads track in its construction based on track.uri
                }
            }
            default: {
                this.mediaPlayer.loadTrack(track);
            }
        }
    }
    getLoops() {
        if(this.currentTrack != undefined)
            return this.currentTrack.getLoops();
    }
    setLoop(loop: Loop) {
        if((this.currentLoop === undefined && this.getStatus()?.doLoop)
            || (this.isQueued && this.queuedLoop === loop && this.getStatus()?.doLoop)
            || !(this.getStatus()?.isPlaying)) {

            // Do not queue a loop if there is no current loop setting (instead play it immediately)
            // or automatically set queued loop to current loop if double pressed
            // or if nothing is playing at all, just auto set the loop

            this.currentLoop = loop;
            this.isQueued = false;
            this.queuedLoop = undefined;
            this.setLoopStart(loop.getStart());
            this.setLoopEnd(loop.getEnd());
            this.goTo(loop.getStart());
        } else {
            //Queue a loop to play once the current loop is done playing
            this.queuedLoop = loop;
            this.isQueued = true;
            this.setLoopStart(loop.getStart());
            this.setQueueLoopEnd(loop.getEnd());
        }
    }
    setLoopfromIndex(i: number) {
        // If user doesn't have exact loop object, have option to set by index
        // Do nothing if not enough loops are set
        if(this.currentTrack) {
            var loops = this.currentTrack.getLoops();
            if(i < loops.length) {
                this.setLoop(loops[i]);
            }
        }
    }
    updateLoop(loop: Loop) {
        if(!loop.isNull() && loop === this.currentLoop) {
            this.setLoopStart(loop.getStart());
            if(!this.isQueued)
                this.setLoopEnd(loop.getEnd());
            else if(loop === this.queuedLoop) {
                this.setQueueLoopEnd(loop.getEnd());
            }
        }
    }

    play() {
        this.mediaPlayer.play();
    }
    pause() {
        this.mediaPlayer.pause();
    }
    togglePlay() {
        this.mediaPlayer.togglePlay();
    }
    restart() {
        this.mediaPlayer.restart();
    }
    goTo(timestamp: number) {
        this.mediaPlayer.goTo(timestamp);
    }
    toggleLoop() {
        this.mediaPlayer.toggleLoop();
    }
    setLoopMode = async (isOn: boolean) => {
        this.mediaPlayer.setLoopMode(isOn);
    }
    setLoopStart(milli: number) {
        this.mediaPlayer.setLoopStart(milli + 250);
    }
    setLoopEnd(milli: number) {
        this.mediaPlayer.setLoopEnd(milli);
    }
    setQueueLoopEnd(milli: number) {
        this.mediaPlayer.setQueuedLoopEnd(milli);
    }
    setUpdateIntervalMilli(milli: number) {
        this.mediaPlayer.setUpdateIntervalMilli(milli);
    }
    getStatus() {
        return this.mediaPlayer.getStatus();
    }
    unload() {
        this.mediaPlayer.unload();
    }
}

export class MediaPlayer {
    statusUpdate: (d:any)=>void;
    isLoaded: boolean = false;
    isPlaying: boolean = false;
    songLen: number = 1;
    songPos: number = 1;
    songFrac: number = 0;
    doLoop: boolean = false;
    loopStart: number = 0;
    loopEnd: number = 0;
    queueLoopEnd: number = 0;

    sourceType: Source = Source.MP3;

    constructor(statusUpdate: (d:any)=>void) {
        this.statusUpdate = statusUpdate;
    }
    loadTrack(track: Track) {}
    update() {
        this.statusUpdate({
            isLoaded: this.isLoaded,
            isPlaying: this.isPlaying,
            songLen: this.songLen,
            songPos: this.songPos,
            songFrac: this.songFrac,
            doLoop: this.doLoop,
            loopStart: this.loopStart,
            loopEnd: this.loopEnd,
        });
    }
    toggleLoop() {}
    async setLoopMode (isOn: boolean) {console.log("Big boy media Player Loop Mode: " + isOn);}
    async play() {}
    async pause() {}
    async togglePlay() {}
    async restart() {}
    async goTo(timestamp: number) {console.log("Go to from big guy :(");}
    async setLoopStart(timestamp: number) {console.log("Set loop start from big guy :(");}
    async setLoopEnd(timestamp: number) {console.log("Set loop end from big guy :(");}
    async setQueuedLoopEnd(timestamp: number) {console.log("Set queued loop end from big guy :(");}
    async setUpdateIntervalMilli(milli: number) {}
    async unload() {}
    getStatus() : {isPlaying: boolean, songLen: number, songPos: number, songFrac: number, doLoop: boolean, loopStart: number, loopEnd: number} {
        return {
            isPlaying: false,
            songLen: 1,
            songPos: 0,
            songFrac: 1, 
            doLoop: false, 
            loopStart: 0, 
            loopEnd: 1
        };
    }
}

export class MP3Player extends MediaPlayer {
    uri: string;
    track: Audio.Sound;
    prevTime: number;
    constructor(uri: string, stateUpdate: (d:any)=>void) {
        super(stateUpdate);
        this.uri = uri;
        this.track = new Audio.Sound();
        this.prevTime = 0;
        this.updateSetOnPlaybackStatusUpdate();
        this.loadUri(uri);
    }
    
    updateSetOnPlaybackStatusUpdate() {
        this.track.setOnPlaybackStatusUpdate(status => {
            this.standardStatusUpdateShit(status);
            this.loopUpdateShit(status);
            this.update();
        });
    }
    standardStatusUpdateShit(status:any) {
        if(this.isPlaying != status.isPlaying) {
            this.isPlaying = status.isPlaying;
        }
        if(status.playableDurationMillis && status.playableDurationMillis != this.songLen) {
            this.songLen = status.playableDurationMillis;
        }
        if(status.positionMillis) {
            this.songPos = status.positionMillis;
            if(status.playableDurationMillis) {
                this.songFrac = (status.positionMillis/status.playableDurationMillis);
            }
        }
    }
    loopUpdateShit(status: any) {
        if(this.doLoop && Math.abs(this.loopStart-this.loopEnd) >= status.progressUpdateIntervalMillis && status.positionMillis && status.positionMillis >= this.loopEnd) {
            try{
                console.log("MP3 guy Going to start: " + this.loopStart);
                this.goTo(this.loopStart);
            } catch(error) {
                console.log("error w looping: ");
            }
        }
        
        //Clear previous time if not playing loop or if player was sent to the start of a loop
        if(!this.doLoop) {
            this.prevTime = 0;

        } else if(Math.abs(this.songPos-this.loopStart) <= status.progressUpdateIntervalMillis){
            this.prevTime = 0;
            //If queued loop end, then set the song end
            if(this.queueLoopEnd !== 0) {
                this.setLoopEnd(this.queueLoopEnd);
                this.queueLoopEnd = 0;
            }
        } 
    } 
    async loadUri(uri: any) {
        var loaded = (await this.track.loadAsync(uri)).isLoaded;
        this.isLoaded = loaded;
        this.update();
    }
}
MP3Player.prototype.play = async function play() {this.track.playAsync();}
MP3Player.prototype.pause = async function pause() {this.track.pauseAsync();}
MP3Player.prototype.togglePlay = async function togglePlay() {
    try {
        var currStat = await this.track.getStatusAsync();
        if(currStat.isPlaying) {
            this.track.pauseAsync();
        } else {
            this.track.playAsync();
        }
    } catch(error) {
        console.log("error playing/pausing: " + error);
    }
}
MP3Player.prototype.restart = async function restart() {
    try {
        this.track.setPositionAsync(0);
        this.songLen = 1;
        this.songFrac = 0;
        this.update();
    } catch(error) {
        console.log("error restarting song: " + error);
    }
}
MP3Player.prototype.goTo = async function goTo(milli: number = 98000) {
    if(this.isLoaded) {
        try{
            var currStat = await this.track.getStatusAsync();
            // console.log("At: " + currStat.positionMillis + " GoTo: " + milli + " prev: "  + this.prevTime + " diff: " + Math.abs(currStat.positionMillis-this.prevTime));
            if(currStat.positionMillis !== milli && Math.abs(currStat.positionMillis-this.prevTime) >= currStat.progressUpdateIntervalMillis) {
                // console.log("\t going next");
                this.track.setPositionAsync(milli);
                this.songPos= milli;
                this.songFrac = milli/this.songLen;
            }
            this.prevTime = currStat.positionMillis
        } catch(error) {
            console.log("seek error: " + error);
        }
    }
}
MP3Player.prototype.toggleLoop = async function toggleLoop() {
    this.doLoop = !this.doLoop;
    this.update();
}
MP3Player.prototype.setLoopMode = async function setLoopMode(isOn: boolean) {
    this.doLoop = isOn;
    this.update();
}
MP3Player.prototype.setLoopStart = async function setLoopEnd(timestamp: number) {
    if(this.isLoaded) {
        this.loopStart = timestamp;
    }
}
MP3Player.prototype.setLoopEnd = async function setLoopEnd(timestamp: number) {
    if(this.isLoaded) {
        this.loopEnd = timestamp;
    }
}
MP3Player.prototype.setQueuedLoopEnd = async function setQueuedLoopEnd(timestamp: number) {
    if(this.isLoaded) {
        this.queueLoopEnd = timestamp;
    }
}
MP3Player.prototype.setUpdateIntervalMilli = async function setUpdateIntervalMilli(milli: number) {await this.track.setProgressUpdateIntervalAsync(milli);}
MP3Player.prototype.unload = async function unload() {this.track.unloadAsync();}
MP3Player.prototype.getStatus = function getStatus() {
    return {
        isPlaying: this.isPlaying,
        songLen: this.songLen,
        songPos: this.songPos,
        songFrac: this.songFrac,
        doLoop: this.doLoop,
        loopStart: this.loopStart,
        loopEnd: this.loopEnd,
    }
}


export enum PlayMode {
    //Remember to change the toggleMode() function if modes are added or removed
    Loop = 1,
    Once,
    Continue,
}