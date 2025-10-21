#!/bin/bash

# Minebench UI - Docker Build and Push Script
echo "🐳 Minebench UI - Docker Build and Push Script"
echo "=============================================="

# Configuration
GITHUB_USERNAME="YOUR_USERNAME"  # Replace with your GitHub username
IMAGE_NAME="minebench-ui"
REGISTRY="ghcr.io"
FULL_IMAGE_NAME="$REGISTRY/$GITHUB_USERNAME/$IMAGE_NAME"

echo "📋 Configuration:"
echo "   Registry: $REGISTRY"
echo "   Image: $FULL_IMAGE_NAME"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Login to GitHub Container Registry
echo "🔐 Logging in to GitHub Container Registry..."
echo "   Please enter your GitHub Personal Access Token when prompted"
echo "   (Create one at: https://github.com/settings/tokens)"
echo "   Required scopes: write:packages, read:packages"
echo ""

docker login $REGISTRY -u $GITHUB_USERNAME

if [ $? -ne 0 ]; then
    echo "❌ Failed to login to GitHub Container Registry"
    exit 1
fi

echo "✅ Successfully logged in to GitHub Container Registry"

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t $FULL_IMAGE_NAME:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Docker image built successfully"

# Tag for different versions
echo "🏷️  Tagging image versions..."
docker tag $FULL_IMAGE_NAME:latest $FULL_IMAGE_NAME:$(date +%Y%m%d)
docker tag $FULL_IMAGE_NAME:latest $FULL_IMAGE_NAME:stable

echo "✅ Images tagged successfully"

# Push images
echo "📤 Pushing images to GitHub Container Registry..."
docker push $FULL_IMAGE_NAME:latest
docker push $FULL_IMAGE_NAME:$(date +%Y%m%d)
docker push $FULL_IMAGE_NAME:stable

if [ $? -ne 0 ]; then
    echo "❌ Failed to push images"
    exit 1
fi

echo "✅ Images pushed successfully to GitHub Container Registry"
echo ""
echo "🎉 Success! Your image is now available at:"
echo "   $FULL_IMAGE_NAME:latest"
echo "   $FULL_IMAGE_NAME:$(date +%Y%m%d)"
echo "   $FULL_IMAGE_NAME:stable"
echo ""
echo "📋 Next steps for Akash deployment:"
echo "   1. Update deploy.yml with your image: $FULL_IMAGE_NAME:latest"
echo "   2. Make the image public in GitHub Packages"
echo "   3. Deploy using Akash CLI"
echo ""
echo "🔗 View your package at: https://github.com/$GITHUB_USERNAME/$IMAGE_NAME/pkgs/container/$IMAGE_NAME"
