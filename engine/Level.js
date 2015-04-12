var LEVEL = null;
function Level(p, l, c, t)
{
    this.state = Level.STATE_GAME;
    this.pack_number = p;
    this.level_number = l;
    this.absoluteNumber = Level.getAbsoluteNumber(this.pack_number, this.level_number);
    this.level_targets = t;
    this.game_field = null;
    this.config = c;
    this.stars = 0;
    this.points = 0;
    this.points_text = null;

    this.timer_interval = null;
    this.ai_mode = false;

    Level.newLevelOpened = false;
    Level.green_cell_present = false;
    this.set();
}

Level.prototype.set = function()
{
    this.loadConfig();
    this.setLevelUI();
    this.setGameField();
    this.setPanel();

    GameField.setActions0EndCallback(Utils.proxy(this.actions0EndHandler, this));
    GameField.setActions1EndCallback(Utils.proxy(this.actions1EndHandler, this));
    GameField.setActions2EndCallback(Utils.proxy(this.actions2EndHandler, this));
    GameField.setAddPointsCallback(Utils.proxy(this.addPoints, this));

    Level.lock();
    SoundUtils.playBack();
};

Level.prototype.freezeAllLevel = function()
{
    this.freezeAllPanels();
    this.freezeAllElements();
    this.freezeButtons();
};

Level.prototype.unFreezeAllLevel = function()
{
    this.unFreezeAllPanels();
    this.unFreezeAllElements();
    this.unFreezeButtons();
};

Level.prototype.freezeAllElements = function()
{
    this.game_field.main_spr.setStatic(true);
};

Level.prototype.unFreezeAllElements = function()
{
    this.game_field.main_spr.setStatic(false);
};

Level.prototype.freezeAllPanels = function()
{
    this.target_panel.setStatic(true);
    this.moves_panel.setStatic(true);
    this.points_panel.setStatic(true);
};

Level.prototype.freezeButtons = function()
{
    this.menu_btn.setStatic(true);
};

Level.prototype.unFreezeButtons = function()
{
    this.menu_btn.setStatic(false);
};

Level.prototype.unFreezeAllPanels = function()
{
    this.target_panel.setStatic(false);
    this.moves_panel.setStatic(false);
    this.points_panel.setStatic(false);
};

Level.prototype.loadConfig = function(callback)
{
    this.level_limit = {};
    this.level_limit.type = this.config.LevelLimitType == 1 ? "time" : "moves";
    this.level_limit.value = this.config.LevelLimit*1;
    this.level_limit.text = null;
};

Level.prototype.setLevelUI = function()
{
    var back = setSprite(stage, "game_back", center.x, center.y, {_static: true});
    this.menu_btn = new Button(stage, "btn_menu", 64, 285, Utils.proxy(this.showOptions, this));
    stage.needToRebuildBack = true;
};

Level.prototype.setPanel = function()
{
    this.setTargetPanel();
    this.setMovesPanel();
    this.setPointsPanel();
    this.setBonusItems();
};

