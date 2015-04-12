function LevelMap()
{
    this.cloudSeperator = null;
	this.temp_arr = [];
	this.icons = [];
	this.openPanel = false;
    this.set();
}

LevelMap.prototype.set = function()
{
	this.setBack();
    this.main_spr = setSprite(stage, null, center.x, center.y*2, {fillColor: "white", width: 4, height: 4});

	for (var i=1; i<12; i++) this.addMapStage(i);
    this.setIcons();
    this.setCloudSeparator();
    this.setGirl();

    this.setTopPanel();
    this.setBottomPanel();

	SoundUtils.playBack();

	if (Level.newLevelOpened) this.playLevelOpenAnimation();
	else this.setMainSprStatic(true);

};

LevelMap.lockSprite = null;

LevelMap.prototype.lock = function()
{
	if (LevelMap.lockSprite) LevelMap.lockSprite.destroy = true;
	LevelMap.lockSprite = setSprite(stage, null, center.x, center.y,
				{w: center.x*2, h: center.y*2/*, fC: "blue", o: 0.3*/});
	LevelMap.lockSprite.preventAllEvents();
	this.removeWheelListener();
};

LevelMap.prototype.unLock = function()
{
	if (LevelMap.lockSprite) LevelMap.lockSprite.destroy = true;
};

LevelMap.prototype.freezePanels = function()
{
	this.top_panel.setStatic(true);
	this.bottom_panel.setStatic(true);
	this.coins_text.setStatic(true);
	this.stars_text.setStatic(true);
};

LevelMap.prototype.unFreezePanels = function()
{
	this.top_panel.setStatic(false);
	this.bottom_panel.setStatic(false);
	this.coins_text.setStatic(false);
	this.stars_text.setStatic(false);
};

LevelMap.prototype.setMainSprStatic = function(val)
{
	this.main_spr.setStatic(val);
	this.change_pack_btn.setStatic(false);
};

LevelMap.prototype.setBack = function()
{
    this.back = setSprite(stage, "map_background", center.x, center.y, {_static: true});
	this.back.addEventListener("mousedown",Utils.proxy(function(e)
    {
        e.target._drag = true;
        e.target.start_y = e.y;
		this.setMainSprStatic(false);
    }, this));

    this.back.addEventListener("mousemove",Utils.proxy(function(e)
    {
        if (!e.target._drag) return false;
        var dy = e.y-e.target.start_y;
        e.target.start_y = e.y;
        if (LevelMap.pack == 1 && (this.main_spr.y+dy >= LevelMap.positions.pack1.top ||
        						this.main_spr.y+dy <= LevelMap.positions.pack1.bottom))
        {
        	return false;
        }
        else if (LevelMap.pack == 2 && (this.main_spr.y+dy >= LevelMap.positions.pack2.top ||
        						this.main_spr.y+dy <= LevelMap.positions.pack2.bottom))
		{
			return false;
		}
        this.main_spr.y+=dy;
        return false;
    }, this));
    this.back.addEventListener("mouseup",Utils.proxy(function(e)
    {
        e.target._drag = false;
		this.setMainSprStatic(true);
    }, this));
    this.num = this.temp_arr.length+1;

	this.addWheelListener();
};

LevelMap.prototype.addWheelListener = function()
{
	var d = document.getElementById("screen"), type;
	if ('onwheel' in document) type = "wheel";
	else if ('onmousewheel' in document) type = "mousewheel";
	else type = "MozMousePixelScroll";

	d.addEventListener(type, LevelMap.onWheelHandler, false);
};

LevelMap.onWheelHandler = function(e)
{
	e = e || window.event;
	var dy = e.deltaY || e.detail || e.wheelDelta;
	dy = -dy/10;
	if (LevelMap.pack == 1 && (LevelMap.area.main_spr.y+dy >= LevelMap.positions.pack1.top ||
		LevelMap.area.main_spr.y+dy <= LevelMap.positions.pack1.bottom))
	{
		return false;
	}
	else if (LevelMap.pack == 2 && (LevelMap.area.main_spr.y+dy >= LevelMap.positions.pack2.top ||
		LevelMap.area.main_spr.y+dy <= LevelMap.positions.pack2.bottom))
	{
		return false;
	}
	LevelMap.area.main_spr.y+=dy;
	stage.needToRebuildBack = true;
	e.preventDefault ? e.preventDefault() : (e.returnValue = false);
};

