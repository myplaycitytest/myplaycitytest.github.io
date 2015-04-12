function Element(props)
{
    this.i = props.i;
    this.j = props.j;
    this.type = props.type;

    this.chains = 0;
    this.ice = 0;


    this.in_action_1 = false;
    this.in_action_2 = false;

    //types
    /*
    *ChainBomb_B 2-58, 2-56
    *ChipGenerator 2-30
    * ChipUp
    *Ice 1-60
    * *StrongWall
    *
    * Bomb_B - бомба. цветная
    *CWallInDoubleChains_M - двойная цветная стена в двойной веревке
    *CWall_B - двойная стена
    *Cross_G - крестовая стрелка. цветная
    *DWallInDoubleChains_B - двойная стена в двойной веревке
    *DWall_B - двойная стена. цвета не имеет
    *FallingLevelGoal - падающий диаманд 1-40
    *Random - рандомный обычный элемент
    *SimpleInDoubleChains_B - обычный элемент в двойной веревке
    *SimpleInSingleChains_B - обычный элемент в одинарной веревке
    *Simple_B - обычный элемент
    *WallInDoubleChains_B - обычная стена в двойной веревке
    *WallInSingleChains_G - обычная стена в одинарной веревке
    *Wall_G - обычная стена . цвета не имеет
    *WaveHor_R - стрелка горизонтальная
    *WaveVer_B - стрелка вертикальная
    */

    Utils.callSuperConstructor(Element, this, null, 15, 15);

    this.addEventListener("click", Utils.proxy(this.clickHandle, this));

    this.points = UserSettings.elementPoints[this.element_type];
    this.dX = props.dX;
    this.dY = props.dY;

    this.x = (this.i-4)*this.dX;
    this.y = (this.j-4)*this.dY;

    this.random_colors = props.random_colors;
    this.radius = props.radius;

    this.opacity = 0;

    this.null_spr = setSprite(this, null, 0, 0, {width:1, height: 1});

    this.setProps();
    this.setSkin();
}

Utils.extend(Element, TilesSprite);

Element.prototype.setProps = function()
{
    if (this.type.indexOf("_") > 0) this.color = this.type.slice(this.type.indexOf("_")+1)+"";
    else if (this.type.indexOf("Random") >= 0)
    {
        this.color = getRandomValue(this.random_colors);
        this.type = "Simple_"+this.color;
    }

    if (this.type.indexOf("InSingleChains") > 0) this.chains = 1;
    else if (this.type.indexOf("InDoubleChains") > 0) this.chains = 2;
};

Element.prototype.playAddingEffect = function(game_field)
{
    this.in_adding = true;
    this.opacity = 0;
    var dT = pps/5000;
    var duration = this.dY/dT;
    var star_seq =
    [
        {
            tweens: [

                {prop: "y", from: this.y-this.dY*2, to: this.y, ease: Easing.linear.easeIn},
                {prop: "opacity", from: 0, to: 1},
            ],
            duration: duration,
            onfinish: Utils.proxy(function()
            {
                this.in_adding = false;
                game_field.checkAddNewElementsEnd();
            }, this)
        }
    ];
    Animation.play(this, star_seq);
    return duration;
};

Element.prototype.playStartAnimation = function(end_callback)
{
    this.in_action = true;
    this.opacity = 0;
    var star_seq =
    [
        {
            tweens: [
                {prop: "y", from: this.y-this.dY*2, to: this.y, ease: Easing.quadratic.easeOut},
                {prop: "opacity", to: 1},
            ],
            duration: pps,
            onfinish: Utils.proxy(function()
            {
                this.in_action = false;
                end_callback();
            }, this)
        }
    ];
    Animation.play(this, star_seq);
};

Element.prototype.setAdditionalSkin = function()
{
    //for ice and chains
    if (this.aditional_spr) this.aditional_spr.destroy = true;
    this.aditional_spr = setSprite(this, null, 0, 0, {width: 1, height: 1});
    if (this.chains > 0) AtlasSprite.set(this.aditional_spr, "s_chain_0", 0, 0);
    if (this.chains > 1) AtlasSprite.set(this.aditional_spr, "s_chain_1", 0, 0);
    if (this.ice == 1) AtlasSprite.set(this.aditional_spr, "s_frozen_chips_0", 0, 0);
    if (this.ice == 2) AtlasSprite.set(this.aditional_spr, "s_frozen_chips_1", 0, 0);
    if (this.ice == 3) AtlasSprite.set(this.aditional_spr, "s_frozen_chips_2", 0, 0);
};

Element.prototype.doAction0 = function(){return false}; //сразу после клика
Element.prototype.doAction1 = function(){return false}; // после удаления элементов и перед сдвигом элементов
Element.prototype.doAction2 = function(){return false}; // после сдвига элементов и добавления новых

Element.prototype.applyDestroyImpact = function(){return 0;};
Element.prototype.applyExplosionImpact = function(){return 0;};
Element.prototype.applyMergeImpact = function(){return 0;};
Element.prototype.applySecondaryDestroyImpact = function(){return 0;};
Element.prototype.applySecondaryExplosionImpact = function(){return 0;};
Element.prototype.applySecondaryMergeImpact = function(){return 0;};

