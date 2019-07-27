
git submodule init
git submodule update

rm -rf blacknet-dist

currentpath=`pwd`
cd blacknet
# ls

# cat src/main/resources/version.txt

./gradlew build

version=`cat build/resources/main/version.txt`
echo $version

cd build/distributions
rm -rf blacknet-$version
unzip blacknet-$version.zip

# mv blacknet-$version $currentpath/blacknet-dist
cd $currentpath
echo $version > version
node version.js

electron-builder -mwl