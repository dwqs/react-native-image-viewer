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
    }

    static propTypes = {
        shown:PropTypes.bool,
        onClose: PropTypes.func,
        imageUrls: PropTypes.array,
        index:PropTypes.number
    }

    render(){

        let {index,shown,imageUrls,onClose} = this.props;

        return (
            <Modal visible={shown} transparent={true} animationType={"none"}>
                <View style={viewer.container}>
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