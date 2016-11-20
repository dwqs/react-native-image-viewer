/**
 * Created by pomy on 11/20/16.
 */

'use strict';

import React, { Component,PropTypes } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity,
    Modal,
    Platform,
    PanResponder,
    Dimensions
} from 'react-native';

let {width} = Dimensions.get('window');

export default class ImageViewer extends Component{

    constructor(props){
        super(props);
        this._panResponder = null;
    }

    static propTypes = {
        shown:PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        imageUrls: PropTypes.array.isRequired,
        index:PropTypes.number.isRequired
    };

    componentWillMount(){
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            onPanResponderTerminationRequest: (evt, gestureState) => true,

            onPanResponderGrant: (evt, gestureState) => {
                console.log('11111 grant',evt.nativeEvent);
                console.log('111111111 grant',gestureState.dx,gestureState.dy);
            },

            onPanResponderMove: (evt, gestureState) => {
                // 最近一次的移动距离为gestureState.move{X,Y}
                // 从成为响应者开始时的累计手势移动距离为gestureState.d{x,y}
                console.log('22222 Move',evt.nativeEvent);
                console.log('222222 Move',gestureState.dx,gestureState.dy);
            },

            onPanResponderRelease: (evt, gestureState) => {
                console.log('3333 Release',evt.nativeEvent);
                console.log('3333333 Release',gestureState.dx,gestureState.dy);
                //if dx/dy is zero, trigger click
                if(gestureState.dx === 0){
                    this.props.onClose();
                    return;
                }
            },

            onPanResponderTerminate: (evt, gestureState) => {
                // another component has become the responder, current gesture will be cancelled
            }
        });
    }

    render(){

        let {index,shown,imageUrls} = this.props;

        return (
            <Modal visible={shown} transparent={true} animationType={"none"}>
                <View
                    style={viewer.container}
                    {...this._panResponder.panHandlers}>
                    <Image style={viewer.img} source={{uri:imageUrls[index]}}></Image>
                </View>
            </Modal>
        )
    }
}

let viewer = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor:'#000',
        borderWidth:1,
        borderColor:'red',
        marginTop: Platform.OS === 'ios' ? 20 : 0
    },

    img:{
        width: width,
        height:300
    }
});