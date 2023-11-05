apt update
apt install -y cmake git g++ gcc emscripten libde265-dev libjpeg-dev libtool curl zlib1g-dev xz-utils
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
emsdk install latest-upstream
cd ..

git clone git@github.com:Dakantz/libheif.git
git fetch
cd libheif
git switch feature/emscripten-fixes-and-depth
mkdir buildjs
cd buildjs
bash