/**
 * @file    Ycc.UI.ScrollerRect.class.js
 * @author  xiaohei
 * @date    2019/11/19
 * @description  Ycc.UI.ScrollerRect.class文件
 * 滚动区域UI
 */



(function (Ycc) {

    /**
     * 滚动区域UI
	 * 此UI只能为顶级UI
     * @param option	            {object}		所有可配置的配置项
	 * @param option.rect	        {Ycc.Math.Rect}	容纳区。
	 * @param option.selfRender	    {Boolean}	    是否自身实时渲染
	 * @param option.contentW	    {number}	    滚动内容的宽
	 * @param option.contentH	    {number}	    滚动内容的高
     * @constructor
     * @extends Ycc.UI.Polygon
     */
    Ycc.UI.ScrollerRect = function ScrollerRect(option) {
        Ycc.UI.Polygon.call(this,option);
        this.yccClass = Ycc.UI.ScrollerRect;
	
		/**
         * 是否自身实时渲染，启用后，会实时重绘整个画布
		 * @type {boolean}
		 */
		this.selfRender = false;
	
		/**
		 * 滚动内容的宽
		 * @type {number}
		 */
		this.contentW = 0;
		
		/**
		 * 滚动内容的高
		 * @type {number}
		 */
		this.contentH = 0;
        
        this.extend(option);

		/**
		 * 此区域默认为幽灵
		 * @type {boolean}
		 */
		this.ghost = true;
	
		/**
		 * 滚动区的UI容纳区，此区域用于容纳区域内的UI，不可编辑修改属性
		 * @type {Ycc.UI.Rect}
		 * @private
		 */
		this._wrapper = null;
	
		/**
		 * 滚动区的事件容纳区，此区域用于接收舞台的事件
		 * @type {Ycc.UI.Rect}
		 * @private
		 */
		this._eventWrapper = null;
	
		/**
		 * 不阻止事件传递
		 * @type {boolean}
		 */
		this.stopEventBubbleUp = false;
	
		/**
		 * 加入舞台后的回调
		 * @override
		 * @private
		 */
		this._onAdded = function () {
			this._initWrapperRect();
			this._initEvent();
		};

		/**
		 * 所有子UI渲染完毕后，需要恢复裁剪区
		 * @private
		 */
		this._onChildrenRendered = function () {
			this.ctx.restore();
		};
		
    };
    // 继承prototype
    Ycc.utils.mergeObject(Ycc.UI.ScrollerRect.prototype,Ycc.UI.Polygon.prototype);


    /**
     * 计算UI的各种属性。此操作必须在绘制之前调用。
     * <br> 计算与绘制分离的好处是，在绘制UI之前就可以提前确定元素的各种信息，从而判断是否需要绘制。
     * @override
     */
    Ycc.UI.ScrollerRect.prototype.computeUIProps = function () {
        // 计算多边形坐标
        this.coordinates = this.rect.getVertices();
        // 赋值位置信息
        this.x = this.rect.x,this.y=this.rect.y;

        // this._setCtxProps(this);
    };


    /**
     * 绘制
     */
    Ycc.UI.ScrollerRect.prototype.render = function (ctx) {
        var self = this;
        ctx = ctx || self.ctxCache;

        ctx.save();
        this.renderPath(ctx);
		ctx.clip();
    };
	
	
	/**
	 * 重载基类方法
	 * @param ui
	 */
	Ycc.UI.ScrollerRect.prototype.addChild = function (ui) {
		if(this.belongTo) ui.init(this.belongTo);

		// 将子UI加到容器中
		if(ui===this._wrapper||ui===this._eventWrapper)
			this.addChildTree(ui);
		else
			this._wrapper.addChildTree(ui);

		return this;
	};
	
	
	
	/**
     * 初始化
	 * @private
	 */
	Ycc.UI.ScrollerRect.prototype._initEvent = function () {
		var self = this;
		
		
		// 监听tap事件，向wrapper内部UI传递
		this._eventWrapper.addListener('tap',function (e) {
			var list = self.belongTo.getUIListFromPointer(e,{uiIsShow:true,uiIsGhost:false});
			list = list.filter(function(item){return item.show&&!item.ghost;})
			// console.log('点击的列表',list);
			if(list.length<=1) return;
			// console.log('倒数第二个',list[list.length-2]);
			// 最后一个UI为_eventWrapper自身，这里取倒数第二个触发事件，因为其层级深
			list[list.length-2].triggerUIEventBubbleUp('tap',e.x,e.y);
		});
		
		
		// 监听swipe
		var timerid = 0;
		this._eventWrapper.addListener('swipe',function (e) {
			// console.log('swipe',e);
			var dir = e.originEvent.swipeDirection;
			var dirMap = {left:-1,right:1,up:-1,down:1};
			var s = 100;
			var v0 = 30;
			var t = 10;
			
			var delta = 100;
			var t0 = 0;
			timerid = setInterval(function () {
				t0++;
				delta = v0*t0-t0*t0;
				
				if(t0 === t){
					clearInterval(timerid);
				}
				
				if(dir==='left'||dir==='right') self._wrapper.rect.x = endStatus.rect.x+(dirMap[dir])*delta;
				if(dir==='up'||dir==='down') self._wrapper.rect.y = endStatus.rect.y+(dirMap[dir])*delta;
				self._checkRangeLimit();
				if(self.selfRender) self.belongTo.yccInstance.layerManager.reRenderAllLayerToStage();
			},20);
		});
		
		
		
	    //拖动开始时UI容纳区的状态
	    var startStatus = {
	        rect:null,
            startEvent:null
        };
	    // 拖拽结束时UI容纳区的状态
		var endStatus = {
			rect:null,
			endEvent:null
		};
		this._eventWrapper.addListener('dragstart',function (e) {
			clearInterval(timerid);
			startStatus.startEvent = e;
			startStatus.rect = new Ycc.Math.Rect(self._wrapper.rect);
		});
        
        this._eventWrapper.addListener('dragging',function (e) {
			var deltaX = e.x-startStatus.startEvent.x;
			var deltaY = e.y-startStatus.startEvent.y;
			
			self._wrapper.rect.x = startStatus.rect.x+deltaX;
			self._wrapper.rect.y = startStatus.rect.y+deltaY;
			self._checkRangeLimit();
			
			
            if(self.selfRender) self.belongTo.yccInstance.layerManager.reRenderAllLayerToStage();
		});
  
		this._eventWrapper.addListener('dragend',function (e) {
			endStatus.endEvent = e;
			endStatus.rect = new Ycc.Math.Rect(self._wrapper.rect);
		});
		      

        /*this._wrapper.onrenderstart = function () {
			self.belongTo.yccInstance.ctx.save();
			self.belongTo.yccInstance.ctx.clip();
		};
        this._eventWrapper.onrenderend = function () {
			self.belongTo.yccInstance.ctx.restore();
		}*/
	};
	
	/**
	 * 创建一个容器方块
	 * @private
	 */
	Ycc.UI.ScrollerRect.prototype._initWrapperRect = function () {
		this._wrapper = new Ycc.UI.Rect({name:'滚动区UI容器',opacity:0,rect:new Ycc.Math.Rect(0,0,this.rect.width,this.rect.height),ghost:true});
		this._eventWrapper = new Ycc.UI.Rect({name:'滚动区事件容器',opacity:0,rect:new Ycc.Math.Rect(this.rect.x,this.rect.y,this.rect.width,this.rect.height),ghost:false});
		// this._wrapper.ontap = console.log;
		// this._eventWrapper.ontap = console.log;
		this.addChild(this._wrapper);
		this.belongTo.addUI(this._eventWrapper);
	};
	
	/**
	 * 容纳区极限值校正
	 * @private
	 */
	Ycc.UI.ScrollerRect.prototype._checkRangeLimit = function(){
		var self = this;
		// x、y坐标的极限值
		var maxX = self.contentW-self.rect.width;
		var maxY = self.contentH-self.rect.height;
		
		// x、y坐标不能大于0
		self._wrapper.rect.x = self._wrapper.rect.x>=0?0:self._wrapper.rect.x;
		self._wrapper.rect.y = self._wrapper.rect.y>=0?0:self._wrapper.rect.y;
		
		// x、y坐标不能小于极限值
		self._wrapper.rect.x = self._wrapper.rect.x<-maxX?-maxX:self._wrapper.rect.x;
		self._wrapper.rect.y = self._wrapper.rect.y<-maxY?-maxY:self._wrapper.rect.y;

		if(self.contentW<=self.rect.width) self._wrapper.rect.x = 0;
		if(self.contentH<=self.rect.height) self._wrapper.rect.y = 0;
	}
	
})(Ycc);