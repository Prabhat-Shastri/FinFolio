# import os
# from dotenv import load_dotenv
# import requests
# import json
# import time


# load_dotenv()
# # Set your Plaid API credentials

# PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
# PLAID_SECRET = os.getenv("PLAID_SECRET")
# PLAID_SANDBOX_URL = "https://sandbox.plaid.com"

# ### Step 1: Create a Sandbox Public Token ###
# public_token_url = f"{PLAID_SANDBOX_URL}/sandbox/public_token/create"
# public_token_payload = {
#     "client_id": PLAID_CLIENT_ID,
#     "secret": PLAID_SECRET,
#     "institution_id": "ins_109512",
#     "initial_products": ["transactions"]
# }

# response = requests.post(public_token_url, json=public_token_payload)
# public_token_response = response.json()

# if "public_token" not in public_token_response:
#     print("Error creating public token:", public_token_response)
#     exit()

# public_token = public_token_response["public_token"]
# # print("✅ Public Token:", public_token)

# ### Step 2: Exchange the Public Token for an Access Token ###
# exchange_url = f"{PLAID_SANDBOX_URL}/item/public_token/exchange"
# exchange_payload = {
#     "client_id": PLAID_CLIENT_ID,
#     "secret": PLAID_SECRET,
#     "public_token": public_token
# }

# response = requests.post(exchange_url, json=exchange_payload)
# exchange_response = response.json()

# if "access_token" not in exchange_response:
#     print("Error exchanging public token:", exchange_response)
#     exit()

# access_token = exchange_response["access_token"]
# # print("✅ Access Token:", access_token)

# ### Step 3: Fetch Accounts to Get the Correct Account ID ###
# accounts_url = f"{PLAID_SANDBOX_URL}/accounts/get"
# accounts_payload = {
#     "client_id": PLAID_CLIENT_ID,
#     "secret": PLAID_SECRET,
#     "access_token": access_token
# }

# response = requests.post(accounts_url, json=accounts_payload)
# accounts_response = response.json()

# if "accounts" not in accounts_response:
#     print("Error fetching accounts:", accounts_response)
#     exit()

# # Extract the first valid account_id dynamically
# account_id = accounts_response["accounts"][0]["account_id"]
# # print("✅ Using Account ID:", account_id)

# ### Step 4: Fire Webhook to Simulate Transactions Data Ready ###
# webhook_url = f"{PLAID_SANDBOX_URL}/sandbox/item/fire_webhook"
# webhook_payload = {
#     "client_id": PLAID_CLIENT_ID,
#     "secret": PLAID_SECRET,
#     "access_token": access_token,
#     "webhook_code": "DEFAULT_UPDATE"
# }

# response = requests.post(webhook_url, json=webhook_payload)
# webhook_response = response.json()

# # print("Webhook Fired:", webhook_response)

# ### Step 5: Retry Fetching Transactions Until Data is Available ###
# max_retries = 5
# retry_wait = 5  # Wait time in seconds

# for attempt in range(max_retries):
#     print(f"🔄 Attempt {attempt + 1}: Fetching transactions...")

#     transactions_url = f"{PLAID_SANDBOX_URL}/transactions/get"
#     transactions_payload = {
#         "client_id": PLAID_CLIENT_ID,
#         "secret": PLAID_SECRET,
#         "access_token": access_token,
#         "start_date": "2025-02-01",
#         "end_date": "2025-02-05",
#         "options": {
#             "account_ids": [account_id]
#         }
#     }

#     response = requests.post(transactions_url, json=transactions_payload)
#     transactions_response = response.json()

#     if "transactions" in transactions_response:
#         print("Transactions Data:")
#         print(json.dumps(transactions_response, indent=4))
#         break  # Exit loop if transactions are found

#     print("Waiting")
#     time.sleep(retry_wait)

# else:
#     print("Error fetching transactions after multiple retries:", transactions_response)

#------------------------------------------------------------


