import sqlite3

conn = sqlite3.connect('sevimler.db')
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(orders)")
columns = cursor.fetchall()
for col in columns:
    print(col)
conn.close()
