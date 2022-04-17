// React and Expo Stuff
import * as React from 'react';

// Themes and Styles
import { Text, View } from '../../components/Themed';
import { appStyles as styles, Bounds, colorTheme, SectionColor } from '../../components/AppStyles';
import { Buddon } from '../../components/Buddons';
import { NumberField, NumberPairField, TextField } from '../../components/Form';
import Loop from '../../MusicModel/Loop';
import { LoopSkelly, SectionSkelly } from '../../components/MusicComponents';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity, TouchableOpacityBase } from 'react-native';
import { SectionType } from '../../MusicModel/SongSection';

// Elements & Components


// Objects & Wrappers
enum AddButtonTypes {
    AddSection, AddLoop, None,
}
type tcP = {
    hide: ()=>void, 
    selectedArea: Bounds, setSelectedArea?: (a: Bounds)=>void, style?: any, 
    createLoop?: (loop: LoopSkelly)=>void,
    createSection?: (section: SectionSkelly)=>void
};
type tcS = {buttonShowing: AddButtonTypes};
export default class AddMenu extends React.Component<tcP, tcS> {
    initState = {buttonShowing: AddButtonTypes.None}
	constructor(props: any) {
		super(props);
		this.state = this.initState;
	}
    hideButtonForm = (hideAllTheWay?: boolean) => {
        this.setState({buttonShowing: AddButtonTypes.None});
        if(hideAllTheWay) {
            this.props.hide();
        }
    }
    setSelectedArea = () => {

    }
	render() {
        var buddonsView = null, formView = null;
        switch(this.state.buttonShowing) {
            case AddButtonTypes.AddLoop:
                formView = (<AddLoopForm 
                        hide={this.hideButtonForm} 
                        selectedArea={this.props.selectedArea} 
                        createLoop={this.props.createLoop}
                        // setSelectedArea={this.props.setSelectedArea}
                        />)
                break;
            case AddButtonTypes.AddSection: 
                formView = (<AddSectionForm 
                        hide={this.hideButtonForm} 
                        selectedArea={this.props.selectedArea}
                        createSection={this.props.createSection}
                    />)
                break;
            default:
                buddonsView = (<AddButtons showSectionForm={()=>this.setState({buttonShowing: AddButtonTypes.AddSection})} showLoopForm={()=>this.setState({buttonShowing: AddButtonTypes.AddLoop})} />)
                break;
        }        

		return(
			<View style={[styles.container, styles.toolComponentStyle,
			{...this.props.style}]}>
				<Buddon
					style= {{position: 'absolute', zIndex: 11, top: 6, right: 4, height: 20, width: 20, borderRadius: 10, paddingLeft: 1, backgroundColor: colorTheme['t_dark']}}
					label= "close"
					fontAwesome= {{name: 'close', size: 19, color: colorTheme['gray']}}
					onPress= {()=>{this.setState(this.initState); this.props.hide()}}
					isSelected= {false}
				/>

                {buddonsView}
                {formView}

			</View>
		)
	}
}

type lfP = {
    hide: (allTheWay?: boolean)=>void, 
    selectedArea: Bounds, 
    createLoop?: (loop: LoopSkelly)=>void,
    // setSelectedArea?: (a: Bounds)=>void, 
};
/** Add Loop Form: Used in the Add Menu View
 *  @props 
 *      hide: hide the add loop component
 *      selectedarea: the area selected of the song from the main screen view
 *      createLoop: Creates a Loop based on the form entries
 *  @state
 *      showError:
 *          true if errors within the form should be shown
 */
