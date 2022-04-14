import { Component, Children, isValidElement, cloneElement, useCallback } from 'react';
import { PanResponder, PanResponderInstance, Animated, TouchableOpacity, Image } from 'react-native';
import { Text, View } from '../components/Themed';
import { appStyles as styles, colorTheme, ColorTypes} from '../components/AppStyles';
import { FontAwesome } from '@expo/vector-icons';



type ButtonIcon = keyof typeof buttonIcons.light & keyof typeof buttonIcons.dark;
export const buttonIcons = {
    light: {
        play:       require("../assets/images/buttons/light/play.png"),
        pause:      require("../assets/images/buttons/light/pause.png"),
        restart:    require("../assets/images/buttons/light/restart.png"),
        viewSize:   require("../assets/images/buttons/light/viewSize.png"),
        editBlock:  require("../assets/images/buttons/light/editBlock.png"),
        showLines:  require("../assets/images/buttons/light/showLines.png"),
        list:       require("../assets/images/buttons/light/list.png"),
        add:        require("../assets/images/buttons/light/add.png"),
        snap:       require("../assets/images/buttons/light/snap.png"),
        loops:      require("../assets/images/buttons/light/loops.png"),
        undo:       require("../assets/images/buttons/light/undo.png"),
        redo:       require("../assets/images/buttons/light/redo.png"),
        upload:       require("../assets/images/buttons/dark/upload.png"),

    },
    dark: {
        play:       require("../assets/images/buttons/dark/play.png"),
        pause:      require("../assets/images/buttons/dark/pause.png"),
        restart:    require("../assets/images/buttons/dark/restart.png"),
        viewSize:   require("../assets/images/buttons/dark/viewSize.png"),
        editBlock:  require("../assets/images/buttons/dark/editBlock.png"),
        showLines:  require("../assets/images/buttons/dark/showLines.png"),
        list:       require("../assets/images/buttons/dark/list.png"),
        add:        require("../assets/images/buttons/dark/add.png"),
        snap:       require("../assets/images/buttons/dark/snap.png"),
        loops:      require("../assets/images/buttons/light/loops.png"),
        undo:       require("../assets/images/buttons/light/undo.png"),
        redo:       require("../assets/images/buttons/light/redo.png"),
        upload:       require("../assets/images/buttons/dark/upload.png"),
    }
}

type dp = {children?: any, onLift?: any, onDrag?: any, showXBar?: boolean, style?: any};
type dS = {dragging: boolean, label: string, xVal: number};
export class Draggable extends Component<dp, dS> {
    state= {
        dragging: false,
        label: "pos: ",
        xVal: 0,
    }    
    _panResponder: PanResponderInstance;
    point = new Animated.ValueXY();

    constructor(props: any) {
        super(props);
        this._panResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      
            onPanResponderGrant: (evt, gestureState) => {
              // The gesture has started. Show visual feedback so the user knows
              // what is happening!
              // gestureState.d{x,y} will be set to zero now
            //   console.log(gestureState.x0);
              this.setState({ dragging: true });
            },
            onPanResponderMove: (evt, gestureState) => {
                //Animated.event([{ y: this.point.y, x: this.point.x }])({ y: gestureState.moveY, x: gestureState.moveX });
                this.setState({
                    label: "pos: " + gestureState.dx + ", " + gestureState.dy, 
                    xVal: evt.nativeEvent.locationX
                });
                this.props.onDrag(evt, gestureState);
                // The most recent move distance is gestureState.move{X,Y}
                // The accumulated gesture distance since becoming responder is
                // gestureState.d{x,y}
            },
            onPanResponderTerminationRequest: (evt, gestureState) => false,
            onPanResponderRelease: (evt, gestureState) => {
                // The user has released all touches while this view is the
                // responder. This typically means a gesture has succeeded
                this.setState({
                    label: "pos: " + gestureState.dx + ", " + gestureState.dy, 
                    xVal: evt.nativeEvent.locationX
                });
                this.props.onLift(evt, gestureState);
            },
            onPanResponderTerminate: (evt, gestureState) => {
              // Another component has become the responder, so this gesture
              // should be cancelled
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
              // Returns whether this component should block native components from becoming the JS
              // responder. Returns true by default. Is currently only supported on android.
              return true;
            }
          });
    }
    render() {
        var childrenWithProps = Children.map(this.props.children, child => {
            // Checking isValidElement is the safe way and avoids a typescript
            // error too.
            if (isValidElement(child)) {
                return cloneElement(child);
            }
            return child;
        });
        var xBarView = null;
        if(this.props.showXBar) {
            xBarView = <View style={{position: "absolute", left: this.state.xVal, height: '100%', borderLeftWidth: 2, borderColor: "yellow", backgroundColor: "transparent"}}/>
        }
        return (
            <View style={{backgroundColor: 'transparent'}}>
                <Animated.View
                style={{
                    zIndex: 2,
                    height: "100%",
                    ...this.props.style,
                }}
                {...this._panResponder.panHandlers}
                >
                    {childrenWithProps}
                    {xBarView}
                </Animated.View>
            </View>
        );
    }
}

