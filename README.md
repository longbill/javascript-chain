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
}).end(function()
{
	console.log('done');
});
```

##When to use it?##

Javascript callbacks may looks like this:

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
}).end(function()
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
	notifyUser: function() {  ... next(); },
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

The JSChain itself is very small. The full documented source code of JSChain is only 1.6KB. I can paste the source code here, so you can read the source code. This could help you understand how it works.

```javascript
function JSChain(obj)
{
	var self = this;
	this.____items = []; //this remembers the callback functions list
	this.____finally = null;
	this.____next = function(jump)  //execute next function
	{
		if (!jump)
		{
			var func = self.____items.shift();
			if (func) func.call();
		}
		else self.____items = [];
		
		if (self.____items.length == 0 && typeof self.____finally == 'function')
		{
			self.____finally.call(obj);
			self.____finally = null;
		}
	};

	this.exec = function() //support for custom function
	{
		var args = [].slice.call(arguments,1),func = arguments[0];
		args.push(self.____next);
		self.____items.push(function()
		{
			func.apply(obj,args);
		});
		return self;
	};

	this.end = function(func) //support for final function
	{
		self.____finally = func;
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
					var args = [].slice.call(arguments);
					args.push(self.____next); //pass next callback to the last argument
					self.____items.push(function() //wrap the function and push into callbacks array
					{
						obj[func].apply(obj,args);
					});
					return self; //always return JSChain it self like jQuery
				}
			})(func); // this is the closure tricks
		}
	}

	//start execute the chained functions in next tick
	setTimeout(self.____next,0);
	return this;
}
```


##Advanced features##

###end method###

An `end` method can add a function to the end of the chain. You can not define this in the object when new JSChian().

###jump to the end instead of going to next###

When you call `next` method, if you pass a `true` value into `next()` method, that means JUMP TO THE END.

###data passing along functions###

```
var obj = 
{
	a: function(i,next)
	{
		this.A = i.toUpperCase();
		next();
	},
	b: function(next)
	{
		this.B = this.A+'B';
		next();
	}
};
var c = new JSChain(obj);
c.a('a')
.b()
.exec(function()
{
	console.log(this);
});
```
this will output:
```
{ a: [Function], b: [Function], A: 'A', B: 'AB' }
```