LevelMap.prototype.removeWheelListener = function()
{
	var d = document.getElementById("screen"), type;
	if ('onwheel' in document) type = "wheel";
	else if ('onmousewheel' in document) type = "mousewheel";
	else type = "MozMousePixelScroll";
	d.removeEventListener(type, LevelMap.onWheelHandler, false);
};

LevelMap.prototype.setTopPanel = function()
{
    this.top_panel = setSprite(stage, "panel_10", center.x, -24);
    this.top_panel.preventAllEvents();
    var coins_item = setSprite(this.top_panel, "coins_0", -68, -9);
    this.coins_text = setBitmapText(coins_item, "font_greek_buttons_mip1", UserSettings.coins, 30, 3, {align: 2});
	var star_item = setSprite(this.top_panel, "star", 20, -10);
	star_item.scaleTo(0.5);
    this.stars_text = setBitmapText(this.top_panel, "font_greek_buttons_mip1", UserSettings.getTotalStarsCount(), 42, -6, {align: 2});
	var stars_buy_btn = new Button(this.top_panel, "btn_plus2", 77, -8, Utils.proxy(this.showStarsBuyPanel, this));
	this.top_panel.moveTo(center.x, 24, pps/2, Easing.linear);
};

LevelMap.prototype.updateTopPanel = function()
{
	this.coins_text.write(UserSettings.coins);
	this.stars_text.write(UserSettings.getTotalStarsCount());
	stage.needToRebuildBack = true;
};

LevelMap.prototype.setBottomPanel = function()
{
    this.bottom_panel = setSprite(stage, "panel_6", 65, 340);
    var options_btn = new Button(this.bottom_panel, "btn_options", 7, 0, Utils.proxy(this.showOptions, this));
	this.bottom_panel.moveTo(65, 300, pps/2);
};

LevelMap.prototype.showStarsBuyPanel = function()
{
	this.freezePanels();
	this.removeWheelListener();

	var after_stars_buying = false;
	var last_complete_level_number = UserSettings.stars.length;
	var user_stars = UserSettings.getTotalStarsCount();
	var dragon = LevelMap.dragonPoints["level_"+(last_complete_level_number+1)];
	if (dragon && user_stars < dragon.stars && last_complete_level_number)
	{
		after_stars_buying = true;
	}

	var p = new StarsBuyPanel(Utils.proxy(function()
	{
		this.unFreezePanels();
		this.updateTopPanel();
		this.checkDragonForOpen(false, after_stars_buying);
		this.addWheelListener();
	}, this));
};

LevelMap.prototype.playLevelOpenAnimation = function()
{
	Level.newLevelOpened = false;
	var i = UserSettings.stars.length;

	this.icons[i].gotoAndStop(0);
	if (this.icons[i].text) this.icons[i].text.write("");

	var x0 = LevelMap.levelPoints[i-1][0];
	var y0 = LevelMap.levelPoints[i-1][1];

	this.girl.x = x0+6;
	this.girl.y = y0-35;

	this.checkDragonForOpen(true);
};

LevelMap.prototype.checkDragonForOpen = function(new_level, after_stars_buying)
{
	var last_complete_level_number = UserSettings.stars.length;
	var user_stars = UserSettings.getTotalStarsCount();
	var dragon = LevelMap.dragonPoints["level_"+(last_complete_level_number+1)];

	var icon = this.icons[last_complete_level_number];

	if ((dragon && user_stars >= dragon.stars && last_complete_level_number && new_level) ||
		(after_stars_buying && dragon && user_stars >= dragon.stars && last_complete_level_number))
	{
		if (!icon.active)
		{
			icon.active = true;
			icon.gotoAndStop(0);
			this.addIconListeners(icon);
		}

		var dragon_spr = this.icons[dragon.beforeLevel-1].dragon;
		dragon_spr.gotoAndStop(0);
		setBitmapText(dragon_spr, "font_greek_buttons_mip2", dragon.stars, 2, 14, {align: 2});

		this.setMainSprStatic(false);
		stage.setTimeout(Utils.proxy(function()
		{
			this.destroyDragonAnimation(icon.dragon, icon.number-1);
		}, this), pps);
		this.lock();
	}
	else if (!dragon && new_level)
	{
		this.setMainSprStatic(false);
		stage.setTimeout(Utils.proxy(function()
		{
			this.openIconAnimation(icon.number-1);
		}, this), pps);
		this.lock();
	}
};

