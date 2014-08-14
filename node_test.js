var JSChain = require('./jschain');



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
	
	console.log('begin get urls');
	// example of data scraping

	function getURL(url,next)
	{
		console.log('getting '+url);
		setTimeout(function()
		{
			console.log('done');
			next( url == 'http://example.com/4' );
		},1000);
	}


	var chain = new JSChain({getURL: getURL});
	chain.end(function()
	{
		console.log('chain.end');
	});
	for(var i=1;i<10;i++)
	{
		chain.getURL('http://example.com/'+i);
	}

	chain.exec(function(next)
	{
		console.log('before end');
		next();
	});
});

