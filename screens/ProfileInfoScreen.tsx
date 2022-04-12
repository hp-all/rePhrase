import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Text, View } from '../components/Themed';

import { appStyles as styles, bottomBorderRadius, colorTheme, leftBorderRadius, rightBorderRadius, topBorderRadius } from '../components/AppStyles';
import { Buddon } from '../components/Buddons';




export default function ProfileInfoScreen({navigation, route}: any) {  
    var username = route.params.username;
    var password = route.params.password;
    return (
        <View style={{padding: 10}}>
        <Text style={styles.title}>Profile</Text>
		<View style={{width: '100%', alignSelf: 'center', margin: 20, padding: 20, backgroundColor: colorTheme['t_med'], borderRadius: 10}}>
			<Text style={[styles.header]}>Username</Text>
            <View style={{backgroundColor: colorTheme['t_light'], borderRadius: 8, padding: 6}}>
                <Text style={styles.subheader}>{username}</Text>
            </View>
			<Text style={[styles.header, {paddingTop: 15}]}>Password</Text>
            <View style={{backgroundColor: colorTheme['t_light'], borderRadius: 8, padding: 6}}>
                <Text style={styles.subheader}>{password}</Text>
            </View>
        </View>
        <Buddon
            style={[styles.centerSelf, {width: 150, padding: 8}]}
            label = "logout"
            altbg={'t_med'}
            isSelected={true}
            onPress={()=>navigation.navigate("Login")}
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