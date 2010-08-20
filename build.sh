#!/bin/sh

# Set up variables
if [ "debug" = "$1" ]; then
    VERSION=`date +"%Y.%m.%d.debug"`
else
    VERSION=`sed -ne '/em:version/{ s/.*>\(.*\)<.*/\1/; p}' install.rdf`
fi

XPI="devcache-$VERSION.xpi"

echo "Creating build directory ..."
rm -rf build
mkdir build
echo "Copying files ..."
cp -r chrome.manifest chrome COPYING defaults install.rdf LICENSE \
  build/
cd build

if [ "debug" = "$1" ]; then
    echo "Patching install.rdf version ..."
    sed -e "s/<em:version>.*<\/em:version>/<em:version>$VERSION<\/em:version>/" \
      install.rdf > tmp
    cat tmp > install.rdf
    rm tmp
fi

echo "Building locales in chrome.manifest ..."
for entry in chrome/locale/*; do
    entry=`basename $entry`
    if [ "$entry" != "en-US" ]; then
        echo "locale devcache $entry locale/$entry/" >> chrome.manifest
    fi
done

echo "Building chrome..."

if [ "debug" = "$1" ]; then
    sed \
        -e "s/^content  *\([^ ]*\)  *\([^ ]*\)/content \1 chrome\/\2/" \
        -e "s/^skin  *\([^ ]*\)  *\([^ ]*\)  *\([^ ]*\)/skin \1 \2 chrome\/\3/" \
        -e "s/^locale  *\([^ ]*\)  *\([^ ]*\)  *\([^ ]*\)/locale \1 \2 chrome\/\3/" \
        chrome.manifest > tmp
    cat tmp > chrome.manifest
    rm tmp
else
    sed \
        -e "s/^content  *\([^ ]*\)  *\([^ ]*\)/content \1 jar:chrome\/devcache.jar!\/\2/" \
        -e "s/^skin  *\([^ ]*\)  *\([^ ]*\)  *\([^ ]*\)/skin \1 \2 jar:chrome\/devcache.jar!\/\3/" \
        -e "s/^locale  *\([^ ]*\)  *\([^ ]*\)  *\([^ ]*\)/locale \1 \2 jar:chrome\/devcache.jar!\/\3/" \
        chrome.manifest > tmp
    cat tmp > chrome.manifest
    rm tmp
    cd chrome
    find content skin locale | sort | \
      zip -r -0 -@ "devcache.jar" > /dev/null
    rm -fr content/ skin/ locale/
    cd ..
fi

echo "Cleaning up ..."
find . -depth -name '*~' -exec rm -rf "{}" \;
find . -depth -name '#*' -exec rm -rf "{}" \;

echo "Creating $XPI ..."
zip -qr9X "../xpi/$XPI" *

echo "Cleaning up temporary files ..."
cd ..
rm -rf build
