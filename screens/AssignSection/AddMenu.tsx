// React and Expo Stuff
import * as React from 'react';

// Themes and Styles
import { Text, View } from '../../components/Themed';
import { appStyles as styles, Bounds, colorTheme } from '../../components/AppStyles';
import { Buddon } from '../../components/Buddons';
import { NumberField, NumberPairField, TextField } from '../../components/Form';

// Elements & Components


// Objects & Wrappers
enum AddButtonTypes {
    AddSection, AddLoop, None,
}
type tcP = {hide: ()=>void, selectedArea: Bounds, setSelectedArea?: (a: Bounds)=>void, style?: any};
type tcS = {buttonShowing: AddButtonTypes};
export default class AddMenu extends React.Component<tcP, tcS> {
    initState = {buttonShowing: AddButtonTypes.None}
	constructor(props: any) {
		super(props);
		this.state = this.initState;
	}
    hideButtonForm = () => {
        this.setState({buttonShowing: AddButtonTypes.None});
    }
    setSelectedArea = () => {

    }
	render() {
        var buddonsView = null, formView = null;
        switch(this.state.buttonShowing) {
            case AddButtonTypes.AddLoop:
                formView = (<AddLoopForm hide={this.hideButtonForm} selectedArea={this.props.selectedArea} setSelectedArea={this.props.setSelectedArea}/>)
                break;
            case AddButtonTypes.AddSection: 
                formView = (<AddSectionForm hide={this.hideButtonForm} selectedArea={this.props.selectedArea}/>)
                break;
            default:
                buddonsView = (<AddButtons showSectionForm={()=>this.setState({buttonShowing: AddButtonTypes.AddSection})} showLoopForm={()=>this.setState({buttonShowing: AddButtonTypes.AddLoop})} />)
                break;
        }        

		return(
			<View style={[styles.container, styles.toolComponentStyle,
			{...this.props.style}]}>
				<Buddon
					style= {{position: 'absolute', top: 6, right: 4, height: 20, width: 20, borderRadius: 10, paddingLeft: 1, backgroundColor: colorTheme['t_dark']}}
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

function AddButtons(props: {showSectionForm: ()=>void, showLoopForm: ()=>void}) {
    return (
        <View>
            {/* Add Section Button */}
            <Buddon
                style={[styles.buttonSize, {width: 140, padding: 12, marginVertical: 10}]}
                label='Add Section'
                onPress={props.showSectionForm}
            />
            {/* Add Loop Button */}
            <Buddon
                style={[styles.buttonSize, {width: 140, padding: 12}]}
                label='Add Loop'
                onPress={props.showLoopForm}
            />
        </View>
    );
}

class AddSectionForm extends React.Component<{hide: ()=>void, selectedArea: Bounds}, {showError: boolean}> {

    constructor(props: any) {
        super(props);

    }
    submitForm = () => {

    }
    render() {
        return (
            <View>
                <Text style={styles.subheader}>Add Section</Text>
                <Buddon 
                    label="Add Section"
                    onPress={this.submitForm}
                />
                <Buddon
                    label="back"
                    onPress={this.props.hide}
                />
            </View>
        )
    }
}
class AddLoopForm extends React.Component<{hide: ()=>void, selectedArea: Bounds, setSelectedArea?: (a: Bounds)=>void}, {showError: boolean, startTime: number, endTime: number}> {
    loopName: TextField;
    startTime: NumberField;
    endTime: NumberField;
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
        this.startTime = new NumberField("Start Time", start, [], {numInterval: 10})
        this.endTime = new NumberField("End Time", end, [], {numInterval: 10}) 
        var start = 0, end = 0;
        if(this.props.selectedArea.min)
            start = this.props.selectedArea.min;
        if(this.props.selectedArea.max)
            end = this.props.selectedArea.max;
        this.state = {
            showError: false,
            startTime: start, 
            endTime: end,
        }
    }
    checkEntries = () => {
        var a = this.loopName.checkValue();
        this.startTime.checkValue();
        this.endTime.checkValue();
        return a;
    }
    submitForm = () => {
        if(this.checkEntries()) {
            console.log("LoopName: " + this.loopName.value + ", time: " + this.startTime.value + "-" + this.endTime.value);
        }
    }
    render() {
        return (
            <View>
                <Buddon
                    style={{position: 'absolute', left: 0, top: 0, padding: 5}}
                    label="< back"
                    onPress={this.props.hide}
                />
                <Text style={[styles.header, styles.centerSelf, {marginBottom: 15}]}>Add Loop</Text>
                {this.loopName.getLabelView(styles.subheader)}
                {this.loopName.getView()}
                <NumberPairField
                    bounds = {{min: undefined, max: undefined}}
                    values = {this.props.selectedArea}
                    unit= "s"
                    labels = {{min: "Start Time", max: "End Time"}}
                    keyboardDifference={169}
                    setLower={(n: number)=>{this.props.setSelectedArea && this.props.setSelectedArea({min: n})}}
                    setUpper={(n: number)=>{this.props.setSelectedArea && this.props.setSelectedArea({max: n})}}
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