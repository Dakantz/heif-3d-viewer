
USE_WASM=1 ENABLE_LIBDE265=1 ../build-emscripten.sh ..
echo "copying files..."
cp libheif.js ../../heif-3dviewer/public
cp libheif.wasm ../../heif-3dviewer/public