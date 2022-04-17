import SongSection, { SectionType } from "./SongSection";
import Loop from "./Loop";

export default class Track {
    // track data

    mediaSource: Source;
    mediaData: any;
    name: string = "";
    artist: string = "";
    album: string = "";
    timeLen: number = 240000;
    uri: string;

    //User Created App Data
    defaultTempo: number;
    defaultTimeSig: string;
    defaultBeatsPerMeasure: number = 4;
    sectionList: SongSection[] = [];
    loopCount: number = 0;
    loopList: Loop[] = [];

    constructor(mediaSource: Source, uri: string, sourceData: any, defaultTempo: number = 120, defaultTimeSig: string = "4:4") {
        this.mediaSource = mediaSource;
        this.uri = uri;
        this.mediaData = sourceData;
        this.defaultTempo = defaultTempo;
        this.defaultTimeSig = defaultTimeSig;
        this.setDefaultTimeSig(defaultTimeSig);
        this.init(mediaSource, sourceData);
        this.sectionList.splice(0, 0, new SongSection("", 0, this.timeLen, this.defaultTempo, this.defaultTimeSig));
    }
    
    init(mediaSource: Source, sourceData: any) {
        [ this.name, this.artist, this.album, this.timeLen ] = Track.getInfo(mediaSource, sourceData);
    }

    addSection(name: string, type: SectionType, startTime: number, endTime: number, isSnapped: boolean = true, tempo: number = this.defaultTempo, timeSig: string = this.defaultTimeSig, db?:boolean) {
        if(startTime === 0) {
            this.addSectionAtBeggining(name, type, endTime, isSnapped, tempo, timeSig);
        } else {
            this.addSectionAfter(name, type, startTime, endTime, isSnapped, tempo, timeSig, db);
        }
    }
    addSectionAtBeggining(name: string, type: SectionType, endTime: number, isSnapped: boolean = true, tempo: number = this.defaultTempo, timeSig: string = this.defaultTimeSig) {
        if(this.getSection(0).getEndTime() > endTime) {
            this.splitSection(endTime, 0, true);
        }
        var firstSection = this.getSection(0);
        firstSection.setTempo(tempo);
        firstSection.setTimeSig(timeSig);
        firstSection.setName(name);
        firstSection.setType(type);
        firstSection.setIsSnapped(isSnapped);
        this.extendSectionToTimestamp(endTime, 0);
    }
    addSectionAfter(name: string, type: SectionType, startTime: number, endTime: number, isSnapped: boolean = true, tempo: number = this.defaultTempo, timeSig: string = this.defaultTimeSig, db?:boolean) {
        var info = "";

        if(endTime > this.getLength()) {
            endTime = this.getLength();
        }

        var interSectIndex = this.getSectionFromMilli(startTime);
        var interSect = this.sectionList[interSectIndex];

        var nice = startTime + ":"
        if(startTime != interSect.getStart()) {
            nice = this.splitSection(startTime, interSectIndex, false) + "";
        }

        if(this.getSectionFromMilli(endTime) === interSectIndex+1) {
            //The added section exists entirely within another section
            this.splitSection(endTime, interSectIndex+1, false);
            
            var editSect = this.sectionList[interSectIndex+1];
            editSect.setName(name);
            editSect.setTempo(tempo);
            editSect.setTimeSig(timeSig);
            editSect.setType(type);
            return info + "\n";
        }

        if(startTime === interSect.getStart()) {
            //The added section has the same start time as another section
            interSectIndex --;
        }

        startTime = Number(nice.split(":")[0]);
        if(startTime == -1) {
            //If the exisitng measure is too short to split, then shift it over to be one measure
            this.shiftSectionEnds(interSect.getStart(), interSectIndex)
            startTime = interSect.getEndTime();
        }
        var j = interSectIndex + 1;
        
        this.getSection(j).setIsSnapped(isSnapped);
        this.extendSectionToTimestamp(endTime, j);
        var editSect = this.sectionList[j];

        editSect.setName(name);
        editSect.setTempo(tempo);
        editSect.setTimeSig(timeSig);
        editSect.setType(type);
        return info + "\n";
    }

