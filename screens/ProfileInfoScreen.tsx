import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Platform, Animated} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, useThemeColor, View } from '../components/Themed';
import Layout from "../constants/Layout";

import { appStyles as styles, bottomBorderRadius, colorTheme, leftBorderRadius, rightBorderRadius, topBorderRadius } from '../components/AppStyles';

export default function ProfileInfoScreen() {

    var username = "Jimothy Jambus";
    var password = "ohnicemanthatscool:)";

    return (
        <View style={{padding: 10}}>
        <Text style={styles.title}>Profile</Text>
		<View style={{width: 290, alignSelf: 'center', margin: 20, padding: 20, backgroundColor: colorTheme['t_med'], borderRadius: 10}}>
			<Text style={[styles.header]}>Username</Text>
            <Text style={styles.text}>{username}</Text>
			<Text style={[styles.header, {paddingTop: 15}]}>Password</Text>
            <Text style={styles.text}>{password}</Text>
        </View>
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