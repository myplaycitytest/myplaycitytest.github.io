function GameField(c)
{
    this.config = c;

    this.rows = 9;
    this.columns = 9;
    this.last_j = 0;
    this.in_action = 0;

    this.cells = [];
    this.elements = [];
    this.random_colors = [];
    this.active_color = "";
    this.main_spr = null;
    this.dX = 28;
    this.dY = 28;
    this.queue = [];
    this.secondary_queue = [];
    this.ai_mode = false;
    this.final_explosions = false;
    this.rows_values = [];
    this.set();
}

GameField.setActions0EndCallback = function(f)
{
    if (typeof f == "undefined") return;
    GameField.prototype.actions0EndCallback = f;
};

GameField.setActions1EndCallback = function(f)
{
    if (typeof f == "undefined") return;
    GameField.prototype.actions1EndCallback = f;
};

GameField.setActions2EndCallback = function(f)
{
    if (typeof f == "undefined") return;
    GameField.prototype.actions2EndCallback = f;
};

GameField.setAddPointsCallback = function(f)
{
    if (typeof f == "undefined") return;
    GameField.prototype.addPointsCallback = f;
};

GameField.prototype.set = function()
{
    this.main_cells_spr = setSprite(stage, null, center.x+48, center.y-8, {width: 1, height: 1});
    this.main_spr = setSprite(stage, null, center.x+48, center.y-8, {width: 1, height: 1});

    this.rows = this.config.Grid.Height;
    this.columns = this.config.Grid.Width;
    this.element_radius = this.config.radius;

    for (var i=0; i<this.config.AvailableChips.length; i++)
    {
        var color = this.config.AvailableChips[i];
        this.random_colors.push(color[color.length-1]);
    }

    for (var j=0; j<this.rows; j++)
    {
        this.cells[j] = [];
        this.elements[j] = [];
        for (var i=0; i<this.columns; i++)
        {
            this.cells[j].push(null);
            this.elements[j].push(null);
        }
    }

    Element.setClickCallback(Utils.proxy(this.elementClickHandler, this));
    Element.setStepEndCallback(Utils.proxy(this.checkElementActionsEnd, this));

    Element.setExplosionCallback(Utils.proxy(this.doExplosion, this));
    Element.setElementNullCallback(Utils.proxy(this.setElementNull, this));

    this.setCells();
    this.setElements();
    this.addEmptyCellElements();
    this.playStartAnimation();
};

GameField.prototype.playStartAnimation = function()
{
    this.playStartCellsAnimation();
};

GameField.prototype.playStartCellsAnimation = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i=0; i<this.columns; i++)
        {
            if (this.cells[j][i]) this.cells[j][i].playStartAnimation(Utils.proxy(this.checkStartCellsAnimationEnd, this));
        }
    }
};

GameField.prototype.checkStartCellsAnimationEnd = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i=0; i<this.columns; i++)
        {
            if (this.cells[j][i] && this.cells[j][i].in_action) return false;
        }
    }
    this.endStartCellsAnimation();
};

GameField.prototype.endStartCellsAnimation = function()
{
    this.main_cells_spr.setStatic(true);
    this.playStartElementsAnim();
};

GameField.prototype.playStartElementsAnim = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i=0; i<this.columns; i++)
        {
            if (this.elements[j][i]) this.elements[j][i].playStartAnimation(Utils.proxy(this.checkStartElementsAnimEnd, this));
        }
    }
};

GameField.prototype.checkStartElementsAnimEnd = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i=0; i<this.columns; i++)
        {
            if (this.elements[j][i] && this.elements[j][i].in_action) return false;
        }
    }
    this.endStartElementsAnim();
};

GameField.prototype.endStartElementsAnim = function()
{
    LEVEL.showPreLevelPopup();
};

GameField.prototype.setCells = function()
{
    var config_cells = this.config.Grid.Cells;
    for (var i=0; i<config_cells.length; i++)
    {
        var config_cell = config_cells[i];
        if (config_cell.Solidity == 0) continue;
        var cell = new Cell({i: config_cell.PosX*1,
                            j: config_cell.PosY*1-1,
                            type: config_cell.Solidity*1,
                            dX: this.dX,
                            dY: this.dY});

        this.main_cells_spr.addChild(cell);
        this.cells[config_cell.PosY*1-1][config_cell.PosX*1] = cell;
    }
};

GameField.prototype.setElements = function()
{
    var config_elements = this.config.Chips;
    for (var n=0; n < config_elements.length; n++)
    {
        var config_element = config_elements[n];
        var i = config_element.PosX*1;
        var j = config_element.PosY*1-1;
        if (j > this.last_j) this.last_j = j;
        var element = Element.add({i: i,
            j: j,
            type: config_element.Type+"",
            dX: this.dX,
            dY: this.dY,
            random_colors: this.random_colors,
            radius: this.element_radius,
            config: config_element});

        this.main_spr.addChild(element);
        this.elements[j][i] = element;

        if (!this.rows_values.isPresentValue(element.i)) this.rows_values.push(element.i);
    }
};

GameField.prototype.addEmptyCellElements = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i=0; i<this.columns; i++)
        {
            if (this.cells[j][i] && !this.elements[j][i])
            {
                var element = Element.add({i: i,
                    j: j,
                    type: "Random",
                    dX: this.dX,
                    dY: this.dY,
                    random_colors: this.random_colors});

                this.main_spr.addChild(element);
                this.elements[j][i] = element;
            }
        }
    }
};

