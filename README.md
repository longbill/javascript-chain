# Javascript Chain #

This is a small javascript function to rescue you from infinite callbacks.


## Background ##

Old days, you might write something like this:

	ajaxGet('http://something',function(a)
	{
		saveToDatabase(a,function(err)
		{
			if (!err)
			{
				notifyUser(123,function()
				{
					markNotified(123,function()
					{
						//done
					});
				});
			}
		})''
	});

The traditional callback style is no longer suitable for heavy event driven style programming. 


Now, see what JSChain can do:

	new JSChain(
	{
		foo: function(next)
		{
			console.log('foo');
			setTimeout(next,1000);
		},
		bar: function(a,b,next)
		{
			console.log('bar: '+a+' '+b);
			setTimeout(next,1000);
		}
	}).foo().bar('hello','world').exec(function(next)
	{
		console.log('cumtome function');
		setTimeout(next,1000);
	}).exec(function()
	{
		console.log('done');
	});


With the help of JSChain, the first demo code could be written like this:

	var myController = 
	{
		ajaxGet: function(next) {  ... ... next(); ... },
		saveToDatabase: function(a,next){ ... ... next(); },
		notifyUser: function() {  ... arguments[arguments.length-1].call(); ... },
		markNotified: function(next){ ... next(); ... }
	};

	new JSChain(myController).ajaxGet().saveToDatabase().notifyUser().markNotified();



