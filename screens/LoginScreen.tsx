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
type lfs = {username: string, password: string};
class LoginForm extends React.Component<lfp, lfs> {
  constructor(props: any) {
	super(props);
	this.state = {
		username: "",
	  password: "",
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
  }

  render() {
	return (
	  <View style={{width: 250, alignSelf: 'center'}}>
		<Text style={[styles.header,{marginTop: 15}]}>Username</Text>
		<FormInputError errMsg="Hey dog that's a cool username"/>
		<TextInput
			style={styles.textInput}
			placeholder='username...'
			placeholderTextColor={'#888'}
			keyboardType={'default'}
			onChangeText = {text => this.setEmail(text)}
		/>
		<Text style={[styles.header]}>Password</Text>
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
