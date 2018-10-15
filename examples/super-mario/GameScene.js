/**
 * @file    GameScene.js
 * @author  xiaohei
 * @date    2018/9/28
 * @description  GameScene文件
 */

function GameScene(){
	
	// 游戏进行中的图层
	this.layer = ycc.layerManager.newLayer({enableEventManager:true});
	
	// 放置按钮的图层
	this.btnLayer = ycc.layerManager.newLayer({enableEventManager:true,name:"按钮图层"});
	
	// mario的UI
	this.mario = null;
	
	// matter引擎
	this.engine = null;
	
	// 人脸方向
	this.direction = '';

    // 方向键下 是否正在按住
    this.downIsPressing = false;

    // 人物从下蹲起身的标志位
    this.downTouchEndFlag = false;

    // 跳跃键 是否正在按住
    this.jumpIsPressing = false;

	// 物理引擎中的物体
	this.bodies = null;
	
	// 人物正在接触的物体数组
	this.marioContactWith = [];
	
	// 人物是否正站立在墙体上
	this.marioStayingOnWall = false;
	
	// 当前游戏关卡
	this.gameLevel = '1_1';
	
	this.init();
	
}

// 初始化
GameScene.prototype.init = function () {
	this.createDirectionBtn();
	this.createSkillBtn();
	this.createMario();
	
	// 通过关卡创建当前关卡的UI
	this['level_'+this.gameLevel] && this['level_'+this.gameLevel]();
	
    this.collisionListenerInit();
};

/**
 * 生成方向键
 */
GameScene.prototype.createDirectionBtn = function () {
	var self = this;
	// 按钮大小
	var btnSize = 40;
	// 按钮之间的间隙
	var btnSpace = 5;
	// 按钮组距屏幕左侧的宽度
	var marginLeft = 20;

	// 按钮组距屏幕下侧的宽度
	var marginBottom = 20;
	
	// 左
	self.btnLayer.addUI(new Ycc.UI.Image({
		rect:new Ycc.Math.Rect(marginLeft,stageH-(btnSize+marginBottom),btnSize,btnSize),
		fillMode:'scale',
		anchorX:btnSize/2,
		anchorY:btnSize/2,
		res:images.btn,
		rotation:180,
		ondragstart:function (e) {
			self.mario.mirror=1;
			self.mario.start();
			self.direction = 'left';
		},
		ondragend:function (e) {
			self.mario.stop();
			self.direction = '';
		}
	}));
	
	// 下
	self.btnLayer.addUI(new Ycc.UI.Image({
		rect:new Ycc.Math.Rect(marginLeft+btnSize+btnSpace,stageH-(btnSize+marginBottom),btnSize,btnSize),
		fillMode:'scale',
		anchorX:btnSize/2,
		anchorY:btnSize/2,
		res:images.btn,
		rotation:90,
		ondragstart:function (e) {
			// 如果人物不处于站立或行走状态，按下键无效
			if(!self.marioStayingOnWall) {
				console.log('人物当前状态不能下蹲!');
				return;
			}
            self.downIsPressing = true;
		},
		ondragend:function (e) {
            self.downIsPressing = false;
            self.downTouchEndFlag = true;
		}
	}));

	// 右
	self.btnLayer.addUI(new Ycc.UI.Image({
		rect:new Ycc.Math.Rect(marginLeft+btnSize*2+btnSpace*2,stageH-(btnSize+marginBottom),btnSize,btnSize),
		fillMode:'scale',
		anchorX:btnSize/2,
		anchorY:btnSize/2,
		res:images.btn,
		rotation:0,
		ondragstart:function (e) {
			self.mario.mirror=0;
			self.mario.start();
			self.direction = 'right';
		},
		ondragend:function (e) {
			self.mario.stop();
			self.direction = '';
		}
		
	}));
	
	
	// 上
	self.btnLayer.addUI(new Ycc.UI.Image({
		rect:new Ycc.Math.Rect(marginLeft+btnSize+btnSpace,stageH-(btnSize+marginBottom)-(btnSize+btnSpace),btnSize,btnSize),
		fillMode:'scale',
		anchorX:btnSize/2,
		anchorY:btnSize/2,
		res:images.btn,
		rotation:-90,
        ontap:function (e) {
			if(self.jumpIsPressing) return;
            self.jumpIsPressing = true;
        }
		
	}));

    // 按键`上`是否是抬起状态
    var upIsUp = true;
    window.onkeydown = function(e){
        if(e.keyCode===38){
            if(upIsUp){
                upIsUp=false;
                self.jumpIsPressing = true;
            }
        }
        if(e.keyCode===37){
            self.mario.mirror=1;
            !self.mario.isRunning && self.mario.start();
            self.direction = 'left';
        }
        if(e.keyCode===39){
            self.mario.mirror=0;
            !self.mario.isRunning && self.mario.start();
            self.direction = 'right';
        }
        if(e.keyCode===40){
			// 如果人物不处于站立或行走状态，按下键无效
			if(!self.marioStayingOnWall) {
				console.log('人物当前状态不能下蹲!');
				return;
			}
            self.downIsPressing = true;
        }

        if(e.keyCode===88){
            if(self.isFighting())
                return;
            // 记录攻击时的帧数
            self.mario._fightFrameCount=ycc.ticker.frameAllCount;
        }

        if(e.keyCode===67){
            if(upIsUp){
                upIsUp=false;
                self.jumpIsPressing = true;
            }
        }

    };

    window.onkeyup = function(e){
        if(e.keyCode===38){
            upIsUp=true;
            self.jumpIsPressing = false;
        }
        if(e.keyCode===37){
            self.mario.stop();
            self.direction = '';
        }
        if(e.keyCode===39){
            self.mario.stop();
            self.direction = '';
        }
        if(e.keyCode===40){
            self.downIsPressing = false;
            self.downTouchEndFlag = true;
        }
        if(e.keyCode===67){
            upIsUp=true;
            self.jumpIsPressing = false;
        }
    };

};


