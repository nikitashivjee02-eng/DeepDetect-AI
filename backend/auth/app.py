from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

import sqlite3
import os
from datetime import datetime


# =========================================================
# FLASK APP
# =========================================================

app = Flask(__name__)

app.secret_key = "ai-deepfake-detector-secret-key-2026"


# =========================================================
# SESSION CONFIGURATION
# =========================================================

app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False


# =========================================================
# CORS
# =========================================================

# Support both localhost and 127.0.0.1
# and common Next.js ports.

CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:8000",
    ],
)


# =========================================================
# DATABASE
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DB_PATH = os.path.join(
    BASE_DIR,
    "auth.db"
)


def get_db():

    conn = sqlite3.connect(DB_PATH)

    conn.row_factory = sqlite3.Row

    return conn


# =========================================================
# INITIALIZE DATABASE
# =========================================================

def init_db():

    conn = get_db()

    # =====================================================
    # USERS
    # =====================================================

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    # =====================================================
    # DETECTION HISTORY
    # =====================================================

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            filename TEXT,
            detection_type TEXT,
            prediction TEXT,
            confidence REAL,
            real_probability REAL,
            ai_probability REAL,
            created_at TEXT NOT NULL
        )
        """
    )

    conn.commit()

    conn.close()

    print("Database:", DB_PATH)


# =========================================================
# HEALTH
# =========================================================

@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "success": True,
        "message": "Authentication server is running"
    })


# =========================================================
# SIGNUP
# =========================================================

@app.route("/api/signup", methods=["POST"])
def signup():

    data = request.get_json(
        silent=True
    ) or {}

    username = str(
        data.get("username", "")
    ).strip()

    email = str(
        data.get("email", "")
    ).strip().lower()

    password = str(
        data.get("password", "")
    )


    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    if not username:

        return jsonify({
            "success": False,
            "message": "Username is required"
        }), 400


    if not email:

        return jsonify({
            "success": False,
            "message": "Email is required"
        }), 400


    if not password:

        return jsonify({
            "success": False,
            "message": "Password is required"
        }), 400


    if len(password) < 6:

        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters"
        }), 400


    conn = get_db()


    # -----------------------------------------------------
    # CHECK EXISTING USER
    # -----------------------------------------------------

    existing = conn.execute(
        """
        SELECT id
        FROM users
        WHERE LOWER(email) = ?
        """,
        (email,)
    ).fetchone()


    if existing:

        conn.close()

        return jsonify({
            "success": False,
            "message": "Email already registered"
        }), 409


    # -----------------------------------------------------
    # PASSWORD HASH
    # -----------------------------------------------------

    hashed_password = generate_password_hash(
        password
    )


    # -----------------------------------------------------
    # CREATE USER
    # -----------------------------------------------------

    conn.execute(
        """
        INSERT INTO users
        (
            username,
            email,
            password,
            created_at
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            username,
            email,
            hashed_password,
            datetime.now().isoformat()
        )
    )


    conn.commit()

    conn.close()


    print()
    print("================================")
    print("NEW USER CREATED")
    print("Username:", username)
    print("Email:", email)
    print("================================")
    print()


    return jsonify({
        "success": True,
        "message": "Account created successfully"
    }), 201


# =========================================================
# AUTHENTICATE USER
# =========================================================

def authenticate_user(email, password):

    email = str(
        email or ""
    ).strip().lower()

    password = str(
        password or ""
    )


    if not email or not password:
        return None


    conn = get_db()


    user = conn.execute(
        """
        SELECT *
        FROM users
        WHERE LOWER(email) = ?
        """,
        (email,)
    ).fetchone()


    conn.close()


    if user is None:
        return None


    try:

        valid = check_password_hash(
            user["password"],
            password
        )

    except Exception as error:

        print(
            "Password verification error:",
            error
        )

        return None


    if not valid:
        return None


    return user


# =========================================================
# LOGIN
# =========================================================

@app.route("/api/login", methods=["POST"])
def api_login():

    data = request.get_json(
        silent=True
    ) or {}


    email = str(
        data.get("email", "")
    ).strip().lower()

    password = str(
        data.get("password", "")
    )


    print()
    print("================================")
    print("API LOGIN")
    print("Email:", repr(email))
    print("================================")


    user = authenticate_user(
        email,
        password
    )


    if user is None:

        print("LOGIN FAILED")

        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401


    # -----------------------------------------------------
    # CREATE SESSION
    # -----------------------------------------------------

    session.clear()

    session["user_id"] = user["id"]


    print("LOGIN SUCCESS")
    print("User ID:", user["id"])
    print("User:", user["email"])
    print(
        "Session user_id:",
        session.get("user_id")
    )


    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"]
        }
    }), 200


# =========================================================
# CURRENT USER
# =========================================================

