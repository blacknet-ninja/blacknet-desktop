version='1.0.4'

dmgsha256=`shasum -a 256 dist/blacknet-desktop-${version}.dmg`
winsha256=`shasum -a 256 dist/blacknet-desktop-${version}.exe`

dmgsha256=${dmgsha256:1:64}
winsha256=${winsha256:1:64}

echo $dmgsha256
echo $winsha256

curl --request POST --header "Private-Token: ${gitlab_private_token}" --form "file=@dist/blacknet-desktop-${version}.dmg" "https://gitlab.COM/api/v4/projects/blacknet-ninja%2Fblacknet-desktop/uploads"
curl --request POST --header "Private-Token: ${gitlab_private_token}" --form "file=@dist/blacknet-desktop-${version}.exe" "https://gitlab.COM/api/v4/projects/blacknet-ninja%2Fblacknet-desktop/uploads"
