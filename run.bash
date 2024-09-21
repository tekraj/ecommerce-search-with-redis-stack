#!/bin/bash

# Install PM2 and npx globally
npm install -g turbo
npm install -g pnpm
npm install -g pm2
npm install -g npx

rm /etc/nginx/sites-available/admin
rm /etc/nginx/sites-available/frontend

rm -rf /etc/nginx/sites-enabled/sites-available
rm /etc/nginx/sites-enabled/admin
rm /etc/nginx/sites-enabled/frontend



if ! grep -q "location /backend/" /etc/nginx/sites-available/default; then
    sudo sed -i '/server_name _;/a \
        location /backend/ { \
            proxy_pass http://localhost:5000/; \
            proxy_set_header Host $host; \
            proxy_set_header X-Real-IP $remote_addr; \
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
            proxy_set_header X-Forwarded-Proto $scheme; \
            rewrite ^/backend(.*)$ $1 break; \
        } \
        location /ecommerce/ { \
            proxy_pass http://localhost:3001/; \
            proxy_set_header Host $host; \
            proxy_set_header X-Real-IP $remote_addr; \
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
            proxy_set_header X-Forwarded-Proto $scheme; \
            rewrite ^/ecommerce(.*)$ $1 break; \
        } \
        location /admin/ { \
            proxy_pass http://localhost:3002/; \
            proxy_set_header Host $host; \
            proxy_set_header X-Real-IP $remote_addr; \
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
            proxy_set_header X-Forwarded-Proto $scheme; \
            rewrite ^/admin(.*)$ $1 break; \
        }' /etc/nginx/sites-available/default
fi

service nginx restart

# Start PM2 services
pnpm initial-setup
find apps/admin/build/ -type f -exec sed -i "s|http://localhost|http://$(curl -s ifconfig.me)|g" {} +
find apps/ecommerce-web/build/ -type f -exec sed -i "s|http://localhost|http://$(curl -s ifconfig.me)|g" {} +

node killall node
pm2 stop all
pnpm dev -F server &
pm2 serve apps/admin/build/ 3002 --name "admin" --spa
pm2 serve apps/ecommerce-web/build/ 3001 --name "ecommerce" --spa





