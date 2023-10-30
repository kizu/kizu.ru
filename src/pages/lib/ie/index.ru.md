---
aliases: [/lib/ie/]
---

# Систематизация экспрешнов

- [Исправление полупрозрачных png](#Png) <sup>[пример](png.html)</sup>
- [Минимальные/максимальные ширины/высоты](#MinMax) <sup>[пример](minmax.html)</sup>
- [Позиционирование](#Positioning)
- [Перекрытие селектов айфреймом](#Select) <sup>[пример](select.html)</sup>
- [Растягивание высоты](#Height)
- [Opacity](#Opacity)
- [Размер шрифта в зависимости от dpi](#Dpi)
- [Реализация простого счётчика](#Counter) <sup>[пример](counter.html)</sup>
- [Эмуляция псевдоклассов (`:hover`, `:focus`, `:target`)](#Pseudoclass) <sup>[пример](pseudoclass.html)</sup>
- [Благодарности](#Credits)

Небольшой disclaimer: используйте напильник, пожалуйста, — практически всегда в экспрешнах надо что-либо допилить!

## Исправление полупрозрачных png {#Png}

Тупо фильтр

``` CSS
* HTML .png-crop {
	background-image:none;
	zoom:1;
	filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src="ololo.png", sizingMethod="crop");
	}
```

Исправление png с методом crop (лёгким движением руки меняется на «scale»)

``` CSS
* HTML .png-crop {
	filter:expression(
		function(t){
			t.runtimeStyle.zoom = 1;
			t.runtimeStyle.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src='+t.currentStyle.backgroundImage.split('\"')[1]+', sizingMethod=crop)';
			t.runtimeStyle.backgroundImage = 'none';
		}(this)
	);
	}
```

Исправление png для `<img />`, не нужен прозрачный гиф. <sup>[пример](png.html)</sup>.

``` CSS
* HTML IMG {
	_visibility:expression(
		function(t){
			t.runtimeStyle.visibility = 'hidden';
			var png = document.createElement('png');
			png.style.cssText = 'zoom:1;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=' + t.src + ',sizingMethod=scale);';
			png.appendChild(t.replaceNode(png));
			if (png.parentNode.getAttribute('href')) {
				var pngclick = document.createElement('pngclick');
				pngclick.style.cssText = 'position:absolute;overflow:hidden;width:expression(runtimeStyle.width = parentNode.offsetWidth);height:expression(runtimeStyle.height = parentNode.offsetHeight);';
				t.parentNode.insertBefore(pngclick,t);
			}
		}(this)
	);
	}
```


## Минимальные/максимальные ширины/высоты {#MinMax}

Только max-width, берётся из элемента, только пиксели (возможно, стоит добавить проверку на изменение ширины самого элемента). <sup>[пример](minmax.html)</sup>.

``` CSS
.maxwidth {
	zoom:1;
	maxwidth:expression(
		function(t){
			var w = t.parentNode.scrollWidth;
			if (w != t.w) {
				t.w = w;
				var max = parseInt(t.currentStyle['max-width'], 10);
				t.style.width = 'auto';
				if (t.scrollWidth > max) {
					t.style.width = max;
				}
			}
		}(this)
	);
	}
```

min-width для BODY, берётся из свойства, только пиксели (standards-mode only (пока)) (+надо добавить кешируемость значения — чтобы перезаписывать его только если меняется).

``` CSS
* HTML BODY
{
	zoom:expression(
		function(t){
			t.runtimeStyle.zoom = 1;
			var max = parseInt(t.currentStyle['min-width'], 10);
			var f = function() {
				var w = document.documentElement.clientWidth;
				if (w != t.w) {
					t.w = w;
					if (w < max) {
						t.style.width = max;
					} else {
						t.style.width = 'auto';
					}
				}
			};
			f();
			window.attachEvent('onresize',f);
		}(this)
	);
}
```

Max-width/max-height, только пиксели, одноразовый.

``` CSS
IMG {
	zoom:expression(
		function(t){
			t.runtimeStyle.zoom = 1;
			var maxW = parseInt(t.currentStyle['max-width'], 10);
			var maxH = parseInt(t.currentStyle['max-height'], 10);
			if (t.scrollWidth > maxW &amp;&amp; t.scrollWidth >= t.scrollHeight) {
				t.style.width = maxW;
			} else if (t.scrollHeight > maxH) {
				t.style.height = maxH;
			}
		}(this)
	);
	}
```


## Позиционирование {#Positioning}

Реализация правильного абсолютного позиционирования (left+right/top+bottom), готово для «px» и «%», надо тестировать и поставить проверку на высоту/ширину (если можно). Может, добавить исправление для right/bottom при отстутствии left/top?

``` CSS
* HTML .tblr {
	tblr:expression(
		function (t) {
			function to_px(input, dim) {
				return input.match('%') ? Math.floor(dim / 100 * parseInt(input, 10)) : parseInt(input, 10);
			}
			var h = t.parentNode.offsetHeight || t.parentNode.parentNode.offsetHeight;
			var w = t.parentNode.offsetWidth || t.parentNode.parentNode.offsetWidth;
			var top = to_px(t.currentStyle.top, h);
			var bottom = to_px(t.currentStyle.bottom, h);
			var left = to_px(t.currentStyle.left, w);
			var right = to_px(t.currentStyle.right, w);

			if (t.h != h || t.top != top || t.bottom != bottom || t.w != w || t.left != left || t.right != right) {
				if (h >= 0 &amp;&amp; top >= 0 &amp;&amp; bottom >= 0) {
					t.h = h;
					t.top = top;
					t.bottom = bottom;
					t.style.height = h - (top + bottom) > 0 ? h - (top + bottom) : 0;
				}
				if (w >= 0 &amp;&amp; left >= 0 &amp;&amp; right >= 0) {
					t.w = w;
					t.left = left;
					t.right = right;
					t.style.width = w - (left + right) > 0 ? w - (left + right) : 0;
				}
			}
		}(this)
	);
	}
```

Фикс для убирания тряски в ие при фиксированном позиционировании

``` CSS
* HTML {
	background-image:url(about:blank);
	background-attachment:fixed;
	}
```

Экспрешн для нейтрализации тряски в ие при фиксированном позиционировании

``` CSS
* HTML {
	_behavior:expression(
		function(t){
			t.runtimeStyle.behavior = 'none';
			var style;
			if (t.currentStyle.backgroundImage) {
				style = t.runtimeStyle;
			} else {
				var body = document.documentElement || document.body;
				if (body.parentNode.currentStyle.backgroundImage) {
					style = body.parentNode.runtimeStyle;
				}
			}
			if (style) {
				style.backgroundImage = 'url(about:blank)';
				style.backgroundAttachment = 'fixed';
			}
		}(this)
	);
	}
```


## Перекрытие селектов айфреймом <sup>[пример](select.html)</sup> {#Select}

Исправление элементов над селектами, надо бы сделать вариант с отслеживанием состояния исходного элемента (кешируемый экспрешн на дисплей?)

``` CSS
.iframed {
	zoom:expression(
		function(t){
			t.runtimeStyle.zoom = 1;
			t.insertAdjacentHTML('beforeBegin','<iframe src="about:blank" style="position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=0);opacity:0;padding:0;margin:0;border:0;expression:expression(function(t){var L=t.nextSibling.offsetLeft;var T=t.nextSibling.offsetTop;var W=t.nextSibling.offsetWidth;var H=t.nextSibling.offsetHeight;if(t.L!=L||t.T!=T||t.W!=W||t.H!=H){			t.runtimeStyle.left=t.L=L;t.runtimeStyle.top=t.T=T;t.runtimeStyle.width=t.W=W;t.runtimeStyle.height=t.H=H;}}(this));"></iframe>')
		}(this)
	);
	}
```

## Растягивание высоты {#Height}

Высота: 100%

``` CSS
.height100 {
	position:absolute;
	stretch:expression(
		function(t){
			var h = t.parentNode.offsetHeight;
			if (t.h != h) {
				t.style.height = t.h = h;
			}
		}(this)
	);
	}
```


## Opacity! {#Opacity}

Увы, восьмой ие должен работать в режиме седьмого.

``` CSS
.opacity {
	filter:expression(
		function(t){
			t.runtimeStyle.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + t.currentStyle.opacity * 100 + ')';
		}(this)
	);
	}
```

А если надо без экспрешнов и в восьмом, надо тупо вот так:

``` CSS
.opacity {
	-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
	filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=0);
	opacity:0;
	}
```


## Размер шрифта в зависимости от dpi {#Dpi}

Применяем для BODY, переопределяя стандартную величину (на самом деле, надо бы брать и парсить эту величину, а не хардкодить, по-хорошему-то)

``` CSS
BODY {
	font-size:expression(
		function(t){
			if (screen.deviceXDPI == screen.logicalXDPI) {
				t.runtimeStyle.fontSize = 6000/screen.logicalYDPI + '%';
			} else {
				t.runtimeStyle.fontSize = '62.5%';
			}
		}(this)
	);
	}
```


## Реализация простого счётчика <sup>[пример](counter.html)</sup> {#Counter}

Всем браузерам отдаём:

``` CSS
.list {
	counter-reset:list_item;
	}
	.list-item {
		display:block;
		}
		.list-item:before,
		.list-item-before {
			content:counter(list_item);
			counter-increment:list_item;
			}
```

А только для ие:

``` CSS
.list-item {
	list-style-type:expression(
		function(t){
			t.runtimeStyle.listStyleType = 'none';
			t.insertAdjacentHTML('afterBegin','<span class="list-item-before">' + (++t.parentNode.IEcounter || (t.parentNode.IEcounter = 1)) + '</span>');
		}(this)
	);
	}
```


## Эмуляции псевдоклассов <sup>[пример](pseudoclass.html)</sup> {#Pseudoclass}

Эмуляция :hover

``` CSS
* HTML .some-block {
	_behavior: expression(
		function(t, hoverClass){
			t.runtimeStyle.behavior = 'none';
			hoverClass = hoverClass || t.className ? t.className.replace(/([^\s]+)/g,'$1_hover') : 'hover';
			t.attachEvent('onmouseover',function() {
				t.className += (' ' + hoverClass);
			});
			t.attachEvent('onmouseout',function() {
				t.className = t.className.replace(new RegExp(' ' + hoverClass,'g'), '');
			});
		}(this)
	);
	}
```

Эмуляция :focus

``` CSS
* HTML .type-text {
	_behavior: expression(
		function(t, focusClass){
			t.runtimeStyle.behavior = 'none';
			focusClass = focusClass || t.className ? t.className.replace(/([^\s]+)/g,'$1_focus') : 'focus';
			t.attachEvent('onfocus',function() {
				t.className += (' ' + focusClass);
			});
			t.attachEvent('onblur',function() {
				t.className = t.className.replace(new RegExp(' ' + focusClass,'g'), '');
			});
		}(this)
	);
	}
```

Эмуляция :target

``` CSS
 #SomeBlock {
	behavior: expression(
		function(t, targetClass){
			if (t.id) {
				var hash = window.location.hash;
				if (!t.targetClass) {
					t.targetClass = targetClass || t.className ? t.className.replace(/([^\s]+)/g,'$1_target') : 'target';
				}
				if (t.lastHash != hash) {
					t.lastHash = hash;
					if ("#"+t.id == hash) {
						t.className += (' ' + t.targetClass);
					} else {
						t.className = t.className.replace(new RegExp(' ' + t.targetClass,'g'), '');
					}
				}
			} else {
				t.runtimeStyle.behavior = 'none';
			}
		}(this)
	);
	}
```

## Благодарности {#Credits}

- [Павлу Корнилову](https://lusever.livejournal.com/) за [одноразовые экспрешны](https://lusever.ru/proceedings/thin_css/)
- [Виталию Харисову](https://vitaly.ya.ru/) за [кешируемые экспрешны](https://subbotnik.yandex.st/css-framework/practice.html)
<sup>(примерно 40-й слайд)</sup>
- [Stu Nicholls](https://www.cssplay.co.uk/) за [идею с селектами](https://www.cssplay.co.uk/menus/iframe-shim.html)
- [Игорю Зеничу](https://izenich.moikrug.ru/) за [раскрытие темы dpi](https://habrahabr.ru/blogs/css/42794/)
