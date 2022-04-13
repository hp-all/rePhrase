// React and Expo Stuff
import * as React from 'react';
import { TouchableOpacity, TextInput, Image} from 'react-native';

// Themes and Styles
import { Text, View } from '../../components/Themed';
import { appStyles as styles, blockColors, colorTheme } from '../../components/AppStyles';

// Components
import { FormField, FormInputError, TextField } from '../../components/Form';
import { Buddon, buttonIcons } from '../../components/Buddons';
import { MYSQLRequest } from '../../DatabaseWrappers/DatabaseRequest';
import { UploadMP3ToDB } from '../../DatabaseWrappers/SongStuff';

export function UploadMP3(props: {onPress: ()=>void, style?: any}) {
    return (
        <View style={props.style}> 
            <TouchableOpacity 
                style={{backgroundColor: blockColors['green_med'], width: 190, borderRadius: 8, height: 50, padding: 10, flexDirection: 'row'}}
                onPress= {props.onPress}    
            >
                <Image source= {buttonIcons['light']['upload']} style={{resizeMode: 'stretch', width: 25, height: 35, marginHorizontal: 5}}/>
                <Text style={[styles.header, styles.centerSelf, {color: 'white'}]}>Upload MP3</Text>
            </TouchableOpacity>
        </View>
    );
}

export function UploadMP3Popup(props: {closePopup: ()=>void}) {
    return (
        <TouchableOpacity style= {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)"}}
			onPress= {props.closePopup}
		>
			<TouchableOpacity style={{alignSelf: "center", top: 50, width: 350, backgroundColor: colorTheme['t_med'], borderRadius: 5, paddingHorizontal:  15}}
				activeOpacity= {1}
			>
				<Text style={[styles.title, styles.centerSelf]}>Upload MP3</Text>
                <UploadMP3Form/>

            </TouchableOpacity>
        </TouchableOpacity>
    );
}

type umfP = {};
type umfS = {showError: boolean, showSuccess: boolean};
class UploadMP3Form extends React.Component<umfP, umfS> {
    songField: TextField;
    albumField: TextField;
    artistField: TextField;
    mp3Field: TextField;
    constructor(props: any) {
        super(props);

        var songChecks = [
            {val: "", msg: "Enter Song Name"}
        ]
        var albumChecks = [
            {val: "", msg: "Enter Album Name"}
        ]
        var artistChecks = [
            {val: "", msg: "Enter Artist Name"}
        ]
        var mp3Checks = [
            {val: "", msg: "Enter MP3"}
        ]
        var initStr: string = "";
        this.songField= new TextField("Song Name", initStr, songChecks),
        this.albumField= new TextField("Album", initStr, albumChecks),
        this.artistField= new TextField("Artist", initStr, artistChecks),
        this.mp3Field= new TextField("MP3 File", initStr, mp3Checks),
        this.state = {
            showError: false,
            showSuccess: false,
        }
    }    

    checkEntries = (): boolean => {
        var a = this.songField.checkValue() 
        var b = this.albumField.checkValue()
        var c = this.artistField.checkValue()
        var d = this.mp3Field.checkValue();
        return a && b && c && d;
	}
    submitLoginInfo = () => {
        this.setState({showSuccess: false});
		if (this.checkEntries()) {
			//SUBMIT TO PHP HERE
            this.songField.value,
            this.albumField.value,
            this.artistField.value,
            this.mp3Field.value

			UploadMP3ToDB(0, this.songField.value, this.albumField.value, this.artistField.value, this.mp3Field.value);
            this.setState({showError: false, showSuccess: true});
		} else {
            this.setState({showError: true});
        }
	}

    render() {
		var successView = null;

        if(this.state.showSuccess) {
            successView = (
                <View style={styles.successIcon}>
                    <Text style={styles.header}> Success! </Text>
                </View>
            )
        }
        return (
            <View style={{width: 290, alignSelf: 'center', padding: 20, paddingTop: 0, borderRadius: 10}}>
                <View style={{alignSelf: 'center', margin: 20, marginBottom: 10, padding: 20, backgroundColor: colorTheme['t_light'], borderRadius: 10}}>
                    {this.songField.getView({}, true)}
                    {this.albumField.getView({}, true)}
                    {this.artistField.getView({}, true)}
                    {this.mp3Field.getView({}, true)}                    
                </View>
                <Buddon
					style={[styles.submitBuddon]}
					label = "Submit"
					onPress={this.submitLoginInfo}
					isSelected={true}
				/>
                {successView}
            </View>

        )
    }

}