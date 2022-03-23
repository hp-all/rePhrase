import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { TouchableOpacity, ScrollView, SafeAreaView, Platform, Animated} from 'react-native';
import { Text, View } from '../components/Themed';
import Layout from "../constants/Layout";

import { appStyles as styles, bottomBorderRadius, colorTheme, leftBorderRadius, rightBorderRadius, topBorderRadius } from '../components/AppStyles';
import { Draggable, Buddon, ButtonGroup, PopupTrigger } from '../components/Buddons';
import { Form, FormNumber, FormText } from '../components/Form';
import { barPositioning, ChangeLog, TrackPlayerController, MeasureMaker } from '../components/MusicComponents';

import SongSection, { SectionType } from '../MusicModel/SongSection';
import Track, { Source } from '../MusicModel/Track';
import Loop from '../MusicModel/Loop';
import TrackyPlayer from '../MusicModel/TrackPlayer';

const frootSongSource = require('../assets/soundFiles/lofi_fruits_jazz.mp3');
const windowWidth = Layout.window.width;
const windowHeight = Layout.window.height-100;
const viewAreaFactor = 0.9;
const splitViewArea = (factor: number) => {return (windowWidth*viewAreaFactor)/factor;}
const thumbOffX = -30;
const thumbOffY = -300;


export default function AssignSectionScreen() {
	console.log("----Start Assign Section Screen -----");
	var frootSongTrack = new Track(Source.MP3, frootSongSource, 
			{name: "Froot Song (ft. Jazz)", artist: "Test Track", album: "from SoundCloud", length: 203000}
		);
	frootSongTrack.name = "Froot Song (ft. Jazz)"
frootSongTrack.addSection("First Song", SectionType.A, 0, 98000, true, 120);
	frootSongTrack.addSection("Solo", SectionType.Verse, 56000, 80000, true, 120);
	frootSongTrack.addSection("Second Song", SectionType.B, 98000, 1000000, true, 70, "4:4", true);

	frootSongTrack.addLoop("small boy", 10000, 14000);
	frootSongTrack.addLoop("solo snip", 56000, 68000);


	// var trackController: TrackPlayerController = new TrackPlayerController();

	return(
		<View style={[styles.container, styles.darkbg]}>
			<Text style={styles.title}>{frootSongTrack.name}</Text>
			<TrackAssignView track= {frootSongTrack}/>
		<StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
		</View>
	);
}

type tavP = {track: Track};
type tavS = {
	trackPlayer: TrackyPlayer, 
	selectedViewSize: ViewSizeOptions, simpleView: boolean,
	snapSpecificity: number, editMode: EditBlockOptions, fingiePlace: number,
	trackPlayerController: TrackPlayerController;
	reRenderThing: boolean,
	isMoving: boolean, viewPos: number, highlight: {start: number|null, end: number|null}, highlightState: 'not'|'waiting'|'start'|'end', 
	showToolMenu: boolean, toolTransitionYVal: number, animateTool: Animated.ValueXY,
	showPopup: boolean,
};
class TrackAssignView extends React.Component<tavP, tavS>{
	changeLog: ChangeLog = new ChangeLog();
	snapOptions: any = {none: -2, Section: -1, Measure: 0, Beat: 1, HalfBeat: 2};
	toolComponentHeight = 220;
	toolAnimDuration = 350;
	popupTitle: string; popupOptions: any; popupHeight: number; popupSelectedOption: any;
	updateStatus: (s:any) => void;