GameField.prototype.elementClickHandler = function(main_el)
{
    if (!this.ai_mode) LEVEL.unFreezeAllElements();
    this.in_action = 0;
    this.active_color = main_el.color;
    this.queue = [];
    this.clearHintTimeout();
    this.hideHint();
    this.checkNeighbors(main_el, this.queue);
    this.resetChecking();

    if (this.queue.length == 1) this.shakeElement();
    else
    {
        var result = this.analyzeQueue(main_el);
        if (result.action_type == 1 ||
            result.action_type == 2) this.mergeIntoSuperElement(result.param);
        else if (result.action_type == 3) this.mergeIntoWaveElement(result.param);
        else if (result.action_type == 4) this.playDestroyQueue();
        this.resetChecking();
        this.doElementActions0();
        if (!this.isWavePresentInQueue) this.rotateWaves();
    }
};

GameField.prototype.isWavePresentInQueue = false;
GameField.prototype.isOnlyChainsElements = false;

GameField.prototype.resetChecking = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            if (this.elements[j][i]) this.elements[j][i].checking = false;
        }
    }
};

GameField.prototype.checkNeighbors = function(element, arr)
{
    arr.push(element);
    element.checking = true;

    var el_j = element.j;
    var el_i = element.i;
    for (var j=-1;j<2;j++)
    {
        for (var i=-1; i<2; i++)
        {
            if (i == j || i == j*(-1)) continue;
            if (el_j+j >= this.rows) continue;
            if (el_j+j < 0) continue;
            if (el_i+i >= this.columns) continue;
            if (el_i+i < 0) continue;
            else if (!this.elements[el_j+j][el_i+i]) continue; // справа пусто, null
            else if (this.elements[el_j+j][el_i+i].checking) continue; // справа элемент уже проверен
            else if (this.elements[el_j+j][el_i+i].element_type != "simple" &&
                this.elements[el_j+j][el_i+i].element_type != "wave" &&
                this.elements[el_j+j][el_i+i].element_type != "chain_bomb") continue; // если не simple и не бомба
            else if (this.elements[el_j+j][el_i+i].color != element.color) continue; // справа элемент другого цвета
            //else if (this.elements[el_j+1][el_i].chains > 0) continue; //если есть chains
            else if (this.elements[el_j+j][el_i+i].ice == 3) continue; //если заморожен
            else this.checkNeighbors(this.elements[el_j+j][el_i+i], arr);
        }
    }
};

GameField.prototype.playDestroyQueue = function()
{
    SoundUtils.playEffect("simple_chip_destroyed");

    var action_points = 0;
    action_points += this.applyImpactToElements(this.queue);
    action_points += this.applySecondaryImpact(this.queue);
    action_points += this.applyImpactToCells(this.queue);

    this.addPoints(this.queue[this.queue.length-1], action_points, 1);
};

GameField.prototype.analyzeQueue = function()
{
    var action_type, param;
    this.isWavePresentInQueue = false;
    this.isOnlyChainsElements = true;
    var p = {simple: 0, bomb: 0, wave: 0, cross: 0, wave_v: 0, wave_h: 0};
    for (var i=0; i<this.queue.length; i++)
    {
        var element_type = this.queue[i].element_type;
        if (element_type == "simple" || element_type == "chain_bomb")
        {
            p.simple++;
            if (element_type == "simple" && this.queue[i].chains == 0) this.isOnlyChainsElements = false;
        }
        else
        {
            this.isOnlyChainsElements = false;
            this.isWavePresentInQueue = true;
            var wave_type = this.queue[i].wave_type;
            if (wave_type == 1) p.bomb++;
            else if (wave_type == 2)
            {
                p.wave++;
                if (this.queue[i].direction == "hor") p.wave_h++;
                if (this.queue[i].direction == "ver") p.wave_v++;
            }
            else if (wave_type == 3) p.cross++;
        }
    }

    var new_element = 0, new_wave_type, super_type;
    if (p.simple >= 5)
    {
        new_element = 1;
        if (p.simple >= 7) new_wave_type = "cross";
        else if (p.simple == 6) new_wave_type = "wave_h";
        else if (p.simple == 5) new_wave_type = "bomb";
    }

    if (p.bomb + p.wave + p.cross + new_element > 2)
    {
        super_type = 6;
        action_type = 1;
        param = super_type;
    }
    else if (p.bomb + p.wave + p.cross + new_element == 2)
    {
        if (p.hasOwnProperty(new_wave_type)) p[new_wave_type]++;
        if (p.bomb == 2) super_type = 5;
        else if (p.wave == 2) super_type = 2;
        else if (p.wave_h == 2) super_type = 2;
        else if (p.wave_v == 2) super_type = 2;
        else if (p.wave_v + p.wave_h == 2) super_type = 2;
        else if (p.cross == 2) super_type = 4;
        else if (p.bomb + p.wave_h == 2) super_type = 1;
        else if (p.bomb + p.wave_v == 2) super_type = 11;
        else if (p.bomb + p.cross == 2) super_type = 2;
        else if (p.wave + p.cross == 2 || p.wave_h + p.cross == 2 || p.wave_v + p.cross == 2) super_type = 3;

        action_type = 2;
        param = super_type;
    }
    else if (new_element == 1)
    {
        action_type = 3;
        param = new_wave_type;
    }
    else action_type = 4;
    return {action_type: action_type, param: param};
};

GameField.prototype.rotateWaves = function()
{
    if (this.queue.length == 1) return false;
    for (var j=0; j < this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            if (!this.elements[j][i]) continue;
            if (this.elements[j][i].checking) continue;
            if (this.elements[j][i].in_action) continue;
            if (this.elements[j][i].element_type == "wave" && this.elements[j][i].wave_type == 2) this.elements[j][i].rotateWave();
        }
    }
};

GameField.prototype.addPoints = function(first_el, points, from)
{
    if (points == 0) return;
    var font;
    if (from == 1) font = "font_greek_scores_chips_medium_mip2"; // blue
    else if (from == 2) font = "font_greek_scores_chips_large_mip2"; // green
    else font = "font_greek_scores_chips_mip1"; //yellow

    var obj = first_el.getAbsolutePosition();
    var x = obj.x;
    var y = obj.y;

    var t = setBitmapText(stage, font, "+"+points, x-5, y-20, {align: 2, opacity: 0});
    t.fadeTo(1, pps/2, Easing.linear, function()
    {
        t.fadeTo(0, pps/2);
    });
    t.moveTo(x-5, y-60, pps, Easing.linear, function()
    {
        t.write("");
        return false;
    });
    this.addPointsCallback(points);
};

