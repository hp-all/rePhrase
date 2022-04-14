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
import { FormInputError, FormField } from '../components/Form';

export default function Login () {
	// hooks that are used to change the state of the login parameters
	const [Username, setUsername] = React.useState("");
	const [Password, setPassword] = React.useState("");

	const [LoginStatus, setLoginStatus] = React.useState("");

	const login = () => {
		Axios.post("http://localhost:3001/login", {
			Username: Username,
			Password: Password
		}).then((response) => {
			if (response.data.message == "Success"){
				setLoginStatus(response.data.message); // login is successful
				// want to navigate to the users page from here
			} else {
				setLoginStatus(response.data.message);
			}
		})
	}

	// TODO: need to put a view in here that displays that the error message if they didn't login correctly
	return (
		<View style={{width: 290, alignSelf: 'center', margin: 20, padding: 20, backgroundColor: colorTheme['t_med'], borderRadius: 10}}>
			<TextInput
			style={[styles.textInput, {width: '100%'}]}
			defaultValue="Username"
			onChange={(e)=>{
				setUsername(e.nativeEvent.text);
			}}
			/>
			<TextInput
			style={[styles.textInput, {width: '100%'}, {margin:20}]}
			defaultValue="Password"
			onChange={(e)=>{
				setPassword(e.nativeEvent.text);
			}}
			/>
			<Buddon
				style={[styles.submitBuddon, {margin: 15}]}
				label = "Login"
				onPress={login}
				isSelected={false}
			/>
			<Text> {LoginStatus} </Text>
		</View>
	)
}