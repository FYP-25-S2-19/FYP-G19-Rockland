from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize DB object

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'User'
    UserID = db.Column(db.Integer, primary_key=True)
    Email = db.Column(db.String(255), unique=True, nullable=False)
    Password = db.Column(db.String(255), nullable=False)
    firstName = db.Column(db.String(100))
    lastName = db.Column(db.String(100))
    dateOfBirth = db.Column(db.Date)
    contactNumber = db.Column(db.String(20))
    UserTypeID = db.Column(db.Integer)  # FK to UserType table
    Gender = db.Column(db.String(10))
    Region = db.Column(db.String(100))
    Status = db.Column(db.String(20))  # e.g., 'Active', 'Suspended'
    TotalPoints = db.Column(db.Integer, default=0)
    CreatedDate = db.Column(db.DateTime, default=datetime.utcnow)

class Token(db.Model):
    __tablename__ = 'Token'
    access_token = db.Column(db.String(512), primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('User.UserID'))