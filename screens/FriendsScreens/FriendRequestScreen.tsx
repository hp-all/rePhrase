// React Native & Expo
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
// Theme and Styles
import { Text, View } from '../../components/Themed';
import { appStyles as styles, colorTheme} from '../../components/AppStyles';
import Axios from "axios";

// Components
import { Buddon } from '../../components/Buddons';
import { FormInputError, FormField, TextField } from '../../components/Form';
import UserProfile, { FriendProfile, thisAppUser } from '../../DatabaseWrappers/Profiles';
import axios from 'axios';
import { Platform, ScrollView, TouchableOpacity, TouchableOpacityBase } from 'react-native';
import { Spacer } from '../../components/MusicComponents';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ViewUsersFriends } from './FriendsScreen';
import { backendURLPrefix } from '../../DatabaseWrappers/DatabaseRequest';

export default function FriendRequestScreen ({navigation}: any) {
	// hooks that are used to change the state of the login parameters
    
    const [isLoading, setLoading] = React.useState(false); // set as loading first

    const accept = (friend: FriendProfile) => {
        // set loading to true
        setLoading(true); 

        // accept request
        Axios.post(backendURLPrefix + 'acceptRequest', {
            UID1: thisAppUser.uid, // the app user UID
            UID2: friend.uid, // the UID of the friend who sent the request
        }).then((response)=>{
            // remove friend from friend requests
            var remainingFriendRequests = []
            for (let i = 0; i < thisAppUser.friendRequests.length; i += 1) {
                if (thisAppUser.friendRequests[i].uid != friend.uid) {
                    remainingFriendRequests.push(thisAppUser.friendRequests[i]);
                }
            }
            thisAppUser.friendRequests = remainingFriendRequests;
        }).finally(() => {
            setLoading(false);
        });
    }

    const reject = (friend: FriendProfile) => {
        console.log("Rejecting req");
        setLoading(true);

        Axios.post(backendURLPrefix + 'rejectRequest', {
            UID1: friend.uid, // the UID of the friend who sent the request
            UID2: thisAppUser.uid, // the app user UID
        }).then((response) => {
            // TODO: remove this request from the thisAppUser's list of friendRequests
            var remainingFriendRequests = []
            for (let i = 0; i < thisAppUser.friendRequests.length; i += 1) {
                if (thisAppUser.friendRequests[i].uid != friend.uid) {
                    remainingFriendRequests.push(thisAppUser.friendRequests[i]);
                }
            }
            thisAppUser.friendRequests = remainingFriendRequests;
        }).finally(() => {
            setLoading(false);
        });
    }

    const sendReq = (friend: FriendProfile) => {
        console.log("Sendign req");
        setLoading(true); // IDK If it needs to go back to loading state?
        Axios.post(backendURLPrefix + 'sendRequest', {
            UID1: thisAppUser.uid, // the app user UID
            UID2: friend.uid, // the UID of the friend who sent the request
        }).then((response)=>{
            // thisAppUser.friends[i].setUsername(response.data.Username);
            console.log(response.data.message);
        });
        setLoading(false);
    }

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
                onAccept={accept}
                onReject={reject}
                onReturnReq={sendReq}
            />       
		<StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
		</View>
	)
}