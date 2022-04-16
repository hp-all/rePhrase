import Track from "../MusicModel/Track";
import TrackyPlayer from "../MusicModel/TrackPlayer";
import SongSection, { SectionType } from "../MusicModel/SongSection";
import Loop from "../MusicModel/Loop";
import { View, Text} from "./Themed";
import { appStyles as styles, colorTheme, leftBorderRadius, rightBorderRadius } from "./AppStyles";
import Layout from "../constants/Layout";

const windowWidth = Layout.window.width;
const viewAreaFactor = 0.9;
const splitViewArea = (factor: number) => {return (windowWidth*viewAreaFactor)/factor;}

export type LoopSkelly = {loopName: string, start: number, end: number};
export type SectionSkelly = {sectionName: string, type: SectionType, start: number, end: number, tempo: number, timeSig: string}

export const barPositioning = {
	spacing: 52,
	height: 40,
	marginTop: 52-40,
	borderRadius: 4,
	xShift: 12,
}

export class ChangeLog {
	private changes: any[] = [];
    private changeCount = 0;
    statePointer = -1;
	constructor() {

	}
    //Adds a change at the current state pointer, and deletes everything after it
	addChange(state: any) {
        var changesBeyond = this.changeCount - this.statePointer - 1;
        if(this.changeCount == 0)
            changesBeyond = 0;
        console.log("Adding at index: " + (this.statePointer+1) + ", deleting: " + changesBeyond);
        this.statePointer++;
        this.changes.splice(this.statePointer, changesBeyond, state);
        this.changeCount = this.changeCount+1 - changesBeyond;
	}
	undo() {
        if(this.changeCount > 0 && this.statePointer > 0) {
            this.statePointer --;
            return this.changes[this.statePointer];
        }
	}
	redo() {
        if(this.statePointer < this.changeCount-1) {
            this.statePointer ++;
            return this.changes[this.statePointer];
        }
	}
    getCurrentState() {
        return this.changes[this.statePointer];
    }
    count() {
        return this.changeCount;
    }
    at = (i: number) => {
        return this.changes[i];
    }
}

export class TrackPlayerController {
	track: Track;
	trackPlayer: TrackyPlayer;
	isLoaded = false; 	isPlaying = false;
	songLen: number; 	songPos = 0; 		songFrac = 0;
	doLoop = false;		loopStart = 10250; 	loopEnd = 14000; 	selectedLoop: Loop;
	sectionStart = 0; 	sectionEnd = 1;

	viewPos = 0; isMoving: boolean;

	constructor(track: Track, trackPlayer: TrackyPlayer) {
		this.track = track;
		this.trackPlayer = trackPlayer;
		this.songLen = track.getLength();
		this.songPos = 0;
		this.isMoving = false;
		this.isLoaded = false;     
		this.selectedLoop = Loop.NullLoop();
		this.sectionStart = track.getSection(0).getStart();
		this.sectionEnd = track.getSection(0).getEndTime();
	}

	setTrack = (track: Track) => {
		this.track = track;
		this.sectionStart = track.getSection(0).getStart();
		this.sectionEnd = track.getSection(0).getEndTime();
		this.trackPlayer.setTrack(track);
	}
	setState = (s: any) => {
		this.isLoaded = s.isLoaded;
		this.isPlaying = s.isPlaying;
		if(s.songLen > 1)
			this.songLen = s.songLen;
		this.songPos = s.songPos;
		this.songFrac = s.songFrac;
		this.doLoop = s.doLoop;
		this.loopStart = s.loopStart;
		this.loopEnd = s.loopEnd;

		if(s.isLoaded && s.songPos < this.sectionStart || s.songPos >= this.sectionEnd) {
			var section = this.track.getSection(this.track.getSectionFromMilli(s.songPos));
			// console.log("Setting update interval: " + section.getMilliInMeasure()/section.getBeatsPerBar() + " bc " + s.songPos + " isn't in " + this.sectionStart + "-" + this.sectionEnd);
			this.sectionStart = section.getStart();
			this.sectionEnd = section.getEndTime();
			//Set to always update on the beat
			this.trackPlayer.setUpdateIntervalMilli(section.getMilliInMeasure()/section.getBeatsPerBar());
		}
		
	}
	
