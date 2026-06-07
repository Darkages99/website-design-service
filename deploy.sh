#!/bin/bash
# Deploy Brand-Alchemy to remote server via SSH

# Configuration — UPDATE THESE
REMOTE_USER="your-username"
REMOTE_HOST="your-domain.com"
REMOTE_PORT="22"
REMOTE_PATH="/var/www/html"  # or wherever your site root is
SSH_KEY="$HOME/.ssh/id_rsa"  # path to your SSH private key (optional)

# Build the site
echo "Building site..."
npm run build

if [ $? -ne 0 ]; then
  echo "Build failed. Aborting deployment."
  exit 1
fi

# Deploy via rsync
echo "Deploying to $REMOTE_HOST..."

rsync -avz \
  --delete \
  -e "ssh -i $SSH_KEY -p $REMOTE_PORT" \
  dist/ \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

if [ $? -eq 0 ]; then
  echo "✓ Deployment complete!"
else
  echo "✗ Deployment failed."
  exit 1
fi