Level.prototype.setTargetPanel = function()
{
    var target_panel_static = setSprite(stage, null, 64, 50, {width: 1, height: 1});
    this.target_panel = setSprite(stage, null, 64, 50, {width: 1, height: 1});
    var _setIcon = function(spr, type)
    {
        if (type == "wall") AtlasSprite.set(spr, "s_wall", 0, -10);
        else if (type == "cell")
        {
            var s = setSprite(spr, "wooden_cell", 0, -10);
            if (Level.green_cell_present) setSprite(s, "green_cell", 5, 5);
        }
        else if (type == "falling") AtlasSprite.set(spr, "s_chip_down", 0, -10);
        else if (type == "chip_up") AtlasSprite.set(spr, "s_chip_up", 0, -10);
        else if (type == "strong_wall") AtlasSprite.set(spr, "s_strong_wall", 0, -10);
    };

    if (this.level_targets.length == 1)
    {
        if (this.level_targets[0].type == "points")
        {
            this.level_targets[0].spr = setSprite(target_panel_static, "wafer_3", 4, 0);
            this.level_targets[0].text = setBitmapText(this.target_panel,
                            "font_greek_brown_mip2", "0/"+this.level_targets[0].value,
                            4, 2, {align: BitmapText.ALIGN_CENTER});
        }
        else
        {
            this.level_targets[0].spr = setSprite(target_panel_static, "wafer_2", 0, 0);
            _setIcon(this.level_targets[0].spr, this.level_targets[0].type);
            this.level_targets[0].text = setBitmapText(this.target_panel, "font_greek_brown_mip2", "0/"+this.level_targets[0].value, 0, 20, {align: 2});
        }
    }
    else
    {
        //1
        this.level_targets[0].spr = setSprite(target_panel_static, "wafer_2", -25, 0);
        this.level_targets[0].text = setBitmapText(this.target_panel, "font_greek_brown_mip2",
            "0/"+this.level_targets[0].value,-25, 20, {align: 2});
        _setIcon(this.level_targets[0].spr, this.level_targets[0].type);

        //2
        this.level_targets[1].spr = setSprite(target_panel_static, "wafer_2", 28, 0);
        this.level_targets[1].text = setBitmapText(this.target_panel, "font_greek_brown_mip2","0/"+this.level_targets[1].value, 28, 20, {align: 2});
        _setIcon(this.level_targets[1].spr, this.level_targets[1].type);
    }
    target_panel_static.setStatic(true);
};

Level.prototype.setMovesPanel = function()
{
    this.moves_panel = setSprite(stage, null, 64, 128, {width: 1, height: 1});
    var moves_panel_static = setSprite(stage, null, 64, 128, {width: 1, height: 1});
    setBitmapText(moves_panel_static, "font_greek_title_mip1", this.level_limit.type == "time" ? I18.getString("LIMIT_TITLE_TIME") :
        I18.getString("LIMIT_TITLE_MOVES"), 0, -15, {align: 2});

    this.level_limit.text = setBitmapText(this.moves_panel, "font_greek_buttons", "", 0, 15, {align: 2});
    moves_panel_static.setStatic(true);
};

Level.prototype.setPointsPanel = function()
{
    this.indicator = {};

    this.points_panel = setSprite(stage, null, 64, 208, {width: 1, height: 1});
    var points_panel_static = setSprite(stage, null, 64, 208, {width: 1, height: 1});
    setBitmapText(points_panel_static, "font_greek_title_mip1", I18.getString("TITLE_SCORE"), 0, -24, {align: 2});
    this.points_text = setBitmapText(this.points_panel, "font_greek_brown", this.points, 0, 0, {align: 2});

    this.indicator.line = setSprite(this.points_panel, "points_line", 3, 26);
    var stone_1 = setSprite(this.points_panel, "points_stone", 55, 27);

    this.indicator["left"] = setSprite(this.points_panel, null, -45, 26, {/*fillColor: "green",*/
                                                                width: 1, height: 25});
    this.indicator["right"] = setSprite(this.indicator["left"], null, 0, 0, {/*fillColor: "white",*/
                                                                width: 1, height: 25});

    this.indicator.arrow1 = setSprite(this.indicator["left"], "scale_arrow", 30, -5);
    this.indicator.arrow1.star = setSprite(this.indicator.arrow1, "star", 1, -12, {scaleX: 0.4, scaleY: 0.4, visible: false});

    this.indicator.arrow2 = setSprite(this.indicator["left"], "scale_arrow", 60, -5);
    this.indicator.arrow2.star = setSprite(this.indicator.arrow2, "star", 1, -12, {scaleX: 0.4, scaleY: 0.4, visible: false});

    this.indicator.arrow3 = setSprite(this.indicator["left"], "scale_arrow", 90, -5);
    this.indicator.arrow3.star = setSprite(this.indicator.arrow3, "star", 1, -12, {scaleX: 0.4, scaleY: 0.4, visible: false});

    this.points_token = setTilesSprite(this.indicator["right"], "white_fire", -7, 0, {_frames: 20});

    this.indicator.line.width = this.indicator["right"].x+3;
    this.indicator.line.x = this.indicator["left"].x-3+this.indicator.line.width/2;

    points_panel_static.setStatic(true);
};

