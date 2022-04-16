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

export default function EditProfile ({navigation}: any) {
	// TODO: Brandon will do
	const [userName, setUsername] = React.useState(thisAppUser.username); // set default username to original

	const updateName = () => {
		if (userName == thisAppUser.username){
			alert("Cannot be same username");
		} else {
			Axios.post('https://rephrase-cs4750.herokuapp.com/updateUsername', {
				UID: thisAppUser.uid,
				Username: userName
			}).then((response)=> {
				if (response.data.message == "Error"){
					alert("Username Already Taken");
				} else {
					alert("Username Updated Successfully!");
					thisAppUser.username = userName; // update global class that we are using
					navigation.navigate("ProfileInfo")
				}
			})
		}
	}

	return (
		<View>
		<TextInput
			style={[styles.textInput, {width: '100%'}]}
			placeholder={thisAppUser.username}
			placeholderTextColor={'#888'}
			autoCorrect={false}
            autoCapitalize='none'
			onChange={(e)=>{
				setUsername(e.nativeEvent.text);
			}}
		/>
        <Buddon 
            style={[styles.centerSelf, {width: 150, padding: 13, margin: 20}]}
            label = "Update"
            altbg={'t_med'}
            isSelected={true}
            onPress={updateName}
        />
		</View>
	)
}