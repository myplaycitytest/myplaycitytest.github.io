function ResetProgressPanel(close_callback)
{
    Utils.callSuperConstructor(ResetProgressPanel, this, null, 1, 1);

    this.x = center.x;
    this.y = center.y;

	this.closeCallback = close_callback;

    this.set();
    this.setButtons();
}

Utils.extend(ResetProgressPanel, Panel);

ResetProgressPanel.prototype.set = function()
{	
	setSprite(this, "panel_4", 0, 0);
	var title = setBitmapText(this, "font_greek_title_mip1", I18.getString("RESET_WINDOW_TITLE"), 0, -75, {align: 2});
	setBitmapText(this, "font_greek_brown_mip2", I18.getString("RESET_QUESTION_TEXT_0"), 0, -45, {align: 2});
	setBitmapText(this, "font_greek_brown_mip2", I18.getString("RESET_QUESTION_TEXT_1"), 0, -5, {align: 2, maxWidth: 150, valign: BitmapText.VALIGN_MIDDLE});
};

ResetProgressPanel.prototype.setButtons = function()
{	
    var ok_btn = new Button(this, "btn_check", -40, 60);
    ok_btn.onmousedown = Utils.proxy(this.startResetCountDown, this);
    ok_btn.onmouseup = Utils.proxy(this.stopResetCountDown, this);
    ok_btn.onmouseout = Utils.proxy(this.stopResetCountDown, this);
    var cancel_btn = new Button(this, "btn_exit1", 40, 60, Utils.proxy(function()
	{
		this.close(Utils.proxy(this.closeCallback, this));
	}, this));
};

ResetProgressPanel.prototype.startResetCountDown = function()
{	
	this.count_value = 2;
	this.count_text = setBitmapText(this, "font_greek_scores_mip1", this.count_value, 0, 20, {align: 2});

	this.resetInterval = stage.setInterval(Utils.proxy(function()
	{
		this.count_value--;
		this.count_text.write(this.count_value);
		if (this.count_value == 0)
		{
			this.stopResetCountDown();
			this.resetProgress();
		}
	}, this), pps);
};

ResetProgressPanel.prototype.stopResetCountDown = function()
{	
	if (this.resetInterval) stage.clearInterval(this.resetInterval);
	this.resetInterval = null;
	if (this.count_text) this.count_text.write("");
};

ResetProgressPanel.prototype.resetProgress = function()
{	
	UserSettings.reset();
	this.close(Utils.proxy(this.closeCallback, this));
};
