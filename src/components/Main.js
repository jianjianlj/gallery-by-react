require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';
//获取图片相关的数据
let imageDatas = require("../data/imageDatas.json");
//利用自执行函数，将图片名信息转成图片URL路径信息
imageDatas = (function getImageURL(imageDatasArr) {
  for(var i = 0,j = imageDatasArr.length;i<j;i++) {
    var singleImageData = imageDatasArr[i];
    singleImageData.imageURL = require('../images/' + singleImageData.fileName);

    imageDatasArr[i] = singleImageData;
  }
  return imageDatasArr;
})(imageDatas);

//获取区间内的一个随机值
function getRangeRandom(low,high) {
  return Math.ceil(Math.random() * (high - low) + low);
}
//旋转函数，获取随机生成的一个30度角度
function get30DegRandom(){
  return (Math.random() > 0.5 ? '': '-' + Math.ceil((Math.random() * 30)));
}

var ImgFigure = React.createClass({

  /**
   * imgFigure的点击处理函数
   */
  handleClick(e) {
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }
    e.stopPropagation();
    e.preventDefault();

  },

  render: function() {
    let styleObj = {};

    //如果props属性中制定了这张图的位置，则使用
    if(this.props.arrange.pos) {
      styleObj = this.props.arrange.pos;
    }
    //如果props属性制定了这张图的旋转家督，则使用
    if(this.props.arrange.rotate) {
      (['-ms-transform','-moz-transform','-webkit-transform','-o-transform','transform']).forEach(function(value){
        styleObj[value] = 'rotate(' + this.props.arrange.rotate + 'deg)';
      }.bind(this));
    }

    let imgFigureClassName = "img-figure";
    imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';


    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
        <img src={this.props.data.imageURL}
             alt={this.props.data.title}
        />
        <figcaption>
          <h2 className="img-title">
            {this.props.data.title}
          </h2>
          <div className="img-back" onClick={this.handleClick}>
            adadadad
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    );
  }
});

class AppComponent extends React.Component {
  constructor() {
    super();
    this.Constant = {
      centerPos: {
        left: 0,
          right: 0
      },
      hPosRange: { //水平方向的取值范围
        leftSecX: [0,0],
        rightSecX: [0,0],
        y: [0,0]
      },
      vPosRange: { //垂直方向的取值范围
        x: [0,0],
        topY: [0,0]
      }
    };
    this.state = {
      imgsArrangeArr: [
        // {
        //   pos: {
        //     left: 0,
        //     top: 0
        //   },
        //   rotate: 0, //旋转角度
        //   isInverse: false, //正反面，false表示正面
        //   isCenter: false //图片是否居中
        // }
      ]
    }
  };

  /**
   * 利用rearrange函数，居中对应index的图片
   * @param index 需要被居中图片的index
   * @returns {function}
   */

  center(index){
    return function(){
      this.rearrange(index);
    }.bind(this);
  }

  /*
   * 反转图片
   * @param 输入要反转的图片index
   * @return 返回一个真正待被执行的函数
   */
  inverse(index) {
    return function() {
      let imgsArrangeArr = this.state.imgsArrangeArr;
      imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
      this.setState({
        imgsArrangeArr: imgsArrangeArr
      });
    }.bind(this);
  }

  //组件加载以后，为每张图片计算位置范围
  componentDidMount () {

    //首先拿到舞台的大小
    var stageDOM = ReactDOM.findDOMNode(this.refs.stage),
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW / 2),
        halfStageH = Math.ceil(stageH / 2);

    //拿到一个imgFigure的大小
    var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = imgW / 2,
        halfImgH = imgH / 2;

    //计算中心图片位置点
    this.Constant.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    }

    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[1] = stageH - halfImgH;

    this.Constant.vPosRange.topY[0] = -halfImgH;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH *3;
    this.Constant.vPosRange.x[0] = halfStageW - halfImgW;
    this.Constant.vPosRange.x[1] = halfStageW;

    this.rearrange(0);

  };

  /*
   * 重新布局所有图片
   * @param centerIndex 指定居中排布那个图片
   */
  rearrange (centerIndex) {
    let imgsArrangeArr = this.state.imgsArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = Constant.hPosRange,
        vPosRange = Constant.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeTop = vPosRange.topY,
        vPosRangeX = vPosRange.x,

      imgsArrangeTopArr = [],
      //上侧区域图片数量
      topImgNum = Math.floor(Math.random() * 2),
      topImgSpliceIndex = 0,
      imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

    //首先居中centerIndex的图片，剧中图片给不需要旋转
    imgsArrangeCenterArr[0] = {
      pos: centerPos,
      //旋转的标志位
      rotate: 0,
      isCenter: true
    }

    //取出要布局上侧的图片的状态信息
    topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
    imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

    //布局位于上侧的图片
    imgsArrangeTopArr.forEach(function(value,index){
      imgsArrangeTopArr[index] = {
        pos: {
          top: getRangeRandom(vPosRangeTop[0],vPosRangeTop[1]),
          left: getRangeRandom(vPosRangeX[0],vPosRangeX[1])
        },
        rotate: get30DegRandom(),
        isCenter: false
      }
    });

    //布局两侧的照片
    for(let i = 0,j = imgsArrangeArr.length,k = j / 2;i<j;i++) {
      let hPosRangeLORX = null;

      //前半部分布局左边，右半部分布局右边
      if(i < k) {
        hPosRangeLORX = hPosRangeLeftSecX;
      }else {
        hPosRangeLORX = hPosRangeRightSecX;
      }

      imgsArrangeArr[i] = {
        pos: {
          top: getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
          left: getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
        },
        rotate: get30DegRandom(),
        isCenter: false
      }
    }

    if(imgsArrangeTopArr && imgsArrangeTopArr[0]) {
      imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
    }
    imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);

    this.setState({
      imgsArrangeArr: imgsArrangeArr
    })
  };

  render() {

    var controllerUnits = [],
        imgFigures = [];
    imageDatas.forEach(function(value,index) {

      //初始化
      if(!this.state.imgsArrangeArr[index]) {
        this.state.imgsArrangeArr[index] = {
          pos: {
            left: 0,
            top: 0
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        }
      }

      imgFigures.push(<ImgFigure data={value} ref={'imgFigure' + index} arrange={this.state.imgsArrangeArr[index]}
                                 inverse={this.inverse(index)} center={this.center(index)}/>);
    }.bind(this));

    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav"></nav>
      </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
