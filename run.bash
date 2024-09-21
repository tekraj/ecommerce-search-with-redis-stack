#!/bin/bash
pnpm initial-setup
find apps/admin/build/ -type f -exec sed -i "s|http://localhost|http://$(curl -s ifconfig.me)|g" {} +
find apps/ecommerce-web/build/ -type f -exec sed -i "s|http://localhost|http://$(curl -s ifconfig.me)|g" {} +

node killall node
pm2 stop all
pnpm dev -F server &
pm2 serve apps/admin/build/ 3002 --name "admin" --spa
pm2 serve apps/ecommerce-web/build/ 3001 --name "ecommerce" --spa