LevelMap.prototype.destroyDragonAnimation = function(dragon, i)
{
	var spr = Utils.clone(dragon);
	this.main_spr.addChild(spr);
	spr.gotoAndStop(1);
	spr.opacity = 0;
	spr.fadeTo(1, pps);
	dragon.fadeTo(0, pps, Easing.linear, Utils.proxy(function(e)
	{
		e.target.obj.destroy = true;
		var last_complete_level_number = UserSettings.stars.length;
		if (last_complete_level_number == 60)
		{
			this.girl.fadeTo(0, pps/2, Easing.linear, Utils.proxy(function()
			{
				this.changePack(61);
			}, this));
		}
		else this.openIconAnimation(i);
		return false;
	}, this));
};

LevelMap.prototype.openIconAnimation = function(i)
{
	var x1 = LevelMap.levelPoints[i][0]+2;
	var y1 = LevelMap.levelPoints[i][1]-18;

	var ef = setTilesSprite(this.main_spr, "open_level_animation", x1, y1, {_frames: 16});
	ef.scaleTo(0.8);
	ef.changeFrameDelay = pps/20;
	ef.onchangeframe = Utils.proxy(function(e)
	{
		if (e.target.currentFrameX == 11)
		{
			this.icons[i].gotoAndStop(1);
			this.icons[i].text = setBitmapText(this.icons[i], "font_greek_buttons_mip2", i+1, 0, 3, {align: 2});
		}
		if (e.target.currentFrameX == 14)
		{
			e.target.destroy = true;
			this.moveGirlAnimation(i);
		}
	}, this);
};

LevelMap.prototype.moveGirlAnimation = function(i)
{
	var x1 = LevelMap.levelPoints[i][0];
	var y1 = LevelMap.levelPoints[i][1];
	if (i != 60)
	{
		this.girl.moveTo(x1+6, y1-35, pps, Easing.linear, Utils.proxy(function()
		{
			this.addIconListeners(this.icons[i]);
			this.setMainSprStatic(true);
			this.clickIcon({target: this.icons[i]});
			this.unLock();
		}, this));
	};
};

LevelMap.prototype.showOptions = function()
{
	this.freezePanels();
	this.removeWheelListener();
	OptionsPanel.open("map", Utils.proxy(function()
	{
		this.unFreezePanels();
		this.addWheelListener();
	}, this));
};

LevelMap.prototype.setIcons = function()
{
    for (var i=0; i<LevelMap.levelPoints.length; i++) this.setIcon(i);

	var len = UserSettings.stars.length;
	if (len > 120) len = 120;
	this.correctPosition(this.icons[len == 120 ? len-1 : len].y);
};

LevelMap.prototype.setIcon = function(i)
{
	var icon = setSprite(this.main_spr, "map_level_icon", LevelMap.levelPoints[i][0],
									LevelMap.levelPoints[i][1] + (i > 59 ? 3 : 0));
	icon.number = i+1;
	var dragon = LevelMap.dragonPoints["level_"+icon.number], dragon_spr;
	if (dragon)
	{
		dragon_spr = setSprite(this.main_spr, "map_dragon", dragon.x, dragon.y);
		icon.dragon = dragon_spr;
	}

	if (i < UserSettings.stars.length)
	{
		icon.gotoAndStop(UserSettings.stars[i]+1);
		this.addIconListeners(icon);
		icon.text = setBitmapText(icon, "font_greek_buttons_mip2", i+1, 0, 3, {align: 2});
		if (dragon) dragon_spr.gotoAndStop(1);
		icon.active = true;
	}
	else if (i > UserSettings.stars.length)
	{
		icon.gotoAndStop(0);
		if (dragon)
		{
			dragon_spr.gotoAndStop(0);
			setBitmapText(dragon_spr, "font_greek_buttons_mip2", dragon.stars, 2, 14, {align: 2});
		}
	}
	else
	{
		if (dragon && dragon.stars > UserSettings.getTotalStarsCount()/* && Level.newLevelOpened*/)
		{
			icon.gotoAndStop(0);
			if (dragon)
			{
				dragon_spr.gotoAndStop(0);
				setBitmapText(dragon_spr, "font_greek_buttons_mip2", dragon.stars, 2, 14, {align: 2});
			}
		}
		else
		{
			icon.gotoAndStop(1);
			this.addIconListeners(icon);
			icon.text = setBitmapText(icon, "font_greek_buttons_mip2", i+1, 0, 3, {align: 2});
			if (dragon) dragon_spr.gotoAndStop(1);
			icon.active = true;
		}
	}
	this.icons.push(icon);
};