Level.prototype.setBonusItems = function()
{
	var x0 = 460, y0 = 55, dY = 52, i = 0, name, item, k, bonus;
    for (k in UserSettings.bonuses)
    {
       	bonus = UserSettings.bonuses[k];
        if (bonus.active)
        {
            name = bonus.name;
            item = new BonusItem(name, x0, y0+i*dY, Utils.proxy(this.useBonus, this));
            item.setOpenBonusItemBuyPanelCallback(Utils.proxy(this.freezeAllLevel, this));
            item.setCloseBonusItemBuyPanelCallback(Utils.proxy(this.unFreezeAllLevel, this));
            stage.addChild(item);
            item.setStatic(true);
            i++;
        }
    }
};

Level.prototype.addPoints = function(n)
{
    this.points += n;
    this.points_text.write(this.points);
    this.targetDone("points", n);
    this.movePointsLine();
};

Level.prototype.movePointsLine = function()
{
    var star_points_3 = this.config.stars[2]*1,
    	star_points_2 = this.config.stars[1]*1,
    	star_points_1 = this.config.stars[0]*1,
		newX = 0, dP;

    if (this.points <= star_points_1)
    {
        dP = this.points;
        newX = this.indicator.arrow1.x/star_points_1*dP;
    }
    else if (this.points > star_points_1 && this.points <= star_points_2)
    {
        dP = this.points-star_points_1;
        newX = (this.indicator.arrow2.x-this.indicator.arrow1.x)/(star_points_2-star_points_1)*dP+this.indicator.arrow1.x;
    }
    else if (this.points > star_points_2 && this.points <= star_points_3)
    {
        dP = this.points-star_points_2;
        newX = (this.indicator.arrow3.x-this.indicator.arrow2.x)/(star_points_3-star_points_2)*dP+this.indicator.arrow2.x;
    }
    else if (this.points > star_points_3)
    {
        newX = this.indicator.arrow3.x;
    }

    this.indicator["right"].addTween("x", newX, pps/2, Easing.linear, Utils.proxy(this.animatePointsPanel, this),
    Utils.proxy(this.animatePointsPanel, this)).play();

    this.indicator.line.addTween("width", newX+3, pps/2).play();
    this.indicator.line.addTween("x", this.indicator["left"].x+newX/2, pps/2).play();
};

Level.prototype.animatePointsPanel = function()
{
    if (this.indicator["right"].x >= this.indicator.arrow1.x && !this.indicator.arrow1.star.visible)
    {
        this.indicator.arrow1.star.visible = true;
    }
    else if (this.indicator["right"].x >= this.indicator.arrow2.x && !this.indicator.arrow2.star.visible)
    {
        this.indicator.arrow2.star.visible = true;
    }
    else if (this.indicator["right"].x >= this.indicator.arrow3.x && !this.indicator.arrow3.star.visible)
    {
        this.indicator.arrow3.star.visible = true;
    }
};

Level.prototype.targetDone = function(type, value)
{
    if (typeof value === "undefined") var value = 1;
    for (var i=0; i<this.level_targets.length; i++)
    {
        if (type == this.level_targets[i].type)
        {
            this.level_targets[i].current_value += value;
            this.level_targets[i].text.write(this.level_targets[i].current_value+"/"+this.level_targets[i].value);
        }
    }
};

Level.prototype.convertTimer = function(seconds)
{
    var min = Math.floor(seconds/60) < 10 ? "0"+Math.floor(seconds/60) : Math.floor(seconds/60)+"";
    var sec = seconds%60 < 10 ? "0"+seconds%60 : seconds%60;
    return min+":"+sec;
};

Level.prototype.startTick = function()
{
    this.timer_interval = stage.setInterval(Utils.proxy(function()
    {
        this.takeLevelTime(1);
    }, this), pps*1.5);
};

Level.prototype.addLevelTime = function(v)
{
    this.level_limit.value += v;
    this.level_limit.text.write(this.convertTimer(this.level_limit.value));
};

Level.prototype.takeLevelTime = function(v)
{
    if (this.level_limit.value == 0 && !this.ai_mode)
    {
        stage.clearInterval(this.timer_interval);
        this.timer_interval = null;
        this.startGameOverProcess();
        return;
    }

    this.level_limit.value -= v;
    this.level_limit.text.write(this.convertTimer(this.level_limit.value));
};

