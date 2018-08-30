/**
 * @file    Ycc.Loader.class.js
 * @author  xiaohei
 * @date    2017/10/9
 * @description  Ycc.Loader.class文件
 */



(function (Ycc) {
	
	/**
	 * ycc实例的资源加载类
	 * @constructor
	 */
	Ycc.Loader = function () {
		this.yccClass = Ycc.Loader;
		
		/**
		 * 保存加载之后的所有图片资源。键为资源名称；值为Image元素
		 * @type {{}}
		 */
		this.imageRes = {};
		
		/**
		 * 是否缓存图片。
		 * imageRes中key相同时，不会重复加载。
		 * @type {boolean}
		 */
		this.cache = true;
	};
	
	
	/**
	 * 加载单个图片资源
	 * @param imageSrc	{String}	图片的路径
	 * @param endCb		{Function}	加载成功的回调
	 * @private
	 */
	Ycc.Loader.prototype._loadImage = function (imageSrc,endCb) {
		var img = new Image();
		img.src = imageSrc;
		img.onload = function () {
			Ycc.utils.isFn(endCb) && endCb(img);
		}
	};
	
	/**
	 * 加载图片资源列表
	 * @param imagesSrc		{Object}	资源列表。键为资源名称；值为资源路径
	 * @param progressCb	{function}	加载进度的回调，每加载成功一个资源都会调用一次
	 * @param endCb			{function}	全部加载完成的回调
	 */
	Ycc.Loader.prototype.loadImageList = function (imagesSrc,endCb,progressCb) {
		var self = this;
		// 已加载图片的个数
		var loadedNum = 0;
		// 资源的名称
		var keys = Object.keys(imagesSrc);
		for(var i =0;i<keys.length;i++){
			var src = imagesSrc[keys[i]];
			if(self.cache){
				var img = self.imageRes[keys[i]];
				if(img){
					imageOnload(img);
					continue;
				}
			}
			
			
			this._loadImage(src,(function (key) {
				return function (img) {
					self.imageRes[key] = img;
					imageOnload(img);
				}
				
			})(keys[i]));
		}
		
		function imageOnload(img) {
			loadedNum++;
			Ycc.utils.isFn(progressCb)&&progressCb(img);
			if(loadedNum===keys.length){
				Ycc.utils.isFn(endCb)&&endCb(self.imageRes);
			}
		}
	};
	
	/**
	 * 并发加载资源
	 * @param resArr
	 * @param [resArr.name] 	资源名称，方便查找
	 * @param resArr.url  		资源的url
	 * @param [resArr.type]  	资源类型 image,audio，默认为image
	 * @param [resArr.res]  	资源加载完成后，附加给该字段
	 * @param endCb				资源加载结束的回调
	 * @param [progressCb]		资源加载进度的回调
	 * @param [endResArr] 		用于存储加载已结束的音频，一般不用传值
	 * @param [endResMap] 		用于存储加载已结束的音频map，一般不用传值。注：map的key是根据name字段生成的
	 */
	Ycc.Loader.prototype.loadResParallel = function (resArr, endCb, progressCb,endResArr,endResMap) {
		endResArr = endResArr || [];
		endResMap = endResMap || {};
		if(resArr.length===endResArr.length){
			endCb(endResArr,endResMap);
			return;
		}
		for(var i=0;i<resArr.length;i++){
			var curRes = resArr[i];
			var successEvent = "load";
			var errorEvent = "error";
			curRes.type = curRes.type || 'image';
			
			if(curRes.type==='image'){
				curRes.res = new Image();
				curRes.res.src = curRes.url;
			}
			if(curRes.type==='audio'){
				successEvent = 'loadedmetadata';
				curRes.res = new Audio();
				curRes.res.src = curRes.url;
				curRes.res.preload = "load";
			}
			curRes.res.addEventListener(successEvent,(function (curRes,index) {
				return function () {
					endResArr.push(curRes);
					if(typeof curRes.name!=='undefined') endResMap[curRes.name] = curRes.res;
					Ycc.utils.isFn(progressCb) && progressCb(curRes,true,index);
				};
			})(curRes,i));
			curRes.res.addEventListener(errorEvent,(function (curRes,index) {
				return function () {
					endResArr.push(curRes);
					if(typeof curRes.name!=='undefined') endResMap[curRes.name] = curRes.res;
					Ycc.utils.isFn(progressCb) && progressCb(curRes,false,index);
				};
			})(curRes,i));
			
		}
	};
	

	/**
	 * 依次加载资源
	 * @param resArr
	 * @param [resArr.name] 	资源名称，方便查找
	 * @param resArr.url  		资源的url
	 * @param [resArr.type]  	资源类型 image,audio
	 * @param [resArr.res]  	资源加载完成后，附加给该字段
	 * @param endCb				资源加载结束的回调
	 * @param [progressCb]		资源加载进度的回调
	 * @param [endResArr] 		用于存储加载已结束的音频，一般不用传值
	 * @param [endResMap] 		用于存储加载已结束的音频map，一般不用传值。注：map的key是根据name字段生成的
	 */
	Ycc.Loader.prototype.loadResOneByOne = function (resArr, endCb, progressCb,endResArr,endResMap) {
		endResArr = endResArr || [];
		endResMap = endResMap || {};
		if(resArr.length===endResArr.length){
			endCb(endResArr,endResMap);
			return;
		}
		var self = this;
		// 当前加载的下标
		var index = endResArr.length;
		var curRes = resArr[index];
		var successEvent = "load";
		var errorEvent = "error";
		curRes.type = curRes.type || 'image';
		
		if(curRes.type==='image'){
			curRes.res = new Image();
			curRes.res.src = curRes.url;
		}
		if(curRes.type==='audio'){
			successEvent = 'loadedmetadata';
			curRes.res = new Audio();
			curRes.res.src = curRes.url;
			curRes.res.preload = "load";
		}
		
		
		curRes.res.addEventListener(successEvent,function () {
			endResArr.push(curRes);
			if(typeof curRes.name!=='undefined') endResMap[curRes.name] = curRes.res;

			Ycc.utils.isFn(progressCb) && progressCb(curRes,true,index);
			self.loadResOneByOne(resArr,endCb,progressCb,endResArr,endResMap);
		});
		curRes.res.addEventListener(errorEvent,function () {
			endResArr.push(curRes);
			if(typeof curRes.name!=='undefined') endResMap[curRes.name] = curRes.res;
			Ycc.utils.isFn(progressCb) && progressCb(curRes,true,index);
			self.loadResOneByOne(resArr,endCb,progressCb,endResArr,endResMap);
		});

		
	};
	
	
	
	
	
	/**
	 * 是否使用缓存
	 * @param b {boolean}
	 */
	Ycc.Loader.prototype.useCache = function (b) {
		this.cache = b;
	};
	
	/**
	 * 获取资源
	 * @param resArr
	 * @param name
	 */
	Ycc.Loader.prototype.getResByName = function (name,resArr) {
		for(var i=0;i<resArr.length;i++){
			if(resArr[i].name===name)
				return resArr[i];
		}
		return null;
	};
	
	
})(window.Ycc);