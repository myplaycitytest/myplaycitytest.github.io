function LevelExitPanel(ok_callback, close_callback)
{
    Utils.callSuperConstructor(LevelExitPanel, this, null, 1, 1);

    this.x = center.x;
    this.y = center.y;

	this.okCallback = ok_callback;
	this.closeCallback = close_callback;

    this.set();
    this.setButtons();
}

Utils.extend(LevelExitPanel, Panel);

LevelExitPanel.prototype.set = function()
{	
	setSprite(this, "panel_4", 0, 0);
	var title = setBitmapText(this, "font_greek_title_mip1", I18.getString("QUIT_LEVEL_TITLE"), 0, -75, {align: 2});
	var wafer = setSprite(this, "wafer_4", 1, -16);

	var mc = setSprite(this, "broken_heart_exit", -48, -17);
	setBitmapText(this, "font_greek_brown_mip2", I18.getString("QUIT_LEVEL"), 26, -17, {align: 2});
};

LevelExitPanel.prototype.setButtons = function()
{	
    var close_btn = new Button(this, "btn_close", 110, -90, Utils.proxy(function()
    {
        this.close(Utils.proxy(this.closeCallback, this));
    }, this));
    var ok_btn = new Button(this, "btn_check", -40, 60, Utils.proxy(function()
    {
    	this.close(Utils.proxy(this.okCallback, this));
    }, this));
    var cancel_btn = new Button(this, "btn_exit1", 40, 60, Utils.proxy(function()
    {
        this.close(Utils.proxy(this.closeCallback, this));
    }, this));
};

