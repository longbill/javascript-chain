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
	
	console.log('begin get urls');
	// example of data scraping

	function getURL(url,next)
	{
		console.log('getting '+url);
		setTimeout(function()
		{
			console.log('done');
			next();
		},1000);
	}


	var chain = new JSChain({getURL: getURL});
	for(var i=1;i<100;i++)
	{
		chain.getURL('http://example.com/'+i);
	}
	chain.exec(function()
	{
		console.log('DONE!!!');
	});

});






function JSChain(obj)
{
	var self = this;
	this.____items = [];
	this.____next = function()
	{
		var func = self.____items.shift();
		if (func) func.call();
	}

	this.exec = function()
	{
		var args = [].slice.call(arguments,1);
		args.push(self.____next);
		var func = arguments[0];
		self.____items.push(function()
		{
			func.apply(obj,args);
		});
		return self;
	}

	for(var func in obj)
	{
		if (typeof obj[func] == 'function' && obj.hasOwnProperty(func))
		{
			(function(func)
			{
				self[func] = function()
				{
					var args = [].slice.call(arguments);
					args.push(self.____next);
					self.____items.push(function()
					{
						obj[func].apply(obj,args);
					});
					return self;
				}
			})(func);
		}
	}

	//start execute the chained functions in next tick
	setTimeout(function()
	{
		self.____next();
	},0);

	return this;
}


