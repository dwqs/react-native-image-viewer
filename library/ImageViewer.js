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
    Dimensions,
    Easing,
    Animated
} from 'react-native';

let {width,height} = Dimensions.get('window');

export default class ImageViewer extends Component{

    constructor(props){
        super(props);

        this.state = {
            curIndex: 0,
            midIndex: 0,
            maxIndex: 0,
            loadImgSuccess: false,
            //Animated of view
            fadeAnim: new Animated.Value(0),  //opacity for container
            scalable: new Animated.Value(0),   //scale for container
            rotateValue: new Animated.Value(0) //rotate
        };

        // image gesture responder
        this.imagePanResponder = null;

        //whether is click
        this.isClick = true;

        //last click time
        this.lastClickTime = 0;

        //timer for click
        this.clickTimer = null;

        this.standardPositionX = 0;

        //the position of moveBox,for toggle image
        this.positionX = 0;
        this.animatedPositionX = new Animated.Value(0);
    }

    static propTypes = {
        shown:PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        imageUrls: PropTypes.array.isRequired,
        index:PropTypes.number.isRequired
    };

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
                this.move = new Date().getTime()

                if(evt.nativeEvent.changedTouches.length <= 1){
                    //reset the value of lastClickTime
                    if(this.isClick){
                        this.isClick = false;
                        this.lastClickTime = 0;
                    }

                    //offset the moveBox
                    this.positionX = gestureState.dx + this.standardPositionX;
                    this.animatedPositionX.setValue(this.positionX);
                } else {

                }
            },

            onPanResponderRelease: (evt, gestureState) => {
                console.log('3333 Release',evt.nativeEvent);
                console.log('3333333 Release',gestureState.dx,gestureState.dy);
                this.res = new Date().getTime()
                console.log('time',this.res - this.move)

                if(evt.nativeEvent.changedTouches.length <= 1){
                    if(this.isClick){
                        //trigger double click(175 or 300)
                        if(this.lastClickTime && new Date().getTime() - this.lastClickTime < 300){
                            clearTimeout(this.clickTimer);
                            console.log('double click');
                            this.lastClickTime = 0;
                            return;
                        }
                        this.lastClickTime = new Date().getTime();
                    }

                    //trigger click
                    if(gestureState.dx === 0){
                        this.clickTimer = setTimeout(()=>{
                            Animated.parallel([
                                Animated.timing(this.state.fadeAnim, {
                                    toValue: 0,
                                    duration: 200,
                                    easing: Easing.linear
                                }),
                                Animated.timing(this.state.scalable,{
                                    toValue: 0,
                                    duration: 200,
                                    easing: Easing.linear
                                })
                            ]).start(()=>{
                                this.setState({
                                   loadImgSuccess:false
                                });
                                this.props.onClose();
                            });
                        },300);
                        return;
                    }

                    //left slide
                    if(gestureState.dx < -80) {
                        this.next(this.state.curIndex);
                    } else {
                        this.resetPosition();
                    }

                    //right slide
                    if(gestureState.dx > 80) {
                        this.prev(this.state.curIndex);
                    } else {
                        this.resetPosition();
                    }
                } else {
                    console.log('多指触发');
                }
            },

            onPanResponderTerminate: (evt, gestureState) => {
                // another component has become the responder, current gesture will be cancelled
            }
        });
    }

    // shouldComponentUpdate(nextProps, nextState){
    //     return nextState.curIndex !== this.state.curIndex;
    // }

    componentWillReceiveProps(nextProps){
        //initial data
        //this.startRotate();
        if(nextProps.shown){
            this.init(nextProps);
        }
    }

    handleLayout(){
        
    }

    getImageList(){
        let {imageUrls} = this.props;
        const ImageElements = imageUrls.map((imageUrl,index) => {
            return (
                <Animated.Image
                    key={index}
                    style={viewer.img}
                    source={{uri:imageUrl}} />
            )
        });

        return ImageElements;
    }

    render(){

        let {shown,imageUrls} = this.props;
        // const spin = this.state.rotateValue.interpolate({
        //     inputRange: [0, 1],
        //     outputRange: ['0deg', '360deg']
        // });

        return (
            <Modal visible={shown} transparent={true} animationType={"none"} onRequestClose={this.modalDismissed.bind(this)} >
                <Animated.View
                    style={[viewer.container,{
                        opacity:this.state.fadeAnim,
                        transform:[
                            {scale: this.state.scalable}
                        ]
                    }]}
                    onLayout={this.handleLayout.bind(this)}
                    {...this.imagePanResponder.panHandlers}>
                    <Animated.View style={[viewer.moveBox,{
                        width:imageUrls.length * width,
                        transform: [{ translateX: this.animatedPositionX}]
                    }]}>
                        {this.getImageList()}
                    </Animated.View>
                </Animated.View>
            </Modal>
        )
    }

    componentWillUnmount(){
        this.imagePanResponder = null;
        this.clickTimer = null;
        this.lastClickTime = undefined;
        this.isClick = undefined;

        this.animatedPositionX = null;
        this.positionX = undefined;
    }

    init(props){
        let {index,imageUrls} = props;
        let len = imageUrls.length;

        this.setState({
            curIndex: index,
            maxIndex: len - 1,
            midIndex: Math.floor((len - 1) / 2)
        },() => {
            //show current image
            let offset = this.state.midIndex - this.state.curIndex;
            this.positionX = offset*width;
            this.standardPositionX = len%2 === 0 ? this.positionX + width / 2 : this.positionX;
            this.animatedPositionX.setValue(this.standardPositionX);

            Animated.parallel([
                Animated.timing(this.state.fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.linear
                }),
                Animated.timing(this.state.scalable,{
                    toValue: 1,
                    duration: 300,
                    easing: Easing.linear
                })
            ]).start();
        });
    }

    startRotate(){
        this.state.rotateValue.setValue(0);

        if(this.state.loadImgSuccess){
            // stop the rotate animation
            this.state.rotateValue.setValue(1);
        }

        Animated.timing(this.state.rotateValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.linear
        }).start(() => this.startRotate());
    }

    resetPosition() {
        Animated.timing(this.animatedPositionX, {
            toValue: this.standardPositionX,
            duration: 0,
            easing: Easing.linear
        }).start(() => {
            this.positionX = this.standardPositionX;
        });
    }

    next(curIndex){
        //show next images
        let url = this.props.imageUrls[curIndex + 1];

        if(url){
            this.standardPositionX -= width;
            this.setState({
                curIndex: curIndex + 1,
                loadImgSuccess: false
            },() => {
                this.resetPosition();
                //this.startRotate()
            })
        } else {
            return true;
        }
    }

    prev(curIndex){
        //show prev images
        let url = this.props.imageUrls[curIndex - 1];

        if(url){
            this.standardPositionX += width;
            this.setState({
                curIndex: curIndex - 1,
                loadImgSuccess: false
            },() => {
                this.resetPosition();
                //this.startRotate()
            })
        } else {
            return true;
        }
    }

    modalDismissed(){
        //this callback is required for android
    }
}

let viewer = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor:'#000',
        //borderWidth:1,
        //borderColor:'red',
        marginTop: Platform.OS === 'ios' ? 20 : 0
    },

    moveBox:{
        height:310,
        flexDirection: 'row',
        alignItems: 'center',
        //borderWidth:1,
        //borderColor:'blue'
    },

    img:{
        width: width,
        height:300,
    },

    loading:{
        position:'absolute',
        top: height/2 - 30,
        left: width/2 - 30
    },

    common:{
        position:'absolute',
        zIndex:22,
        width:30,
        height: 30,
        borderWidth:3,
        borderRadius:15
    },

    outer:{
        borderColor:'gray'
    },

    inner:{
        borderTopColor: 'rgba(255,255,255,0.8)',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent'
    }
});

// {
//     !this.state.loadImgSuccess ?
//         <View style={viewer.loading}>
//             <View style={[viewer.common,viewer.outer]}></View>
//             <Animated.View style={[viewer.common,viewer.inner,{
//                 transform:[
//                     {rotate:spin}
//                 ]
//             }]}></Animated.View>
//         </View> : null
// }