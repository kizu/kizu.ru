build:
	stylus --include-css s/style.styl && \
	stylus --include-css s/style_ie.styl

serve:
	jekyll serve --watch --config _config.yml,_config-dev.yml

.PHONY: build
