import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Text, View } from '../components/Themed';

import { appStyles as styles, bottomBorderRadius, colorTheme, leftBorderRadius, rightBorderRadius, topBorderRadius } from '../components/AppStyles';
import { Buddon } from '../components/Buddons';
import { FriendProfile, thisAppUser } from '../DatabaseWrappers/Profiles';
import { Spacer } from '../components/MusicComponents';

import axios from 'axios';
import { NavigationHelpersContext } from '@react-navigation/native';
import { backendURLPrefix } from '../DatabaseWrappers/DatabaseRequest';


export default function ProfileInfoScreen({navigation}: any) {  
    var username = thisAppUser.username;
    var password = thisAppUser.password;

    var friends:FriendProfile[] = [];

    const [isLoading, setLoading] = React.useState(false);
    const [tempFriends, setTempFriends] = React.useState([]);

    const loadFriends = () => {

        axios.get(backendURLPrefix + 'friends/' + thisAppUser.uid, {
            headers: {
                "x-access-token": thisAppUser.token,
            }
        })
        .then((response)=> {
            for (var i = 0; i < response.data.length; i++){
                thisAppUser.friends[i] = new FriendProfile(response.data[i]["UserID"], response.data[i]["Username"]);
            }           
        }).finally(() => {
            navigation.navigate("FriendViews");
        })
        
    }

    const friendRequests = () => {
        axios.get(backendURLPrefix + 'pendingRequests/'+thisAppUser.uid, {
            headers: {
                "x-access-token": thisAppUser.token,
            }
        }).then((response)=> {
            for (var i = 0; i < response.data.length; i++){
                thisAppUser.friendRequests[i] = new FriendProfile(response.data[i]["UserID"], response.data[i]["Username"]);
            }           
        }).finally(() => {
            navigation.navigate("FriendViews", {screen: 'FriendRequests'});
        });
    }

    if (isLoading){
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={{padding: 10}}>
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
            <View style={{width: '100%', alignSelf: 'center', margin: 20, padding: 20, backgroundColor: colorTheme['t_med'], borderRadius: 10}}>
                <Text style={[styles.header]}>Username</Text>
                <View style={{backgroundColor: colorTheme['t_light'], borderRadius: 8, padding: 6}}>
                    <Text style={styles.subheader}>{username}</Text>
                </View>
                <Text style={[styles.header, {paddingTop: 15}]}>Password</Text>
                <View style={{backgroundColor: colorTheme['t_light'], borderRadius: 8, padding: 6}}>
                    <Text style={styles.subheader}>{password}</Text>
                </View>
                <Buddon
                    style={[{alignSelf: 'flex-end', width: 150, padding: 8, marginTop: 30}]}
                    label = "Edit Profile"
                    altbg={'t_light'}
                    isSelected={true}
                    onPress={()=>navigation.navigate("EditProfile")}
                />
            </View>
        <Buddon
            style={[styles.centerSelf, {width: 150, padding: 13, margin: 20}]}
            label = "View Friends"
            altbg={'t_med'}
            isSelected={true}
            onPress={loadFriends}
        />
        <Buddon 
            style={[styles.centerSelf, {width: 150, padding: 13, margin: 20}]}
            label = "Friend Requests"
            altbg={'t_med'}
            isSelected={true}
            onPress={friendRequests}
        />
        </View>
    )
}

function JSONtoView(props: {json: any, highlight: boolean}):JSX.Element {
    var loops: JSX.Element[]|null = null;
    var sects: JSX.Element[]|null = null;
    var jsontoview = props.json;
    loops = [];
    for(let i = 0; i<jsontoview.loopCount; i++) {
        loops.splice(i, 0, (
            <View key={i} style={styles.transparentbg}>
                <Text style={[styles.text, {marginHorizontal: 15, color: colorTheme.t_light}]}>Loop {i}</Text>
                <Text style={{marginHorizontal: 20, color: colorTheme.t_white, fontSize: 10}}>
                    {Object.values(jsontoview["loop" + i]).toString()}
                </Text>
            </View>
        ));
    }
    sects = [];
    for(let i = 0; i<jsontoview.sectCount; i++) {
        sects.splice(i, 0, (
            <View key={i} style={styles.transparentbg}>
                <Text style={[styles.text, {marginHorizontal: 15, color: colorTheme.t_light}]}>Section {i}</Text>
                <Text style={{marginHorizontal: 20, color: colorTheme.t_white, fontSize: 10}}>
                    {Object.values(jsontoview["sect" + i]).toString()}
                </Text>
            </View>
        ));
    }
    
    var color = colorTheme.t_light;
    if(props.highlight)
        color = colorTheme.t_opplight;

    return (
        <View style={{flex:1, backgroundColor: colorTheme.t_med}}>
            <Text style={[styles.subheader, {color: color, fontSize: 17}]}>{jsontoview.name}</Text>
            <View style={[styles.transparentbg, {flex: 1}]}>
                <Text style={{color: colorTheme.t_white}}>{Object.values(jsontoview).toString()}</Text>
                {loops}
                {sects}
            </View>
        </View>
    );
}