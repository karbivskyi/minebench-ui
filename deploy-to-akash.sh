#!/bin/bash

# Minebench UI - Automated Akash Deployment Script
echo "🚀 Minebench UI - Automated Akash Deployment"
echo "============================================"

# Configuration
DEPLOYMENT_FILE="deploy.yml"
KEY_NAME="mykey"
FEE_AMOUNT="5000uakt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if deploy.yml exists
if [ ! -f "$DEPLOYMENT_FILE" ]; then
    print_error "deploy.yml not found!"
    exit 1
fi

# Check if Akash CLI is installed
if ! command -v akash &> /dev/null; then
    print_error "Akash CLI is not installed!"
    print_info "Install it from: https://docs.akash.network/cli/"
    exit 1
fi

print_status "Akash CLI found"

# Check if key exists
if ! akash keys show $KEY_NAME &> /dev/null; then
    print_warning "Key '$KEY_NAME' not found!"
    print_info "Creating new key..."
    akash keys add $KEY_NAME
    if [ $? -ne 0 ]; then
        print_error "Failed to create key!"
        exit 1
    fi
    print_status "Key '$KEY_NAME' created"
fi

print_status "Using key: $KEY_NAME"

# Get account address
ACCOUNT_ADDRESS=$(akash keys show $KEY_NAME -a)
print_info "Account address: $ACCOUNT_ADDRESS"

# Check account balance
print_info "Checking account balance..."
BALANCE=$(akash query bank balances $ACCOUNT_ADDRESS --output json | jq -r '.balances[] | select(.denom=="uakt") | .amount')
if [ -z "$BALANCE" ] || [ "$BALANCE" -lt 1000000 ]; then
    print_warning "Low balance! You need at least 1 AKT (1,000,000 uakt) to deploy."
    print_info "Current balance: $BALANCE uakt"
    print_info "Fund your account with AKT tokens"
    exit 1
fi

print_status "Account balance: $BALANCE uakt"

# Create deployment
print_info "Creating deployment..."
DEPLOYMENT_OUTPUT=$(akash tx deployment create $DEPLOYMENT_FILE --from $KEY_NAME --fees $FEE_AMOUNT --output json 2>/dev/null)

if [ $? -ne 0 ]; then
    print_error "Failed to create deployment!"
    exit 1
fi

# Extract DSEQ from transaction output
DSEQ=$(echo $DEPLOYMENT_OUTPUT | jq -r '.events[] | select(.type=="akash.v1beta1.EventDeploymentCreated") | .attributes[] | select(.key=="dseq") | .value')

if [ -z "$DSEQ" ] || [ "$DSEQ" = "null" ]; then
    print_error "Failed to extract DSEQ from deployment!"
    exit 1
fi

print_status "Deployment created successfully!"
print_info "DSEQ: $DSEQ"

# Wait for providers to bid
print_info "Waiting for providers to bid..."
sleep 15

# Get deployment details
print_info "Fetching deployment details..."
DEPLOYMENT_DETAILS=$(akash query deployment get --owner $ACCOUNT_ADDRESS --dseq $DSEQ --output json)

# Extract provider information
PROVIDERS=$(echo $DEPLOYMENT_DETAILS | jq -r '.groups[0].group_spec.resources[0].resources.endpoints[0].kind // "unknown"')

if [ "$PROVIDERS" = "unknown" ]; then
    print_warning "No providers found yet. Waiting longer..."
    sleep 30
    
    # Try again
    DEPLOYMENT_DETAILS=$(akash query deployment get --owner $ACCOUNT_ADDRESS --dseq $DSEQ --output json)
    PROVIDERS=$(echo $DEPLOYMENT_DETAILS | jq -r '.groups[0].group_spec.resources[0].resources.endpoints[0].kind // "unknown"')
fi

if [ "$PROVIDERS" = "unknown" ]; then
    print_error "No providers available for this deployment!"
    print_info "Try again later or adjust your resource requirements"
    exit 1
fi

print_status "Providers found!"

# List available providers
print_info "Available providers:"
akash query provider list --output json | jq -r '.providers[] | "\(.owner) - \(.host_uri)"'

echo ""
print_warning "Manual steps required:"
echo "1. Choose a provider from the list above"
echo "2. Create lease:"
echo "   akash tx market lease create --owner $ACCOUNT_ADDRESS --dseq $DSEQ --gseq 1 --oseq 1 --provider <PROVIDER_ADDRESS> --from $KEY_NAME --fees $FEE_AMOUNT"
echo ""
echo "3. Send manifest:"
echo "   akash provider send-manifest $DEPLOYMENT_FILE --owner $ACCOUNT_ADDRESS --dseq $DSEQ --provider <PROVIDER_ADDRESS>"
echo ""
echo "4. Get service URL:"
echo "   akash provider lease-status --owner $ACCOUNT_ADDRESS --dseq $DSEQ --provider <PROVIDER_ADDRESS>"
echo ""
print_info "Deployment DSEQ: $DSEQ"
print_info "Account: $ACCOUNT_ADDRESS"

# Save deployment info
cat > deployment-info.txt << EOF
Deployment Information
=====================
DSEQ: $DSEQ
Account: $ACCOUNT_ADDRESS
Key: $KEY_NAME
Deployment File: $DEPLOYMENT_FILE
Created: $(date)

Next Steps:
1. Choose a provider and create lease
2. Send manifest to provider
3. Get service URL
EOF

print_status "Deployment info saved to deployment-info.txt"
print_status "Deployment process initiated successfully!"
