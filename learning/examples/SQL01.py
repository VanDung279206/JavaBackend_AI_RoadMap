import sqlite3
db=sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys=ON")
db.executescript("""
CREATE TABLE users(id INTEGER PRIMARY KEY,name TEXT NOT NULL);
CREATE TABLE docs(id INTEGER PRIMARY KEY,owner INTEGER NOT NULL REFERENCES users(id),title TEXT NOT NULL CHECK(length(trim(title))>0));
INSERT INTO users VALUES(1,'An'),(2,'Binh');
INSERT INTO docs VALUES(10,1,'Java'),(11,1,'SQL');
""")
rows=db.execute("SELECT u.name,count(d.id) FROM users u LEFT JOIN docs d ON d.owner=u.id GROUP BY u.id,u.name ORDER BY u.id").fetchall()
print(rows)
try:
    db.execute("INSERT INTO docs VALUES(10,2,'Duplicate')")
except sqlite3.IntegrityError:
    print("duplicate rejected")
db.close()