	constructor(props:any) {
		super(props);
		
		this.popupTitle= "";
		this.popupOptions= [];
		this.popupHeight= 150;
		this.popupSelectedOption= "";

		//Passed to Track Player so it can modify the state of the song
		this.updateStatus = (s:any) => {
			if(this.state) {
				this.state.trackPlayerController.setState(s);

				if((s.isPlaying && !this.state.isMoving) || (Math.abs(this.state.viewPos-s.songPos) <= 502)) {
					this.setState({
						viewPos: s.songPos,
						isMoving: false
					});
				}
				this.setState({
					reRenderThing: !this.state.reRenderThing
				});
			}
		};

		//Initializes the state variables for the View
		var boy = new TrackyPlayer(this.updateStatus);
		this.state = {
			trackPlayer: boy,
			trackPlayerController: new TrackPlayerController(this.props.track, boy),
			selectedViewSize: ViewSizeOptions.large,
			editMode: EditBlockOptions.none,
			simpleView: true,
			fingiePlace: 0, snapSpecificity: 0,
			isMoving: false, viewPos: 0, highlight: {start: null, end: null}, highlightState: 'not',
			showToolMenu: false, toolTransitionYVal: 0, animateTool: new Animated.ValueXY(),
			reRenderThing: false,
			showPopup: false,
		}

		var callback = (value: any) => {this.setState({toolTransitionYVal: value.y})};    
		this.state.animateTool.setValue({x: 0, y: 0});
		this.state.animateTool.addListener(callback);
	}
	componentDidMount() {this.state.trackPlayer.setTrack(this.props.track);}
	componentWillUnmount() {this.state.trackPlayer.unload();}

	//Button Setting Stuff
	setSize = (size: ViewSizeOptions) => {
		this.setState({
			selectedViewSize: size,
		});
	}
	setSnap = (snapSetting: SnapOptions) => {
		var sset:string = snapSetting.replace(" ", "")
		console.log(this.snapOptions[sset] + ": " + sset + " " + this.snapOptions[sset]);
		this.setState({
			snapSpecificity: this.snapOptions[sset],
		});
	}
	setEditMode = (editMode: EditBlockOptions) => {
		this.setState({
			editMode: editMode,
		})
	}
	toggleSimpleView = () => {
		this.setState({
			simpleView: !this.state.simpleView,
		});
	}
	borsMouseListener = (isEndTouch: boolean, pos: number) => {
		if(this.state.highlightState != 'not') {
			if(this.state.highlight.start == null) {
				this.setState({
					highlight: {start: pos, end: null},
					highlightState: 'start',
				});
			} else if(this.state.highlight.end == null) {
				this.setState({
					highlight: {start: this.state.highlight.start, end: pos},
					highlightState: 'end',
				});
			} else {
				var hState = this.state.highlightState;
				if(hState === 'waiting') {
					if(Math.abs(pos-this.state.highlight.start) < Math.abs(pos-this.state.highlight.end)) 
						hState = 'start';
					else
						hState = 'end';
				}
				if(hState === 'start') {
					//Reseting the start position of the highlight
					if(pos < this.state.highlight.end)
						this.setState({highlight: {start: pos, end: this.state.highlight.end},});
				} else {
					//Resetting the end position
					if(pos > this.state.highlight.start)
						this.setState({highlight: {start: this.state.highlight.start, end: pos},});
				}
				this.setState({
					highlightState: hState,
				})
			}
			if(isEndTouch) {
				this.setState({highlightState: 'waiting'});
			}
		} else {
			if(isEndTouch) {
				this.setState({
					isMoving: false,
					viewPos: pos,
				});
			} else {
				if(!this.state.isMoving) {
					this.setState({isMoving: true,});
				}
				this.setState({viewPos: pos,});
			}
		}
	}
	showToolComponent = () => {
		this.setState({
			showToolMenu: true,
			highlightState: 'waiting',
		});
		Animated.timing(this.state.animateTool, {
			toValue: {x: 0, y: -this.toolComponentHeight},
			duration: this.toolAnimDuration,
			useNativeDriver: true,
		}).start();
	}
	hideToolComponent = () => {
		this.setState({
			showToolMenu: false,
			highlightState: 'not',
			highlight: {start: null, end: null},
		});
		Animated.timing(this.state.animateTool, {
			toValue: {x: 0, y: 0},
			duration: this.toolAnimDuration,
			useNativeDriver: true,
		}).start();
	}
	redo = () => {
		this.changeLog.redo();
		this.updateTrack()
	}
	undo = () => {
		this.changeLog.undo();
		this.updateTrack()
	}
	addTrackChange = () => {
		this.changeLog.addChange(this.props.track.getJSON());
	}
	updateTrack = () => {
		this.props.track.setJSON(this.changeLog.getCurrentState());
	}

