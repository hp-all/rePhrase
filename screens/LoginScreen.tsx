import { StatusBar } from 'expo-status-bar';
import { Platform, TextInput, TouchableOpacity } from 'react-native';

import { Text, View } from '../components/Themed';
import { Buddon } from '../components/Buddons';
import { appStyles as styles} from '../components/AppStyles';


export default function LoginScreen() {
  return (
      <View>
          <TextInput
            style={styles.textInput}
            placeholder='email'
            placeholderTextColor={'#fff'}
            keyboardType={'numeric'}
          />

          <Buddon
            label = "Login"
            onPress={()=>{}}
            isSelected={false}
          />
      </View>
  );
}

function LoggingIn(){
}