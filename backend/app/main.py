import os
import time
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import requests
import json
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import extract
from dotenv import load_dotenv
from collections import Counter
from sqlalchemy import func
from pydantic import BaseModel
import traceback

# Import database and models
from app.database import engine, get_db
from app.models.user import User  
from app.models.transaction import Transaction
from app.schemas.user import LoginRequest, ExchangePublicTokenRequest


# Load environment variables
load_dotenv()

app = FastAPI(title="Plaid Link With Database")

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables if they don't exist
# from app.models.user import Base  
# Base.metadata.create_all(bind=engine)

from app.models import user, transaction

user.Base.metadata.create_all(bind=engine)
transaction.Base.metadata.create_all(bind=engine)

# Plaid Credentials
PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_ENV = "sandbox" 
PLAID_SANDBOX_URL = "https://sandbox.plaid.com"

# Step 1: Validate user login or register user
@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):  # ✅ No more attribute errors
    user = db.query(User).filter(User.username == data.username).first()

    if user:
        if user.password != data.password:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {"message": "Login successful"}
    else:
        new_user = User(username=data.username, password=data.password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "User registered successfully"}

# Step 2: Create Plaid Link Token
@app.post("/create_link_token")
def create_link_token():
    if not PLAID_CLIENT_ID or not PLAID_SECRET:
        raise HTTPException(status_code=500, detail="Plaid API credentials not set")

    url = f"{PLAID_SANDBOX_URL}/link/token/create"
    payload = {
        "client_id": PLAID_CLIENT_ID,
        "secret": PLAID_SECRET,
        "user": {"client_user_id": "12345"},
        "client_name": "My Plaid App",
        "products": ["auth", "transactions"],
        "country_codes": ["US"],
        "language": "en",
    }
    response = requests.post(url, json=payload)
    result = response.json()

    if "link_token" not in result:
        raise HTTPException(status_code=400, detail=f"Error creating link token: {result}")

    return {"link_token": result["link_token"]}

