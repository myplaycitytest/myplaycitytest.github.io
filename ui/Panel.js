function Panel()
{
    Utils.callSuperConstructor(Panel, this, null, 1, 1);
    this.x = center.x + 50;
    this.y = center.y;
    this.setLockSprite();
        
    stage.addChild(this);     

    this.visible = false;

    this.pauseLevelTimer();

    stage.setTimeout(Utils.proxy(function()
    {
        this.visible = true;
        this.playShowEffect();
    }, this), pps/4);
}

Utils.extend(Panel, Sprite);

Panel.prototype.setLockSprite = function()
{
    this.lock_spr = setSprite(stage, null, center.x, center.y, {width: center.x*2,
        height: center.y*2, opacity: 0.4, fillColor: "black"});
    this.freezeLockSprite();
    this.lock_spr.preventAllEvents();
};

Panel.prototype.freezePanel = function()
{
    this.setStatic(true);
};

Panel.prototype.unFreezePanel = function()
{
    this.setStatic(false);
};

Panel.prototype.freezeLockSprite = function()
{
    this.lock_spr.setStatic(true);
};

Panel.prototype.unFreezeLockSprite = function()
{
    this.lock_spr.setStatic(false);
};

Panel.prototype.playShowEffect = function()
{
    SoundUtils.playEffect("appearance_windows_paper");

    this.scaleX = 0.5;
    this.scaleY = 0.5;
    this.rotation = -Math.PI/2;

    this.scaleTo(1, pps/2, Easing.back.easeOut);
    this.rotateTo(0, pps/2, Easing.back.easeOut, Utils.proxy(this.onShowEffectFinish, this));
};

Panel.prototype.onShowEffectFinish = function()
{

};

Panel.prototype.close = function(callback)
{        
    stage.setTimeout(Utils.proxy(function()
    {
    	this.playHideEffect(callback);
    }, this), pps/4);
};

Panel.prototype.playHideEffect = function(callback)
{
    SoundUtils.playEffect("appearance_windows_paper");

    this.scaleTo(0, pps/2, Easing.back.easeIn);
    this.rotateTo(Math.PI/2, pps/2, Easing.back.easeIn, Utils.proxy(function()
    {
        if (callback && typeof callback === "function") callback();
        this.resumeLevelTimer();
        this.destroyPanel();
    }, this));
};

Panel.prototype.destroyPanel = function()
{
    this.destroy = true;
    this.lock_spr.destroy = true;
    this.unFreezeLockSprite();
};

Panel.prototype.pauseLevelTimer = function()
{
    if (gameState == STATE_GAME && LEVEL) LEVEL.pauseTimer();
};

Panel.prototype.resumeLevelTimer = function()
{
    if (gameState == STATE_GAME && LEVEL) LEVEL.resumeTimer();
};
