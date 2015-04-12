function ChainBombElement(props)
{
    this.element_type = "chain_bomb";
    this.limit = props.config.data.limit*1 || 4;
    this.count = props.config.data.limit*1 || 4;
    this.chains_cnt = props.config.data.chains || 5;
    this.timer = false;
    this.count_text = null;
    Utils.callSuperConstructor(ChainBombElement, this, props);
}

Utils.extend(ChainBombElement, Element);

ChainBombElement.prototype.setSkin = function()
{
    this.setAtlasBitmap("s_chain_bomb_"+this.color);
    this.count_text = setText(this, this.count, 0, 0, {align: "center", size: 10, lineWidth: 0, fillColor: "white"});
};

ChainBombElement.prototype.applyDestroyImpact = function()
{
    GameField.addInAction();
    this.playDestroyEffect();
    this.doSetNullCallback(this);
    return this.getMainPoints();
};

ChainBombElement.prototype.applyExplosionImpact = function()
{
    GameField.addInAction();
    this.playDestroyEffect();
    this.doSetNullCallback(this);
    return this.getMainPoints();
};

ChainBombElement.prototype.playDestroyEffect = function()
{
    SoundUtils.playEffect("ice_emitter_destroyed");

    this.in_action = true;
    var x = this.x;
    var y = this.y;
    var spr = setTilesSprite(this.parent, "chainbomb_delite", x, y, {_frames: 15, opacity: 0,
                                                                        scaleX: 0, scaleY: 0});
    spr.onchangeframe = Utils.proxy(function(e)
    {
        if (e.target.currentFrameX == 13) e.target.destroy = true;
        return false;
    }, this);

    spr.fadeTo(1, pps/4, Easing.linear);
    spr.scaleTo(1, pps/4, Easing.linear);

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
                this.in_action = false;
                this.endInAction();
                this.destroyElement();
            }, this)
        },
    ];
    Animation.play(spr, star_seq);
    this.fadeTo(0, pps/2,Easing.linear);
};

ChainBombElement.prototype.doAction0 = function(game_field)
{
    if (this.destroy) return;
    this.count--;
    if (this.count == 0)
    {
        this.count = this.limit;
        this.scatterChains(game_field);
    }
    this.updateCountText();
};

ChainBombElement.prototype.scatterChains = function(game_field)
{
    var enable_elements = [];
    var _findEnableElements = function(enable_elements)
    {
        for (var j=0; j<game_field.rows; j++)
        {
            for (var i = 0; i < game_field.columns; i++)
            {
                if (game_field.elements[j][i] &&
                    game_field.elements[j][i].element_type == "simple" &&
                    !game_field.elements[j][i].in_action &&
                    game_field.elements[j][i].chains == 0)
                {
                    enable_elements.push(game_field.elements[j][i]);
                }
            }
        }
    }
    _findEnableElements(enable_elements);

    var selected_elements = [];
    while (enable_elements.length > 0 && selected_elements.length < this.chains_cnt)
    {
        var el = getRandomValue(enable_elements);
        selected_elements.push(el);
        enable_elements.deleteElement(el);
    }

    for (var i=0; i<selected_elements.length; i++) this.playScatterEfect(selected_elements[i]);
};

ChainBombElement.prototype.playScatterEfect = function(element)
{
    var scatter = setTilesSprite(element.parent, "chainbomb_vine", this.x, this.y, {_frames: 35});
    scatter.changeFrameDelay = pps/24;
    scatter.scaleTo(0.8);
    scatter.onchangeframe = Utils.proxy(function(e)
    {
        if (e.target.currentFrameX == 34) e.target.gotoAndStop(34);
    }, this);

    scatter.moveTo(element.x, element.y, pps, Easing.linear, Utils.proxy(function(e)
    {
        e.target.obj.destroy = true;
        element.chains = 1;
        element.setAdditionalSkin();
    }, this));

};

ChainBombElement.prototype.updateCountText = function()
{
    this.count_text.text = this.count;
};