var I18 =
{
	currentLocale: "",
	
	supportedLanguage: ["en", "ru"],
	
	strings: {},
	
	init: function(locale, callback)
	{
        if (I18.currentLocale == "ru")
        {
            Utils.get("localization/strings_" + I18.currentLocale + ".xml", null, "xml", function(data)
            {
                var strings = {};
                var arr = data.getElementsByTagName("s");
                for (var i=0; i<arr.length; i++)
                {
                    var text = arr[i].getElementsByTagName("text")[0].textContent;
                    var translate = arr[i].getElementsByTagName("translate")[0].textContent;
                    strings[text] = translate;
                }
                I18.setup(strings);
                if(typeof callback === "function") callback();
            });
        }
        else
        {
            Utils.get("localization/strings_" + I18.currentLocale + ".csv", null, null, function(data)
            {
                var strings = {}, parts = data.split("\n"), keyval;
                for(var i=0; i<parts.length; i++)
                {
                    keyval = parts[i].split(";");
                    strings[I18.trim(keyval[0])] = I18.trim(keyval[1]);
                }

                I18.setup(strings);
                if(typeof callback === "function") callback();
            });
        }
    },

    initLocale: function()
    {
        if (I18.currentLocale) return;
        var locale = window.navigator.language ? window.navigator.language.substr(0, 2) : "";
        if(I18.supportedLanguage.indexOf(locale) < 0) locale = I18.supportedLanguage[0];
        I18.currentLocale = locale;
    },

	setup: function(data)
	{
		I18.strings = data;
	},
	
	trim: function(s)
	{
	    if(!s) return "";
	    return s.replace(/^\s+|\s+$/gm,'');
	},
	
	arrayAntidot: function(values) 
    {
        if (!values) return;
        if (values.length > 0 && Utils.isArray(values[0])) return values[0];
        return values;
    },
	
	getString: function(key, values)
	{
		if (typeof values == "undefined")
		{
			values = null;
		}

		var str = I18.getStringOrNull(key, values);
		if (str == null) return "{" + key + "}";
		
		return str;
	},

	getStringOrNull: function(key, args)
	{
		if (typeof args == "undefined") args = null;

		var value = I18.strings[key];
		if (typeof value == "undefined") value = null;
		
		if(args == null || value == null) return value;
		else
		{
		    args = [value].concat(I18.arrayAntidot(args));
		    return I18.sprintf.apply(I18, args);
		}
	},

	f: function(key)
	{
		var values = I18.arrayAntidot(Array.prototype.slice.call(arguments, 1));
		
		if (!Utils.isArray(values))
		{
			values = [values];
		}
		return I18.getString(key, values);
	},

	s: function(prefix, key, values)
	{
		if (!Utils.isArray(values))
		{
			values = [values];
		}
		return I18.getString(prefix + "_" + key, I18.arrayAntidot(values));
	},

	sf: function(key, suffix, values)
	{
		return I18.getString(key + "_" + suffix, I18.arrayAntidot(values));
	},

	psf: function(prefix, key, suffix, values, temp)
	{
		return I18.getString(prefix + "_" + key + "_" + suffix, I18.arrayAntidot(values));
	},
	
	sprintf: function()
    {
        var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g;
        var a = arguments;
        var i = 0;
        var format = a[i++];
    
        var pad = function(str, len, chr, leftJustify)
        {
            if (!chr) chr = ' ';
            var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr);
            return leftJustify ? str + padding : padding + str;
        };
    
        var justify = function(value, prefix, leftJustify, minWidth, zeroPad, customPadChar)
        {
            var diff = minWidth - value.length;
            if (diff > 0)
            {
                if (leftJustify || !zeroPad) value = pad(value, minWidth, customPadChar, leftJustify);
                else value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
            }
            return value;
        };
    
        var formatBaseX = function(value, base, prefix, leftJustify, minWidth, precision, zeroPad)
        {
            var number = value >>> 0;
            prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
            value = prefix + pad(number.toString(base), precision || 0, '0', false);
            return justify(value, prefix, leftJustify, minWidth, zeroPad);
        };
    
        var formatString = function(value, leftJustify, minWidth, precision, zeroPad, customPadChar)
        {
            if (precision != null) value = value.slice(0, precision);
            return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
        };
    
        var doFormat = function(substring, valueIndex, flags, minWidth, _, precision, type)
        {
            var number, prefix, method, textTransform, value;
    
            if (substring === '%%') return '%';
            
            var leftJustify = false;
            var positivePrefix = '';
            var zeroPad = false;
            var prefixBaseX = false;
            var customPadChar = ' ';
            var flagsl = flags.length;
            for (var j = 0; flags && j < flagsl; j++)
            {
                switch (flags.charAt(j))
                {
                    case ' ':
                        positivePrefix = ' ';
                        break;
                    case '+':
                        positivePrefix = '+';
                        break;
                    case '-':
                        leftJustify = true;
                        break;
                    case "'":
                        customPadChar = flags.charAt(j + 1);
                        break;
                    case '0':
                        zeroPad = true;
                        customPadChar = '0';
                        break;
                    case '#':
                        prefixBaseX = true;
                        break;
                }
            }
    
            if (!minWidth) minWidth = 0;
            else if (minWidth === '*') minWidth = +a[i++];
            else if (minWidth.charAt(0) == '*') minWidth = +a[minWidth.slice(1, -1)];
            else minWidth = +minWidth;
    
            if (minWidth < 0)
            {
                minWidth = -minWidth;
                leftJustify = true;
            }
    
            if (!isFinite(minWidth))
            {
                throw new Error('sprintf: (minimum-)width must be finite');
            }
    
            if (!precision) precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined;
            else if (precision === '*') precision = +a[i++];
            else if (precision.charAt(0) == '*') precision = +a[precision.slice(1, -1)];
            else  precision = +precision;
    
            value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];
    
            switch (type)
            {
                case 's':
                    return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
                case 'c':
                    return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
                case 'b':
                    return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'o':
                    return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'x':
                    return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'X':
                    return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
                case 'u':
                    return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'i':
                case 'd':
                    number = +value || 0;
                    number = Math.round(number - number % 1);
                    prefix = number < 0 ? '-' : positivePrefix;
                    value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                    return justify(value, prefix, leftJustify, minWidth, zeroPad);
                case 'e':
                case 'E':
                case 'f':
                case 'F':
                case 'g':
                case 'G':
                    number = +value;
                    prefix = number < 0 ? '-' : positivePrefix;
                    method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                    textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                    value = prefix + Math.abs(number)[method](precision);
                    return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
                default:
                    return substring;
            }
        };
    
        return format.replace(regex, doFormat);
    }
};