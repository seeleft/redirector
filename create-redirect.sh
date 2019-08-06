#!/bin/bash

#             DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
#                     Version 2, December 2004
#
#  Copyright (C) 2019 Daniel Riegler <prnxchannel@gmail.com>
#
#  Everyone is permitted to copy and distribute verbatim or modified
#  copies of this license document, and changing it is allowed as long
#  as the name is changed.
#
#             DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
#    TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
#
#   0. You just DO WHAT THE FUCK YOU WANT TO.


# Helper script for the redirector project (https://github.com/seeleft/redirector)
# This script can create redirects with a simple CLI

# stoml toml parser settings
# https://github.com/freshautomations/stoml
STOML_PATH="/tmp/stoml"
STOML_MIRROR="https://github.com/freshautomations/stoml/releases/download/v0.3.0/stoml_linux_amd64"

# parse arguments
# adopted from: https://unix.stackexchange.com/questions/129391/passing-named-arguments-to-shell-scripts
while [ $# -gt 0 ]; do
     if [[ $1 == *"--"* ]]; then
       v="${1/--/}"
       declare $v="$2"
     fi
    shift
done

# check for location argument
if [ -z "$LOCATION" ]; then
  printf "\e[31mMissing neccessary argument: --LOCATION <url>\n\e[0m"
  exit 1
fi

# check for key argument; generate random one if unset
# adopted from: https://gist.github.com/earthgecko/3089509
if [ -z "$KEY" ]; then
  declare "KEY"=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 6 | head -n 1)
  printf "\e[33mMissing argument: --KEY <string> but generated \"%s\"\n\e[0m" "$KEY"
fi

# set default workdir
if [ -z "$WORKDIR" ]; then
  declare "WORKDIR"="/opt/redirector"
  printf "\e[33mMissing argument: --WORKDIR <path> but trying to use default one (%s).\n\e[0m" "$WORKDIR"
fi

# set config path
CONFIG="$WORKDIR/config.toml"

# check if config file exists
if ! test -f "$CONFIG"; then
  printf "\e[31mCould not locate %s\n\e[0m" "$CONFIG"
  exit 1
fi

# check for stoml (toml file parser) and download it if not already present
if ! test -f "$STOML_PATH"; then
  printf "\e[33mCould not find %s, trying to download it...\n\e[0m" "$STOML_PATH"
  wget -O $STOML_PATH $STOML_MIRROR
  chmod +x $STOML_PATH
fi

# check for nodejs and install it if not already installed (used for json parsing)
if ! dpkg -s "nodejs" >/dev/null 2>&1; then
  printf "\e[33mCould not find nodejs, trying to install it...\n\e[0m"
  sudo apt install nodejs -y
fi

# export neccessary config values via stoml
export HOST=`$STOML_PATH $CONFIG http.host`
export PORT=`$STOML_PATH $CONFIG http.port`
export PATH=`$STOML_PATH $CONFIG http.path`
export API_PATH=`$STOML_PATH $CONFIG http.apiPath`
export AUTH_HEADER=`$STOML_PATH $CONFIG http.authorization.header`
export AUTH_EXPECT=`$STOML_PATH $CONFIG http.authorization.expect`

# remove trailing slash from path
if [[ "$PATH" == */ ]]; then
  declare "PATH"=${PATH::-1}
fi

# build request url
REQUEST_URL="http://$HOST:$PORT$PATH$API_PATH/$KEY"

printf "Request url is %s.\n" "$REQUEST_URL"

# send request to server
RESPONSE=$(/usr/bin/curl -s \
        -d '{"location":"'"$LOCATION"'"}' \
        -H "Accept: application/json" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER: $AUTH_EXPECT" \
        -X POST $REQUEST_URL)

# check if response was sent
if [ -z "$RESPONSE" ]; then
  printf "\e[31mCouldn't get a response in application/json from the server.\n\e[0m"
  exit 1
else
  # parse and print response via nodejs
  RESPONSE="$RESPONSE" /usr/bin/node -e \
  "\
         const response = JSON.parse(process.env.RESPONSE)
         if(!response.success)
         {
            process.stdout.write('\x1b[31m' + response.error.name + ': ' + response.error.message + '\n\x1b[0m')
            process.exit(1)
         }
         else
            process.stdout.write('\x1b[32mSuccesfully created the redirect \"$KEY\" for $LOCATION.\n\x1b[0m')\
  "
fi