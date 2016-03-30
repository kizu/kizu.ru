# Подборка багов

<style>
TABLE {
	font-size:0.75em;
	margin:0 0 1em;
	text-align: left;
	}

	CAPTION {
		font-size:2em;
		text-align:left;
		color:rgba(0,0,0,0.6);
		}

	TH {
		text-align:left;
		}

	TD {
		padding:.25em .5em .25em 0;
		}

	TABLE IFRAME {
		height:16px;
		width:16px;
		border:0;
		vertical-align:middle;
		}
</style>

## Опера

<table>
	<thead>
		<tr>
			<th>test-case</th>
			<th>?</th>
			<th>Примечания</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><a href="bug/-o-inline-block.html">:first-letter для inline-block</a></td>
			<td><iframe src="bug/-o-inline-block.html"></iframe></td>
			<td>тупит Опера &lt; 10.50</td>
		</tr>
		<tr>
			<td><a href="-o-strange1.html">Странный баг оперы (сложные условия)</a></td>
			<td><iframe src="bug/-o-strange1.html"></iframe></td>
			<td>тупит Опера &lt; 10.50</td>
		</tr>

		<tr>
			<td><a href="-o-positioning.html">Баг оперы с позиционированием</a></td>
			<td><iframe src="bug/-o-positioning.html"></iframe></td>
			<td>pos:absolute+top+bottom+parent-resize = no repaint<br/></td>
		</tr>
		<tr>
			<td><a href="bug/-o-scroll.html">скроллбар перекрывает контент</a></td>
			<td><iframe src="bug/-o-scroll.html"></iframe></td>
			<td>тупит Опера &lt; 11.10</td>
		</tr>
		<tr>
			<td><a href="-o-absolute-nowrap.html">абсолютный блок врапает новрап</a></td>
			<td><iframe src="bug/-o-absolute-nowrap.html"></iframe></td>
		</tr>
		<tr>
			<td><a href="bug/-o-text-shadow.html">тень не срабатывает для текст-декорейшна</a></td>
			<td><iframe src="bug/-o-text-shadow.html"></iframe></td>
		</tr>
		<tr>
			<td><a href="bug/-o-rotate.html">Пропадающий bgi</a></td>
			<td><iframe src="bug/-o-rotate.html"></iframe></td>
			<td>CSS3 rotate и overflow:hidden для родителя заставляют глючить background-image</td>
		</tr>
		<tr>
			<td><a href="-o-inlines.html">Неврапающийся паддинг</a></td>
			<td><iframe src="bug/-o-inlines.html"></iframe></td>
		</tr>
	</tbody>
</table>

Ну и вот несколько ещё «неформализованных» багов оперы:

<ul>
	<li><a href="input-opacity.html">непрозрачность стандарных инпутов в опере под мак</a> &lt; 10.70 build 8425.</li>
	<li><a href="target.html">Псевдоселектор :target и переходы назад-вперёд по истории</a></li>
	<li><a href="-o-positioning2.html">fit to width</a></li>
</ul>

## Остальные

<table>
	<thead>
		<tr>
			<th>test-case</th>
			<th>?</th>
			<th>Примечания</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><a href="bug/rowspan.html">rowspan="0"</a></td>
			<td><iframe src="bug/rowspan.html"></iframe></td>
			<td>все кроме фф и оперы (внезапно!)</td>
		</tr>

		<tr>
			<td><a href="bug/colspan.html">colspan="0"</a></td>
			<td><iframe src="bug/colspan.html"></iframe></td>
			<td>все кроме фф</td>
		</tr>

		<tr>
			<td><a href="bug/textnode-fr.html">float:right, wsn и текстнода</a></td>
			<td><iframe src="bug/textnode-fr.html"></iframe></td>
			<td>тупит фф</td>
		</tr>
		<tr>
			<td><a href="bug/textnode-fl.html">float:left, wsn и текстнода</a></td>
			<td><iframe src="bug/textnode-fl.html"></iframe></td>
			<td>тупит фф</td>
		</tr>
		<tr>
			<td><a href="-moz-flfroh.html">float:left &gt; float:right + overflow:hidden</a></td>
			<td><iframe src="bug/-moz-flfroh.html"></iframe></td>
			<td>тупит фф</td>
		</tr>
	</tbody>
</table>

Ну и вот несколько ещё «неформализованных» багов:

<ul>
	<li><a href="-webkit-selector.html">webkit не обновляет динамически селекторы + и ~ дальше первого элемента</a></li>
	<li><a href="-moz-mautofloat.html">firefox тупит при ресайзе с флоатом и автомаржином</a></li>
</ul>
