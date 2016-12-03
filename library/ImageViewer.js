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

/**
 * the width & height of screen
 */
let {width,height} = Dimensions.get('window');

const screenWidth = width;
const screenHeight = height;

//show a default image if image is loaded fail
const fetch_image_failed_url = 'http://p1.bpimg.com/567571/299dcb5013da39c8.png';

export default class ImageViewer extends Component{

    constructor(props){
        super(props);

        this.state = {
            curIndex: 0,
            midIndex: 0,
            maxIndex: 0,
            imagesInfo:[],
            imageLoaded: false,   //whether image loaded fail or success, it'll be true

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

        //the benchmark position of moveBox
        this.standardPositionX = 0;

        //the position of moveBox,for toggle image
        this.positionX = 0;
        this.animatedPositionX = new Animated.Value(0);
    }

    static propTypes = {
        shown: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        imageUrls: PropTypes.array.isRequired,
        index: PropTypes.number.isRequired,
        failedUrl: PropTypes.string
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

                if(evt.nativeEvent.changedTouches.length <= 1){
                    if(this.isClick){
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

    componentWillReceiveProps(nextProps){

        if(nextProps.shown){
            //initial state data
            this.init(nextProps);
        }
    }

    handleLayout(){
        
    }

    /**
     * render image list for preview
     */
    getImageList(){
        let {imageUrls} = this.props;

        const ImageLists = imageUrls.map((imageUrl,index) => {

            let width = this.state.imagesInfo[index] && this.state.imagesInfo[index].width;
            let height = this.state.imagesInfo[index] && this.state.imagesInfo[index].height;
            const imageInfo = this.state.imagesInfo[index];

            //zoom the image if image is too large
            if (width > screenWidth) {
                const widthPixel = screenWidth / width;
                width *= widthPixel;
                height *= widthPixel;
            }

            if (height > screenHeight) {
                const HeightPixel = screenHeight / height;
                width *= HeightPixel;
                height *= HeightPixel;
                //height -= 40;
            }

            switch (imageInfo.status){
                case 'loading':
                    return (
                        <View style={viewer.loadingImgView} key={index}>
                            <Image style={viewer.loadingImg}
                                   source={{uri: imageUrl}}/>
                        </View>
                    );
                case 'success':
                    return (
                        <Animated.Image
                            key={index}
                            style={{width: width, height:height,transform:[{
                                scale:1
                            }]}}
                            source={{uri:imageUrl}}>
                        </Animated.Image>
                    );
                case 'fail':
                    return (
                        <Image key={index}
                               style={viewer.img}
                               source={{uri: this.props.failedUrl ? this.props.failedUrl : fetch_image_failed_url}}/>
                    );
            }
        });

        return ImageLists;
    }

    render(){

        let {shown,imageUrls} = this.props;
        const spin = this.state.rotateValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });

        return (
            <Modal visible={shown} transparent={true} animationType={"none"} onRequestClose={this.modalDismissed.bind(this)} >
                <View style={viewer.titleBar}>
                    <Text style={viewer.title}>
                        {(this.state.curIndex + 1)} / {this.props.imageUrls.length}
                    </Text>
                </View>
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
                        {this.state.imagesInfo.length && this.getImageList()}
                    </Animated.View>
                    {
                        !this.state.imageLoaded ?
                            <View style={viewer.loading}>
                                <View style={[viewer.common,viewer.outer]}></View>
                                <Animated.View style={[viewer.common,viewer.inner,{
                                    transform:[
                                        {rotate:spin}
                                    ]
                                }]}></Animated.View>
                            </View> : null
                    }
                </Animated.View>
            </Modal>
        )
    }

    componentWillUnmount(){
        this.imagePanResponder = null;
        this.clickTimer = null;
        this.lastClickTime = undefined;
        this.isClick = undefined;

        this.standardPositionX = undefined;
        this.animatedPositionX = null;
        this.positionX = undefined;
    }

    /**
     * init data
     * @param props
     */
    init(props){
        let {index,imageUrls} = props;
        let len = imageUrls.length;

        let temp = [];

        imageUrls.forEach(url => {
            temp.push({
                width: 0,
                height: 0,
                status: 'loading',
                url: url
            })
        });

        this.setState({
            curIndex: index,
            maxIndex: len - 1,
            midIndex: Math.floor((len - 1) / 2),
            imagesInfo: temp,
            imageLoaded: false
        },() => {

            //loading animation
            this.startRotate();

            //fetch current image
            this.fetchImage(index);

            //show current image of position
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

    /**
     * update imageInfo of state
     * @param index
     * @param imageInfo
     */
    updateImageInfo(index,imageInfo){
        let imagesInfo = this.state.imagesInfo.slice();
        imagesInfo[index] = imageInfo;
        this.setState({
            imagesInfo:imagesInfo,
            imageLoaded: true
        });
    }

    /**
     * fetch image from url
     * @param index current index of image
     */
    fetchImage(index){

        if (this.state.imagesInfo[index].status === 'success') {
            // already loaded
            this.setState({
                imageLoaded: true
            });
            return;
        }

        const imageInfo = Object.assign({},this.state.imagesInfo[index]);
        const prefetchImagePromise = Image.prefetch(imageInfo.url);

        prefetchImagePromise.then(() => {
            Image.getSize(imageInfo.url, (width, height) => {

                imageInfo.width = width;
                imageInfo.height = height;
                imageInfo.status = 'success';

                this.updateImageInfo(index,imageInfo);
            }, (error) => {
                imageInfo.status = 'fail';
                this.updateImageInfo(index,imageInfo);
            })
        }, () => {
            imageInfo.status = 'fail';
            this.updateImageInfo(index,imageInfo);
        })
    }

    /**
     * start loading animation for load image
     */
    startRotate(){
        this.state.rotateValue.setValue(0);

        if(this.state.imageLoaded){
            // stop the rotate animation
            this.state.rotateValue.setValue(1);
            return;
        }

        Animated.timing(this.state.rotateValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.linear
        }).start(() => this.startRotate());
    }

    /**
     * reset the position of moveBox
     */
    resetPosition() {
        Animated.timing(this.animatedPositionX, {
            toValue: this.standardPositionX,
            duration: 0,
            easing: Easing.linear
        }).start(() => {
            this.positionX = this.standardPositionX;
        });
    }

    /**
     * show next image
     * @param curIndex  current index of image's url in imageUrls
     */

    next(curIndex){
        let url = this.props.imageUrls[curIndex + 1];

        if(url){
            this.standardPositionX -= width;
            this.setState({
                curIndex: curIndex + 1,
                imageLoaded: false
            },this.callback)
        }
    }

    /**
     * show prev images
     * @param curIndex  current index of image's url in imageUrls
     */
    prev(curIndex){
        let url = this.props.imageUrls[curIndex - 1];

        if(url){
            this.standardPositionX += width;
            this.setState({
                curIndex: curIndex - 1,
                imageLoaded: false
            },this.callback)
        }
    }

    /**
     * the callback for state updated when toggle image
     */

    callback(){
        this.fetchImage(this.state.curIndex);
        this.resetPosition();
        this.startRotate()
    }

    /**
     * this callback is required for android
     * it's invoked when modal dismissed
     */
    modalDismissed(){

    }
}

let viewer = StyleSheet.create({

    titleBar:{
        height: 40,
        width: width,
        backgroundColor:'#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Platform.OS === 'ios' ? 20 : 0
    },

    title:{
        color:'#FFFFFF',
        fontSize: 18
    },

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor:'#000',
        // borderWidth:1,
        // borderColor:'red'
    },

    moveBox:{
        //height:300,
        flexDirection: 'row',
        alignItems: 'center',
    },

    loadingImgView:{
        width: width,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center'
    },

    loadingImg:{
        width: width - 50,
        height: 150,
    },

    img:{
        width: width,
        height: 300,
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
        borderRadius:15,
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