function StarsBuyPanel(close_callback)
{
    Utils.callSuperConstructor(StarsBuyPanel, this);
    this.x = center.x;
    this.y = center.y;
	this.closeCallback = close_callback;
    this.set();
	this.setButtons();
    this.setPacks();
}

Utils.extend(StarsBuyPanel, Panel);

StarsBuyPanel.prototype.set = function()
{
    var back = setSprite(this, "panel_1", 0, 0);
    var title = setBitmapText(this, "font_greek_title_mip1", I18.getString("WINDOW_SHOPPING_STARS_TITLE"), 0, -100, {align: 2});
};

StarsBuyPanel.prototype.setButtons = function()
{
    var close_btn = new Button(this, "btn_check", 6, 92, Utils.proxy(function()
	{
		this.close(Utils.proxy(this.closeCallback, this));
	}, this));
    var close_btn2 = new Button(this, "btn_close", 84, -112, Utils.proxy(function()
	{
		this.close(Utils.proxy(this.closeCallback, this));
	}, this));
};

StarsBuyPanel.prototype.setPacks = function()
{
	var y0 = -105, dY = 38;
	for (var i=1; i<5; i++)
	{
		var pack = UserSettings.starPacks["n"+i], btn;
	    setBitmapText(this, "font_greek_buttons_mip1", pack.stars, -52, y0+dY*i, {align: 1});
		var stars = setSprite(this, "stars_"+i, -30, y0+dY*i-5);
		stars.scaleTo(0.8);

		if (UserSettings.coins >= pack.coins)
		{
			btn = new Button(this, "btn_blue_empty", 25, y0+dY*i-4, Utils.proxy(function(e)
			{
				this.buyStars(e.target.pack);
			}, this));
		}
		else btn = setSprite(this, "btn_blue_empty_blocked", 25, y0+dY*i-4);
		btn.scaleTo(0.7);
		btn.pack = i;
		setBitmapText(btn, "font_greek_buttons", pack.coins, -20, 2, {align: 2});
		
		var coin = setSprite(btn, "coins_0", 20, 0);
		coin.scaleTo(1.4);
	}
};

StarsBuyPanel.prototype.buyStars = function(pack)
{
	if (UserSettings.buyStars(pack)) this.close(Utils.proxy(this.closeCallback, this));
	else return false;
};