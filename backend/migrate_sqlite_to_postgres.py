import os
import sqlite3
import sys

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    print("Missing dependency. Run: pip install psycopg2-binary")
    sys.exit(1)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLITE_PATH = os.path.join(BASE_DIR, "auth", "auth.db")
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL is not set in this terminal.")
    print("Set it to your Render PostgreSQL External Database URL for this one-time migration.")
    print("Do not paste the URL into chat or commit it to GitHub.")
    sys.exit(1)

if not os.path.isfile(SQLITE_PATH):
    print(f"ERROR: SQLite database not found: {SQLITE_PATH}")
    print("Run this script from the DeepDetect-AI project root, where backend/auth/auth.db exists.")
    sys.exit(1)

DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

sqlite_conn = sqlite3.connect(SQLITE_PATH)
sqlite_conn.row_factory = sqlite3.Row
pg_conn = None

try:
    users = sqlite_conn.execute(
        "SELECT id, username, email, password, created_at FROM users ORDER BY id"
    ).fetchall()
    history = sqlite_conn.execute(
        """SELECT id, user_id, filename, detection_type, prediction, confidence,
                  real_probability, ai_probability, created_at
           FROM history ORDER BY id"""
    ).fetchall()

    print(f"Local SQLite records found: {len(users)} users, {len(history)} history records.")

    pg_conn = psycopg2.connect(DATABASE_URL, sslmode="require")
    pg_conn.autocommit = False

    with pg_conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                filename TEXT,
                detection_type TEXT,
                prediction TEXT,
                confidence DOUBLE PRECISION,
                real_probability DOUBLE PRECISION,
                ai_probability DOUBLE PRECISION,
                created_at TEXT NOT NULL
            )
        """)
        cur.execute("SELECT COUNT(*) AS n FROM users")
        target_users = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM history")
        target_history = cur.fetchone()["n"]

        if target_users or target_history:
            raise RuntimeError(
                f"Migration stopped safely: PostgreSQL already contains "
                f"{target_users} users and {target_history} history records. "
                "No records were copied. Check the target database before retrying."
            )

        for user in users:
            cur.execute(
                """INSERT INTO users (id, username, email, password, created_at)
                   VALUES (%s, %s, %s, %s, %s)""",
                (user["id"], user["username"], user["email"], user["password"], user["created_at"]),
            )

        for item in history:
            cur.execute(
                """INSERT INTO history
                   (id, user_id, filename, detection_type, prediction, confidence,
                    real_probability, ai_probability, created_at)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    item["id"], item["user_id"], item["filename"], item["detection_type"],
                    item["prediction"], item["confidence"], item["real_probability"],
                    item["ai_probability"], item["created_at"],
                ),
            )

        # Ensure future generated IDs continue after the imported IDs.
        cur.execute("""
            SELECT setval(
                pg_get_serial_sequence('users', 'id'),
                GREATEST(COALESCE((SELECT MAX(id) FROM users), 1), 1),
                EXISTS (SELECT 1 FROM users)
            )
        """)
        cur.execute("""
            SELECT setval(
                pg_get_serial_sequence('history', 'id'),
                GREATEST(COALESCE((SELECT MAX(id) FROM history), 1), 1),
                EXISTS (SELECT 1 FROM history)
            )
        """)

    pg_conn.commit()
    print("SUCCESS: Local records copied to PostgreSQL.")
    print(f"Imported: {len(users)} users and {len(history)} history records.")
    print("Your SQLite auth.db was not changed.")
except Exception as exc:
    if pg_conn:
        pg_conn.rollback()
    print(f"ERROR: Migration failed; PostgreSQL changes were rolled back. Details: {exc}")
    sys.exit(1)
finally:
    sqlite_conn.close()
    if pg_conn:
        pg_conn.close()