Level.prototype.pauseTimer = function()
{
	if (this.timer_interval) this.timer_interval.pause();
};

Level.prototype.resumeTimer = function()
{
	if (this.timer_interval) this.timer_interval.resume();
};

Level.prototype.addLevelMoves = function(v)
{
    this.level_limit.value += v;
    this.level_limit.text.write(this.level_limit.value);
};

Level.prototype.takeLevelMoves = function(v)
{
    if (this.level_limit.value == 0) return;
    if (this.bomb_bonus_mode) return;
    this.level_limit.value-=v;
    this.level_limit.text.write(this.level_limit.value);
    if (this.level_limit.value > 0 && this.level_limit.value <= 5 && !this.ai_mode) Level.showCountdownAnimation(this.level_limit.value);
};

Level.showCountdownAnimation = function(val)
{
    SoundUtils.playEffect("show_limit");

    var s = setSprite(stage, "countdown", center.x+50, center.y-20, {opacity: 0});
    s.scaleTo(0.5);

    s.gotoAndStop(val-1);
    s.fadeTo(1, pps/2);
    s.scaleTo(1, pps/2, Easing.linear, function()
    {
        s.fadeTo(0, pps/2);
        s.scaleTo(0.5, pps/2, Easing.linear, function(e)
        {
            e.target.destroy = true;
        });
    });
};

Level.prototype.actions0EndHandler = function()
{
    if (this.level_limit.type == "time" && !this.timer_interval) this.startTick();
    Level.lock();
};

Level.prototype.actions1EndHandler = function()
{
    if (this.ai_mode)
    {
        if (this.level_limit.type == "moves" && this.level_limit.value > 0) this.takeLevelMoves(1);
        else if (this.level_limit.type == "time" && this.level_limit.value >= 5) this.takeLevelTime(5);
        else if (this.level_limit.type == "time" && this.level_limit.value > 0) this.takeLevelTime(this.level_limit.value);
    }
    else if (this.level_limit.type == "moves") this.takeLevelMoves(1);
};

Level.prototype.actions2EndHandler = function()
{
    if (this.ai_mode)
    {
        if (this.level_limit.value > 0) this.game_field.stepAIMode();
        else this.endAIMode();
    }
    else if (this.bomb_bonus_mode) this.explodeAllWaves();
    else
    {
        this.freezeAllElements();
        if (this.pack_number == 1 && this.level_number < 5)
        {
            if (this.level_limit.value == 0)
            {
                if (this.checkForWin()) this.startLevelCompleteProcess();
                else this.startGameOverProcess();
            }
            else Level.unLock();
        }
        else if (this.checkForWin()) this.startLevelCompleteProcess();
        else if (this.level_limit.value == 0) this.startGameOverProcess();
        else Level.unLock();
    }
    this.checkStepEndTutorial();
};

Level.prototype.setGameField = function()
{
    this.game_field = new GameField(this.config);
};

Level.prototype.checkForWin = function()
{
    for (var i=0; i<this.level_targets.length; i++)
    {
        if (this.level_targets[i].current_value < this.level_targets[i].value) return false;
    }
    return true;
};

Level.prototype.startLevelCompleteProcess = function()
{
    if (this.state == Level.STATE_PRE_GAME_OVER ||
        this.state == Level.STATE_PRE_LEVEL_COMPLETE) return;

    Level.lock();
    if (this.timer_interval) stage.clearInterval(this.timer_interval);
    this.showPreLevelCompleteAnimation();
};