GameField.prototype.shakeElement = function()
{
    this.queue[0].doShake();
    SoundUtils.playEffect("wrong_click");
};

GameField.prototype.mergeIntoWaveElement = function(new_type)
{
    SoundUtils.playEffect("group_bonus");
    var action_points = 0;
    action_points += this.applyImpactToCells(this.queue);
    action_points += this.mergeElements(Utils.proxy(function()
    {
        this.createWaveElement(new_type);
    }, this));

    this.addPoints(this.queue[0], action_points, 3);
};

GameField.prototype.mergeIntoSuperElement = function(new_type)
{
    SoundUtils.playEffect("group_bonus");
    var action_points = 0;
    action_points += this.applyImpactToCells(this.queue);
    action_points += this.mergeElements(Utils.proxy(function()
    {
        this.createAndUseSuperWave(new_type);
    }, this));

    this.addPoints(this.queue[0], action_points, 3);
};

GameField.prototype.createWaveElement = function(wave_type)
{
    var i = this.queue[0].i;
    var j = this.queue[0].j;
    var type = (function(wave_type)
    {
        if (wave_type == "bomb") return "Bomb_";
        else if (wave_type == "wave_h") return "WaveHor_";
        else if (wave_type == "wave_v") return "WaveVer_";
        else if (wave_type == "cross") return "Cross_";
    })(wave_type);

    type += this.active_color;
    var element = Element.add({i: i,
                                j: j,
                                type: type,
                                dX: this.dX,
                                dY: this.dY});
    element.opacity = 1;
    this.main_spr.addChild(element);
    element.in_action = true;
    this.elements[j][i] = element;
};

GameField.prototype.createAndUseSuperWave = function(type)
{
    this.in_action++;
    var super_wave = WaveElement.createSuperWave(type,
                                                this.active_color+"",
                                                this.queue[0].i*1,
                                                this.queue[0].j*1);
    super_wave.opacity = 1;
    super_wave.x = this.queue[0].x*1;
    super_wave.y = this.queue[0].y*1;
    super_wave.i = this.queue[0].i*1;
    super_wave.j = this.queue[0].j*1;
    super_wave.dX = this.dX;
    super_wave.dY = this.dY;
    super_wave.super_wave_type = type;

    this.main_spr.addChild(super_wave);

    stage.setTimeout(Utils.proxy(function()
    {
        if (type == 6) this.doWhirlpool(super_wave);
        else
        {
            super_wave.destroy = true;
            this.doExplosion(super_wave);
        }
        this.in_action--;
        this.checkElementActionsEnd();
    }, this), pps);
};

GameField.prototype.doExplosion = function(element) {
    if (!element.wave_type) element.wave_type = 0;
    if (!element.super_wave_type) element.super_wave_type = 0;

    var track;
    if (element.wave_type == 1) track = "bomb_destroyed";
    else if (element.wave_type == 2) track = "wave_destroyed";
    else if (element.wave_type == 3) track = "cross_destroyed";

    if (element.super_wave_type > 0) track = "bomb_destroyed";

    if (track) SoundUtils.playEffect(track);

    var coords_arr = (Utils.proxy(function (element) {
        var arr = [];
        for (var j = 0; j < this.rows; j++) {
            for (var i = 0; i < this.columns; i++) {

                if ((element.wave_type == 2 && element.direction == "hor") ||
                    element.wave_type == 3 ||
                    element.super_wave_type == 1 ||
                    element.super_wave_type == 2 ||
                    element.super_wave_type == 3 ||
                    element.super_wave_type == 4) {
                    if (j == element.j) arr.push({i: i, j: j});
                }

                if (element.super_wave_type == 1 ||
                    element.super_wave_type == 2 ||
                    element.super_wave_type == 4) {
                    if (j == element.j + 1) arr.push({i: i, j: j});
                    if (j == element.j - 1) arr.push({i: i, j: j});
                }

                if ((element.wave_type == 2 && element.direction == "ver") ||
                    element.wave_type == 3 ||
                    element.super_wave_type == 11 ||
                    element.super_wave_type == 2 ||
                    element.super_wave_type == 3 ||
                    element.super_wave_type == 4) {
                    if (i == element.i) arr.push({i: i, j: j});
                }

                if (element.super_wave_type == 11 ||
                    element.super_wave_type == 2 ||
                    element.super_wave_type == 4) {
                    if (i == element.i - 1) arr.push({i: i, j: j});
                    if (i == element.i + 1) arr.push({i: i, j: j});
                }

                if (element.super_wave_type == 3 ||
                    element.super_wave_type == 4) {
                    if (i - element.i == j - element.j) arr.push({i: i, j: j});
                    if (i - element.i == (j - element.j) * (-1)) arr.push({i: i, j: j});
                }

                if (element.wave_type == 1 ||
                    element.super_wave_type == 5) {
                    if ((i - element.i < 2) &&
                        (i - element.i > -2) &&
                        (j - element.j < 2) &&
                        (j - element.j > -2)) arr.push({i: i, j: j});
                }

                if (element.super_wave_type == 5) {
                    if ((i - element.i < 2) && (i - element.i > -2) && (j - element.j == 2 || j - element.j == -2)) arr.push(this.elements[j][i]);
                    if ((j - element.j < 2) && (j - element.j > -2) && (i - element.i == 2 || i - element.i == -2)) arr.push(this.elements[j][i]);
                }
            }
        }
        return arr;
    }, this))(element);

    var action_points = 0;
    WaveElement.showExplosionEffect(this.main_spr, element);

    action_points += element.getMainPoints();

    element.wave_type = 0; // разряжаем бомбу, что б не взорвалась второй раз

    var el_arr = [];
    var cells_arr = [];

    for (var i = 0; i < coords_arr.length; i++) {
        var coord = coords_arr[i];
        if (!coords_arr[i]) continue;
        if (this.elements[coord.j][coord.i]) el_arr.push(this.elements[coord.j][coord.i]);
        if (this.cells[coord.j][coord.i]) cells_arr.push(this.cells[coord.j][coord.i]);
    }

    action_points += this.applyExplosionImpactToElements(el_arr);
    action_points += this.applyImpactToCells(cells_arr);
    this.addPoints(el_arr[0], action_points, 2);

};

