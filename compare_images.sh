# compare_images.sh
# Requires imagemagick `brew update && brew install imagemagick`

for entry in "branch_screenshots"/*
do
  if [ -f "$entry" ];then
    NAME=`basename $entry`
    echo $NAME
    `compare screenshots/$NAME branch_screenshots/$NAME -compose src diffs/$NAME.png`
  fi
done