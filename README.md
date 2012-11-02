# Javascript Chain #

This is a small javascript function to rescue you from infinite callbacks.

## Install ##

	npm install jschain

## Quick Start ##

```javascript
var _map = 
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
};

new JSChain(_map).foo().bar('hello','world').exec(function(next)
{
	console.log('cumtome function');
	setTimeout(next,1000);
}).exec(function()
{
	console.log('done');
});
```


## Background ##

Old days, you might write something like this:
```javascript
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
```
The traditional callback style is no longer suitable for heavy event driven style programming. 


Now, see what JSChain can do:

```javascript
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
```

With the help of JSChain, the first demo code could be written like this:
```javascript
var myController = 
{
	ajaxGet: function(next) {  ... ... next(); ... },
	saveToDatabase: function(a,next){ ... ... next(); },
	notifyUser: function() {  ... arguments[arguments.length-1].call(); ... },
	markNotified: function(next){ ... next(); ... }
};

new JSChain(myController).ajaxGet().saveToDatabase().notifyUser().markNotified();
```

And JSChain is very useful for data scraping projects:
```javascript
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
```

The JSChain itself is very tiny. The full documented source code of JSChain is only 1.6KB. I can paste the source code here, so you can read the source code. This could help you understand how it works.

```javascript
function JSChain(obj)
{
	var self = this;
	this.____items = []; //this remembers the callback functions list
	this.____next = function()  //execute next function
	{
		var func = self.____items.shift();
		if (func) func.call();
	};

	this.exec = function() //support for custom function
	{
		var args = [].slice.call(arguments,1);
		args.push(self.____next);
		var func = arguments[0];
		self.____items.push(function()
		{
			func.apply(obj,args);
		});
		return self;
	};

	//copy and wrap the methods of obj
	for(var func in obj)
	{
		if (typeof obj[func] == 'function' && obj.hasOwnProperty(func))
		{
			(function(func)
			{
				self[func] = function()
				{
					var args = [].slice.call(arguments); //change arguments as an array
					args.push(self.____next); //pass next callback to the last argument
					self.____items.push(function() //wrap the function and push into callbacks array
					{
						obj[func].apply(obj,args);
					});
					return self; //always return JSChain it self like jQuery
				}
			})(func); // this is the closure trick
		}
	}

	//start execute the chained functions in next tick
	setTimeout(function()
	{
		self.____next();
	},0);

	return this;
}
```

Good luck.

