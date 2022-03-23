import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Platform, Animated} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, useThemeColor, View } from '../components/Themed';
import Layout from "../constants/Layout";

import { appStyles as styles, bottomBorderRadius, colorTheme, leftBorderRadius, rightBorderRadius, topBorderRadius } from '../components/AppStyles';


import SongSection, { SectionType } from '../MusicModel/SongSection';
import Track, { Source } from '../MusicModel/Track';
import Loop from '../MusicModel/Loop';
import TrackyPlayer from '../MusicModel/TrackPlayer';

import {ChangeLog} from '../components/MusicComponents';

export default function AssignSectionScreen() {
    var changes = new ChangeLog();
    var track = new Track(Source.MP3, "", {name: "Test Track", artist: "me", album: "self title", length: 120000}, 120, "4:4");
    changes.addChange(track.getJSON());
    track.addSection("a1", SectionType.A, 0, 50000, false, 120, "4:4");
    changes.addChange(track.getJSON());
    track.addSection("b2", SectionType.B, 50000, 120000, false, 140, "4:4");
    changes.addChange(track.getJSON());
    track.addLoop("loob", 10000, 40000);
    changes.addChange(track.getJSON());
    
    changes.undo();
    changes.undo();
    changes.undo();
    changes.undo();

    track.setJSON(changes.getCurrentState());
    track.addLoop("hey dog", 1, 4);
    changes.addChange(track.getJSON());

    var list: JSX.Element[] = [];
    console.log(changes.statePointer);
    for(var i = 0; i<changes.count(); i++) {
        var instance = (
            <JSONtoView key= {i} json = {changes.at(i)} highlight={i==changes.statePointer}/>
        )
        list.splice(i, 0, instance);
    }

    return (
		<View style={[styles.container, styles.darkbg, {height: "100%"}]}>
			<Text style={styles.title}>{"Test Whatever"}</Text>
            <View style={{height: '90%'}}>
                {list}
                <JSONtoView json={changes.getCurrentState()} highlight={true}/>
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