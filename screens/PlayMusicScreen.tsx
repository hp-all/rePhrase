import { StatusBar } from 'expo-status-bar';
import { Platform, TextInput, TouchableOpacity } from 'react-native';

import { Text, View } from '../components/Themed';
import { appStyles as styles} from '../components/AppStyles';


export default function PlayMusicScreen() {
  return (
		<View style={[styles.container, styles.darkbg]}>
      <Text style={styles.title}>Music Screen</Text>
		<StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
