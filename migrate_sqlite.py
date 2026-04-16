import sqlite3
import os

db_path = "sevimler.db"

def migrate():
    if not os.path.exists(db_path):
        print("Database file not found. It will be created on first run.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Add weight to products if missing
    try:
        cursor.execute("ALTER TABLE products ADD COLUMN weight FLOAT DEFAULT 1.0")
        print("Column 'weight' added to 'products' table.")
    except sqlite3.OperationalError:
        print("Column 'weight' already exists in 'products' table.")

    # Add payment_id and tracking_number to orders if missing
    try:
        cursor.execute("ALTER TABLE orders ADD COLUMN payment_id VARCHAR")
        print("Column 'payment_id' added to 'orders' table.")
    except sqlite3.OperationalError:
        print("Column 'payment_id' already exists in 'orders' table.")

    try:
        cursor.execute("ALTER TABLE orders ADD COLUMN tracking_number VARCHAR")
        print("Column 'tracking_number' added to 'orders' table.")
    except sqlite3.OperationalError:
        print("Column 'tracking_number' already exists in 'orders' table.")

    conn.commit()
    conn.close()
    print("Migration completed.")

if __name__ == "__main__":
    migrate()
