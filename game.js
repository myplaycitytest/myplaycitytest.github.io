var GAME_ID = "gemlegends";
var SERVER_GAME_ID = 2;

var stage = null;
var fps = 60;
var pps = 1000;
var bitmaps = {};
var GET = {};
var library;
var LANDSCAPE_MODE = true;

var STATE_LOAD = 0;
var STATE_MENU = 2;
var STATE_GAME = 3;
var STATE_MAP = 4;
var gameState = STATE_LOAD;

window.onload = function()
{
	GET = Utils.parseGet();
	Utils.addMobileListeners(LANDSCAPE_MODE, true);
	Utils.mobileCorrectPixelRatio();
	Utils.addFitLayoutListeners();
	Utils.switchToTimeMode(1000/fps);
	if(ExternalAPI.init(SERVER_GAME_ID, "http://srv.playtomax.com/gemlegends/", startLoad) !== true) setTimeout(startLoad, 500);
};

function startLoad()
{
	//I18.currentLocale = "ru";
	var resolution = Utils.getMobileScreenResolution(LANDSCAPE_MODE);
	if(GET.debug) resolution = Utils.getScaleScreenResolution(1, LANDSCAPE_MODE);
	if(Utils.mobileCheckSlowDevice()) resolution = Utils.getScaleScreenResolution(1, LANDSCAPE_MODE);
	//resolution = Utils.getScaleScreenResolution(2, LANDSCAPE_MODE);
	Utils.globalScale = resolution.scale;
	Utils.createLayout(document.getElementById(Utils.DOMMainContainerId), resolution);
	Utils.addEventListener("fitlayout", function()
	{
		if(stage)
		{
			stage.drawScene(stage.canvas);
			stage.drawScene(stage.backgroundCanvas, true);
		}
		resizeCSSBack();
	});
	Utils.addEventListener("lockscreen", function()	{ if(stage && stage.started) stage.stop(); });
	Utils.addEventListener("unlockscreen", function()	{ if(stage && !stage.started) stage.start(); });
	
	Utils.mobileHideAddressBar();
	
	if(!GET.debug) Utils.checkOrientation(LANDSCAPE_MODE);

	I18.initLocale();

	addFontsJS();

	library = new AssetsLibrary('images', Utils.globalScale, assets.concat(loc_assets[I18.currentLocale]));
	TTLoader.create(loadSoundsEnd, true, GET["debug"] == 1);
	library.load(loadImagesEnd, TTLoader.showLoadProgress, 0, 50);
}

function loadImagesEnd(data)
{
	bitmaps = data;
	var sounds = [], path = "sounds/";
	for (var i= 0, len = SoundUtils.tracks.length; i<len; i++) sounds.push(path + SoundUtils.tracks[i]);

	var soundsPreloader = new SoundsPreloader();
	soundsPreloader.maxProgressVal = 50;
	soundsPreloader.minProgressVal = 50;
	soundsPreloader.load(sounds, TTLoader.loadComplete, TTLoader.showLoadProgress);
}

function loadSoundsEnd()
{
	Utils.showMainLayoutContent();
	UserSettings.load(function()
	{
		SoundUtils.setMixer();
		SoundUtils.playBack();
		I18.init(false, showMenu);
	});
}

function addFontsJS()
{
	var arr = ['brown', 'buttons', 'scores', 'steps', 'title', 'yellow'],
		script;
	for (var i=0; i<arr.length; i++)
	{
		script = document.createElement('script');
		script.src = 'fonts/'+I18.currentLocale+'/font_greek_'+arr[i]+'.js';
		document.getElementsByTagName('head')[0].appendChild(script);
	}
};

function showMenu()
{
	gameState = STATE_MENU;
	createScene();
}

function showGame()
{
	gameState = STATE_GAME;
	createScene();
}

function showMap()
{
	gameState = STATE_MAP;
	createScene();
}

function createStage()
{
	if(stage)
	{
		stage.destroy();
		stage.stop();
	}
	stage = new Stage('screen', 480, 320, false);
	stage.setBackgroundCanvas('screen_background');
	
	stage.delay = 1000/fps;
	stage.onpretick = preTick;
	stage.onposttick = postTick;
	stage.ceilSizes = true;
	stage.showFPS = false;
}

function createScene()
{
	createStage();
	if(gameState == STATE_MENU) MainMenu.show();
	else if (gameState == STATE_MAP) LevelMap.show(true);
	else if (gameState == STATE_GAME) Level.load();
	stage.start();
	stage.refreshBackground();
}

function getGameDataId()
{
	return "playtomax_" + GAME_ID + "_data";
}

function showMoreGames()
{
	window.open(ExternalAPI.exec("getMoreGamesURL"), "_blank");
}

function preTick()
{

}

function postTick()
{
}