function WallElement(props)
{
    this.element_type = "wall";
    this.generated = props.generated;
    //обрезаем цвета для Wall и DWall
    if (props.type.indexOf("Wall") == 0)
    {
        props.type = props.type.substr(0, props.type.length - 2);
        this.wall_type = 1;
    }
    else if (props.type.indexOf("DWall") == 0)
    {
        props.type = props.type.substr(0, props.type.length - 2);
        this.wall_type = 2;
    }
    // если в типе указано DWall или CWall - стена двойная. иначе одинарная
    else if (props.type.indexOf("CWall") == 0) this.wall_type = 3; // тройная стена. цветная
    else if (props.type.indexOf("StrongWall") >= 0) this.wall_type = -1; //strong wall
    Utils.callSuperConstructor(WallElement, this, props);

    this.setAdditionalSkin();
}

Utils.extend(WallElement, Element);

WallElement.prototype.applySecondaryDestroyImpact = function(color)
{
    var returned_points = 0;
    this.secondary_destroy_impact = true;
    if (this.wall_type < 1) return;
    if (this.chains > 0)
    {
        if ((this.color && this.color == color) || !this.color)
        {
            returned_points = this.getAdditionalPoints();
            this.playDestroyChainEffect(this.chains*1);
            this.chains--;
            this.setAdditionalSkin();
        }
    }
    else
    {
        if ((this.wall_type == 3 && this.color == color) || this.wall_type == 2)
        {
            returned_points = this.getMainPoints();
            this.wall_type--;
            this.color = false;
            this.setSkin();
            this.playChangeSkinEffect();
        }
        else if (this.wall_type == 1)
        {
            returned_points = this.getMainPoints();
            this.wall_type--;
            this.playChangeSkinEffect(true);
        }
    }
    return returned_points;
};

WallElement.prototype.applySecondaryMergeImpact = function(color)
{
    var returned_points = 0;
    this.secondary_merge_impact = true;
    if (this.wall_type < 1) return;
    if (this.chains > 0)
    {
        if ((this.color && this.color == color) || !this.color)
        {
            returned_points = this.getAdditionalPoints();
            this.playDestroyChainEffect(this.chains*1);
            this.chains--;
            this.setAdditionalSkin();
        }
    }
    else
    {
        if ((this.wall_type == 3 && this.color == color) || this.wall_type == 2)
        {
            returned_points = this.getMainPoints();
            this.wall_type--;
            this.color = false;
            this.setSkin();
            this.playChangeSkinEffect();
        }
        else if (this.wall_type == 1)
        {
            returned_points = this.getMainPoints();
            this.wall_type--;
            this.playChangeSkinEffect(true);
        }
    }
    return returned_points;
};

WallElement.prototype.applyExplosionImpact = function()
{
    var returned_points = 0;
    if (this.wall_type > 0)
    {
        if (this.chains > 0)
        {
            returned_points = this.getAdditionalPoints();
            this.playDestroyChainEffect(this.chains*1);
            this.chains--;
            this.setAdditionalSkin();
        }
        else
        {
            returned_points = this.getMainPoints();
            this.wall_type--;
            if (this.wall_type == 0) this.playChangeSkinEffect(true);
            else
            {
                this.color = false;
                this.playChangeSkinEffect();
                this.setSkin();
            }
        }
    }
    else if (this.wall_type < 0)
    {
        this.playChangeSkinEffect(true);
        returned_points = this.getMainPoints();
    }
    return returned_points;
};

WallElement.prototype.playKnifeBonusDestroyEffect = function()
{
    var returned_points = 0;
    if (this.chains > 0)
    {
        returned_points = this.getAdditionalPoints();
        this.playDestroyChainEffect(this.chains*1);
        this.chains--;
        this.setAdditionalSkin();
    }
    else
    {
        returned_points = this.getMainPoints();
        this.wall_type--;
        if (this.wall_type == 0) this.playChangeSkinEffect(true);
        else
        {
            this.color = false;
            this.playChangeSkinEffect();
            this.setSkin();
        }
    }
    return returned_points;
};

WallElement.prototype.setSkin = function()
{
    var bitmap_name;
    if (this.wall_type == 3) bitmap_name = "s_wall_c_"+this.color;
    else if (this.wall_type == 2) bitmap_name = "s_wall_d";
    else if (this.wall_type == 1 && !this.generated) bitmap_name = "s_wall"; // обычная одинарная стена
    else if (this.wall_type == -1) bitmap_name = "s_strong_wall";
    else if (this.wall_type == 1 && this.generated) bitmap_name = "s_stuff_chip"; // после генерации стены
    this.setAtlasBitmap(bitmap_name);
};

WallElement.prototype.playChangeSkinEffect = function(destroy)
{
    if (destroy)
    {
        this.fadeTo(0, pps/4, Easing.linear, Utils.proxy(function()
        {
            this.destroyElement();
            this.doSetNullCallback(this);
        }, this));
        if (!this.generated) this.levelTargetDone();
    }
    GameField.addInAction();
    this.in_action = true;
    var x = this.getAbsolutePosition().x;
    var y = this.getAbsolutePosition().y;
    var ef = setTilesSprite(stage, "block_smoke_sprite", x, y, {_frames: 20});
    ef.changeFrameDelay = pps/30;
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

WallElement.prototype.playDestroyEffect = function()
{
    this.levelTargetDone();
    this.destroyElement();
};