	// Convenience things like getters n shid
	isLoaded = () => {return this.state.trackPlayerController.isLoaded;}
	isPlaying = () => {return this.state.trackPlayerController.isPlaying;}
	songLen = () => {return this.state.trackPlayerController.songLen;}
	songPos = () => {return this.state.trackPlayerController.songPos;}
	viewPos = () => {return this.state.trackPlayerController.viewPos;}

	popupListener = (p: any) => {
		this.popupTitle= p.label;
		this.popupOptions= p.options;
		this.popupHeight= 70*p.options.length;
		
		switch(p.label) {
			case ButtonLabels.ViewSize: {
				this.popupSelectedOption = this.state.selectedViewSize;
				break;
			} 
			case ButtonLabels.EditBlock: {
				this.popupSelectedOption = this.state.editMode;
				break;
			} 
			case ButtonLabels.PlayLoop: {
				this.popupSelectedOption = this.state.trackPlayerController.getLoopName();
				break;
			} 
			case ButtonLabels.ViewSnap: {
				var snapName: string;
				if(this.state.snapSpecificity == -2)
					snapName = SnapOptions.None;
				else {
					snapName = Object.keys(this.snapOptions)[this.state.snapSpecificity+1];
					if(snapName == "HalfBeat")
						snapName = SnapOptions.HalfBeat;
				}
				this.popupSelectedOption = snapName;
				break;
			} 
		}
		this.setState({
			showPopup: true,
		})
	}
	closePopup = () => {
		this.setState({
			showPopup: false,
		});
	}
	popupSet = (option: any) => {
		switch(this.popupTitle) {
			case ButtonLabels.ViewSize: {
				this.setState({selectedViewSize: option});
				break;
			} 
			case ButtonLabels.EditBlock: {
				this.setEditMode(option);
				break;
			} 
			case ButtonLabels.PlayLoop: {
				this.state.trackPlayerController.setLoop(this.props.track.getLoopFromName(option));
				break;
			} 
			case ButtonLabels.ViewSnap: {
				this.setSnap(option);
				break;
			} 
		}
		this.popupSelectedOption = option;
	}

	render() {
		var popup = null;
		if(this.state.showPopup) {
			popup = (
				<OptionPopup title= {this.popupTitle} height= {this.popupHeight}
					options= {this.popupOptions}
					selectedOption= {this.popupSelectedOption}
					closePopup= {this.closePopup}
					select= {this.popupSet}
				/>
			);
		}
		return (
			<Animated.View style={[styles.container, {backgroundColor: colorTheme['t_dark'], top: this.state.toolTransitionYVal, width: '100%', height: '100%'}]}>
				{/* Options */}
				<ButtonMenu
					trackPlayerController={this.state.trackPlayerController}
					popupListener= {this.popupListener}
					selectedSize= {this.state.selectedViewSize}
					showLines= {!this.state.simpleView} toggleLines= {this.toggleSimpleView}
					editBlock= {this.state.editMode}
					showToolComponent= {this.showToolComponent}
				/>
				{/* Track View */}
				<BorsView 
					style = {{flex: 4, marginTop: (this.state.showToolMenu)? 10: 0}}
					trackPlayerController = {this.state.trackPlayerController}
					size = {this.state.selectedViewSize} 
					editMode= {this.state.editMode}
					viewPos = {this.state.viewPos}
					highlightRegion = {this.state.highlight}
					drawSimple = {this.state.simpleView}
					snapSpecificity = {this.state.snapSpecificity}
					yTouchOffset = {this.state.toolTransitionYVal}
					mouseListener = {this.borsMouseListener}
				/>
				{/* Tool Component */}
				<ToolComponent 
					style= {{position: 'absolute', bottom: -this.toolComponentHeight, height: this.toolComponentHeight}}
					hide={this.hideToolComponent}
					selectedArea={this.state.highlight}
				/>
				{popup}
			</Animated.View>
		);
	}
}