import os
import json
import time
import requests
import datetime
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from app.database import SessionLocal
from app.models.transaction import Transaction

load_dotenv()

PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_SANDBOX_URL = "https://sandbox.plaid.com"

# Connect to database
db: Session = SessionLocal()

### Step 1: Fetch Transactions (Keeping Your Code Intact) ###
public_token_url = f"{PLAID_SANDBOX_URL}/sandbox/public_token/create"
public_token_payload = {
    "client_id": PLAID_CLIENT_ID,
    "secret": PLAID_SECRET,
    "institution_id": "ins_109512",
    "initial_products": ["transactions"]
}

response = requests.post(public_token_url, json=public_token_payload)
public_token_response = response.json()

if "public_token" not in public_token_response:
    print("Error creating public token:", public_token_response)
    exit()

public_token = public_token_response["public_token"]

exchange_url = f"{PLAID_SANDBOX_URL}/item/public_token/exchange"
exchange_payload = {
    "client_id": PLAID_CLIENT_ID,
    "secret": PLAID_SECRET,
    "public_token": public_token
}

response = requests.post(exchange_url, json=exchange_payload)
exchange_response = response.json()

if "access_token" not in exchange_response:
    print("Error exchanging public token:", exchange_response)
    exit()

access_token = exchange_response["access_token"]

accounts_url = f"{PLAID_SANDBOX_URL}/accounts/get"
accounts_payload = {
    "client_id": PLAID_CLIENT_ID,
    "secret": PLAID_SECRET,
    "access_token": access_token
}

response = requests.post(accounts_url, json=accounts_payload)
accounts_response = response.json()

if "accounts" not in accounts_response:
    print("Error fetching accounts:", accounts_response)
    exit()

account_id = accounts_response["accounts"][0]["account_id"]

webhook_url = f"{PLAID_SANDBOX_URL}/sandbox/item/fire_webhook"
webhook_payload = {
    "client_id": PLAID_CLIENT_ID,
    "secret": PLAID_SECRET,
    "access_token": access_token,
    "webhook_code": "DEFAULT_UPDATE"
}

response = requests.post(webhook_url, json=webhook_payload)
webhook_response = response.json()

# Wait for transactions to be available
max_retries = 5
retry_wait = 5  # Wait time in seconds

transactions_data = None

for attempt in range(max_retries):
    print(f"🔄 Attempt {attempt + 1}: Fetching transactions...")

    transactions_url = f"{PLAID_SANDBOX_URL}/transactions/get"
    transactions_payload = {
        "client_id": PLAID_CLIENT_ID,
        "secret": PLAID_SECRET,
        "access_token": access_token,
        "start_date": "2024-01-01",
        "end_date": "2025-01-01",
        "options": {
            "account_ids": [account_id]
        }
    }

    response = requests.post(transactions_url, json=transactions_payload)
    transactions_response = response.json()

    if "transactions" in transactions_response:
        transactions_data = transactions_response["transactions"]  # Extract transactions list
        print("✅ Transactions found!")
        break  # Exit loop if transactions are found

    print("⌛ Waiting for transactions to populate...")
    time.sleep(retry_wait)

if transactions_data is None:
    print("Error fetching transactions after multiple retries.")
    exit()



## Step 2: Extract & Store Transactions in SQLite ###

for tx in transactions_data:
    new_transaction = Transaction(
        transaction_id=tx["transaction_id"],
        account_id=tx["account_id"],
        name=tx["name"],
        merchant_name=tx.get("merchant_name"),
        amount=tx["amount"],
        date=datetime.datetime.strptime(tx["date"], "%Y-%m-%d").date(),  # ✅ Fix applied here
        category=json.dumps(tx["category"]),  # Store category as JSON string
        payment_channel=tx["payment_channel"],
        currency=tx.get("iso_currency_code"),
    )

    db.add(new_transaction)

db.commit()
db.close()

print("✅ Transactions successfully saved to database!")

