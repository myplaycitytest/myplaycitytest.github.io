function LevelGameOverPanel(level)
{
    //var level = LEVEL;
    Utils.callSuperConstructor(LevelGameOverPanel, this, null, 1, 1);
    this.x = center.x+30;
    this.y = center.y;

    this.set();
}

Utils.extend(LevelGameOverPanel, Panel);

LevelGameOverPanel.prototype.set = function()
{
    var num = Level.getAbsoluteNumber(LEVEL.pack_number, LEVEL.level_number);
    var mc;
    mc = setSprite(this, "panel_2", 0, 0);
    mc = setSprite(this, "wafer_1", -9, 20);
    setBitmapText(mc, "font_greek_brown_mip2", I18.getString("END_MOVES"), 0, -12, {align: 2, maxWidth: 150});
    setBitmapText(mc, "font_greek_brown_mip2", I18.getString("FAIL_SCORE", LEVEL.points), 0, 14, {align: 2, maxWidth: 150});

    mc = setSprite(this, "broken_heart_exit", -5, -47);

    setBitmapText(this, "font_greek_title_mip1", I18.getString("WINDOW_END_GAMES_TITLE"), -10, -102, {align: 2});
    setBitmapText(this, "font_greek_buttons_mip2", I18.getString("LEVEL")+" "+LEVEL.absoluteNumber, -10, -75, {align: 2});

    var close_btn = new Button(this, "btn_close", 94, -110, Utils.proxy(function()
    {
        this.close(showMap);
    }, this));
    var replay_level_btn = new Button(this, "btn_green_empty_2", -7, 92, Utils.proxy(function()
    {
        this.close(Utils.proxy(LEVEL.replayLevel, LEVEL));
    }, this));
    setBitmapText(replay_level_btn, "font_greek_buttons_mip1", I18.getString("LEVEL_REPLAY"), 0, 2, {align: BitmapText.ALIGN_CENTER});
};

