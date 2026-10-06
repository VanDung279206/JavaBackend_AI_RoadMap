import sqlite3
db=sqlite3.connect(":memory:")
db.executescript("CREATE TABLE wallets(id INTEGER PRIMARY KEY,balance INTEGER CHECK(balance>=0)); INSERT INTO wallets VALUES(1,10),(2,5);")
try:
    with db:
        db.execute("UPDATE wallets SET balance=balance-4 WHERE id=1")
        db.execute("UPDATE wallets SET balance=-1 WHERE id=2")
except sqlite3.IntegrityError:
    print("rollback")
print(db.execute("SELECT balance FROM wallets ORDER BY id").fetchall())
db.close()
