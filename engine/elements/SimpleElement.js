function SimpleElement(props)
{
    this.element_type = "simple";
    Utils.callSuperConstructor(SimpleElement, this, props);
    this.setAdditionalSkin();
}

Utils.extend(SimpleElement, Element);

SimpleElement.prototype.setSkin = function()
{
    this.setAtlasBitmap("s_regular_"+this.color);
};

SimpleElement.prototype.applyDestroyImpact = function()
{
    var returned_points = 0;
    if (this.ice > 0 || this.chains > 0) returned_points = this.getAdditionalPoints();
    else returned_points = this.getMainPoints();

    GameField.addInAction();
    if (this.ice > 0)
    {
        this.in_action = true;
        /*
        stage.setTimeout(Utils.proxy(function()
        {
            this.in_action = false;
            this.endInAction();
            this.setAdditionalSkin();
        }, this), pps/2);
        */
        this.playDestroyIceEffect(Utils.proxy(function()
        {
            this.in_action = false;
            this.endInAction();
            this.setAdditionalSkin();
        }, this));
        this.ice--;


    }
    else if (this.chains > 0)
    {
        this.playDestroyChainEffect(this.chains*1);
        this.chains--;
        this.setAdditionalSkin();

        stage.setTimeout(Utils.proxy(function()
        {
            this.in_action = false;
            this.endInAction();
        }, this), pps/2);
    }
    else
    {
        this.in_action = true;
        this.playDestroyEffect();
        this.doSetNullCallback(this);
    }
    return returned_points;
};

SimpleElement.prototype.applyExplosionImpact = function()
{
    var returned_points = 0;
    if (this.ice > 0 || this.chains > 0) returned_points = this.getAdditionalPoints();
    else returned_points = this.getMainPoints();

    GameField.addInAction();
    if (this.ice > 0)
    {
        this.in_action = true;
        this.playDestroyIceEffect(Utils.proxy(function()
        {
            this.in_action = false;
            this.endInAction();
            this.setAdditionalSkin();
        }, this));
        this.ice = 0;
    }
    else if (this.chains > 0)
    {
        this.playDestroyChainEffect(this.chains*1);
        this.chains--;
        this.endInAction();
        this.setAdditionalSkin();
    }
    else
    {
        this.in_action = true;
        this.playDestroyEffect();
        this.doSetNullCallback(this);
    }
    return returned_points;
};

SimpleElement.prototype.applySecondaryDestroyImpact = function()
{
    this.secondary_destroy_impact = true;
    var returned_points = 0;
    if (this.ice > 0) returned_points = this.getAdditionalPoints();
    if (this.ice > 0)
    {
        this.in_action = true;
        this.playDestroyIceEffect(Utils.proxy(function()
        {
            this.in_action = false;
        }, this));
        this.ice = 0;
        this.setAdditionalSkin();
    }
    return returned_points;
};

SimpleElement.prototype.applySecondaryMergeImpact = function()
{
    var returned_points = 0;
    if (this.ice > 0)
    {
        returned_points = this.getAdditionalPoints();
        this.in_action = true;
        this.playDestroyIceEffect();
        this.ice = 0;
        this.setAdditionalSkin();
    }
    return returned_points;
};

SimpleElement.prototype.playDestroyIceEffect = function(callback)
{
    var spr;
    if (this.ice == 1) spr = AtlasSprite.set(this.parent, "s_frozen_chips_0", this.x, this.y);
    if (this.ice == 2) spr = AtlasSprite.set(this.parent, "s_frozen_chips_1", this.x, this.y);
    if (this.ice == 3) spr = AtlasSprite.set(this.parent, "s_frozen_chips_2", this.x, this.y);
    spr.fadeTo(0, pps/2);
    spr.moveTo(this.x, this.y+20, pps/2, Easing.linear, Utils.proxy(function(e)
    {
        //this.in_action = false;
        e.target.destroy = true;
        if (callback) callback();
    }, this));
};

SimpleElement.prototype.playColorBonusDestroyEffect = function(checkCallback, endCallback)
{
    this.in_action = true;
    var x = this.getAbsolutePosition().x;
    var y = this.getAbsolutePosition().y;

    this.levelTargetDone();
    this.destroyElement();

    var ef = setTilesSprite(stage, "swirl2_animation", x, y, {_frames: 20});
    ef.scaleTo(0.75);
    ef.animDelay = 1.2;
    ef.onchangeframe = Utils.proxy(function(e)
    {
        if (e.target.currentFrameX == 19)
        {
            e.target.destroy = true;
            this.in_action = false;
            this.doSetNullCallback(this);
            if (checkCallback()) endCallback();
        }
    }, this);
};

