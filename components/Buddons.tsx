import { Component, Children, isValidElement, cloneElement, useCallback } from 'react';
import { PanResponder, PanResponderInstance, Animated, TouchableOpacity, Image } from 'react-native';
import { Text, View } from '../components/Themed';
import { appStyles as styles, colorTheme, colorTypes} from '../components/AppStyles';
import { FontAwesome } from '@expo/vector-icons';



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

type bP = {label: string, onPress: ()=>void, isSelected?: boolean, style?: any, 
    icon?: keyof typeof buttonIcons.light & keyof typeof buttonIcons.dark, 
    alticon?: keyof typeof buttonIcons.light & keyof typeof buttonIcons.dark
    fontAwesome?: {name: 'close'|undefined, size: number, color: string}
    withText?: boolean,
    bg?: colorTypes,
    altbg?: colorTypes,
} 
type bS = {};
export class Buddon extends Component<bP, bS> {
    constructor(props: any) {
        super(props);
    }
    tabBarImg = (
        icon: keyof typeof buttonIcons.light & keyof typeof buttonIcons.dark,
        isSelected?: boolean,
        alticon?: keyof typeof buttonIcons.light & keyof typeof buttonIcons.dark,
    ) => {
        var filesrc;
        if(isSelected)  {
            filesrc = buttonIcons['dark'][icon];
        }
        else {
            if(alticon) {
                filesrc = buttonIcons['light'][alticon];
            }
            else {
                filesrc = buttonIcons['light'][icon];
            }
        }
        var sizeStuff: any = {width: '100%', height: '100%'};
        if(icon == 'editBlock')
            sizeStuff = {width: '100%', height: '400%', left: '0%', top: '-150%'};
        return (
            <Image source= {filesrc} style={{resizeMode: 'contain', ...sizeStuff}}/>
        );
    }

    render() {
        var label = (
            <Text style={[styles.subheader, styles.centerSelf, this.props.isSelected? styles.selectedbuttonlabel: styles.buttonlabel]}>
                {this.props.label}
            </Text>
        );
        var img = null;
        if(this.props.icon) {
            img = this.tabBarImg(this.props.icon, this.props.isSelected, this.props.alticon);
        } else if(this.props.fontAwesome) {
            img = (
                <FontAwesome
                    name={this.props.fontAwesome.name}
                    size={this.props.fontAwesome.size}
                    color={this.props.fontAwesome.color}
                    style={{alignSelf: 'center'}}
                />
            )
        }

        var buttonDisplay;
        if(this.props.withText && img) {
            <View style={styles.rowContainer}>
                {img}
                {label}
            </View>
        } else if(img) {
            buttonDisplay = img;
        }else {
            buttonDisplay = label;
        }

        var bg = null;
        if(this.props.bg && !this.props.isSelected) {
            bg = {backgroundColor: colorTheme[this.props.bg]}
        } else if(this.props.altbg) {
            bg = {backgroundColor: colorTheme[this.props.altbg]}
        }
        return (
            <TouchableOpacity
                onPress={this.props.onPress}
                style={[styles.button, this.props.isSelected && styles.selected, this.props.icon && styles.buttonSize, bg, this.props.style]}
            >
                {buttonDisplay}
            </TouchableOpacity>
        );
    }
}

type ptP = {
    label: string, 
    popupListener: (p: any)=>void, 
    isSelected: boolean, options: any[],  style?: any, 
    icon?: keyof typeof buttonIcons.light & keyof typeof buttonIcons.dark, alticon?: keyof typeof buttonIcons.light & keyof typeof buttonIcons.dark
    bg?: colorTypes,
    key?: any,
} 
type ptS = {};
export class PopupTrigger extends Component<ptP, ptS> {
    constructor(props: any) {
        super(props);

    }
    tabBarImg = (
        isSelected: boolean,
        icon: keyof typeof buttonIcons.light & keyof typeof buttonIcons.dark,
        alticon?: keyof typeof buttonIcons.light & keyof typeof buttonIcons.dark,
    ) => {
        var filesrc;
        if(isSelected)
            filesrc = buttonIcons['dark'][icon];
        else {
            if(alticon)
                filesrc = buttonIcons['light'][alticon];
            else
                filesrc = buttonIcons['light'][icon];
        }
        return <Image source= {filesrc} style={{resizeMode: 'contain'}}/>;
    }

    render() {
        var info = (
            <Text style={[styles.subheader, styles.centerSelf]}>
                {this.props.label}
            </Text>
        );
        if(this.props.icon) {
            info = this.tabBarImg(this.props.isSelected, this.props.icon, this.props.alticon);
        }
        return (
            <Buddon
                key={this.props.key}
                label={this.props.label}
                icon={this.props.icon}
                alticon={this.props.alticon}
                isSelected={this.props.isSelected}
                onPress={()=>{this.props.popupListener({
                    label: this.props.label,
                    options: this.props.options,
                })}}
                bg= {this.props.bg}
                style={this.props.style}
            />
        );
    }
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
