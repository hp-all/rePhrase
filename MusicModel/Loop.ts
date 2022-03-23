import SongSection from "./SongSection";
import Track from "./Track";


export default class Loop {
    ID: number;
    name: string;
    startMilli: number;
    endMilli: number;

    startSection: SongSection;
    endSection: SongSection;
    track?: Track;

    constructor(ID: number, name: string, startTime: number, endTime: number, startSection: SongSection, endSection: SongSection, track?: Track) {
        this.ID = ID;
        this.name = name;
        this.startMilli = startTime;
        this.endMilli = endTime;
        this.startSection = startSection;
        this.endSection = endSection;
        this.track = track;
    }

    getID() {
        return this.ID;
    }
    getName() {
        return this.name;
    }
    getStart() {
        return this.startMilli;
    }
    getEnd() {
        return this.endMilli;
    }
    getStartSection() {
        return this.startSection;
    }
    getEndSection() {
        return this.endSection;
    }
    setStart(milli: number, startSection: SongSection, specificity?: number) {
        if(milli < 0) {
            milli = 0;
        }
        if(milli < this.endMilli) {
            this.startMilli = milli;
            this.startSection = startSection;
            if(specificity) {
                this.startMilli = SongSection.getSnappedMilli(startSection, specificity, milli);
            }
        } else {
            this.startMilli = this.endMilli - this.endSection.getMBlock().blockToMilli(1, 0);
            this.startSection = this.endSection;
        }
    }
    setEnd(milli: number, endSection: SongSection, specificity?: number) {
        if(this.track && milli > this.track.getLength())
            milli = this.track.getLength();

        if(milli > this.startMilli) {
            this.endMilli = milli;
            this.endSection = endSection;
            if(specificity) {
                this.endMilli = SongSection.getSnappedMilli(endSection, specificity, milli);
            }
        } else {
            this.endMilli = this.startMilli + this.startSection.getMBlock().blockToMilli(1, 0);
            this.endSection = this.startSection;
        }
    }

    getJSON(): JSON {
        var loopJSON: any = {
            "name": this.name,
            "startMilli":this.startMilli,
            "endMilli":this.endMilli,
        }
        return <JSON>loopJSON;
    }
    static fromParsedJSON(id: number, loopData: any, track: Track) {
        var startSect = track.getSection(track.getSectionFromMilli(loopData.startMilli));
        var endSect = track.getSection(track.getSectionFromMilli(loopData.endMilli));
        return new Loop(id, loopData.name, loopData.startMilli, loopData.endMilli, startSect, endSect, track);
    }

    isNull() {
        return this.ID === -1;
    }
    static NullLoop() {
        var dude = new SongSection("", 0, 0, 0, "");
        return new Loop(-1, "none", 0, 0, dude, dude);
    }
}
Loop.prototype.toString = function loopstring() {
    return this.name;
}