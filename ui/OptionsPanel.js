function OptionsPanel(t, close_callback)
{
    Utils.callSuperConstructor(OptionsPanel, this);

    this.x = center.x;
    this.y = center.y;
    this.closeCallback = close_callback;

    this.set();
    if (t == "menu") this.setMenuButtons();
    else if (t == "map") this.setMapButtons();
    else if (t == "game") this.setGameButtons();
}

Utils.extend(OptionsPanel, Panel);

OptionsPanel.prototype.set = function()
{
    var p = setSprite(this, "panel_1", 0, 0);
    setBitmapText(p, "font_greek_title_mip1", I18.getString("OPTIONS_TITLE"), 0, -102, {align: 2});
    var close_btn = new Button(this, "btn_close", 84, -112, Utils.proxy(function()
    {
    	this.close(Utils.proxy(this.closeCallback, this));
	}, this));

    var music_btn = new Button(p, "btn_green_empty", -35, -60, SoundUtils.switchSoundBtn);
    music_btn.unblock = true;
    SoundUtils.soundBtn = music_btn;
    SoundUtils.setSoundBtn();

    var effect_btn = new Button(p, "btn_green_empty", 35, -60, SoundUtils.switchEffectBtn);
    effect_btn.unblock = true;
    SoundUtils.effectBtn = effect_btn;
    SoundUtils.setEffectBtn();
};

OptionsPanel.prototype.setMenuButtons = function()
{
    var reset_btn = new Button(this, "btn_reset", 0, 10, Utils.proxy(this.resetProgress, this));
    var check_btn = new Button(this, "btn_check", 0, 92, Utils.proxy(function()
    {
        this.close(Utils.proxy(this.closeCallback, this));
    }, this));
};

OptionsPanel.prototype.setMapButtons = function()
{
    var main_menu_btn = new Button(this, "btn_blue_long_empty", 0, -15, Utils.proxy(function(){
        this.close(showMenu);
    }, this));
    setBitmapText(main_menu_btn, "font_greek_buttons_mip2", I18.getString("OUT_MAIN_MENU"), 0, 2, {align: 2});

    var tutorial_btn = new Button(this, "btn_ask", 0, 32, Utils.proxy(this.openTutorial, this));
    //var info_btn = new Button(this, "btn_info", 32, 30, Utils.proxy(this.openInfo, this));
    var check_btn = new Button(this, "btn_check", 0, 92, Utils.proxy(function()
    {
        this.close(Utils.proxy(this.closeCallback, this));
    }, this));
};

OptionsPanel.prototype.setGameButtons = function()
{
    var tutorial_btn = new Button(this, "btn_ask", 0, -12, Utils.proxy(this.openTutorial, this));
    var map_btn = new Button(this, "btn_blue_long_empty", 0, 38, Utils.proxy(this.openExitLevelPanel, this));
    setBitmapText(map_btn, "font_greek_buttons_mip2", I18.getString("BACK_TO_MAP"), 0, 2, {align: 2});

    var play_btn = new Button(this, "btn_green_empty_2", 0, 90, Utils.proxy(function()
    {
    	this.close(this.closeCallback ? Utils.proxy(this.closeCallback, this) : false);	
	}, this));
    setBitmapText(play_btn, "font_greek_buttons_mip1", I18.getString("PLAY"), 0, 0, {align: 2});
};

OptionsPanel.prototype.openExitLevelPanel = function()
{
    this.freezePanel();
	var p = new LevelExitPanel(Utils.proxy(function()
	{
        this.unFreezePanel();
		this.close(showMap);
	}, this), Utils.proxy(this.unFreezePanel, this));
};

OptionsPanel.prototype.openTutorial = function()
{
    this.freezePanel();
    TutorialPanel.area = new TutorialPanel(Utils.proxy(this.unFreezePanel, this));
};

OptionsPanel.prototype.resetProgress = function()
{
    this.freezePanel();
    var p = new ResetProgressPanel(Utils.proxy(this.unFreezePanel, this));
};

OptionsPanel.open = function(t, close_callback)
{
    //t - menu, map , game
    var p = new OptionsPanel(t, close_callback);
};