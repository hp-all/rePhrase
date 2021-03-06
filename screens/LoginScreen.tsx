// React Native & Expo
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, TextInput, Image, TouchableOpacity} from 'react-native';
// Theme and Styles
import { Text, View } from '../components/Themed';
import { appStyles as styles, colorTheme} from '../components/AppStyles';
import Axios from "axios"

// Components
import { Buddon } from '../components/Buddons';
import { FormInputError, FormField, TextField } from '../components/Form';
import UserProfile, { FriendProfile, thisAppUser } from '../DatabaseWrappers/Profiles';
import { backendURLPrefix } from '../DatabaseWrappers/DatabaseRequest';

export default function Login ({navigation}: any) {
	// hooks that are used to change the state of the login parameters
	const [Username, setUsername] = React.useState("");
	const [Password, setPassword] = React.useState("");
	const [UserID, setUserID] = React.useState(0);
	const [hash, SetHash] = React.useState("");

	//const [LoginStatus, setLoginStatus] = React.useState("");
	const [passwordVisible, setVisibility] = React.useState(true);

	/** Connects to the MySQL Database to check the login information, then navigate to the app */
	const login = () => {
		Axios.post(backendURLPrefix + 'login', {
			Username: Username,
			Password: Password
		}).then((response) => {
			if (response.data["message"] == "Success"){
				thisAppUser.token = response.data["token"];
				thisAppUser.copy(new UserProfile(response.data["UID"], Username, Password, response.data["Hash"]));
				navigation.navigate("Root");
			} else {
				//setLoginStatus(response.data.message);
				alert(response.data.message);
			}
		})
	}

	return (
		<View style={{width: 290, alignSelf: 'center', margin: 20, padding: 20, backgroundColor: colorTheme['t_med'], borderRadius: 10}}>
			<TextInput
				style={[styles.textInput, {width: '100%'}]}
				placeholder="username..."
				placeholderTextColor={'#888'}
				autoCorrect={false}
            	autoCapitalize='none'
				onChange={(e)=>{
					setUsername(e.nativeEvent.text);
				}}
			/>
			<TextInput
				style={[styles.textInput, {width: '100%'}, {margin:20}]}
				secureTextEntry={passwordVisible}
				placeholder="password..."
				placeholderTextColor={'#888'}
				autoCorrect={false}
            	autoCapitalize='none'
				onChange={(e)=>{
					setPassword(e.nativeEvent.text);
				}}
			/>
			<Buddon
				style={[styles.submitBuddon, {margin: 15}]}
				label = "Login"
				onPress={login}
			/>
			<Buddon
				style={[styles.submitBuddon, {margin: 15, backgroundColor: colorTheme['t_white']}]}
				label = "Register"
				onPress={()=>navigation.navigate("Signup")}
			/>
		</View>
	)
}