	togglePlay = () => {
		if(this.isLoaded)
			this.trackPlayer.togglePlay();
	}
	restart = () => {
		if(this.isLoaded) {
			this.trackPlayer.restart();
			this.setMoving(0);
		}
	}
	setMoving = (milli: number) => {
		this.songPos= milli;
		this.isMoving= true;
	}
	goTo = (milli: number) => {
		if(this.isLoaded) {
			this.trackPlayer.goTo(milli);
			this.setMoving(milli);
		}
	}
	setLoop = (loop: Loop) => {
		this.selectedLoop = loop;
		if(loop.isNull()) {
			this.trackPlayer.setLoopMode(false);
		} else {
			this.trackPlayer.setLoopMode(true);
			this.trackPlayer.setLoop(loop);
			if(!this.trackPlayer.isQueued)
				this.setMoving(loop.getStart());
		}
	}
	getLoopName = () => {
		return this.selectedLoop.getName();
	}
	editLoopStart = (loop: Loop, milli: number, specificity?: number) => {
		this.track.setLoopStart(loop, milli, specificity);
		this.trackPlayer.updateLoop(loop);
	}
	editLoopEnd = (loop: Loop, milli: number, specificity?: number) => {
		this.track.setLoopEnd(loop, milli, specificity);
		this.trackPlayer.updateLoop(loop);
	}
	editSectionEnd = (milli: number, index: number) => {
		this.track.shiftSectionEnds(milli, index);
	}

	getSection = (index: number) => {
		return this.track.getSection(index);
	}
	getSectionIndex = (milli: number) => {
		return this.track.getSectionFromMilli(milli);
	}
	snapMilli = (milli: number, specificity: number) => {
		if(specificity == -2)
			return milli;
		return this.track.getSnappedMilli(milli, specificity);
	}
}

export class MeasureMaker {
	track: Track;
	songMilli: number;
	viewSize: "small"|"medium"|"large" = "small";
	pixToSec: number = 1;
	secPerLine: number = 1;
	measuresPerLine: number = 2;
	isuptodate: {small: boolean, medium: boolean, large: boolean} = {small: false, medium: false, large: false}
	premadeMeasures: {
		simple: {
			small: (undefined | JSX.Element)[] | undefined,
			medium: (undefined | JSX.Element)[] | undefined,
			large: (undefined | JSX.Element)[] | undefined,
		},
		marked: {
			small: (undefined | JSX.Element)[] | undefined,
			medium: (undefined | JSX.Element)[] | undefined,
			large: (undefined | JSX.Element)[] | undefined,
		}
	} = {simple: {small: undefined, medium: undefined, large: undefined}, marked: {small: undefined, medium: undefined, large: undefined}}
	constructor(track: Track, size: "small"|"medium"|"large") {
		this.track = track;
		this.songMilli = track.getLength();

		this.setSize(size);
	}
	
	setTrack = (track: Track) => {
		this.track = track;
		this.songMilli = track.getLength();
		this.reset();
		this.setSize(this.viewSize);
	}
	reset = () => {
		this.isuptodate = {small: false, medium: false, large: false}
		this. premadeMeasures = {
			simple: {small: undefined, medium: undefined, large: undefined}, 
			marked: {small: undefined, medium: undefined, large: undefined}
		};
	}

