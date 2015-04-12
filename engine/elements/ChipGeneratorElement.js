function ChipGeneratorElement(props)
{
    this.element_type = "chip_generator";
    Utils.callSuperConstructor(ChipGeneratorElement, this, props);
}

Utils.extend(ChipGeneratorElement, Element);

ChipGeneratorElement.prototype.setSkin = function()
{
    this.setAtlasBitmap("s_chip_generator");
};

ChipGeneratorElement.prototype.doAction0 = function(game_field)
{
    //если удалится хоть один generated wall - выходим
    for (var i=0; i<game_field.secondary_queue.length; i++)
    {
        if (game_field.secondary_queue[i].generated) return;
    }

    for (var n=0; n<game_field.queue.length; n++)
    {
        var element = game_field.queue[n];
        if (this.i == element.i && Math.abs(this.j-element.j) == 1) return;
        if (this.j == element.j && Math.abs(this.i-element.i) == 1) return;
    }
    this.transformSimpleToWall(game_field);
};

ChipGeneratorElement.prototype.transformSimpleToWall = function(game_field)
{
    var arr = [];
    for (var j=-1; j<2; j++)
    {
        for (var i=-1; i<2; i++)
        {
            if (i == 0 && j == 0) continue;
            if (this.j + j >= 0 &&
                this.j + j < game_field.rows &&
                this.i + i >= 0 &&
                this.i + i < game_field.columns)
            {
                var element = game_field.elements[this.j + j][this.i+i];
                if (!element) continue;
                if (element.element_type == "simple" && !element.in_action) arr.push(element);
            }
        }
    }

    if (arr.length > 0)
    {
        var random_element = getRandomValue(arr);
        if (random_element) random_element.generateWall(game_field);
    }
};