Level.prototype.showPreLevelCompleteAnimation = function()
{
    this.freezeAllLevel();
    this.state = Level.STATE_PRE_LEVEL_COMPLETE;

    var x = center.x+30;
    var y = center.y-10;

    var cloud_4 = setSprite(stage, "girl_cloud_4", x-200, y-30, {opacity: 0});
    var cloud_3 = setSprite(stage, "girl_cloud_3", x+200, y-30, {opacity: 0});
    var girl = setSprite(stage, "girl_5", x, y-30, {opacity: 0});
    girl.scaleTo(0.5);
    var cloud_2 =  setSprite(stage, "girl_cloud_2", x, y+160, {opacity: 0});
    var t = setSprite(cloud_2, "level_complete", 0, 0, {opacity: 0});
    t.scaleTo(0.64);

    girl.fadeTo(1, pps/2);
    girl.scaleTo(1, pps/2);
    cloud_4.fadeTo(1, pps/2);
    cloud_4.moveTo(x-100, y-30, pps/2);
    cloud_3.fadeTo(1, pps/2);
    cloud_3.moveTo(x+100, y-30, pps/2);
    cloud_2.fadeTo(1, pps/2);
    cloud_2.moveTo(x, y+60, pps/2);
    t.fadeTo(1, pps/2, Easing.linear, Utils.proxy(function()
    {
        stage.setTimeout(Utils.proxy(function()
        {
            girl.fadeTo(0, pps/2);
            girl.scaleTo(0.5, pps/2);
            cloud_4.fadeTo(0, pps/2);
            cloud_4.moveTo(x-200, y-30, pps/2);
            cloud_3.fadeTo(0, pps/2);
            cloud_3.moveTo(x+200, y-30, pps/2);
            cloud_2.fadeTo(0, pps/2);
            cloud_2.moveTo(x, y+160, pps/2, Easing.linear, Utils.proxy(function()
            {
                cloud_4.destroy = true;
                cloud_3.destroy = true;
                cloud_2.destroy = true;
                girl.destroy = true;
                this.endPreLevelCompleteAnimation();
            }, this));
        }, this), pps);
    }, this));
};

Level.prototype.endPreLevelCompleteAnimation = function()
{
    this.unFreezeAllLevel();
    this.state = Level.STATE_GAME;
    this.ai_mode = true;
    this.game_field.ai_mode = true;
    if (this.level_limit.value > 0) this.startAIMode();
    else this.explodeAllWaves(Utils.proxy(this.showLevelComplete, this));
};

Level.prototype.startAIMode = function()
{
    this.game_field.removeClickElementsListeners();
    this.doAIStep();
};

Level.prototype.doAIStep = function()
{
    this.game_field.stepAIMode();
};

Level.prototype.endAIMode = function()
{
    this.explodeAllWaves(Utils.proxy(this.showLevelComplete, this));
};

Level.prototype.explodeAllWaves = function(callback)
{
    this.game_field.explodeAllWaves(callback);
};

Level.prototype.showPreLevelPopup = function(bonus_val)
{
    this.freezeAllLevel();
    Level.lock();

    var p = setSprite(stage, "panel_5", center.x+50, center.y+5, {opacity: 0}), t;
    if (this.config.LevelLimitType) //time
    {
        setBitmapText(p, "font_greek_title_mip2", I18.getString("LIMIT_TITLE_TIME") , 0, -15, {align: 2});
        setSprite(p, "out_time", -32, -5);
        t = setBitmapText(stage, "font_greek_buttons", this.convertTimer(bonus_val ? bonus_val : this.level_limit.value), p.x, p.y+2, {opacity: 0,align: 2});
    }
    else
    {
        setBitmapText(p, "font_greek_title_mip2", I18.getString("LIMIT_TITLE_MOVES") , 0, -15, {align: 2});
        setSprite(p, "out_moves", -32, -5);
        t = setBitmapText(stage, "font_greek_buttons", bonus_val ? bonus_val : this.level_limit.value, p.x, p.y+2, {opacity: 0, align: 2});
    }

    t.fadeTo(1, pps/3);
    p.scaleTo(1, pps/3);
    p.fadeTo(1, pps/3);

    stage.setTimeout(Utils.proxy(function()
    {
        t.moveTo(64, 140, pps/2, Easing.linear, Utils.proxy(function(e)
        {
            e.target.obj.write("");
            this.endPreLevelPopup(p, bonus_val);
            return false;
        }, this));
    }, this), pps);
};

Level.prototype.endPreLevelPopup = function(p, bonus_val)
{
    this.unFreezeAllLevel();
    if (this.level_limit.type == "time") this.addLevelTime(bonus_val ? bonus_val : 0);
    else this.addLevelMoves(bonus_val ? bonus_val : 0);
    p.fadeTo(0, pps/3);
    p.scaleTo(0.5, pps/3, Easing.linear, Utils.proxy(function()
    {
        p.destroy = true;
        this.useBonuses();
    }, this));
};

