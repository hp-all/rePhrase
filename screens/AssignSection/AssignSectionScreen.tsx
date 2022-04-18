import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { TouchableOpacity, ScrollView, SafeAreaView, Platform, Animated} from 'react-native';
import { Text, View } from '../../components/Themed';
import Layout from "../../constants/Layout";

import { appStyles as styles, bottomBorderRadius, Bounds, colorTheme, leftBorderRadius, rightBorderRadius, topBorderRadius } from '../../components/AppStyles';
import { Draggable, Buddon, ButtonGroup, PopupTrigger } from '../../components/Buddons';
import { barPositioning, ChangeLog, TrackPlayerController, MeasureMaker, LoopSkelly, SectionSkelly } from '../../components/MusicComponents';

import SongSection, { SectionType } from '../../MusicModel/SongSection';
import Track, { Source } from '../../MusicModel/Track';
import Loop from '../../MusicModel/Loop';
import TrackyPlayer from '../../MusicModel/TrackPlayer';

import ButtonMenu from './ButtonMenu';
import AddMenu from './AddMenu';
import { getSelectedSong, getSelectedTrackInfo } from '../../DatabaseWrappers/SongStuff';
import axios from 'axios';
import { Audio } from 'expo-av';
import { backendURLPrefix } from '../../DatabaseWrappers/DatabaseRequest';
import { saveLoopsToDatabase, saveSectionsToDatabase } from '../../DatabaseWrappers/savingSections';
import { thisAppUser } from '../../DatabaseWrappers/Profiles';

const frootSongSource = require('../../assets/soundFiles/lofi_fruits_jazz.mp3');
const windowWidth = Layout.window.width;
const windowHeight = Layout.window.height-100;
const viewAreaFactor = 0.9;
const splitViewArea = (factor: number) => {return (windowWidth*viewAreaFactor)/factor;}
const thumbOffX = -30;
const thumbOffY = -300;


export default function AssignSectionScreen({navigation, route}: any) {
	console.log("---------- Start Assign Section Screen -----");
	if(route.params)
		console.log(route.params.song.name);

	var trackInfo = getSelectedTrackInfo();
	console.log("Loading in : " + trackInfo.title);
	if (trackInfo.title == "") {
		return (
			<View style={[styles.container, styles.darkbg]}>
				<Text>Loading...</Text>
			</View>
		);
	} else {
		var selectedTrack = new Track(
			trackInfo.track_id,
			Source.MP3, 
			trackInfo.mp3_url, 
			{ 
				name: trackInfo.title, 
				artist: trackInfo.artist_name, 
				album: trackInfo.album, 
				length: trackInfo.duration*1000
			}
		);
		console.log("Ab to pass in track: " + selectedTrack.name);

		return (
			<View style={[styles.container, styles.darkbg]}>
				<Text style={styles.title} numberOfLines={1}>{selectedTrack.name}</Text>
				<TrackAssignView track={selectedTrack}/>
			<StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
			</View>
		);
	}
}

type tavP = {track: Track};
type tavS = {
	trackPlayer: TrackyPlayer, 
	selectedViewSize: ViewSizeOptions, simpleView: boolean,
	snapSpecificity: number, editMode: EditBlockOptions, fingiePlace: number,
	trackPlayerController: TrackPlayerController;
	reRenderThing: boolean,
	isMoving: boolean, viewPos: number, highlight: Bounds, highlightState: 'not'|'waiting'|'start'|'end', 
	showToolMenu: boolean, toolTransitionYVal: number, animateTool: Animated.ValueXY,
	showPopup: boolean,
};
class TrackAssignView extends React.Component<tavP, tavS>{
	changeLog: ChangeLog = new ChangeLog();
	snapOptions: any = {none: -2, Section: -1, Measure: 0, Beat: 1, HalfBeat: 2};
	toolComponentHeight = 250;
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

		var trackPlayer = new TrackyPlayer(this.updateStatus);
		//Initializes the state variables for the View
		this.state = {
			trackPlayer: trackPlayer,
			trackPlayerController: new TrackPlayerController(this.props.track, trackPlayer),
			selectedViewSize: ViewSizeOptions.large,
			editMode: EditBlockOptions.none,
			simpleView: true,
			fingiePlace: 0, snapSpecificity: 0,
			isMoving: false, viewPos: 0, highlight: {}, highlightState: 'not',
			showToolMenu: false, toolTransitionYVal: 0, animateTool: new Animated.ValueXY(),
			reRenderThing: false,
			showPopup: false,
		}

