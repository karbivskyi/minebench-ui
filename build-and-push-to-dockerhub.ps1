# Minebench UI - Docker Build and Push Script for Windows (Docker Hub)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Docker Build and Push Script (Docker Hub)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Configuration
$DOCKERHUB_USERNAME = "karbivskyi"
$IMAGE_NAME = "minebench-ui"
$FULL_IMAGE_NAME = "$DOCKERHUB_USERNAME/$IMAGE_NAME"

# Read current version from package.json
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$currentVersion = $packageJson.version

Write-Host "Current version: $currentVersion" -ForegroundColor Yellow
$newVersion = Read-Host "Enter new version (or press Enter to keep $currentVersion)"

if ([string]::IsNullOrWhiteSpace($newVersion)) {
    $newVersion = $currentVersion
} else {
    # Update package.json
    $packageJson.version = $newVersion
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    Write-Host "Updated package.json to version $newVersion" -ForegroundColor Green
}

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Registry: Docker Hub" -ForegroundColor White
Write-Host "  Image: $FULL_IMAGE_NAME" -ForegroundColor White
Write-Host "  Version: $newVersion" -ForegroundColor White
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Login to Docker Hub
Write-Host "Logging in to Docker Hub..." -ForegroundColor Yellow
docker login

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to login to Docker Hub" -ForegroundColor Red
    exit 1
}

Write-Host "Successfully logged in to Docker Hub" -ForegroundColor Green

# Build the Docker image
Write-Host ""
Write-Host "Building Docker image..." -ForegroundColor Yellow
$latestTag = "$FULL_IMAGE_NAME`:latest"
Write-Host "Building tag: $latestTag"

# Load environment variables from .env.local
$envContent = Get-Content ".env.local"
$supabaseUrl = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_URL=").ToString().Split("=")[1]
$supabaseKey = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_ANON_KEY=").ToString().Split("=")[1]

docker build -t $latestTag `
    --build-arg NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl `
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseKey `
    .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Docker image built successfully" -ForegroundColor Green

# Tag the version
Write-Host ""
Write-Host "Tagging version v$newVersion..." -ForegroundColor Yellow
$versionTag = "$FULL_IMAGE_NAME`:v$newVersion"
Write-Host "Tagging: $latestTag -> $versionTag"
docker tag $latestTag $versionTag

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to tag image" -ForegroundColor Red
    exit 1
}

# Push images
Write-Host ""
Write-Host "Pushing images to Docker Hub..." -ForegroundColor Yellow
Write-Host "Pushing: $latestTag"
docker push $latestTag

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to push latest tag" -ForegroundColor Red
    exit 1
}

Write-Host "Pushing: $versionTag"
docker push $versionTag

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to push version tag" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Images pushed successfully to Docker Hub" -ForegroundColor Green
Write-Host ""
Write-Host "Success! Your image is now available at:" -ForegroundColor Green
Write-Host "  $latestTag" -ForegroundColor White
Write-Host "  $versionTag" -ForegroundColor White