type bvP = {
	trackPlayerController: TrackPlayerController, 
	size: ViewSizeOptions, 
	editMode: EditBlockOptions,
	snapSpecificity: number,
	drawSimple: boolean,
	viewPos: number,
	highlightRegion: {start: number|null, end: number|null},
	mouseListener?: (b: boolean, n: number) => void,
	yTouchOffset: number, 
	style?: any,
};
type bvS = {
		selectedLoop: Loop,
		fingiePlaceInSec: number, fingieIsScrolling: boolean
		fingieXY: {x: number, y: number}, scrollOffset: number
};
export class BorsView extends React.Component<bvP, bvS> {
	measureMaker: MeasureMaker;
	editMode: EditBlockOptions;
	editModeEnd: "start"|"end"|"none" = "start";
	selectedSectionIndex: number = 0;
	constructor(props: any) {
		super(props);
		this.state = {
			selectedLoop: Loop.NullLoop(),
			fingiePlaceInSec: 0,
			fingieIsScrolling: false,
			fingieXY: {x: 0, y: 0},	
			scrollOffset: 0,
		};
		this.editMode = this.props.editMode;
		this.measureMaker = new MeasureMaker(this.props.trackPlayerController.track, this.props.size);
	}
	componentDidMount() {
		this.measureMaker.recompute();
	}
	//Helper funcs n stuff
	constrainFingie = (evt: any, gestureState: any) => {
		this.setState({
			fingieXY: {x: gestureState.moveX, y: gestureState.moveY}
		})
		
		// console.log("(" + (gestureState.moveX+thumbOffX) + "," + (gestureState.moveY+thumbOffY) +  ") to (" + x  + ", " + y + ")"); 7.2578
		var milli = this.measureMaker.mapCoordToMilli({
					x: gestureState.moveX+thumbOffX, 
					y: gestureState.moveY+thumbOffY + this.state.scrollOffset - this.props.yTouchOffset
				},
				this.props.snapSpecificity
			);
		this.setState({
			fingiePlaceInSec: milli,
		})
		return milli
	}
	draggonBars = (evt: any, gestureState: any) => {
		var milli = this.constrainFingie(evt, gestureState);
		var loop = this.props.trackPlayerController.selectedLoop;
		if(this.props.editMode === EditBlockOptions.LoopEnds && !loop.isNull()) {
			this.dragSetLoop(milli, loop);            
		} else if(this.props.editMode === EditBlockOptions.SectionEnds) {
			this.dragSetSection(milli);
		} else {
			this.props.trackPlayerController.setMoving(milli);
			if(this.props.mouseListener)
				this.props.mouseListener(false, milli);
		}
	}
	liftonBars = (evt: any, gestureState: any) => {
		var milli = this.constrainFingie(evt, gestureState);
		var loop = this.props.trackPlayerController.selectedLoop;

		if(this.props.editMode === EditBlockOptions.LoopEnds && !loop.isNull()) {
			this.dragSetLoop(milli, loop);         
			this.editMode= EditBlockOptions.LoopEnds   
		} else if(this.props.editMode === EditBlockOptions.SectionEnds) {
			this.dragSetSection(milli);
		} else {
			this.props.trackPlayerController.goTo(milli);
			if(this.props.mouseListener)
				this.props.mouseListener(true, milli);
		}
		this.editModeEnd = "none";
	}
	dragSetLoop = (milli: number, loop: Loop) => {
		if(this.editModeEnd == "none") {
			if(Math.abs(milli-loop.getStart()) < Math.abs(milli-loop.getEnd())) {
				this.editModeEnd = "start";
			} else {
				this.editModeEnd = "end";
			}
		}
		if(this.editModeEnd === "start") {
			this.props.trackPlayerController.editLoopStart(loop, milli, this.props.snapSpecificity);
		} else if(this.editModeEnd === "end") {
			this.props.trackPlayerController.editLoopEnd(loop, milli, this.props.snapSpecificity);
		}
	}
	dragSetSection = (milli: number) => {
		if(this.editModeEnd == "none") {
			this.selectedSectionIndex = this.props.trackPlayerController.getSectionIndex(milli);
			var section = this.props.trackPlayerController.getSection(this.selectedSectionIndex);
			if(Math.abs(milli-section.getStart()) < Math.abs(milli-section.getEndTime())) {
				if(Math.abs(milli-section.getStart()) < section.getMilliInMeasure()/2) {
					this.editModeEnd = "start";
				}
			} else {
				if(Math.abs(milli-section.getEndTime()) < section.getMilliInMeasure()/2) {
					this.editModeEnd = "end";
				}
			}
		}
		if(this.editModeEnd === "start") {
			if(this.selectedSectionIndex != 0) {
				this.props.trackPlayerController.editSectionEnd(milli, this.selectedSectionIndex-1);
				this.measureMaker.reset();
			}
		} else if(this.editModeEnd === "end") {
			this.props.trackPlayerController.editSectionEnd(milli, this.selectedSectionIndex);
			this.measureMaker.reset();
		}
	}
	render() {
		const {size, trackPlayerController, highlightRegion, viewPos} = this.props;
		const track = trackPlayerController.track;
		if(this.measureMaker.viewSize != size)
			this.measureMaker.setSize(size);
		if(this.measureMaker.needsUpdate()) {
			this.measureMaker.recompute();
		}

		var playBackLines: (JSX.Element|undefined)[] = this.measureMaker.makeSubGroupView(0, viewPos, 'playPos');
		var loops: (JSX.Element|undefined)[][] = [];
		for(var i = 0; i<track.getLoops().length; i++) {
			var loop = track.getLoops()[i];
			loops.splice(i, 0, this.measureMaker.makeSubGroupView(loop.getStart(), loop.getEnd(), "loop", loop.getName()));
		}
		
		var measures;
		if(this.props.drawSimple) {
			measures = this.measureMaker.getMeasures(true);
		} else {
			measures = this.measureMaker.getMeasures(false);
		}
		var highlightView: (JSX.Element | undefined)[] = [];
		var fingieXY = this.measureMaker.mapMilliToCoord(this.state.fingiePlaceInSec);
		if(highlightRegion.start != null && highlightRegion.end != null)
			highlightView = this.measureMaker.makeSubGroupView(highlightRegion.start, highlightRegion.end, "highlight");

		return (
			<View style={[styles.container, styles.borsViewStyle, {...this.props.style}]}>
				<SafeAreaView key= {this.props.size} style={[styles.container, {backgroundColor: 'transparent', width: '100%'}]}>
					<ScrollView 
						style= {{width: "100%", flex: 1}}
						onTouchStart = {(evt: any) => {
							if(evt.nativeEvent.locationX < 0 || evt.nativeEvent.locationX > splitViewArea(1)) {
								// console.log("outside " + evt.nativeEvent.locationX);
								this.setState({fingieIsScrolling: true});
							} else {
								// console.log("inside " + evt.nativeEvent.locationX);
								this.setState({fingieIsScrolling: false});
							}
						}}
						onScroll = {(evt: any) => {
							// console.log(Object.keys(evt.nativeEvent.contentOffset));
							// console.log(evt.nativeEvent.contentOffset);
							this.setState({
								scrollOffset: evt.nativeEvent.contentOffset.y,
							})
						}}
						scrollEventThrottle= {500}
						onTouchEnd = {(evt: any) => {
							this.setState({fingieIsScrolling: true});
							// console.log("ending touch");
						}}
						scrollEnabled= {this.state.fingieIsScrolling}
						snapToInterval= {barPositioning.spacing}
						bounces= {true}
					>
						<Draggable
							onDrag = {(evt: any, gestureState: any)=>{this.draggonBars(evt, gestureState)}}
							onLift = {(evt: any, gestureState: any)=>{this.liftonBars(evt, gestureState)}}
							style = {{left: barPositioning.xShift, width: splitViewArea(1), marginBottom: barPositioning.marginTop, backgroundColor: 'transparent'}}
						>
							{measures}
							{playBackLines}
							{loops}
							{highlightView}
						</Draggable>

						{/* Fingie or Cursor */}
						<View 
							key = {0} 
							style= {{position: "absolute", left: fingieXY.x, top: fingieXY.y, borderLeftWidth: 2, height: barPositioning.height, borderLeftColor: colorTheme['purple'], zIndex: 100, backgroundColor: 'transparent'}}
						/>
					</ScrollView>
				</SafeAreaView>
			</View>
		);
	}
}

