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

import UserProfile, { thisAppUser } from '../DatabaseWrappers/Profiles';

export default function SignUp ({navigation}: any) {
	// hooks that are used to change the state of the login parameters
	const [Username, setUsername] = React.useState("");
	const [Password, setPassword] = React.useState("");
    const [ConfirmPw, setConfirmPw] = React.useState("");

	const [RegisterStatus, setRegisterStatus] = React.useState("");
    const [passwordVisible, setVisibility] = React.useState(true);

	const signup = () => {
        console.log("Pre api call");
        console.log(Password);
        console.log(ConfirmPw);
        if (Password.length <= 10){
            if (ConfirmPw == Password){
                // console.log("Pre api call");
                // console.log(Password);
                // console.log(ConfirmPw);
                console.log("passwords match");
                Axios.post("https://rephrase-cs750.herokuapp.com/register", {
                    Username: Username,
                    Password: Password
                }).then((response) => {
                    if (response.data.message == "Successfully Registered"){
                        setRegisterStatus(response.data.message); //register successful
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

    React.useEffect(() => {
        if(RegisterStatus == "Successfully Registered"){
            Axios.post("https://rephrase-cs750.herokuapp.com/getUID", {
                Username: Username
            }).then((response) => {
                console.log(response.data.UID);
                thisAppUser.copy(new UserProfile(response.data.UID, Username, Password));
                navigation.navigate("Root");
            })
        }
    }, [RegisterStatus]);

	// TODO: need to put a view in here that displays that the error message if they didn't login correctly
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
			placeholder="password..."
            secureTextEntry={passwordVisible}
            placeholderTextColor={'#888'}
            autoCorrect={false}
            autoCapitalize='none'
			onChange={(e)=>{
				setPassword(e.nativeEvent.text);
			}}
			/>
            <TextInput
			style={[styles.textInput, {width: '100%'}, {margin:20}]}
			placeholder="confirm password..."
            secureTextEntry={passwordVisible}
            placeholderTextColor={'#888'}
            autoCorrect={false}
            autoCapitalize='none'
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
            <Text> {RegisterStatus} </Text>
		</View>
	)
}