LevelMap.prototype.addIconListeners = function(icon)
{
	icon.addEventListener("mouseup", Utils.proxy(function(e)
	{
		e.target.scaleTo(1);
		if (e.target.flag)
		{
			this.clickIcon(e);
			e.target.flag = false;
			return false;
		}
	}, this));
	icon.addEventListener("mousedown", function(e){
		e.target.scaleTo(0.9, pps/10);
		e.target.flag = true;
		return false;
	});
	icon.addEventListener("mouseout", function(e){
		e.target.scaleTo(1, pps/10);
		e.target.flag = false;
		return false;
	});
	icon.addEventListener("mousemove", function(e){
		return false;
	});
	icon.addEventListener("mouseover", function(e){
		e.target.flag = false;
		return false;
	});
};

LevelMap.prototype.clickIcon = function(e)
{
	var number = e.target.number;
	var pack = number > 60 ? 2 : 1;
	var level = number-(pack-1)*60;

	this.freezePanels();
	this.removeWheelListener();
	LevelGoals.open(pack, level, Utils.proxy(function()
	{
		this.unFreezePanels();
		this.addWheelListener();
	}, this));
};

LevelMap.prototype.setCloudSeparator = function()
{
	this.cloudSeparator = setSprite(this.main_spr, "cloud_01", 0, LevelMap.pack == 1 ? -1450-30 : -1450+15, {width: center.x*2});
	setSprite(this.cloudSeparator, "cloud_01", 0, 0, {width: center.x*2});
	setSprite(this.cloudSeparator, "cloud_08", 0, 0, {width: center.x*2});
	setSprite(this.cloudSeparator, "cloud_09", 0, 0, {width: center.x*2});
	setSprite(this.cloudSeparator, "cloud_08", 0, 0, {width: center.x*2});
	setSprite(this.cloudSeparator, "cloud_09", 0, 0, {width: center.x*2});
	
	this.change_pack_btn = new Button(this.cloudSeparator, "btn_map", 0, 0, Utils.proxy(function()
	{
		this.changePack();
	}, this));

	if (LevelMap.pack == 1)
	{
		this.change_pack_btn.y = 50;
		this.change_pack_btn.scaleY = -1;
	}
	else
	{
		this.change_pack_btn.y = -50;
		this.change_pack_btn.scaleY = 1;
	}
};

LevelMap.prototype.setGirl = function(num)
{
	var num = 0;
	for (var i=0; i<this.icons.length; i++)
	{
		if (!this.icons[i].active)
		{
			num = i-1;
			break;
		}
	}

	if (UserSettings.stars.length >= 120) num = 119;
	this.girl = setSprite(this.main_spr, "girl_3", LevelMap.levelPoints[num][0]+6,
													LevelMap.levelPoints[num][1]-35);

	if (num+1 < 61 && LevelMap.pack == 2) this.girl.visible = false;
	else this.girl.visible = true;
};

LevelMap.prototype.addMapStage = function(n)
{
    var ms = setSprite(this.main_spr, "map_stage_"+n, 0, center.y);
    ms.y = LevelMap.getMapStageY(n);
};

LevelMap.getMapStageY = function(n)
{
    var y = 0;
    for (var i=0; i<11; i++)
    {
        if (n-1 == i)
        {
            y -= LevelMap.stageHeights[i]/2;
            break;
        }
        else y -= (LevelMap.stageHeights[i]-0.5);
    }
    return y;
};

LevelMap.positions = {};
LevelMap.positions.pack1 = {top: 1500, bottom: 327};
LevelMap.positions.pack2 = {top: 2855, bottom: 1735};

