PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')


echo "Start release $PACKAGE_VERSION"

declare -a arr=("dmg" "exe" "deb" "rpm" "freebsd")
description=''

for name in "${arr[@]}"
do
  sha256=`shasum -a 256 dist/blacknet-desktop-${PACKAGE_VERSION}.${name}`
  response=`curl --request POST  --silent --header "Private-Token: ${gitlab_private_token}" --form "file=@dist/blacknet-desktop-${PACKAGE_VERSION}.${name}" "https://gitlab.COM/api/v4/projects/blacknet-ninja%2Fblacknet-desktop/uploads"`
  markdown=`echo $response | jq -r '.markdown'`
  description+="${markdown} \n${name}: ${sha256:1:64}\n\n"
done

echo $description
