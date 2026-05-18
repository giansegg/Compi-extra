"""
Entry point local — corre el mismo Flask app que usa Vercel.
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "frontend"))

from api.index import app

if __name__ == "__main__":
    app.run(debug=True, port=5000)
