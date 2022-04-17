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
import { 
	SongListItem,
	Playlist,
	getUsersPlaylists, 
	getAllFromPlaylists, 
	searchForSongs, 
	getSongsByAlbumFromPlaylists, 
	getSongsByArtistFromPlaylists, 
	getAllSongs,
	setSelectedSong,
	getSelectedSong
} from '../../DatabaseWrappers/SongStuff';
import { UploadMP3, UploadMP3Popup } from './UploadMP3';
import { RootTabScreenProps } from '../../types';

export default function MusicLibraryScreen({navigation, route}: any) {
	console.log("---------- Start Music Library Screen ------------");
	var title: string = "Library";
	if(route && route.params) {
		title = route.params.username + "'s Library";
	}
  	return (
		<View style={[styles.container, styles.darkbg, {}]}>
			<Text style={styles.title}>{title}</Text>
			<PlaylistView navigateToSectionScreen={(song: SongListItem)=>{navigation.navigate("AssignSection")}}/>
		<StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
		</View>
  	);
}

type PVP = {navigateToSectionScreen?: (song: SongListItem)=>void}
type PVS = {listTypeShowing: SongListTypes, showMP3Popup: boolean}

class PlaylistView extends React.Component<PVP, PVS> {
	visibleSongList: Playlist[] | Playlist = new Playlist("");
	searchPhrase: string = "";

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
			this.visibleSongList = searchForSongs(this.searchPhrase);
		} else if(type == SongListTypes.Specific && playlist) {
			this.visibleSongList = playlist;
		} else if(type == SongListTypes.Albums) {
			this.visibleSongList = getSongsByAlbumFromPlaylists(uid);
		} else if(type == SongListTypes.Artists) {
			this.visibleSongList = getSongsByArtistFromPlaylists(uid);
		} else if(type == SongListTypes.Playlists) {
			this.visibleSongList = getUsersPlaylists(uid);
		} else if(type == SongListTypes.AllSongs) {
			// fetch all songs from data base and create "playlist" so they can be viewed in 
			// PlaylistView
			getAllSongs().then(res => {
				var allSongs = new Playlist("All Songs");
				allSongs.setSongsFromJSON(res.data);
				this.visibleSongList = allSongs;
				
			}, err => {
				console.log(err);
			});
			// this.visibleSongList = getAllFromPlaylists(uid);
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
		if (p instanceof Playlist) {
			this.setList(SongListTypes.Specific, p);
		} else if(p == "back") {
			this.setList(SongListTypes.None);
		}
	}

	// function that is called when song is clicked
	songClickListener = (song: SongListItem) => {
		// log for debugging purposes
		console.log("Song " + song.name + " picked!");

		// set local variable selectedSongID to selected song
		setSelectedSong(song.track_id);

		// navigate to the AssignSection screen
		if (this.props.navigateToSectionScreen) this.props.navigateToSectionScreen(song);
	}
	
	render() {
		var listTypeShowing = this.state.listTypeShowing;
		var songListView: JSX.Element | null = null;
		var popupView: JSX.Element | null = null;

		var listTitle: string = "";
		if(listTypeShowing == SongListTypes.Specific && this.visibleSongList instanceof Playlist) {
			listTitle = this.visibleSongList.name;
		} else {
			listTitle = listTypeShowing;
		}

		if(listTypeShowing != SongListTypes.None) {
			songListView = (<SongGroup title = {listTitle} songList = {this.visibleSongList} listListener = {this.subListListener} songListener={this.songClickListener}/>)
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
			<SongGroupButton name='Playlists'
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