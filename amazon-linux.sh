#!/bin/bash

npm install -g turbo
npm install -g pnpm
npm install -g pm2
npm install -g npx




if ! grep -q "location /backend/" /etc/nginx/nginx.conf.default; then
    sudo sed -i '/server_name _;/a \
        location /backend/ { \
            proxy_pass http://localhost:5000/; \
            proxy_set_header Host $host; \
            proxy_set_header X-Real-IP $remote_addr; \
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
            proxy_set_header X-Forwarded-Proto $scheme; \
            rewrite ^/backend(.*)$ $1 break; \
        } \
        location /admin/ { \
            proxy_pass http://localhost:3002/; \
            proxy_set_header Host $host; \
            proxy_set_header X-Real-IP $remote_addr; \
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
            proxy_set_header X-Forwarded-Proto $scheme; \
            rewrite ^/admin(.*)$ $1 break; \
        } \
        location / { \
            proxy_pass http://localhost:3001/; \
            proxy_set_header Host $host; \
            proxy_set_header X-Real-IP $remote_addr; \
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
            proxy_set_header X-Forwarded-Proto $scheme; \
        }' /etc/nginx/nginx.conf.default
fi

service nginx restart
mkdir apps/server/uploads
chmod -R 777 apps/server/uploads