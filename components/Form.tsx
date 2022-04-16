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

type Bounds = {min?: number, max?: number}

type nfP = {bounds: Bounds, value: number, setValue?:(n: number)=>void, keyboardYOffset?: number, unit?: string, label?: string}
type nfS = {offset: number, animatedV: Animated.Value}
export class NumberField extends React.Component<nfP, nfS> {
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
    setNum = (text: string) => {
        var num = this.checkIfNum(text);
        if(num && this.props.setValue)
            this.props.setValue(this.constrainToBounds(num));
    }
    raiseOnFocus = () => {
        if(this.props.keyboardYOffset)
            Animated.timing(this.state.animatedV, {
                toValue: -this.props.keyboardYOffset,
                duration: this.animTime,
                useNativeDriver: true,
            }).start();
    }
    lowerOnUnfocus = () => {
        if(this.props.keyboardYOffset)
            Animated.timing(this.state.animatedV, {
                toValue: 0,
                duration: this.animTime,
                useNativeDriver: true,
            }).start();
    }
    render() {
        var minLabel = null, maxLabel = null;
        if(this.props.label) {
            maxLabel = <Text style={styles.subheader}>{this.props.label}</Text>
        }
        return (
            <Animated.View 
                style={[{marginTop: this.state.offset, backgroundColor: colorTheme['gray'], borderRadius: 5, paddingHorizontal: 10}]}
            >
                <View 
                    style={[{marginRight: 10}]}
                >
                    {minLabel}
                    <TextInput 
                        value={this.props.value + ""}
                        style={styles.inputBox}
                        onChangeText={(text)=>{this.setNum(text)}}
                        onEndEditing={this.lowerOnUnfocus}
                        keyboardType={'numeric'}
                        onFocus={this.raiseOnFocus}
                    />
                </View>
            </Animated.View>
        );
    }

}

type npfP = {bounds: Bounds, values: Bounds, keyboardYOffset?: number, unit?: string, stackView?: string, labels?: {min: string, max: string}, setLower?: (num: number)=>void, setUpper?: (num: number)=>void};
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
        if(this.props.keyboardYOffset)
            Animated.timing(this.state.animatedV, {
                toValue: -this.props.keyboardYOffset,
                duration: this.animTime,
                useNativeDriver: true,
            }).start();
    }
    lowerOnUnfocus = () => {
        if(this.props.keyboardYOffset)
            Animated.timing(this.state.animatedV, {
                toValue: 0,
                duration: this.animTime,
                useNativeDriver: true,
            }).start();
    }

    render() {
        var minLabel = null, maxLabel = null;
        if(this.props.labels) {
            maxLabel = <Text style={[styles.subheader, {fontSize: 10}]}>{this.props.labels.max}</Text>
            minLabel = <Text style={[styles.subheader, {fontSize: 10}]}>{this.props.labels.min}</Text>
        }
        var minVal = "", maxVal = "";
        if(this.props.values.min != undefined) {
            minVal = (Math.round((this.props.values.min + Number.EPSILON)) / 1000) + "";
            minVal += ((this.props.unit)?this.props.unit:"");
        }
        if(this.props.values.max != undefined) {
            maxVal = (Math.round((this.props.values.max + Number.EPSILON)) / 1000) + "";
            maxVal += ((this.props.unit)?this.props.unit:"");
        }
        return (
            <Animated.View 
                style={[(!this.props.stackView)&&{flexDirection: 'row'}, {marginTop: this.state.offset, backgroundColor: colorTheme['gray'], borderRadius: 5}]}
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