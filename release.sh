PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')


echo $PACKAGE_VERSION

dmgsha256=`shasum -a 256 dist/blacknet-desktop-${PACKAGE_VERSION}.dmg`
winsha256=`shasum -a 256 dist/blacknet-desktop-${PACKAGE_VERSION}.exe`
liunxsha256=`shasum -a 256 dist/blacknet-desktop-${PACKAGE_VERSION}.deb`

dmgsha256=${dmgsha256:1:64}
winsha256=${winsha256:1:64}
liunxsha256=${liunxsha256:1:64}

echo "DMG sha256: $dmgsha256"
echo "EXE sha256: $winsha256"
echo "DEB sha256: $liunxsha256"

curl --request POST --header "Private-Token: ${gitlab_private_token}" --form "file=@dist/blacknet-desktop-${PACKAGE_VERSION}.dmg" "https://gitlab.COM/api/v4/projects/blacknet-ninja%2Fblacknet-desktop/uploads"
curl --request POST --header "Private-Token: ${gitlab_private_token}" --form "file=@dist/blacknet-desktop-${PACKAGE_VERSION}.exe" "https://gitlab.COM/api/v4/projects/blacknet-ninja%2Fblacknet-desktop/uploads"
curl --request POST --header "Private-Token: ${gitlab_private_token}" --form "file=@dist/blacknet-desktop-${PACKAGE_VERSION}.deb" "https://gitlab.COM/api/v4/projects/blacknet-ninja%2Fblacknet-desktop/uploads"
