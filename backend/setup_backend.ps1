# backend/setup_backend.ps1

cd backend

# Step 1: Create venv if it doesn't exist
if (!(Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Step 2: Activate venv
Write-Host "Activating virtual environment..."
. .\venv\Scripts\Activate.ps1

# Step 3: Install requirements
Write-Host "Installing Python dependencies..."
pip install -r requirements.txt

# Step 4: Set environment variables
$env:FLASK_APP = "run.py"
$env:FLASK_ENV = "development"

# Step 5: Run Flask server
Write-Host "Starting Flask server..."
flask run
