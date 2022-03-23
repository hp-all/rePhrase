

/*  
 *  Time Block
 *      Class to keep track of blocks of measures and to quickly convert to time
 */
export default class TimeBlock {
    minToMilli = 60*1000;
    isSnapped: boolean;
    milliLength: number;
    
    tempo: number;
    beatsPerMeasure: number;

    measureCount: number;
    beatSubdivision: number;
    
    constructor(isSnapped: boolean, milliLength: number, tempo: number, timeSig: string|number, measureCount: number = 0, beatSubdivision: number = 0) {
        this.isSnapped = isSnapped;

        this.milliLength = milliLength;
        
        this.tempo = tempo;
        if(typeof timeSig === 'string') {
            timeSig = timeSig.split(":")[0]
        }
        this.beatsPerMeasure = Number(timeSig);

        this.measureCount = measureCount;
        beatSubdivision = Number(beatSubdivision.toFixed(2));
        this.beatSubdivision = beatSubdivision;

        if(milliLength === 0) {
            this.setBlock(measureCount, beatSubdivision);
        } else {
            this.setTime(milliLength);
        }
    }

    blockToMilli(measures: number = this.measureCount, beatSub: number = this.beatSubdivision) : number {
        var sumBeats = beatSub + measures*this.beatsPerMeasure;
        var milli = (sumBeats/this.tempo) * this.minToMilli;
        return milli
    }
    milliToBlock(milli: number = this.milliLength, db?: boolean) : [number, number] {
        var sumBeats = (milli/this.minToMilli) * this.tempo;
        var sumMeasures = Math.floor(sumBeats / this.beatsPerMeasure);
        var sumBeats = sumBeats % this.beatsPerMeasure;
        if(db) {
            console.log("tempo: " + (this.tempo) + " milli: " + milli);
        }
        return [sumMeasures, Number(sumBeats.toFixed(2))];
    }
    resetBlock() {
        [ this.measureCount, this.beatSubdivision ] = this.milliToBlock();
    }
    resetTime() {
        this.milliLength = this.blockToMilli();
    }


    setTime(milli: number, snap: boolean = true) {
        this.milliLength = milli;
        [ this.measureCount, this.beatSubdivision ] = this.milliToBlock();

        //If snap is on, it doesn't allow any value for the beat sub division and will adjust the time accordingly
        if(snap && this.isSnapped && this.beatSubdivision > 0) {
            if(this.beatSubdivision > this.beatsPerMeasure/2) {
                this.measureCount++;
            }
            this.beatSubdivision = 0;
            this.resetTime();
        }
    }
    setBlock(measures: number, beatsd: number) {
        this.measureCount = measures;
        this.beatSubdivision = beatsd;

        if(this.isSnapped && this.beatSubdivision > 0) {
            if(this.beatSubdivision > this.beatsPerMeasure/2) {
                this.measureCount++;
            }
            this.beatSubdivision = 0;
        }

        this.resetTime();
    }
    setTempo(tempo: number) {
        if(tempo < 1)
            return;
        this.tempo = tempo;
        this.resetBlock();
    }
    setBeatsPerMeasure(beatsPer: number) {
        if(beatsPer < 1)
            return;
        this.beatsPerMeasure = beatsPer;
        this.resetBlock();
    }

    getMilli() : number {
        return this.milliLength;
    }
    getBlock() : [number, number] {
        return [ this.measureCount, this.beatSubdivision ];
    }
    getTempo() : number {
        return this.tempo;
    }
    getBeatsPerMeasure() : number {
        return this.beatsPerMeasure;
    }
    
    copy() {
        return new TimeBlock(this.isSnapped, this.getMilli(), this.getTempo(), this.getBeatsPerMeasure()+":");
    }
}
