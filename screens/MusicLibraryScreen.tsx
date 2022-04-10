import { StatusBar } from 'expo-status-bar';
import { Platform, TextInput, TouchableOpacity } from 'react-native';

import { Text, View } from '../components/Themed';
import { appStyles as styles, colorTheme } from '../components/AppStyles';


export default function MusicLibraryScreen({navigation, route}: {navigation: any, route:any}) {
	console.log("---------- Start Music Library Screen -------------------");
	var title: string = "Library";
	console.log("Route: " + Object.keys(route) + '\n' + Object.values(route));
	if(route & route.params) {
		title = route.params.username + "'s Library";
	}
  	return (
		<View style={[styles.container, styles.darkbg]}>
			<Text style={styles.title}>{title}</Text>
			<View style= {{backgroundColor: colorTheme['gray'], flexShrink: 1, padding: 20, borderRadius: 8}}>
				<TextInput 
					style={[styles.textInput, {width: '100%'}]}
					defaultValue= "search"
					selectTextOnFocus= {true}
				/>
				<SongGroupButton name= 'Playlists'
					onPress= {()=>{}}
					hideBar= {true}
					style={{marginTop: 20}}
				/>
				<SongGroupButton name='Artists'
					onPress={()=>{}}
				/>
				<SongGroupButton name='Albums'
					onPress={()=>{}}
				/>
				<SongGroupButton name='All Songs'
					onPress={()=>{}}
				/>
			</View>
		<StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
		</View>
  	);
}

function SongGroupButton(props: {name: string, onPress: ()=>void, style?: any, hideBar?: boolean}) {
	var bar = null;
	if(!props.hideBar)
		bar = <View style={[styles.horzLine]}/>
	return (
		<TouchableOpacity style={{...props.style}}>
			{bar}
			<Text style={[styles.header, {marginVertical: 10}]} >{props.name}</Text>
		</TouchableOpacity>
	);
}