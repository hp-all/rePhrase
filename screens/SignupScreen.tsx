import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, TextInput, Image} from 'react-native';

import { Text, View } from '../components/Themed';
import { Buddon } from '../components/Buddons';
import { FormInputError } from '../components/Form';
import { appStyles as styles, colorTheme} from '../components/AppStyles';


export default function SignupScreeen() {
  return (
	<View style={{padding: 10}}>
		<Text style={[styles.header, {fontSize: 50}]}>Sign Up</Text>
		<LoginForm/>
	</View>
  );
}

type lfp = {};
type lfs = {
	username: string,
	password: string,
	passwordCheck: string,
	showUserError: boolean, showPasswordError: boolean};
class LoginForm extends React.Component<lfp, lfs> {
	userErrMsg = "";
	passErrMsg = "";
	constructor(props: any) {
		super(props);
		this.state = {
			username: "",
			password: "",
			passwordCheck: "",
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
	setPasswordCheck = (p: string) => {
		this.setState({passwordCheck: p})
  	}
  	submitLoginInfo = () => {
		//SUBMIT TO PHP HERE
		var { username, password, passwordCheck } = this.state;
		console.log("SUBMIT: " + username + ", " + password + ", " + passwordCheck);


		// Input Checks BEFORE sending to SQL
		if(username == "") {
			this.showUserError("Enter your username");
		} else { this.setState({showUserError: false})}

		if(password == "") {
			this.showPasswordError("Enter your password");
		} else if(password != passwordCheck) {
			this.showPasswordError("Passwords do not match");
		} else { this.setState({showPasswordError: false})}


		// Input Checks AFTER sending to SQL
		// if() {

		// }
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

			<Text style={[styles.header]}>Confirm Password</Text>
			<TextInput
				style={[styles.textInput, passSpace]}
				placeholder='password...'
				placeholderTextColor={'#888'}
				keyboardType={'visible-password'}
				onChangeText = {text => this.setPasswordCheck(text)}
			/>

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