Element.prototype.playHint = function()
{
    this.hint_spr = setTilesSprite(this, "hints_sheet", 0, 0, {_frames: 20, opacity: 0, _static: this.static});
    this.hint_spr.scaleTo(0);

    var star_seq =
    [
        {
            tweens: [
                {prop: "opacity", to: 1},
                {prop: "scaleX", to: 0.5},
                {prop: "scaleY", to: 0.5},
            ],
            duration: pps
        },
        {
            tweens: [
                {prop: "opacity", to: 0},
                {prop: "scaleX", to: 0},
                {prop: "scaleY", to: 0},
            ],
            duration: pps,
            loop: 0
        },
    ];
    Animation.play(this.hint_spr, star_seq);
};

Element.prototype.hideHint = function()
{
    if (this.hint_spr) this.hint_spr.destroy = true;
    this.hint_spr = null;
};

Element.prototype.playDestroyChainEffect = function(chain_type)
{
    var chain;
    var x = this.getAbsolutePosition().x;
    var y = this.getAbsolutePosition().y;
    if (chain_type == 1) chain = AtlasSprite.set(stage, "s_chain_0", x, y);
    else if (chain_type == 2) chain = AtlasSprite.set(stage, "s_chain_1", x, y);
    chain.moveBy(0, 40, pps/2, Easing.linear, function()
    {
        chain.destroy = true;
        return false;
    });
    chain.fadeTo(0, pps/2);
};

Element.prototype.clickHandle = function()
{
    var ok = false;
    //если Simple без chains и без полной заморозки
    if (this.element_type == "simple" && this.ice != 3) ok = true;
    else if (this.element_type == "wave") ok = true;
    if (ok) this.clickCallback(this);
    return false;
};

Element.prototype.playDestroyEffect = function()
{
    this.in_action = true;
    var x = this.getAbsolutePosition().x;
    var y = this.getAbsolutePosition().y;

    var spr = AtlasSprite.set(stage, "s_png_swirl_particles_psd", x, y, {opacity: 0});
    spr.fadeTo(1, pps/4, Easing.linear);

    this.levelTargetDone();

    var star_seq =
    [
        {
            tweens: [
                {prop: "rotation", to: Math.PI*3},
            ],
            duration: pps/3
        },
        {
            tweens: [
                {prop: "scaleX", to: 0},
                {prop: "scaleY", to: 0},
                {prop: "rotation", to: Math.PI*6},
            ],
            duration: pps/3,
            onfinish: Utils.proxy(function()
            {
                this.endInAction();
                this.destroyElement();
            }, this)
        },
    ];
    Animation.play(spr, star_seq);
    this.fadeTo(0, pps/2,Easing.linear);
};

Element.prototype.levelTargetDone = function()
{
    if (this.element_type == "wall" && this.wall_type == -1) LEVEL.targetDone("strong_wall");
    else if (this.element_type == "wall" && this.wall_type == 0) LEVEL.targetDone("wall");
    else if (this.element_type == "chip" && this.fall_type == 1) LEVEL.targetDone("falling");
    else if (this.element_type == "chip" && this.fall_type == 2) LEVEL.targetDone("chip_up");
};

Element.prototype.destroyElement = function()
{
    this.destroy = true;
};

Element.prototype.endInAction = function()
{
    this.in_action = false;
    this.in_action_1 = false;
    GameField.takeInAction();
    this.stepEndCallback(this);
};

Element.prototype.doShake = function()
{
    var x = this.x, d = pps/10, dx = 2;
    var star_seq =
    [
        {
            tweens: [
                {prop: "x", to: x+dx},
            ],
            duration: d
        },
        {
            tweens: [
                {prop: "x", to: x-dx},
            ],
            duration: d,
        },
        {
            tweens: [
                {prop: "x", to: x+dx},
            ],
            duration: d,
        },
        {
            tweens: [
                {prop: "x", to: x},
            ],
            duration: d/2,
        },
    ];
    Animation.play(this, star_seq);
};

Element.prototype.isMoveAble = function()
{
    if (this.element_type == "ice")  return false;
    if (this.element_type == "chip_generator")  return false;
    if (this.element_type == "wall" && this.generated)  return false;
    if (this.chains > 0) return false;
    if (this.ice > 0) return false;
    return true;
};

Element.prototype.moveElementDown = function(game_field)
{
    this.in_moving_down = true;
    var dT = pps/5000;
    var duration = ((this.j-4)*this.dY - this.y)/dT;
    this.moveTo(this.x, (this.j-4)*this.dY, duration, Easing.linear.easeIn, Utils.proxy(function()
    {
        this.in_moving_down = false;
        game_field.checkMoveElementsDownEnd();
    }, this));
    return duration;
};

