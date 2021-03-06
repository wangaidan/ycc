/**
 * @file    Ycc.UI.Polygon.class.js
 * @author  xiaohei
 * @date    2019/4/26
 * @description  Ycc.UI.Polygon.class文件
 */

(function (Ycc) {
	
	/**
	 * 多边形UI
	 * 位置坐标x、y为只读属性，且为相对坐标，默认取多边形的第一个顶点坐标
	 * @constructor
	 * @extends Ycc.UI.Base
	 * @param option    			{object}        	所有可配置的配置项
	 * @param option.fill 			{boolean}			是否填充绘制，false表示描边绘制
	 * @param option.coordinates  	{Ycc.Math.Dot[]}    多边形点坐标的数组，为保证图形能够闭合，起点和终点必须相等。注意：点列表的坐标为相对坐标
	 */
	Ycc.UI.Polygon = function Polygon(option) {
		option = option || {};
		Ycc.UI.Base.call(this, option);
		this.yccClass = Ycc.UI.Polygon;
		
		/**
		 * 位置x
		 * @type {number}
		 * @readonly
		 */
		this.x=0;
		/**
		 * 位置y
		 * @type {number}
		 * @readonly
		 */
		this.y=0;
		/**
		 * 是否填充
		 * @type {boolean}
		 */
		this.fill = true;
		
		/**
		 * 颜色
		 * @type {string}
		 */
		this.fillStyle = "blue";
		
		/**
		 * 光线投射模式 1-升级模式 2-普通模式
		 * @type {number}
		 */
		this.noneZeroMode = 1;
		
		/**
		 * 是否绘制点的下标
		 * @type {boolean}
		 */
		this.isDrawIndex = false;
		
		/**
		 * 多边形点坐标的数组，为保证图形能够闭合，起点和终点必须相等
		 * @type {null}
		 */
		this.coordinates=option.coordinates||[];
		
		// 合并属性
		this.extend(option);
	};
	
	// 继承prototype
	Ycc.utils.mergeObject(Ycc.UI.Polygon.prototype, Ycc.UI.Base.prototype);
	Ycc.UI.Polygon.prototype.constructor = Ycc.UI.Polygon;
	
	/**
	 * 计算UI的各种属性。此操作必须在绘制之前调用。
	 * <br> 计算与绘制分离的好处是，在绘制UI之前就可以提前确定元素的各种信息，从而判断是否需要绘制。
	 * @override
	 */
	Ycc.UI.Polygon.prototype.computeUIProps = function () {

		// 计算相对位置
		if(this.coordinates[0])
			this.x=this.coordinates[0].x,this.y=this.coordinates[0].y;
	};
	
	/**
	 * 渲染至ctx
	 * @param ctx
	 */
	Ycc.UI.Polygon.prototype.render = function (ctx) {
		var self = this;
		ctx = ctx || self.ctxCache;
		if(!self.ctx){
			console.error("[Ycc error]:","ctx is null !");
			return;
		}
		
		// console.log('render');
		
		// 绘制旋转缩放之前的UI

		ctx.save();
		ctx.fillStyle = this.fillStyle;
		ctx.strokeStyle = this.strokeStyle;
		this.renderPath(ctx);
		this.fill?ctx.fill():ctx.stroke();
		ctx.restore();
	};
	
	/**
	 * 根据coordinates绘制路径
	 * 只绘制路径，不填充、不描边
	 * 继承的子类若不是多边形，需要重载此方法
	 * <br> 开启离屏canvas后，此过程只会发生在离屏canvas中
	 * @param ctx 离屏canvas的绘图环境
	 */
	Ycc.UI.Polygon.prototype.renderPath = function () {
		if(this.coordinates.length===0) return;
		
		var self = this;
		var ctx = this.ctxCache;
		
		var start = this.transformByRotate(this.coordinates[0]);
		ctx.beginPath();
		ctx.moveTo(start.x*this.dpi,start.y*this.dpi);
		for(var i=0;i<this.coordinates.length-1;i++){
			var dot = this.transformByRotate(this.coordinates[i]);
			if(this.isDrawIndex) ctx.fillText(i+'',dot.x-10,dot.y+10);
			ctx.lineTo(dot.x*this.dpi,dot.y*this.dpi);
		}
		ctx.closePath();
	
	};
	
	/**
	 * 获取当前UI平移、旋转之后位置的多边形区域
	 * @return {Ycc.Math.Dot[]} 返回多边形点的坐标数组
	 * @override
	 */
	Ycc.UI.Polygon.prototype.getAbsolutePositionPolygon = function () {
		var self = this;
		return this.coordinates.map(function (point) {
			return self.transformByRotate(point);
		});
	};
	
	/**
	 * 获取UI的绝对坐标，只计算图层坐标和UI的位置坐标x、y
	 * 不考虑UI的缩放和旋转，缩放旋转可通过其他方法转换
	 * @param [pos] {Ycc.Math.Dot}	获取到的位置对象，非必传
	 * @return {Ycc.Math.Dot}
	 * @override
	 */
	Ycc.UI.Polygon.prototype.getAbsolutePosition = function(pos){
		pos = pos || new Ycc.Math.Dot(this.x,this.y);
		var pa = this.getParent();
		
		if(!pa){
			// 最顶层的UI需要加上图层的坐标
			pos.x = this.x+this.belongTo.x;
			pos.y = this.y+this.belongTo.y;
		}else{
			var paPos = pa.getAbsolutePosition();
			pos.x += paPos.x;
			pos.y += paPos.y;
		}
		return pos;
	};
	
	/**
	 * 获取能容纳当前UI的最小方形区域
	 * @return {Ycc.Math.Rect}
	 */
	Ycc.UI.Polygon.prototype.getAbsolutePositionRect = function () {
		if(!this.coordinates[0]) return console.log(new Ycc.Debugger.Error('need compute prop coordinates').message);
		
		var start = this.coordinates[0];
		var minx=start.x,miny=start.y,maxx=start.x,maxy=start.y;
		
		for(var i=0;i<this.coordinates.length-1;i++){
			var dot = this.coordinates[i];
			if(dot.x<minx) minx=dot.x;
			if(dot.x>=maxx) maxx=dot.x;
			if(dot.y<miny) miny=dot.y;
			if(dot.y>=maxy) maxy=dot.y;
		}
		
		var posAbsolute = this.transformToAbsolute({x:minx,y:miny});
		return new Ycc.Math.Rect(posAbsolute.x,posAbsolute.y,maxx-minx,maxy-miny);
	};
	
	
	/**
	 * 绘制旋转缩放之前的UI
	 * @override
	 */
	Ycc.UI.Polygon.prototype.renderDashBeforeUI = function (ctx) {
		if(!this.isShowRotateBeforeUI || this.coordinates.length===0) return;
		
		var self = this;
		ctx = ctx || self.ctx;
		var pa = this.getParent();
		var paPos =pa? pa.getAbsolutePosition():new Ycc.Math.Dot();
		var start = new Ycc.Math.Dot(this.coordinates[0].x+paPos.x,this.coordinates[0].y+paPos.y);
		
		ctx.save();
		// 虚线
		ctx.setLineDash([10]);
		ctx.beginPath();
		ctx.moveTo(start.x*this.dpi,start.y*this.dpi);
		for(var i=0;i<self.coordinates.length-1;i++){
			var dot = self.coordinates[i];
			ctx.lineTo(dot.x*this.dpi+paPos.x*this.dpi,dot.y*this.dpi+paPos.y*this.dpi);
		}
		ctx.closePath();
		ctx.strokeStyle = this.strokeStyle;
		ctx.stroke();
		ctx.restore();
	};

	
	/**
	 * 重载基类的包含某个点的函数，用于点击事件等的响应
	 * 两种方法：
	 * 方法一：经过该点的水平射线与多边形的焦点数，即Ray-casting Algorithm
	 * 方法二：某个点始终位于多边形逆时针向量的左侧、或者顺时针方向的右侧即可判断，算法名忘记了
	 * 此方法采用方法一，并假设该射线平行于x轴，方向为x轴正方向
	 * @param dot {Ycc.Math.Dot} 需要判断的点，绝对坐标
	 * @param noneZeroMode {Number} 是否noneZeroMode 1--启用 2--关闭 默认启用
	 * 		从这个点引出一根“射线”，与多边形的任意若干条边相交，计数初始化为0，若相交处被多边形的边从左到右切过，计数+1，若相交处被多边形的边从右到左切过，计数-1，最后检查计数，如果是0，点在多边形外，如果非0，点在多边形内
	 * @return {boolean}
	 */
	Ycc.UI.Polygon.prototype.containDot = function (dot,noneZeroMode) {
		// 默认启动none zero mode
		noneZeroMode=noneZeroMode||this.noneZeroMode;
		var _dot = dot;
		
		var x = _dot.x,y=_dot.y;
		var crossNum = 0;
		// 点在线段的左侧数目
		var leftCount = 0;
		// 点在线段的右侧数目
		var rightCount = 0;
		for(var i=0;i<this.coordinates.length-1;i++){
			var start = this.transformByRotate(this.coordinates[i]);
			var end = this.transformByRotate(this.coordinates[i+1]);
			
			// 起点、终点斜率不存在的情况
			if(start.x===end.x) {
				// 因为射线向右水平，此处说明不相交
				if(x>start.x) continue;
				
				// 从左侧贯穿
				if((end.y>start.y&&y>=start.y && y<=end.y)){
					leftCount++;
					// console.log('++1');
					crossNum++;
				}
				// 从右侧贯穿
				if((end.y<start.y&&y>=end.y && y<=start.y)) {
					rightCount++;
					// console.log('++1');
					crossNum++;
				}
				continue;
			}
			// 斜率存在的情况，计算斜率
			var k=(end.y-start.y)/(end.x-start.x);
			// 交点的x坐标
			var x0 = (y-start.y)/k+start.x;
			// 因为射线向右水平，此处说明不相交
			if(x>x0) continue;
			
			if((end.x>start.x&&x0>=start.x && x0<=end.x)){
				// console.log('++2');
				crossNum++;
				if(k>=0) leftCount++;
				else rightCount++;
			}
			if((end.x<start.x&&x0>=end.x && x0<=start.x)) {
				// console.log('++2');
				crossNum++;
				if(k>=0) rightCount++;
				else leftCount++;
			}
		}
		
		// console.log('polygon',dot,noneZeroMode,crossNum,crossNum%2,leftCount,rightCount);
		return noneZeroMode===1?leftCount-rightCount!==0:crossNum%2===1;
	};
	
	
	
	
})(Ycc);