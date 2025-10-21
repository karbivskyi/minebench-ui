# Minebench UI - Docker Build and Push Script for Windows
Write-Host "🐳 Minebench UI - Docker Build and Push Script" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Configuration
$GITHUB_USERNAME = "YOUR_USERNAME"  # Replace with your GitHub username
$IMAGE_NAME = "minebench-ui"
$REGISTRY = "ghcr.io"
$FULL_IMAGE_NAME = "$REGISTRY/$GITHUB_USERNAME/$IMAGE_NAME"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Registry: $REGISTRY" -ForegroundColor White
Write-Host "   Image: $FULL_IMAGE_NAME" -ForegroundColor White
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Login to GitHub Container Registry
Write-Host "🔐 Logging in to GitHub Container Registry..." -ForegroundColor Yellow
Write-Host "   Please enter your GitHub Personal Access Token when prompted" -ForegroundColor Cyan
Write-Host "   (Create one at: https://github.com/settings/tokens)" -ForegroundColor Cyan
Write-Host "   Required scopes: write:packages, read:packages" -ForegroundColor Cyan
Write-Host ""

docker login $REGISTRY -u $GITHUB_USERNAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to login to GitHub Container Registry" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Successfully logged in to GitHub Container Registry" -ForegroundColor Green

# Build the Docker image
Write-Host "🔨 Building Docker image..." -ForegroundColor Yellow
docker build -t $FULL_IMAGE_NAME`:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker image built successfully" -ForegroundColor Green

# Tag for different versions
Write-Host "🏷️  Tagging image versions..." -ForegroundColor Yellow
$dateTag = Get-Date -Format "yyyyMMdd"
docker tag $FULL_IMAGE_NAME`:latest $FULL_IMAGE_NAME`:$dateTag
docker tag $FULL_IMAGE_NAME`:latest $FULL_IMAGE_NAME`:stable

Write-Host "✅ Images tagged successfully" -ForegroundColor Green

# Push images
Write-Host "📤 Pushing images to GitHub Container Registry..." -ForegroundColor Yellow
docker push $FULL_IMAGE_NAME`:latest
docker push $FULL_IMAGE_NAME`:$dateTag
docker push $FULL_IMAGE_NAME`:stable

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push images" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Images pushed successfully to GitHub Container Registry" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Success! Your image is now available at:" -ForegroundColor Green
Write-Host "   $FULL_IMAGE_NAME`:latest" -ForegroundColor White
Write-Host "   $FULL_IMAGE_NAME`:$dateTag" -ForegroundColor White
Write-Host "   $FULL_IMAGE_NAME`:stable" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next steps for Akash deployment:" -ForegroundColor Yellow
Write-Host "   1. Update deploy.yml with your image: $FULL_IMAGE_NAME`:latest" -ForegroundColor White
Write-Host "   2. Make the image public in GitHub Packages" -ForegroundColor White
Write-Host "   3. Deploy using Akash CLI" -ForegroundColor White
Write-Host ""
Write-Host "🔗 View your package at: https://github.com/$GITHUB_USERNAME/$IMAGE_NAME/pkgs/container/$IMAGE_NAME" -ForegroundColor Cyan