/**
 * 生成功能键
 */
GameScene.prototype.createSkillBtn = function () {
	var self = this;
	// 按钮大小
	var btnSize = 40;
	// 按钮之间的间隙
	var btnSpace = 15;
	// 按钮组距屏幕左侧的宽度
	var marginRight = 20;
	// 按钮组距屏幕下侧的宽度
	var marginBottom = 20;
	
	// 跳跃
	self.btnLayer.addUI(new Ycc.UI.Image({
		rect:new Ycc.Math.Rect(stageW-btnSize-marginRight,stageH-(btnSize+marginBottom),btnSize,btnSize),
		fillMode:'scale',
		res:images.jump,
		ontap:function (e) {
			if(self.jumpIsPressing) return;
            self.jumpIsPressing = true;
        }
    }));
	
	// 攻击
	self.btnLayer.addUI(new Ycc.UI.Image({
		rect:new Ycc.Math.Rect(stageW-btnSize*2-btnSpace-marginRight,stageH-(btnSize+marginBottom),btnSize,btnSize),
		fillMode:'scale',
		res:images.fight,
		ontap:function (e) {
			if(self.isFighting())
				return;
			// 记录攻击时的帧数
			self.mario._fightFrameCount=ycc.ticker.frameAllCount;
		}
	}));
	
};




/**
 * 将matter的刚体绑定至UI
 * @param body matter刚体
 * @param ui
 */
GameScene.prototype.bindMatterBodyWithUI = function (body,ui) {
	ui._matterBody = body;
	body._yccUI = ui;
};

/**
 * 获取与ui绑定的matter刚体
 * @param ui
 */
GameScene.prototype.getMatterBodyFromUI = function (ui) {
	return ui._matterBody;
};

/**
 * 获取与matter刚体绑定的ui
 * @param body
 * @return {*}
 */
GameScene.prototype.getUIFromMatterBody = function (body) {
	return body._yccUI;
};




/**
 * 调试
 */
GameScene.prototype.debug = function () {
	var bodies = Matter.Composite.allBodies(engine.world);
	var context = ycc.ctx;
	context.save();
	context.beginPath();
	for (var i = 0; i < bodies.length; i += 1) {
		var vertices = bodies[i].vertices;
		context.moveTo(vertices[0].x, vertices[0].y);
		for (var j = 1; j < vertices.length; j += 1) {
			context.lineTo(vertices[j].x, vertices[j].y);
		}
		context.lineTo(vertices[0].x, vertices[0].y);
	}
	context.lineWidth = 2;
	context.strokeStyle = '#999';
	context.stroke();
	context.restore();
};


