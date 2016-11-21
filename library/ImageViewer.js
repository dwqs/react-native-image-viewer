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

        this.state = {
            curIndex: 0,
            urls:[]
        };

        // image gesture responder
        this.imagePanResponder = null;

        //whether is click
        this.isClick = true;

        //last click time
        this.lastClickTime = 0;

        //timer for click
        this.clickTimer = null;
    }

    static propTypes = {
        shown:PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        imageUrls: PropTypes.array.isRequired,
        index:PropTypes.number.isRequired
    };

    initState(props){
        let {index,imageUrls} = props;

        this.setState({
            curIndex: index,
            urls: imageUrls
        })
    }

    next(curIndex){
        //show next images
        let url = this.state.urls[curIndex + 1];

        if(url){
            this.setState({
                curIndex: curIndex + 1
            })
        } else {
            return true;
        }
    }

    prev(curIndex){
        //show prev images
        let url = this.state.urls[curIndex - 1];

        if(url){
            this.setState({
                curIndex: curIndex - 1
            })
        } else {
            return true;
        }
    }

    componentWillMount(){
        this.imagePanResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            //to trigger multiple touches, this method should return false
            onPanResponderTerminationRequest: (evt, gestureState) => false,

            onPanResponderGrant: (evt, gestureState) => {
                console.log('11111 grant',evt.nativeEvent);
                console.log('111111111 grant',gestureState.dx,gestureState.dy);
                if(evt.nativeEvent.changedTouches.length <= 1){
                    //single touch
                    this.isClick = true;
                } else {
                    //multiple touches
                    this.isClick = false;
                    this.lastClickTime = 0;
                }

            },

            onPanResponderMove: (evt, gestureState) => {
                // 最近一次的移动距离为gestureState.move{X,Y}
                // 从成为响应者开始时的累计手势移动距离为gestureState.d{x,y}
                console.log('22222 Move',evt.nativeEvent);
                console.log('222222 Move',gestureState.dx,gestureState.dy);

                if(evt.nativeEvent.changedTouches.length <= 1){
                    //reset the value of lastClickTime
                    if(this.isClick){
                        this.isClick = false;
                        this.lastClickTime = 0;
                    }
                } else {

                }
            },

            onPanResponderRelease: (evt, gestureState) => {
                console.log('3333 Release',evt.nativeEvent);
                console.log('3333333 Release',gestureState.dx,gestureState.dy);

                if(evt.nativeEvent.changedTouches.length <= 1){
                    if(this.isClick){
                        //trigger double click
                        if(this.lastClickTime && new Date().getTime() - this.lastClickTime < 300){
                            clearTimeout(this.clickTimer);
                            console.log('double click');
                            return;
                        }
                        this.lastClickTime = new Date().getTime();
                    }

                    //trigger click
                    if(gestureState.dx === 0){
                        this.clickTimer = setTimeout(()=>{
                            this.props.onClose();
                        },300);
                        return;
                    }

                    //left slide
                    if(gestureState.dx < -7.5) {
                        this.next(this.state.curIndex);
                    }

                    //right slide
                    if(gestureState.dx > 7.5) {
                        this.prev(this.state.curIndex);
                    }
                } else {
                    
                }
            },

            onPanResponderTerminate: (evt, gestureState) => {
                // another component has become the responder, current gesture will be cancelled
            }
        });
    }

    componentWillReceiveProps(nextProps){
        //initial state data
        this.initState(nextProps);
    }

    render(){

        let {shown} = this.props;

        return (
            <Modal visible={shown} transparent={true} animationType={"none"}>
                <View
                    style={viewer.container}
                    {...this.imagePanResponder.panHandlers}>
                    <Image style={viewer.img} source={{uri: this.state.urls[this.state.curIndex]}}></Image>
                </View>
            </Modal>
        )
    }

    componentWillUnmount(){
        this.imagePanResponder = null;
        this.clickTimer = null;
        this.lastClickTime = undefined;
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