    /** splitSection(number)
     *
     *  Divides the section at the given timestamp into two 
     *  @returns the timestamp of the actual split (may be different than input)
     */
    splitSection(milli: number, index: number = -1, rightMinMatters = true) {
        //If index not given, base it off of the section before the one containing the timestamp
        if(index < 0)
            index = this.getSectionFromMilli(milli);
        //return if timestamp outside of the bounds of the song or index is outside section
        if(milli > this.getLength() || index >= this.sectionList.length) {
            return this.getLength();
        }
        if(milli <= 0) {
            return 0;
        }
        
        //Make section, minimum length of section is 1 measure
        var section = this.sectionList[index];
        var minLength = section.getMBlock().blockToMilli(1, 0);

        //if at end of the song, just do nothing
        if(section.getEndTime() === milli)
            return milli;
        else if(section.getTimeLength() < minLength*2) {
            //Cant split the section if the total length is less than 2 measures
            return -1;
        }

        // The new section created must meet min length requirement
        if(milli - section.getStart() < minLength) {
            //Check minlength on left side
            milli = section.getStart() + minLength;
        } else if(rightMinMatters && section.getEndTime() - milli < minLength) {
            //Check minlength on right side
            milli = section.getEndTime() - minLength;
        }

        var laterSect = section.copy(); 
        section.setEndfromTimestamp(milli, rightMinMatters);
        laterSect.setStart(milli, rightMinMatters);
        this.sectionList.splice(index+1, 0, laterSect);

        return milli;
    }

    /** extendSectionToTimestamp(number, number): number
         *  Extends the section to the given timestamp
         *  if no section given, it extends the section right before
         *      the one contained by the timestamp 
     * 
     */
    extendSectionToTimestamp(milli: number, index: number = -1) {
        if(index < 0) {
            index = this.getSectionFromMilli(milli)-1;
            if(index < 0)
                index = 0;
        }
        if(index === this.sectionCount()-1) {
            if(milli < this.getLength()) {
                this.shiftSectionEnds(milli, index);
                return index;
            }
        }
        //If it actually shortens, then make sure it meets min length requirement
        var minLength = this.sectionList[index].getMBlock().blockToMilli(1, 0);
        if(milli - this.sectionList[index].getStart() < minLength) {
            milli = minLength;
        }

        var j = index+1;
        var toRemove = 0;
        while(j < this.sectionList.length && this.sectionList[j].getEndTime() <= milli) {
            //Find how many sections need to be removed
            toRemove++;
            j++;
        }
        //Remove all da bois in between
        this.sectionList.splice(index+1, toRemove);
        //Increase length of the first section
        this.sectionList[index].setEndfromTimestamp(milli);
        //shift over start of the last section
        if(index+1 < this.sectionList.length)
            this.sectionList[index+1].setStart(milli);
        //Return index of the last section
        return index;
    }

    /** shiftSectionEnds(number, number): number
     * 
     * @param newTime : the new split time between sections
     * @param index : the index of the left section
     * @returns : nuthin
     */
    shiftSectionEnds(newTime: number, index: number) {
        var left = this.sectionList[index];
        var right: SongSection;

        var minLeftTime = left.getMBlock().blockToMilli(1, 0);
        var minRightTime: number;

        if(newTime > this.getLength()) {
            // Can't shift over for more than the song is long
            return "newTime > song length";
        } else if(newTime-left.getStart() < minLeftTime) {
            // Must leave at least one measure in length
            newTime = left.getStart() + minLeftTime;
        }

        if(index === this.sectionList.length-1) {
            // Make new section if at end of song 
            var time = this.splitSection(newTime, index);
            return "" + (index+1) + "/" + this.sectionCount() + " ||| " + time;
        } else {
            right = this.sectionList[index+1];
        }
        console.log("Nice " + newTime);

        minRightTime = right.getMBlock().blockToMilli(1, 0);
        if(right.getEndTime() - newTime < minRightTime) {
            // Must leave at least one measure in length if shifting right
            newTime = right.getEndTime() - minRightTime;
        }

        left.setEndfromTimestamp(newTime);
        right.setStart(newTime);

        return "" + left.getEndTime();
    }

