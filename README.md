## Overview
A pure JavaScript image viewer component for react-native apps with pan, supporting both iOS and Android.

## Show Cases

#### On IOS:
![viewer-ios](http://i1.piimg.com/567571/76e6e8b18482df7f.gif)

#### On android:
![viewer-android](http://i1.piimg.com/567571/34d3e506089bf002.gif)

## Installation
First, install `react-native-image-viewer` from npm:

```
npm install ImageViewer --save-dev
```

Or in **package.json**:

```
"dependencies": {
  "ImageViewer": "version"
}
```

Then use it:

```
// ES6 mudule
import ImageViewer from 'ImageViewer';

//CommonJS
var ImageViewer = require('ImageViewer');
```

## Usage
There are some code from `example/src/index.js`:

```
let imgsArr = [
    'http://scimg.jb51.net/allimg/160815/103-160Q509544OC.jpg',
    'http://img.sc115.com/uploads1/sc/jpgs/1508/apic22412_sc115.com.jpg',
    'http://h.hiphotos.baidu.com/zhidao/pic/item/0df431adcbef7609bca7d58a2adda3cc7cd99e73.jpg',
    'http://facebook.github.io/react/img/logo_og.png',
    'http://scimg.jb51.net/allimg/160815/103-160Q509544OC.jpg'
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

## TODO

* zoom image
* loading animation when load image
* title bar

## License
MIT
