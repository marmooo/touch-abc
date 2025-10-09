mkdir -p docs
cp -r src/* docs
drop-inline-css -r src -o docs
deno bundle --allow-import src/drill.js -o docs/drill.js
minify -r docs -o .