GameField.prototype.explodeAllWaves = function(callback)
{
    Level.lock();
    this.final_explosions = true;
    for (var j=0; j < this.rows; j++)
    {
        for (var i=0; i < this.columns; i++)
        {
            if (!this.elements[j][i]) continue;
            if (this.elements[j][i].element_type == "wave" && this.elements[j][i].wave_type > 0)
            {
                this.elements[j][i].applyExplosionImpact(Utils.proxy(function()
                {
                    this.explodeAllWaves(callback);
                }, this));
                return;
            }
        }
    }
    this.endExplodeAllWaves(callback);
};

GameField.prototype.endExplodeAllWaves = function(callback)
{
    if (this.isInAction()) return false;
    Level.unLock();
    if (typeof callback === "function") callback();
    if (this.bomb_bonus_mode)
    {
        this.bomb_bonus_mode = false;
        LEVEL.bomb_bonus_mode = false;
    }
};

GameField.prototype.doWhirlpool = function(element)
{
    var _findElements = function(el, game_field)
    {
        var el_cnt = 4;
        var temp_arr = [], selected_elements = [];
        for (var j=0; j<game_field.rows; j++)
        {
            for (var i=0; i<game_field.columns; i++)
            {
                if (i == el.i && j == el.j) continue;
                var element = game_field.elements[j][i];
                if (!element) continue;
                if (element.element_type != "simple") continue;
                if (element.chains > 0 || element.ice > 0) continue;
                temp_arr.push({i: element.i*1, j: element.j*1});
            }
        }

        while (temp_arr.length > 0 && selected_elements.length < el_cnt)
        {
            var el = getRandomValue(temp_arr);
            selected_elements.push(el);
            temp_arr.deleteElement(el);
        }
        return selected_elements;
    }

    var _findCells = function(el, game_field)
    {
        var c_cnt = 4;
        var temp_arr = [], selected_elements = [];
        for (var j=0; j<game_field.rows; j++)
        {
            for (var i=0; i<game_field.columns; i++)
            {
                if (i == el.i && j == el.j) continue;
                var cell = game_field.cells[j][i];
                if (!cell) continue;
                if (cell.type < 2) continue;
                temp_arr.push({i: cell.i*1, j: cell.j*1});
            }
        }

        while (temp_arr.length > 0 && selected_elements.length < c_cnt)
        {
            var c = getRandomValue(temp_arr);
            selected_elements.push(c);
            temp_arr.deleteElement(c);
        }
        return selected_elements;
    }

    var el_coords = _findElements(element, this);
    var c_coords = _findCells(element, this);
    this.doWhirlpoolEffect(el_coords, c_coords, element);
    this.setElementNull(element);
};

GameField.prototype.doWhirlpoolEffect = function(el_coords, c_coords, super_wave)
{
    super_wave.effect_spr = setTilesSprite(this.main_spr, "whirlpool_effect", super_wave.x, super_wave.y, {_frames: 24});
    super_wave.effect_spr.changeFrameDelay = pps/24;
    super_wave.effect_spr.onchangeframe = function(e)
    {
        if (e.target.currentFrameX == 22)
        {
            e.target.animDirection = -1;
            e.target.scaleX *= 0.9;
            e.target.scaleY *= 0.9;
        }
    };

    var action_points = 0, element_points;
    for (var n=0; n<el_coords.length; n++)
    {
        var j = el_coords[n].j;
        var i = el_coords[n].i;
        element_points = this.elements[j][i].doWhirlpoolEffect(super_wave, this);
        if (typeof element_points == "number") action_points += element_points;
    }

    for (var n=0; n<c_coords.length; n++)
    {
        var j = c_coords[n].j;
        var i = c_coords[n].i;
        element_points = this.cells[j][i].doWhirlpoolEffect(super_wave, this);
        if (typeof element_points == "number") action_points += element_points;
    }

    this.addPoints(super_wave, action_points, 3);
};

GameField.prototype.checkWhirlpoolEffectEnd = function(super_wave)
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            if (this.elements[j][i] && this.elements[j][i].in_action) return false;
            if (this.cells[j][i] && this.cells[j][i].in_action) return false;
        }
    }
    this.endWhirlpoolEffect(super_wave);
};

GameField.prototype.endWhirlpoolEffect = function(super_wave)
{
    super_wave.fadeTo(0, pps/2, Easing.linear, Utils.proxy(function()
    {
        super_wave.destroy = true;
        super_wave.effect_spr.destroy = true;
        this.endElementActions();
    }, this));
};

GameField.prototype.applyImpactToElements = function(arr)
{
    var action_points = 0, element_points;
    for (var i=0; i<arr.length; i++)
    {
        element_points = arr[i].applyDestroyImpact();
        if (typeof element_points == "number") action_points += element_points;
    }
    if (this.isOnlyChainsElements) stage.setTimeout(Utils.proxy(this.endElementActions2, this), pps);
    return action_points;
};

