import * as React from 'react';
import { TextInput, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { Draggable } from './Buddons';
import { appStyles as styles, colorTheme, rightBorderRadius, leftBorderRadius, topBorderRadius, bottomBorderRadius} from './AppStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

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


type errorCondition<T> = {val: T, msg: string, operator?: string, errorSet?: T}




export abstract class FormField<T> {
    fieldName: string;
    errorMessage = "";
    showError = false;
    value: T;
    initValue: T;
    moveRef?: number;
    private errorConditions: errorCondition<T>[];
    constructor(fieldName: string, init: T, errorConditions: errorCondition<T>[]) {
        this.fieldName = fieldName;
        this.value = init;
        this.initValue = init;
        this.errorConditions = errorConditions;
    }
    clear() {
        this.showError = false;
        this.errorMessage = "";
        this.value = this.initValue;
        this.moveRef = undefined;
    }
    setField(value: T) {
        this.value = value;
    }
    checkValue() {
        var isBad = false;
        for(var condition of this.errorConditions) {
            switch(condition.operator) {
                case ("!="): isBad = this.value != condition.val; break;
                case ("<="): isBad = this.value <= condition.val; break;
                case (">="): isBad = this.value >= condition.val; break;
                case (">"): isBad = this.value > condition.val; break;
                case ("<"): isBad = this.value < condition.val; break;
                default:  isBad = this.value == condition.val; break;
            }
            if(isBad) {
                if(condition.errorSet)
                    this.value = condition.errorSet;
                this.showError = true;
                this.errorMessage = condition.msg
                return false;
            }
        }
        this.showError = false;
        this.errorMessage = "";
        return true;
    }
    getLabelView(style: any) {
        return <Text style={style}>{this.fieldName}</Text>
    }
    protected getErrorView(style: any) {
        if(this.showError) {
            return <FormInputError errMsg={this.errorMessage} style={style}/>
        }
        return null;
    }
    abstract getView(style?: any, includeTitle?: boolean): JSX.Element;
}

export class TextField extends FormField<string> {
    constructor(fieldName: string, init: string, errorConditions: errorCondition<string>[]) {
        super(fieldName, init, errorConditions);
    }
    getView(style?: any, includeTitle?: boolean) { 
        var errorView = null;
        if(this.showError){
            errorView = this.getErrorView({marginBottom: 8});
        }
        var title = null;
        if(includeTitle) 
            title = this.getLabelView(styles.header);
        return (
            <View style={[style]}>
                {title}
                <TextInput
                    style={[{marginBottom: (this.showError)?0:20}, styles.textInput]}
                    placeholder={this.fieldName.toLowerCase() + '...'}
                    placeholderTextColor={'#888'}
                    keyboardType={'default'}
                    onChangeText = {text => {this.value = text}}
                    selectTextOnFocus = {true}
                    clearButtonMode= 'always'
                />
                {errorView}
            </View>
        )
    }
}
export class NumberField extends FormField<number> {
    verticalDrag?: boolean;
    dragFactor: number = 1;
    numInterval?: number;
    style?: any;
    unit?: string;
    constructor(fieldName: string, init: number, errorConditions: errorCondition<number>[], props?: {verticalDrag?: boolean, dragFactor?: number, numInterval?: number, unit?: string}) {
        super(fieldName, init, errorConditions);
        if(props) {
            this.verticalDrag = props.verticalDrag;
            this.dragFactor = (props.dragFactor)?props.dragFactor:1;
            this.numInterval = props.numInterval;
            this.unit = props.unit;
        }
    }

    changeNum = (x: number, y: number) => {
        // Set the direction of the dragging
        var touchPos = (this.verticalDrag)?-y:x;
        var moveRef;
        var dragFactor = (this.dragFactor)? (this.dragFactor*.5): .5;
        var interval = (this.numInterval)? this.numInterval: 1;

        // If reference not set, then set the reference point to the current location
        if(this.moveRef)
            moveRef = this.moveRef
        else
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
            this.value += delta*interval;
            this.checkValue();
        
            this.moveRef = touchPos;

        } else if(delta === 0) {
            this.moveRef = touchPos;
        }

        // Update the moveRef to the current location
    }

    validateNum(text: string) {
        if(!isNaN(parseFloat(text))) {
            this.value = parseFloat(text);
            this.checkValue();
        } else {
            this.showError = true;
            this.errorMessage = "Enter a number";   
        }
    }

    getView(style?: any) {

        return (
            <View style={{flexDirection: 'row', ...style}}>
                {/* <Draggable
                    onDrag={(e: any, m: any)=> {
                        this.changeNum(e.nativeEvent.locationX, e.nativeEvent.locationY);
                    }}
                    onLift={(e: any, m: any)=> {this.moveRef = undefined}}
                    style={{backgroundColor: colorTheme["bg"], width: 25, height: '100%', ...leftBorderRadius(5), padding: 6, flex: 1}}
                >
                    <Text>...</Text>
                </Draggable> 
                <View style={[styles.vertLine, {marginHorizontal: 0}]}/> */}
                <TextInput 
                    value={this.value + ""}
                    style={{flex: 1, backgroundColor: colorTheme['bg'], width: 100, height: '100%', borderRadius: 5, padding: 6}}
                    onEndEditing={(text)=>{this.validateNum(text.nativeEvent.text)}}
                    keyboardType={'numeric'}
                >
                    {this.value}{this.unit}
                </TextInput>
            </View>
        );
    }
}


