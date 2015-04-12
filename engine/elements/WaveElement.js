function WaveElement(props)
{
    this.element_type = "wave";
    this.start_timer = false;

    if (typeof props.type === "number") this.wave_type = props.type;
    else if (props.type.indexOf("Bomb") == 0) this.wave_type = 1;
    else if (props.type.indexOf("Ver") >= 0)
    {
        this.direction = "ver";
        this.wave_type = 2;
    }
    else if (props.type.indexOf("Hor") >= 0)
    {
        this.direction = "hor";
        this.wave_type = 2;
    }
    else if (props.type.indexOf("Cross") >= 0) this.wave_type = 3;

    Utils.callSuperConstructor(WaveElement, this, props);
    this.setAdditionalSkin();
}

Utils.extend(WaveElement, Element);

WaveElement.prototype.setSkin = function()
{
    var bitmap_name;
    if (this.wave_type == 1) bitmap_name = "s_bomb_"+this.color; //Bomb
    else bitmap_name = "s_base_"+this.color;

    if (this.wave_type == 2)
    {
        //Ver || Hor
        var right_arrow = AtlasSprite.set(this.null_spr, "s_blade_1", 2, 0);
        var left_arrow = AtlasSprite.set(this.null_spr, "s_blade_1", -2, 0, {scaleX: -1});
        if (this.direction == "ver") this.null_spr.rotation = Math.PI/2;
    }
    else if (this.wave_type == 3)
    {
        //Cross
        var right_arrow = AtlasSprite.set(this.null_spr, "s_blade_1", 2, 0);
        var left_arrow = AtlasSprite.set(this.null_spr, "s_blade_1", -2, 0, {scaleX: -1});
        var bottom_arrow = AtlasSprite.set(this.null_spr, "s_blade_1", 0, 2, {rotation: Math.PI/2});
        var top_arrow = AtlasSprite.set(this.null_spr, "s_blade_1", 0, -2, {rotation: -Math.PI/2});
    }

    this.setAtlasBitmap(bitmap_name);
};

WaveElement.prototype.applyDestroyImpact = function()
{
    var returned_points = 0;
    this.destroy_impact = true;
    this.in_action = true;
    GameField.addInAction();
    if (this.wave_type > 0) // если бомба заряжена взрываем
    {
        returned_points = this.getMainPoints();
        this.showExplosionPrepare();
        stage.setTimeout(Utils.proxy(function()
        {
            this.doExplosinCallback(this);
            this.endInAction();
        }, this), pps/2);
    }
    else
    {
        this.playDestroyEffect(); // бомба уже взорвана
        this.doSetNullCallback(this);
    }
    return returned_points;
};

WaveElement.prototype.applyExplosionImpact = function(final_callback)
{
    var returned_points = 0;
    this.explosion_impact = true;
    this.in_action = true;
    GameField.addInAction();
    if (this.wave_type > 0) // если бомба заряжена взрываем
    {
        returned_points = this.getMainPoints();
        this.showExplosionPrepare();
        stage.setTimeout(Utils.proxy(function()
        {
            this.doExplosinCallback(this);
            this.endInAction();
        }, this), pps/2);
    }
    else
    {
        this.playDestroyEffect(); // бомба уже взорвана
        this.doSetNullCallback(this);
        if (final_callback) final_callback();
    }
    return returned_points;
};

WaveElement.prototype.playDestroyEffect = function()
{
    this.in_action = true;
    this.fadeTo(0, pps/4, Easing.linear, Utils.proxy(function()
    {
        this.in_action = false;
        this.endInAction();
        this.destroyElement();
    }, this));
};

WaveElement.prototype.rotateWave = function()
{
    this.direction = this.direction == "hor" ? "ver" : "hor";
    this.null_spr.rotateBy(Math.PI/2, pps/2);
};

WaveElement.prototype.showExplosionPrepare = function()
{
    AtlasSprite.set(this.null_spr, "s_star_3_particles_psd", 0, 0);
};

