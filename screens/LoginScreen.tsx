// React Native & Expo
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, TextInput, Image, TouchableOpacity} from 'react-native';

// Theme and Styles
import { Text, View } from '../components/Themed';
import { appStyles as styles, colorTheme} from '../components/AppStyles';

// Components
import { Buddon } from '../components/Buddons';
import { FormInputError, FormField } from '../components/Form';

// Database & Wrappers
import { MYSQLRequest } from '../DatabaseWrappers/DatabaseRequest';
import UserProfile, { thisAppUser } from '../DatabaseWrappers/Profiles';

export default function LoginScreen({navigation, route}: {navigation: any, route:any}) {
	console.log("----------- Start Login Screen ----------------");
	return (
		<View style={[{padding: 10}, styles.transparentbg]}>
			<Text style={[styles.header, {fontSize: 50}]}>Log In</Text>
			<LoginForm
				navigateToRoot={(profileData: any)=>{navigation.navigate("Root", profileData)}}
			/>
		</View>
  	);
}

type lfp = {navigateToRoot: (profileData: any)=>void};
type lfs = {showError: boolean, isSignup: boolean};
class LoginForm extends React.Component<lfp, lfs> {
	usernameField: FormField<string>;
	passwordField: FormField<string>;
	passwordCheckField: FormField<string>;
	constructor(props: any) {
		super(props);
		this.usernameField = new FormField("Username", "", [{val: "", msg: "enter a username"}]);
		this.passwordField = new FormField("Password", "", [{val: "", msg: "enter a username"}]);
		this.passwordCheckField = new FormField("Confirm Password", "", [
			{val: "", msg: "enter a username"}, 
			{val: this.passwordField.value, msg: "Passwords do not match", mustMatch: true}
		]);

		this.state = {
			showError: false,
			isSignup: false,
		}
	}

	checkEntries = ():boolean => {
		console.log("Checking");
		var a = this.usernameField.checkValue();
		var b = this.passwordField.checkValue();
		var c = true;
		if(this.state.isSignup) {
			c = this.passwordCheckField.checkValue();
		}
		return a && b && c;
	}
	quickLogin = () => {
		var profile = new UserProfile(0, "Admin", "adminpassword");
		thisAppUser.copy(profile);
		this.props.navigateToRoot(profile.toJSON());
	}
	submitLoginInfo = () => {		
		if (this.checkEntries()) {
			//SUBMIT TO PHP HERE
			var Data = {
				Username : this.usernameField.value,
				Password : this.passwordField.value,
			}
			var profile: UserProfile;
			profile = new UserProfile(0, this.usernameField.value, this.passwordField.value);
			// MYSQLRequest("login.php", Data).then((Response)=>{
				
			// });
			
			// TODO:: After checking, navigate to the root tab with the props function
			// !!Probably would go within the .then(Response) seciton above
		
			thisAppUser.copy(profile);

			this.props.navigateToRoot(profile.toJSON());
            this.setState({showError: false});
		} else {
            this.setState({showError: true});
		}
	}

	render() {
		var passCheckView = null;
		var userErrView = null, passErrView = null, passCheckErrView = null;
		var userSpace = {marginBottom: 0}, passSpace = {marginBottom: 0}
		var errMargin = 8;
		var noErrSpace = 10;
		
		if(this.state.showError) {
            console.log("Showing Error");
            userErrView = this.usernameField.getErrorView({marginBottom: errMargin});
            passErrView = this.passwordField.getErrorView({marginBottom: errMargin});
			if(this.state.isSignup)
				passCheckErrView = this.passwordField.getErrorView({marginBottom: errMargin});
        }
		if(this.state.isSignup) {
			passCheckView = this.passwordCheckField.getTextInputView();
		}

		var switchText = "click here to sign up instead";
		if(this.state.isSignup)
			switchText = "click here to login";

		return (
			<View style={{width: 290, alignSelf: 'center', margin: 20, padding: 20, backgroundColor: colorTheme['t_med'], borderRadius: 10}}>
				{this.usernameField.getTextInputView()}
				{userErrView}

				{this.passwordField.getTextInputView()}
				{passErrView}

				{passCheckView}
				{passCheckErrView}

				<Buddon
					style={[styles.submitBuddon, {margin: 15}]}
					label = "Login"
					onPress={this.submitLoginInfo}
					isSelected={false}
				/>
				<Buddon
					style={{marginBottom: 15}}
					bg={'t_white'}
					label = "QUICK LOGIN"
					onPress={this.quickLogin}
				/>
				<TouchableOpacity
					style={[styles.transparentbg]}
					onPress={()=>this.setState({isSignup: true})}
				>
					<Text style={[styles.subheader, styles.centerSelf, {color: colorTheme['t_white']}]}>{switchText}</Text>
				</TouchableOpacity>

			</View>
		)
	}
}
