#!/bin/bash

# Install PM2 and npx globally
npm install -g pm2
npm install -g npx

cp admin /etc/nginx/sites-available/admin
cp frontend /etc/nginx/sites-available/frontend
ln -s /etc/nginx/sites-available/admin  /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/frontend  /etc/nginx/sites-enabled/
service nginx restart

# Start PM2 services
pnpm initial-setup

