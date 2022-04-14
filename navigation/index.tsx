/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable, Image, Text, View} from 'react-native';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { appStyles, colorTheme } from '../components/AppStyles';

import ModalScreen from '../screens/ModalScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

import NotFoundScreen from '../screens/NotFoundScreen';
import MusicLibraryScreen from '../screens/MusicLibrary/MusicLibraryScreen';
import PlayMusicScreen from '../screens/PlayMusicScreen';
import AssignSectionScreen from '../screens/AssignSection/AssignSectionScreen';
import ProfileInfoScreen from '../screens/ProfileInfoScreen';
import TestWhateverScreen from '../screens/TestWhateverScreen';

import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import UserProfile from '../DatabaseWrappers/Profiles';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      // theme={DefaultTheme}
      theme={DarkTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  //TODO

  return (
    // ask php if logged in
      //show app
    // else 
      //show login
    <Stack.Navigator initialRouteName='Login'>
      
      <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Modal" component={ModalScreen} />
      </Stack.Group>
      <Stack.Screen name="Login" component={LoginScreen} options={{
        title: '',
        header: () => (
          <Header title=''/>
        ),
      }}/>
      <Stack.Screen name="Signup" component={SignUpScreen} options={{
        title: '',
        header: () => (
          <Header title=''/>
        ),
      }}/>

      
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator({navigation, route}: {navigation: any, route: any}) {
  const colorScheme = useColorScheme();
  var userProfile = undefined;
  if(route.params) {
    userProfile = UserProfile.parseJSON(route.params);
    // console.log(userProfile);
  }
  return (
    <BottomTab.Navigator
      initialRouteName="MusicLibrary"
      screenOptions={{
        tabBarInactiveBackgroundColor: colorTheme['t_white'],
        tabBarActiveBackgroundColor: colorTheme['t_dark'],
        tabBarActiveTintColor: colorTheme['t_oppdark'],
      }}
    >
      <BottomTab.Screen
        name="MusicLibrary"
        component={MusicLibraryScreen}
        options={({ navigation }: RootTabScreenProps<'MusicLibrary'>) => ({
          title: '',
          tabBarIcon: ({ color, focused }) => <TabBarImg icon='library' color={color} focused={focused} />,
          // headerRight: () => (
          //   <Pressable
          //     onPress={() => navigation.navigate('Login')}
          //     style={({ pressed }) => ({
          //       opacity: pressed ? 0.5 : 1,
          //     })}>
          //     <FontAwesome
          //       name="info-circle"
          //       size={25}
          //       color={Colors[colorScheme].text}
          //       style={{ marginRight: 15 }}
          //     />
          //   </Pressable>
          // ),
          header: () => (
            <Header title=''/>
          ),
        })}
        initialParams={route.params}
      />
      <BottomTab.Screen
        name="PlayMusic"
        component={PlayMusicScreen}
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => <TabBarImg icon='playMusic' color={color} focused={focused}/>,
          header: () => (
            <Header title=''/>
          ),
        }}
        initialParams={route.params}
      />
      <BottomTab.Screen
        name="AssignSection"
        component={AssignSectionScreen}
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => <TabBarImg icon='sectionView' color={color} focused={focused} />,
          header: () => (
            <Header title=''/>
          ),
        }}
        initialParams={route.params}
      />
      <BottomTab.Screen
        name="ProfileInfo"
        component={ProfileInfoScreen}
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => <TabBarImg icon='profile' color={color} focused={focused} />,
          header: () => (
            <Header title=''/>
          ),
        }}
        initialParams={route.params}
      />
      {/* <BottomTab.Screen
        name="TestWhatever"
        component={TestWhateverScreen}
        options={{
          title: '',
          headerLeft: () => (
            <Image source={require("../assets/images/logos/icon.png")} style={{resizeMode: 'contain', height: 48, width: '100%', marginVertical: 5, marginLeft: -20}}/>
          ),
          header: () => (
            <Header title=''/>
          ),
        }}
      /> */}
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
}

function TabBarImg(props: {
  icon: keyof typeof navImgs.selected & keyof typeof navImgs.deselected;
  color: string;
  focused?: boolean
}) {
  if(props.focused) {
    return (
        <Image source= {navImgs.selected[props.icon]} style={{resizeMode: 'contain', width: '100%', height: 40, marginTop: 15}}/>
    );
  }
  return <Image source= {navImgs.deselected[props.icon]} style={{resizeMode: 'contain', width: '100%', height: 40, marginTop: 15}}/>
}

function Header(props: {
  title: string;
}) {
  if(props.title == "") {
    return (
      <View style={{height: 100, backgroundColor: colorTheme["t_dark"], borderBottomColor: colorTheme['gray'], borderBottomWidth: 1}}>
        {/* <Image source={require("../assets/images/logos/title.png")} style= {{position: 'absolute', right: -20, top: 45, resizeMode: 'contain', height: 45, alignSelf: 'center'}}/> */}
        <Image source={require("../assets/images/logos/title.png")} style= {{marginTop: 45, resizeMode: 'contain', height: 45, alignSelf: 'center'}}/>
      </View>
    )
  }
  return (
    <View style={{paddingBottom: 15, paddingTop: 48, backgroundColor: colorTheme["t_white"], borderBottomColor: colorTheme['gray'], borderBottomWidth: 1}}>
      <Image source={require("../assets/images/logos/title.png")} style= {{position: 'absolute', top: 40, right: 1, resizeMode: 'contain', height: 30, alignSelf: 'center'}}/>
      <Text style={[appStyles.header, {alignSelf: 'center'}]}>{props.title}</Text>
    </View>
  );
}


const navImgs= {
  selected: {
    library: require("../assets/images/navigation/library-selected.png"),
    playMusic: require("../assets/images/navigation/playMusic-selected.png"),
    sectionView: require("../assets/images/navigation/sectionView-selected.png"),
    profile: require("../assets/images/navigation/profile-selected.png"),
  },
  deselected: {
    library: require("../assets/images/navigation/library.png"),
    playMusic: require("../assets/images/navigation/playMusic.png"),
    sectionView: require("../assets/images/navigation/sectionView.png"),
    profile: require("../assets/images/navigation/profile.png"),
  }
}