		// Call to initialize the track views and states
		if(this.props.track && this.props.track.name != "") {
			this.changeLog.addChange(this.props.track.getJSON());
			this.state.trackPlayerController.makeUpdateToTrack(this.changeLog.getCurrentState());
		}
		// Set the animation values for the add menu raising and lowering
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
			if(this.state.highlight.min == undefined) {
				this.setState({
					highlight: {min: pos},
					highlightState: 'start',
				});
			} else if(this.state.highlight.max == undefined) {
				this.setState({
					highlight: {min: this.state.highlight.min, max: pos},
					highlightState: 'end',
				});
			} else {
				var hState = this.state.highlightState;
				if(hState === 'waiting') {
					if(Math.abs(pos-this.state.highlight.min) < Math.abs(pos-this.state.highlight.max)) 
						hState = 'start';
					else
						hState = 'end';
				}
				if(hState === 'start') {
					//Reseting the start position of the highlight
					if(pos < this.state.highlight.max)
						this.setState({highlight: {min: pos, max: this.state.highlight.max},});
				} else {
					//Resetting the end position
					if(pos > this.state.highlight.min)
						this.setState({highlight: {min: this.state.highlight.min, max: pos},});
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
	showAddMenu = () => {
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
	hideAddMenu = () => {
		this.setState({
			showToolMenu: false,
			highlightState: 'not',
			highlight: {},
		});
		Animated.timing(this.state.animateTool, {
			toValue: {x: 0, y: 0},
			duration: this.toolAnimDuration,
			useNativeDriver: true,
		}).start();
	}
	redo = () => {
		console.log("Redoing");
		this.changeLog.redo();
		this.updateTrack()
	}
	undo = () => {
		console.log("Undoing");
		this.changeLog.undo();
		this.updateTrack()
	}

	// Saves the current state of the track, sections and loops to the Database!
	save = () => {
		console.log("Save");
		saveSectionsToDatabase(thisAppUser.uid, this.state.trackPlayerController.track.track_id, this.state.trackPlayerController.getSectionJSONs());
		saveLoopsToDatabase(thisAppUser.uid, this.state.trackPlayerController.track.track_id, this.state.trackPlayerController.getSectionJSONs());
	}
	addTrackChange = () => {
		this.changeLog.addChange(this.props.track.getJSON());
	}
	updateTrack = () => {
		this.props.track.setJSON(this.changeLog.getCurrentState());
		this.state.trackPlayerController.makeUpdateToTrack(this.changeLog.getCurrentState());
		this.state.trackPlayerController.restart();
	}

	// Popup
	popupListener = (p: {label: string, options: any}) => {
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
			case ButtonLabels.ViewSettings: {
				switch(option) {
					case ButtonLabels.ViewSize: {
						this.popupListener({label: option, options: Object.values(ViewSizeOptions)})
						break;
					}
					case ButtonLabels.ViewSnap: {
						this.popupListener({label: option, options: Object.values(SnapOptions)})
						break;
					}
					case ButtonLabels.ShowLines: {
						this.toggleSimpleView();
						break;
					}
				}
				break;
			}
		}
		this.popupSelectedOption = option;
	}

	// Add Menu
	setHighlight = (s: Bounds) => {
		var hihglight: Bounds = this.state.highlight;
		if(s.min)
			hihglight.min = s.min;
		if(s.max)
			hihglight.max = s.max;
		this.setState({highlight: hihglight});
	}
	addLoop = (l: LoopSkelly) => {
		this.state.trackPlayerController.track.addLoop(l.loopName, l.start, l.end);
		this.addTrackChange();
	}
	addSection = (s: SectionSkelly) => {
		this.state.trackPlayerController.addSection(s);
		this.addTrackChange();
		console.log(this.state.trackPlayerController.track.name);
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
		if(this.props.track != this.state.trackPlayerController.track) {
			console.log("Track: " + this.props.track.name);
			this.state.trackPlayerController.setTrack(this.props.track);
			this.changeLog.clearList();
			console.log(this.props.track.getJSON());
			this.changeLog.addChange(this.props.track.getJSON());
			console.log(this.changeLog.getCurrentState());
			this.state.trackPlayerController.makeUpdateToTrack(this.changeLog.getCurrentState());
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
					showToolComponent= {this.showAddMenu}
					undo={this.undo}
					redo={this.redo}
					save={this.save}
				/>
				{/* Track View */}
				<BorsView 
					style = {{flex: 4, marginTop: (this.state.showToolMenu)? 44: 0}}
					trackPlayerController = {this.state.trackPlayerController}
					size = {this.state.selectedViewSize} 
					editMode= {this.state.editMode}
					viewPos = {this.state.viewPos}
					highlightRegion = {this.state.highlight}
					drawSimple = {this.state.simpleView}
					snapSpecificity = {this.state.snapSpecificity}
					yTouchOffset = {this.state.toolTransitionYVal? -215:0}
					mouseListener = {this.borsMouseListener}
				/>
				{/* Tool Component */}
				<AddMenu 
					style= {{position: 'absolute', bottom: -this.toolComponentHeight, height: this.toolComponentHeight}}
					hide={this.hideAddMenu}
					selectedArea={this.state.highlight}
					setSelectedArea={this.setHighlight}
					createLoop={l=>{this.addLoop(l)}}
					createSection={s=>{this.addSection(s)}}
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
	highlightRegion: Bounds,
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
		this.measureMaker = this.props.trackPlayerController.measureMaker;
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
		// CONSTRAIN AND OFFSETS HERE
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
		if(highlightRegion.min != null && highlightRegion.max != null)
			highlightView = this.measureMaker.makeSubGroupView(highlightRegion.min, highlightRegion.max, "highlight");

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


function OptionPopup(props: {title: string, options?: any[], selectedOption?: any, height: number, closePopup: ()=>void, select: (option: any)=>void}) {
	return (
		<TouchableOpacity style= {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)"}}
			onPress= {props.closePopup}
		>
			<TouchableOpacity style={{alignSelf: "center", top: 250, width: 250, backgroundColor: colorTheme['t_med'], borderRadius: 5, paddingHorizontal:  15}}
				activeOpacity= {1}
			>
				<Text style={[styles.title, styles.centerSelf]}>{props.title}</Text>
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
	ShowLines= "Show Lines",
	ViewSize= "View Size",
	Play= "Play",
	Restart= "Restart",
	ViewSnap= "Snap",
	
	ViewSettings= "View Settings",
	AddBlock= "Add",
	EditBlock= "Edit Block",
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