GameField.prototype.applyExplosionImpactToElements = function(arr)
{
    var action_points = 0, element_points;
    for (var i=0; i<arr.length; i++)
    {
        element_points = arr[i].applyExplosionImpact();
        if (typeof element_points == "number") action_points += element_points;
    }
    return action_points;
};

GameField.prototype.mergeElements = function(create_callback)
{
    var action_points = 0, element_points;
    for (var i=0; i<this.queue.length; i++)
    {
        this.queue[i].applyMergeImpact();
        element_points = this.queue[i].mergeToElement(this.queue[0]);
        if (typeof element_points == "number") action_points += element_points;
        this.setElementNull(this.queue[i]);
    }
    this.applySecondaryMergeImpacts(this.queue);
    this.setElementsNull(this.queue);
    if (create_callback) create_callback();
    return action_points;
};

GameField.prototype.applySecondaryImpact = function(arr)
{
    var temp = [], color = arr[0].color+"";
    this.secondary_queue = [];
    for (var n = 0; n < arr.length; n++)
    {
        var element = arr[n];
        if (element.ice > 0) continue;
        if (element.chains > 0) continue;
        for (var j = 0; j < this.rows; j++)
        {
            for (var i = 0; i < this.columns; i++)
            {
                if (!this.elements[j][i]) continue;
                if (i - element.i == 1 && j == element.j) temp.push(this.elements[j][i]);
                if (i - element.i == -1 && j == element.j) temp.push(this.elements[j][i]);
                if (j - element.j == 1 && i == element.i) temp.push(this.elements[j][i]);
                if (j - element.j == -1 && i == element.i) temp.push(this.elements[j][i]);
            }
        }
    }

    for (var i=0; i<temp.length; i++)
    {
        var exit = false;
        for (var j=0; j<this.secondary_queue.length; j++)
        {
            if (temp[i].i == this.secondary_queue[j].i &&
                temp[i].j == this.secondary_queue[j].j)
            {
                exit = true;
                break;
            }
        }
        if (exit) continue;
        else this.secondary_queue.push(temp[i]);
    }

    var action_points = 0, element_points;
    for (var i=0; i<this.secondary_queue.length; i++)
    {
        element_points = this.secondary_queue[i].applySecondaryDestroyImpact(color, Utils.proxy(this.setElementNull, this));
        if (typeof element_points == "number") action_points += element_points;
    }
    return action_points;
};

GameField.prototype.applySecondaryMergeImpacts = function(arr)
{
    var temp = [], color = arr[0].color+"";
    this.secondary_queue = [];

    for (var j=0; j<this.rows; j++)
    {
        for (var i=0; i<this.columns; i++)
        {
            for (var n=0; n<arr.length; n++)
            {
                var element = arr[n];
                if (!this.elements[j][i]) continue;
                if (i-element.i == 1 && j == element.j) temp.push(this.elements[j][i]);
                if (i-element.i == -1 && j == element.j) temp.push(this.elements[j][i]);
                if (j-element.j == 1 && i == element.i) temp.push(this.elements[j][i]);
                if (j-element.j == -1 && i == element.i) temp.push(this.elements[j][i]);
            }
        }
    }

    for (var i=0; i<temp.length; i++)
    {
        var exit = false;
        for (var j=0; j<this.secondary_queue.length; j++)
        {
            if (temp[i] === this.secondary_queue[j])
            {
                exit = true;
                break;
            }
        }
        if (exit) continue;
        else this.secondary_queue.push(temp[i]);
    }
    var action_points = 0, element_points;
    for (var i=0; i<this.secondary_queue.length; i++)
    {
        element_points = this.secondary_queue[i].applySecondaryMergeImpact(color);
        if (typeof element_points == "number") action_points += element_points;
    }
    return action_points;
};

GameField.prototype.applyImpactToCells = function(arr)
{
    var action_points = 0, element_points;
    for (var i=0; i<arr.length; i++)
    {
        element_points = this.cells[arr[i].j*1][arr[i].i*1].applyImpact();
        if (typeof element_points == "number") action_points += element_points;
    }
    return action_points;
};

GameField.prototype.setElementsNull = function(arr)
{
    for (var i=0; i<arr.length; i++) this.elements[arr[i].j][arr[i].i] = null;
};

GameField.prototype.setElementNull = function(element)
{
    if (!element) return;
    if (this.elements[element.j][element.i]) this.elements[element.j][element.i] = null;
};

GameField.prototype.checkElementActionsEnd = function(el)
{
    if (this.isInAction()) return false;
    this.endElementActions();
};

GameField.prototype.isInAction = function()
{
    if (this.in_action > 0) return true;
    return false;
};

GameField.prototype.endElementActions = function()
{
    this.doElementActions1();
    this.checkElementActions1();

    for (var j=0; j<this.rows; j++)
    {
        for (var i=0; i<this.columns; i++)
        {
            if (!this.elements[j][i]) continue;
            this.elements[j][i].in_action = false;
        }
    }
};

GameField.addInAction = function()
{
    LEVEL.game_field.in_action++;
};

GameField.takeInAction = function()
{
    LEVEL.game_field.in_action--;
};

GameField.prototype.doElementActions0 = function()
{
    this.actions0EndCallback();
    for (var j=0; j<this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            if (this.elements[j][i]) this.elements[j][i].doAction0(this);
        }
    }
};

GameField.prototype.doElementActions1 = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            if (this.elements[j][i]) this.elements[j][i].doAction1(this);
        }
    }
};

GameField.prototype.checkElementActions1 = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            if (!this.elements[j][i]) continue;
            if (this.elements[j][i].in_action_1) return false;
        }
    }
    this.endElementActions1();
};

GameField.prototype.endElementActions1 = function()
{
    this.actions1EndCallback();
    if (this.final_explosions) this.moveElementsDown();
    else
    {
        IceElement.setElementsUnfreeze(this);
        this.moveElementsDown();
    }
};