SimpleElement.prototype.playBoomBonusDestroyEffect = function()
{
    //this.in_action = true;
    var x = this.getAbsolutePosition().x;
    var y = this.getAbsolutePosition().y;

    this.levelTargetDone();
    this.destroyElement();

    var ef = setTilesSprite(stage, "swirl2_animation", x, y, {_frames: 20});
    ef.scaleTo(0.75);
    ef.animDelay = 1.2;
    ef.onchangeframe = Utils.proxy(function(e)
    {
        if (e.target.currentFrameX == 19)
        {
            e.target.destroy = true;
            //this.in_action = false;
            //this.doSetNullCallback(this);
         }
    }, this);
};

SimpleElement.prototype.playKnifeBonusDestroyEffect = function(checkCallback, endCallback)
{
    this.in_action = true;
    var x = this.getAbsolutePosition().x;
    var y = this.getAbsolutePosition().y;

    this.levelTargetDone();
    this.destroyElement();

    var ef = setTilesSprite(stage, "swirl2_animation", x, y, {_frames: 20});
    ef.scaleTo(0.75);
    ef.animDelay = 1.2;
    ef.onchangeframe = Utils.proxy(function(e)
    {
        if (e.target.currentFrameX == 19)
        {
            e.target.destroy = true;
            this.in_action = false;
            this.doSetNullCallback(this);
            if (checkCallback()) endCallback();
        }
    }, this);
};

SimpleElement.prototype.playDestroyEffect = function()
{
    this.in_action = true;
    var x = this.getAbsolutePosition().x;
    var y = this.getAbsolutePosition().y;

    this.levelTargetDone();
    this.destroyElement();

    var ef = setTilesSprite(stage, "swirl2_animation", x, y, {_frames: 20});
    ef.scaleTo(0.75);
    ef.changeFrameDelay = pps/40;
    ef.onchangeframe = Utils.proxy(function(e)
    {
        if (e.target.currentFrameX == 18)
        {
            e.target.destroy = true;
            this.in_action = false;
            this.endInAction();
        }
    }, this);
};

SimpleElement.prototype.generateWall = function(game_field)
{
    var generated_wall = Element.add({i: this.i,
        j: this.j,
        type: "Wall",
        generated: true,
        dX: game_field.dX,
        dY: game_field.dY});
    game_field.main_spr.addChild(generated_wall);
    game_field.elements[this.j][this.i] = generated_wall;
    this.playGenerationWall(generated_wall);
};

SimpleElement.prototype.playGenerationWall = function(generated_wall)
{
    generated_wall.opacity = 0;
    generated_wall.fadeTo(1, pps/2, Easing.linear);
    GameField.addInAction();
    this.fadeTo(0, pps/2, Easing.linear, Utils.proxy(function()
    {
        this.endInAction();
        this.destroyElement();
    }, this));
};

SimpleElement.prototype.doWhirlpoolEffect = function(super_wave, game_field)
{
    var returned_points = 0;
    if (this.ice > 0 || this.chains > 0) returned_points = this.getAdditionalPoints();
    else returned_points = this.getMainPoints();

    var chain_spr = null;
    this.in_action = true;
    GameField.addInAction();
    if (this.chains == 2)
    {
        this.chains--;
        this.endInAction();
        this.setAdditionalSkin();
        chain_spr = AtlasSprite.set(game_field.main_spr, "s_chain_2", this.x, this.y);
    }
    else if (this.chains == 1)
    {
        this.chains--;
        this.endInAction();
        this.setAdditionalSkin();
        chain_spr = AtlasSprite.set(game_field.main_spr, "s_chain_1", this.x, this.y);
    }
    this.playWhirlpoolEffect(chain_spr, super_wave, game_field);
    return returned_points;
};

SimpleElement.prototype.playWhirlpoolEffect = function(chain_spr, super_wave, game_field)
{
    var star_seq =
    [
        {
            tweens: [
                {prop: "x", to: super_wave.x},
                {prop: "y", to: super_wave.y},
            ],
            duration: pps,
            onfinish: Utils.proxy(function()
            {
                if (chain_spr) chain_spr.destroy = true;
                else
                {
                    this.in_action = false;
                    this.destroyElement();
                    this.doSetNullCallback(this);
                }
                game_field.checkWhirlpoolEffectEnd(super_wave);
            }, this)
        }
    ];
    Animation.play(chain_spr ? chain_spr : this, star_seq);
};

SimpleElement.prototype.freezeElement = function(game_field)
{
    //this.in_action_1 = true;
    this.freezed = true;
    this.ice++;

    var spr;
    if (this.ice == 1) spr = AtlasSprite.set(this.aditional_spr, "s_frozen_chips_0", 0, 0);
    if (this.ice == 2) spr = AtlasSprite.set(this.aditional_spr, "s_frozen_chips_1", 0, 0);
    if (this.ice == 3) spr = AtlasSprite.set(this.aditional_spr, "s_frozen_chips_2", 0, 0);
    spr.opacity = 0;
    spr.fadeTo(1, pps/4, Easing.linear, Utils.proxy(function(e)
    {
        e.target.destroy = true;
        //this.in_action_1 = false;
        //game_field.checkElementActions1(1);
        this.setAdditionalSkin();
    }, this));
};