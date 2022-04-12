import * as React from 'react';
import { TextInput, View, Text, TouchableOpacity } from 'react-native';
import { Draggable } from './Buddons';
import { appStyles as styles, colorTheme, rightBorderRadius, leftBorderRadius, topBorderRadius, bottomBorderRadius} from './AppStyles';

type fP = {title: string, children?: any, onSubmit?: (dict: any) => any, style?: any}
type fS = {}
export class Form extends React.Component<fP, fS> {
    childCount: number;
    newChildren: any;
    dict: any = {};
    constructor(props: any) {
        super(props);
        this.state = {
        }
        this.childCount = React.Children.count(this.props.children);
        this.newChildren = React.Children.map(this.props.children, baby => {
            if(baby) {
                console.log("BABY: " + Object.keys(baby?.props) + ", ");
                return this.parseBaby(baby);
            }
        });
        console.log(Object.keys(this.dict));
    }
    parseBaby = (baby: any) => {
        if(Object.keys(baby?.props).includes("numID")) {
            console.log("Adding number");
            return this.makeNumField(baby);
        } else if(Object.keys(baby?.props).includes("textID")) {
            return this.makeTextField(baby);
        } else if(baby.props.children){
            console.log("BABY HAS BABIES YO!");
            var lilerbabies = React.Children.map(baby.props.children, lilbaby => {
                if(lilbaby) {
                    return this.parseBaby(lilbaby);
                }
            });
            console.log("Babies: " + Object.keys(lilerbabies));
            var style = {};
            if(baby.props.style)
                style = baby.props.style;
            return (
                <View style={{...style}}>
                    {lilerbabies}
                </View>
            )
        }
    }
    makeNumField(baby: any) {
        var {numID, numListener, prompt, defaultNum, verticalDrag, numInterval, dragFactor, decimals, upperBound, lowerBound, style} = baby.props;
        var formNumListener = (val: number) => {
            console.log("Changing from " + this.dict[numID] + " to " + val);
            this.dict[numID] = val
            if(numListener) 
                numListener(val);
        };
        this.dict[numID] = defaultNum? defaultNum: 0;
        return (
            <FormNumberObj
                numID = {numID}
                prompt= {prompt}
                numListener={formNumListener}
                defaultNum={defaultNum}
                verticalDrag={verticalDrag}
                numInterval={numInterval}
                dragFactor={dragFactor}
                decimals={decimals}
                upperBound={upperBound}
                lowerBound={lowerBound}
                style={style}
            />
        )   
    }
    makeTextField(baby: any) {
        var {textID, prompt, textListener, defaultText, style} = baby.props;
        var formTextListener = (text: string) => {
            console.log("Changing from " + this.dict[textID] + " to " + text);
            this.dict[textID] = text
            
            if(textListener) 
                textListener(text);
        };
        this.dict[textID] = defaultText? defaultText: 0;
        return (
            <FormTextObj
                textID = {textID}
                prompt= {prompt}
                textListener = {formTextListener}
                defaultText = {defaultText}
                style={style}
            />
        )
    }
    updateVal = (val: number) => {
        this.setState({
            num: val
        })
    }
    onSubmit = () => {
        for(let key of Object.keys(this.dict)) {
            console.log(key + ": " + this.dict[key])
        }
        if (this.props.onSubmit)
            this.props.onSubmit(this.dict);
    }
    render() {
        // console.log("Dict: " + Object.keys(this.dict) + "\nVals: " + this.dict["num test"]);
        return (
            <View style={{alignItems: 'center', ...this.props.style}}>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>{this.props.title}</Text>
                {this.newChildren}
                <TouchableOpacity
                    style={{backgroundColor: colorTheme["blue"], padding: 5, width: "100%", borderRadius: 5, marginVertical: 10}}
                    onPress={this.onSubmit}
                >
                    <Text style={[styles.text, {alignSelf: 'center'}]}>Submit</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

export function FormInputError(props: {
    errMsg: string,
    style?: any
}) {
    return (
        <View style={{borderRadius: 0, padding: 4, backgroundColor: colorTheme['t_opplight'], ...bottomBorderRadius(4), ...props.style}}>
            <Text style={[styles.text, {color: colorTheme['t_oppdark']}]}>{props.errMsg}</Text>
        </View>
    )
}

export class FormField<T> {
    fieldName: string;
    errorMessage = "";
    showError = false;
    fieldValue: T;
    private checkConditions: {val: T, msg: string}[];
    constructor(fieldName: string, init: T, checkConditions: {val: T, msg: string}[]) {
        this.fieldName = fieldName;
        this.fieldValue = init;
        this.checkConditions = checkConditions;
    }
    setField(value: T) {
        this.fieldValue = value;
    }
    checkFieldValue() {
        for(var condition of this.checkConditions) {
            if(this.fieldValue == condition.val) {
                this.showError = true;
                this.errorMessage = condition.msg;
                return false;
            }
        }
        this.showError = false;
        this.errorMessage = "";
        return true;
    }
    getErrorView(style: any) {
        if(this.showError) {
            return <FormInputError errMsg={this.errorMessage} style={style}/>
        }
        return null;
    }
    getTextInputView() {
        if(typeof this.fieldValue == "string") {
            return (
                <View>
                    <Text style={styles.header}>{this.fieldName}</Text>
                    <TextInput
                        style={[styles.textInput, {marginBottom: (this.showError)?0:20}]}
                        placeholder='song name...'
                        placeholderTextColor={'#888'}
                        keyboardType={'default'}
                        onChangeText = {text => {this.fieldValue = text}}
                        clearButtonMode= 'always'
                    />
                </View>
            )
        }
    }
}

    
type fnP = {numID: string, prompt?: string, numListener?: (v: number)=>any, defaultNum?: number, verticalDrag?: boolean, numInterval?: number, dragFactor?: number, decimals?: number, upperBound?: number, lowerBound?: number, style?: any}
type fnS = {num: number, movRef: number,}

type ftP = {textID: string, prompt?: string, textListener?: (v: string)=>any, defaultText?: string, style?: any};
type ftS = {text: string};



class FormNumberObj extends React.Component<fnP, fnS> {
    constructor(props: any) {
    super(props);
        var startNum = 0;
        if(this.props.defaultNum) { startNum = this.props.defaultNum; }
        this.state = {
            num: startNum,
            movRef: 0,
        }
    }
    changeNum = (x: number, y: number) => {
        var touchPos = x;
        var moveRef = this.state.movRef;
        var dragFactor = (this.props.dragFactor)? (this.props.dragFactor*.5): .5;
        var interval = (this.props.numInterval)? this.props.numInterval: 1;

        // Set the direction of the dragging
        if(this.props.verticalDrag) {touchPos = -y;}
        // If not set, then set the reference point to the current location
        if(this.state.movRef == 0)
            moveRef = touchPos;

        // Compute how much to chagne the value based on the drag gesture
        var delta = ((touchPos-moveRef)*dragFactor);
        var d = touchPos - moveRef;

        // Update change if nonzero
        if(Math.abs(delta) >= 1) {
            if(delta > 0) 
                delta = Math.floor(delta);
            else
                delta = Math.ceil(delta);
            var newNum = this.state.num + delta*interval;
            if(this.props.upperBound && newNum > this.props.upperBound)
                newNum = this.props.upperBound;
            if(this.props.lowerBound && newNum < this.props.lowerBound)
                newNum = this.props.lowerBound;
        
            this.setState({
                num: newNum,
                movRef: touchPos,
            });
            if(this.props.numListener)
                this.props.numListener(newNum);
        } else if(delta === 0) {
            this.setState({
                movRef: touchPos,
            })
        }

        // Update the moveRef to the current location
    }
    validateNum(text: string) {
        if(!isNaN(parseFloat(text))) {
            var num = parseFloat(text);
            if(this.props.upperBound && num > this.props.upperBound)
                num = this.props.upperBound;
            if(this.props.lowerBound && num < this.props.lowerBound)
                num = this.props.lowerBound;
            this.setState({
                num: num,
            });

            if(this.props.numListener)
                this.props.numListener(num);
        } else {
            
        }
    }
    render() {
        var num = this.state.num + "";
        var parts = num.split(".");
        if(this.props.decimals) {
            if(num.split(".").length != 2) {
                parts = [num, "".padEnd(this.props.decimals, "0")];
            } else {
                parts[1] = parts[1].padEnd(this.props.decimals, "0");
            }
            num = parts[0] + "." + parts[1];
        }
        return (
            <View style={{flexDirection: 'row', flex: 1, marginTop: 10, ...this.props.style}}>
                <Draggable
                    onDrag={(e: any, m: any)=> {
                        this.changeNum(e.nativeEvent.locationX, e.nativeEvent.locationY);
                    }}
                    onLift={(e: any, m: any)=> {this.setState({movRef: 0})}}
                    style={{backgroundColor: colorTheme["bg"], width: 25, height: '100%', ...leftBorderRadius(5), padding: 6, flex: 1}}
                >
                    <Text>...</Text>
                </Draggable>
                <View style={[styles.horzLine]}/>
                <TextInput 
                    style={{flex: 1, backgroundColor: colorTheme['bg'], width: 100, height: '100%', ...rightBorderRadius(5), padding: 6}}
                    onEndEditing={(text)=>{this.validateNum(text.nativeEvent.text)}}
                >
                    {num}s
                </TextInput>
            </View>
            
        );
    }
}
class FormTextObj extends React.Component<ftP, ftS>{
    constructor(props: any) {
        super(props);
        var startText = "";
        if(this.props.defaultText) { startText = this.props.defaultText; }
        this.state = {
            text: startText,
        }
    }
    setText = (newText: string) => {
        var validText = this.validateText(newText);
        console.log(validText);
        this.setState({
            text: validText,
        });
        
        if(this.props.textListener)
            this.props.textListener(validText);
    }
    validateText =(newText: String) => {
        var validText = newText.replaceAll("{", "").replaceAll("(", "").replaceAll("[", "").replaceAll("\"", "");
        if(validText == "" && this.props.defaultText) {
            validText = this.props.defaultText
        }
        return validText;
    }
    render() {
        return (
            <View style={{flexDirection: 'row', marginTop: 10, ...this.props.style}}>
                <TextInput 
                    style= {{textDecorationStyle: 'dotted', color: (this.state.text == this.props.defaultText)?'rgba(0, 0, 0, 0.5)': '#000', backgroundColor: 'white', borderRadius: 4, height: 25, width: '100%', paddingHorizontal: 6}} 
                    onFocus={e=>{}} 
                    onEndEditing={(e)=>{this.setText(e.nativeEvent.text)}}
                    selectTextOnFocus= {true}
                >
                    {this.state.text}
                </TextInput>
            </View>
            
        );
    }
}

export class FormText extends React.Component<ftP, {}> {
    constructor(props: any) {
        super(props);
    }
}
export class FormNumber extends React.Component<fnP, {}> {
    constructor(props: any) {
        super(props);
    }
}