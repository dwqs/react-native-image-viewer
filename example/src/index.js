/**
 * Created by pomy on 11/20/16.
 */

'use strict';

import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Image,
    TouchableOpacity
} from 'react-native';

import ImageViewer from '../../library/ImageViewer.js';

let imgsArr = [
    'http://scimg.jb51.net/allimg/160815/103-160Q509544OC.jpg',
    'http://img.sc115.com/uploads1/sc/jpgs/1508/apic22412_sc115.com.jpg',
    'http://h.hiphotos.baidu.com/zhidao/pic/item/0df431adcbef7609bca7d58a2adda3cc7cd99e73.jpg',
    'http://facebook.github.io/react/img/logo_og.png',
    'http://i1.piimg.com/567571/687cf1626c10e320.png'
];

export default class ImageViewerExample extends Component{

    constructor(props){
        super(props);

        this.state = {
            shown: false,
            curIndex: 0
        }
    }

    openViewer(index){
        this.setState({
            shown:true,
            curIndex:index
        })
    }

    closeViewer(){
        this.setState({
            shown:false,
            curIndex:0
        })
    }

    render(){

        return (
            <View style={styles.container}>
                {
                    imgsArr.map((url,index)=>{
                        return <TouchableOpacity key={index}
                                                 activeOpacity={1}
                                                 onPress={this.openViewer.bind(this,index)}>
                                <Image
                                    source={{uri: url}}
                                    style={styles.img}/>
                            </TouchableOpacity>
                    })
                }
                <ImageViewer shown={this.state.shown}
                             imageUrls={imgsArr}
                             onClose={this.closeViewer.bind(this)}
                             index={this.state.curIndex}>
                </ImageViewer>
            </View>
        )
    }
}

let styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems:'center',
        flexWrap: 'wrap',
        marginTop: 20
    },

    img:{
        height:60,
        width: 60,
        marginLeft:10
    }
});
