// React and Expo Stuff
import * as React from 'react';

// Themes and Styles
import { Text, View } from '../../components/Themed';
import { appStyles as styles, Bounds, colorTheme } from '../../components/AppStyles';
import { Buddon } from '../../components/Buddons';
import { NumberField, NumberPairField, TextField } from '../../components/Form';
import Loop from '../../MusicModel/Loop';
import { LoopSkelly, SectionSkelly } from '../../components/MusicComponents';

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
            console.log("Hide all the way");
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
            <View>
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
                    keyboardDifference={169}
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
class AddSectionForm extends React.Component<sfP, {showError: boolean}> {
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
        this.sectionName = new TextField("Section Name", "", [{val: "", msg: "Enter a name for the section"}])
        var start = 0, end = 0;
        if(this.props.selectedArea.min)
            start = this.props.selectedArea.min;
        if(this.props.selectedArea.max)
            end = this.props.selectedArea.max;
        this.state = {
            showError: false,
        }

    }
    submitForm = () => {

    }
    render() {
        return (
            <View>
                <Buddon
                        style={{position: 'absolute', left: 0, top: 0, padding: 5}}
                        label="< back"
                        onPress={()=>this.props.hide(false)}
                />
                <Text style={[styles.header, styles.centerSelf, {marginBottom: 15}]}>Add Loop</Text>

                <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                        {this.sectionName.getLabelView(styles.subheader)}
                        {this.sectionName.getView()}
                        <NumberPairField
                            bounds = {{min: undefined, max: undefined}}
                            values = {this.props.selectedArea}
                            unit= "s"
                            labels = {{min: "Start Time", max: "End Time"}}
                            keyboardDifference={169}
                        />
                    </View>
                    <View style={{flex: 1}}>
                        
                    </View>
                </View>
                <Buddon 
                    style={[styles.centerSelf, {width: 100, marginTop: 15, height: 35, padding: 6}]}
                    label="Add Loop"
                    onPress={this.submitForm}
                />
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