GameField.prototype.doElementActions2 = function()
{
    //sync actions
    for (var j=0; j<this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            if (!this.elements[j][i]) continue;
            this.elements[j][i].doAction2(this);
        }
    }
    this.checkElementActions2();
};

GameField.prototype.checkElementActions2 = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            if (!this.elements[j][i]) continue;
            if (this.elements[j][i].in_action_2) return false;
        }
    }
    this.endElementActions2();
};

GameField.prototype.endElementActions2 = function()
{
    this.actions2EndCallback();
    if (this.ai_mode) return;
    this.checkHintAndShuffle();
};

GameField.prototype.moveElementsDown = function()
{
    var duration = 0;
    for (var j=this.rows-1; j>=0; j--)
    {
        for (var i=0; i<this.columns; i++)
        {
            var element = this.elements[j][i];
            if (!element) continue;
            if (!element.isMoveAble()) continue;
            var new_j = this.findBottomEmptyJ(element);
            if (new_j > -1)
            {
                var temp = element;
                this.elements[new_j][i] = temp;
                this.elements[new_j][i].j = new_j;
                this.elements[j][i] = null;
                var d = this.elements[new_j][i].moveElementDown(this);
                if (d > duration) duration = d;
            }
        }
    }
    this.checkMoveElementsDownEnd();
};

GameField.prototype.checkMoveElementsDownEnd = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            if (!this.elements[j][i]) continue;
            if (this.elements[j][i].in_moving_down) return false;
        }
    }
    this.moveElementsDownEnd();
};

GameField.prototype.moveElementsDownEnd = function()
{
    this.addNewElements();
};

GameField.prototype.addNewElements = function()
{
    var duration = 0, d;
    for (var j=this.rows-1; j>=0; j--)
    {
        for (var i=0; i<this.columns; i++)
        {
            if (this.cells[j][i] && !this.elements[j][i])
            {
                var element = Element.add({i: i,
                    j: j,
                    type: "Random",
                    dX: this.dX,
                    dY: this.dY,
                    random_colors: this.random_colors});
                this.main_spr.addChild(element);
                this.elements[j][i] = element;
                d = element.playAddingEffect(this);
                if (d > duration) duration = d;
            }
        }
    }
    this.checkAddNewElementsEnd();
};

GameField.prototype.checkAddNewElementsEnd = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            if (!this.elements[j][i]) continue;
            if (this.elements[j][i].in_adding) return false;
        }
    }
    this.addNewElementsEnd();
};

GameField.prototype.addNewElementsEnd = function()
{
    this.doElementActions2();
};

GameField.prototype.findBottomEmptyJ = function(el)
{
    var empty_j = -1;
    for (var j=el.j; j<this.rows; j++)
    {
        if (j == el.j) continue;
        if (!this.cells[j][el.i]) continue;
        if (!this.elements[j][el.i]) empty_j = j;
        else
        {
            if (!this.elements[j][el.i].isMoveAble()) continue;
            else break;
        }
    }
    return empty_j;
};

GameField.prototype.findLargestQueue = function()
{
    var arr = [], max_arr = []; // очищаем массив предыдущих элементов в очереди
    for (var j=0; j<this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            if (!this.elements[j][i]) continue;
            if (this.elements[j][i].element_type != "simple" &&
                this.elements[j][i].element_type != "wave") continue;
            if (this.elements[j][i].checking) continue;
            arr = [];
            this.checkNeighbors(this.elements[j][i], arr);
            if (arr.length > max_arr.length) max_arr = arr;
        }
    }
    this.resetChecking();
    return max_arr;
};

GameField.prototype.checkHintAndShuffle = function()
{
    var max_arr = this.findLargestQueue();
    if (max_arr.length < 2) this.prepareToDoShuffle();
    else this.startHintTimeout(max_arr);
};

GameField.prototype.startHintTimeout = function(max_arr)
{
    if (this.ai_mode) return;
    this.hint_timeout = stage.setTimeout(Utils.proxy(function()
    {
        this.doHint(max_arr);
    }, this), pps*4);
};

GameField.prototype.clearHintTimeout = function()
{
    if (this.hint_timeout)
    {
        stage.clearTimeout(this.hint_timeout);
        this.hint_timeout = null;
    }
};

GameField.prototype.doHint = function(arr)
{
    if (this.ai_mode) return;
    for (var i=0; i<arr.length; i++) arr[i].playHint();
};

GameField.prototype.hideHint = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            if (!this.elements[j][i]) continue;
            if (this.elements[j][i].hint_spr) this.elements[j][i].hideHint();
        }
    }
};

GameField.prototype.prepareToDoShuffle = function()
{
    Level.showShufflePopup(Utils.proxy(this.doShuffle, this));
};

