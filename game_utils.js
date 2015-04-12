var cookie_obj;
var LEVEL;

var backgroundImage = null;
function setCSSBack(img, color)
{
	if(img)
	{		
		backgroundImage = img;
			
		var main_div = document.getElementById("screen_background_container");
		main_div.style.backgroundImage = "url(" + img.src + ")";		
		//main_div.style.backgroundPosition = "top center";
		//main_div.style.backgroundRepeat = "repeat";		
	}
	else
	{
		var main_div = document.getElementById("screen_background_container");
		main_div.style.backgroundImage = null;
	}
	
	if (color) document.body.style.backgroundColor = color;
	//document.body.style.backgroundPosition = "top center";
	document.body.style.backgroundRepeat = "no-repeat";
	resizeCSSBack();
}

function resizeCSSBack()
{
	if(!backgroundImage) return;
	var rect = Utils.getWindowRect();
	var scale = rect.height / backgroundImage.height;
	//var w = Math.floor(backgroundImage.width * scale);
	//var h = Math.floor(backgroundImage.height * scale);	
	//whole window
	var w = Math.floor(rect.width);
	var h = Math.floor(rect.height);
	
	//fix size
	
	var main_div = document.getElementById("screen_background_container");
	main_div.style.backgroundSize = w + "px " + h + "px";
}

Sprite.prototype.dragdrag = function()
{
	this.onmousedown = function(e)
	{
		if (this.parent instanceof Stage) this.startDrag(e.x, e.y);
		else this.startDrag(this.parent.x,this.parent.y);
		return false;
	};
	this.onmouseup = function(e)
	{
		this.stopDrag();
		console.log(~~this.x,~~this.y);
		return false;
	};
};

Sprite.FLOOR_VALUES_ON_RENDER = false;

function setTilesSprite(parent, name, x, y, properties)
{
	if (!library.items[name]) return false;
	var item = library.items[name];
	var mc = new TilesSprite(item.bitmap, item.width, item.height, properties._frames, item.frames, item.layers);
	
	for (var k in properties)
	{
		if (k == "zIndex") mc.setZIndex(properties[k]);
		else if (k == "_static") mc.setStatic(properties[k]);
		else mc[k] = properties[k];
	}
	mc.x = x;
	mc.y = y;
	parent.addChild(mc);
	return mc;
}

function setSprite(parent,name,x,y, properties)
{
	var mc, value, k;
	if (name) mc = library.getSprite(name ? name : null);
	else mc = new Sprite(null,1,1);
	
	for (k in properties)
	{
		value = properties[k];
		if (k == "zIndex") mc.setZIndex(value);
		else if (k == "_static") mc.setStatic(value);
		else if (k == "w") mc.width = value;
		else if (k == "h") mc.height = value;
		else if (k == "fC") mc.fillColor = value;
		else if (k == "o") mc.opacity = value;
		else mc[k] = value;
	}
	mc.x =  x;
	mc.y = y;
	parent.addChild(mc);
	return mc;
}

function setGraphics(parent,type, x, y, properties)
{
	var graphics = new Graphics[type](x,y);
	for (var k in properties)
	{
		if (k == "zIndex") graphics.setZIndex(properties[k]);
		else if (k == "_static") graphics.setStatic(properties[k]);
		else graphics[k] = properties[k];
	}	
	parent.addChild(graphics);
	return graphics;
}

function setText(parent, text, x, y, properties)
{
	var t = new Graphics.text(x, y, text);
	for (var k in properties)
	{
		t[k] = properties[k];
	}
    parent.addChild(t);
    return t;
}

function setSimpleText(parent, font, value, x, y, properties)
{
	var asset = library.items[font];	
	var text = new SimpleText(bitmaps[font].bitmap, asset.width, asset.height, asset.frames);
	text.x = x;
	text.y = y;
	text.parent = parent;
	if (properties["align"])
	{
		text.align = properties["align"];
	}
	text.write(value);
	for (var k in properties)
	{
		if (k == "zIndex") text.setZIndex(properties[k]);
		else if (k == "_static") text.setStatic(properties[k]);
		else text[k] = properties[k];
	}
	return text;
}

function setBitmapText(parent, font, text_value, x, y, properties)
{
	var bitmap_arr_name = font+"_image";
	if (typeof properties === "undefined") var properties = {};
	if (typeof window[bitmap_arr_name] === "undefined")
	{
		console.log("There's no such font: "+font);
		return;
	}
	var json_obj = [];
	var arr = window[bitmap_arr_name];
	for (var i= 0, len=arr.length; i<len; i++)
	{
		json_obj.push({id: arr[i][0],
						x: arr[i][1]/2,
						y: arr[i][2]/2,
						width: arr[i][3]/2,
						height: arr[i][4]/2,
						xoffset: 0,
						yoffset: -arr[i][4]/2*0.3,
						page: 0,
						xadvance: arr[i][3]/2*0.8
					});
	}
	var text = new BitmapText(bitmaps[font].bitmap, json_obj);
	text.x = x;
	text.y = y;
	text.parent = parent;

	for (var k in properties)
	{
		if (k == "zIndex") text.setZIndex(properties[k]);
		else if (k == "_static") text.setStatic(properties[k]);
		else if (k == "block_width") text.manageBlock(text_value, properties[k]);
		else text[k] = properties[k];
	}

	text.write(text_value);
	return text;
}