/**
 * 碰撞检测
 */
GameScene.prototype.collisionListenerInit = function () {
	var self = this;
	
	/*Matter.Events.on(engine,'collisionStart',function (event) {
		var pair = event.pairs[0];
		var mario = getMarioFromPair(pair);
		var other = getAnotherBodyFromPair(pair,mario);
		
		if(mario&&other){
			self.marioContactWith = other;
		}
	});*/

	Matter.Events.on(engine,'collisionEnd',function (event) {

        for(var i=0;i<event.pairs.length;i++){
            var pair = event.pairs[i];
            //console.log(i,pair.bodyA.label,pair.bodyB.label)
            var mario = getMarioFromPair(pair);
            var other = getAnotherBodyFromPair(pair,mario);

            if(mario&&other){
                var index=self.marioContactWith.indexOf(other);
                index!==-1&&self.marioContactWith.splice(index,1);
            }
        }
	});
	
	
	Matter.Events.on(engine,'collisionActive',function (event) {
		for(var i=0;i<event.pairs.length;i++){
			var pair = event.pairs[i];
			var mario = getMarioFromPair(pair);
			var other = getAnotherBodyFromPair(pair,mario);
			
			if(mario&&other){
                var index=self.marioContactWith.indexOf(other);
                index===-1&&self.marioContactWith.push(other);
			}
		}
	});
	
	// 碰撞时获取与Mario相碰撞的另一刚体
	function getAnotherBodyFromPair(pair,mario) {
		if(!mario)
			return null;
		if(mario===pair.bodyA)
			return pair.bodyB;
		if(mario===pair.bodyB)
			return pair.bodyA;
	}
	// 碰撞时获取Mario
	function getMarioFromPair(pair) {
		var marioBody = self.getMatterBodyFromUI(self.mario);
		if(pair.bodyA.label=== marioBody.label)
			return pair.bodyA;
		if(pair.bodyB.label=== marioBody.label)
			return pair.bodyB;
		return null;
	}
	
};

/**
 * 判断Mario是否真正攻击
 * @returns {boolean}
 */
GameScene.prototype.isFighting = function(){
    var res = this.mario._fightFrameCount>0 && ycc.ticker.frameAllCount - this.mario._fightFrameCount<6;
    if(!res)
        this.mario._fightFrameCount=0;
    return res;
};

/**
 * 判断Mario是否处于正常站立状态
 * 并设置属性marioStayingOnWall
 */
GameScene.prototype.marioStayingOnWallCompute = function () {
    for(var i=0;i<this.marioContactWith.length;i++){
        var body = this.marioContactWith[i];
        if(['wall','ground'].indexOf(body.label)!==-1){
            var marioRect = this.mario.rect;
            var wallRect = this.getUIFromMatterBody(body).rect;
            this.marioStayingOnWall = parseInt(marioRect.y+marioRect.height)<=wallRect.y
                && marioRect.x+marioRect.width>=wallRect.x
                && marioRect.x<wallRect.x+wallRect.width;

            // 如果处于站立状态，立即中断循环
            if(this.marioStayingOnWall) return;
        }
    }

    this.marioStayingOnWall = false;

};

/**
 * 判断Mario是否处于悬空、跳跃状态
 * 并设置属性jumpIsPressing
 */
GameScene.prototype.jumpIsPressingCompute = function () {
	if(this.jumpIsPressing && this.marioStayingOnWall){
		Matter.Body.setVelocity(this.getMatterBodyFromUI(this.mario), {x:0,y:-10});
		this.jumpIsPressing = false;
	}else{
		this.jumpIsPressing = false;
	}
};

/**
 * 计算Mario需要显示的图片及Mario的高度等
 */
