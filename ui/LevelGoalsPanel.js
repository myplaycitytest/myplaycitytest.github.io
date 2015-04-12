function LevelGoals(pack_number, level_number, closeCallback)
{
    this.pack_number = pack_number;
    this.level_number = level_number;
    this.number = (pack_number-1)*60+level_number;

    this.closeCallback = closeCallback;
    this.targets = [];
    Utils.callSuperConstructor(LevelGoals, this, null, 1, 1);

    this.x = center.x;
    this.y = center.y;

    this.emitters = [];

    this.loadConfig();
}

Utils.extend(LevelGoals, Panel);

LevelGoals.prototype.config = null;
LevelGoals.prototype.close_btn = null;
LevelGoals.prototype.play_btn = null;
LevelGoals.prototype.stars = [];

LevelGoals.prototype.setUI = function()
{
    setSprite(this, "panel_2", 0, 0);
    setSprite(this, "wafer_1", -8, -12);
    var mc = setSprite(this, "girl_2", 118, 14);
    var mc = setSprite(this, "girl_cloud_5", 100, 110);

    setBitmapText(this, "font_greek_title_mip1", I18.getString("TARGETS_TITLE"), -5, -106, {align: 2});

    var level_text = setBitmapText(this, "font_greek_buttons_mip2",
                                    I18.getString("LEVEL")+" "+this.number,
                                    -5, -80, {align: 2});
    this.setGoalsText();
    this.setStars();
    this.setSpecialItem();
    this.setButtons();
};

LevelGoals.prototype.stopParticles = function()
{
    for (var i=0; i<this.emitters.length; i++) this.emitters[i].stopParticle();
};

LevelGoals.prototype.playParticles = function()
{
    for (var i=0; i<this.emitters.length; i++) this.emitters[i].playParticle();
};

LevelGoals.prototype.setButtons = function()
{
    var close_btn = new Button(this, "btn_close", 84, -112, Utils.proxy(function()
    {
        this.stopParticles();
        gameState == STATE_MAP ? this.close(Utils.proxy(this.closeCallback, this)) : showMap();
    }, this));
    var play_btn = new Button(this, "btn_green_empty", -5, 90, Utils.proxy(function()
    {
        this.close(Utils.proxy(function()
        {
            this.stopParticles();
            //if (this.closeCallback) this.closeCallback();
            this.loadLevel();
        }, this));
    }, this));
    setBitmapText(play_btn, "font_greek_buttons_mip1",I18.getString("PLAY"), 0, 2, {align: 2});
};

LevelGoals.prototype.onShowEffectFinish = function()
{
    var spr = setSprite(this, null, 155, -56, {width: 10, height: 10/*, fillColor: "green"*/});
    spr.scaleTo(0.6);
    Effects.playAnimation(spr, "circles");
    Effects.playParticle(spr, "staff");
    this.emitters.push(spr.emitter);

    var spr = setSprite(this, null, 103, 110, {width: 10, height: 10/*, fillColor: "green"*/});
    Effects.playParticle(spr, "light_stars");
    this.emitters.push(spr.emitter);
};

LevelGoals.prototype.setGoalsText = function()
{
    if (this.targets.length == 1) this.setGoalText(this.targets[0], 1);
    else
    {
        this.setGoalText(this.targets[0], 0);
        this.setGoalText(this.targets[1], 2);
    }
};

LevelGoals.prototype.setGoalText = function(target, num)
{
    var icon_x = -67, icon_y, text_x = -55, text_y, s, t, s_name, t_name,
        dY = -12;
    if (num == 0)
    {
        icon_y = -14+dY;
        text_y = -14+dY;
    }
    else if (num == 1)
    {
        icon_y = 0+dY;
        text_y = 0+dY;
    }
    else
    {
        icon_y = 10+dY;
        text_y = 10+dY;
    }

    if (target.type == "points")
    {
        t_name = "SCORE_TARGET";
    }
    if (target.type == "wall")
    {
        s_name = "s_wall";
        t_name = "WALLS_TARGET";
    }
    else if (target.type == "cell")
    {
        s_name = "wooden_cell";
        t_name = "TILES_TARGET";
    }
    else if (target.type == "falling")
    {
        s_name = "s_chip_down";
        t_name = "FALLING_TARGET";
    }
    else if (target.type == "chip_up")
    {
        s_name = "s_chip_up";
        t_name = "FALLING_TARGET";
    }
    else if (target.type == "strong_wall")
    {
        s_name = "s_strong_wall";
        t_name = "WALLS_TARGET";
    }

    if (target.type == "cell")
    {
        s = setSprite(this, s_name, icon_x, icon_y);
        setSprite(s, "green_cell", 4, 4);
    }
    else if (target.type != "points") s = AtlasSprite.set(this, s_name, icon_x, icon_y);

    t = setBitmapText(this, "font_greek_brown_mip2", I18.getString(t_name, target.value), text_x+5, text_y+2,
        {align: BitmapText.ALIGN_LEFT});
    if (s) s.scaleTo(0.7);
};