@app.route("/api/me", methods=["GET"])
def me():

    user_id = session.get("user_id")


    print()
    print("================================")
    print("CHECK CURRENT USER")
    print(
        "Session user_id:",
        user_id
    )
    print("================================")


    if not user_id:

        return jsonify({
            "success": False,
            "message": "Not logged in"
        }), 401


    conn = get_db()


    user = conn.execute(
        """
        SELECT
            id,
            username,
            email
        FROM users
        WHERE id = ?
        """,
        (user_id,)
    ).fetchone()


    conn.close()


    if user is None:

        session.clear()

        return jsonify({
            "success": False,
            "message": "User not found"
        }), 401


    return jsonify({
        "success": True,
        "user": dict(user)
    }), 200


# =========================================================
# LOGOUT
# =========================================================

@app.route("/api/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "Logout successful"
    })


# =========================================================
# SAVE DETECTION HISTORY
#
# IMPORTANT:
# This endpoint DOES NOT run a model.
#
# It only stores the result that was already generated
# by the existing image/video/audio detector.
# =========================================================

@app.route("/api/history", methods=["POST"])
def save_history():

    user_id = session.get("user_id")


    if not user_id:

        return jsonify({
            "success": False,
            "message": "Not logged in"
        }), 401


    data = request.get_json(
        silent=True
    ) or {}


    filename = data.get(
        "filename"
    )

    detection_type = data.get(
        "detection_type"
    )

    prediction = data.get(
        "prediction"
    )

    confidence = data.get(
        "confidence"
    )

    real_probability = data.get(
        "real_probability"
    )

    ai_probability = data.get(
        "ai_probability"
    )


    # -----------------------------------------------------
    # REQUIRED VALUES
    # -----------------------------------------------------

    if not detection_type:

        return jsonify({
            "success": False,
            "message": "Detection type is required"
        }), 400


    if not prediction:

        return jsonify({
            "success": False,
            "message": "Prediction is required"
        }), 400


    # -----------------------------------------------------
    # CONVERT VALUES
    #
    # No prediction calculation happens here.
    # -----------------------------------------------------

    try:

        confidence = float(
            confidence
        )

        real_probability = float(
            real_probability
        )

        ai_probability = float(
            ai_probability
        )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({
            "success": False,
            "message": "Invalid detection values"
        }), 400


    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    conn = get_db()


    cursor = conn.execute(
        """
        INSERT INTO history
        (
            user_id,
            filename,
            detection_type,
            prediction,
            confidence,
            real_probability,
            ai_probability,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            filename,
            detection_type,
            prediction,
            confidence,
            real_probability,
            ai_probability,
            datetime.now().isoformat()
        )
    )


    conn.commit()

    history_id = cursor.lastrowid

    conn.close()


    print()
    print("================================")
    print("DETECTION HISTORY SAVED")
    print("User ID:", user_id)
    print("History ID:", history_id)
    print("Type:", detection_type)
    print("Filename:", filename)
    print("Prediction:", prediction)
    print("Confidence:", confidence)
    print("Real Probability:", real_probability)
    print("AI Probability:", ai_probability)
    print("================================")
    print()


    return jsonify({
        "success": True,
        "message": "Detection history saved",
        "history_id": history_id
    }), 201


# =========================================================
# GET DETECTION HISTORY
# =========================================================

@app.route("/api/history", methods=["GET"])
def get_history():

    user_id = session.get("user_id")


    if not user_id:

        return jsonify({
            "success": False,
            "message": "Not logged in"
        }), 401


    conn = get_db()


    rows = conn.execute(
        """
        SELECT
            id,
            user_id,
            filename,
            detection_type,
            prediction,
            confidence,
            real_probability,
            ai_probability,
            created_at
        FROM history
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (user_id,)
    ).fetchall()


    conn.close()


    return jsonify({
        "success": True,
        "history": [
            dict(row)
            for row in rows
        ]
    }), 200


# =========================================================
# DASHBOARD STATISTICS
# =========================================================
#
# This endpoint reads the user's saved detection history.
#
# IMPORTANT:
# Predictions may be:
#
#   Real
#   Real Content
#   Real Image
#   Real Video
#   Real Audio
#   AI
#   AI Generated
#   AI Content
#   AI Image
#   AI Video
#   AI Audio
#
# Therefore we use LIKE instead of checking only a few
# exact prediction names.
# =========================================================

