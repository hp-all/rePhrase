import { SectionColor } from "../components/AppStyles";
import Track from "./Track.js";
import TimeBlock from "./TimeBlock";

export default class SongSection {
    private minToMilli= 60*1000;
    private name: string;
    private type: SectionType;
    
    private startMilli: number;
    private block: TimeBlock;
    private timeSig: string;
    private color: string;

    constructor(name: string, startTime: number, endTime: number, tempo: number, timeSig: string, type = SectionType.IDK) {
        this.name = name;
        this.type = type;

        this.startMilli = startTime;
        this.timeSig = timeSig;
        this.block = new TimeBlock(true, endTime-startTime, tempo, timeSig);

        this.block.setBeatsPerMeasure(Number(this.timeSig.split(":")[0]));

        this.color = SectionColor[type];
    }    
    getName() {
        return this.name
    }
    setName(name: string) {
        this.name = name;
    }
    getColor() {
        return this.color;
    }
    setColorTheme(c: keyof typeof SectionColor) {
        this.color = SectionColor[c];
    }
    setColor(c: string) {
        this.color = c;
    }
    getTempo():number {
        return this.block.getTempo();
    }
    setTempo(temp: number) {
        this.block.setTempo(temp);
    }
    setStart(milli: number, minMatters: boolean = true) {
        var newDeltaT = this.getEndTime() - milli;
        if(minMatters) {
            var minTime = this.getMBlock().blockToMilli(1, 0);
            if(newDeltaT < minTime) {
                milli = this.getEndTime() - minTime;
                newDeltaT = minTime;
            }
        }
        this.startMilli = milli;
        this.block.setTime(newDeltaT)
    }
    getStart() {
        return this.startMilli;
    }
    setEndfromTimestamp(milli: number, minMatters: boolean = true) {
        var deltaT = milli - this.getStart();
        if(deltaT < 0) {
            deltaT = 0;
        }
        var minLen = this.getMBlock().blockToMilli(1, 0);

        if(minMatters && deltaT < minLen) {
            this.block.setTime(minLen);
        } else {
            if(!minMatters) {
                this.block.isSnapped = false;
            }
            this.block.setTime(deltaT);
        }
    }
    getEndTime() {
        return this.startMilli + this.block.getMilli();
    }
    getTimeLength() {
        return this.block.getMilli();
    }
    getTimeSig() {
        return this.timeSig;
    }
    setTimeSig(timeSig: string) {
        this.timeSig = timeSig;
        this.block.setBeatsPerMeasure(Number(timeSig.split(":")[0]));
    }
    getBeatsPerBar() {
        return this.block.getBeatsPerMeasure();
    }
    getMilliInMeasure() {
        return this.block.blockToMilli(1, 0);
    }
    getMBlock() {
        return this.block;
    }

    blockToTimestamp(measures: number, beatSubdivision: number):number {
        var sumBeats = measures*this.getBeatsPerBar() + beatSubdivision;
        var milliSinceSectionStart = (sumBeats/this.getTempo())*this.minToMilli;

        return this.getStart() + milliSinceSectionStart;
    }

    // Returns the measure block relative to the start position
    milliToBlock(milli: number): [number, number] {
        var deltaT = milli - this.getStart();
        //Return nothing if the given time is beyond the length of this section
        if(deltaT < 0)
            return [0, 0];
        else if(deltaT > this.getTimeLength()) {
            return this.getMBlock().getBlock();
        }

        var sumBeats = (deltaT/this.minToMilli) * this.getTempo();
        var sumMeasures = Math.floor(sumBeats / this.getBeatsPerBar());
        var sumBeats = sumBeats % this.getBeatsPerBar();
        return [sumMeasures, sumBeats];
    }
    setType(type: SectionType) {
        this.type = type;
        this.color= SectionColor[type];
    }
    setIsSnapped(bool: boolean= true) {
        this.block.isSnapped = bool;
    }
    getType() {
        return this.type;
    }
    copy() {
        return new SongSection(this.getName(), this.getStart(), this.getEndTime(), this.getTempo(), this.getTimeSig(), this.getType());
    }
    
    getMeasuresForView(): {type: SectionType, beatsPer: number, isFirst?: boolean}[]{
        var measures:{type: SectionType, beatsPer: number, isFirst?: boolean}[] = [];
    
        measures.push({type: this.getType(), beatsPer: this.getBeatsPerBar(), isFirst: true});
        for(let i = 1; i<this.getMBlock().getBlock()[0]; i++) {
            measures.push({type: this.getType(), beatsPer: this.getBeatsPerBar()});
        }
    
        return measures;
    }
    
    getJSON(): JSON {
        var sectionJSON: any = {
            "name": this.name,
            "type": this.type,
            "tempo": this.getTempo(),
            "timeSig": this.timeSig,
            "startMilli":this.startMilli,
            "endMilli":this.getEndTime(),
            "color": this.color,
        }
        return <JSON>sectionJSON;
    }
    setJSON(sectData: any) {
        this.setName(sectData.name);
        this.setType(sectData.type);
        this.setTempo(sectData.tempo);
        this.setTimeSig(sectData.timeSig);
        this.setStart(sectData.startMilli);
        this.setEndfromTimestamp(sectData.endMilli, false);
        this.setColor(sectData.color);
    }

    /*  
     *  @param specificity: determines how much snapping will happen
           -1: Snap to beggining or end of section
            0: Snap to a Measure
            1: Snap to a Beat
            2: Snap to half beats
            4: Snap to quarter beats
            8: Snap to eighth beats
     *
     *  @returns the time stamp after being snapped to a measure or whatever
                in seconds
     */
    static getSnappedMilli(section: SongSection, specificity: number, milli: number): number {
        //TODO refactor milliseconds
        var timestamp = milli;
        if(specificity === -1) {
            var halfPoint = section.getStart() + section.getTimeLength()/2;
            if(timestamp < halfPoint) {
                return section.getStart();
            } else {
                return section.getEndTime();
            }
        }

        //The difference between the timestamp and the begining of the section in question
        var [ measureNum, beatSubdivision ] = section.milliToBlock(timestamp);
        if(specificity === 0) {
            if(beatSubdivision >= section.getBeatsPerBar()/2) {
                measureNum++;
            }
            return section.blockToTimestamp(measureNum, 0);
        }
        if(specificity === 1) {
            specificity = 1;
        }
        var specDec = 1/specificity;
        var halfSpec = specDec/2;
        var remainder = beatSubdivision % specDec;

        beatSubdivision -= remainder;
        if(remainder >= halfSpec) {
            beatSubdivision += specDec;
            if(beatSubdivision > section.getBeatsPerBar()) {
                beatSubdivision = beatSubdivision % section.getBeatsPerBar();
                measureNum++;
            }
        }
        return section.blockToTimestamp(measureNum, beatSubdivision);
    }
    static fromParsedJSON(sectData: any) {
        var sect = new SongSection(sectData.name, sectData.startMilli, sectData.endMilli, sectData.tempo, sectData.timeSig, sectData.type);
        sect.setJSON(sectData);
        return sect;
    }
}


export enum SectionType {
    IDK = "...",
    Verse = "Verse",
    Chorus = "Chorus",
    Bridge = "Bridge",
    A = "A",
    B = "B", 
    C = "C",
    D = "D",
    E = "E",
    F = "F",
    Intro = "Intro",
    Outro = "Outro",
}