class AddLoopForm extends React.Component<lfP, {showError: boolean}> {
    loopName: TextField;
    constructor(props: any) {
        super(props);
        var start = 0, end = 0;
        if(props.selectedArea.start) {
            start = end = props.selectedArea.start;
        }
        if(props.selectedArea.end) {
            end = props.selectedArea.end;
        }
        this.loopName = new TextField("Loop Name", "", [{val: "", msg: "Enter a name for the loop"}])
        var start = 0, end = 0;
        if(this.props.selectedArea.min)
            start = this.props.selectedArea.min;
        if(this.props.selectedArea.max)
            end = this.props.selectedArea.max;
        this.state = {
            showError: false,
        }
    }
    checkEntries = () => {
        var a = this.loopName.checkValue();
        return a;
    }
    submitForm = () => {
        if(this.checkEntries()) {
            // var newLoop: Loop = new Loop(0, this.loopName, this.)
            var start = this.props.selectedArea.min;
            var end = this.props.selectedArea.max;
            if(!(start && end && this.props.createLoop)) 
                return;
            this.props.createLoop({loopName: this.loopName.value, start, end});
            this.props.hide(true);
        }
    }
    render() {
        return (
            <View style={{padding: 20}}>
                <Buddon
                    style={{position: 'absolute', left: 0, top: 0, padding: 5}}
                    label="< back"
                    onPress={()=>this.props.hide(false)}
                />
                <Text style={[styles.header, styles.centerSelf, {marginBottom: 15}]}>Add Loop</Text>
                {this.loopName.getLabelView(styles.subheader)}
                {this.loopName.getView()}
                <NumberPairField
                    bounds = {{min: undefined, max: undefined}}
                    values = {this.props.selectedArea}
                    unit= "s"
                    labels = {{min: "Start Time", max: "End Time"}}
                    keyboardYOffset={169}
                />
                <Buddon 
                    style={[styles.centerSelf, {width: 100, marginTop: 15, height: 35, padding: 6}]}
                    label="Add Loop"
                    onPress={this.submitForm}
                />
            </View>
        )
    }
}


type sfP = {
    hide: (allTheWay?: boolean)=>void, 
    selectedArea: Bounds, 
    createSection?: (sect: SectionSkelly)=>void,
    // setSelectedArea?: (a: Bounds)=>void, 
};
/** Add Section Form: Used in the Add Menu View
 *  @props 
 *      hide: hide the add section component
 *      selectedarea: the area selected of the song from the main screen view
 *      createSection: Creates a Section based on the form inputs
 *  @state
 *      showError:
 *          true if errors within the form should be shown
 */
class AddSectionForm extends React.Component<sfP, {showError: boolean, tempo: number, timeSig: string, type: SectionType}> {
    sectionName: TextField;

    constructor(props: any) {
        super(props);
        var start = 0, end = 0;
        if(props.selectedArea.start) {
            start = end = props.selectedArea.start;
        }
        if(props.selectedArea.end) {
            end = props.selectedArea.end;
        }
        this.sectionName = new TextField("Name", "", [{val: "", msg: "Enter a name for the section"}])
        var start = 0, end = 0;
        if(this.props.selectedArea.min)
            start = this.props.selectedArea.min;
        if(this.props.selectedArea.max)
            end = this.props.selectedArea.max;
        this.state = {
            showError: false,
            tempo: 120,
            timeSig: "4:4",
            type: SectionType.IDK,
        }

    }
    setTimeSig = (ts: string) => {
        this.setState({timeSig: ts});
    }
    submitForm = () => {
        console.log("Submitting form " + this.props.createSection);
        if(this.props.createSection && this.props.selectedArea.min && this.props.selectedArea.max) {
            this.props.createSection({
                sectionName: this.sectionName.value, 
                start: this.props.selectedArea.min, 
                end: this.props.selectedArea.max, 
                type: this.state.type,
                tempo: this.state.tempo,
                timeSig: this.state.timeSig,
            });
            this.props.hide(true);
        }
    }
    render() {
        var timeSigs = ["2:4", "3:4", "4:4", "6:8", "9:8", "12:8"];
        var timeSigView = [];
        var sectTypeView = [];
        for(var i = 0; i<timeSigs.length; i++) {
            timeSigView.push(
                <TimeSigButton
                    timeSig={timeSigs[i]} 
                    selectedTimeSig={this.state.timeSig}
                    setTimeSig={(ts: string) => {this.setTimeSig(ts)}}
                    key={i}            
                />
            );
        }
        for(var i = 0; i<Object.values(SectionType).length; i++) {
            sectTypeView.push(
                <SectionTypeButton
                    type={Object.values(SectionType)[i]}
                    selectedType={this.state.type}
                    setType = {st=>this.setState({type: st})}
                    key = {i}
                />
            )
        }


        return (
            <View>
                <Buddon
                        style={{position: 'absolute', left: 0, top: 0, padding: 5}}
                        label="< back"
                        onPress={()=>this.props.hide(false)}
                />
                <Text style={[styles.header, styles.centerSelf, {marginBottom: 15}]}>Add Section</Text>
                <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1.8, paddingLeft: 8}}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{flex: 2, marginRight: 10}}>
                                {this.sectionName.getLabelView(styles.subheader)}
                                {this.sectionName.getView()}
                            </View>
                            <NumberField
                                style={{flex: 1}}
                                value={this.state.tempo}
                                bounds={{min: 0, max: 400}}
                                label={"BPM"}
                                keyboardYOffset={110}
                                setValue={(num: number)=>this.setState({tempo: num})}
                            />
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{flex: 1}}>
                                
                                <NumberPairField
                                    bounds = {{min: undefined, max: undefined}}
                                    values = {this.props.selectedArea}
                                    unit= "s"
                                    labels = {{min: "Start Time", max: "End Time"}}
                                    keyboardYOffset={169}
                                />
                            </View>
                        </View>
                        <Buddon 
                            label="Add Section"
                            style={[{alignSelf: 'flex-end', width: 120, marginTop: 25, height: 35, padding: 6}]}
                            onPress={this.submitForm}
                        />
                    </View>
                    <SafeAreaView style={{paddingHorizontal: 10, top: -52, flex: 1}}>
                        <Text style={styles.subheader}>Time Signature</Text>
                        <ScrollView 
                            style={{flexDirection: 'row', margin: 0, padding: 0}}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                        >
                            {timeSigView}
                        </ScrollView>
                        <Text style={[styles.subheader, {marginTop: 9}]}>Section Type</Text>
                        <ScrollView 
                            style={{flexDirection: 'row', margin: 0, padding: 0}}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                        >
                            {sectTypeView}
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </View>
        )
    }
}

