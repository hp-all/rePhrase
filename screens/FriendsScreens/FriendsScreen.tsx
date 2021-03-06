// React Native & Expo
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
// Theme and Styles
import { Text, View } from '../../components/Themed';
import { appStyles as styles, blockColors, colorTheme, leftBorderRadius, rightBorderRadius, SectionColor} from '../../components/AppStyles';
import Axios from "axios"

// Components
import { Buddon } from '../../components/Buddons';
import { FormInputError, FormField, TextField } from '../../components/Form';
import UserProfile, { FriendProfile, thisAppUser } from '../../DatabaseWrappers/Profiles';
import { Platform, ScrollView, TouchableOpacity, TouchableOpacityBase } from 'react-native';
import { Spacer } from '../../components/MusicComponents';
import { SafeAreaView } from 'react-native-safe-area-context';
import { backendURLPrefix } from '../../DatabaseWrappers/DatabaseRequest';

export default function FriendsScreen ({navigation}: any) {

    const goBack = () => {
        thisAppUser.friends = [];
        navigation.goBack();
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
                    onPress={goBack}
                />
            </View>
            <ViewUsersFriends
                friends={thisAppUser.friends}
            />       
		<StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
		</View>
	)
}

/** ViewUsersFriends
 *  Component to view the friends of a given list
 * @param props 
 */
export function ViewUsersFriends(props: {friends: FriendProfile[], onFriendSelect?: (friend: FriendProfile)=>void, onAccept?: (friend: FriendProfile)=>void, onReject?: (friend: FriendProfile)=>void, onReturnReq?: (friend: FriendProfile)=>void, horizontal?: boolean, title?: string}) {
    // Creates the views for all of the friends
    var friendsViews = [];

    if(props.friends.length == 0) {
        friendsViews.push(
            <View key={0} style={[styles.centerSelf, {margin: 20}]}>
                <Text style={styles.header}>No friends to display</Text>
            </View>
        )
    } else {
        for(var i = 0; i<props.friends.length; i++) {
            friendsViews.push(<FriendView 
                friend={props.friends[i]} 
                onSelect={props.onFriendSelect}
                onAccept={props.onAccept}
                onReject={props.onReject}
                onReturnReq={props.onReturnReq}

                key={i}
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
function FriendView(props: {friend: FriendProfile, onSelect?: (friend: FriendProfile)=>void, key: React.Key, onAccept?: (friend: FriendProfile)=>void, onReject?: (friend: FriendProfile)=>void, onReturnReq?: (friend: FriendProfile)=>void}) {
    
    var reqButtons = null;
    if(props.onAccept && props.onReject && props.onReturnReq) {
        console.log("Req button!");
        reqButtons = (<FriendRequestView friend={props.friend} onAccept={props.onAccept} onReject={props.onReject} onReturnReq={props.onReturnReq}/>)
    }

    return (
        <TouchableOpacity
            onPress={()=>{props.onSelect && props.onSelect(props.friend)}}
            style={[{backgroundColor: colorTheme['t_light'], flex: 1, margin: 10, padding: 20, borderRadius: 5}, reqButtons && styles.rowContainer]}
        >
            <Text style={[styles.header, reqButtons && {flex: 1}]}>{props.friend.username}</Text>
            {reqButtons}
        </TouchableOpacity>
    )
}

/** Friend Request Buttons: creates a view for Friend Request Buttons
 * 
 */
function FriendRequestView(props: {friend: FriendProfile, onAccept: (friend: FriendProfile)=>void, onReject: (friend: FriendProfile)=>void, onReturnReq: (friend: FriendProfile)=>void}) {
    const [hasAccepted, setAccept] = React.useState(false); // set as loading first
    const accept = () => {
        setAccept(true);
        if(props.onAccept)
            props.onAccept(props.friend);
    }
    const chooseButtons = (
        <View style={{flexDirection: 'row'}}>
            <Buddon
                style={{backgroundColor: blockColors['green_med'], flex: 1, ...rightBorderRadius(0), padding: 8}}
                label='Accept'
                onPress={accept}
                isSelected={true}
            />
            <View style={[styles.vertLine, {marginHorizontal: 0}]}/>
            <Buddon
                style={{backgroundColor: blockColors['red_med'], flex: 1, ...leftBorderRadius(0), padding: 8}}
                label='Reject'
                onPress={()=>props.onReject(props.friend)}
                isSelected={true}
            />
        </View>
    )
    const sendReqButton = (
        <View>
            <Buddon
                style={{padding: 5}}
                label = "Send Request"
                altbg={'t_med'}
                onPress={()=>props.onReturnReq(props.friend)}
                isSelected={true}
            />
        </View>
    )

    return (
        <View style={{flex: 1}}>
            {(hasAccepted) ? sendReqButton:chooseButtons}
        </View>
    );
}

