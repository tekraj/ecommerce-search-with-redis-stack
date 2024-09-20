#!/bin/bash

# Install PM2 and npx globally
npm install -g pm2
npm install -g npx

cp admin.conf /etc/nginx/sites-available/admin
cp frontend.conf /etc/nginx/sites-available/frontend
ln -s /etc/nginx/sites-available/ /etc/nginx/sites-enabled/
service nginx restart

# Start PM2 services
pm2 serve apps/admin/build/ 3002 --name "admin" --spa
pm2 serve apps/ecommece-web/build/ 3001 --name "ecommece" --spa

pm2 start app.config.json