LevelMap.levelPoints = [[58,-117],[107,-132],[120,-160],[100,-192],[61,-207],[17,-217],[-30,-223],[-74,-241],[-102,-268],[-93,-325],[-54,-347],[-9,-358],[29,-364],[67,-377],[104,-396],[120,-433],[91,-479],[42,-493],[-1,-498],[-46,-508],[-103,-578],[-75,-605],[-39,-618],[1,-624],[39,-632],[80,-645],[111,-670],[110,-731],[73,-752],[26,-763],[-15,-770],[-52,-782],[-85,-799],[-106,-827],[-98,-869],[-4,-900],[36,-907],[70,-918],[99,-936],[124,-975],[107,-1013],[71,-1030],[31,-1037],[-12,-1043],[-49,-1054],[-81,-1069],[-108,-1098],[-105,-1144],[-68,-1166],[-30,-1177],[65,-1195],[101,-1212],[125,-1245],[109,-1287],[64,-1306],[17,-1314],[-26,-1323],[-64,-1337],[-96,-1355],[-110,-1389],[71,-1475],[107,-1500],[116,-1552],[86,-1581],[43,-1593],[6,-1598],[-30,-1606],[-70,-1620],[-104,-1646],[-93,-1706],[-57,-1727],[-18,-1735],[20,-1744],[57,-1753],[93,-1770],[116,-1796],[103,-1850],[66,-1866],[24,-1873],[-18,-1880],[-95,-1923],[-87,-1978],[-52,-1992],[-12,-2003],[26,-2008],[64,-2019],[98,-2040],[124,-2104],[86,-2127],[47,-2137],[6,-2144],[-35,-2157],[-73,-2173],[-101,-2198],[-89,-2253],[-4,-2280],[34,-2287],[70,-2298],[104,-2318],[126,-2366],[92,-2403],[47,-2413],[3,-2422],[-34,-2431],[-72,-2447],[-103,-2470],[-113,-2501],[-91,-2535],[-55,-2551],[-16,-2559],[71,-2575],[105,-2594],[128,-2631],[102,-2673],[66,-2685],[22,-2694],[-20,-2701],[-64,-2716],[-96,-2740],[-110,-2771]];

LevelMap.dragonPoints = {};
LevelMap.dragonPoints.level_21 = {x: -85, y: -540, stars: 40, beforeLevel:21};
LevelMap.dragonPoints.level_36 = {x: -56, y: -900, stars: 85, beforeLevel:36};
LevelMap.dragonPoints.level_51 = {x: 17, y: -1200, stars: 135, beforeLevel:51};
LevelMap.dragonPoints.level_61 = {x: -97, y: -1430, stars: 180, beforeLevel:61};
LevelMap.dragonPoints.level_81 = {x: -63, y: -1910, stars: 220, beforeLevel:81};
LevelMap.dragonPoints.level_96 = {x: -48, y: -2285, stars: 260, beforeLevel:96};
LevelMap.dragonPoints.level_111 = {x: 27, y: -2580, stars: 320, beforeLevel:111};

LevelMap.stageHeights = [293, 275, 275, 275, 275, 275, 275, 275, 275, 275, 294];

LevelMap.prototype.correctPosition = function(y)
{
	var new_y = center.y-y;
	if (LevelMap.pack == 1 && new_y > LevelMap.positions.pack1.top) new_y = LevelMap.positions.pack1.top;
	else if (LevelMap.pack == 1 && new_y < LevelMap.positions.pack1.bottom) new_y = LevelMap.positions.pack1.bottom;
    else if (LevelMap.pack == 2 && new_y > LevelMap.positions.pack2.top) new_y = LevelMap.positions.pack2.top;
    else if (LevelMap.pack == 2 && new_y < LevelMap.positions.pack2.bottom) new_y = LevelMap.positions.pack2.bottom;
	this.main_spr.y = new_y;
};

LevelMap.prototype.changePack = function()
{
	LevelMap.pack = LevelMap.pack == 1 ? 2 : 1;
	LevelMap.changePack = true;
	showMap();
    LevelMap.changePack = false;
};

LevelMap.pack = 1;
LevelMap.area = null;
LevelMap.changePack = false;

LevelMap.show = function()
{
	if (!LevelMap.changePack)
	{
		if (UserSettings.stars.length == 60 &&
			UserSettings.getTotalStarsCount() >= 180 &&
			Level.newLevelOpened)
		{
			LevelMap.pack = 1;
		}
		else if (UserSettings.stars.length >= 60 &&
			UserSettings.getTotalStarsCount() >= 180)
		{
			LevelMap.pack = 2;
		}
		else LevelMap.pack = 1;
	}
    LevelMap.area = new LevelMap();
};