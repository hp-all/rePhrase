/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { RootStackParamList } from '../types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          MusicLibrary: {
            screens: {
              MusicLibraryScreen: 'musiclib',
            },
          },
          PlayMusic: {
            screens: {
              PlayMusicScreen: 'playmusic',
            },
          },
          AssignSection: {
            screens: {
              AssignSectionScreen: 'assignsect',
            },
          },
          ProfileInfo: {
            screens: {
              ProfileInfoScreen: 'profileinfo',
            },
          },
          TestWhatever: {
            screens: {
              TestWhateverScreen: 'testscreen',
            },
          },
        },
      },
      Modal: 'modal',
      NotFound: '*',
      FriendViews: {
        screens: {}
      }
    },
  },
};

export default linking;