type tcP = {hide: ()=>void, selectedArea: {start: number|null, end: number|null}, style?: any};
type tcS = {};
export class ToolComponent extends React.Component<tcP, tcS> {
	constructor(props: any) {
		super(props);
		this.state = {
		};
	}
	componentWillUnmount() {
	}
	render() {
		
		return(
			<View style={[styles.container, styles.toolComponentStyle,
			{...this.props.style}]}>
				{/* <Form
					title='Add Section'
				>
					<FormText
						textID='Section Name'
						defaultText='name...'
						style={{}}
					/>
					<View style={{flexDirection: 'row', flex: 1}}>
						<FormNumber
							numID='Start Time'
							style={{height: 25, marginLeft: 10}}
						/>
						<FormNumber
							numID= 'End Time'
							style={{height: 25, marginHorizontal: 10}}
						/>
					</View>
				</Form> */}
				<Buddon
					style= {{position: 'absolute', top: 6, right: 4, height: 20, width: 20, borderRadius: 10, paddingLeft: 1, backgroundColor: colorTheme['t_dark']}}
					label= "close"
					fontAwesome= {{name: 'close', size: 19, color: colorTheme['gray']}}
					onPress= {this.props.hide}
					isSelected= {false}
				/>
			</View>
		)
	}
}

