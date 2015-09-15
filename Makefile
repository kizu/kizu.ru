build_styl:
	mkdir -p out/s/ && \
	./node_modules/stylus/bin/stylus --include-css --resolve-url-nocheck src/styl/*.styl -o out/s/

watch_styl:
	mkdir -p out/s/ && \
	./node_modules/stylus/bin/stylus --watch -m  --sourcemap-inline --include-css --resolve-url-nocheck src/styl/*.styl -o out/s/

.PHONY: build_styl
