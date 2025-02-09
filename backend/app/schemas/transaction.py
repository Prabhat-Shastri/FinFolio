from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class TransactionBase(BaseModel):
    transaction_id: str
    account_id: str
    name: str
    merchant_name: Optional[str] = None
    amount: float
    date: date
    category: List[str]
    payment_channel: str
    currency: Optional[str] = None

class AddTransactionRequest(BaseModel):
    # transaction_id: str
    # account_id: str
    name: str
    merchant_name: Optional[str] = None
    amount: float
    date: date
    category: List[str]
    payment_channel: str
    currency: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass  # Used for inserting transactions

class TransactionResponse(TransactionBase):
    id: int

    class Config:
        from_attributes = True
