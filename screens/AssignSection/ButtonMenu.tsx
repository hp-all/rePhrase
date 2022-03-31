import * as React from 'react';
import { View } from '../../components/Themed';

import { appStyles as styles, colorTheme, leftBorderRadius, rightBorderRadius} from '../../components/AppStyles';
import { Buddon, ButtonGroup, PopupTrigger } from '../../components/Buddons';
import { TrackPlayerController } from '../../components/MusicComponents';

import { ButtonLabels, ViewSizeOptions, EditBlockOptions, SnapOptions, ViewSettingsOptions } from './ButtonTypes';

export default function ButtonMenu(props: 
	{
		trackPlayerController: TrackPlayerController,
		popupListener: (p: any)=>any,
		selectedSize: string,
		showLines: boolean, toggleLines: ()=>void,
		editBlock: string,
		showToolComponent: () => void,
	}) {
	var { trackPlayerController } = props;
	var loopOptions= [...props.trackPlayerController.track.getLoopNames(), 'none'];

	var returnblock = (
		<View style={[{backgroundColor: colorTheme['gray'], height: 130, paddingHorizontal: 10, paddingBottom: 10}]}>
			<View style={[styles.rowContainer, {flex: 1, backgroundColor: 'transparent'}]}>
				<ButtonGroup style={{flex: 1, height: 60}} vertical={false}>
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
				<View style= {styles.container}>
					<ButtonGroup style={{flex: 1.5}}>
						<PopupTrigger
							label={ButtonLabels.PlayLoop}
							icon= 'loops'
							popupListener={props.popupListener}
							options= {[""]}
							isSelected= {false}
							bg= {'t_white'}
							style={{flex: 1}}
						/>
					</ButtonGroup>
					<ButtonGroup style={{flex: 1, alignItems: 'center'}}>
						<Buddon
							label={ButtonLabels.Restart}
							icon='restart' 
							onPress= {trackPlayerController.restart}
							isSelected= {false}
							bg= {'t_white'}
							style={{...rightBorderRadius(0), ...leftBorderRadius(5), marginLeft: 0, flex: 1, height: 40}}
						/>
						<View style={[styles.vertLine, {marginHorizontal: 0, flexShrink: 1, height: 40}]}/>
						<Buddon
							label={ButtonLabels.Play}
							icon='pause' 
							alticon='play'
							onPress= {trackPlayerController.togglePlay}
							isSelected= {trackPlayerController.isPlaying}
							bg= {'t_white'}
							style={{...rightBorderRadius(5), ...leftBorderRadius(0), marginRight: 0, flex: 1, height: 40}}
						/>
					</ButtonGroup>
				</View>
                <ButtonGroup style={{flex: 1, alignItems: 'flex-end', height: '50%'}}>
					<View style={{flex:1, backgroundColor: 'transparent'}}/>
					<Buddon
						label='undo'
						icon='undo'
						onPress={()=>{}}
						isSelected= {false}
                        style={{...rightBorderRadius(0), ...leftBorderRadius(5), flex: 1}}
					/>
					<View style={[styles.vertLine, {marginHorizontal: 0, flexShrink: 1}]}/>
					<Buddon
						label='redo'
						icon='redo'
						onPress={()=>{}}
						isSelected= {false}
                        style={{...rightBorderRadius(5), ...leftBorderRadius(0), flex: 1}}
					/>
                </ButtonGroup>
			</View>
		</View>
	);

	return (
		<View style={[{backgroundColor: colorTheme['gray'], height: 130, paddingHorizontal: 10, paddingBottom: 10}]}>
			<View style={[styles.rowContainer, styles.transparentbg]}>
				<ButtonGroup style={{flex: 1}}>
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
				<View style={{flex: 1}}/>
				<ButtonGroup style={{flex: 1, alignItems: 'flex-end'}}>
					<View style={{flex:1, backgroundColor: 'transparent'}}/>
					<Buddon
						label='undo'
						icon='undo'
						onPress={()=>{}}
						isSelected= {false}
                        style={{...rightBorderRadius(0), ...leftBorderRadius(5), flex: 1}}
					/>
					<View style={[styles.vertLine, {marginHorizontal: 0, flexShrink: 1}]}/>
					<Buddon
						label='redo'
						icon='redo'
						onPress={()=>{}}
						isSelected= {false}
                        style={{...rightBorderRadius(5), ...leftBorderRadius(0), flex: 1}}
					/>
                </ButtonGroup>
			</View>
			<View style={[styles.rowContainer, styles.transparentbg]}>
				
			</View>
		</View>
	)
}
