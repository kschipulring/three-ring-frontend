echo "starting the prerender service for this build..."

#run the chromedrive service on this new build to generate index.html
php ../chrome-pagesave-client-php/index.php --operation=render


#default destination directory (for deployments)
dest_dir="../three-ring-frontend-build"

#get the .env variable default for 'BUILD_DEST'
BUILD_DEST=$(grep BUILD_DEST .env | xargs)
IFS='=' read -ra BUILD_DEST <<< "$BUILD_DEST"
BUILD_DEST=${BUILD_DEST[1]}

#only if this .env variable is correctly filled with a folder name pattern, then assign it to the variable.
if [[ $BUILD_DEST =~ [^a-zA-Z\_\ ] ]]; then
  dest_dir=$BUILD_DEST
fi


#command line param -dest_dir. Can set above var 'dest_dir' via command line. Overrides all above.
while getopts "d:" opt; do
  case ${opt} in
    d )
    
      echo $OPTARG
      dest_dir=$OPTARG
      ;;
    \? )
      echo "Invalid Option: -$OPTARG" 1>&2
      ;;
  esac
done
shift $((OPTIND -1))


echo $dest_dir

#make the destination directory if not there
[[ ! -d $dest_dir ]] && mkdir $dest_dir

#needed for what follows
shopt -s extglob

#gets rid of the old stuff currently in the destination folder
rm -rf $dest_dir/!(.|..|.gitignore|.git|README.md)


#copy everything in the build folder and send it to the destination folder
cp -r build/* $dest_dir

echo "build files copied to: $dest_dir"