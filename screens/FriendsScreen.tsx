// React Native & Expo
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
// Theme and Styles
import { Text, View } from '../components/Themed';
import { appStyles as styles, colorTheme} from '../components/AppStyles';
import Axios from "axios"

// Components
import { Buddon } from '../components/Buddons';
import { FormInputError, FormField, TextField } from '../components/Form';
import UserProfile, { FriendProfile, thisAppUser } from '../DatabaseWrappers/Profiles';
import axios from 'axios';
import { Platform, ScrollView, TouchableOpacity, TouchableOpacityBase } from 'react-native';
import { Spacer } from '../components/MusicComponents';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FriendDisplay ({navigation}: any) {
	// hooks that are used to change the state of the login parameters

    const [isLoading, setLoading] = React.useState(true); // set as loading first

    React.useEffect(()=> {
        if(thisAppUser.uid < 0) {
            setLoading(false);
            return;
        }
        for (var i = 0; i < thisAppUser.friends.length; i++){
            Axios.post('http://localhost:3001/getUsername', {
                UID: thisAppUser.friends[i].uid // the current UID
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


    // Creates the views for all of the friends
    var friendsViews = [];
    for(var i = 0; i<thisAppUser.friends.length; i++) {
        friendsViews.push(<FriendView 
            friend={thisAppUser.friends[i]} 
            selectFriend={(friend: FriendProfile)=>{navigation.navigate("Friend")}}
            key={i}
        />)
    }

	return (
		<View style={[styles.container, styles.darkbg, {}]}>
            <View style={{flexDirection: "row"}}>
                <Text style={[styles.title, {flex: 1}]}>Profile</Text>
                <Spacer/>
                <Buddon
                    style={[styles.centerSelf, {width: 150, padding: 8, flex: 1, marginRight: 20}]}
                    label = "logout"
                    altbg={'t_med'}
                    isSelected={true}
                    onPress={()=>navigation.navigate("Login")}
                />
            </View>
            <SafeAreaView>
                <ScrollView style={{backgroundColor: colorTheme['t_med'], borderRadius: 8}} horizontal={true}>
                    {friendsViews}
                </ScrollView>
            </SafeAreaView>            
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