BitmapText.prototype.manageBlock = function(text, block_width)
{
	if (typeof block_width === "undefined") return text;
	text = text+"";

	var chr,
	p = new Vector(0, 0),
	space_present = false;

	for (var i=0; i<text.length; i++)
	{
		chr = this.getChar(text[i]);
		p.x+= chr.width;
		p.x += (chr.xadvance + this.charSpacing) * this.scale;
		console.log(text[i], p.x);
		if (text[i] === " ") space_present = true;

		if (p.x > block_width && space_present)
		{
			for (var j=i; j>=0; j--)
			{
				if (text[j] === " ")
				{
					var ps = "\n";
					p.x = 0;
					var before=text.substring(0, j);
					var after=text.substring(j);
					text = before+ps+after;
					space_present = false;
					break;
				}
			}
		}
	}
	return text;
};

function Button(parent,name,x,y, callback, properties, text, text_props)
{
	Utils.callSuperConstructor(Button, this, null, 1, 1);
	var asset = bitmaps[name];
	this.bitmap = asset.bitmap;
	this.width = asset.width;
	this.height = asset.height;
	this.totalFrames = asset.frames;
	this.totalLayers = asset.layers;
	this.x = x;
	this.y = y;
	this.clickBlock = false;
	this.gotoAndStop(0);
	this.addEventListener("mousedown", Utils.proxy(function()
	{
		this.gotoAndStop(2);
		return false;
	}, this));

	this.addEventListener("mouseup", Utils.proxy(function(e)
	{
		this.gotoAndStop(0);
		if (this.clickBlock && !this.unblock) return false;
		this.clickBlock = true;
		stage.setTimeout(Utils.proxy(function()
		{
			this.clickBlock = false;
		}, this), pps*2);

		if (typeof callback === "function") callback(e);
		return false;
	}, this));

	this.addEventListener("mouseover", Utils.proxy(function()
	{
		this.gotoAndStop(1);
		return false;
	}, this));

	this.addEventListener("mouseout", Utils.proxy(function()
	{
		this.gotoAndStop(0);
		return false;
	}, this));

	this.addEventListener("click", Utils.proxy(function()
	{
		return false;
	}, this));
	parent.addChild(this);
}

Utils.extend(Button, Sprite);

Sprite.prototype.preventAllEvents = function()
{
	this.addEventListener("mousedown", function(){return false;});
	this.addEventListener("mouseup", function(){return false;});
	this.addEventListener("mousemove", function(){return false;});
	this.addEventListener("mouseout", function(){return false;});
	this.addEventListener("mouseover", function(){return false;});
	this.addEventListener("click", function(){return false;});
};

Stage.prototype.checkStaticSprites = function(property)
{	
	console.log("----------------------->");
	console.log("DYNAMIC SPRITES:");
	var dyn = 0;
	for (var i=0; i<this.objects.length; i++)
	{
		var sprite = this.objects[i];
		_showDynamicSpr(sprite);
	}
	console.log("Total dynamic count: "+dyn);
	
	console.log("STATIC SPRITES:");
	var stat = 0;
	for (var i=0; i<this.objects.length; i++)
	{
		var sprite = this.objects[i];
		_showStaticSpr(sprite);
	}
	console.log("Total static count: "+stat);
	console.log("<-----------------------");
		
	function _showDynamicSpr(sprite)
	{		
		if (!sprite.static)
		{
			if (property) console.log(sprite[property]);
			dyn++;
		}		
		if (sprite.objects)
		{
			for (var i=0; i<sprite.objects.length; i++)
			{
				_showDynamicSpr(sprite.objects[i]);
			}
		}		
	}
	
	function _showStaticSpr(sprite)
	{
		if (sprite.static)
		{
			if (property) console.log(sprite[property]);
			stat++;
		}
		if (sprite.objects)
		{
			for (var i=0; i<sprite.objects.length; i++)
			{
				_showStaticSpr(sprite.objects[i]);
			}
		}
	}		
}

var center = 
{
	x: getStageWidthCenter(),
	y: getStageHeightCenter(),
};

function getStageWidth()
{
	var w = (LANDSCAPE_MODE) ? 480 : 320;
	return Math.floor(w);
}

function getStageHeight() 
{
	var h = (LANDSCAPE_MODE) ? 320 : 480;
	return Math.floor(h);
}

function getStageWidthCenter() {return getStageWidth()/2;}
function getStageHeightCenter() {return getStageHeight()/2;}

function setBackgroundScale() {
   var c = Utils.getWindowRect();
   
    document.getElementById("screen_background_container").style.backgroundSize 
        = (c.width) + "px " + (c.height) + "px";
}

function getRandomValue(arr, end_val)
{
	if (end_val)
	{
		return Math.floor(Math.random()*(end_val+1-arr))+arr;
	}
	else
	{
		var n = Math.floor(Math.random()*arr.length);
		return arr[n];
	}	
};

Array.prototype.isPresentValue = function(val)
{
	for (var i=0; i<this.length; i++)
	{
		if (this[i] === val) return true;
	}
	return false;
};

Array.prototype.getElementByValueInProperty = function(property, value)
{
	for (var i=0; i<this.length-1; i++)
	{
		if (this[i][property] === value) return this[i];
	}
	return false;
};

Array.prototype.deleteElement = function(val)
{
	this.splice(this.indexOf(val), 1);
};