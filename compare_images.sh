# compare_images.sh
# Requires imagemagick `brew update && brew install imagemagick`

for entry in "$1"/*
do
  if [ -f "$entry" ];then
    NAME=`basename "$entry"`
    echo $NAME
    `compare "$1/$NAME" "$2/$NAME" -compose src "diffs/$NAME"`
  fi
done