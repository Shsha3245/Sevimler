import sqlite3

conn = sqlite3.connect('sevimler.db')
cursor = conn.cursor()

try:
    print("Adding payment_id to orders table...")
    cursor.execute("ALTER TABLE orders ADD COLUMN payment_id VARCHAR")
except Exception as e:
    print(f"payment_id error: {e}")

try:
    print("Adding tracking_number to orders table...")
    cursor.execute("ALTER TABLE orders ADD COLUMN tracking_number VARCHAR")
except Exception as e:
    print(f"tracking_number error: {e}")

conn.commit()
conn.close()
print("Migration complete.")