	needsUpdate = () => {
		if(this.songMilli != this.track.getLength()) {
			this.reset();
			return true;
		}
		return false;
	}
	recompute = () => {
		this.songMilli = this.track.getLength();
		this.reset();

		this.setSize("small");
		this.setSize("medium");
		this.setSize("large");

		this.setSize(this.viewSize);
	}
	setSize = (size: "small"|"medium"|"large") => {
		this.viewSize = size;
		this.measuresPerLine = 2;
		switch(size) {
			case("small"): {
				this.measuresPerLine = 8;
				break;
			}
			case("medium"): {
				this.measuresPerLine = 4;
				break;
			}
		}
		this.secPerLine = this.track.getDefaultTempo()/60 * this.measuresPerLine*this.track.getDefaultBeatsPerMeasure();
		this.pixToSec = splitViewArea(this.secPerLine);

		if(!this.isuptodate[size]) {
			this.premadeMeasures.marked[size] = this.makeMeasureView(true);
			this.premadeMeasures.simple[size] = this.makeMeasureView(false);
			this.isuptodate[size] = true;
		}
	}
	getPixToSec = () => {
		return this.pixToSec;
	}
	getSecPerLine = () => {
		return this.secPerLine;
	}
	getMeasures = (isSimple: boolean) => {
		if(!this.isuptodate[this.viewSize])
			this.setSize(this.viewSize);
		if(isSimple)
			return this.premadeMeasures.simple[this.viewSize];
		
		return this.premadeMeasures.marked[this.viewSize];
	}

