function LevelFailedPanel(buy_callback)
{
    Utils.callSuperConstructor(LevelFailedPanel, this);
    this.x = center.x+30;
    this.y = center.y;

    this.buyCallback = buy_callback;

    this.set();
    this.setTopPanel();
}

Utils.extend(LevelFailedPanel, Panel);

LevelFailedPanel.prototype.set = function()
{
    var l = LEVEL.level_limit.type;
    var num = Level.getAbsoluteNumber(LEVEL.pack_number, LEVEL.level_number);
    var mc;
    mc = setSprite(this, "panel_1", 0, 0);
    var wafer_1 = setSprite(this, "wafer_1", 0, -12);

    for (var i=0; i<LEVEL.level_targets.length; i++)
    {
        var target = LEVEL.level_targets[i];
        var spr = Utils.clone(target.spr.objects[0]);
        spr.static = false;
        if (spr.objects[0]) spr.addChild(spr.objects[0]);
        spr.x = -50+i*60;
        wafer_1.addChild(spr);
        spr.scaleTo(0.8);
        setBitmapText(wafer_1, "font_greek_brown_mip2", target.current_value+"/"+target.value, -20+i*60, -8, {align: 2});

        if (target.current_value < target.value) setSprite(spr, "cross_red", -5, -5);
        else setSprite(spr, "check_green", -5, -5);
    }

    mc = new Button(this, "btn_blue_long_empty", 0, 40, Utils.proxy(function()
    {
        this.close(Utils.proxy(this.giveUp, this));
        this.hideTopPanel();
    }, this));
    setBitmapText(mc, "font_greek_buttons_mip1", I18.getString("GIVE_UP"), 0, 2, {align: 2});

    mc = new Button(this, "btn_green_empty_2", 0, 92, Utils.proxy(function()
    {
        this.buyItem();
    }, this));
    setSprite(mc, "coins_0", 41, 0);
    setBitmapText(mc, "font_greek_buttons_mip1", I18.getString("PLAY")+" "+50, 30, 2, {align: BitmapText.ALIGN_RIGHT});
    var out = setSprite(mc, "out_"+l, -50, -5);
    setBitmapText(out, "font_greek_scores_chips_mip2", "+"+UserSettings.bonuses["level_end_"+l].value, -10, 10, {align: 2});

    setBitmapText(this, "font_greek_title_mip1", I18.getString(l == "moves" ? "NOMOVES_TITLE" : "NOTIME_TITLE"), 0, -102, {align: 2});
    setBitmapText(this, "font_greek_buttons_mip2", I18.getString("LEVEL")+" "+num, 0, -75, {align: 2});
    setBitmapText(this, "font_greek_brown_mip2", I18.getString("PROGRESS_LEVEL"), 0, -55, {align: 2});
};

LevelFailedPanel.prototype.buyItem = function()
{
    var name = "level_end_"+LEVEL.level_limit.type;
    if (UserSettings.buyItem(name))
    {
        this.coins_text.write(UserSettings.coins);
        LEVEL.level_limit.value += UserSettings.bonuses[name].value;
        this.hideTopPanel();
        this.close(Utils.proxy(this.buyCallback, this));
    }
    else return false;
};

LevelFailedPanel.prototype.giveUp = function()
{
    Level.showGiveUpProcess();
};

LevelFailedPanel.prototype.setTopPanel = function()
{
    this.top_panel = setSprite(stage, "panel_9", center.x+30, -24);
    setSprite(this.top_panel, "coins_0", -22, -8);
    this.coins_text = setBitmapText(this.top_panel, "font_greek_buttons_mip1", UserSettings.coins, 8, -5, {align: 2});
    this.top_panel.moveTo(center.x+30, 24, pps/2);
};

LevelFailedPanel.prototype.hideTopPanel = function()
{
    this.top_panel.moveTo(center.x+30, -24, pps/2, Easing.linear, function(e)
    {
        e.target.obj.destroy = true;
    });
};



