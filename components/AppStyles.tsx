import { StyleSheet } from "react-native";

export type colorTypes = keyof typeof colorTheme 
export const colorTheme = {
	t_dark: '#000b24',
	t_med: '#143662',
	t_light: '#6aa1e9',
	t_white: '#c8d6e9',
	t_opplight: '#ab606b',
	t_oppdark: '#5C0A12',

	white: '#fff',
	black: '#000',
	gray: "#2e3b5a",
	lightgray: '#93a1c2',
	bg: "#fff",
    red: '#FF5A80',
	green: '#09faa0',
    blue: "#57d4ff",
    teal: "#0ca",
    purple: "#A35FFE",
}
export const blockColors = {
	purp_light: "#5352aa",
	purp_med: "#312f75",
	purp_dark: "#1f1e50",

	pink_light: "#b956a1",
	pink_med: "#91337a",
	pink_dark: "#5c1d4d",

	red_light: "#ab606b",
	red_med: "#992f3a",
	red_dark: "#57252a",

	green_light: "#77b887",
	green_med: "#509982",
	green_dark: "#337a72",

	yellow_light: "#c18b40",
	yellow_med: "#af5c33",
	yellow_dark: "#88483c",

	gray: "#2e3b5a",
}
export const SectionColor = {
	"...": blockColors.gray,
    "Verse": blockColors.red_med,
    "Chorus": blockColors.green_light,
    "Bridge": blockColors.pink_med,
    "A": blockColors.red_dark,
    "B": blockColors.purp_med, 
    "C": blockColors.yellow_light,
    "D": blockColors.purp_med,
    "E": blockColors.purp_dark,
    "F": blockColors.pink_light,
    "Intro": blockColors.red_light,
    "Outro": blockColors.yellow_med,
}

export const leftBorderRadius = (rad: number) => {
    return {
        borderTopLeftRadius: rad,
        borderBottomLeftRadius: rad,
    }
}
export const rightBorderRadius = (rad: number) => {
    return {
        borderTopRightRadius: rad,
        borderBottomRightRadius: rad,
    }
}
export const topBorderRadius = (rad: number) => {
	return {
        borderTopRightRadius: rad,
        borderTopLeftRadius: rad,
    }
}
export const bottomBorderRadius = (rad: number) => {
	return {
        borderBottomRightRadius: rad,
        borderBottomLeftRadius: rad,
    }
}

export const appStyles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		backgroundColor: 'transparent',
	},
	rowContainer: {
		flex: 1,
		flexDirection: "row", 
		backgroundColor: 'transparent',
	},
	darkbg: {
		backgroundColor: colorTheme['t_dark'],
	},
	transparentbg: {
		backgroundColor: 'transparent',
	},
	title: {
		fontSize: 35,
		fontWeight: 'bold',
        color: colorTheme['t_white'],
		margin: 15,
	},
	header: {
		fontSize: 25,
		color: colorTheme['t_white'],
	},
	subheader: {
		fontSize: 20,
		color: colorTheme['t_white'],
	},
	text: {
		fontSize: 10,
		color: colorTheme['t_white'],
	},
	centerText: {
		alignSelf: 'center',
	},
	textInput: {
		height: 25,
		backgroundColor: colorTheme['white'],
		alignSelf: 'center',
		borderRadius: 3,
		color: colorTheme['t_dark'],
		paddingHorizontal: 7,
	},


	label: {
		textAlign: "center",
		marginBottom: 10,
		fontSize: 24,
		color: 'black',
	},
	separator: {
		marginVertical: 10,
		height: 2,
		width: '80%',
	},
	button: {
		padding: 0,
		borderRadius: 4,
		backgroundColor: colorTheme['t_light'],
	},
	buttonSize: {
		width: 50,
		height: 50,
	},
	selected: {
		backgroundColor: colorTheme['t_dark'],
	},
	buttonlabel: {
		color: colorTheme['t_dark'],
	},
	selectedbuttonlabel: {
		color: colorTheme['t_white'],
	},
	dropdownItem: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        backgroundColor: "oldlace",
        marginHorizontal: "1%",
        textAlign: "center",
    },


	horzLine: {
		borderBottomColor: colorTheme['t_dark'],
		borderBottomWidth: 1,
		marginVertical: 5,
		width: '100%',
	},
	vertLine: {
		borderRightColor: colorTheme['t_dark'],
		borderRightWidth: 1,
		marginHorizontal: 5,
		height: '100%',
	},

	borsViewStyle: {
		backgroundColor: colorTheme["t_dark"], 
		zIndex: -1, 
		width: '100%', 
	},
	toolComponentStyle: {
		backgroundColor: colorTheme['gray'],
		borderTopColor: colorTheme['t_white'],
		borderWidth: 2,
		...topBorderRadius(4),
		width: '100%', 

	},
});