Level.prototype.useBonuses = function()
{
    for (var k in UserSettings.bonuses)
    {
    	var bonus = UserSettings.bonuses[k];
    	if (bonus.passive && bonus.enable) 
    	{
    		if (bonus.name == "moves" && this.config.LevelLimitType == 1) continue;
            else if (bonus.name == "time" && this.config.LevelLimitType == 0) continue;    		
    		BonusItem.use(bonus.name, Utils.proxy(function()
    		{    			
    			this.useBonus(bonus.name);
    		}, this));
    		return;
    	}
    }        
    this.endUseBonuses();
};

Level.prototype.endUseBonuses = function()
{
    Level.unLock();
    this.ai_mode = false;
    this.game_field.ai_mode = false;
    this.checkStartLevelTutorial();
};

Level.prototype.useBonus = function(type)
{
	if (type == "moves") this.showPreLevelPopup(UserSettings.bonuses[type].value);
	else if (type == "time") this.showPreLevelPopup(UserSettings.bonuses[type].value);
	else if (type == "color") this.game_field.doColorBonus(Utils.proxy(this.useBonuses, this));
	else if (type == "boom") this.game_field.doBoomBonus(Utils.proxy(this.useBonuses, this));
	else if (type == "bomb") this.game_field.doBombBonus();
	else if (type == "knife") this.game_field.doKnifeBonus();
	else if (type == "fire") this.game_field.doFireBonus();
	else if (type == "storm") this.game_field.doStormBonus();
	else if (type == "dragon") this.game_field.doDragonBonus();
};

Level.prototype.showOptions = function()
{
    this.freezeAllLevel();
    OptionsPanel.open("game", Utils.proxy(this.unFreezeAllLevel, this));
};

Level.newLevelOpened = false;

Level.prototype.showLevelComplete = function()
{
    SoundUtils.playEffect("level_complete");
    this.saveLevelProgress();
    this.showLevelCompletePanel();
    Level.unLock();
};

Level.prototype.saveLevelProgress = function()
{
    UserSettings.points += this.points;
    var stars_arr = this.config.stars;
    for (var i=0; i<stars_arr.length; i++)
    {
        if (this.points >= stars_arr[i]) this.stars = i+1;
    }

    var num = this.absoluteNumber;

    if (!UserSettings.stars[num-1] && this.absoluteNumber <= 120) Level.newLevelOpened = true;
    if (!UserSettings.stars[num-1] || this.stars > UserSettings.stars[num-1]) UserSettings.stars[num-1] = this.stars;
    this.coins = Math.floor(this.points/1000);
    UserSettings.coins += this.coins;
    UserSettings.save();

    if (this.absoluteNumber == 6) UserSettings.setBonusAvailable("knife");
    else if (this.absoluteNumber == 12) UserSettings.setBonusAvailable("moves");
    else if (this.absoluteNumber == 18) UserSettings.setBonusAvailable("bomb");
    else if (this.absoluteNumber == 23) UserSettings.setBonusAvailable("color");
    else if (this.absoluteNumber == 26) UserSettings.setBonusAvailable("fire");
    else if (this.absoluteNumber == 30) UserSettings.setBonusAvailable("boom");
    else if (this.absoluteNumber == 34) UserSettings.setBonusAvailable("storm");
    else if (this.absoluteNumber == 42) UserSettings.setBonusAvailable("dragon");
};

Level.prototype.showLevelCompletePanel = function()
{
    this.freezeAllLevel();
    var p = new LevelCompletePanel();
};

Level.prototype.startGameOverProcess = function()
{
    if (this.state == Level.STATE_PRE_GAME_OVER ||
        this.state == Level.STATE_PRE_LEVEL_COMPLETE) return;

    Level.lock();
    this.showPreGameOverAnimation();
};

