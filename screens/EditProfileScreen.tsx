// React Native & Expo
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, TextInput, Image, TouchableOpacity} from 'react-native';
// Theme and Styles
import { Text, View } from '../components/Themed';
import { appStyles as styles, colorTheme} from '../components/AppStyles';
import Axios from "axios"

// Components
import { Buddon } from '../components/Buddons';
import { FormInputError, FormField, TextField } from '../components/Form';
import UserProfile, { thisAppUser } from '../DatabaseWrappers/Profiles';

export default function EditProfile ({navigation}: any) {
	// TODO: Brandon will do
}