	makeMeasureView = (showLines: boolean) => {
		var lines: (JSX.Element|undefined)[] = [];
		var currentSec = 0;
		var index = 0;
		do {
			lines.splice(index, 0, this.makeRow(index, currentSec, showLines));
			index++;
			currentSec += this.secPerLine;
		} while(currentSec < this.songMilli/1000);

		return lines;
	}
	private makeRow(index: number, currentSec: number, showLines: boolean) {

		//Width of the line is the standard line size, or until the end of the song (whichever is shorter)
		var secWidth = Math.min(this.secPerLine, this.songMilli/1000-currentSec);
		var pixWidth = secWidth*this.pixToSec;
		var sectionViews;
		if(showLines)
			sectionViews = this.makeSectionParts(currentSec, (index+1)*secWidth, true);
		else
			sectionViews = this.makeSectionParts(currentSec, (index+1)*secWidth, false);
		return (
			<View key={index} style={{width: pixWidth, height: barPositioning.height, marginTop: barPositioning.marginTop, padding: 7, paddingLeft: 4, backgroundColor: 'transparent'}}>
				{sectionViews}
			</View>
		);
	}
	private makeSectionParts(startSec: number, rowEndSec: number, showLines: boolean) {
		var sections: JSX.Element[] = [];
		var index = 0;
		var sectionIndex = this.track.getSectionFromMilli(startSec*1000);
		var currentSec = startSec;

		while(currentSec < this.track.getSection(sectionIndex).getEndTime()/1000 && currentSec < rowEndSec) {
			var section = this.track.getSection(sectionIndex);
			
			var sectionPartEndSec = Math.min(section.getEndTime()/1000, rowEndSec);
			var label = null;

			var positioning = {
				left: (currentSec-startSec)*this.pixToSec,
				width: (sectionPartEndSec - currentSec)*this.pixToSec,
				height: barPositioning.height,
			}

			var aesthetic = {
				backgroundColor: section.getColor(),
				paddingVertical: 5, 
				paddingLeft: 4,
				...leftBorderRadius((currentSec===startSec)? barPositioning.borderRadius: 0), 
				...rightBorderRadius((sectionPartEndSec===rowEndSec)? barPositioning.borderRadius: 0),
			}
			if(currentSec === section.getStart()/1000) {
				label = (<Text>{section.getType()}</Text>);
			}
			var lines = null;
			if(showLines) {
				lines = this.makeBarMarkers(section, currentSec-section.getStart()/1000, currentSec%this.secPerLine);
			}
			var sectionView = (
				<View key={index} style={[positioning, aesthetic, {position: 'absolute'}]}>
					{label}
					{lines}
				</View>
			);

			sections.splice(index, 0, sectionView);

			sectionIndex++;
			index++;
			if(sectionIndex >= this.track.sectionCount())
				break;
			currentSec = this.track.getSection(sectionIndex).getStart()/1000;
		}
		return sections;
	}
	private makeBarMarkers(section: SongSection, secInSection: number, secInLine: number) {
		var barlines: JSX.Element[] = [];
		var time = Math.min(section.getTimeLength()/1000 - secInSection, this.secPerLine-secInLine);
		var secToBar = section.getMilliInMeasure()/1000;
		var barNum = Math.floor(secInSection/secToBar);
		var index = 0;

		var barPixDensity = secToBar*this.pixToSec;
		var beatPixDensity = barPixDensity/section.getBeatsPerBar();

		var barDensityThreshold = 30;
		var secInterval = secToBar;
		var specificity = 0;

		if(beatPixDensity > 100) {
			//Show quarter beats
		} else if(beatPixDensity > 15) {
			//Show half beats
			specificity = 2;
			secInterval = secToBar/section.getBeatsPerBar()/specificity;
		} else if(beatPixDensity > 10) {
			// Show the beat
			specificity = 1;
			secInterval = secToBar/section.getBeatsPerBar();
		}
		var lineBitRemaining = (secInterval-(secInSection%secInterval))%secInterval;
		var linesSoFar = Math.floor(secInSection/secInterval);
		
		var debug = secInSection == 14 && section.getType() === SectionType.B && this.secPerLine == 16;
		if(beatPixDensity)
		do {
			var color = 'rgba(110, 110, 110, 0.5)'
			var lineBuffTop = 0;
			var lineBuffBot = 0;
			var width = 2;
			
			debug = secInSection === 0 && index < 40 && section.getType() === SectionType.A && this.secPerLine == 16;
			
			//Show beats and sub beats
			var type = index + linesSoFar + ((lineBitRemaining !== 0)? 1: 0);
			if(specificity > 0) {
				if(type % (4*specificity*section.getBeatsPerBar()) === 0) {
					width = 2;
				} else if(type % (specificity*section.getBeatsPerBar()) === 0) {
					width = 1;
				} else if(type % (specificity) === 0){
					lineBuffTop = 15;
					width = 1;
				} else {
					lineBuffTop = 25;
					width = 1;
				}
			} else if(Math.floor(barNum%4) != 0) {
				if(barPixDensity < barDensityThreshold)
					lineBuffTop = lineBuffBot = 2;
				width = 1;
			}
			var barline = (
				<View key= {index} style={{position: 'absolute', left: ((index)*secInterval + lineBitRemaining)*this.pixToSec, top: lineBuffTop, bottom: lineBuffBot, borderLeftWidth: width, borderColor: color, backgroundColor: 'transparent', flex: 1}}/>
			)
			barlines.splice(index, 0, barline);

			time -= secInterval;
			barNum++;
			index++;
		} while(time >= secInterval/2);

		return barlines;
	}