export function Buddon (props: {label: string, onPress: ()=>void, isSelected?: boolean, style?: any, 
    icon?: ButtonIcon, 
    alticon?: ButtonIcon,
    fontAwesome?: {name: 'close'|undefined, size: number, color: string}
    withText?: boolean,
    bg?: ColorTypes,
    altbg?: ColorTypes,
}) {
    const tabBarImg = (icon: ButtonIcon, alticon?: ButtonIcon, isSelected?: boolean) => {
        var filesrc;
        if(isSelected)  {filesrc = buttonIcons['dark'][icon];}
        else {
            if(alticon)
                filesrc = buttonIcons['light'][alticon];
            else
                filesrc = buttonIcons['light'][icon];
        }
        var sizeStuff: any = {width: '100%', height: '100%'};
        if(icon == 'editBlock')
            sizeStuff = {width: '100%', height: '400%', left: '0%', top: '-150%'};
        if(icon == 'undo' || icon == 'redo') 
            sizeStuff = {width: '90%', height: '100%', marginHorizontal: '5%'};
        return (
            <Image source= {filesrc} style={{resizeMode: 'contain', ...sizeStuff}}/>
        );
    }
    var label = (
        <Text style={[styles.subheader, styles.centerSelf, props.isSelected? styles.selectedbuttonlabel: styles.buttonlabel]}>
            {props.label}
        </Text>
    );
    var img = null;
    if(props.icon) {
        img = tabBarImg(props.icon, props.alticon, props.isSelected);
    } else if(props.fontAwesome) {
        img = (
            <FontAwesome
                name={props.fontAwesome.name}
                size={props.fontAwesome.size}
                color={props.fontAwesome.color}
                style={{alignSelf: 'center'}}
            />
        )
    }

    var buttonDisplay;
    if(props.withText && img) {
        console.log(props.label);
        <View style={{flexDirection: 'row'}}>
            <Image source= {buttonIcons['light']['loops']} style={{resizeMode: 'contain', width: '100%', height: '100%', flex: 1}}/>
            <Text style={[styles.subheader, styles.centerSelf, props.isSelected? styles.selectedbuttonlabel: styles.buttonlabel, {flex: 1}]}>
                {props.label}
            </Text>
        </View>
    } else if(img) {
        buttonDisplay = img;
    }else {
        buttonDisplay = label;
    }

    var bg = null;
    if(props.bg && !props.isSelected) {
        bg = {backgroundColor: colorTheme[props.bg]}
    } else if(props.altbg) {
        bg = {backgroundColor: colorTheme[props.altbg]}
    }
    return (
        <TouchableOpacity
            onPress={props.onPress}
            style={[styles.button, props.isSelected && styles.selected, props.icon && styles.buttonSize, bg, props.style]}
        >
            {buttonDisplay}
        </TouchableOpacity>
    );
}

export function PopupTrigger (props: {
    label: string, 
    popupListener: (p: any)=>void, 
    isSelected: boolean, 
    options: any[],  
    icon?: keyof typeof buttonIcons.light & keyof typeof buttonIcons.dark, alticon?: keyof typeof buttonIcons.light & keyof typeof buttonIcons.dark
    bg?: ColorTypes,
    key?: any, style?: any, 
    withText?: boolean;
}) {
    return (
        <Buddon
            key={props.key}
            label={props.label}
            icon={props.icon}
            alticon={props.alticon}
            isSelected={props.isSelected}
            onPress={()=>{props.popupListener({
                label: props.label,
                options: props.options,
            })}}
            bg= {props.bg}
            style={props.style}
            withText= {props.withText}
        />
    );
}

export function ButtonGroup(props: {label?: string, style?: any, children?: any, vertical?: boolean}) {
    var babies = Children.map(props.children, baby => {
        // Checking isValidElement is the safe way and avoids a typescript
        // error too.
        if (isValidElement(baby)) {
            return cloneElement(baby);
        }
        return baby;
    });
    return (
        <View style={[styles.container, {flex: 1, backgroundColor: 'transparent', ...props.style}]}>        
            <Text style={[styles.subheader, {flexShrink: 1}]}>{props.label}</Text>
            <View style={[props.vertical? styles.container: styles.rowContainer, {flex: 1, backgroundColor: 'transparent'}]}>
                {babies}
            </View>
        </View>
    )
}