GameScene.prototype.marioImageResCompute = function () {
	
	var marioBody = this.getMatterBodyFromUI(this.mario);
	
	// console.log(this.marioStayingOnWall,this.isFighting(),this.downIsPressing);
	
	// 人物正在行走或站立，并且没有攻击，并且没有下蹲
	if(this.marioStayingOnWall && !this.isFighting() && !this.downIsPressing){
		this.mario.res = images.mario;
		this.mario.frameRectCount = 3;

        // 起身的标志位
        if(this.downTouchEndFlag){
            // 此处重新赋值的原因在于，人物下蹲后刚体尺寸发生了变化，所以起身时需要重新计算刚体高度
            // 重新赋值高度
            this.mario.rect.height = this.mario.res.naturalHeight*2;
            // 赋值刚体高度
            Matter.Body.setVertices(marioBody,this.mario.rect.getVertices());

            this.downTouchEndFlag=false;
        }
		// 赋值序列帧动画第一帧的图片高度
		this.mario.firstFrameRect.height = this.mario.res.naturalHeight;
	}

	// 人物处于空中
	else if(!this.marioStayingOnWall){
		this.mario.res = this.downIsPressing?images.marioDown:images.marioJump;
		this.mario.frameRectCount = 1;
	}
	
	// 人物处于下蹲状态
	else if(this.downIsPressing){
		console.log('下蹲');
		// 刚体位置
		var pos = marioBody.position;
		
		this.mario.res = images.marioDown;
		this.mario.frameRectCount = 1;

		// 计算刚体位置
		pos.y+=this.mario.rect.height-this.mario.res.naturalHeight*2;
		// 赋值人物高度
		this.mario.rect.height=this.mario.res.naturalHeight*2;
		// 赋值刚体高度
		Matter.Body.setVertices(marioBody,this.mario.rect.getVertices());
		// 赋值序列帧动画第一帧的图片高度
		this.mario.firstFrameRect.height = this.mario.res.naturalHeight;
		// 重新赋值刚体位置
		Matter.Body.setPosition(marioBody,pos);
	}

	// 人物行走或者站立时，正在攻击
	else if(this.marioStayingOnWall && this.isFighting()){
		this.mario.res = images.marioFight;
		this.mario.frameRectCount = 1;
	}
	
};

// 每帧的更新函数
GameScene.prototype.update = function () {
	var marioBody = this.getMatterBodyFromUI(this.mario);
    // 强制设置Mario的旋转角度为0，防止倾倒
    Matter.Body.setAngle(marioBody,0);

    // 强制设置Mario的旋转角速度为0，防止人物一只脚站立时旋转
    Matter.Body.setAngularVelocity(marioBody,0);
	
    // 判断Mario是否处于正常站立
	this.marioStayingOnWallCompute();
	
	// 判断Mario是否处于悬空、跳跃状态，跳跃键处于按下状态
	this.jumpIsPressingCompute();

	// 判断当前帧应该显示的Mario图片
	this.marioImageResCompute();
	

	
	var marioBodyPosition = marioBody.position;
	
	
	// 不在空中的下蹲不能控制人物左右移动
	// @todo 控制力度、刹车图片替换
	if(!(this.marioStayingOnWall&&this.downIsPressing)) {
		
		if(this.direction==='left'){
			// Matter.Body.applyForce(marioBody,{x:0,y:0},{x:-0.001,y:0});
			Matter.Body.setPosition(marioBody, {x:marioBodyPosition.x-1,y:marioBodyPosition.y});
		}
		if(this.direction==='right'){
			// Matter.Body.applyForce(marioBody,marioBodyPosition,{x:0.001,y:0});
			Matter.Body.setPosition(marioBody, {x:marioBodyPosition.x+1,y:marioBodyPosition.y});
		}

		/*if(Math.abs(marioBody.velocity.x)<5){
			if(this.direction==='left'){
				// Matter.Body.applyForce(marioBody,{x:0,y:0},{x:-0.001,y:0});
				Matter.Body.setPosition(marioBody, {x:marioBodyPosition.x-1,y:(marioBodyPosition.y)});
			}
			if(this.direction==='right'){
				// Matter.Body.applyForce(marioBody,marioBodyPosition,{x:0.001,y:0});
				Matter.Body.setPosition(marioBody, {x:marioBodyPosition.x+1,y:(marioBodyPosition.y)});
			}
		}else{
			Matter.Body.applyForce(marioBody,marioBodyPosition,{x:0,y:0});
		}*/
	}

	

	
	// 更新人物位置
	this.mario.rect.x=marioBody.vertices[0].x;
	this.mario.rect.y=marioBody.vertices[0].y;
	
	// 场景的移动
	if(this.mario.rect.x-stageW/2>0){
		// 初始layer的x为0
		this.layer.x = -(this.mario.rect.x-stageW/2);
	}



	
	
};