LevelGoals.prototype.setSpecialItem = function()
{
    var x0 = -52, dX = 44, y0 = 42, i = 0, k, name, bonus, item;
    for (k in UserSettings.bonuses)
    {
        bonus = UserSettings.bonuses[k];
        if (bonus.passive)
        {
            name = bonus.name;
            if (name == "moves" && this.config.LevelLimitType == 1) continue;
            else if (name == "time" && this.config.LevelLimitType == 0) continue;
            item = new BonusItem(name, x0+i*dX, y0);
            item.setOpenBonusItemBuyPanelCallback(Utils.proxy(this.freezePanel, this));
            item.setCloseBonusItemBuyPanelCallback(Utils.proxy(this.unFreezePanel, this));
            this.addChild(item);
            i++;
        }        
    }
};

LevelGoals.prototype.freezePanel = function()
{
    this.stopParticles();
    this.setStatic(true);
};

LevelGoals.prototype.unFreezePanel = function()
{
    this.setStatic(false);
    this.playParticles();
};

LevelGoals.prototype.setStars = function()
{
    var stars_cnt = UserSettings.stars[(this.pack_number-1)*60+this.level_number-1] || 0;
    var x0 = -50, y0 = -59, dX = 40;
    for (var i=0; i<3; i++)
    {
        if (i < stars_cnt)
        {
            var s = setSprite(this, null, x0+i*dX, y0, {w: 1, h: 1});
            var spr = setSprite(this, "star", x0+i*dX, y0);
            Effects.playParticle(s, "star_fire");
            this.emitters.push(s.emitter);
        }
        else setSprite(this, "star_back", x0+i*dX, y0);
    }
};

LevelGoals.prototype.getTargets = function()
{
    var trgts = ["wall", "cell", "falling", "points", "strong_wall", "chip_up"], type;
    if (this.config.LevelGoals[0] > 0)
    {
        type = trgts[this.config.LevelGoals[0]-1];
        this.targets.push({type: type,
                            value: this.getTargetValue(type)*1,
                            current_value: 0,
                            text: null,
                            spr: null});
    }
    if (this.config.LevelGoals[1] > 0)
    {
        type = trgts[this.config.LevelGoals[1]-1];
        this.targets.push({type: type,
                            value: this.getTargetValue(type)*1,
                            current_value: 0,
                            text: null,
                            spr: null});
    }
};

LevelGoals.prototype.getTargetValue = function(type)
{
    if (type == "wall") return _getElementsCount(this.config.Chips, "Wall", "DWall", "CWall");
    else if (type == "cell") return _getCellsCount(this.config.Grid.Cells);
    else if (type == "falling") return _getElementsCount(this.config.Chips, "Falling");
    else if (type == "chip_up") return _getElementsCount(this.config.Chips, "ChipUp");
    else if (type == "points") return this.config.stars[0];
    else if (type == "strong_wall") return _getElementsCount(this.config.Chips, "StrongWall");

    function _getElementsCount(arr)
    {
        var cnt = 0;
        for (var i= 0, len = arr.length; i<len; i++)
        {
            for (var j=1; j<arguments.length; j++)
            {
                var type = arguments[j];
                if (arr[i].Type.indexOf(type) == 0) cnt++;
            }
        }
        return cnt;
    }

    function _getCellsCount(arr, diference)
    {
        var cnt = 0;
        for (var i = 0; i < arr.length; i++)
        {
            if (diference && arr[i].Solidity == 3) return 1;
            else if (arr[i].Solidity > 1) cnt++;
        }
        return cnt;
    }
};

LevelGoals.prototype.loadConfig = function()
{
    Utils.get("data/levels/level"+this.pack_number+"_"+this.level_number+"p.json", null, "json", Utils.proxy(this.loadEnd, this));
    /*
    all_types = {};

    for (var p = 2; p>=1; p--)
    {
        for (var l=60; l>0; l--)
        {
            console.log("p = "+p+" l = "+l);
            (function(p, l) {
                Utils.get("data/levels/level" + p + "_" + l + "p.json", null, "json", Utils.proxy(function (e)
                {
                    var chips = e.Chips;
                    for (var n = 0; n < chips.length; n++)
                    {
                        if (!all_types[chips[n].Type]) all_types[chips[n].Type] = {pack: p, level: l};
                    }
                }, this));
            })(p, l);
        }
    }
    */
};

LevelGoals.prototype.loadLevel = function()
{
    Level.pack_number = this.pack_number;
    Level.level_number = this.level_number;
    Level.config = this.config;
    Level.targets = this.targets;

    showGame();
};

LevelGoals.prototype.loadEnd = function(e)
{
    this.config = e;
    this.getTargets();
    this.setUI();
};

LevelGoals.open = function(pack_number, level_number, closeCallback)
{
    var level_goals = new LevelGoals(pack_number, level_number, closeCallback);
};