	makeSubGroupView = (startMilli: number, endMilli: number, type: 'playPos'|'highlight'|'loop', loopName?: string) => {
		var lines: (JSX.Element|undefined)[] = [];    
		if(startMilli > this.songMilli) 
			startMilli = 0;  
		var currentSec = startMilli/1000;
		var endSec = endMilli/1000;

		var index = Math.floor(currentSec/this.secPerLine);		

		do {
			lines.splice(index, 0, this.subSectionOnRow(index, currentSec, endSec, type, loopName));
			
			index ++;
			currentSec = index*this.secPerLine;
		} while(currentSec < this.songMilli/1000 && currentSec < endSec);
		return lines;
	}
	private subSectionOnRow(index: number, currentSec: number, endSec: number, type: 'loop'|'highlight'|'playPos'|string, loopName?: string) {
		var rowStartSec = currentSec-index*this.secPerLine;		// [------------|===]
		var rowEndSec = (index+1)*this.secPerLine;				// [========|-------]
		var secBlock = endSec-currentSec;
		if(endSec > rowEndSec)
			secBlock = rowEndSec-currentSec;

		//Positioning and dimensions
		var positioning = {
			top: index*barPositioning.spacing,
			left: rowStartSec*this.pixToSec,
			width: secBlock*this.pixToSec,
			height: barPositioning.height,
			marginTop: (barPositioning.marginTop),
		}
		
		//Asstetics
		var aesthetics = {
			borderRadius: barPositioning.borderRadius,
			backgroundColor: colorTheme['t_light'],
			opacity: 0.9,
			padding: 7,
			paddingLeft: 4,
		}

		//Sub info
		var loopLabel = null;

		switch(type) {
			case 'loop': {
				positioning.height = barPositioning.height/2; 
				positioning.top += barPositioning.height/2;
				aesthetics.padding = 3;
				if(loopName)
					loopLabel = <Text style={[styles.subheader, {opacity: 0.9, color: colorTheme['t_dark'], fontSize: 13}]}>{loopName}</Text>
				break;
			}
			case 'highlight': {
				aesthetics.backgroundColor= colorTheme['t_white'];
				aesthetics.opacity= 0.5;
				break;
			}
			case 'playPos': {
				aesthetics.backgroundColor= colorTheme['t_dark'];
				aesthetics.opacity= 0.5;
				break;	
			}
		}
		if(positioning.width < 0.1)
			return undefined;
		return <View key={index} style={[positioning, aesthetics, {position: 'absolute'}]}>{loopLabel}</View>;
	}
	

	getBarNumFromY = (y: number) => {
		var newY = Math.floor((y)/barPositioning.spacing);
		if(newY < 0) 
			newY = 0;
		if(newY > 13) 
			newY = 13;
		return newY;
	}
	constrainYValToBars = (y: number) => {
		return this.getBarNumFromY(y)*barPositioning.spacing + (barPositioning.marginTop);
	}
	constrainXValToBars = (x: number) => {
		var width = splitViewArea(1);
		var leftBound = 0;//((width/viewAreaFactor) * (1-viewAreaFactor))/2;
		var rightBound = leftBound + width;
		if(x < leftBound)
			return leftBound;
		if(x > rightBound)
			return rightBound;
		return x;
	}
	mapMilliToCoord = (milli: number) => {
		var secPerLine = this.getSecPerLine();
		var pixToSec = this.getPixToSec();
		var sec = milli/1000;
		var y = Math.floor(sec/secPerLine) * barPositioning.spacing + (barPositioning.marginTop);
		var x = (sec%secPerLine) * pixToSec + barPositioning.xShift;
		// y = 0;
		return {x: x, y:y};
	}
	mapCoordToMilli = ({x, y}: {x: number, y: number}, specificity: number) => {
		x = this.constrainXValToBars(x - barPositioning.xShift);
		y = this.constrainYValToBars(y);

		var secPerLine = this.getSecPerLine()
		var pixToSec = this.getPixToSec();

		var seconds = this.getBarNumFromY(y)*secPerLine + (x+barPositioning.xShift)/pixToSec;
		return this.snapMilli(Math.floor(seconds*1000), specificity);
	}
	snapMilli = (milli: number, specificity: number) => {
		if(specificity == -2)
			return milli;
		return this.track.getSnappedMilli(milli, specificity);
	}
}

export function Spacer (props: {children?: any, flex?: number, flexBasis?: number}) {
	var flexThing = null;
	if(props.flex)
		flexThing = {flex: props.flex}
	else if(props.flexBasis)
		flexThing = {flexBasis: props.flexBasis}
	return (
		<View style={flexThing}>
			{props.children}
		</View>
	)
}

/**
 * course(courseID)
 * Takes(studentID, courseID)
 * Student(id, major)
 * Faculty(id, salary)
 * Person(id, countryName, name)
 * Country(name, region)
 */