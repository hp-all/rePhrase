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

export default function FriendDisplay ({navigation}: any) {
	// hooks that are used to change the state of the login parameters

    const [isLoading, setLoading] = React.useState(true); // set as loading first

    React.useEffect(()=> {
        if(thisAppUser.uid < 0) {
            setLoading(false);
            return;
        }
        for (var i = 0; i < thisAppUser.friends.length; i++){
            Axios.post('https://rephrase-cs750.herokuapp.com/getUsername', {
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


    // Creates the views for all of the friends
    var friendsViews = [];
    for(var i = 0; i<thisAppUser.friends.length; i++) {
        friendsViews.push(<FriendView 
            friend={thisAppUser.friends[i]} 
            onSelect={(friend: FriendProfile)=>{navigation.navigate("OneFriend", {friendData: friend.toJSON()})}}
            listKey={"Friend"+i}
        />)
    }

	return (
		<View style={[styles.container, styles.darkbg, {}]}>
            <View style={{flexDirection: "row"}}>
                <Text style={[styles.title, {flex: 1}]}>Profile</Text>
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
                friends={thisAppUser.friends}
                onFriendSelect={(friend: FriendProfile)=>{
                    navigation.navigate("OneFriend", {friendData: friend.toJSON()})
                }}
            />       
		<StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
		</View>
	)
}

/** ViewUsersFriends
 *  Component to view the friends of a given list
 * @param props 
 */
export function ViewUsersFriends(props: {friends: FriendProfile[], onFriendSelect?: (friend: FriendProfile)=>void, horizontal?: boolean, title?: string}) {
    // Creates the views for all of the friends
    var friendsViews = [];

    if(props.friends.length == 0) {
        friendsViews.push(
            <View style={[styles.centerSelf, {margin: 20}]}>
                <Text style={styles.header}>No friends to display</Text>
            </View>
        )
    } else {
        for(var i = 0; i<props.friends.length; i++) {
            friendsViews.push(<FriendView 
                friend={props.friends[i]} 
                onSelect={props.onFriendSelect}
                listKey={"Friend"+i}
            />)
        }
    }
   
    var title = null;
    if(props.title)
        title = <Text style={[styles.header, {marginHorizontal: 15, fontWeight: 'bold', fontSize: 30}]}>{props.title}</Text>
    
    return (
        <SafeAreaView>
            {title}
            <ScrollView style={{backgroundColor: colorTheme['t_med'], borderRadius: 8}} horizontal={props.horizontal}>
                {friendsViews}
            </ScrollView>
        </SafeAreaView>   
    );
}

/** FriendView: creates the view for a friend's profile
 * 
 * @param props friend: the friend profile to display, selectfriend, the function to go the the friend's page
 * @returns a view for a specific friend
 */
function FriendView(props: {friend: FriendProfile, onSelect?: (friend: FriendProfile)=>void, listKey?: React.Key}) {
    console.log(props.listKey);
    return (
        <TouchableOpacity
            key={props.listKey}
            onPress={()=>{props.onSelect && props.onSelect(props.friend)}}
            style={{backgroundColor: colorTheme['t_light'], flex: 1, margin: 10, padding: 20, borderRadius: 5}}
        >
            <Text style={styles.header}>{props.friend.username}</Text>
        </TouchableOpacity>
    )
}