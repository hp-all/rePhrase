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
import UserProfile, { thisAppUser } from '../DatabaseWrappers/Profiles';

export default function Login ({navigation}: any) {
	// hooks that are used to change the state of the login parameters
	const [Username, setUsername] = React.useState("");
	const [Password, setPassword] = React.useState("");

	const [LoginStatus, setLoginStatus] = React.useState("");

	const deleteThisLogin = () => {
		thisAppUser.copy(new UserProfile(0, "Admin", "AdminP_word"));
		navigation.navigate("Root");

	}
	const login = () => {
		Axios.post("http://localhost:3001/login", {
			Username: Username,
			Password: Password
		}).then((response) => {
			if (response.data.message == "Success"){
				thisAppUser.copy(new UserProfile(response.data.UID, Username, Password));
 				setLoginStatus(response.data.UID); // login is successful
				navigation.navigate("Root");
				// want to navigate to the users page from here
				console.log(LoginStatus);
			} else {
				setLoginStatus(response.data.message);
			}
		})
	}

	return (
		<View style={{width: 290, alignSelf: 'center', margin: 20, padding: 20, backgroundColor: colorTheme['t_med'], borderRadius: 10}}>
			<TextInput
				style={[styles.textInput, {width: '100%'}]}
				placeholder="username..."
				placeholderTextColor={'#888'}
				onChange={(e)=>{
					setUsername(e.nativeEvent.text);
				}}
			/>
			<TextInput
				style={[styles.textInput, {width: '100%'}, {margin:20}]}
				placeholder="password..."
				placeholderTextColor={'#888'}
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
				label = "Delete This"
				onPress={deleteThisLogin}
			/>
			<Buddon
				style={[styles.submitBuddon, {margin: 15, backgroundColor: colorTheme['t_white']}]}
				label = "Register"
				onPress={()=>navigation.navigate("Signup")}
			/>
		</View>
	)
}