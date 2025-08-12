# 🏦 Bank Statement Converter

## 📌 Overview
Bank Statement Converter is a simple and efficient tool that converts bank statements into clean, structured formats for easier analysis and reporting.  
It supports multiple input formats and outputs them into formats such as CSV, Excel, or JSON, making financial data processing faster and more accurate.

Whether you’re an accountant, a small business owner, or just someone who wants to manage personal finances, this tool helps you save hours of manual data entry.

---

## ✨ Features
- 📂 **Multiple Input Formats** – Supports PDF, CSV, and Excel bank statements,
- 🔄 **Flexible Output** – Convert to CSV, Excel.
- 🏦 **Multi-Bank Support** – Works with statements from different banks.
- ⚡ **Fast & Accurate** – Extracts transaction details with minimal errors.
- 🌐 **Web-Based Interface** – No installation required for end-users.

---

## 🛠️ Tech Stack
- **Frontend:** React.js + Tailwind CSS
- **Backend:** Node.js + Express.js
- **File Parsing:** `pdf-parse`, `xlsx`, `csv-parser`
- **Database:** MongoDB (for storing history/logs)
- **API Requests:** Axios

---

## 📂 Project Structure
bank-statement-converter/
│
├── client/ # React frontend
├── server/ # Node.js + Express backend
├── uploads/ # Temporary uploaded files
├── package.json
└── README.md



## Run the development servers

# Start backend
npm run dev

# Start frontend
cd client && npm start


install the require dev dependicies to work it smooth.
