import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, TextInput, Image} from 'react-native';

import { Text, View } from '../components/Themed';
import { Buddon } from '../components/Buddons';
import { FormInputError } from '../components/Form';
import { appStyles as styles, colorTheme} from '../components/AppStyles';


export default function LoginScreen({navigation, route}: {navigation: any, route:any}) {
	console.log("----------- Start Login Screen ----------------");
	return (
		<View style={[{padding: 10}, styles.transparentbg]}>
			<Text style={[styles.header, {fontSize: 50}]}>Log In</Text>
			<LoginForm
				navigateToRoot={(username: string)=>{navigation.navigate("Root", {username: username})}}
			/>
		</View>
  	);
}

type lfp = {navigateToRoot: (username: string)=>void};
type lfs = {username: string, password: string, showUserError: boolean, showPasswordError: boolean};
class LoginForm extends React.Component<lfp, lfs> {
	userErrMsg = "";
	passErrMsg = "";
	constructor(props: any) {
		super(props);
		this.state = {
			username: "",
			password: "",
			showUserError: false,
			showPasswordError: false,
		}
	}

	setEmail = (u:string) => {
		this.setState({username: u});
	}
	setPassword = (p:string) => {
		this.setState({password: p});
	}
	checkEntries = (username: string, password: string):boolean => {
		var canSubmit = true;
		if(username == "") {
			this.showUserError("Enter your username");
			canSubmit = false;
		} else { this.setState({showUserError: false})}
		if(password == "") {
			this.showPasswordError("Enter your password");
			canSubmit = false;
		} else { this.setState({showPasswordError: false})}
		

		return canSubmit;
	}
	submitLoginInfo = () => {
		var { username, password } = this.state;
		
		if (this.checkEntries(username, password)) {
			//SUBMIT TO PHP HERE
			var DatabaseURL = "http://localhost/Project/login.php"; // where server is hosted right now

			var headers = {
				'Accept' : 'application/json',
				'Content-Type' : 'application/json'
			};
			var Data = {
				Username : username,
				Password : password
			}
			// fetch(DatabaseURL, {
			// 	method: 'POST',
			// 	headers:headers,
			// 	body: JSON.stringify(Data)
			// })
			// .then((Response)=>Response.json()) // check if in the response is in JSON format
			// // dealing with the repsonse
			// .then((Response)=>{
			// 	// Set Login State -> navigate to actual app
			// })
			
			// TODO:: After checking, navigate to the root tab with the props function
			// !!Probably would go within the .then(Response) seciton above
			this.props.navigateToRoot(username);
		}
	}
  	showUserError = (errMsg: string) => {
	this.userErrMsg = errMsg;
	this.setState({showUserError: true});
	}
	showPasswordError = (errMsg: string) => {
		this.passErrMsg = errMsg;
		this.setState({showPasswordError: true});
	}

	render() {
		var userErrorView = null, passErrorView = null;
		var userSpace = {marginBottom: 0}, passSpace = {marginBottom: 0}
		var errMargin = 8;
		var noErrSpace = 10;
		if(this.state.showUserError) {
			userErrorView = (
				<FormInputError errMsg={this.userErrMsg} style={{marginBottom: errMargin}}/>
			);
		} else {
			this.userErrMsg = "";
			userSpace = {marginBottom: noErrSpace};
		}
		if(this.state.showPasswordError) {
			passErrorView = (
				<FormInputError errMsg={this.passErrMsg} style={{marginBottom: errMargin}}/>
			)
		} else {
			this.passErrMsg = "";
			passSpace = {marginBottom: noErrSpace};
		}
		return (
			<View style={{width: 290, alignSelf: 'center', margin: 20, padding: 20, backgroundColor: colorTheme['t_med'], borderRadius: 10}}>
				<Text style={styles.header}>Username</Text>
				<TextInput
					style={[styles.textInput, userSpace]}
					placeholder='username...'
					placeholderTextColor={'#888'}
					keyboardType={'default'}
					onChangeText = {text => this.setEmail(text)}
				/>
				{userErrorView}

				<Text style={[styles.header]}>Password</Text>
				<TextInput
					style={[styles.textInput, passSpace]}
					placeholder='password...'
					placeholderTextColor={'#888'}
					keyboardType={'visible-password'}
					onChangeText = {text => this.setPassword(text)}
				/>
				{passErrorView}

				<Buddon
					style={[styles.submitBuddon, {marginTop: 15}]}
					label = "Login"
					onPress={this.submitLoginInfo}
					isSelected={false}
				/>
			</View>
		)
	}
}
