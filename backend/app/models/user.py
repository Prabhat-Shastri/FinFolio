from sqlalchemy import Column, Integer, String, Float, Boolean
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    saving_goal = Column(Float, nullable=True)
    amount = Column(Float, nullable=True)
    time_months = Column(Integer, nullable=True)
    income = Column(Float, nullable=True)
    top_spender = Column(String, nullable=True)
    top2_spender = Column(String, nullable=True)
    day_paid = Column(String, nullable=True)
    is_alert = Column(Boolean, nullable=True)
    alert_transaction = Column(String, nullable=True)
    access_token = Column(String, nullable=True)
    checkings = Column(Float, nullable=True)
    savings = Column(Float, nullable=True)
    food_spending = Column(Float, nullable=True)
    entertainment_spending = Column(Float, nullable=True)
    travel_spending = Column(Float, nullable=True)
    food_spending_goal = Column(Float, nullable=True)
    entertainment_spending_goal = Column(Float, nullable=True)
    travel_spending_goal = Column(Float, nullable=True)
    food_spending_predicted = Column(Float, nullable=True)
    entertainment_spending_predicted = Column(Float, nullable=True)
    travel_spending_predicted = Column(Float, nullable=True)

