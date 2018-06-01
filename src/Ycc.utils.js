/**
 * @file        Ycc.utils.js
 * @author      xiaohei
 * @desc
 *  整个程序公用的基础工具模块
 *
 * @requires    Ycc.init
 */

(function(Ycc){
    Ycc.utils = {};


	/**
     * 合并两个对象。只会保留targetObj中存在的字段。
	 * @param targetObj    目标对象
	 * @param obj2  待合入的对象
	 * @param isDeepClone   是否进行深拷贝
	 * @return {{}} 新的对象
	 */
    Ycc.utils.extend = function(targetObj, obj2,isDeepClone) {
        var newobj = {};
        if(isDeepClone)
            obj2 = Ycc.utils.deepClone(obj2);
        for (var i in targetObj) {
			if(!targetObj.hasOwnProperty(i)) continue;
            newobj[i] = targetObj[i];
            if (obj2 && obj2[i] != null) {
                newobj[i] = obj2[i];
            }
        }
        return newobj;
    };
	
	/**
	 * 合并对象：覆盖target对象的字段。浅拷贝。prototype内的属性也会被覆盖。
	 * @param target	{object}	待覆盖的目标对象
	 * @param src	{object}	源对象
	 */
	Ycc.utils.mergeObject = function(target,src){
		src = src || {};
		for(var key in target){
			if(typeof src[key]!=="undefined"){
				target[key] = src[key];
			}
		}
		return target;
	};
	
	/**
     * 判断字符串
	 * @param str
	 * @return {boolean}
	 */
	Ycc.utils.isString = function(str) {
        return typeof(str) === "string";
    };
	
	/**
     * 判断数字
	 * @param str
	 * @return {boolean}
	 */
    Ycc.utils.isNum = function(str) {
        return typeof(str) === "number";
    };
	
	/**
	 * 判断boolean
	 * @param str
	 * @return {boolean}
	 */
	Ycc.utils.isBoolean = function(str) {
		return typeof(str) === "boolean";
	};
	
	
	/**
     * 判断对象
	 * @param str
	 * @return {boolean}
	 */
	Ycc.utils.isObj = function(str) {
        return typeof(str) === "object";
    };
	/**
     * 判断函数
	 * @param str
	 * @return {boolean}
	 */
	Ycc.utils.isFn = function(str) {
        return typeof(str) === "function";
    };
	
	/**
     * 判断数组
	 * @param str
	 * @return {boolean}
	 */
    Ycc.utils.isArray = function(str) {
        return Object.prototype.toString.call(str) === '[object Array]';
    };
	
	
	/**
	 * 检测是否是移动端
	 * @return {boolean}
	 */
	Ycc.utils.isMobile = function () {
		var userAgentInfo = navigator.userAgent;
		var Agents = ["Android", "iPhone",
			"SymbianOS", "Windows Phone",
			"iPad", "iPod"];
		var flag = false;
		for (var v = 0; v < Agents.length; v++) {
			if (userAgentInfo.indexOf(Agents[v]) > 0) {
				flag = true;
				break;
			}
		}
		return flag;
	};
	
	
	/**
     * 深拷贝某个对象或者数组
	 * @param arrOrObj
	 * @return {*}
	 */
	Ycc.utils.deepClone = function(arrOrObj){
        
        return (Ycc.utils.isArray(arrOrObj))? deepCopy(arrOrObj):deepExtend(arrOrObj);
        function deepExtend(obj){
            var tempObj = {};
            for(var i in obj){
                if(!obj.hasOwnProperty(i)) continue;
                tempObj[i] = obj[i];
                if(Ycc.utils.isArray(obj[i])){
                    tempObj[i] = deepCopy(obj[i]);
                }else if(Ycc.utils.isObj(obj[i])){
                    tempObj[i] = deepExtend(obj[i]);
                }else{
                    tempObj[i] = obj[i];
                }
            }
            return tempObj;
        }
        function deepCopy(arr){
            var newArr = [];
            var v = null;
            for(var i=0;i<arr.length;i++){
                v = arr[i];
                if(Ycc.utils.isArray(v))
                    newArr.push(deepCopy(v));
                else if(Ycc.utils.isObj(v))
                    newArr.push(deepExtend(v));
                else{
                    newArr.push(v);
                }
            }
            return newArr;
        }
    };
	
	/**
	 * 迷你模板，替换__field__，其中的`field`为`renderObj`中的字段
	 * 返回替换后的模板文本
	 * @param tpl 模板字符串
	 * @param renderObj	渲染的对象
	 * @return {string}
	 */
	Ycc.utils.renderTpl=function (tpl,renderObj) {
		return tpl.replace(/__.+?__/g,function (txt) {
			console.log('匹配到的文本-->',txt);
			var key = txt.slice(2).slice(0,-2).trim();
			if(renderObj[key]!==undefined)
				return renderObj[key];
			else
				return txt;
		});
	}
	


})(Ycc);

