# Условия для CSS-переменных

#Practical #CSS_Logic #CSS_Variables #Future_CSS #Preprocessing #Bugs #CSS

_Переменные в CSS очень мощные и позволяют делать множество интересных вещей. Но у нас пока нет нативных условных конструкций, которые бы мы применяли вместе с ними. В этой статье я расскажу об одном из обходных путей, который можно использовать в качестве таких псевдо-условий._

Я начну с того, что в спецификациях нет ничего[^not-those] про условия для [CSS-переменных](https://www.w3.org/TR/css-variables-1/). Я думаю, что это огромное упущение, так как, хотя переменные уже предоставляют кучу вещей, которые невозможно достичь иными средствами, отсутствие условий очень удручает, так как их очень много для чего можно было бы использовать.

[^not-those]: Хотя и есть модуль с названием [«CSS Conditional Rules»](https://www.w3.org/TR/css3-conditional/), не стоит ожидать, что он о CSS-переменных — в нём только всякое про at-rules. И, кстати, даже есть [предложение](https://tabatkins.github.io/specs/css-when-else/) о @-правилах `@when`/`@else`, которые, опять же, никакого отношения к переменным не имеют. <!-- span="2" -->

Но что, если бы нам захотелось использовать эти воображаемые несуществующие условные конструкции для переменных уже _сейчас_? Как и со множеством других вещей в CSS, в каких-то случаях мы можем обойтись и хаками.


## Определение проблемы

Итак, что нам нужно: возможность при помощи единственной CSS-переменной уметь задавать _разные_ значения для разных CSS-свойств, при этом без того, чтобы эти значения были основаны на этой самой переменной (или другими словами — эти значения не должны _вычисляться_ из нашей переменной).

Нам нужны **условия**.


## Использование вычислений для бинарных условий

Перейду сразу к делу и приведу сходу решение, которое уже позже объясню, можете сначала попробовать сами понять что тут как работает:

``` CSS
:root {
    --is-big: 0;
}

.is-big {
    --is-big: 1;
}

.block {
    padding: calc(
        25px * var(--is-big) +
        10px * (1 - var(--is-big))
    );
    border-width: calc(
        3px * var(--is-big) +
        1px * (1 - var(--is-big))
    );
}
```

В этом примере мы заставляем все наши элементы с `.block` получать паддинги равные `10px` и ширины границ равные `1px`, до тех пор, пока значение переменной `--is-big` на этих элементах не станет равным `1`, и в этом случае значения станут `25px` и `3px` соответственно.

Механизм под всем этим довольно простой: мы используем оба возможных значения в едином вычислении, используя `calc()`, где мы обнуляем одно значение и оставляем другое в зависимости от нашей переменной, которая может принимать одно из двух значений: `1` или `0`. Иными словами, у нас там будет `25px * 1 + 10px * 0` в одном случае и `25px * 0 + 10px * 1` в другом.


## Более сложные условия

Мы можем использовать этот метод не только для выбора из двух возможных значений, но и для трёх или более. Правда, для каждого нового значения сложность вычисления увеличивается. Так, для трёх возможных значений, вычисление станет уже таким:

``` CSS
.block {
    padding: calc(
        100px * (1 - var(--foo)) * (2 - var(--foo)) * 0.5 +
            20px * var(--foo) * (2 - var(--foo)) +
            3px * var(--foo) * (1 - var(--foo)) * -0.5
    );
}
```

Тут это вычисление принимает три возможных значения для переменной `--foo` — `0`, `1` и `2`, и вычисляет паддинг равный `100px`, `20px` или `3px` соответственно.

Общий принцип тот же: нам нужно каждый возможный результат умножить на выражение, дающее `1` для нужного значения переменной и `0` для остальных. И это выражение составляется так же просто: нам нужно обнулять каждое иное возможное значение переменной. После чего нам нужно подставить то значение, которое должно давать `1` в получившееся выражение и добавить множитель для того, чтобы привести-таки результат к этой самой единице.


### Возможная ловушка в спецификациях

С увеличением сложности вычислений появляется шанс, что они перестанут работать. Почему? В [спецификации](https://drafts.csswg.org/css-values-3/#calc-syntax) есть такая вот заметка (в моём переводе):

> Браузеры должны поддерживать `calc()`-выражения, состоящие как минимум из 20 терминов, где каждое ЧИСЛО, РАЗМЕРНОСТЬ или ПРОЦЕНТ является термином. Если `calc()`- выражение содержит больше терминов, чем поддерживается, такое выражение должно считаться невалидным.

Конечно, я немного потестировал это дело и не смог найти подобных ограничений в существующих браузерах, но, так или иначе, есть шанс, что если вы напишете достаточно сложный код, то вы столкнётесь с этим ограничением, ну или какие-то браузеры вполне могут его в будущем добавить, так что будьте осторожны.


## Условия для цветов

Как можно увидеть, такие вычисления могут использоваться только для тех вещей, которые вы можете _вычислить_, так что не получится использовать это дело для переключения значений свойств типа `display` и аналогичных. Но что насчёт цветов? На самом деле, мы можем вычислять значения отдельных компонент цвета. К сожалению, сейчас это будет работать только в вебкитах и блинках, а вот Firefox [пока не поддерживает](https://bugzilla.mozilla.org/show_bug.cgi?id=984021 "Bugzilla ticket") `calc()` внутри `rgba()` или других цветовых функций.

Но когда такая поддержка появится (ну или если вам захочется поэкспериментировать над этим делом там, где оно уже работает), мы можем делать вещи вроде этой:

``` CSS
:root {
    --is-red: 0;
}

.block {
    background: rgba(
        calc(
            255*var(--is-red) +
            0*(1 - var(--is-red))
            ),
        calc(
            0*var(--is-red) +
            255*(1 - var(--is-red))
            ),
        0, 1);
}
```

Тут у нас будет по умолчанию зелёный цвет, и красный, если мы зададим `--is-red` значение `1` (стоит отметить, что если какой-то компонент должен быть нулём, то мы, очевидно, можем просто все его множетели опустить для более компактной записи, но тут я их оставил для лучшего понимания алгоритма).

И, так как мы можем вычислять любые компоненты цвета, мы можем создавать для них наши условные вычисления (и, возможно, сможем делать их даже для градиентов? Вам стоит это попробовать!).


### Очередная ловушка в спецификациях

Когда я тестировал как работают уловные вычисления для цветов, я наткнулся на очень, _очень_ странное ограничение в спецификициях[^issue-resolved]. Ограничение под названием «проверка типов». Теперь я её официально ненавижу. Что это ограничение значит — если ваше свойство принимает только значение с типом `<integer>`, то если у вас внутри `calc()` будут дробные числа или любое деление, то даже если в результате будет гарантировано целое число, то так называемый «resolved type» будет не `<integer>`, а `<number>`, что, в свою очередь, не даст этим свойствам принимать это значение как валидное. А так как, если посмотреть выше, в наших условных выражениях с более чем двумя значениями окажутся дробные модификаторы, то они сделают наши вычисления невалидными, как для компонент цвета, так и для других свойств, принимающих только `<integer>` (например, `z-index`).

[^issue-resolved]: Таб Аткинс [рассказал](https://github.com/kizu/kizu.github.com/issues/186) о том, что эта проблема с компонентами цвета была поправлена в спецификациях (но исправление ещё не поддержано браузерами). Ура! Также он сказал, что есть ещё решение — использовать внутри `rgba` проценты, а я совершенно о такой возможности забыл, хаха. <!-- offset="2" -->

Вот такое выражение:

``` CSS
calc(255 * (1 - var(--bar)) * (var(--bar) - 2) * -0.5)
```

Не будет валидным внутри `rgba()`. Изначально я даже думал, что такое поведение — баг, особенно учитывая, что цветовые функции вообще хорошо переваривают всякие значения, выходящие за разумные границы (вы вполне можете написать `rgba(9001, +9001, -9001, 42)` и это даст вам валидный жёлтый цвет), но вот эта вот типизация оказывается слишком сложно перевариваемой для браузеров.

#### Возможные решения?

Есть одно довольно далёкое от идеала решение. Так как в нашем случае мы знаем и желаемое значение, и проблемный модификатор с дробью, то мы можем предвычислить их вместе и округлить перед тем, как вставлять в `calc()`. Да, во многих случаях получаемое значение будет чуть отличаться из-за потери в точности. Но это же лучше, чем ничего, ведь правда?

Хотя есть ещё одно решение, но которое будет работать только с цветами — мы можем использовать `hsla` вместо `rgba`, так как в таком случае внутри будут не целые числа, а то, что таки нормально пережёвывает `calc()`. Но да, для свойств вроде `z-index` это не прокатит. И даже для цветов всё равно возможны небольшие потери в точности если переводить для этого `rgb` в `hsl`. Но эти потери должны быть меньше, чем в предыдущем решении.


## Препроцессинг

Тогда как для бинарных условий вполне реально писать вычисления вручную, для более сложных случаев, или в случае тех же цветов, нам бы пригодились инструменты, которые бы позволили делать это всё автоматически. К счастью, у нас есть для этого препроцессоры.

Вот как я реализовал это быстренько на Стайлусе[^pen]:

[^pen]: Можно посмотреть на этот же код [на CodePen](https://codepen.io/kizu/pen/zKmyvG) в действии. <!-- span="2" -->

``` Stylus
    conditional($var, $values...)
      $result = ''

      // If there is only an array passed, use its contents
      if length($values) == 1
        $values = $values[0]

      // Validating the values and check if we need to do anything at all
      $type = null
      $equal = true

      for $value, $i in $values
        if $i > 0 and $value != $values[0]
          $equal = false

        $value_type = typeof($value)
        $type = $type || $value_type
        if !($type == 'unit' or $type == 'rgba')
          error('Conditional function can accept only numbers or colors')

        if $type != $value_type
          error('Conditional function can accept only same type values')

      // If all the values are equal, just return one of them
      if $equal
        return $values[0]

      // Handling numbers
      if $type == 'unit'
        $result = 'calc('
        $i_count = 0
        for $value, $i in $values
          $multiplier = ''
          $modifier = 1
          $j_count = 0
          for $j in 0..(length($values) - 1)
            if $j != $i
              $j_count = $j_count + 1
              // We could use just the general multiplier,
              // but for 0 and 1 we can simplify it a bit.
              if $j == 0
                $modifier = $modifier * $i
                $multiplier = $multiplier + $var
              else if $j == 1
                $modifier = $modifier * ($j - $i)
                $multiplier = $multiplier + '(1 - ' + $var + ')'
              else
                $modifier = $modifier * ($i - $j)
                $multiplier = $multiplier + '(' + $var + ' - ' + $j + ')'

              if $j_count < length($values) - 1
                $multiplier = $multiplier + ' * '

          // If value is zero, just don't add it there lol
          if $value != 0
            if $modifier != 1
              $multiplier = $multiplier + ' * ' + (1 / $modifier)
            $result = $result + ($i_count > 0 ? ' + ' : '') + $value + ' * ' + $multiplier
            $i_count = $i_count + 1

        $result = $result + ')'

      // Handling colors
      if $type == 'rgba'
        $hues = ()
        $saturations = ()
        $lightnesses = ()
        $alphas = ()

        for $value in $values
          push($hues, unit(hue($value), ''))
          push($saturations, saturation($value))
          push($lightnesses, lightness($value))
          push($alphas, alpha($value))

        $result = 'hsla(' + conditional($var, $hues) + ', ' + conditional($var, $saturations) + ', ' + conditional($var, $lightnesses) + ', ' + conditional($var, $alphas) +  ')'

      return unquote($result)
```

Да, кода довольно много, но этот миксин способен генерировать условия как для чисел, так и для цветов, и не только для бинарных условий, но и для любого числа возможных значений в них.

Использование миксина очень простое:

``` CSS
border-width: conditional(var(--foo), 10px, 20px)
```

Первый аргумент — наша переменная, вторым аргументом будет то значение, которое должно применяться когда переменная будет равна `0`, третий аргумент — `1`, и т.д.

Вызов миксина выше сгенерит вот такое условное выражение:

``` CSS
border-width: calc(10px * (1 - var(--foo)) + 20px * var(--foo));
```

А вот более сложный пример с цветами:

``` CSS
color: conditional(var(--bar), red, lime, rebeccapurple, orange)
```

Он сгенерит то, что вы точно не захотите писать вручную:

``` CSS
color: hsla(calc(120 * var(--bar) * (var(--bar) - 2) * (var(--bar) - 3) * 0.5 + 270 * var(--bar) * (1 - var(--bar)) * (var(--bar) - 3) * 0.5 + 38.82352941176471 * var(--bar) * (1 - var(--bar)) * (var(--bar) - 2) * -0.16666666666666666), calc(100% * (1 - var(--bar)) * (var(--bar) - 2) * (var(--bar) - 3) * 0.16666666666666666 + 100% * var(--bar) * (var(--bar) - 2) * (var(--bar) - 3) * 0.5 + 49.99999999999999% * var(--bar) * (1 - var(--bar)) * (var(--bar) - 3) * 0.5 + 100% * var(--bar) * (1 - var(--bar)) * (var(--bar) - 2) * -0.16666666666666666), calc(50% * (1 - var(--bar)) * (var(--bar) - 2) * (var(--bar) - 3) * 0.16666666666666666 + 50% * var(--bar) * (var(--bar) - 2) * (var(--bar) - 3) * 0.5 + 40% * var(--bar) * (1 - var(--bar)) * (var(--bar) - 3) * 0.5 + 50% * var(--bar) * (1 - var(--bar)) * (var(--bar) - 2) * -0.16666666666666666), 1);
```

Стоит отметить, что у меня в миксине нет поддержки тех мест, где принимаются только `<integer>`, так что он может не работать для `z-index` и прочих. Но он уже конвертирует цвета в `hsla()`, чтобы с ними справляться (хотя и это можно доделать так, чтобы это происходило только тогда когда нужно, а не всегда). Другая вещь, которую я не реализовал (пока?) в этом миксине — возможность прокидывать в качестве значений другие CSS-переменные. Это вполне возможно для тех свойств, что принимают не `<integer>`, так как их можно будет просто подставлять в наши условные вычисления. Возможно, когда-нибудь я и найду время чтобы это доделать. А пока можно для простых случаев писать эти выражения вручную следуя алгоритму, описанному в этой статье.


## Фолбеки

Конечно, если вы действительно собираетесь всё это дело использовать, вам понадобится возможность использовать фолбеки. Для браузеров, не поддерживающих переменные, это просто — можно определять декларацию с фолбеком заранее:

``` CSS
.block {
    padding: 100px; /* fallback */
    padding: calc(
        100px * ((1 - var(--foo)) * (2 - var(--foo)) / 2) +
            20px * (var(--foo) * (2 - var(--foo))) +
            3px * (var(--foo) * (1 - var(--foo)) / -2)
    );
}
```

Но вот когда дело доходит до цветов, то появляется проблема: как только появляются переменные, то по факту (и это очередное очень странное место в спецификациях), _тупо любая_ декларация, в которой есть CSS-переменные, оказывается валидной. А это значит, что не получится использовать фолбек для чего-либо, где есть CSS-переменные:

``` CSS
background: blue;
background: I 💩 CSS VAR(--I)ABLES;
```

Вот это вот — валидно согласно спецификациям, фон будет принимать своё `initial` значение, а фолбек применяться не будет (даже если ну совершенно очевидно, что остальные части значения ну уж точно некорректны).

Так что, для того, чтобы предоставлять фолбеки в подобных случаях, нам надо будет воспользоваться обёрткой с `@supports`, в которой мы будем проверять поддержку всего **кроме** переменных.

В нашем случае нам надо добавить такую обёртку для Firefox:

``` CSS
.block {
    color: #f00;
}
@supports (color: rgb(0, calc(0), 0)) {
    .block {
        color: rgba(calc(255 * (1 - var(--foo))), calc(255 * var(--foo)), 0, 1);
    }
}
```

Тут мы тестируем поддержку вычислений внутри цветовых функций, после чего применяем условное вычисление для цвета внутри этой проверки.

В принципе, вполне возможно создавать такие фолбеки автоматически, но я бы не рекомендовал использовать для этого препроцессоры — сложность того, что для этого нужно будет делать уже превышает возможности препроцессоров.


## Сценарии использования

Я, правда, не люблю расписывать сценарии использования для вещей, необходимость в которых очевидна. Так что я буду краток. И да, я опишу сценарии использования условий не только для переменных, но и для вычислений с помощью `calc()`.

- Условия для CSS-переменных могут быть идеальны для тематизации блоков. С их помощью можно иметь набор пронумерованных тем и потом применять их к блокам (и даже ко вложенным!) используя только одну CSS-переменную типа `--block-variant: 1`. Это то, что невозможно сделать чем-то кроме как переменными, а если появится необходимость задавать для темы разные значения для разных свойств, то без условий пришлось бы задавать целый набор разных переменных каждый раз когда хочется применить тему.

- Типографика. Если бы была возможность использовать сравнения с `<`, `<=`, `>` и `>=`, то можно было бы создать набор «правил» для разных размеров шрифта, чтобы автоматически подбирать высоту строки, жирность и другие свойства шрифта в зависимости от исходного размера. Это и сейчас возможно, конечно, но не тогда, когда нужно иметь «шаги» для размеров, а не просто значения вычисленные из `em`-ов.

- Адаптивный дизайн. Ну, если бы были полноценные условия для вычислений, то это было бы почти что теми самыми «element queries» — можно было бы смотреть на `vw` или ширину родителей и  решать какие значения применять в каком случае.

Наверняка есть и другие сценарии использования для условий, расскажите если придумаете! Я сам, уверен, натыкался на множество из них, но, так как у меня очень плохая память, то я не запоминаю всё-всё, что я хочу делать с CSS. Потому что я хочу делать _всё_.


## Будущее

Я бы очень хотел увидеть условия для CSS-переменных в спецификициях CSS, так чтобы нам не приходилось прибегать к хакам и мы могли бы использовать условия и для невычисляемых значений. Ну и даже с хаками пока невозможно использовать условия кроме как строгого равенства, так что никаких нам «если переменная больше, чем X» и подобных вещей. Я не вижу причин почему в CSS нельзя добавить полноценные условия, так что если вы знакомы с кем-то, кто разрабатывает спецификации CSS — вы им намекните там. Я только надеюсь, что нам не ответят что-то вроде «просто используйте JS» и не станут делать предположения о том, почему это в принципе невозможно. Да вот же, оно уже возможно, пускай и с хаками. Не может быть никаких оправданий.
