function CoinsBuyPanel()
{
    Utils.callSuperConstructor(CoinsBuyPanel, this, null, 1, 1);
    this.x = center.x;
    this.y = center.y;
    //this.coast = UserSettings.bonuses[this.type].coast;
}

Utils.extend(CoinsBuyPanel, Panel);

CoinsBuyPanel.prototype.set = function()
{
	
};