#!/bin/bash

# This file is licensed under the MIT License and is part of the "redirector" project.
# Copyright (c) 2019 Daniel Riegler
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

# config file path
CONFIG_FILE="./config.toml"
# config backup file
CONFIG_BACKUP="/tmp/config.toml.save"

# check for git and install it if not already installed
if ! dpkg -s "git" >/dev/null 2>&1; then
  printf "\e[33mCould not find git, trying to install it...\n\e[0m"
  sudo apt install git -y
fi

# backup config
if ! test -f "$CONFIG_FILE"; then
  printf "\e[33mCould not find default config file at %s, don't backing it up...\n\e[0m" "$CONFIG_FILE"
else
  # delete backup file if already exists
  if test -f "$CONFIG_BACKUP"; then
    rm $CONFIG_BACKUP
  fi
  DATE=$(date '+%Y-%m-%d %H:%M:%S')
  awk 'NR==1{print "# '"$DATE"'\n"}-1' $CONFIG_FILE >> $CONFIG_BACKUP
  printf "\e[32mBacked up config from %s at %s.\n\e[0m" "$CONFIG_FILE" "$CONFIG_BACKUP"
fi

# pull files
git reset --hard
git pull

# restore config backup
if test -f "$CONFIG_BACKUP"; then
  sudo cp $CONFIG_BACKUP $CONFIG_FILE
  printf "\e[32mRestored config backup from %s to %s.\n\e[0m" "$CONFIG_BACKUP" "$CONFIG_FILE"
fi

# chmod all sh files
chmod +x ./*.sh ./**/*.sh

# restart service if enabled
if service --status-all | grep -Fq 'redirector'; then
  sudo service redirector restart
fi