    /**
     * 
     * @param milli time in milliseconds to identify
     * @returns the index of the section number
     */
    getSectionFromMilli(milli: number): number {
        //TODO:: can make this faster by implementing the recursive function to make log(n) runtime
        if(milli < 0 || milli > this.getLength())
            return -1;
        var i = 0;
        for(var sec of this.sectionList) {
            if(milli >= sec.getEndTime()) {
                i++;
                continue;
            }
            return i;
        }
        return -1;
    }
    getSnappedMilli(milli: number, specificity: number = 1) {
        var section = this.getSection(this.getSectionFromMilli(milli));
        var snapped = SongSection.getSnappedMilli(section, specificity, milli);
        return snapped;
    }
    getSectFromMilliRecurse(milli: number, leftBound: number, rightBound: number): number {
        if(rightBound < leftBound)
            return -1;
        var index = (rightBound+leftBound) / 2;
        var sect = this.getSection(index);
        if(milli >= sect.getStart() && milli < sect.getEndTime()) {
            return index;
        }
        if(milli < sect.getStart()) {
            return this.getSectFromMilliRecurse(milli, leftBound, index-1);
        } 
        //if(milli > sect.getEndTime()) { => only other condition
        return this.getSectFromMilliRecurse(milli, index+1, rightBound);
    }

    getUri() {
        return this.uri;
    }

    getDefaultTempo() {
        return this.defaultTempo;
    }

    setDefaultTempo(tempo: number) {
        for(var section of this.sectionList) {
            if(section.getTempo() === this.defaultTempo) {
                section.setTempo(tempo);
            }
        }
        this.defaultTempo = tempo;  
    }

    getDefaultBeatsPerMeasure() {
        return this.defaultBeatsPerMeasure;
    }

    getDefaultTimeSig() {
        return this.defaultTimeSig;
    }

    setDefaultTimeSig(timeSig: string) {
        for(var section of this.sectionList) {
            if(section.getTimeSig() === this.defaultTimeSig) {
                section.setTimeSig(timeSig);
            }
        }
        this.defaultTimeSig = timeSig;  
        this.defaultBeatsPerMeasure = Number(timeSig.split(":")[0]);
    }

    setLength(len: number) {
        this.timeLen = len;
        
        var toKeep = 0;
        for(let i = 0; i<this.sectionCount(); i++) {
            if(this.getSection(i).getStart() < this.timeLen) {
                toKeep++;
            }
        }
        this.sectionList.splice(toKeep, this.sectionCount()-toKeep);
        this.extendSectionToTimestamp(len, toKeep-1);
    }

    getLength() {
        return this.timeLen;
    }

    getLoops() {
        return this.loopList;
    }
    
    getLoopNames() {
        var names: string[] = [];
        var index = 0;
        for(var loop of this.loopList) {
            names.splice(index, 0, loop.getName());
            index++;
        }
        return names;
    }
    addLoop(name: string, startMilli: number, endMilli: number) {
        this.loopList.splice(this.loopList.length, 0, new Loop(this.loopCount, name, startMilli, endMilli, this.getSection(this.getSectionFromMilli(startMilli)), this.getSection(this.getSectionFromMilli(endMilli)))); 
        this.loopCount++;
    }
    getLoop(index: number) {
        return this.loopList[index];
    }
    getLoopFromName(name: string) {
        for(var loop of this.loopList) {
            if(name == loop.getName())
                return loop;
        }
        return Loop.NullLoop();
    }
    setLoopStart(loop: Loop, milli: number, specificity?:number) {
        loop.setStart(milli, this.getSection(this.getSectionFromMilli(milli)), specificity);
    }
    setLoopEnd(loop: Loop, milli: number, specificity?:number) {
            loop.setEnd(milli, this.getSection(this.getSectionFromMilli(milli)), specificity);
    }
    sectionCount() {
        return this.sectionList.length;
    }
    getSections() {
        return this.sectionList;
    }
    getSection(i: number) {
        if(i < 0) {
            return this.sectionList[this.sectionList.length+i];
        }
        return this.sectionList[i];
    }
    getSectString() {
        var output = "";
        for(var sec of this.sectionList ) {

        }

        return output;
    }
    setSections(sectionList: SongSection[]) {
        this.sectionList = sectionList;
    }
    getSectionsCopy() {
        var sectListCopy: SongSection[] = [];
        for(var i = 0; i<this.sectionList.length; i++) {
            sectListCopy.splice(i, 0, this.sectionList[i].copy());
        }
        return sectListCopy;
    }
    getName() {
        return this.name;
    }

