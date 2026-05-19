import sqlite3

conn = sqlite3.connect('/Users/ricardodavila/.gemini/antigravity/scratch/quiz-master-pdf/data/quiz.db')
c = conn.cursor()

c.execute('''
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR UNIQUE,
    description VARCHAR
)
''')

try:
    c.execute("INSERT INTO subjects (name, description) VALUES ('La Constitucion Española', 'Temas relacionados con la Constitución')")
    subject_id = c.lastrowid
except sqlite3.IntegrityError:
    c.execute("SELECT id FROM subjects WHERE name='La Constitucion Española'")
    subject_id = c.fetchone()[0]

try:
    c.execute("ALTER TABLE topics ADD COLUMN subject_id INTEGER REFERENCES subjects(id)")
except sqlite3.OperationalError:
    pass

c.execute("UPDATE topics SET subject_id = ? WHERE subject_id IS NULL", (subject_id,))

conn.commit()
conn.close()