GameField.prototype.doShuffle = function()
{
    var old_matrix = this.elements;
    this.elements = [];
    var simple_elements_arr = [];
    for (var j=0; j<this.rows; j++)
    {
        this.elements[j] = [];
        for (var i=0; i<this.columns; i++)
        {
            if (!old_matrix[j][i])
            {
                this.elements[j].push(null);
                continue;
            }
            if (old_matrix[j][i].element_type !== "simple")
            {
                this.elements[j].push(old_matrix[j][i]);
                old_matrix[j][i] = null;
                continue;
            }
            else
            {
                this.elements[j].push(-1);
                simple_elements_arr.push(old_matrix[j][i]);
            }
        }
    }

    var findTwoSameColorElements = function(simple_elements_arr)
    {
        for (var i=0; i<simple_elements_arr.length; i++)
        {
            for (var j=0; j<simple_elements_arr.length; j++)
            {
                if (simple_elements_arr[i] === simple_elements_arr[j]) continue;
                if (simple_elements_arr[i].color === simple_elements_arr[j].color)
                {
                    return [simple_elements_arr[i], simple_elements_arr[j]];
                }
            }
        }
        return false;
    };

    var same_color_arr = findTwoSameColorElements(simple_elements_arr);
    simple_elements_arr.deleteElement(same_color_arr[0]);
    simple_elements_arr.deleteElement(same_color_arr[1]);

    var getNeighbor = function(el_j, el_i)
    {
        for (var j=-1; j<2; j++)
        {
            for (var i=-1; i<2; i++)
            {
                if (j == i || j == i*(-1)) continue;
                if (!this.elements[el_j+j] || !this.elements[el_j+j][el_i+i]) continue;
                if (this.elements[el_j+j] && this.elements[el_j+j][el_i+i] < 0) return {j: el_j+j, i: el_i+i};
            }
        }
        return false;
    };

    for (var j = this.rows-1; j>=0; j--)
    {
        for (var i=this.columns-1; i>=0; i--)
        {
            if (!this.elements[j][i]) continue;
            if (this.elements[j][i] < 0)
            {
                var neighbor = getNeighbor.call(this, j, i);
                if (neighbor && same_color_arr.length>0)
                {
                    this.elements[j][i] = same_color_arr[0];
                    this.elements[j][i].j = j;
                    this.elements[j][i].i = i;
                    this.elements[neighbor.j][neighbor.i] = same_color_arr[1];
                    this.elements[neighbor.j][neighbor.i].j = neighbor.j;
                    this.elements[neighbor.j][neighbor.i].i = neighbor.i;
                    same_color_arr = [];
                }
                else
                {
                    this.elements[j][i] = simple_elements_arr[0];
                    this.elements[j][i].j = j;
                    this.elements[j][i].i = i;
                    simple_elements_arr.deleteElement(simple_elements_arr[0]);
                }
            }
        }
    }

    this.playShuffle();
};

GameField.prototype.playShuffle = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            if (!this.elements[j][i]) continue;
            if (this.elements[j][i].element_type == "simple" ||
                this.elements[j][i].element_type == "wave")
            {
                this.elements[j][i].playShuffle(Utils.proxy(this.checkShuffleEnd, this));
            }
        }
    }
};

GameField.prototype.checkShuffleEnd = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            if (!this.elements[j][i]) continue;
            if (this.elements[j][i].in_shuffle) return false;
        }
    }
    this.shuffleEnd();
};

GameField.prototype.shuffleEnd = function()
{
    Level.unLock();
};

GameField.prototype.checkEndOfActions = function()
{
    for (var j=0; j<this.rows; j++)
    {
        for (var i=0; i<this.columns; i++)
        {
            if (!this.elements[j][i]) continue;
            if (this.elements[j][i].in_action) return false;
        }
    }
    return true;
};

GameField.prototype.getRandomSimpleElements = function(count)
{
    var temp_arr = [], selected_elements = [];
    for (var j=0; j<this.rows; j++)
    {
        for (var i=0; i<this.columns; i++)
        {
            var element = this.elements[j][i];
            if (!element) continue;
            if (element.element_type != "simple") continue;
            temp_arr.push(element);
        }
    }

    while (temp_arr.length > 0 && selected_elements.length < count)
    {
        var el = getRandomValue(temp_arr);
        selected_elements.push(el);
        temp_arr.deleteElement(el);
    }

    return selected_elements;
};

GameField.prototype.doColorBonus = function(endCallback)
{
    var action_points = 0, element_points, el;
    var color = getRandomValue(this.random_colors);
    for (var j=0; j<this.rows; j++)
    {
        for (var i = 0; i < this.columns; i++)
        {
            var element = this.elements[j][i];
            if (!element) continue;
            if (element.element_type == "simple" && element.color == color)
            {
                element_points = element.getMainPoints();
                if (typeof element_points == "number") action_points += element_points;
                element.playColorBonusDestroyEffect(Utils.proxy(this.checkEndOfActions, this),
                    Utils.proxy(this.moveElementsDown, this));
                el = element;

                var cell = this.cells[j][i];
                if (cell)
                {
                    element_points = cell.applyImpact();
                    if (typeof element_points == "number") action_points += element_points;
                }
            }
        }
    }

    this.addPoints(el, action_points, 1);
    stage.setTimeout(endCallback, pps);
};

GameField.prototype.doBoomBonus = function(endCallback)
{
    var selected_elements = this.getRandomSimpleElements(3),
        action_points = 0, element_points;
    for (var n=0; n<selected_elements.length; n++)
    {
        element_points = selected_elements[n].getMainPoints();
        if (typeof element_points == "number") action_points += element_points;
        var i = selected_elements[n].i;
        var j = selected_elements[n].j;
        var color = selected_elements[n].color;
        var element = Element.add({i: i,
            j: j,
            type: "Bomb_"+color,
            dX: this.dX,
            dY: this.dY});
        element.opacity = 1;
        this.main_spr.addChild(element);
        element.in_action = true;
        this.elements[j][i] = element;
        selected_elements[n].playBoomBonusDestroyEffect();
        var cell = this.cells[j][i];
        if (cell)
        {
            element_points = cell.applyImpact();
            if (typeof element_points == "number") action_points += element_points;
        }
    }
    this.addPoints(selected_elements[0], action_points, 2);
    stage.setTimeout(endCallback, pps*1.5);
};

GameField.prototype.doBombBonus = function()
{
    this.bomb_bonus_mode = true;
    LEVEL.bomb_bonus_mode = true;
    this.explodeAllWaves();
};

GameField.prototype.doKnifeBonus = function()
{
    var selected_elements = this.getKnifeBonusSimpleElements(7),
        action_points = 0, element_points;

    for (var n=0; n<selected_elements.length; n++)
    {
        element_points = selected_elements[n].getMainPoints();
        if (typeof element_points == "number") action_points += element_points;
        /*
        selected_elements[n].playKnifeBonusDestroyEffect(Utils.proxy(this.checkEndOfActions, this),
            Utils.proxy(this.moveElementsDown, this));
        */
        selected_elements[n].applyExplosionImpact();

        var i = selected_elements[n].i;
        var j = selected_elements[n].j;
        var cell = this.cells[j][i];
        if (cell)
        {
            element_points = cell.applyImpact();
            if (typeof element_points == "number") action_points += element_points;
        }
    }
    this.addPoints(selected_elements[0], action_points, 3);
};

