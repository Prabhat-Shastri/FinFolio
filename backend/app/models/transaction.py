from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(String, unique=True, index=True)
    account_id = Column(String, index=True)
    name = Column(String)
    merchant_name = Column(String, nullable=True)
    amount = Column(Float)
    date = Column(Date)
    category = Column(String)  # JSON Stringified Array
    payment_channel = Column(String)
    currency = Column(String, nullable=True)

