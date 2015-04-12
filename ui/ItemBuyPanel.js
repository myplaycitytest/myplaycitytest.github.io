function ItemBuyPanel(type, ok_callback, close_callback)
{
    this.type = type;
    this.passive = UserSettings.bonuses[type].passive;
    this.active = UserSettings.bonuses[type].active;
    this.okCallback = ok_callback;
    this.closeCallback = close_callback;

    Utils.callSuperConstructor(ItemBuyPanel, this, null, 1, 1);

    this.x = center.x;
    this.y = center.y;

    this.coast = UserSettings.bonuses[this.type].coast;

    this.set();
    this.setIcon();
    this.setTitle();
    this.setText();
    this.setPrice();
}

Utils.extend(ItemBuyPanel, Panel);

ItemBuyPanel.prototype.set = function()
{
    setSprite(this, "panel_3", 0, 0);
    setSprite(this, "wafer_1", 0, -15);

    var close_btn = new Button(this, "btn_close", 84, -70, Utils.proxy(function()
    {
        this.close(Utils.proxy(this.closeCallback));
    }, this));
    var buy_btn = new Button(this, "btn_plus", 30, 40, Utils.proxy(this.buyItem, this));
};

ItemBuyPanel.prototype.setIcon = function()
{
    if (this.passive) setSprite(this, "passive_bonus_"+this.type, -44, -15);
    else setSprite(this, "bonus_"+this.type+"_unlocked", -44, -15);
};

ItemBuyPanel.prototype.setTitle = function()
{
    var t;
    if (this.type == "moves") t = "PASSIVE_BONUS_MOVES_TITLE";
    else if (this.type == "time") t = "PASSIVE_BONUS_TIME_TITLE";
    else if (this.type == "color") t = "PASSIVE_BONUS_COLOR_TITLE";
    else if (this.type == "boom") t = "BOOM_BONUS_TITLE";
	else if (this.type == "fire") t = "BONUS_GEFEST_TITLE";
	else if (this.type == "storm") t = "BONUS_AFRODITA_TITLE";
	else if (this.type == "dragon") t = "BONUS_ZEUS_TITLE";
	else if (this.type == "knife") t = "BONUS_ARTEMIDA_TITLE";
	else if (this.type == "bomb") t = "BONUS_ARES_TITLE";	
	
    setBitmapText(this, "font_greek_title_mip2", I18.getString(t), -5, -50, {align: 2, maxWidth: 150, valign: BitmapText.VALIGN_MIDDLE});
};

ItemBuyPanel.prototype.setText = function()
{
    var t;
    if (this.type == "moves") t = "PASSIVE_BONUS_MOVES_DESC";
    else if (this.type == "time") t = "PASSIVE_BONUS_TIME_DESC";
    else if (this.type == "color") t = "PASSIVE_BONUS_COLOR_DESC";
    else if (this.type == "boom") t = "BOOM_BONUS_DESC";
    
	else if (this.type == "fire") t = "BONUS_GEFEST_DESC";
	else if (this.type == "storm") t = "BONUS_AFRODITA_DESC";
	else if (this.type == "dragon") t = "BONUS_ZEUS_DESC";
	else if (this.type == "knife") t = "BONUS_ARTEMIDA_DESC";
	else if (this.type == "bomb") t = "BONUS_ARES_DESC";

    setBitmapText(this, "font_greek_brown_mip2", I18.getString(t), 23, -8, {align: 2, maxWidth: 90, valign: BitmapText.VALIGN_MIDDLE});
};

ItemBuyPanel.prototype.setPrice = function()
{
    var price = UserSettings.bonuses[this.type].coast;    
    if (this.passive)
    {
    	setSprite(this, "coins_1", -50, 40);
    	setBitmapText(this, "font_greek_buttons_mip1", price, -30, 42, {align: 3});
	}
	else
	{
		var mc = setSprite(this, "shadow_plank", -37, 28, {opacity: 0.4, scaleX: 0.6, scaleY: 0.8});
		setSprite(this, "coins_0", -52, 29);
    	this.coins_text = setBitmapText(this, "font_greek_buttons_mip1", UserSettings.coins, -26, 31, {align: 2});
    			
		var coins = setSprite(this, "coins_1", -52, 52);
		coins.scaleTo(0.9);
    	setBitmapText(this, "font_greek_buttons_mip1", price, -26, 54, {align: 2});
    }
};

ItemBuyPanel.prototype.buyItem = function()
{
    if (UserSettings.buyItem(this.type))
    {
        this.okCallback();
        if (this.passive) LevelMap.area.updateTopPanel();
        else if (this.active) this.updatePanel();
        this.close(Utils.proxy(this.closeCallback, this));
    }
    else
    {
        //var coins_buy_panel = new CoinsBuyPanel();
    }
};

ItemBuyPanel.prototype.updatePanel = function()
{
	this.coins_text.write(UserSettings.coins);
};