@app.route("/api/stats", methods=["GET"])
def get_stats():

    user_id = session.get("user_id")


    if not user_id:

        return jsonify({
            "success": False,
            "message": "Not logged in"
        }), 401


    conn = get_db()


    # -----------------------------------------------------
    # TOTAL ANALYSES
    # -----------------------------------------------------

    total_row = conn.execute(
        """
        SELECT COUNT(*) AS total
        FROM history
        WHERE user_id = ?
        """,
        (user_id,)
    ).fetchone()


    # -----------------------------------------------------
    # REAL CONTENT
    #
    # Examples counted:
    #
    # Real
    # Real Content
    # Real Image
    # Real Video
    # Real Audio
    # Real Media
    # -----------------------------------------------------

    real_row = conn.execute(
        """
        SELECT COUNT(*) AS total
        FROM history
        WHERE user_id = ?
        AND LOWER(TRIM(prediction)) LIKE 'real%'
        """,
        (user_id,)
    ).fetchone()


    # -----------------------------------------------------
    # AI CONTENT
    #
    # Examples counted:
    #
    # AI
    # AI Generated
    # AI-Generated
    # AI Content
    # AI Image
    # AI Video
    # AI Audio
    # Artificial Intelligence
    # -----------------------------------------------------

    ai_row = conn.execute(
        """
        SELECT COUNT(*) AS total
        FROM history
        WHERE user_id = ?
        AND (
            LOWER(TRIM(prediction)) LIKE 'ai%'
            OR LOWER(TRIM(prediction)) LIKE 'artificial%'
        )
        """,
        (user_id,)
    ).fetchone()


    # -----------------------------------------------------
    # AVERAGE CONFIDENCE
    # -----------------------------------------------------

    confidence_row = conn.execute(
        """
        SELECT AVG(confidence) AS average_confidence
        FROM history
        WHERE user_id = ?
        """,
        (user_id,)
    ).fetchone()


    # -----------------------------------------------------
    # AVERAGE REAL PROBABILITY
    # -----------------------------------------------------

    real_probability_row = conn.execute(
        """
        SELECT AVG(real_probability) AS average_real_probability
        FROM history
        WHERE user_id = ?
        """,
        (user_id,)
    ).fetchone()


    # -----------------------------------------------------
    # AVERAGE AI PROBABILITY
    # -----------------------------------------------------

    ai_probability_row = conn.execute(
        """
        SELECT AVG(ai_probability) AS average_ai_probability
        FROM history
        WHERE user_id = ?
        """,
        (user_id,)
    ).fetchone()


    conn.close()


    # -----------------------------------------------------
    # SAFE VALUES
    # -----------------------------------------------------

    total_analyses = (
        total_row["total"]
        if total_row
        else 0
    )


    real_content = (
        real_row["total"]
        if real_row
        else 0
    )


    ai_content = (
        ai_row["total"]
        if ai_row
        else 0
    )


    average_confidence = (
        confidence_row["average_confidence"]
        if (
            confidence_row
            and confidence_row["average_confidence"] is not None
        )
        else 0
    )


    average_real_probability = (
        real_probability_row["average_real_probability"]
        if (
            real_probability_row
            and real_probability_row["average_real_probability"] is not None
        )
        else 0
    )


    average_ai_probability = (
        ai_probability_row["average_ai_probability"]
        if (
            ai_probability_row
            and ai_probability_row["average_ai_probability"] is not None
        )
        else 0
    )


    # -----------------------------------------------------
    # RETURN DASHBOARD DATA
    # -----------------------------------------------------

    return jsonify({
        "success": True,
        "stats": {

            "totalAnalyses": int(
                total_analyses
            ),

            "realContent": int(
                real_content
            ),

            "aiContent": int(
                ai_content
            ),

            "averageConfidence": round(
                float(average_confidence),
                2
            ),

            "averageRealProbability": round(
                float(average_real_probability),
                2
            ),

            "averageAiProbability": round(
                float(average_ai_probability),
                2
            )
        }
    }), 200


# =========================================================
# DELETE HISTORY
# =========================================================

@app.route(
    "/api/history/<int:history_id>",
    methods=["DELETE"]
)
def delete_history(history_id):

    user_id = session.get("user_id")


    if not user_id:

        return jsonify({
            "success": False,
            "message": "Not logged in"
        }), 401


    conn = get_db()


    cursor = conn.execute(
        """
        DELETE FROM history
        WHERE id = ?
        AND user_id = ?
        """,
        (
            history_id,
            user_id
        )
    )


    conn.commit()

    deleted = cursor.rowcount

    conn.close()


    if deleted == 0:

        return jsonify({
            "success": False,
            "message": "History record not found"
        }), 404


    return jsonify({
        "success": True,
        "message": "History deleted"
    })


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    init_db()


    print()
    print("==============================================")
    print(" AI DETECT AUTHENTICATION SERVER")
    print("==============================================")
    print()

    print("Server:")
    print("http://localhost:5003")
    print()

    print("Health:")
    print("http://localhost:5003/api/health")
    print()

    print("Signup:")
    print("http://localhost:5003/api/signup")
    print()

    print("Login:")
    print("http://localhost:5003/api/login")
    print()

    print("Current User:")
    print("http://localhost:5003/api/me")
    print()

    print("Save History:")
    print("POST http://localhost:5003/api/history")
    print()

    print("Get History:")
    print("GET http://localhost:5003/api/history")
    print()

    print("Statistics:")
    print("GET http://localhost:5003/api/stats")
    print()

    print("==============================================")
    print()


    app.run(
        host="0.0.0.0",
        port=5003,
        debug=False
    )