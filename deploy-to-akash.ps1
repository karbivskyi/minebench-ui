# Minebench UI - Automated Akash Deployment Script for Windows
Write-Host "🚀 Minebench UI - Automated Akash Deployment" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

# Configuration
$DEPLOYMENT_FILE = "deploy.yml"
$KEY_NAME = "mykey"
$FEE_AMOUNT = "5000uakt"

# Function to print colored output
function Print-Status {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Print-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Print-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Print-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

# Check if deploy.yml exists
if (-not (Test-Path $DEPLOYMENT_FILE)) {
    Print-Error "deploy.yml not found!"
    exit 1
}

# Check if Akash CLI is installed
try {
    akash version | Out-Null
    Print-Status "Akash CLI found"
} catch {
    Print-Error "Akash CLI is not installed!"
    Print-Info "Install it from: https://docs.akash.network/cli/"
    exit 1
}

# Check if key exists
try {
    akash keys show $KEY_NAME | Out-Null
    Print-Status "Using key: $KEY_NAME"
} catch {
    Print-Warning "Key '$KEY_NAME' not found!"
    Print-Info "Creating new key..."
    akash keys add $KEY_NAME
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Failed to create key!"
        exit 1
    }
    Print-Status "Key '$KEY_NAME' created"
}

# Get account address
$ACCOUNT_ADDRESS = akash keys show $KEY_NAME -a
Print-Info "Account address: $ACCOUNT_ADDRESS"

# Check account balance
Print-Info "Checking account balance..."
$BALANCE_JSON = akash query bank balances $ACCOUNT_ADDRESS --output json
$BALANCE = ($BALANCE_JSON | ConvertFrom-Json).balances | Where-Object { $_.denom -eq "uakt" } | Select-Object -ExpandProperty amount

if ([string]::IsNullOrEmpty($BALANCE) -or [int]$BALANCE -lt 1000000) {
    Print-Warning "Low balance! You need at least 1 AKT (1,000,000 uakt) to deploy."
    Print-Info "Current balance: $BALANCE uakt"
    Print-Info "Fund your account with AKT tokens"
    exit 1
}

Print-Status "Account balance: $BALANCE uakt"

# Create deployment
Print-Info "Creating deployment..."
$DEPLOYMENT_OUTPUT = akash tx deployment create $DEPLOYMENT_FILE --from $KEY_NAME --fees $FEE_AMOUNT --output json 2>$null

if ($LASTEXITCODE -ne 0) {
    Print-Error "Failed to create deployment!"
    exit 1
}

# Extract DSEQ from transaction output
$DEPLOYMENT_JSON = $DEPLOYMENT_OUTPUT | ConvertFrom-Json
$DSEQ = $DEPLOYMENT_JSON.events | Where-Object { $_.type -eq "akash.v1beta1.EventDeploymentCreated" } | 
        Select-Object -ExpandProperty attributes | 
        Where-Object { $_.key -eq "dseq" } | 
        Select-Object -ExpandProperty value

if ([string]::IsNullOrEmpty($DSEQ)) {
    Print-Error "Failed to extract DSEQ from deployment!"
    exit 1
}

Print-Status "Deployment created successfully!"
Print-Info "DSEQ: $DSEQ"

# Wait for providers to bid
Print-Info "Waiting for providers to bid..."
Start-Sleep -Seconds 15

# Get deployment details
Print-Info "Fetching deployment details..."
$DEPLOYMENT_DETAILS = akash query deployment get --owner $ACCOUNT_ADDRESS --dseq $DSEQ --output json

# Extract provider information
$DEPLOYMENT_DETAILS_JSON = $DEPLOYMENT_DETAILS | ConvertFrom-Json
$PROVIDERS = $DEPLOYMENT_DETAILS_JSON.groups[0].group_spec.resources[0].resources.endpoints[0].kind

if ([string]::IsNullOrEmpty($PROVIDERS)) {
    Print-Warning "No providers found yet. Waiting longer..."
    Start-Sleep -Seconds 30
    
    # Try again
    $DEPLOYMENT_DETAILS = akash query deployment get --owner $ACCOUNT_ADDRESS --dseq $DSEQ --output json
    $DEPLOYMENT_DETAILS_JSON = $DEPLOYMENT_DETAILS | ConvertFrom-Json
    $PROVIDERS = $DEPLOYMENT_DETAILS_JSON.groups[0].group_spec.resources[0].resources.endpoints[0].kind
}

if ([string]::IsNullOrEmpty($PROVIDERS)) {
    Print-Error "No providers available for this deployment!"
    Print-Info "Try again later or adjust your resource requirements"
    exit 1
}

Print-Status "Providers found!"

# List available providers
Print-Info "Available providers:"
$PROVIDERS_LIST = akash query provider list --output json | ConvertFrom-Json
$PROVIDERS_LIST.providers | ForEach-Object { Write-Host "  $($_.owner) - $($_.host_uri)" -ForegroundColor White }

Write-Host ""
Print-Warning "Manual steps required:"
Write-Host "1. Choose a provider from the list above" -ForegroundColor White
Write-Host "2. Create lease:" -ForegroundColor White
Write-Host "   akash tx market lease create --owner $ACCOUNT_ADDRESS --dseq $DSEQ --gseq 1 --oseq 1 --provider <PROVIDER_ADDRESS> --from $KEY_NAME --fees $FEE_AMOUNT" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Send manifest:" -ForegroundColor White
Write-Host "   akash provider send-manifest $DEPLOYMENT_FILE --owner $ACCOUNT_ADDRESS --dseq $DSEQ --provider <PROVIDER_ADDRESS>" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Get service URL:" -ForegroundColor White
Write-Host "   akash provider lease-status --owner $ACCOUNT_ADDRESS --dseq $DSEQ --provider <PROVIDER_ADDRESS>" -ForegroundColor Gray
Write-Host ""
Print-Info "Deployment DSEQ: $DSEQ"
Print-Info "Account: $ACCOUNT_ADDRESS"

# Save deployment info
$DEPLOYMENT_INFO = @"
Deployment Information
=====================
DSEQ: $DSEQ
Account: $ACCOUNT_ADDRESS
Key: $KEY_NAME
Deployment File: $DEPLOYMENT_FILE
Created: $(Get-Date)

Next Steps:
1. Choose a provider and create lease
2. Send manifest to provider
3. Get service URL
"@

$DEPLOYMENT_INFO | Out-File -FilePath "deployment-info.txt" -Encoding UTF8

Print-Status "Deployment info saved to deployment-info.txt"
Print-Status "Deployment process initiated successfully!"
