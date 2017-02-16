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

        //scale the image for double click
        this.imgScale = 1;

        //the whole offset of drag when scale
        this.horizontalWholeCounter = 0;

        //the max offset of drag
        this.maxOffsetX = 0;

        //layout info of image
        this.layoutImage = {};

        //whether reached the drag border when drag the image
        this.isReachedBorder = false;

        //pinch for zoom image
        this.zoomCurrentDistance = 0;
        this.zoomLastDistance = undefined;
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
                this.zoomLastDistance = undefined;
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

                let touches = evt.nativeEvent.changedTouches;
                let curIndex = this.state.curIndex;
                let imageInfo = this.state.imagesInfo[curIndex];


                if(touches.length <= 1){
                    //reset the value of lastClickTime
                    if(this.isClick){
                        this.isClick = false;
                        this.lastClickTime = 0;
                    }

                    if(this.imgScale === 1.5){
                        let {width} = this.layoutImage[curIndex];
                        this.maxOffsetX = Math.ceil(width * 0.5 / 2 - 30);

                        let x = gestureState.dx + this.horizontalWholeCounter;
                        this.isReachedBorder = false;

                        if((x >= this.maxOffsetX) && gestureState.dx > 0){
                            //drag left
                            this.isReachedBorder = true;
                            x = this.maxOffsetX;
                        }

                        if((x <= -this.maxOffsetX) && gestureState.dx < 0){
                            // drag right
                            this.isReachedBorder = true;
                            x = -this.maxOffsetX;
                        }

                        !this.isReachedBorder && imageInfo.animatedX.setValue(x);

                        if(this.isReachedBorder){
                            //offset the moveBox
                            this.positionX = gestureState.dx + this.standardPositionX;
                            this.animatedPositionX.setValue(this.positionX);
                        }
                    } else {
                        //offset the moveBox
                        this.positionX = gestureState.dx + this.standardPositionX;
                        this.animatedPositionX.setValue(this.positionX);
                    }
                } else {
                    let minX, maxX;
                    let minY, maxY;

                    if (touches[0].locationX > touches[1].locationX) {
                        minX = touches[1].pageX;
                        maxX = touches[0].pageX;
                    } else {
                        minX = touches[0].pageX;
                        maxX = touches[1].pageX;
                    }

                    if (touches[0].locationY > touches[1].locationY) {
                        minY = touches[1].pageY;
                        maxY = touches[0].pageY;
                    } else {
                        minY = touches[0].pageY;
                        maxY = touches[1].pageY;
                    }

                    const widthDistance = maxX - minX;
                    const heightDistance = maxY - minY;
                    const diagonalDistance = Math.sqrt(widthDistance * widthDistance + heightDistance * heightDistance);
                    this.zoomCurrentDistance = Number(diagonalDistance.toFixed(1));

                    if(this.zoomLastDistance !== undefined){
                        let distanceDiff = (this.zoomCurrentDistance - this.zoomLastDistance) / 200;
                        let zoom = this.imgScale + distanceDiff;

                        if (zoom < 1) {
                            zoom = 1;
                        }
                        if (zoom > 1.5) {
                            zoom = 1.5;
                        }

                        this.imgScale = zoom;
                        imageInfo.scalable.setValue(this.imgScale);

                    }
                    this.zoomLastDistance = this.zoomCurrentDistance;
                }
            },

            onPanResponderRelease: (evt, gestureState) => {

                if(evt.nativeEvent.changedTouches.length <= 1){
                    if(this.isClick){
                        if(this.lastClickTime && new Date().getTime() - this.lastClickTime < 300){
                            clearTimeout(this.clickTimer);
                            let curIndex = this.state.curIndex;
                            let imageInfo = this.state.imagesInfo[curIndex];

                            if(this.imgScale === 1) {
                                this.imgScale = 1.5;
                            } else {
                                this.imgScale = 1;
                                imageInfo.animatedX.setValue(0);
                            }

                            Animated.timing(imageInfo.scalable,{
                                toValue: this.imgScale,
                                duration: 300
                            }).start(() => {
                                this.horizontalWholeCounter = 0;
                                this.maxOffsetX = 0;
                                this.isReachedBorder = false;
                            });

                            this.lastClickTime = 0;
                            return;
                        }
                        this.lastClickTime = new Date().getTime();
                    }

                    if(this.imgScale === 1.5){
                        if(!this.isReachedBorder){
                            this.horizontalWholeCounter += gestureState.dx;
                            return;
                        }
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
                    console.log('multiple touches');
                }
            },

            onPanResponderTerminate: (evt, gestureState) => {
                // another component has become the responder, current gesture will be cancelled
            }
        });
    }


    componentDidMount() {

        // compoentWillReceiveProps not be triggle ...
        if(this.props.shown){
            //initial state data
            this.init(this.props);
        }
    }

    componentWillReceiveProps(nextProps){

        if(nextProps.shown){
            //initial state data
            this.init(nextProps);
        }
    }

    /**
     * render image list for preview
     */
    getImageList(){
        let {imageUrls} = this.props;

        const ImageLists = imageUrls.map((imageUrl,index) => {

            const imageInfo = this.state.imagesInfo[index];

            let width = imageInfo && imageInfo.width;
            let height = imageInfo && imageInfo.height;
            let scalable = imageInfo && imageInfo.scalable;
            let animatedX = imageInfo && imageInfo.animatedX;

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
                        <View style={viewer.loadedImg} key={index}>
                            <Animated.View
                                style={{width: width, height: height,transform:[
                                    { scale: scalable},
                                    { translateX: animatedX}
                                ]}}>
                                <Image
                                    onLayout={(e) => {
                                        this.layoutImage[index] = e.nativeEvent.layout;
                                    }}
                                    style={{width: width, height: height}}
                                    source={{uri:imageUrl}}/>
                            </Animated.View>
                        </View>

                    );
                case 'fail':
                    return (
                        <View style={viewer.failedImg} key={index}>
                            <Image
                                style={viewer.failedImg}
                                source={{uri: this.props.failedUrl ? this.props.failedUrl : fetch_image_failed_url}}/>
                        </View>
                    );
            }
        });

        return ImageLists;
    }

    handleLayout(){

    }

    render(){

        let {shown,imageUrls} = this.props;
        const spin = this.state.rotateValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });

        return (
            <Modal visible={shown} transparent={true} animationType={"none"} onRequestClose={this.modalDismissed.bind(this)} >
                <Animated.View style={[viewer.titleBar,{
                    opacity:this.state.fadeAnim
                }]}>
                    <Text style={viewer.title}>
                        {(this.state.curIndex + 1)} / {this.props.imageUrls.length}
                    </Text>
                </Animated.View>
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
                        width:imageUrls.length * screenWidth,
                        transform: [{ translateX: this.animatedPositionX}]
                    }]}>
                        { this.state.imagesInfo.length > 0 ? this.getImageList() : null}
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

        this.imgScale = undefined;
        this.horizontalWholeCounter = undefined;
        this.maxOffsetX = undefined;
        this.layoutImage = null;
        this.isReachedBorder = undefined;

        this.zoomCurrentDistance = undefined;
        this.zoomLastDistance = undefined;
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
                url: url,
                scalable: new Animated.Value(1),
                animatedX: new Animated.Value(0),
            })
        });

        //reset
        this.layoutImage = {};

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
            this.positionX = offset*screenWidth;
            this.standardPositionX = len%2 === 0 ? this.positionX + screenWidth / 2 : this.positionX;
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
            ]).start(() => {
                this.imgScale = 1;
            });
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
            this.standardPositionX -= screenWidth;
            this.state.imagesInfo[curIndex].scalable.setValue(1);
            this.state.imagesInfo[curIndex].animatedX.setValue(0);
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
            this.standardPositionX += screenWidth;
            this.state.imagesInfo[curIndex].scalable.setValue(1);
            this.state.imagesInfo[curIndex].animatedX.setValue(0);
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
        this.imgScale = 1;
        this.horizontalWholeCounter = 0;
        this.maxOffsetX = 0;
        this.isReachedBorder = false;
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
        width: screenWidth,
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
        //borderWidth:1,
        //borderColor:'red'
    },

    moveBox:{
        flexDirection: 'row',
        alignItems: 'center',
    },

    loadingImgView:{
        width: screenWidth,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center'
    },

    loadingImg:{
        width: screenWidth - 50,
        height: 150,
    },

    loadedImg:{
        width: screenWidth,
        height: screenHeight,
        overflow:"hidden",
        justifyContent: 'center',
        alignItems: 'center'
    },

    failedImg:{
        width: screenWidth,
        height: 300,
    },

    loading:{
        position:'absolute',
        top: screenHeight/2 - 30,
        left: screenWidth/2 - 15
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