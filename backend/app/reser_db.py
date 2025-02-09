from app.database import engine
from app.models.user import User
from sqlalchemy import MetaData, Table

def reset_users_table():
    meta = MetaData()
    meta.reflect(bind=engine)
    users_table = meta.tables.get('users')
    if users_table is not None:
        print("Dropping users table...")
        users_table.drop(engine)
    User.__table__.create(engine)

if __name__ == "__main__":
    reset_users_table()
    print("Users table has been reset.")