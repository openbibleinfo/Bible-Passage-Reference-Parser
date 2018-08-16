#!/bin/sh

are_there_files_to_be_committed() {
  [ "`git ls-files -m`" != "" ] && return;
  false;
}

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

commit_all_files() {
  git add --all
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git remote add origin2 https://${GH_TOKEN}@github.com/renehamburger/Bible-Passage-Reference-Parser.git > /dev/null 2>&1
  branch=${TRAVIS_PULL_REQUEST_BRANCH:-$TRAVIS_BRANCH}
  git push --quiet origin2 HEAD:$branch
}

print_info() {
  echo "The following files were committed & pushed:"
  git log -1 --pretty=format:"%C(green)%h %C(yellow)[%ad]%Cred%d %Creset%s%Cblue [%cn]" --decorate --date=short --numstat
  commit=`git log -1 --format="%h"`
  echo "The parser is available at:"
  echo "https://cdn.rawgit.com/renehamburger/Bible-Passage-Reference-Parser/$commit/js/<LANGUAGE_CODE>_bcv_parser.js"
}

if are_there_files_to_be_committed
then
  setup_git
  commit_all_files
  upload_files
  print_info
fi
