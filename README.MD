# FinFolio – Personal Savings & Budget Advisor

## Overview
FinFolio is a mobile-first personal finance advisor that helps users achieve their savings goals and improve their credit scores. By aggregating bank and credit card data (via Plaid and other integrations), FinanceFlow offers:
- A real-time dashboard of transactions and account balances.
- Personalized budgeting and savings plans based on historical spending.
- End-of-month spending predictions using regression and adaptive learning.
- Timely alerts for overspending, upcoming credit card bill due dates, and potential fraudulent transactions.
- A calendar view displaying predicted income and recurring outgoing transactions.

## Features
- **Unified Dashboard:**  
  - Aggregates data from multiple bank accounts and credit cards.
  - Displays current balances, recent transactions, and categorized spending summaries.

- **Savings & Budgeting Goals:**  
  - Users set monthly/yearly savings goals (e.g., “Save \$1200 for a trip in 3 months”).
  - Personalized spending limits are recommended per category based on historical data.

- **Adaptive Predictions:**  
  - Uses historical data from Plaid to build a regression model that predicts end-of-month spending.
  - Adaptive learning updates predictions daily (or after every transaction).

- **Credit Card Management:**  
  - Allows users to link credit cards.
  - Provides due date reminders and spending advice to help maintain/improve credit scores.

- **Fraud Detection:**  
  - Integrates a fraud detection model (trained on Kaggle data) to send push notifications for suspicious transactions.
  - Users can respond directly to alerts to trigger further actions with their bank.

- **Calendar Integration:**  
  - Displays predicted recurring incomes and outgoing transactions.
  - Automatically detects recurring transactions and estimates their intervals.

## Tech Stack
- **Backend:** FastAPI
- **Frontend:** React Native
- **Database:** SQLite (MVP)
- **Bank Data API:** Plaid Sandbox (with potential expansion to Yodlee/Finicity)
- **Cloud Functions / Background Tasks:** FastAPI Background Tasks, APScheduler (or AWS Lambda/Google Cloud Functions as needed)

## API Endpoints
For detailed API documentation, see the `/docs` endpoint provided by FastAPI.

### Key Endpoints:
- `/api/auth/register` & `/api/auth/login`
- `/api/plaid/link-token` & `/api/plaid/exchange-token`
- `/api/transactions`
- `/api/budget/set-goals` & `/api/budget/status`
- `/api/predictions/monthly` & `/api/predictions/update`
- `/api/credit/register`, `/api/credit/status`, `/api/credit/advice`
- `/api/fraud/alert`, `/api/fraud/alerts`, `/api/fraud/respond`
- `/api/calendar` & `/api/calendar/add`

## Database Schemas
Refer to the `schemas/` directory for SQL schema definitions for tables such as `users`, `transactions`, `budgets`, `credit_cards`, `predictions`, `fraud_alerts`, and `calendar_events`.

## Setup & Running Locally
1. **Clone the repository**
   ```bash
   git clone https://github.com/Prabhat-Shastri/FinFolio.git
   cd FionFolio