Level.prototype.showPreGameOverAnimation = function()
{
    this.freezeAllLevel();
    this.state = Level.STATE_PRE_GAME_OVER;

    var x = center.x;
    var y = center.y;

    var girl = setSprite(stage, "girl_5", x+30, y-30-20, {opacity: 0});
    girl.scaleTo(0.5);
    var cloud_1 =  setSprite(stage, "girl_cloud_2", x+30, y+60+100-20, {opacity: 0});
    var t = setSprite(cloud_1, this.level_limit.type == "moves" ? "no_more_moves" : "time_up", 0, 0, {opacity: 0});
    t.scaleTo(0.64);
    girl.fadeTo(1, pps/2);
    girl.scaleTo(1, pps/2);
    cloud_1.fadeTo(1, pps/2);
    cloud_1.moveTo(x+30, y+60-20, pps/2);
    t.fadeTo(1, pps/2, Easing.linear, Utils.proxy(function()
    {
        stage.setTimeout(Utils.proxy(function()
        {
            girl.fadeTo(0, pps/2);
            girl.scaleTo(0.5, pps/2);
            cloud_1.fadeTo(0, pps/2);
            cloud_1.moveTo(x+30, y+60+100-20, pps/2, Easing.linear, Utils.proxy(function()
            {
                cloud_1.destroy = true;
                girl.destroy = true;
                this.endPreGameOverAnimation();
            }, this));
        }, this), pps);
    }, this));

    if (this.level_limit.type == "moves") SoundUtils.playEffect("no_more_moves");
    else SoundUtils.playEffect("time_is_up");
};

Level.prototype.endPreGameOverAnimation = function()
{
    this.unFreezeAllLevel();
    this.state = Level.STATE_GAME;
    this.showLevelFailedPanel();
    Level.unLock();
};

Level.prototype.showLevelFailedPanel = function()
{
    this.freezeAllLevel();
    this.state = Level.STATE_GAME_OVER;
    var p = new LevelFailedPanel(Utils.proxy(function()
    {
        this.unFreezeAllLevel();
        this.showPreLevelPopup();
    }, this));
};

Level.load = function()
{
    LEVEL = new Level(Level.pack_number, Level.level_number, Level.config, Level.targets);
};

Level.showShufflePopup = function(callback)
{
    LEVEL.unFreezeAllElements();
    Level.lock();

    SoundUtils.playEffect("no_possible_moves");

    var x = center.x;
    var y = center.y;

    var spr = setSprite(stage, null, x, y, {opacity: 0});
    spr.scaleTo(0.3);
    var g = setSprite(spr, "girl_4", 28, -44);
    var c = setSprite(spr, "girl_cloud_1", 22, 41);
    spr.scaleTo(1, pps, Easing.cubic.easeIn);
    spr.fadeTo(1, pps);

    var t = setSprite(stage, "no_possible_moves", center.x+22, center.y+100, {opacity: 0});
    t.scaleTo(0.6);
    t.moveTo(center.x+22, center.y+50, pps, Easing.cubic.easeIn);
    t.fadeTo(1, pps);

    stage.setTimeout(function()
    {
        spr.scaleTo(0, pps);
        spr.fadeTo(0, pps, Easing.cubic.easeOut, function(e)
        {
            e.target.obj.destroy = true;
            return false;
        });

        t.moveTo(center.x+22, center.y+100, pps*0.5);
        t.fadeTo(0, pps, Easing.cubic.easeOut, function(e)
        {
            e.target.obj.destroy = true;
            if (callback) callback();
            return false;
        });
    }, pps*1.5);
};

Level.showGiveUpProcess = function()
{
    LEVEL.freezeAllLevel();
    Level.lock();

    SoundUtils.playEffect("level_failed");

    var x = center.x+20;
    var y = center.y-10;

    var girl = setSprite(stage, "girl_5", x, y-30, {opacity: 0});
    girl.scaleTo(0.5);
    var cloud_1 =  setSprite(stage, "girl_cloud_2", x, y+160, {opacity: 0});
    var t = setSprite(cloud_1, "level_failed", 0, 0, {opacity: 0});
    t.scaleTo(0.64);
    girl.fadeTo(1, pps/2);
    girl.scaleTo(1, pps/2);
    cloud_1.fadeTo(1, pps/2);
    cloud_1.moveTo(x, y+60, pps/2);
    t.fadeTo(1, pps/2, Easing.linear, Utils.proxy(function()
    {
        stage.setTimeout(Utils.proxy(function()
        {
            girl.fadeTo(0, pps/2);
            girl.scaleTo(0.5, pps/2);
            cloud_1.fadeTo(0, pps/2);
            cloud_1.moveTo(x, y+160, pps/2, Easing.linear, Utils.proxy(function()
            {
                cloud_1.destroy = true;
                girl.destroy = true;
                LEVEL.unFreezeAllLevel();
                LEVEL.showGameOverPanel();
            }, LEVEL));
        }, LEVEL), pps);
    }, LEVEL));
};

