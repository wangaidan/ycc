/**
 * @file    main.js
 * @author  xiaohei
 * @date    2018/9/28
 * @description  main文件
 */

if(!Ycc.utils.isMobile())
	alert('此示例在移动端查看效果更好！');



///////////////////////////// 全局变量
var ycc = null;
var stageW = 0;
var stageH = 0;

// 所有的图片资源
var images = null;
// 所以音频资源
var audios = null;
// 当前场景
var currentScene = null;
// loading窗
var loading = null;
// 物理引擎
var engine = null;
//////


createYcc();
projectInit();








function createYcc() {
// 创建canvas
	var canvas = document.createElement('canvas');
	canvas.width=document.documentElement.clientWidth;
	canvas.height=document.documentElement.clientHeight;
	document.body.appendChild(canvas);

// 初始化全局变量
	ycc = new Ycc().bindCanvas(canvas);
	stageW = ycc.getStageWidth();
	stageH = ycc.getStageHeight();
	

	// 调试信息
	ycc.debugger.addField('帧间隔',function () {return ycc.ticker.deltaTime;});
	ycc.debugger.addField('总帧数',function () {return ycc.ticker.frameAllCount;});
	ycc.debugger.addField('渲染时间',function () {return ycc.ticker.deltaTime;});
	ycc.debugger.addField('update时间',function () {return ycc.ticker.deltaTime;});
	ycc.debugger.addField('debug时间',function () {return ycc.ticker.deltaTime;});

// 监听每帧、更新场景
	ycc.ticker.addFrameListener(function () {
		var t1 = Date.now();

		ycc.layerManager.reRenderAllLayerToStage();

		var t2 = Date.now();
		ycc.debugger.updateField('渲染时间',function () {return t2-t1;});

		currentScene && currentScene.update && currentScene.update();
		
		var t3 = Date.now();
		ycc.debugger.updateField('update时间',function () {return t3-t2;});

		currentScene && currentScene.debug && currentScene.debug();
		currentScene && currentScene.btnLayer && ycc.debugger.addToLayer(currentScene.btnLayer);
		ycc.debugger.updateInfo();
		
		var t4 = Date.now();
		ycc.debugger.updateField('debug时间',function () {return t4-t3;});
		
	});
	
	
}



function projectInit() {
	
	loading = new Loading();
	ycc.ticker.start(60);
	
	
	// 加载资源
	ycc.loader.loadResOneByOne([
		{name:"btn",url:"./images/btn.jpg"},
		{name:"fight",url:"./images/fight.png"},
		{name:"jump",url:"./images/jump.png"},
		{name:"mario",url:"./images/mario-walk.png"},
		{name:"girl",url:"./images/girl.png"},
		{name:"mushroom",url:"./images/mushroom.png"},
		{name:"wall",url:"./images/wall.png"},
		{name:"marioFight",url:"./images/mario-fight.png"},
		{name:"marioJump",url:"./images/mario-jump.png"},
		{name:"marioDown",url:"./images/mario-down.png"},
		{name:"coin100",url:"./images/coin100.jpg"},
		{name:"bucket",url:"./images/bucket.png"},
		{name:"flag",url:"./images/flag.png"},
		{name:"marioTouchFlag",url:"./images/mario-touch-flag.png"},
		{name:"missile",url:"./images/missile.png"},
		{name:"bg01",url:"./images/bg01.jpg"},
		{name:"bg02",url:"./images/bg02.jpg"},
		{name:"bg03",url:"./images/bg03.jpg"},
		{name:"bg04",url:"./images/bg04.jpg"},
		{name:"bg05",url:"./images/bg05.jpg"},
	],function (lise,imgs) {
		
		ycc.loader.loadResOneByOne([
			{name:"bgm",type:"audio",url:"./audios/bgm.mp3"},
			{name:"jump",type:"audio",url:"./audios/jump.mp3"},
			{name:"touchWall",type:"audio",url:"./audios/touchWall.mp3"},
			{name:"touchCoin",type:"audio",url:"./audios/touchCoin.mp3"},
			{name:"dead1",type:"audio",url:"./audios/dead1.mp3"},
			{name:"dead2",type:"audio",url:"./audios/dead2.mp3"},
		],function (lise,musics) {
			console.log(imgs,222);
			console.log(musics,333);
			images = imgs;
			audios = musics;
			loading.hidden();
			
			engine = Matter.Engine.create();
			Matter.Engine.run(engine);
			
			currentScene = new GameScene();
			ycc.layerManager.reRenderAllLayerToStage();
		},function (item,error) {
			loading.updateText(item.name);
		});
		
	},function (item,error) {
		loading.updateText(item.name);
	});
	
}
