var ExternalAPI =
{
	type: "default",
	
	init: function()
	{
	},
	
	exec: function()
	{
	    var method = arguments[0];
	    if(method == "exec" || (typeof ExternalAPI[method] != "function")) return;
	    return ExternalAPI[method].apply(ExternalAPI, Utils.getFunctionArguments(arguments, 1));
	},
	
	check: function()
	{
		return false;
	},
	
	openWidget: function()
	{
	},
	
	closeWidget: function()
	{
	},
	
	getMoreGamesURL: function(a, b)
	{
		return "http://playtomax.com/";
	},
	
	getPreloaderURL: function()
	{
	    return "http://playtomax.com/";
	},
	
	showCopyright: function() 
	{
	},
	
	isPortalEnvironment: function()
	{
	    var href = window.location.href;
	    return (href.indexOf("http://playtomax.com") == 0 || href.indexOf("https://playtomax.com") == 0);
	},
	
	isPlainPortalEnvironment: function()
	{
	    if(!ExternalAPI.isPortalEnvironment()) return false;
	    var GET = Utils.parseGet();
	    return GET.external != "whitelabel";
	},
	
	showAds: function()
	{
	    if(ExternalAPI.isPortalEnvironment())
	    {
	        if(window.GoogleIMA) GoogleIMA.show();
	        else if(window.Leadbolt) Leadbolt.show();
	    }
	},
	
	sendGAEvent: function(category, action, label, value)
	{
	    if(ExternalAPI.isPlainPortalEnvironment() && window.ga)
	    {
	        if(!value) value = 0;
	        
	        ga('send', 'event', category, action, label, value);
	    }
	},
	
	openPlayMarket: function(id, label, campaign)
	{
	    var url = "https://play.google.com/store/apps/details?id=" + id;
	    url += "&referrer=utm_source%3D" + label;
	    url += "%26utm_medium%3Dbutton%26utm_campaign%3D" + campaign;
	    
	    window.open(url, "_blank");
	},
};