![download](https://img.shields.io/npm/dt/@dwqs/react-native-image-viewer.svg) ![npm-version](https://img.shields.io/npm/v/@dwqs/react-native-image-viewer.svg) ![license](https://img.shields.io/npm/l/@dwqs/react-native-image-viewer.svg)

## Overview
A pure JavaScript image viewer component for react-native apps with pan, pinch.etc, supporting both iOS and Android.

>React Native required 0.33+

## Show Cases

#### On IOS:
![viewer-ios](http://onasvjoyz.bkt.clouddn.com/viewer-ios.gif)

gif: http://onasvjoyz.bkt.clouddn.com/viewer-ios.gif

#### On Android:
![viewer-android](http://onasvjoyz.bkt.clouddn.com/viewer-android.gif)

gif: http://onasvjoyz.bkt.clouddn.com/viewer-android.gif

## Installation
First, install `react-native-image-viewer` from npm:

```
npm i @dwqs/react-native-image-viewer --save
```

Or yarn:

```
yarn add @dwqs/react-native-image-viewer
```

Then use it:

```
// ES6 mudule
import ImageViewer from '@dwqs/react-native-image-viewer';
```

## Usage
There are some code from `example/App.js`:

```
let imgsArr = [
    'https://facebook.github.io/react/logo-og.png',
    'http://scimg.jb51.net/allimg/160815/103-160Q509544OC.jpg',
    'http://img.sc115.com/uploads1/sc/jpgs/1508/apic22412_sc115.com.jpg',
    'http://h.hiphotos.baidu.com/zhidao/pic/item/0df431adcbef7609bca7d58a2adda3cc7cd99e73.jpg'
];

closeViewer(){
    this.setState({
        shown:false,
        curIndex:0
    })
}

<ImageViewer shown={this.state.shown}
             imageUrls={imgsArr}
             onClose={this.closeViewer.bind(this)}
             index={this.state.curIndex}>
</ImageViewer>
```

## Configuration
|Opthion|Description|isRequired|
|:--:|:--:|:--:|
|shown|whether the ImageViewer is show|required|
|imageUrls|it's a array of images' url|required|
|onClose|hidden the ImageViewer when click on ImageViewer|required|
|index|the index of image url(in imageUrls) when open the ImageViewer|required|
|failedUrl|the url for image preview loaded failure|not required|

## Feature

* pan to image toggling 
* double click for image zooming
* pinch for zoom image
* animation for image showing

## License
MIT