Level.prototype.showGameOverPanel = function()
{
    this.freezeAllLevel();
    var p = new LevelGameOverPanel();
    Level.unLock();
};

Level.prototype.showLevelGoals = function(p, l, replay)
{
    this.freezeAllLevel();
    LevelGoals.open(p, l, Utils.proxy(this.unFreezeAllLevel, this));
};

Level.levelCompletePanelShowAds = function()
{
    ExternalAPI.showAds();
};

Level.showMenuWindow = function()
{
    showMap();
};

Level.prototype.replayLevel = function()
{
    ExternalAPI.showAds();
    this.showLevelGoals(Level.pack_number, Level.level_number, true);
};

Level.getAbsoluteNumber = function(pack, level)
{
    return (pack-1)*60+level;
};

Level.pack_number = 0;
Level.level_number = 0;
Level.config = {};
Level.targets = [];

Level.lockSprite = null;

Level.lock = function()
{
    if (LEVEL && LEVEL.state == Level.STATE_BONUS_MODE) LEVEL.pauseTimer();
    if (Level.lockSprite) Level.lockSprite.destroy = true;
    Level.lockSprite = setSprite(stage, null, center.x, center.y, {width: center.x*2, height: center.y*2/*, opacity: 0.4, fillColor: "red"*/});
    Level.lockSprite.preventAllEvents();
};

Level.unLock = function()
{
    if (LEVEL && LEVEL.state == Level.STATE_BONUS_MODE)
    {
        LEVEL.resumeTimer();
        LEVEL.state = Level.STATE_GAME;
    }
    if (Level.lockSprite)
    {
        Level.lockSprite.removeAllEventListeners();
        Level.lockSprite.destroy = true;
        Level.lockSprite = null;
    }
};

Level.prototype.checkStartLevelTutorial = function()
{
    if (this.absoluteNumber == 1) this.showTutorial("1_1");
    else if (this.absoluteNumber == 2) this.showTutorial("2_1");
    else if (this.absoluteNumber == 3) this.showTutorial("3_1");
    else if (this.absoluteNumber == 4) this.showTutorial("4_1");
    else if (this.absoluteNumber == 5) this.showTutorial("5_1");
    else if (this.absoluteNumber == 10) this.showTutorial("10_1");
    else if (this.absoluteNumber == 15) this.showTutorial("15_1");
    else if (this.absoluteNumber == 21) this.showTutorial("21_1");
    else if (this.absoluteNumber == 30) this.showTutorial("30_1");
    else if (this.absoluteNumber == 54) this.showTutorial("54_1");
};

Level.prototype.checkStepEndTutorial = function()
{
    if (this.absoluteNumber == 1) this.showTutorial("1_2");
    else if (this.absoluteNumber == 2 && !UserSettings.tutorials.isPresentValue("2_2")) this.showTutorial("2_2");
    else if (this.absoluteNumber == 2 && !UserSettings.tutorials.isPresentValue("2_3")) this.showTutorial("2_3");
    else if (this.absoluteNumber == 5 && !UserSettings.tutorials.isPresentValue("5_2")) this.showTutorial("5_2");
};

Level.prototype.showTutorial = function(num)
{
    if (UserSettings.tutorials.isPresentValue(num)) return;
    UserSettings.tutorials.push(num);
    UserSettings.save();

    Level.lock();

    this.freezeAllLevel();
    var p = new Tutorial(num, Utils.proxy(function()
    {
        this.unFreezeAllLevel();
        Level.unLock();
    }, this));
};

Level.STATE_GAME = 1;
Level.STATE_AI_MODE = 2;
Level.STATE_BONUS_MODE = 3;
Level.STATE_PRE_GAME_OVER = 4;
Level.STATE_PRE_LEVEL_COMPLETE = 5;
Level.STATE_GAME_OVER = 6;
Level.STATE_LEVEL_COMPLETE = 7;