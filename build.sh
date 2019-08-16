# currentpath=`pwd`
# cd blacknet
# # ls

# # cat src/main/resources/version.txt

# ./gradlew build

# version=`cat build/resources/main/version.txt`
# echo $version

# cd build/distributions
# rm -rf blacknet-$version
# unzip blacknet-$version.zip

# # mv blacknet-$version $currentpath/blacknet-dist
# cd $currentpath
# echo $version > version
rm -rf blacknet-*
rm -rf dist

electron-builder -mwl