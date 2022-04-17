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
	searchForSongs, 
	getSongsByAlbumFromPlaylists, 
	getSongsByArtistFromPlaylists, 
	getAllSongs,
	setSelectedSong,
	addSongToPlaylist,
} from '../../DatabaseWrappers/SongStuff';
import { UploadMP3, UploadMP3Popup } from './UploadMP3';
import { RootTabScreenProps } from '../../types';
import { thisAppUser } from '../../DatabaseWrappers/Profiles';

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
type PVS = {
	listTypeShowing: SongListTypes, 
	addToPlaylistPopup: boolean,
	isLoading: boolean
}

class PlaylistView extends React.Component<PVP, PVS> {

	visibleSongList: Playlist[] | Playlist = new Playlist("");
	searchPhrase: string = "";
	songToAdd?: SongListItem; 

	constructor(props: any) {
		super(props);
		this.state = {
			listTypeShowing: SongListTypes.None,
			addToPlaylistPopup: false,
			isLoading: false,
		}
	}
	lookupSongs = (searchPhrase: string) => {
		this.searchPhrase = searchPhrase
	}
	setList = (type: SongListTypes, playlist: Playlist|undefined = undefined) => {
		var uid = thisAppUser.uid;
		if(type == SongListTypes.Search) {
			console.log('Searching for songs!');
			// fetch filtered version of all songs from database based on search parameter searchPhrase
			// set isLoading to true while beginning request
			this.setState({isLoading: true});
			searchForSongs(this.searchPhrase).then(res => {
				console.log('in song search');
				// store results in playlist
				var songs = new Playlist("Search Results");
				songs.setSongsFromJSON(res.data);
				this.visibleSongList = songs;

				// set isLoading to false once request is finished
				this.setState({isLoading: false});
			}, err => {
				console.log(err);
			});
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
			// set isLoading to true while beginning request
			this.setState({isLoading: true});

			// fetch all songs
			getAllSongs().then(res => {
				var allSongs = new Playlist("All Songs");
				allSongs.setSongsFromJSON(res.data);
				this.visibleSongList = allSongs;

				// set isLoading to false once data has been retrieved
				this.setState({isLoading: false});
				
			}, err => {
				console.log(err);
			});
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
	
	showAddToPlaylist = (song: SongListItem) => {
		console.log("Adding song: " + song); 
		this.songToAdd = song; 
		this.setState({
			addToPlaylistPopup: true,
			listTypeShowing: SongListTypes.None,
		});

	}
	addSongToPlaylist = (p: string | Playlist) => {
		if(p instanceof Playlist && this.songToAdd) {
			this.setState({isLoading: true})
			console.log("Adding " + this.songToAdd.name + " to playlist " + p.name);
			addSongToPlaylist(p.pid, this.songToAdd.track_id).then( res => {
				this.setState({isLoading: false})
			})
		}
		this.setList(SongListTypes.None);
	}

	render() {
		var listTypeShowing = this.state.listTypeShowing;
		var songListView: JSX.Element | null = null;
		var popupView: JSX.Element | null = null;

		// display Loading ... view if component is still fetching data
		if (this.state.isLoading) {
			return (
				<View>
					<Text>Loading ...</Text>
				</View>
			)
		}

		var listTitle: string = "";
		if(listTypeShowing == SongListTypes.Specific && this.visibleSongList instanceof Playlist) {
			listTitle = this.visibleSongList.name;
		} else {
			listTitle = listTypeShowing;
		}

		if(listTypeShowing != SongListTypes.None) {
			// Main Song List View
			songListView = (<SongGroup 
				title = {listTitle} 
				songList = {this.visibleSongList} 
				listListener = {this.subListListener} 
				songListener={this.songClickListener}
				addSong= {(song)=>this.showAddToPlaylist(song)}
			/>)
		} else {
			songListView = (
				<View>
					<MainOptionList listListener={this.mainListListener} />
				</View>
			)
		}

		if(this.state.addToPlaylistPopup) {
			// Popup to add song to playlist
			popupView = (<SongGroup
				title = "Add to Playlist"
				songList = {getUsersPlaylists(thisAppUser.uid)}
				listListener= {(p: any)=>{this.addSongToPlaylist(p)}}
				songListener= {()=>{}}
			/>)
			songListView = null;
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
	
	// hook to handle changes to text input text
	var [searchText, onChangeSearchText] = React.useState("search");
	
	return (
		<View style= {{backgroundColor: colorTheme['gray'], flexShrink: 1, padding: 20, borderRadius: 8}}>
			<TextInput 
				style={[styles.textInput, {width: '100%'}]}
				placeholder={searchText}
				onChangeText={onChangeSearchText}
				onSubmitEditing={(e)=> {
					props.listListener(SongListTypes.Search, e.nativeEvent.text);
				}}
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