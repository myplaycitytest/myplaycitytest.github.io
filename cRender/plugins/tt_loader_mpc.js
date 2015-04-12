var TTLoader =
{
	endCallback: null,
	loadedData: null,
	landscapeMode: false,
	skipPlayButton: false,
	progressVal: 0,
	
	create: function(callback, landscape, skipButton, disableLogoLink)
	{
		TTLoader.endCallback = callback;
	},
	
	showLoadProgress: function(val)
	{
		if(val < 0) val = 0; 
		if(val > 100) val = 100; 
		
		TTLoader.progressVal = val;
		
		console.log("Load progress: " + TTLoader.progressVal);
	},

	loadComplete: function(data)
	{
		TTLoader.showLoadProgress(100);
		TTLoader.loadedData = data;
		
		TTLoader.close();
	},
	
	close: function(e)
	{
		TTLoader.endCallback(TTLoader.loadedData);
	}
};