WaveElement.showExplosionEffect = function(main_spr, element)
{
    var setBangArrow = function(i,j, direction)
    {
        var x = (i-4)*element.dX;
        var y = (j-4)*element.dY;
        var point_spr = setSprite(main_spr, null, x, y, {w: 1, h: 1});
        var wave_arrow = setTilesSprite(point_spr, "bomb_cross", 0, -20, {_frames: 16});
        wave_arrow.changeFrameDelay = pps/20;
        wave_arrow.onchangeframe = Utils.proxy(function(e)
        {
            if (e.target.currentFrameX == 14) point_spr.destroy = true;
        }, this);
        wave_arrow.moveTo(0, -80, pps*0.6, Easing.cubic.easeOut);
        wave_arrow.scaleTo(0.7);
        wave_arrow.scaleTo(1, pps/4);
        point_spr.rotation = -Math.PI/4*direction;
    };

    var setArrows = function()
    {
        if (element.wave_type && element.wave_type > 0)
        {
            if (element.wave_type == 2 && element.direction == "hor")
            {
                setBangArrow(element.i, element.j, 2);
                setBangArrow(element.i, element.j, 6);
            }
            else if (element.wave_type == 2 && element.direction == "ver")
            {
                setBangArrow(element.i, element.j, 0);
                setBangArrow(element.i, element.j, 4);
            }
            else if (element.wave_type == 3)
            {
                setBangArrow(element.i, element.j, 2);
                setBangArrow(element.i, element.j, 6);
                setBangArrow(element.i, element.j, 0);
                setBangArrow(element.i, element.j, 4);
            }
        }
        else if (element.super_wave_type && element.super_wave_type > 0)
        {
            if (element.super_wave_type == 1)
            {
                setBangArrow(element.i, element.j-1, 2);
                setBangArrow(element.i, element.j, 2);
                setBangArrow(element.i, element.j+1, 2);

                setBangArrow(element.i, element.j-1, 6);
                setBangArrow(element.i, element.j, 6);
                setBangArrow(element.i, element.j+1, 6);
            }
            else if (element.super_wave_type == 2)
            {
                setBangArrow(element.i, element.j-1, 2);
                setBangArrow(element.i, element.j, 2);
                setBangArrow(element.i, element.j+1, 2);

                setBangArrow(element.i, element.j-1, 6);
                setBangArrow(element.i, element.j, 6);
                setBangArrow(element.i, element.j+1, 6);

                setBangArrow(element.i+1, element.j, 0);
                setBangArrow(element.i, element.j, 0);
                setBangArrow(element.i-1, element.j, 0);

                setBangArrow(element.i+1, element.j, 4);
                setBangArrow(element.i, element.j, 4);
                setBangArrow(element.i-1, element.j, 4);
            }
            else if (element.super_wave_type == 3)
            {
                setBangArrow(element.i, element.j, 2);
                setBangArrow(element.i, element.j, 6);
                setBangArrow(element.i, element.j, 0);
                setBangArrow(element.i, element.j, 4);

                setBangArrow(element.i, element.j, 1);
                setBangArrow(element.i, element.j, 3);
                setBangArrow(element.i, element.j, 5);
                setBangArrow(element.i, element.j, 7);
            }
            else if (element.super_wave_type == 4)
            {
                setBangArrow(element.i, element.j-1, 2);
                setBangArrow(element.i, element.j, 2);
                setBangArrow(element.i, element.j+1, 2);

                setBangArrow(element.i, element.j-1, 6);
                setBangArrow(element.i, element.j, 6);
                setBangArrow(element.i, element.j+1, 6);

                setBangArrow(element.i+1, element.j, 0);
                setBangArrow(element.i, element.j, 0);
                setBangArrow(element.i-1, element.j, 0);

                setBangArrow(element.i+1, element.j, 4);
                setBangArrow(element.i, element.j, 4);
                setBangArrow(element.i-1, element.j, 4);

                setBangArrow(element.i, element.j, 1);
                setBangArrow(element.i, element.j, 3);
                setBangArrow(element.i, element.j, 5);
                setBangArrow(element.i, element.j, 7);
            }
            else if (element.super_wave_type == 11)
            {
                setBangArrow(element.i+1, element.j, 0);
                setBangArrow(element.i, element.j, 0);
                setBangArrow(element.i-1, element.j, 0);
                setBangArrow(element.i+1, element.j, 4);
                setBangArrow(element.i, element.j, 4);
                setBangArrow(element.i-1, element.j, 4);
            }
        }
    };

    var setBang = function()
    {
        if ((element.wave_type && element.wave_type > 0) ||
            element.super_wave_type == 5)
        {
            var spr = setTilesSprite(main_spr, "bomb_3", element.x, element.y, {_frames: 40});
            spr.changeFrameDelay = pps/30;
            spr.addEventListener("changeframe", function(e)
            {
				if (e.target.currentFrameX == 38) e.target.destroy = true;
            });
			
			spr.addEventListener("enterframe", function(e) {if(e.target.static) e.target.setStatic(false);});
        }
        if (element.super_wave_type && element.super_wave_type > 0)
        {
            var spr = setTilesSprite(main_spr, "bomb_super", element.x, element.y, {_frames: 36});
            spr.changeFrameDelay = pps/30;
            spr.addEventListener("changeframe", function(e)
            {
                if (e.target.currentFrameX == 34) e.target.destroy = true;
            });
			
			spr.addEventListener("enterframe", function(e) {if(e.target.static) e.target.setStatic(false);});
        }
    };
    setBang();
    setArrows();
};

