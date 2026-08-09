#!/usr/bin/env bash
# Phase 1 bootstrap script — run this ON the EC2 Ubuntu instance after copying
# the project there (via `scp`/`git clone`).
#
# Usage: ssh onto the instance, then:
#   cd ~/claralytics/deploy && chmod +x setup_ec2.sh && ./setup_ec2.sh
set -euo pipefail

APP_DIR="$HOME/claralytics/backend"

echo "==> Installing system packages"
sudo apt-get update -y
sudo apt-get install -y python3-venv python3-pip nginx

echo "==> Creating virtualenv"
cd "$APP_DIR"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

if [ ! -f "$APP_DIR/.env" ]; then
    echo "==> No .env found — copying .env.example. EDIT IT before starting the service."
    cp .env.example .env
fi

echo "==> Installing systemd service"
sudo cp ../deploy/claralytics-api.service /etc/systemd/system/claralytics-api.service
sudo systemctl daemon-reload
sudo systemctl enable claralytics-api

echo "==> Installing nginx reverse proxy config"
sudo cp ../deploy/nginx.conf /etc/nginx/sites-available/claralytics
sudo ln -sf /etc/nginx/sites-available/claralytics /etc/nginx/sites-enabled/claralytics
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t

echo "==> Starting services"
sudo systemctl restart claralytics-api
sudo systemctl restart nginx

echo ""
echo "Done. Check status with:"
echo "  sudo systemctl status claralytics-api"
echo "  curl http://localhost/health"
