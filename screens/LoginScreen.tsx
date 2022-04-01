import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, TextInput, TouchableOpacity } from 'react-native';

import { Text, View } from '../components/Themed';
import { Buddon } from '../components/Buddons';
import { FormInputError } from '../components/Form';
import { appStyles as styles, colorTheme} from '../components/AppStyles';


export default function LoginScreen() {
  return (
	  <View style={{padding: 10}}>
		  <Text style={[styles.header, {fontSize: 50}]}>Login</Text>
		  <LoginForm/>
	  </View>
  );
}

type lfp = {};
type lfs = {username: string, password: string, showUserError: boolean, showPasswordError: boolean};
class LoginForm extends React.Component<lfp, lfs> {
	userErrMsg = "";
	passErrMsg = "";
	constructor(props: any) {
		super(props);
		this.state = {
			username: "",
			password: "",
			showUserError: true,
			showPasswordError: true,
		}
  }

  setEmail = (u:string) => {
	this.setState({username: u});
  }
  setPassword = (p:string) => {
	this.setState({password: p});
  }
  submitLoginInfo = () => {
	//SUBMIT TO PHP HERE
	var { username, password } = this.state;
	console.log("SUBMIT: " + username + ", " + password);

	if(username == "") {
		this.userErrMsg = "Enter your username";
		this.setState({showUserError: true});
	} else if(false) {
		//bad username
	} else { this.setState({showUserError: false})}

	if(password == "") {
		this.userErrMsg = "Enter your password";
		this.setState({showPasswordError: true});
	} else if(false) {
		//bad password
	} else { this.setState({showPasswordError: false})}

  }

  render() {
	var userErrorView = null, passErrorView = null;
	if(this.state.showUserError) {
		userErrorView = (
			<FormInputError errMsg={this.userErrMsg}/>
		)
	} else {
		userErrorView = null;
	}
	if(this.state.showPasswordError) {
		passErrorView = (
			<FormInputError errMsg={this.passErrMsg}/>
		)
	} else {
		passErrorView = false;
	}
	return (
		<View style={{width: 250, alignSelf: 'center'}}>
			<Text style={[styles.header,{marginTop: 15}]}>Username</Text>
			<FormInputError errMsg={this.userErrMsg}/>
			<TextInput
				style={styles.textInput}
				placeholder='username...'
				placeholderTextColor={'#888'}
				keyboardType={'default'}
				onChangeText = {text => this.setEmail(text)}
			/>
			<Text style={[styles.header]}>Password</Text>
			<FormInputError errMsg={this.userErrMsg}/>
			<TextInput
				style={styles.textInput}
				placeholder='password...'
				placeholderTextColor={'#888'}
				keyboardType={'visible-password'}
				onChangeText = {text => this.setPassword(text)}
			/>

			<Buddon
			style={styles.submitBuddon}
			label = "Login"
			onPress={this.submitLoginInfo}
			isSelected={false}
			/>
		</View>
	)
  }
}
