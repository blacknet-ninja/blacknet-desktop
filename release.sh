version='0.2.4'

dmgsha256=`shasum -a 256 dist/blacknet-desktop-1.0.0.dmg`
winsha256=`shasum -a 256 dist/blacknet-desktop-1.0.0.exe`

dmgsha256=${dmgsha256:1:64}
winsha256=${winsha256:1:64}

echo $dmgsha256
echo $winsha256

curl --request POST --header "Private-Token: ${gitlab_private_token}" --form "file=@dist/blacknet-desktop-1.0.0.dmg" "https://gitlab.COM/api/v4/projects/blacknet-ninja%2Fblacknet-desktop/uploads"
curl --request POST --header "Private-Token: ${gitlab_private_token}" --form "file=@dist/blacknet-desktop-1.0.0.exe" "https://gitlab.COM/api/v4/projects/blacknet-ninja%2Fblacknet-desktop/uploads"
