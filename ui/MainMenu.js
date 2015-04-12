function MainMenu()
{
    Utils.callSuperConstructor(MainMenu, this, null, 1, 1);
    this.x = center.x;
    this.y = center.y;

    stage.addChild(this);

    this.set();
    this.setGirl();
    this.setCircles();
    this.setWind();
    this.setButtons();
}

Utils.extend(MainMenu, Sprite);

MainMenu.prototype.set = function()
{
    setSprite(this, "main_menu_back", 0, 0, {_static: true});
    setSprite(this, "cloud_06", 0, -50, {width: 480, _static: true});
    setSprite(this, "cloud_07", 0, 0, {width: 480, _static: true});
    setSprite(this, "main_menu_hills", 0, 0, {_static: true});
    setSprite(this, "logo", 10, -107, {_static: true});
};

MainMenu.prototype.setButtons = function()
{
    this.play_btn = new Button(this, "btn_play", 180, 70, showMap);
    this.options_btn = new Button(this, "btn_options", 178, 131, Utils.proxy(this.showOptions, this));
};

MainMenu.prototype.setGirl = function()
{
    setSprite(this, "girl_1", -94, 16, {_static: true});
};

MainMenu.prototype.setCircles = function()
{
    this.circle_center = setSprite(this, null, -176, -95, {width: 1, height: 1, opacity: 1});
    Effects.playAnimation(this.circle_center, "circles");
    Effects.playParticle(this.circle_center, "staff");
};

MainMenu.prototype.setWind = function()
{
    this.wind_center = setSprite(this, null, 0, 0, {w: 1, h: 1});
    Effects.playParticle(this.wind_center, "wind");
};

MainMenu.prototype.freezeAnimations = function()
{
    this.setStatic(true);
    this.circle_center.emitter.stopParticle();
    this.wind_center.emitter.stopParticle();
};

MainMenu.prototype.unFreezeAnimations = function()
{
    this.setStatic(false);
    this.circle_center.emitter.playParticle();
    this.wind_center.emitter.playParticle();
};

MainMenu.prototype.showOptions = function()
{
    this.freezeAnimations();
    OptionsPanel.open("menu", Utils.proxy(this.unFreezeAnimations, this));
};

MainMenu.show = function()
{
    MainMenu.area = new MainMenu();
};

MainMenu.area = null;