type Bounds = {min?: number, max?: number}
type npfP = {bounds: Bounds, values: Bounds, keyboardDifference?: number, unit?: string, stackView?: string, labels?: {min: string, max: string}, setLower?: (num: number)=>void, setUpper?: (num: number)=>void};
type npfS = {offset: number, animatedV: Animated.Value};
export class NumberPairField extends React.Component<npfP, npfS> {
    animTime = 350;
    bounds: Bounds;
    constructor(props: any) {
        super(props);
        this.bounds = props.Bounds;
        this
        this.state = {
            animatedV: new Animated.Value(0),
            offset: 0
        }
        this.state.animatedV.addListener(anim=>{this.setState({offset: anim.value})})
    }
    constrainToBounds = (num: number) => {
        if(this.bounds) {
            if(this.bounds.min && num < this.bounds.min) 
            num = this.bounds.min;
            else if(this.bounds.max && num > this.bounds.max) 
                num = this.bounds.max;
        }       
        return num;
    }
    checkIfNum = (numInput: string) => {
        if(!isNaN(parseFloat(numInput)))
            return parseFloat(numInput);
        return undefined;
            
    }
    changeLower = (textInput: string) => {
        var num = this.checkIfNum(textInput);
        if(num) {
            num = this.constrainToBounds(num);
            if(this.props.values.min && num > this.props.values.min)
                num = this.props.values.min;
            if(this.props.setLower && num)
                this.props.setLower(num);
        }
    }
    changeUpper = (textInput: string) => {
        var num = this.checkIfNum(textInput);
        if(num) {
            num = this.constrainToBounds(num);
            if(this.props.values.min && num < this.props.values.min)
                num = this.props.values.min;
            if(this.props.setUpper && num)
                this.props.setUpper(num);
        }
    }
    raiseOnFocus = () => {
        if(this.props.keyboardDifference)
            Animated.timing(this.state.animatedV, {
                toValue: -this.props.keyboardDifference,
                duration: this.animTime,
                useNativeDriver: true,
            }).start();
    }
    lowerOnUnfocus = () => {
        if(this.props.keyboardDifference)
            Animated.timing(this.state.animatedV, {
                toValue: 0,
                duration: this.animTime,
                useNativeDriver: true,
            }).start();
    }

    render() {
        var minLabel = null, maxLabel = null;
        if(this.props.labels) {
            minLabel = <Text style={styles.subheader}>{this.props.labels.min}</Text>
            maxLabel = <Text style={styles.subheader}>{this.props.labels.max}</Text>
        }
        var minVal = "", maxVal = "";
        if(this.props.values.min != undefined) {
            
            minVal = this.props.values.min + ((this.props.unit)?this.props.unit:"")
        }
        if(this.props.values.max != undefined) {

            maxVal = this.props.values.max + ((this.props.unit)?this.props.unit:"");
        }
        return (
            <Animated.View 
                style={[(!this.props.stackView)&&{flexDirection: 'row'}, {marginTop: this.state.offset, backgroundColor: colorTheme['gray'], borderRadius: 5, paddingHorizontal: 10}]}
            >
                <View 
                    style={[(!this.props.stackView)&&{flex: 1}, {marginRight: 10}]}
                >
                    {minLabel}
                    <TextInput 
                        value={minVal}
                        style={styles.inputBox}
                        onChangeText={(text)=>{this.changeLower(text)}}
                        onEndEditing={this.lowerOnUnfocus}
                        keyboardType={'numeric'}
                        onFocus={this.raiseOnFocus}
                    />
                </View>
                <View style={(!this.props.stackView)&&{flex: 1}}>
                    {maxLabel}
                    <TextInput 
                        value={maxVal}
                        style={styles.inputBox}
                        onChangeText={(text)=>{this.changeUpper(text)}}
                        onEndEditing={this.lowerOnUnfocus}
                        keyboardType={'numeric'}
                        onFocus={this.raiseOnFocus}
                    />
                </View>
            </Animated.View>
        );
    }
}