// React Native & Expo
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, TextInput, Image, TouchableOpacity} from 'react-native';

// Theme and Styles
import { Text, View } from '../components/Themed';
import { appStyles as styles, colorTheme} from '../components/AppStyles';

// Components
import { Buddon } from '../components/Buddons';
import { FormInputError, FormField, TextField } from '../components/Form';

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
	username: TextField;
	password: TextField;
	passwordCheck: TextField;
	constructor(props: any) {
		super(props);
		this.username = new TextField("Username", "", [{val: "", msg: "enter a username"}]);
		this.password = new TextField("Password", "", [{val: "", msg: "enter a Password"}]);
		this.passwordCheck = new TextField("Confirm Password", "", [
			{val: "", msg: "enter a Password"}, 
			{val: this.password.value, msg: "Passwords do not match", operator: "!="}
		]);

		this.state = {
			showError: false,
			isSignup: false,
		}
	}

	clearEntries = () => {
		console.log("clearing");
		this.username.clear();
		this.password.clear();
		this.passwordCheck.clear();
	}
	checkEntries = ():boolean => {
		console.log("Checking");
		var a = this.username.checkValue();
		var b = this.password.checkValue();
		var c = true;
		if(this.state.isSignup) {
			c = this.passwordCheck.checkValue();
		}
		return a && b && c;
	}
	quickLogin = () => {
		var profile = new UserProfile(0, "Admin", "adminpassword");
		thisAppUser.copy(profile);
		this.clearEntries();
		this.props.navigateToRoot(profile.toJSON());
	}
	submitLoginInfo = () => {		
		if (this.checkEntries()) {
			//SUBMIT TO PHP HERE
			var Data = {
				Username : this.username.value,
				Password : this.password.value,
			}
			var profile: UserProfile;
			profile = new UserProfile(0, this.username.value, this.password.value);
			// MYSQLRequest("login.php", Data).then((Response)=>{
				
			// });
			
			// TODO:: After checking, navigate to the root tab with the props function
			// !!Probably would go within the .then(Response) seciton above
		
			thisAppUser.copy(profile);
			this.clearEntries();
			this.props.navigateToRoot(profile.toJSON());
		} else {
            this.setState({showError: true});
		}
	}

	render() {
		var passCheckView = null;
		if(this.state.isSignup) {
			passCheckView = this.passwordCheck.getView();
		}

		var switchText = "click here to sign up instead";
		if(this.state.isSignup)
			switchText = "click here to login";

		return (
			<View style={{width: 290, alignSelf: 'center', margin: 20, padding: 20, backgroundColor: colorTheme['t_med'], borderRadius: 10}}>
				{this.username.getView({}, true)}
				{this.password.getView({}, true)}
				{passCheckView}

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
					onPress={()=>this.setState({isSignup: !this.state.isSignup})}
				>
					<Text style={[styles.subheader, styles.centerSelf, {color: colorTheme['t_white']}]}>{switchText}</Text>
				</TouchableOpacity>

			</View>
		)
	}
}
