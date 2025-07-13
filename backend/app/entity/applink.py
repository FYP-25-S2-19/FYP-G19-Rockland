from app.models import db
from datetime import datetime

class AppLink(db.Model):
    __tablename__ = 'applink'
    
    app_link_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    link_attached = db.Column(db.String(500), nullable=True)
    
    # Relationships
    user = db.relationship('User', backref='app_links')
    
    def __repr__(self):
        return f'<AppLink {self.name}>'
    
    def to_dict(self):
        return {
            'app_link_id': self.app_link_id,
            'name': self.name,
            'user_id': self.user_id,
            'date_created': self.date_created.isoformat() if self.date_created else None,
            'link_attached': self.link_attached
        }
    
    @classmethod
    def getAllAppLinks(cls):
        try:
            applinks = cls.query.all()
            return applinks
        except Exception as e:
            return None
    
    @classmethod
    def getAppLinkByPlatform(cls, platform):
        try:
            applink = cls.query.filter(cls.name.ilike(f'%{platform}%')).first()
            
            if applink:
                return True, 200, "App link found", applink
            else:
                return False, 404, f"App link not found for platform: {platform}", None
                
        except Exception as e:
            return False, 500, f"Error: {str(e)}", None
    
    @classmethod
    def viewAppLink(cls, applink_id):
        try:
            applink = cls.query.get(applink_id)
            
            if applink:
                return applink.to_dict(), 200
            else:
                return None, 404
                
        except Exception as e:
            return None, 500
    
    @classmethod
    def createAppLink(cls, name, user_id, link_attached=None):
        try:
            new_applink = cls(
                name=name,
                user_id=user_id,
                link_attached=link_attached
            )
            
            db.session.add(new_applink)
            db.session.commit()
            
            return True, 201, "App link created successfully", new_applink
            
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Error: {str(e)}", None
    
    @classmethod
    def deleteAppLink(cls, applink_id, user_id=None):
        try:
            applink = cls.query.get(applink_id)
            
            if not applink:
                return False, 404, "App link not found"
            
            db.session.delete(applink)
            db.session.commit()
            
            return True, 200, "App link deleted successfully"
            
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Error: {str(e)}"