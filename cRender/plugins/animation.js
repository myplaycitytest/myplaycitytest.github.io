/**
 * @class
 * @description Класс для проигрывания последовательностей анимации
 * @param {Object} obj объект для анимации
 * @param {Object} sequence последовательность
 * @param {Function} callback выполняется после завершения последней анимации в последовательности
 */
function Animation(obj, sequence, callback)
{
	this.obj = obj;
	this.sequence = sequence;
	this.currentAnimation = -1;
	
	this.currentTweens = [];
	
	this.ended = false;
	
	this.startTimer = null;
	this.endTimer = null;
	
	this.playNext = Utils.proxy(this.playNext, this);
	this.play = Utils.proxy(this.play, this);
	
	this.onfinish = callback;
};

/** @ignore */
Animation.prototype.play = function()
{
	this.playNext();
};

/** @ignore */
Animation.prototype.playNext = function()
{
	if(this.currentAnimation >= 0)
	{
		var oldAnimation = this.sequence[this.currentAnimation];
		if(oldAnimation.onfinish) oldAnimation.onfinish({target: this});
		if(typeof oldAnimation.loop != "undefined") this.currentAnimation = oldAnimation.loop-1;
	}
	
	this.currentAnimation++;
	if(this.currentAnimation >= this.sequence.length)
	{
		this.ended = true;
		if (typeof this.onfinish == 'function')
		{
			this.onfinish({target: this});
		}
		return;
	}
	
	var animation = this.sequence[this.currentAnimation];
	var masterDuration, duration, tweens, tween, from, to, t, ease;
	
	tweens = animation.tweens;
	if(!Utils.isArray(tweens)) tweens = [tweens];
	
	masterDuration = animation.duration || 0;
	
	this.currentTweens = [];
	
	var finishTween = null;
	for(var n=0; n < tweens.length; n++)
	{
		tween = tweens[n];
		
		duration = tween.duration;
		if (typeof duration == 'undefined') duration = masterDuration;
		
		from = tween.from;
		if (typeof from == 'undefined') from = this.obj[tween.prop];

		to = tween.to;
		if (typeof to == 'undefined') to = this.obj[tween.prop];

		ease = tween.ease || animation.ease || null;
		
		t = Animation.stage.createTween(this.obj, tween.prop, from, to, duration, ease);
		
		if(typeof tween.onchange != "undefined") t.onchange = tween.onchange;
		if(typeof tween.onfinish != "undefined") t.onfinish = tween.onfinish;
		
		t.play();
		
		this.currentTweens.push(t);
		if (duration == masterDuration) 
		{
			finishTween = t;
		}
	}
	
	// timers tick before tweens 
	// fix animation onfinish callback before tweens with same duration are completed
	if (finishTween)
	{
		var self = this, fn = finishTween.onfinish;
		finishTween.onfinish = function(e){
			if (typeof fn == 'function') fn(e);
			self.playNext();
		};
	}
	else
	{
		this.endTimer = Animation.stage.setTimeout(this.playNext, masterDuration);
	}
};

/** @ignore */
Animation.prototype.executeTweensMethod = function(method)
{
	for(var i=0; i<this.currentTweens.length; i++)
	{
		this.currentTweens[i][method]();
	}
};

/** @ignore */
Animation.prototype.clearTweens = function()
{
    for(var i=0; i<this.currentTweens.length; i++)
    {
        this.currentTweens[i].destroy = true;
    }
    
    this.currentTweens = [];
};

/**
 * Полная остановка анимации 
 */
Animation.prototype.stop = function()
{
	if(this.ended) return;
	
	this.executeTweensMethod("stop");
	if(this.startTimer) Animation.stage.clearTimeout(this.startTimer);
	if(this.endTimer) Animation.stage.clearTimeout(this.endTimer);
};

/**
 * Пауза анимации 
 */
Animation.prototype.pause = function()
{
	if(this.ended) return;
	
	this.executeTweensMethod("pause");
	if(this.startTimer) this.startTimer.pause();
	if(this.endTimer) this.endTimer.pause();
};

/**
 *  Возобновление анимации
 */
Animation.prototype.resume = function()
{
	if(this.ended) return;
	
	this.executeTweensMethod("play");
	if(this.startTimer) this.startTimer.resume();
	if(this.endTimer) this.endTimer.resume();
};

/** 
 * Сцена, на которой происходит проигрывание анимации.
 * При использовании Animation.play сцена пытается установиться из спрайта или из window.stage
 */
Animation.stage = null;

/** 
 * Создание и запуск анимации
 * @param {Object} obj объект для анимации
 * @param {Object} sequence последовательность
 * @param {Function} callback выполняется после завершения последней анимации в последовательности
 * @param {Number} delay задержка перед началом анимации
 * @returns {Animation} объект анимации
 * @example
 * массив последовательностей
 * var sequence =
[
	{
		массив (или одиночный объект) описания твинов
		tweens: [
			//поддерживаемые свойства: prop, from, to, ease, duration, onchange, onfinish
			{prop: "x", to: 100},
			{prop: "y", to: 100},
			{prop: "rotation", to: Math.PI*2, duration: 24},
		],
		//длительность последовательности (может отличаться от длительностей конкретных твинов
		duration: 48,
		//easing для всех твинов (применяется в случае, если не указан в конкретном твине)
		ease: Easing.quadratic.easeOut,
		//callback при окончании последовательности
		onfinish: testAnimEnd
	},
	{
		tweens: [
			{prop: "scaleX", from: 0.5, to: 2},
			{prop: "scaleY", from: 0.5, to: 2},
			{prop: "rotation", to: 0},
		],
		duration: 48
	}
];
*/
Animation.play = function(obj, sequence, callback, delay)
{
	if(!obj || !sequence) return;
	
	if(obj.stage) Animation.stage = obj.stage;
	if(!Animation.stage) Animation.stage = window.stage;
	
	var anim = new Animation(obj, sequence, callback);
	
	if(delay) anim.startTimer = Animation.stage.setTimeout(anim.play, delay);
	else anim.play();
	
	return anim;
};