function AddButtons(props: {showSectionForm: ()=>void, showLoopForm: ()=>void}) {
    return (
        <View>
            <Text style={[styles.title, styles.centerSelf, {marginTop: 20}]}>Add Sections Menu</Text>
            <View style={[styles.horzLine, {borderWidth: 2}]}></View>
            <View style={{flexDirection: 'row', marginTop: 0}}>
                {/* Add Section Button */}
                <Buddon
                    style={[styles.buttonSize, {padding: 12, margin: 20, marginRight: 10, flex: 1}]}
                    label='Add Section'
                    onPress={props.showSectionForm}
                />
                {/* Add Loop Button */}
                <Buddon
                    style={[styles.buttonSize, {padding: 12, margin: 20, marginLeft: 10, flex: 1}]}
                    label='Add Loop'
                    onPress={props.showLoopForm}
                />
            </View>
        </View>
        
    );
}

function TimeSigButton(props: {timeSig: string, setTimeSig: (ts: string)=>void, selectedTimeSig?: string, key: React.Key}) {
    var isSelected = props.timeSig == props.selectedTimeSig;
    return (
        <TouchableOpacity
            onPress={()=>{props.setTimeSig(props.timeSig)}}
            style={{flex: 1, backgroundColor: colorTheme[(isSelected)?'t_white':'t_dark'], margin: 2, padding: 7, borderRadius: 3}} 
        >
            <Text style={{color: colorTheme[(isSelected)?'t_dark':'t_white']}}>{props.timeSig}</Text>
        </TouchableOpacity>
    );
}
function SectionTypeButton(props: {type: SectionType, setType: (st: SectionType)=>void, selectedType?: SectionType, key: React.Key}) {
    var isSelected = props.type == props.selectedType;
    var color = SectionColor[props.type];
    if(isSelected)
        color = colorTheme['t_white'];
    return (
        <TouchableOpacity 
            onPress={()=>{props.setType(props.type)}}
            style={{flex: 1, backgroundColor: color, margin: 2, padding: 7, borderRadius: 3}} 
        >
            <Text style={{color: colorTheme[(isSelected)?'t_dark':'t_white']}}>{props.type}</Text>
        </TouchableOpacity>
    );
}