function IceElement(props)
{
    this.element_type = "ice";
    Utils.callSuperConstructor(IceElement, this, props);
}

Utils.extend(IceElement, Element);

IceElement.prototype.setSkin = function()
{
    this.setAtlasBitmap("s_ledyanaya_copy_2_chip_ice_psd");
};

IceElement.prototype.doAction0 = function(game_field)
{
    if (this.in_action) return false; // if element destroyed;

    this.showBlowAnimation();
    var checkNeighbor = function(el_i, el_j, game_field, length)
    {
        if (length == game_field.element_radius) return;
        for (var j=-1; j<2; j++)
        {
            for (var i=-1; i<2; i++)
            {
                if (i == j || i == j*(-1)) continue;
                if (el_i + i >= 0 &&
                    el_i + i < game_field.columns &&
                    el_j + j >= 0 &&
                    el_j + j < game_field.rows)
                {
                    var element = game_field.elements[el_j+j][el_i+i];
                    if (!element) continue;
                    if (element.freezed) continue;
                    if (element.in_action) continue;
                    if (element.ice == 3) checkNeighbor(el_i+i, el_j+j, game_field, length+1);
                    else element.freezeElement(game_field);
                }
            }
        }
    };

    checkNeighbor(this.i, this.j, game_field, 0);
};

IceElement.prototype.showBlowAnimation = function()
{
    var eff_spr = setTilesSprite(this.parent, "ice_2", this.x, this.y+1, {_frames: 20, opacity: 0});
    eff_spr.fadeTo(1,pps/8);
    eff_spr.scaleTo(0.8);
    eff_spr.changeFrameDelay = pps/24;

    eff_spr.onchangeframe = Utils.proxy(function(e)
    {
        if (e.target.currentFrameX == 18) e.target.destroy = true;
    }, this);
};

IceElement.prototype.applyExplosionImpact = function()
{
    this.playDestroyEffect();
    return this.getMainPoints();
};

IceElement.prototype.applySecondaryDestroyImpact = function()
{
    this.playDestroyEffect();
    return this.getMainPoints();
};

IceElement.prototype.applySecondaryMergeImpact = function()
{
    this.playDestroyEffect();
    return this.getMainPoints();
};

IceElement.setElementsUnfreeze = function(game_field)
{
    for (var j=0; j<game_field.rows; j++)
    {
        for (var i = 0; i < game_field.columns; i++)
        {
            if (!game_field.elements[j][i]) continue;
            game_field.elements[j][i].freezed = false;
        }
    }
};

IceElement.prototype.playDestroyEffect = function()
{
    GameField.addInAction();
    SoundUtils.playEffect("ice_emitter_destroyed");
    this.in_action = true;
    this.visible = false;
    this.doSetNullCallback(this);
    var spr = setTilesSprite(this.parent, "ice_3", this.x-2, this.y-2, {_frames: 36});
    spr.scaleTo(0.8);
    spr.changeFrameDelay = pps/30;
    //spr.changeFrameDelay = pps/24;
    spr.onchangeframe = Utils.proxy(function(e)
    {
        if (e.target.currentFrameX == 34)
        {
            this.destroyElement();
            e.target.destroy = true;
            this.in_action = false;
            this.endInAction();
        }
    }, this);
};