    getTrackMeasuresForView() {
        var measures:{type: SectionType, beatsPer: number, isFirst?: boolean}[] = [];    
        for(var i = 0; i<this.sectionCount(); i++) {
            for(var measure of this.getSection(i).getMeasuresForView()) {
                measures.push(measure);
            }
        }
        return measures;
    }

    copy() {
        var copyTrack = new Track(this.mediaSource, this.uri, this.mediaData);
        copyTrack.setLength(this.getLength());
        copyTrack.setDefaultTimeSig(this.defaultTimeSig);
        copyTrack.setDefaultTempo(this.defaultTempo);
        copyTrack.setSections(this.getSectionsCopy());

        return copyTrack;
    }

    getJSON() {
        var trackJSON: any = {
            "name": this.name,
            "artist": this.artist,
            "album": this.album,
            "mediaSource": this.mediaSource,
            "mediaData": this.mediaData,
            "sourceURI": this.uri,
            "tempo": this.defaultTempo,
            "timeSig": this.defaultTimeSig,
            "length": this.getLength(),
            "sectCount": this.sectionCount(),
            "loopCount": this.loopCount,
        }
        for(let i = 0; i<this.sectionCount(); i++) {
            trackJSON["sect" + i] = this.getSection(i).getJSON();
        }
        for(let i = 0; i<this.loopCount; i++) {
            trackJSON["loop" + i] = this.getLoop(i).getJSON();
        }
        return trackJSON
    }
    setJSON(trackData: any) {
        this.name = trackData.name;
        this.artist = trackData.artist;
        this.album = trackData.album;
        this.mediaSource = trackData.mediaSource;
        this.mediaData = trackData.mediaData;
        this.uri = trackData.sourceURI;
        this.setDefaultTempo(trackData.tempo);
        this.setDefaultTimeSig(trackData.timeSig);
        this.setLength(trackData.length);
        this.loopCount = trackData.loopCount;
        var sectionCount: number = trackData.sectCount;
        console.log("SET JSON");
        console.log("\tLoop Num: " + trackData.loopCount);
        console.log("\tSect Num: " + trackData.sectCount);
        this.sectionList = [];
        for(let i = 0; i<sectionCount; i++){
            this.sectionList.splice(i, 0, SongSection.fromParsedJSON(trackData["sect"+i]));
        }
        this.loopList = [];
        for(let i = 0; i<this.loopCount; i++){
            this.loopList.splice(i, 0, Loop.fromParsedJSON(i, trackData["loop"+i], this));
        }
    }
    static fromJSON(trackData: any) {
        var track = new Track(trackData.mediaSource, trackData.uri, trackData.mediaData, trackData.defaultTempo, trackData.defaultTimeSig);
        track.setJSON(trackData);
        
        return track;
    }

    static createTrack(sourceType: Source, uri: string, sourceData: any) {
        return new Track(sourceType, uri, sourceData);
    }
    static splitSection(sects: SongSection[], index: number, timestamp: number) {
        
    }

    static getInfo(sourceType: Source, sourceData: any): [string, string, string, number] {
        switch(sourceType) {
            case Source.AppleMusic: {
                return this.getAppleMusicInfo(sourceData);
            }
            case Source.Spotify: {
                return this.getSpotifyInfo(sourceData);
            }
            case Source.Youtube: {
                return this.getYouTubeInfo(sourceData);
            }
            case Source.MP3: {
                return this.getMP3Info(sourceData);
            }
            default: {
                return this.getAppleMusicInfo(sourceData);
            }
        }
    }
    static getAppleMusicInfo(sourceData: any): [string, string, string, number] {
        //TODO: Implement the source data Interpreter
        return ["", "", "", 240000];
    }
    static getSpotifyInfo(sourceData: any): [string, string, string, number] {
        return ["", "", "", 240000];
    }
    static getYouTubeInfo(sourceData: any): [string, string, string, number] {
        return ["", "", "", 240000];
    }
    static getMP3Info(sourceData: any): [string, string, string, number] {
        return [sourceData.name, sourceData.artist, sourceData.album, sourceData.length];
    }
}

export enum Source {
    AppleMusic = 1,
    Spotify,
    Youtube,
    MP3,
}