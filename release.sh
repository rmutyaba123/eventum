#!/bin/sh
set -e
set -x
app=eventum
#rc=RC1 # release candidate
rc=dev # development version
dir=$app

# checkout
rm -rf $dir

bzr clone lp:eventum $dir

# tidy up
cd $dir
version=$(awk -F"'" '/APP_VERSION/{print $4}' init.php)

if [ "$rc" = "dev" ]; then
	revno=$(bzr revno $dir)
	sed -i -e "
		/define('APP_VERSION'/ {
			idefine('APP_VERSION', '$version-bzr$revno');
		    d

		}" init.php
	rc=-dev-r$revno
fi

make -C localization
touch logs/{cli.log,errors.log,irc_bot.log,login_attempts.log}
chmod -R a+rwX templates_c locks logs config
rm -f release.sh phpxref.cfg phpxref.sh make-tag.sh

# sanity check
if [ -z "$revno" ]; then
	find -name '*.php' | xargs -l1 php -l
fi
rm -rf .bzr*
cd -

# make tarball and md5 checksum
rm -rf $app-$version
mv $dir $app-$version
tar -czf $app-$version$rc.tar.gz $app-$version
rm -rf $app-$version
md5sum -b $app-$version$rc.tar.gz > $app-$version$rc.tar.gz.md5
