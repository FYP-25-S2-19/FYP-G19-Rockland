from flask_sqlalchemy import SQLAlchemy

# Initialize DB object - this is the ONLY database instance
db = SQLAlchemy()

# Don't import entities here to avoid circular imports
# Import them in your controllers/scripts as needed