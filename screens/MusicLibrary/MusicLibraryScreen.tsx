// React and Expo Stuff
import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, TextInput, Touchable, TouchableOpacity } from 'react-native';

// Themes and Styles
import { Text, View } from '../../components/Themed';
import { appStyles as styles, colorTheme } from '../../components/AppStyles';

// Elements & Components
import { SongGroup, SongGroupButton, SongListTypes } from './SongListViews';

// Objects & Wrappers
import { SongListItem, Playlist, getUsersPlaylists, getAllFromPlaylists, searchForSongs, getSongsByAlbumFromPlaylists, getSongsByArtistFromPlaylists } from '../../DatabaseWrappers/SongStuff';
import { UploadMP3, UploadMP3Popup } from './UploadMP3';

export default function MusicLibraryScreen({navigation, route}: {navigation: any, route:any}) {
	console.log("---------- Start Music Library Screen ------------");
	var title: string = "Library";
	if(route & route.params) {
		title = route.params.username + "'s Library";
	}
  	return (
		<View style={[styles.container, styles.darkbg, {}]}>
			<Text style={styles.title}>{"Library"}</Text>
			<PlaylistView/>
		<StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
		</View>
  	);
}

type PVP = {}
type PVS = {listTypeShowing: SongListTypes, showMP3Popup: boolean}
class PlaylistView extends React.Component<PVP, PVS> {
	visibleSsongList: Playlist[] | Playlist = new Playlist("");
	searchPhrase:string = "";

	constructor(props: any) {
		super(props);
		this.state = {
			listTypeShowing: SongListTypes.None,
			showMP3Popup: false,
		}
	}
	showMP3Upload = () => {this.setState({showMP3Popup: true})}
	closeMP3Upload = () => {this.setState({showMP3Popup: false})}
	lookupSongs = (searchPhrase: string) => {
		this.searchPhrase = searchPhrase
	}
	setList = (type: SongListTypes, playlist: Playlist|undefined = undefined) => {
		var uid = 0;
		if(type == SongListTypes.Search) {
			this.visibleSsongList = searchForSongs(this.searchPhrase);
		} else if(type == SongListTypes.Specific && playlist) {
			this.visibleSsongList = playlist;
		} else if(type == SongListTypes.Albums) {
			this.visibleSsongList = getSongsByAlbumFromPlaylists(uid);
		} else if(type == SongListTypes.Artists) {
			this.visibleSsongList = getSongsByArtistFromPlaylists(uid);
		} else if(type == SongListTypes.Playlists) {
			this.visibleSsongList = getUsersPlaylists(uid);
		} else if(type == SongListTypes.AllSongs) {
			this.visibleSsongList = getAllFromPlaylists(uid);
		}
		this.setState({listTypeShowing: type});
	}
	
	mainListListener = (type: SongListTypes, search: string|undefined) => {
		if(type == SongListTypes.Search && search) {
			this.lookupSongs(search);
		}
		this.setList(type);
	}
	subListListener = (p: any) => {
		if(p instanceof Playlist) {
			this.setList(SongListTypes.Specific, p);
		} else if(p == "back") {
			this.setList(SongListTypes.None);
		}
	}
	songClickListener = (song: SongListItem) => {
		console.log("Song " + song.name + " picked!");
	}
	
	render() {
		var listTypeShowing = this.state.listTypeShowing;
		var songListView: JSX.Element | null = null;
		var popupView: JSX.Element | null = null;

		var listTitle: string = "";
		if(listTypeShowing == SongListTypes.Specific && this.visibleSsongList instanceof Playlist) {
			listTitle = this.visibleSsongList.name;
		} else {
			listTitle = listTypeShowing;
		}

		if(listTypeShowing != SongListTypes.None) {
			songListView = (<SongGroup title = {listTitle} songList = {this.visibleSsongList} listListener = {this.subListListener} songListener={this.songClickListener}/>)
		} else {
			songListView = (
				<View>
					<MainOptionList listListener={this.mainListListener} />
					<UploadMP3 style= {{marginTop: 15, alignSelf: 'center'}} onPress={this.showMP3Upload}/>
				</View>
			)
		}

		if(this.state.showMP3Popup) {
			popupView = (<UploadMP3Popup closePopup={this.closeMP3Upload}/>);
		}

		return (
			<View style={[styles.container, {flexShrink: 1}]}>
				{songListView}
				{popupView}
			</View>
		)
	}
}

function MainOptionList(props: {listListener: (type: SongListTypes, search: string | undefined)=>void}) {
	return (
		<View style= {{backgroundColor: colorTheme['gray'], flexShrink: 1, padding: 20, borderRadius: 8}}>
			<TextInput 
				style={[styles.textInput, {width: '100%'}]}
				defaultValue= "search"
				onEndEditing={(e)=>{props.listListener(SongListTypes.Search, e.nativeEvent.text)}}
				selectTextOnFocus= {true}
				clearButtonMode= 'always'
			/>
			<SongGroupButton name= 'Playlists'
				onPress= {()=>{props.listListener(SongListTypes.Playlists, undefined)}}
				hideBar= {true}
				style={{marginTop: 20}}
			/>
			<SongGroupButton name='Artists'
				onPress={()=>{props.listListener(SongListTypes.Artists, undefined)}}
			/>
			<SongGroupButton name='Albums'
				onPress={()=>{props.listListener(SongListTypes.Albums, undefined)}}
			/>
			<SongGroupButton name='All Songs'
				onPress={()=>{props.listListener(SongListTypes.AllSongs, undefined)}}
			/>
		</View>
	);
}