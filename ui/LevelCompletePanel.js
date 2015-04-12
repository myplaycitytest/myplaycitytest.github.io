function LevelCompletePanel()
{
    Utils.callSuperConstructor(LevelCompletePanel, this);

    this.x = center.x+30;
    this.y = center.y;

    this.level = Level.getAbsoluteNumber(LEVEL.pack_number, LEVEL.level_number);
    this.points = LEVEL.points;
    this.stars = LEVEL.stars;

    this.coins = LEVEL.coins || 0;

    this.set();
    this.setButtons();
    this.setStars();
}

Utils.extend(LevelCompletePanel, Panel);

LevelCompletePanel.prototype.set = function()
{
    var back = setSprite(this, "panel_2", 0, 0);
    var wafer = setSprite(this, "wafer_3", -6, 16);
    var title = setBitmapText(this, "font_greek_title_mip1", I18.getString("WIN_LEVEL_TITLE"), -10, -103, {align: 2});
    var girl = setSprite(this, "girl_2", 100, 0);
    var girl_cloud = setSprite(this, "girl_cloud_5", 87, 120);

    var level_text = setBitmapText(this, "font_greek_buttons_mip2", I18.getString("LEVEL")+" "+this.level, -10, -75, {align: 2});

    setBitmapText(this, "font_greek_brown_mip1", I18.getString("AWARD_WINDOW_TITLE"), -10, 5, {align: 2});
    setSprite(this, "coins_0", -20, 21);
    this.coins_text = setBitmapText(this, "font_greek_brown_mip2", 0, -2, 24, {align: BitmapText.ALIGN_LEFT});

    var my_score_text = setBitmapText(this, "font_greek_brown_mip2", I18.getString("LEVEL_SCORE_TITLE"),
        -5, -22, {align: BitmapText.ALIGN_RIGHT});
    this.points_text = setBitmapText(this, "font_greek_title_mip1", 0, 5, -20, {align: BitmapText.ALIGN_LEFT});
};

LevelCompletePanel.prototype.setButtons = function()
{
    var continue_btn = new Button(this, "btn_green_empty_2", -10, 92, Utils.proxy(function()
    {
        this.stopPointsAnimation();
        this.close(showMap);
        Level.levelCompletePanelShowAds();
    }, this));
    setBitmapText(continue_btn, "font_greek_buttons_mip1", I18.getString("CONTINUE"), 0, 2, {align: 2});

    var close_btn = new Button(this, "btn_close", 94, -110, Utils.proxy(function()
    {
        this.stopPointsAnimation();
        this.close(showMap);
        Level.levelCompletePanelShowAds();
    }, this));
};

LevelCompletePanel.prototype.setStars = function()
{
    var x0 = -50, y0 = -55, dX = 40;
    for (var i=0; i<3; i++)
    {
        if (i < this.stars)
        {
            var s = setSprite(this, null, x0+i*dX, y0, {w: 1, h: 1});
            var spr = setSprite(this, "star", x0+i*dX, y0);
            Effects.playParticle(s, "star_fire");
        }
        else setSprite(this, "star_back", x0+i*dX, y0);
    }
};

LevelCompletePanel.prototype.startPointsAnimation = function()
{
    var animated_points_cnt = 0;
    var animated_coins_cnt = 0;
    this.points_text.write(animated_points_cnt);
    this.coins_text.write(animated_coins_cnt);

    this.anim_interval = stage.setInterval(Utils.proxy(function()
    {
        animated_points_cnt += 50;
        this.points_text.write(animated_points_cnt);
        if (animated_points_cnt%1000 == 0)
        {
            animated_coins_cnt += 1;
            this.coins_text.write(animated_coins_cnt);
        }

        if (animated_points_cnt == this.points) stage.clearInterval(this.anim_interval);
    }, this), 1);
};

LevelCompletePanel.prototype.stopPointsAnimation = function()
{
    if (this.anim_interval)
    {
        stage.clearInterval(this.anim_interval);
        this.points_text.write(this.points);
        this.coins_text.write(this.coins);
    }
};

LevelCompletePanel.prototype.onShowEffectFinish = function()
{
    var spr = setSprite(this, null, 137, -71, {width: 10, height: 10});
    spr.scaleTo(0.6);
    Effects.playAnimation(spr, "circles");

    var spr = setSprite(this, null, 88, 118, {width: 10, height: 10});
    Effects.playParticle(spr, "light_stars");

    this.startPointsAnimation();
};