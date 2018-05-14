# compare_images.sh
# Requires imagemagick `brew update && brew install imagemagick`

for entry in "$1"/*
do
  if [ -f "$entry" ];then
    NAME=`basename "$entry"`
    DIFF=`compare -metric AE "$1/$NAME" "$2/$NAME" null: 2>&1`;

    if [ "${DIFF}" -eq "0" ]; then
    	echo "No difference: $NAME";
	else
		echo "Visual difference: $NAME";
		`compare -metric AE "$1/$NAME" "$2/$NAME" -compose src "diffs/$NAME"`;		
    fi
  fi
done