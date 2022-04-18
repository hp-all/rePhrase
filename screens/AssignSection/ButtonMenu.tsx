import * as React from 'react';
import { View } from '../../components/Themed';

import { appStyles as styles, colorTheme, leftBorderRadius, rightBorderRadius} from '../../components/AppStyles';
import { Buddon, ButtonGroup, PopupTrigger } from '../../components/Buddons';
import { Spacer, TrackPlayerController } from '../../components/MusicComponents';

import { ButtonLabels, ViewSizeOptions, EditBlockOptions, SnapOptions, ViewSettingsOptions } from './ButtonTypes';

export default function ButtonMenu(props: 
	{
		trackPlayerController: TrackPlayerController,
		popupListener: (p: any)=>any,
		selectedSize: string,
		showLines: boolean, toggleLines: ()=>void,
		editBlock: string,
		showToolComponent: () => void,
		save?: ()=>void,
		undo?: ()=>void,
		redo?: ()=>void,
	}) {
	var { trackPlayerController } = props;
	var loopOptions= [...props.trackPlayerController.track.getLoopNames(), 'none'];
	var undoredoHeight = "100%";
	var playrestartHeight = 40;
	return (
		<View style={[{backgroundColor: colorTheme['gray'], height: 130, paddingHorizontal: 10, paddingBottom: 10}]}>
			<View style={[styles.rowContainer, styles.transparentbg]}>
				<ButtonGroup style={{flex: 1.5}}>
					<PopupTrigger
						label = {ButtonLabels.ViewSettings}
						icon='viewSize'
						popupListener={props.popupListener}
						options= {Object.values(ViewSettingsOptions)}
						isSelected = {false}
						style={{flexShrink: 1, height: '100%', marginRight: 5, marginLeft: 0}}
					/>
                    <Buddon
						label={ButtonLabels.AddBlock}
						icon='add'
						onPress={props.showToolComponent}
						isSelected= {false}
						style={{flexShrink: 1, height: '100%', marginRight: 5, marginLeft: 0}}
					/>
                    <PopupTrigger
                        label={ButtonLabels.EditBlock}
                        icon='editBlock'
                        popupListener={props.popupListener}
                        options= {Object.values(EditBlockOptions)}
                        isSelected= {props.editBlock != 'none'}
                        style={{flexShrink: 1, height: '100%', padding: 0}}
                    />
				</ButtonGroup>
				<View style={[styles.container, styles.transparentbg]}/>
				<ButtonGroup style={{flex: 1, paddingBottom: 10, paddingTop: 5}}>
					<View style={{flex:0.5, backgroundColor: 'transparent'}}/>
					<Buddon
						label='undo'
						icon='undo'
						onPress={()=>{props.undo && props.undo()}}
						isSelected= {false}
                        style={{...rightBorderRadius(0), ...leftBorderRadius(5), height: undoredoHeight, flex: 1}}
						bg= {'t_white'}
					/>
					<View style={[styles.vertLine, {marginHorizontal: 0, flexShrink: 1, height: undoredoHeight}]}/>
					<Buddon
						label='redo'
						icon='redo'
						onPress={()=>{props.redo && props.redo()}}
						isSelected= {false}
                        style={{...rightBorderRadius(5), ...leftBorderRadius(0), height: undoredoHeight, flex: 1}}
						bg= {'t_white'}
					/>
					<Buddon
						label='Save'
						onPress={()=>{props.save && props.save()}}
						isSelected= {true}
                        style={{...rightBorderRadius(0), ...leftBorderRadius(5), height: undoredoHeight, flex: 1}}
					/>
                </ButtonGroup>
			</View>
			<View style={[styles.rowContainer, styles.transparentbg, {marginTop: 15}]}>
				<Spacer flex={0.8}/>
				<Buddon
					label={ButtonLabels.Restart}
					icon='restart' 
					onPress= {trackPlayerController.restart}
					isSelected= {false}
					bg= {'t_white'}
					style={{...rightBorderRadius(0), ...leftBorderRadius(5), marginLeft: 0, flex: 1, height: playrestartHeight, padding: 3}}
				/>
				<View style={[styles.vertLine, {marginHorizontal: 0, flexShrink: 1, height: playrestartHeight}]}/>
				<PopupTrigger
					label={ButtonLabels.PlayLoop}
					style={{flex: 2, height: playrestartHeight, borderRadius: 0}}
					icon= 'loops'
					popupListener={props.popupListener}
					options= {loopOptions}
					isSelected= {false}
					bg= {'t_white'}
				/>
				<View style={[styles.vertLine, {marginHorizontal: 0, flexShrink: 1, height: playrestartHeight}]}/>
				<Buddon
					label={ButtonLabels.Play}
					icon='pause' 
					alticon='play'
					onPress= {trackPlayerController.togglePlay}
					isSelected= {trackPlayerController.isPlaying}
					bg= {'t_white'}
					style={{...rightBorderRadius(5), ...leftBorderRadius(0), marginRight: 0, flex: 1, height: playrestartHeight, padding: 5}}
				/>
				<Spacer flex={0.8}/>
			</View>
		</View>
	)
}
