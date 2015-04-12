function BonusItem(type, x, y, useActiveCallback)
{
    this.type = type;

    Utils.callSuperConstructor(BonusItem, this, null, 1, 1);

    this.x = x;
    this.y = y;

	this.useActiveCallback = useActiveCallback;

    this.setProperties();
    this.setSkin();
    this.setAdditionalSkin();

    this.addEventListener("mouseup", Utils.proxy(this.clickHandler, this));
}

Utils.extend(BonusItem, Sprite);

BonusItem.prototype.setProperties = function()
{
    this.active = UserSettings.bonuses[this.type].active;
    this.passive = UserSettings.bonuses[this.type].passive;
    this.enable = UserSettings.bonuses[this.type].enable;
    this.available = UserSettings.bonuses[this.type].available;
};

BonusItem.prototype.setOpenBonusItemBuyPanelCallback = function(callback)
{
    this.openCallback = callback;
};

BonusItem.prototype.setCloseBonusItemBuyPanelCallback = function(callback)
{
    this.closeCallback = callback;
};

BonusItem.prototype.clickHandler = function()
{
    if (!this.available) return false;
    if (!this.enable) this.showBuyPanel();
    else if (this.enable && this.active) this.useActiveBonus();
    return false;
};

BonusItem.prototype.setSkin = function()
{
    var bitmap_name;
    if (!this.available) bitmap_name = "bonus_locked";
    else if (this.passive) bitmap_name = "passive_bonus_"+this.type;
    else if (this.active && this.enable) bitmap_name = "bonus_"+this.type+"_unlocked";
    else if (this.active && !this.enable) bitmap_name = "bonus_"+this.type+"_locked";
    this.bitmap = bitmaps[bitmap_name].bitmap;
    this.width = bitmaps[bitmap_name].width;
    this.height = bitmaps[bitmap_name].height;
};

BonusItem.prototype.setAdditionalSkin = function()
{
    if (!this.available) return false;
    if (this.additional_spr) this.additional_spr.destroy = true;
    if (this.enable) this.additional_spr = setSprite(this, "bonus_check", 12, 12, {_static: this.static});
    else this.additional_spr = setSprite(this, "bonus_plus", 12, 12, {_static: this.static});
};

BonusItem.prototype.showBuyPanel = function()
{
    if (this.openCallback) this.openCallback();
	this.showArrow();
    var buy_panel = new ItemBuyPanel(this.type, Utils.proxy(this.setEnableSkin, this),
                                                Utils.proxy(this.closeCallback, this));
};

BonusItem.prototype.showArrow = function()
{

};

BonusItem.prototype.useActiveBonus = function()
{
    LEVEL.state = Level.STATE_BONUS_MODE;
	this.setDisableSkin();
	BonusItem.use(this.type, this.useActiveCallback, this);
};

BonusItem.use = function(type, useCallback)
{
    Level.lock();
	UserSettings.spendItem(type);
	BonusItem.showStartUsingAnimation(type, useCallback);
};

BonusItem.showStartUsingAnimation = function(type, useCallback)
{
	var spr = setSprite(stage, "big_bonus_"+type, center.x+30, center.y, {opacity: 0});
	spr.fadeTo(1, pps, Easing.linear, function()
	{
		spr.fadeTo(0, pps, Easing.linear, function()
		{
			spr.destroy = true;
			if (useCallback) useCallback(type);
		});
	});

    SoundUtils.playEffect(this.active ? "active_bonus" : "active_passive_bonus");
};

BonusItem.prototype.setEnableSkin = function()
{
    this.enable = true;
    this.setAdditionalSkin();
    if (this.active)
    {
        stage.needToRebuildBack = true;
        this.setSkin();
    }
};

BonusItem.prototype.setDisableSkin = function()
{
    this.enable = false;
    this.setAdditionalSkin();
    if (this.active)
    {
        this.setSkin();
        stage.needToRebuildBack = true;
    }

};
