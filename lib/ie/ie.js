/*_*/

var IExpr = {

	/* behavior:expression(IExpr.fix(this,'what_1','what_2','what_N)); */
	fix: function(t)
	{
		if (t.IExprLoop) {
			var i = -1;
			while (t.IExprLoop[++i]) {
				IExpr[t.IExprLoop[i]](t);
			}
		} else {
			t.IExprLoop = [];
			var i = 0;
			while (arguments[++i]) {
				IExpr[arguments[i]](t) && t.IExprLoop.push(arguments[i]);
			}
		}
		if (!t.IExprLoop.length) {
			t.runtimeStyle.behavior = 'none';
			t.removeAttribute('IExprLoop');
		}
	},

	/* Dinamic detach of looping function */
	detach: function(t,func)
	{
		for (var i = t.IExprLoop.length - 1; i >= 0; i--) {
			if (t.IExprLoop[i] == func) {
				t.IExprLoop.splice(i,1);
			}
		}
	},

	/* behavior:expression(IExpr.fix(this,'positioning')); */
	positioning: function(t)
	{
		function to_px(input, dim) {
			return input.match('%') ? Math.floor(dim / 100 * parseInt(input, 10)) : parseInt(input, 10);
		}
		var h = t.parentNode.offsetHeight || t.parentNode.parentNode.offsetHeight,
			w = t.parentNode.offsetWidth || t.parentNode.parentNode.offsetWidth,
			top = to_px(t.currentStyle.top, h),
			bottom = to_px(t.currentStyle.bottom, h),
			left = to_px(t.currentStyle.left, w),
			right = to_px(t.currentStyle.right, w);
		t.title = top + ' ' + right + ' ' + bottom + ' ' + left;
		if (t.h != h || t.top != top || t.bottom != bottom || t.w != w || t.left != left || t.right != right) {
			if (h >= 0 && top >= 0 && bottom >= 0) {
				t.h = h;
				t.top = top;
				t.bottom = bottom;
				t.style.height = h - (top + bottom) > 0 ? h - (top + bottom) : 0;
			}
			if (w >= 0 && left >= 0 && right >= 0) {
				t.w = w;
				t.left = left;
				t.right = right;
				t.style.width = w - (left + right) > 0 ? w - (left + right) : 0;
			}
		}
		return 1;
	},
	
	/* behavior:expression(IExpr.fix(this,'target')); */
	target: function(t)
	{
		if (t.id) {
			var hash = window.location.hash;
			if (!t.targetClass) {
				t.targetClass = t.className ? t.className.replace(/([^\s]+)/g,'$1_target') : 'target';
			}
			if (t.lastHash != hash) {
				t.lastHash = hash;
				if ("#"+t.id == hash) {
					t.className += (' ' + t.targetClass);
				} else {
					t.className = t.className.replace(new RegExp(' ' + t.targetClass,'g'), '');
				}
			}
			return 1;
		} else {
			IExpr.detach(t,'target');
		}
	},
	
	/* behavior:expression(IExpr.fix(this,'hover')); */
	hover: function(t)
	{
		var hoverClass = t.className ? t.className.replace(/([^\s]+)/g,'$1_hover') : 'hover';
		t.attachEvent('onmouseover',function() {
			t.className += (' ' + hoverClass);
		});
		t.attachEvent('onmouseout',function() {
			t.className = t.className.replace(new RegExp(' ' + hoverClass,'g'), '');
		});
	},

	/* behavior:expression(IExpr.fix(this,'focus')); */
	focus: function(t)
	{
		var focusClass = t.className ? t.className.replace(/([^\s]+)/g,'$1_focus') : 'focus';
		t.attachEvent('onfocus',function() {
			t.className += (' ' + focusClass);
		});
		t.attachEvent('onblur',function() {
			t.className = t.className.replace(new RegExp(' ' + focusClass,'g'), '');
		});
	},
	
	/* behavior:expression(IExpr.fix(this,'before') */
	before: function(t)
	{
		t.insertAdjacentHTML('afterBegin','<span class="' + (t.className ? t.className.replace(/([^\s]+)/g,'$1_before') : 'before') + '" style="behavior:expression(IExpr.fix(this,\'renderContent\'))"></span>');
	},
	
	/* behavior:expression(IExpr.fix(this,'after') */
	after: function(t)
	{
		t.insertAdjacentHTML('beforeEnd','<span class="' + (t.className ? t.className.replace(/([^\s]+)/g,'$1_after') : 'after') + '" style="behavior:expression(IExpr.fix(this,\'renderContent\'))"></span>');
	},
	
	/* behavior:expression(IExpr.fix(this,'renderContent')); */
	renderContent: function(t)
	{
		var content = t.currentStyle['content'];
		if (content && content.length > 2) {
			if (content == 'none' || content == 'normal') {
				t.removeNode(true);
			} else {
				t.insertAdjacentText('afterBegin', content.slice(1,-1));
			}
		} else {
			t.removeNode(true);
		}
	},

	/*
		marker-before:'(';
		marker-after:') ';
		behavior:expression(IExpr.fix(this,'counter'));
	*/
	counter: function(t)
	{
		var before = (t.currentStyle["marker-before"]||'').replace(/^.(.+).$/g, '$1'),
			after = (t.currentStyle["marker-after"]||'').replace(/^.(.+).$/g, '$1');
		t.runtimeStyle.listStyleType = 'none';
		t.insertAdjacentHTML('afterBegin','<span class="list-item-before">' + before + (++t.parentNode.IEcounter || (t.parentNode.IEcounter = 1)) + after + '</span>');
	},
	
	/* zoom:1; behavior:expression(IExpr.fix(this,'maxWidthPx')); */
	maxWidthPx: function(t)
	{
		if (t.parentNode.scrollWidth != t.w) {
			t.w = t.parentNode.scrollWidth;
			var max = parseInt(t.currentStyle["max-width"], 10);
			t.style.width = 'auto';
			if (t.scrollWidth > max) {
				t.style.width = max;
			}
		}
		return 1;
	},
	
	chkMinWidth: function(t,max)
	{
		var w = document.documentElement.clientWidth;
		if (w != t.w) {
			t.w = w;
			if (w < max) {
				t.style.width = max;
			} else {
				t.style.width = 'auto';
			}
		}
	},

	/* * HTML BODY { behavior:expression(IExpr.fix(this,'bodyMinWidthPx')); } */
	bodyMinWidthPx: function(t)
	{
		var max = parseInt(t.currentStyle['min-width'], 10);
		IExpr.chkMinWidth(t,max);
		window.attachEvent('onresize',IExpr.chkMinWidth(t,max));
	},
	
	/* behavior:expression(IExpr.fix(this,'pngIMG')); */
	pngIMG: function(t)
	{
		t.runtimeStyle.visibility = 'hidden';
		var png = document.createElement('png');
		png.style.cssText = 'zoom:1;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=' + t.src + ',sizingMethod=scale);';
		png.appendChild(t.replaceNode(png));
		if (png.parentNode.getAttribute('href')) {
			var pngclick = document.createElement('pngclick');
			pngclick.style.cssText = 'position:absolute;overflow:hidden;width:expression(runtimeStyle.width = parentNode.offsetWidth);height:expression(runtimeStyle.height = parentNode.offsetHeight);';
			t.parentNode.insertBefore(pngclick,t);
		}
	},

	/* behavior:expression(IExpr.fix(this,adjustIframe)); */
	adjustIframe: function(t)
	{
		var L = t.nextSibling.offsetLeft,
			T = t.nextSibling.offsetTop,
			W = t.nextSibling.offsetWidth,
			H = t.nextSibling.offsetHeight;
		if (t.L != L || t.T != T || t.W != W || t.H != H) {
			t.runtimeStyle.left = t.L = L;
			t.runtimeStyle.top = t.T = T;
			t.runtimeStyle.width = t.W = W;
			t.runtimeStyle.height = t.H = H;
		}
		return 1;
	},
	
	/* zoom:1;behavior:expression(IExpr.fix(this,'iframeShim')); */
	iframeShim: function(t)
	{
		t.insertAdjacentHTML('beforeBegin', '<iframe class="ie-iframe" src="about:blank" style="position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=0);opacity:0;padding:0;margin:0;border:0;behavior:expression(IExpr.fix(this,\'adjustIframe\'));"></iframe>');
	}
}
