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
import UserProfile, { FriendProfile, Profile, thisAppUser } from '../../DatabaseWrappers/Profiles';
import axios from 'axios';
import { Platform, ScrollView, TouchableOpacity, TouchableOpacityBase } from 'react-native';
import { Spacer } from '../../components/MusicComponents';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Playlist } from '../../DatabaseWrappers/SongStuff';
import { ViewUsersFriends } from './FriendsScreen';

export default function FriendDisplay ({navigation, route}: any) {

    var friend = new FriendProfile(-1, "");
    if(route && route.params) {
        friend = FriendProfile.parseJSON(route.params.friendData);
    } else {
        navigation.goBack();
    }
    var playlists: Playlist[];

	// hooks that are used to change the state of the login parameters

    const [isLoading, setLoading] = React.useState(true); // set as loading first
    
    React.useEffect(()=> {
        if(thisAppUser.uid < 0) {
            setLoading(false);
            return;
        }
     
        // GET THE FRIEND's DATA LIKE PLAYLISTS AND STUFF
        Axios.post('http://localhost:3001/getUsername', {
                UID: friend.uid // the current UID
            }).then((response)=>{
                // Set Friends Array!
                friend.friends = [];
                // Set Playlist Array! Might have to be a different request?
                playlists = []
            });
    
    
        setLoading(false); // Friends and Playlists have been collected
    }, []); // only gets called once since empty param
    
    if (isLoading){
        return (
            <View style={{width: 290, alignSelf: 'center', margin: 20, padding: 20, backgroundColor: colorTheme['t_med'], borderRadius: 10}}>
                <Text>Loading...</Text>
            </View>
        )
    }


    // Creates the views for all of the friends

	return (
		<View style={[styles.container, styles.darkbg, {}]}>
            <View style={{flexDirection: "row"}}>
                <Text style={[styles.title, {flex: 1}]}>{friend.username}</Text>
                <Spacer/>
                <Buddon
                    style={[styles.centerSelf, {width: 150, padding: 8, flex: 1, marginRight: 20}]}
                    label = "Back"
                    altbg={'t_med'}
                    isSelected={true}
                    onPress={()=>navigation.goBack()}
                />
            </View>    
            <ViewUsersFriends
                title={"Friends"}
                friends={friend.friends}
                onFriendSelect={(friend: FriendProfile)=>{
                    navigation.navigate("OneFriend", {friendData: friend.toJSON()})
                }}
                horizontal={true}
            />
		<StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
		</View>
	)
}


/** FriendView: creates the view for a friend's profile
 * 
 * @param props friend: the friend profile to display, selectfriend, the function to go the the friend's page
 * @returns a view for a specific friend
 */
function FriendView(props: {friend: FriendProfile, selectFriend?: (friend: FriendProfile)=>void, key?: React.Key}) {
    return (
        <TouchableOpacity
            key={props.key}
            onPress={()=>{props.selectFriend && props.selectFriend(props.friend)}}
            style={{backgroundColor: colorTheme['t_light'], flex: 1, margin: 10, padding: 20, borderRadius: 5}}
        >
            <Text style={styles.header}>{props.friend.username}</Text>
        </TouchableOpacity>
    )
}