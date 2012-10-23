/*

Javascript chain 

by Chunlong ( jszen.com ) 
longbill.cn@gmail.com


Example:

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


*/

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
