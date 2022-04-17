// React Native & Expo
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
// Theme and Styles
import { Text, View } from '../../components/Themed';
import { appStyles as styles, colorTheme} from '../../components/AppStyles';
import Axios from "axios"

// Components
import { Buddon } from '../../components/Buddons';
import { FormInputError, FormField, TextField } from '../../components/Form';
import UserProfile, { FriendProfile, thisAppUser } from '../../DatabaseWrappers/Profiles';
import axios from 'axios';
import { Platform, ScrollView, TouchableOpacity, TouchableOpacityBase } from 'react-native';
import { Spacer } from '../../components/MusicComponents';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ViewUsersFriends } from './FriendsScreen';

export default function FriendRequestScreen ({navigation}: any) {
	// hooks that are used to change the state of the login parameters

    const [isLoading, setLoading] = React.useState(true); // set as loading first

    React.useEffect(()=> {
        if(thisAppUser.uid < 0) {
            setLoading(false);
            return;
        }
        for (var i = 0; i < thisAppUser.friends.length; i++){
            Axios.post('https://rephrase-cs4750.herokuapp.com/getUsername', {
                UID: thisAppUser.friends[i] // the current UID
            }).then((response)=>{
                thisAppUser.friends[i].setUsername(response.data.Username);
            });
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
		<View style={[styles.container, styles.darkbg, {}]}>
            <View style={{flexDirection: "row"}}>
                <Text style={[styles.title, {flex: 1}]}>Friend Requests</Text>
                <Spacer/>
                <Buddon
                    style={[styles.centerSelf, {width: 150, padding: 8, flex: 1, marginRight: 20}]}
                    label = "Back"
                    altbg={'t_med'}
                    isSelected={true}
                    onPress={()=>navigation.navigate("Root", {screen: "ProfileInfo"})}
                />
            </View>
            <ViewUsersFriends
                friends={thisAppUser.friendRequests}
                onFriendSelect={(friend: FriendProfile)=>{
                    // TODO FUNCTION to accept friend request


                }}
            />       
		<StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
		</View>
	)
}