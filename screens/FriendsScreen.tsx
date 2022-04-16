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
import axios from 'axios';

export default function FriendDisplay ({navigation}: any) {
	// hooks that are used to change the state of the login parameters

    const [isLoading, setLoading] = React.useState(true); // set as loading first
    const [usernames, setUsernames] = React.useState([]);

    var FriendsNames = []; // the list of usernames that will be used for scroll view

    React.useEffect(()=> {
        for (var i = 0; i < thisAppUser.friends.length; i++){
            Axios.post('https://rephrase-cs750.herokuapp.com/getUsername', {
                UID: thisAppUser.friends[i] // the current UID
            }).then((response)=>{
                FriendsNames.push(response.data.Username);
            })
        }
        setLoading(false); // usernames have been collected and ready to render
    }, []); // only gets called once since empty param

    if (isLoading){
        return (
            <View style={{width: 290, alignSelf: 'center', margin: 20, padding: 20, backgroundColor: colorTheme['t_med'], borderRadius: 10}}>
                <Text>Loading...</Text>
            </View>
        )
    }

	return (
		<View style={{width: 290, alignSelf: 'center', margin: 20, padding: 20, backgroundColor: colorTheme['t_med'], borderRadius: 10}}>
            <Buddon
                style={[styles.centerSelf, {width: 150, padding: 8, margin: 20}]}
                label = "Back"
                altbg={'t_med'}
                isSelected={true}
                onPress={()=>navigation.navigate("ProfileInfo")}
            />

            <Text>{usernames}</Text>

		</View>
	)
}