WaveElement.createSuperWave = function(type, color)
{
    var super_w = new Sprite(null, 1, 1);
    if (type == 6)
    {
        AtlasSprite.set(super_w, "s_ch_0_bonus_vodovotot_psd", 0, 0);
        AtlasSprite.set(super_w, "s_ch_1_bonus_vodovotot_psd", 0, 0);
        AtlasSprite.set(super_w, "s_ch_2_bonus_vodovotot_psd", 0, 0);
    }

    if (type == 3)
    {
        AtlasSprite.set(super_w, "s_base_"+color, 0, 0);
        AtlasSprite.set(super_w, "s_base", 0, 0);
    }
    else if (type < 6 || type == 11) AtlasSprite.set(super_w, "s_bomb_"+color, 0, 0);

    var s = 2;
    if (type == 1)
    {
        var right_arrow = AtlasSprite.set(super_w, "s_blade_1", s, 0);
        var left_arrow = AtlasSprite.set(super_w, "s_blade_1", -s, 0, {scaleX: -1});
    }
    else if (type == 11)
    {
        var bottom_arrow = AtlasSprite.set(super_w, "s_blade_1", 0, s, {rotation: Math.PI/2});
        var top_arrow = AtlasSprite.set(super_w, "s_blade_1", 0, -s, {rotation: -Math.PI/2});
    }
    else if (type == 2)
    {
        var right_arrow = AtlasSprite.set(super_w, "s_blade_2", s, 0);
        var left_arrow = AtlasSprite.set(super_w, "s_blade_2", -s, 0, {scaleX: -1});
        var bottom_arrow = AtlasSprite.set(super_w, "s_blade_2", 0, s, {rotation: Math.PI/2});
        var top_arrow = AtlasSprite.set(super_w, "s_blade_2", 0, -s, {rotation: -Math.PI/2});
    }
    else if (type == 3 || type == 4)
    {
        var right_arrow = AtlasSprite.set(super_w, "s_blade_4", s, 0);
        var left_arrow = AtlasSprite.set(super_w, "s_blade_4", -s, 0, {scaleX: -1});
        var bottom_arrow = AtlasSprite.set(super_w, "s_blade_4", 0, s, {rotation: Math.PI/2});
        var top_arrow = AtlasSprite.set(super_w, "s_blade_4", 0, -s, {rotation: -Math.PI/2});

        var d = 2;
        var top_right = AtlasSprite.set(super_w, "s_blade_3", d, -d);
        var top_left = AtlasSprite.set(super_w, "s_blade_3", -d, -d, {rotation: -Math.PI/2});
        var bottom_right = AtlasSprite.set(super_w, "s_blade_3", d, d, {rotation: Math.PI/2});
        var bottom_left = AtlasSprite.set(super_w, "s_blade_3", -d, d, {rotation: Math.PI});
    }
    AtlasSprite.set(super_w, "s_star_3_particles_psd", 0, 0);

    super_w.getMainPoints = function()
    {
        var returned_points = 0;
        if (this.super_wave_type == 1 || this.super_wave_type == 11)
        {
            returned_points = UserSettings.elementPoints.bomb +
                                UserSettings.elementPoints.wave;
        }
        else if (this.super_wave_type == 2)
        {
            returned_points = UserSettings.elementPoints.wave*2;
        }
        else if (this.super_wave_type == 3)
        {
            returned_points = UserSettings.elementPoints.wave +
                                UserSettings.elementPoints.cross;
        }
        else if (this.super_wave_type == 5)
        {
            returned_points = UserSettings.elementPoints.bomb*2;
        }
        else if (this.super_wave_type == 4)
        {
            returned_points = UserSettings.elementPoints.cross*2;
        }
        return returned_points;
    };
    return super_w;
};