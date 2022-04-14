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

export default function SignUp () {
	// hooks that are used to change the state of the login parameters
	const [Username, setUsername] = React.useState("");
	const [Password, setPassword] = React.useState("");
    const [ConfirmPw, setConfirmPw] = React.useState("");

	const [RegisterStatus, setRegisterStatus] = React.useState("");

	const signup = () => {
        if (Password.length <= 10){
            if (ConfirmPw == Password){
                Axios.post("http://localhost:3001/login", {
                    Username: Username,
                    Password: Password
                }).then((response) => {
                    if (response.data.message == "Success"){
                        setRegisterStatus(response.data.message); // login is successful
                        // want to navigate to the users page from here
                    } else {
                        setRegisterStatus(response.data.message);
                    }
                })
            }
            else {
                console.log("Passwords Do Not Match");
            }
        }
        else {
            console.log("Password Too Long");
        }
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
            <TextInput
			style={[styles.textInput, {width: '100%'}, {margin:20}]}
			defaultValue="Confirm Password"
			onChange={(e)=>{
				setConfirmPw(e.nativeEvent.text);
			}}
			/>
			<Buddon
				style={[styles.submitBuddon, {margin: 15}]}
				label = "Register"
				onPress={signup}
				isSelected={false}
			/>
            <h1>{RegisterStatus}</h1>
		</View>
	)
}