# Step 3: Exchange Public Token for Access Token & Store in DB
@app.post("/exchange_public_token")
def exchange_public_token(data: ExchangePublicTokenRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    url = f"{PLAID_SANDBOX_URL}/item/public_token/exchange"
    payload = {
        "client_id": PLAID_CLIENT_ID,
        "secret": PLAID_SECRET,
        "public_token": data.public_token,
    }
    response = requests.post(url, json=payload)
    result = response.json()

    if "access_token" not in result:
        raise HTTPException(status_code=400, detail=f"Error exchanging token: {result}")

    # Store the access token in the database
    user.access_token = result["access_token"]
    db.commit()

    return {"message": "Bank linked successfully", "access_token": result["access_token"]}

from app.schemas.user import SetGoalRequest

@app.post("/set_goal")
def set_goal(data: SetGoalRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    
    user.amount = data.amount
    user.time_months = data.time_months
    saving_per_month = data.amount / data.time_months
    user.saving_goal = saving_per_month
    db.commit()


    return {"message": "Goal set successfully", "saving_goal": user.saving_goal}

@app.get("/get_goal")
def get_goal(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.saving_goal is None:
        return {"message": "No goal set"}

    return {
        "message": "Goal retrieved successfully",
        "amount": user.amount,
        "time_months": user.time_months,
        "saving_goal": user.saving_goal
    }


@app.post("/top_spenders")
def get_top_spender(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all transactions with categories
    transactions = db.query(Transaction).filter(
        Transaction.category.isnot(None)
    ).all()

    if not transactions:
        return {"message": "No transactions found"}

    # Flatten categories and count them
    all_categories = []
    for transaction in transactions:
        # Handle string representation of list
        if isinstance(transaction.category, str):
            # Remove brackets and quotes, split by comma
            categories = transaction.category.strip('[]').replace('"', '').split(',')
            # Clean up whitespace
            categories = [cat.strip() for cat in categories]
            all_categories.extend(categories)
        elif isinstance(transaction.category, list):
            all_categories.extend(transaction.category)

    # Count categories
    category_counts = Counter(all_categories)
    
    # Get top 2 most common categories
    top_categories = category_counts.most_common(2)
    
    if len(top_categories) < 2:
        return {"message": "Not enough categories found"}

    # Update user's top spender fields
    user.top_spender = top_categories[0][0]  # First most common category
    user.top2_spender = top_categories[1][0]  # Second most common category
    db.commit()

    return {
        "message": "Top spenders updated",
        "top_spender": user.top_spender,
        "top2_spender": user.top2_spender,
        "top_spender_count": top_categories[0][1],
        "top2_spender_count": top_categories[1][1]
    }

@app.post("/day_paid")
def get_day_paid(username: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    #get current time
    now = datetime.now()
    prev_month = now - relativedelta(months=1)
    current_year = prev_month.year
    current_month = prev_month.month

    #debug
    all_transactions = db.query(Transaction).filter(
        Transaction.amount<0
    ).all()
    print(f"Found {len(all_transactions)} total negative transactions")

    #query
    incoming_transaction = db.query(Transaction).filter(
        Transaction.amount<0,
        extract('year', Transaction.date) == current_year,
        extract('month', Transaction.date) == current_month
    ).order_by(Transaction.date).first()

    if not incoming_transaction:
        return {"message": "No transaction found"}
    
    day = incoming_transaction.date.day

    user.day_paid = day

    db.commit()

    return {"message": "Day Paid", "day_paid": user.day_paid}

import pandas as pd
import numpy as np
import xgboost as xgb
import pickle
from sklearn.preprocessing import LabelEncoder


model = xgb.XGBClassifier()
model.load_model('xgbmodel.json')
with open("encoder.pkl", "rb") as file:
    encoder = pickle.load(file)
@app.post("/alert")
def get_alert(db: Session = Depends(get_db)):

    # Get most recent transaction
    latest_transaction = db.query(Transaction).order_by(Transaction.id.desc()).first()
    
    if not latest_transaction:
        return {"message": "No transactions found"}

    #replace with ML model

    #replace with ML model

    # Get first category
    if isinstance(latest_transaction.category, str):
        try:
            # Parse the string as JSON to get the actual array
            categories = json.loads(latest_transaction.category)
            first_category = categories[0] if categories else None
        except json.JSONDecodeError:
            # Fallback to the old method if JSON parsing fails
            categories = latest_transaction.category.strip('[]').replace('"', '').split(',')
            first_category = categories[0].strip() if categories else None
    elif isinstance(latest_transaction.category, list):
        first_category = latest_transaction.category[0] if latest_transaction.category else None

    print(f"First category: {first_category}")

    new_entry = pd.DataFrame({
        'merchant': [latest_transaction.merchant_name],  # Example merchant
        'category': [first_category],  # Example category
        'amt': [latest_transaction.amount],  # Transaction amount
        'trans_num': ['ce303c21bbecc75334b69a642c9716c3'],  # Example transaction number
        'hour': [3],  # Transaction hour
        'day_of_week': [0],  # Wednesday (0 = Monday, 6 = Sunday)
        'day_of_month': [23],  # 15th day of the month
        'month': [9],  # June
    })

    # Encode the new entry
    for col in ['merchant', 'category', 'trans_num']:
        new_entry[col] = encoder[col].transform(new_entry[col])  # Encode categorical values

    # Predict using the model
    prediction = model.predict(new_entry)
    pred = prediction[0]
    print(f"Prediction: {pred}")

    if pred==1:
        user.isalert = 1
        db.commit()
        
        return {
            "message": "Potential fraud detected",
            "transaction_id": latest_transaction.transaction_id,
            "merchant": latest_transaction.merchant_name,
            "amount": latest_transaction.amount
        }
    
    return {"message": "No alert"}

@app.get("/alert_status")
def alert_status(db: Session = Depends(get_db)):
    user = db.query(User).first()  # Get the first user for now
    if not user:
        return {"message": "User not found", "isalert": 0}
    
    return {"message": "Alert status", "isalert": user.is_alert}
    ## use for api - if user alert returns as 1, then call resolve alert

    
@app.post("/alert_resolve")
def resolve_alert(action: dict, db: Session = Depends(get_db)):
    try:
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Reset the alert status
        user.is_alert = 0
        db.commit()
        
        return {
            "message": "Alert resolved successfully",
            "action": action["action"],
            "status": "verified" if action["action"] == "yes" else "reported"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/transactions")
def get_transactions(db: Session = Depends(get_db)):
    # Calculate date 30 days ago
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    # Query transactions
    transactions = db.query(Transaction).filter(
        Transaction.date >= thirty_days_ago
    ).order_by(Transaction.date.desc()).all()
    
    if not transactions:
        return {"message": "No transactions found"}
    
    # Format transactions for response
    transactions_list = []
    for tx in transactions:
        transactions_list.append({
            "date": tx.date.strftime("%Y-%m-%d"),
            "amount": tx.amount,
            "category": tx.category,
            "merchant_name": tx.merchant_name,
        })
    
    return {
        "message": "Transactions retrieved successfully",
        "transactions": transactions_list,
        "total_count": len(transactions_list)
    }


import uuid
from app.schemas.transaction import AddTransactionRequest

class PredictionRequest(BaseModel):
    username: str

@app.post("/add_transaction")
def add_transaction(data: AddTransactionRequest, db: Session = Depends(get_db)):
    try:
        # Add transaction
        transaction_id = str(uuid.uuid4())
        category = json.dumps(data.category) if isinstance(data.category, list) else data.category
        
        new_transaction = Transaction(
            transaction_id=transaction_id,
            account_id="9Ba75DR7nRcq4dBxBkdEfx1J1vwmGyi4xbVKr",
            name=data.name,
            merchant_name=data.merchant_name,
            amount=data.amount or 0,
            date=data.date,
            category=category,
            payment_channel=data.payment_channel,
            currency=data.currency
        )
        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)

        username = "user_good"  # Use string directly
        
        try:
            # Call prediction endpoints with proper request body
            get_food_model(username, db)  # This is your /food_predicted POST handler
            get_entertainment_model(username, db)  # This is your /entertainment_predicted POST handler
            get_travel_model(username, db)  # This is your /travel_predicted POST handler
            
            # Call actual spending handlers
            post_actual_food(username, db)
            post_actual_entertainment(username, db)
            post_actual_travel(username, db)
            
            # Update adaptive spending
            adaptive_spending(username, db)
            
            print("All predictions and actuals updated successfully")
            
        except Exception as inner_e:
            print(f"Error in updates: {str(inner_e)}")
            traceback.print_exc()  # Print full error trace

        # Handle alert
        if data.amount and data.amount > 100:
            user = db.query(User).first()
            if user:
                user.is_alert = 1
                db.commit()

        return new_transaction
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete_transaction")
def delete_transaction(transaction_id: str, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
    if not transaction:
        return {"message": "Transaction not found"}
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}



@app.get("/graph_data")
def get_graph_data(db: Session = Depends(get_db)):
    today = datetime.now()
    first_day = today.replace(day=1)
    
    transactions = db.query(Transaction).filter(
        Transaction.date >= first_day
    ).order_by(Transaction.date.asc()).all()

    if not transactions:
        return {"message": "No transactions found"}

    cumulative_spending = {}
    running_total = 0
    
    for tx in transactions:
        date_str = tx.date.strftime("%Y-%m-%d")
        running_total += tx.amount
        cumulative_spending[date_str] = running_total

    return {
        "message": "Total spending data retrieved successfully",
        "cumulative_spending": cumulative_spending
    }


import uuid
from app.schemas.transaction import AddTransactionRequest
@app.post("/add_transaction")
def add_transaction(data: AddTransactionRequest, db: Session = Depends(get_db)):
    try:
        transaction_id = str(uuid.uuid4())
        
        # Convert category list to string if it's a list
        category = json.dumps(data.category) if isinstance(data.category, list) else data.category
        
        new_transaction = Transaction(
            transaction_id=transaction_id,
            account_id="9Ba75DR7nRcq4dBxBkdEfx1J1vwmGyi4xbVKr",
            name=data.name,
            merchant_name=data.merchant_name,
            amount=data.amount or 0,
            date=data.date,
            category=category,
            payment_channel=data.payment_channel,
            currency=data.currency
        )
        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)

        username = "user_good"
        
        try:
            # Call the actual POST endpoint handlers
            get_food_model(username, db)  # This is your /food_predicted POST handler
            get_entertainment_model(username, db)  # This is your /entertainment_predicted POST handler
            get_travel_model(username, db)  # This is your /travel_predicted POST handler
            
            # Call actual spending handlers
            post_actual_food(username, db)
            post_actual_entertainment(username, db)
            post_actual_travel(username, db)
            
            # Update adaptive spending
            adaptive_spending(username, db)
        except Exception as inner_e:
            print(f"Error in updates: {str(inner_e)}")

        if data.amount and data.amount > 100:
            user = db.query(User).first()
            if user:
                user.is_alert = 1
                db.commit()

        return new_transaction
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete_transaction")
def delete_transaction(transaction_id: str, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
    if not transaction:
        return {"message": "Transaction not found"}
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}

@app.get("/graph_data")
def get_graph_data(db: Session = Depends(get_db)):
    today = datetime.now()
    first_day = today.replace(day=1)
    
    transactions = db.query(Transaction).filter(
        Transaction.date >= first_day
    ).order_by(Transaction.date.asc()).all()

    if not transactions:
        return {"message": "No transactions found"}

    cumulative_spending = {}
    running_total = 0
    
    for tx in transactions:
        date_str = tx.date.strftime("%Y-%m-%d")
        running_total += tx.amount
        cumulative_spending[date_str] = running_total

    return {
        "message": "Total spending data retrieved successfully",
        "cumulative_spending": cumulative_spending
    }

@app.get("/graph_data_food")
def get_graph_data_food(db: Session = Depends(get_db)):
    today = datetime.now()
    first_day = today.replace(day=1)
    
    transactions = db.query(Transaction).filter(
        Transaction.date >= first_day
    ).order_by(Transaction.date.asc()).all()

    if not transactions:
        return {"message": "No transactions found"}

    cumulative_spending = {}
    running_total = 0
    
    for tx in transactions:
        # Handle both string and list formats of category
        categories = []
        if isinstance(tx.category, str):
            try:
                categories = json.loads(tx.category)
            except json.JSONDecodeError:
                categories = [tx.category]
        elif isinstance(tx.category, list):
            categories = tx.category

        # Check if "Food and Drink" is in the categories
        if any(cat.strip() == "Food and Drink" for cat in categories):
            date_str = tx.date.strftime("%Y-%m-%d")
            running_total += tx.amount
            cumulative_spending[date_str] = running_total

    return {
        "message": "Food and Drink spending data retrieved successfully",
        "cumulative_spending": cumulative_spending
    }

@app.get("/graph_data_travel")
def get_graph_data_travel(db: Session = Depends(get_db)):
    today = datetime.now()
    first_day = today.replace(day=1)
    
    transactions = db.query(Transaction).filter(
        Transaction.date >= first_day
    ).order_by(Transaction.date.asc()).all()

    if not transactions:
        return {"message": "No transactions found"}

    cumulative_spending = {}
    running_total = 0
    
    for tx in transactions:
        # Handle both string and list formats of category
        categories = []
        if isinstance(tx.category, str):
            try:
                categories = json.loads(tx.category)
            except json.JSONDecodeError:
                categories = [tx.category]
        elif isinstance(tx.category, list):
            categories = tx.category

        # Check if "Travel" is in the categories
        if any(cat.strip() == "Travel" for cat in categories):
            date_str = tx.date.strftime("%Y-%m-%d")
            running_total += tx.amount
            cumulative_spending[date_str] = running_total

    return {
        "message": "Travel spending data retrieved successfully",
        "cumulative_spending": cumulative_spending
    }

@app.get("/graph_data_entertainment")
def get_graph_data_entertainment(db: Session = Depends(get_db)):
    today = datetime.now()
    first_day = today.replace(day=1)
    
    transactions = db.query(Transaction).filter(
        Transaction.date >= first_day
    ).order_by(Transaction.date.asc()).all()

    if not transactions:
        return {"message": "No transactions found"}

    cumulative_spending = {}
    running_total = 0
    
    for tx in transactions:
        # Handle both string and list formats of category
        categories = []
        if isinstance(tx.category, str):
            try:
                categories = json.loads(tx.category)
            except json.JSONDecodeError:
                categories = [tx.category]
        elif isinstance(tx.category, list):
            categories = tx.category

        # Check if "Entertainment" is in the categories
        if any(cat.strip() == "Entertainment" for cat in categories):
            date_str = tx.date.strftime("%Y-%m-%d")
            running_total += tx.amount
            cumulative_spending[date_str] = running_total

    return {
        "message": "Entertainment spending data retrieved successfully",
        "cumulative_spending": cumulative_spending
    }

@app.get("/bank_balance")
def get_bank_balance(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"bank_balance": user.checkings}

@app.post("/set_bank_balance")
def set_bank_balance(username: str, balance: float, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.checkings = balance
    db.commit()
    return {"message": "Bank balance updated", "bank_balance": user.checkings}

@app.get("/savings_balance")
def get_savings_balance(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"savings_balance": user.savings}

@app.post("/set_savings_balance")
def set_savings_balance(username: str, balance: float, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.savings = balance
    db.commit()
    return {"message": "Savings balance updated", "savings_balance": user.savings}



def get_food_data(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Calculate the current month range
    today = datetime.now()
    first_day = today.replace(day=1)
    next_month = first_day + relativedelta(months=1)

    # Filter transactions only in the current month
    transactions = db.query(Transaction).filter(
        Transaction.date >= first_day,
        Transaction.date < next_month
    ).all()

    cumulative_spending = {}
    running_total = 0

    for tx in transactions:
        # Ensure we have a valid list of categories
        if tx.category is None:
            categories = []
        elif isinstance(tx.category, str):
            try:
                # Attempt to parse the string as JSON.
                categories = json.loads(tx.category)
            except json.JSONDecodeError:
                # Fallback: remove brackets and quotes, then split by comma
                categories = tx.category.strip('[]').replace('"', '').split(',')
                categories = [cat.strip() for cat in categories if cat.strip()]
        elif isinstance(tx.category, list):
            categories = tx.category
        else:
            categories = []
        
        # Now safely check if "Food and Drink" is in the category list
        if any(isinstance(cat, str) and cat.strip() == "Food and Drink" for cat in categories):
            date_str = tx.date.strftime("%Y-%m-%d")
            running_total += tx.amount
            cumulative_spending[date_str] = running_total

    return {
        "message": "Food spending data retrieved successfully",
        "cumulative_spending": cumulative_spending
    }

@app.get("/food_graph")
def get_food_graph(username: str, db: Session = Depends(get_db)):
    food_data = get_food_data(username, db)
    return food_data


def get_food_predicted(username: str, db: Session = Depends(get_db)):
    # Get the food spending data
    food_data = get_food_data(username, db)
    cumulative_spending = food_data["cumulative_spending"]
    
    if not cumulative_spending:
        return {"message": "No food spending data found"}

    # Convert data to arrays for regression
    dates = [datetime.strptime(date, "%Y-%m-%d").day for date in cumulative_spending.keys()]
    amounts = list(cumulative_spending.values())
    
    # Perform linear regression
    x = np.array(dates).reshape(-1, 1)
    y = np.array(amounts)
    
    if len(x) < 2:
        return {"message": "Not enough data points for prediction"}
        
    coefficients = np.polyfit(x.flatten(), y, 1)
    slope = coefficients[0]
    intercept = coefficients[1]
    
    # Predict spending for day 28
    predicted_spending = slope * 28 + intercept
    
    return {
        "message": "Food spending prediction calculated",
        "predicted_spending": predicted_spending
    }

@app.post("/food_predicted")
def get_food_model(username: str, db: Session = Depends(get_db)):
    food_predicted = get_food_predicted(username, db)
    food_ps = food_predicted.get("predicted_spending", 0)
    user = db.query(User).filter(User.username == username).first()
    if user:
        user.food_spending_predicted = food_ps
        db.commit()
    return {"predicted_spending": food_ps}

from dateutil.relativedelta import relativedelta

# ------------------------------------------------------------------
# Entertainment Category Endpoints
# ------------------------------------------------------------------
def get_entertainment_data(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Calculate the current month range
    today = datetime.now()
    first_day = today.replace(day=1)
    next_month = first_day + relativedelta(months=1)

    # Filter transactions only in the current month
    transactions = db.query(Transaction).filter(
        Transaction.date >= first_day,
        Transaction.date < next_month
    ).all()

    cumulative_spending = {}
    running_total = 0

    for tx in transactions:
        # Ensure we have a valid list of categories
        if tx.category is None:
            categories = []
        elif isinstance(tx.category, str):
            try:
                categories = json.loads(tx.category)
            except json.JSONDecodeError:
                categories = tx.category.strip('[]').replace('"', '').split(',')
                categories = [cat.strip() for cat in categories if cat.strip()]
        elif isinstance(tx.category, list):
            categories = tx.category
        else:
            categories = []
        
        # Check if "Entertainment" is in the category list
        if any(isinstance(cat, str) and cat.strip() == "Entertainment" for cat in categories):
            date_str = tx.date.strftime("%Y-%m-%d")
            running_total += tx.amount
            cumulative_spending[date_str] = running_total

    return {
        "message": "Entertainment spending data retrieved successfully",
        "cumulative_spending": cumulative_spending
    }

@app.get("/entertainment_graph")
def get_entertainment_graph(username: str, db: Session = Depends(get_db)):
    entertainment_data = get_entertainment_data(username, db)
    return entertainment_data

def get_entertainment_predicted(username: str, db: Session = Depends(get_db)):
    # Get the entertainment spending data
    entertainment_data = get_entertainment_data(username, db)
    cumulative_spending = entertainment_data["cumulative_spending"]
    
    if not cumulative_spending:
        return {"message": "No entertainment spending data found"}
    
    # Convert data to arrays for regression
    dates = [datetime.strptime(date, "%Y-%m-%d").day for date in cumulative_spending.keys()]
    amounts = list(cumulative_spending.values())
    
    # Perform linear regression
    x = np.array(dates).reshape(-1, 1)
    y = np.array(amounts)
    
    if len(x) < 2:
        return {"message": "Not enough data points for prediction"}
        
    coefficients = np.polyfit(x.flatten(), y, 1)
    slope = coefficients[0]
    intercept = coefficients[1]
    
    # Predict spending for day 28
    predicted_spending = slope * 28 + intercept
    
    return {
        "message": "Entertainment spending prediction calculated",
        "predicted_spending": predicted_spending
    }

@app.post("/entertainment_predicted")
def get_entertainment_model(username: str, db: Session = Depends(get_db)):
    entertainment_predicted = get_entertainment_predicted(username, db)
    entertainment_ps = entertainment_predicted.get("predicted_spending", 0)
    user = db.query(User).filter(User.username == username).first()
    if user:
        user.entertainment_spending_predicted = entertainment_ps
        db.commit()
    return {"predicted_spending": entertainment_ps}

# ------------------------------------------------------------------
# Travel Category Endpoints
# ------------------------------------------------------------------
def get_travel_data(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate the current month range
    today = datetime.now()
    first_day = today.replace(day=1)
    next_month = first_day + relativedelta(months=1)

    # Filter transactions only in the current month
    transactions = db.query(Transaction).filter(
        Transaction.date >= first_day,
        Transaction.date < next_month
    ).all()

    cumulative_spending = {}
    running_total = 0

    for tx in transactions:
        # Ensure we have a valid list of categories
        if tx.category is None:
            categories = []
        elif isinstance(tx.category, str):
            try:
                categories = json.loads(tx.category)
            except json.JSONDecodeError:
                categories = tx.category.strip('[]').replace('"', '').split(',')
                categories = [cat.strip() for cat in categories if cat.strip()]
        elif isinstance(tx.category, list):
            categories = tx.category
        else:
            categories = []
        
        # Check if "Travel" is in the category list
        if any(isinstance(cat, str) and cat.strip() == "Travel" for cat in categories):
            date_str = tx.date.strftime("%Y-%m-%d")
            running_total += tx.amount
            cumulative_spending[date_str] = running_total

    return {
        "message": "Travel spending data retrieved successfully",
        "cumulative_spending": cumulative_spending
    }

@app.get("/travel_graph")
def get_travel_graph(username: str, db: Session = Depends(get_db)):
    travel_data = get_travel_data(username, db)
    return travel_data

def get_travel_predicted(username: str, db: Session = Depends(get_db)):
    # Get the travel spending data
    travel_data = get_travel_data(username, db)
    cumulative_spending = travel_data["cumulative_spending"]
    
    if not cumulative_spending:
        return {"message": "No travel spending data found"}
    
    # Convert data to arrays for regression
    dates = [datetime.strptime(date, "%Y-%m-%d").day for date in cumulative_spending.keys()]
    amounts = list(cumulative_spending.values())
    
    # Perform linear regression
    x = np.array(dates).reshape(-1, 1)
    y = np.array(amounts)
    
    if len(x) < 2:
        return {"message": "Not enough data points for prediction"}
        
    coefficients = np.polyfit(x.flatten(), y, 1)
    slope = coefficients[0]
    intercept = coefficients[1]
    
    # Predict spending for day 28
    predicted_spending = slope * 28 + intercept
    
    return {
        "message": "Travel spending prediction calculated",
        "predicted_spending": predicted_spending
    }

@app.post("/travel_predicted")
def get_travel_model(username: str, db: Session = Depends(get_db)):
    travel_predicted = get_travel_predicted(username, db)
    travel_ps = travel_predicted.get("predicted_spending", 0)
    user = db.query(User).filter(User.username == username).first()
    if user:
        user.travel_spending_predicted = travel_ps
        db.commit()
    return {"predicted_spending": travel_ps}

@app.get("/get_food_predicted")
def set_food_predicted(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.food_spending_predicted

@app.get("/get_entertainment_predicted")
def set_entertainment_predicted(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.entertainment_spending_predicted

@app.get("/get_travel_predicted")
def set_travel_predicted(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.travel_spending_predicted   

@app.post("/post_actual_food")
def post_actual_food(username: str, db: Session = Depends(get_db)):
    food_data = get_food_data(username, db)
    cumulative_spending = food_data["cumulative_spending"]
    if cumulative_spending:
        last_value = list(cumulative_spending.values())[-1]
        user = db.query(User).filter(User.username == username).first()
        user.food_spending = last_value
        db.commit()
        return {"message": "Food spending updated", "food_spending": last_value}
    return {"message": "No food spending data found"}

@app.post("/post_actual_entertainment")
def post_actual_entertainment(username: str, db: Session = Depends(get_db)):
    entertainment_data = get_entertainment_data(username, db)
    cumulative_spending = entertainment_data["cumulative_spending"]
    if cumulative_spending:
        last_value = list(cumulative_spending.values())[-1]
        user = db.query(User).filter(User.username == username).first()
        user.entertainment_spending = last_value
        db.commit()
        return {"message": "Entertainment spending updated", "entertainment_spending": last_value}
    return {"message": "No entertainment spending data found"}

@app.post("/post_actual_travel")
def post_actual_travel(username: str, db: Session = Depends(get_db)):
    travel_data = get_travel_data(username, db)
    cumulative_spending = travel_data["cumulative_spending"]
    if cumulative_spending:
        last_value = list(cumulative_spending.values())[-1]
        user = db.query(User).filter(User.username == username).first()
        user.travel_spending = last_value
        db.commit()
        return {"message": "Travel spending updated", "travel_spending": last_value}
    return {"message": "No travel spending data found"}

@app.get("/get_food_spending")
def get_food_spending(username: str, db: Session = Depends(get_db)):
    user_instance = db.query(User).filter(User.username == username).first()
    if not user_instance:
       raise HTTPException(status_code=404, detail="User not found")
    return {"food_spending": user_instance.food_spending}

@app.get("/get_entertainment_spending")
def get_entertainment_spending(username: str, db: Session = Depends(get_db)):
    user_instance = db.query(User).filter(User.username == username).first()
    if not user_instance:
       raise HTTPException(status_code=404, detail="User not found")
    return {"entertainment_spending": user_instance.entertainment_spending}

@app.get("/get_travel_spending")
def get_travel_spending(username: str, db: Session = Depends(get_db)):
    user_instance = db.query(User).filter(User.username == username).first()
    if not user_instance:
       raise HTTPException(status_code=404, detail="User not found")
    return {"travel_spending": user_instance.travel_spending}

@app.post("/adaptive_spending")
def adaptive_spending(username: str, db: Session = Depends(get_db)):
    user_instance = db.query(User).filter(User.username == username).first()
    if not user_instance:
       raise HTTPException(status_code=404, detail="User not found")
    
    # Set default saving_goal to 0 if None
    saving_goal = user_instance.saving_goal or 0
    spend_limit = 1000 - saving_goal
    
    food_predicted = get_food_model(username, db)
    entertainment_predicted = get_entertainment_model(username, db)
    travel_predicted = get_travel_model(username, db)
    
    # Safely extract predicted_spending values using .get (defaulting to 0 if missing)
    food_ps = food_predicted.get("predicted_spending", 0)
    entertainment_ps = entertainment_predicted.get("predicted_spending", 0)
    travel_ps = travel_predicted.get("predicted_spending", 0)
    
    predicted_spending = food_ps + entertainment_ps + travel_ps

    # Calculate ratio only if predicted_spending is non-zero
    ratio = spend_limit / predicted_spending if predicted_spending else 0

    user_instance.food_spending_goal = food_ps * ratio
    user_instance.entertainment_spending_goal = entertainment_ps * ratio
    user_instance.travel_spending_goal = travel_ps * ratio
    db.commit()

    return {"message": "Adaptive spending updated", "predicted_spending": predicted_spending}
    
@app.get("/get_all_predicted")
def total_spending_predicted(username: str, db: Session = Depends(get_db)):
    user_instance = db.query(User).filter(User.username == username).first()
    if not user_instance:
        raise HTTPException(status_code=404, detail="User not found")
        
    food_predicted = get_food_model(username, db)
    entertainment_predicted = get_entertainment_model(username, db)
    travel_predicted = get_travel_model(username, db)

    # Use .get with default of 0 if key is missing
    food_ps = food_predicted.get("predicted_spending", 0)
    entertainment_ps = entertainment_predicted.get("predicted_spending", 0)
    travel_ps = travel_predicted.get("predicted_spending", 0)

    predicted_spending = food_ps + entertainment_ps + travel_ps
    spend_limit = 1000 - user_instance.saving_goal  # Assuming saving_goal exists

    return predicted_spending



@app.get("/total_spending_predicted")
def total_spending_predicted(username: str, db: Session = Depends(get_db)):
    user_instance = db.query(User).filter(User.username == username).first()
    if not user_instance:
        raise HTTPException(status_code=404, detail="User not found")
        
    food_predicted = get_food_model(username, db)
    entertainment_predicted = get_entertainment_model(username, db)
    travel_predicted = get_travel_model(username, db)

    # Use .get with default of 0 if key is missing
    food_ps = food_predicted.get("predicted_spending", 0)
    entertainment_ps = entertainment_predicted.get("predicted_spending", 0)
    travel_ps = travel_predicted.get("predicted_spending", 0)

    predicted_spending = food_ps + entertainment_ps + travel_ps
    spend_limit = 1000 - user_instance.saving_goal  # Assuming saving_goal exists

    return {"message": 0, "predicted_spending": predicted_spending}


@app.get("/get_food_spending_goal")
def get_food_spending_goal(username: str, db: Session = Depends(get_db)):
    user_instance = db.query(User).filter(User.username == username).first()
    if not user_instance:
       raise HTTPException(status_code=404, detail="User not found")
    return {"food_spending_goal": user_instance.food_spending_goal}

@app.get("/get_entertainment_spending_goal")
def get_entertainment_spending_goal(username: str, db: Session = Depends(get_db)):
    user_instance = db.query(User).filter(User.username == username).first()
    if not user_instance:
       raise HTTPException(status_code=404, detail="User not found")
    return {"entertainment_spending_goal": user_instance.entertainment_spending_goal}

@app.get("/get_travel_spending_goal")
def get_travel_spending_goal(username: str, db: Session = Depends(get_db)):
    user_instance = db.query(User).filter(User.username == username).first()
    if not user_instance:
       raise HTTPException(status_code=404, detail="User not found")
    return {"travel_spending_goal": user_instance.travel_spending_goal}

@app.post("/simulate_income")
def simulate_income(username: str, amt: float, db: Session = Depends(get_db)):
    user_instance = db.query(User).filter(User.username == username).first()
    if not user_instance:
        raise HTTPException(status_code=404, detail="User not found")
    
    if amt < 0:
        raise HTTPException(status_code=400, detail="Amount cannot be negative")
        
    # Add income to checkings
    if user_instance.checkings is None:
        user_instance.checkings = amt
    else:
        user_instance.checkings += amt
    
    db.commit()
    return {"message": "Income added to checkings", "amount": amt}

@app.post("/transfer_to_savings") 
def transfer_to_savings(username: str, transfer_amt: float, db: Session = Depends(get_db)):
    user_instance = db.query(User).filter(User.username == username).first()
    if not user_instance:
        raise HTTPException(status_code=404, detail="User not found")
        
    if transfer_amt < 0:
        raise HTTPException(status_code=400, detail="Transfer amount cannot be negative")
        
    if user_instance.checkings < transfer_amt:
        raise HTTPException(status_code=400, detail="Insufficient funds in checkings")
        
    # Transfer money from checkings to savings
    user_instance.checkings -= transfer_amt
    if user_instance.savings is None:
        user_instance.savings = transfer_amt
    else:
        user_instance.savings += transfer_amt
        
    db.commit()
    return {
        "message": "Transfer successful",
        "amount": transfer_amt,
        "new_checkings_balance": user_instance.checkings,
        "new_savings_balance": user_instance.savings
    }