function ButtonMenu(props: 
	{
		trackPlayerController: TrackPlayerController,
		popupListener: (p: any)=>any,
		selectedSize: string,
		showLines: boolean, toggleLines: ()=>void,
		editBlock: string,
		showToolComponent: () => void,
	}) {
	var { trackPlayerController } = props;
	var loopOptions= [...props.trackPlayerController.track.getLoopNames(), 'none'];
	return (
		<View style={[{backgroundColor: colorTheme['gray'], height: 125, paddingHorizontal: 10, paddingBottom: 10}]}>
			<View style={[styles.rowContainer, {flex: 1, padding: 5, backgroundColor: 'transparent'}]}>
				<ButtonGroup label="View Settings" style={{flex: 2}}>
					<PopupTrigger
						label={ButtonLabels.ViewSize}
						icon='viewSize'
						popupListener={props.popupListener}
						options= {Object.values(ViewSizeOptions)}
						isSelected= {false}
						style={{flexShrink: 1, height: '100%', margin: 5}}
					/>
					<Buddon
						label={ButtonLabels.ShowLines}
						icon='showLines'
						onPress={props.toggleLines}
						isSelected= {props.showLines}
						style={{flexShrink: 1, height: '100%', margin: 5, marginLeft: 0}}
					/>
					<PopupTrigger
						label={ButtonLabels.ViewSnap}
						icon='snap'
						popupListener={props.popupListener}
						options= {Object.values(SnapOptions)}
						isSelected= {false}
						style={{flexShrink: 1, height: '100%', margin: 5, marginLeft: 0}}
					/>
				</ButtonGroup>
				<View style={{flex: 0.5, backgroundColor: 'transparent'}}>
				</View>
				<ButtonGroup label='Edit Shit' style={{alignItems: 'flex-end', flex: 2}}>
					<PopupTrigger
						label={ButtonLabels.EditBlock}
						icon='editBlock'
						popupListener={props.popupListener}
						options= {Object.values(EditBlockOptions)}
						isSelected= {props.editBlock != 'none'}
						style={{flexShrink: 1, height: '100%', margin: 5, padding: 0}}
					/>
					<PopupTrigger
						label={ButtonLabels.PlayLoop}
						icon='list'
						popupListener={props.popupListener}
						options= {loopOptions}
						isSelected= {false}
						style={{flexShrink: 1, height: '100%', margin: 5, marginLeft: 0}}
					/>
					<Buddon
						label={ButtonLabels.AddBlock}
						icon='add'
						onPress={props.showToolComponent}
						isSelected= {false}
						style={{flexShrink: 1, height: '100%', margin: 5, marginLeft: 0}}
					/>
				</ButtonGroup>
			</View>
			<View style={[styles.rowContainer, {flex: 0.7, backgroundColor: 'transparent'}]}>
				<ButtonGroup label="" style={{flex: 1, alignItems: 'center'}}>
					<Buddon
						label={ButtonLabels.Restart}
						icon='restart' 
						onPress= {trackPlayerController.restart}
						isSelected= {false}
						bg= {'t_white'}
						style={{...leftBorderRadius(5), marginLeft: 0, flexShrink: 1, height: '100%'}}
					/>
					<View style={[styles.vertLine, {marginHorizontal: 0, flexShrink: 1}]}/>
					<Buddon
						label={ButtonLabels.Play}
						icon='pause' 
						alticon='play'
						onPress= {trackPlayerController.togglePlay}
						isSelected= {trackPlayerController.isPlaying}
						bg= {'t_white'}
						style={{...rightBorderRadius(5), marginRight: 0, flexShrink: 1, height: '100%'}}
					/>
				</ButtonGroup>
			</View>
		</View>
	)
}

