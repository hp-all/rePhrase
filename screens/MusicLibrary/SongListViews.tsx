// React and Expo Stuff
import * as React from 'react';
import { TouchableOpacity } from 'react-native';


// Themes and Styles
import { Text, View } from '../../components/Themed';
import { appStyles as styles, colorTheme } from '../../components/AppStyles';

// Objects & Wrappers
import { SongListItem, Playlist, getUsersPlaylists, getAllFromPlaylists, searchForSongs, getSongsByAlbumFromPlaylists, getSongsByArtistFromPlaylists } from '../../DatabaseWrappers/SongStuff';
import { Buddon } from '../../components/Buddons';

export function SongGroup (props: {title: string, songList: Playlist | Playlist[], listListener: (p: any)=>void, songListener: (song: SongListItem)=>void}) {
	var items = []; 
	if(props.songList instanceof Playlist) {
		for(var i = 0; i<props.songList.songs.length; i++) {
            var song = props.songList.songs[i];
            items.push( <SongButton song = {song} onPress = {props.songListener} hideBar = {i==0} key= {i}/> )
        }
	} else {
		for(var i = 0; i<props.songList.length; i++) {
			var category = props.songList[i];
			items.push( <SongGroupButton name= {category.name} color= {colorTheme['t_dark']} playlist= {category} onPress= {props.listListener} hideBar = {i == 0} key= {i}/> );
		}
	}

	return (
		<View style= {[{backgroundColor: colorTheme['gray'], borderRadius: 8, flex: 1}]}>
            <View style={[styles.transparentbg, {flexDirection: 'row'}]} >
                <Buddon
                    label='<'
                    style={{margin: 10, marginTop: 19, height: 35, flexBasis: 35, padding: 5}}
                    bg={'t_dark'}
                    isSelected={true}
                    onPress={()=>{props.listListener("back")}}
                />
                <Text style={[styles.title, {flexGrow: 1}]}>{props.title}</Text> 
                <View style={styles.spacer}/>
                
            </View>
            <View style={[{padding: 20, backgroundColor: colorTheme['lightgray'], borderRadius: 8}]}>
                {items}
            </View>
		</View>
	)
}

export function SongGroupButton(props: {name: string, onPress: (playlist?: Playlist)=>void, style?: any, hideBar?: boolean, key?: number, color?: string, playlist?: Playlist}) {
	var bar = null;
	if(!props.hideBar)
		bar = <View style={[styles.horzLine]}/>
    var key = props.key;
    var color = {};
    if(props.color) {
        color = {color: props.color};
    }
	return (
		<TouchableOpacity
            key = {key}
            style= {props.style}
			onPress={()=>{
                if(props.playlist) {
                    props.onPress(props.playlist);
                } else {
                    props.onPress();
                }
            }}
		>
			{bar}
			<Text style={[styles.header, {marginVertical: 10, ...color}]} >{props.name}</Text>
		</TouchableOpacity>
	);
}

function SongButton(props: {key: React.Key, song: SongListItem, onPress: (song: SongListItem)=>void, hideBar ?: boolean}) {
    var song = props.song;
    var bar = (props.hideBar) ? null: (<View style={[styles.horzLine, {flexShrink: 1}]}/>);
    return (
        <TouchableOpacity onPress = {()=>{props.onPress(song)}}>
            {bar}
            <View style={[styles.rowContainer, {flexBasis: 40, alignItems: 'flex-end', marginBottom: 10}]}>
                <Text style={[styles.header, {flex: 1.1, color: colorTheme['t_dark']}]}>{song.name}</Text>
                <Buddon label="Add" onPress={() => console.log("add clicked1")}></Buddon>
                {/* 
                <Text style={[styles.subheader, {flex: 1, color: colorTheme['t_med']}]}>{song.album}</Text>
                <Text style={[styles.subheader, {flex: 1, color: colorTheme['t_med']}]}>{song.artist}</Text>
                */}
            </View>
        </TouchableOpacity>
    )
}

export enum SongListTypes {
	None= "None",
	Playlists= "Playlists",
	Artists= "Artists",
	Albums= "Albums",
	AllSongs= "All Songs",
	Specific= "Specific",
	Search= "Search",
}