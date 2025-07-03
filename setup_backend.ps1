# backend/setup_backend.ps1

cd backend

# Step 1: Create virtual environment if it doesn't exist
if (!(Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Step 2: Activate virtual environment
Write-Host "Activating virtual environment..."
. .\venv\Scripts\Activate.ps1

# Step 3: Install dependencies
Write-Host "Installing Python dependencies..."
pip install -r requirements.txt

# Step 4: Set environment variables
$env:FLASK_APP = "run.py"
$env:FLASK_ENV = "development"

# Step 5: Create PostgreSQL database (if using Postgres and create_database.py exists)
if (Test-Path "create_database.py") {
    Write-Host "Creating database if not exists..."
    python create_database.py
}

# Step 6: Initialize tables and default user accounts
if (Test-Path "init_user_accounts.py") {
    Write-Host "Initializing tables and user accounts..."
    python init_user_accounts.py
}

# Step 7: Start the Flask development server
Write-Host "Starting Flask server..."
python run.py