function OptionPopup(props: {title: string, options?: any[], selectedOption?: any, height: number, closePopup: ()=>void, select: (option: any)=>void}) {
	return (
		<TouchableOpacity style= {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)"}}
			onPress= {props.closePopup}
		>
			<TouchableOpacity style={{alignSelf: "center", top: 250, width: 250, backgroundColor: colorTheme['t_med'], borderRadius: 5, paddingHorizontal:  15}}
				activeOpacity= {1}
			>
				<Text style={[styles.title, styles.centerText]}>{props.title}</Text>
				{props.options?.map((option, index) => {
					var margins= {
						marginTop: (index==0)? 5: 0,
						marginBottom: (index+1==props.options?.length)? 15: 0,
					}
					var borderRad= {};
					if(index==0) {
						borderRad = {...topBorderRadius(5), borderBottomWidth: 1, borderBottomColor: colorTheme['t_dark']};
					} else if(index+1 == props.options?.length) {
						borderRad = bottomBorderRadius(5);
					} else {
						borderRad = {borderRadius: 0, borderBottomWidth: 1, borderBottomColor: colorTheme['t_dark']}
					}
					
					var label = option;
					var selectedLabel = props.selectedOption;

					return (
						<Buddon
							key={label}
							label={label}
							onPress={()=>{props.select(option)}}
							isSelected= {selectedLabel == label}
							bg= {(label=="none"? 't_opplight': undefined)}
							altbg= {(label=="none"? 't_oppdark': undefined)}
							style={{width: '100%', ...borderRad, ...margins, paddingVertical: 5, flexShrink: 1}}
						/>
					);
				})}
			</TouchableOpacity>
		</TouchableOpacity>
	);
}

enum ButtonLabels {
	PlayLoop= "Play Loop",
	EditBlock= "Edit Block",
	ShowLines= "Show Lines",
	ViewSize= "View Size",
	Play= "Play",
	Restart= "Restart",
	ViewSnap= "Snap",
	AddBlock= "Add",
}
enum ViewSizeOptions {
	small= "small",
	medium= "medium",
	large= "large",
}
enum EditBlockOptions {
	LoopEnds= "Loop Ends",
	SectionEnds= "Section Ends",
	none= "none",
}
enum SnapOptions {
	Section= "Section",
	Measure= "Measure",
	Beat= "Beat",
	HalfBeat= "Half Beat",
	None= "none",
}