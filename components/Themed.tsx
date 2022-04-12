/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function getTheme() {
  const theme = useColorScheme();
  var stuff = Colors[theme];
  return stuff;
}
export function getThemeName() {
  return useColorScheme();
}
export function getOppositeThemeName() {
  var theme = useColorScheme();
  if(theme == 'dark')
    theme = 'light'
  return theme;
}
export function getOppositeTheme() {
  const theme = useColorScheme();
  var stuff = Colors['dark'];
  if(theme == 'dark')
    stuff = Colors['light'];
  return stuff;
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'bg');
  const backgroundColor = 'transparent';
  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