GameField.prototype.getKnifeBonusSimpleElements = function(count)
{
    var temp_arr = [], selected_elements = [], priority_arr = [];
    for (var j=0; j<this.rows; j++)
    {
        for (var i=0; i<this.columns; i++)
        {
            var element = this.elements[j][i];
            if (!element) continue;
            if (element.element_type == "simple")
            {
                if (element.chains > 0 || element.ice > 0) priority_arr.push(element);
                else if (this.cells[j][i] && this.cells[j][i].type > 1) priority_arr.push(element);
                else temp_arr.push(element);
            }
            else if (element.element_type == "wall" && element.wall_type > 0)
            {
                priority_arr.push(element);
            }
        }
    }

    while (selected_elements.length < count)
    {
        if (priority_arr.length > 0)
        {
            var el = getRandomValue(priority_arr);
            selected_elements.push(el);
            priority_arr.deleteElement(el);
        }
        else
        {
            var el = getRandomValue(temp_arr);
            selected_elements.push(el);
            temp_arr.deleteElement(el);
        }
    }
    return selected_elements;
};

GameField.prototype.doFireBonus = function()
{
    var columns = [];
    for (var n=0; n<3; n++)
    {
        var num = getRandomValue(this.rows_values);
        columns.push(num);
        this.rows_values.deleteElement(num);
    }
    this.playFireBonusAnimation(columns);
};

GameField.prototype.playFireBonusAnimation = function(columns)
{
    for (var n=0; n<columns.length; n++)
    {
        var column = columns[n];
        var spr = setTilesSprite(this.main_spr, "meteor", (column-4)*this.dX, -150, {_frames: 34});
        spr.scaleTo(0.7);
        spr.i = column;

        spr.moveTo(spr.x, spr.y+300, pps*0.7, Easing.linear, Utils.proxy(function(e)
        {
            e.target.obj.destroy = true;
        },this), Utils.proxy(function(e)
        {
            var meteor = e.target.obj;
            if ((meteor.y > 0) && !meteor.used)
            {
                meteor.used = true;
                var i = e.target.obj.i;
                var action_points = 0, element_points, el;
                for (var j=0; j<this.rows; j++)
                {
                    var element = this.elements[j][i];
                    var cell = this.cells[j][i];
                    if (element)
                    {
                        element_points = element.applyExplosionImpact();
                        el = element;
                        if (typeof element_points == "number") action_points += element_points;
                    }
                    if (cell)
                    {
                        element_points = cell.applyImpact();
                        if (typeof element_points == "number") action_points += element_points;
                    }
                }
                this.addPoints(el, action_points, 1);
            }
        }, this));
    }
};

GameField.prototype.doStormBonus = function()
{
    var compare = function(a,b)
    {
        if(a.color == b.color){
            return 0;
        }
        return a.color < b.color ? -1 : 1;
    };

    var old_matrix = this.elements;
    this.elements = [];
    var simple_elements_arr = [];
    for (var j=0; j<this.rows; j++)
    {
        this.elements[j] = [];
        for (var i=0; i<this.columns; i++)
        {
            if (!old_matrix[j][i])
            {
                this.elements[j].push(null);
                continue;
            }
            if (old_matrix[j][i].element_type === "simple" ||
                old_matrix[j][i].element_type === "wave")
            {
                this.elements[j].push(-1);
                simple_elements_arr.push(old_matrix[j][i]);
            }
            else
            {
                this.elements[j].push(old_matrix[j][i]);
                old_matrix[j][i] = null;
                continue;
            }
        }
    }
    simple_elements_arr.sort(compare);

    for (var j = this.rows-1; j>=0; j--)
    {
        if (j%2 == 0)
        {
            for (var i=this.columns-1; i>=0; i--)
            {
                if (!this.elements[j][i]) continue;
                if (this.elements[j][i] < 0)
                {
                    this.elements[j][i] = simple_elements_arr[0];
                    this.elements[j][i].j = j;
                    this.elements[j][i].i = i;
                    simple_elements_arr.deleteElement(simple_elements_arr[0]);
                }
            }
        }
        else
        {
            for (var i=0; i<this.columns; i++)
            {
                if (!this.elements[j][i]) continue;
                if (this.elements[j][i] < 0)
                {
                    this.elements[j][i] = simple_elements_arr[0];
                    this.elements[j][i].j = j;
                    this.elements[j][i].i = i;
                    simple_elements_arr.deleteElement(simple_elements_arr[0]);
                }
            }
        }
    }

    this.playShuffle();
};

GameField.prototype.doDragonBonus = function()
{
    for (var j = this.rows-1; j>=0; j--)
    {
        if (j%2 == 0)
        {
            var action_points = 0, element_points, el;
            for (var i=0; i<this.columns; i++)
            {
                var element = this.elements[j][i];
                var cell = this.cells[j][i];
                if (element)
                {
                    element_points = element.applyExplosionImpact();
                    el = element;
                    if (typeof element_points == "number") action_points += element_points;
                }
                if (cell)
                {
                    element_points = cell.applyImpact();
                    if (typeof element_points == "number") action_points += element_points;
                }
            }
            this.addPoints(el, action_points, 2);
        }
    }
};

GameField.prototype.stepAIMode = function()
{
    this.clearHintTimeout();
    this.hideHint();
    var max_queue = this.findLargestQueue();
    max_queue[getRandomValue(0, max_queue.length-1)].clickHandle();
};

GameField.prototype.removeClickElementsListeners = function()
{

};