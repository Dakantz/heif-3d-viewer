
cd libheif/buildjs

USE_WASM=1 ENABLE_LIBDE265=1 USE_TYPESCRIPT=1 ../build-emscripten.sh ..
echo "copying files..."
cp libheif.js ../../heif-3dviewer/src/lib
cp libheif.d.ts ../../heif-3dviewer/src/lib
cp libheif.wasm ../../heif-3dviewer/public