Element.prototype.changeElement = function()
{
    var dT = pps/8000;
    var duration = Math.abs(((this.j-4)*this.dY - this.y)/dT);
    this.moveTo(this.x, (this.j-4)*this.dY, duration, Easing.linear, Utils.proxy(function()
    {
        this.in_action_1 = false;
        LEVEL.game_field.checkElementActions1();
    }, this));
    return duration;
};

Element.prototype.mergeToElement = function(el, create_callback)
{
    var returned_points = 0;
    returned_points += this.getMainPoints();
    returned_points += this.getAdditionalPoints();

    this.in_action = true;
    GameField.addInAction();
    var star_seq =
    [
        {
            tweens: [
                {prop: "x", to: el.x},
                {prop: "y", to: el.y},
                {prop: "scaleX", to: 0.8},
                {prop: "scaleY", to: 0.8},
            ],
            duration: pps/2,
            onfinish: Utils.proxy(function()
            {
                this.endInAction();
                this.destroyElement();
                if (create_callback) create_callback();
            }, this)
        }
    ];
    Animation.play(this, star_seq);
    return returned_points;
};

Element.prototype.playShuffle = function(end_callback)
{
    this.in_shuffle = true;
    var x = (this.i-4)*this.dX;
    var y = (this.j-4)*this.dY;

    var dir = this.j%2 == 0 ? 1 : -1;
    var star_seq =
    [
        {
            tweens: [
                {prop: "x", to: this.x+this.dX*dir},
                {prop: "opacity", to: 0},
            ],
            duration: pps/2,
        },
        {
            tweens: [
                {prop: "x", from: x-this.dX*dir, to: x},
                {prop: "y", from: y, to: y},
                {prop: "opacity", to: 1},
            ],
            duration: pps/2,
            onfinish: Utils.proxy(function()
            {
                this.in_shuffle = false;
                if (end_callback) end_callback();
            }, this)
        },
    ];

    Animation.play(this, star_seq);
};

Element.prototype.getMainPoints = function()
{
    if (this.element_type == "simple") return UserSettings.getPoints("simple");
    else if (this.element_type == "wave" && this.wave_type == 1) return UserSettings.getPoints("bomb"); // bomb
    else if (this.element_type == "wave" && this.wave_type == 2) return UserSettings.getPoints("wave"); //wave
    else if (this.element_type == "wave" && this.wave_type == 3) return UserSettings.getPoints("cross"); // cross
    else if (this.element_type == "wall" && this.wall_type == 1) return UserSettings.getPoints("wall"); // wall
    else if (this.element_type == "wall" && this.wall_type == 2) return UserSettings.getPoints("wall_double"); // double wall
    else if (this.element_type == "wall" && this.wall_type == 3) return UserSettings.getPoints("wall_color"); // wall color
    else if (this.element_type == "wall" && this.wall_type == -1) return UserSettings.getPoints("wall_generated"); // wall generated
    else if (this.element_type == "chip") return UserSettings.getPoints("chip"); // chip
    else if (this.element_type == "ice") return UserSettings.getPoints("ice"); // ice
    else if (this.element_type == "chip_generator") return UserSettings.getPoints("chip_generator"); // chip_generator
    else if (this.element_type == "chain_bomb") return UserSettings.getPoints("chain_bomb"); // chain_bomb
    return 0;
};

Element.prototype.getAdditionalPoints = function()
{
    if (this.chains == 1) return UserSettings.getPoints("chains_1");
    else if (this.chains == 2) return UserSettings.getPoints("chains_2");
    else if (this.ice == 1) return UserSettings.getPoints("ice_1");
    else if (this.ice == 2) return UserSettings.getPoints("ice_2");
    else if (this.ice == 3) return UserSettings.getPoints("ice_3");
    return 0;
};

Element.prototype.freezeElement = function(){};

Element.setClickCallback = function(f)
{
    if (typeof f == "undefined") return false;
    Element.prototype.clickCallback = f;
};

Element.setStepEndCallback = function(f)
{
    if (typeof f == "undefined") return false;
    Element.prototype.stepEndCallback = f;
};

Element.setExplosionCallback = function(f)
{
    if (typeof f == "undefined") return false;
    Element.prototype.doExplosinCallback = f;
};

Element.setElementNullCallback = function(f)
{
    if (typeof f == "undefined") return false;
    Element.prototype.doSetNullCallback = f;
};

Element.add = function(props)
{
    var type = props.type, element;
    if (type.indexOf("Simple") >= 0 || type.indexOf("Random") >= 0) element = new SimpleElement(props);
    else if (type.indexOf("Wall") >= 0) element = new WallElement(props);
    else if (type.indexOf("Bomb") == 0 || type.indexOf("Wave") >= 0 || type.indexOf("Cross") >= 0) element = new WaveElement(props);
    else if (type.indexOf("Falling") >= 0 || type.indexOf("ChipUp") >= 0) element = new ChipElement(props);
    else if (type.indexOf("Ice") >= 0) element = new IceElement(props);
    else if (type.indexOf("ChipGenerator") >= 0) element = new ChipGeneratorElement(props);
    else if (type.indexOf("ChainBomb") >= 0) element = new ChainBombElement(props);
    return element;
};