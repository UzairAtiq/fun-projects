"""
Authentication module for Mac Control application.
Handles token-based authentication for API endpoints.
"""
from functools import wraps
from flask import request, abort, jsonify
from app.config import Config


def check_token():
    """
    Verify authentication token from request headers or query parameters.
    
    Returns:
        bool: True if token is valid, False otherwise
    """
    token = request.headers.get("X-Auth-Token") or request.args.get("token")
    return token and token == Config.AUTH_TOKEN


def require_auth(f):
    """
    Decorator to require authentication for routes.
    
    Args:
        f: The route function to protect
        
    Returns:
        Decorated function that checks authentication
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not check_token():
            return jsonify({
                "error": "Unauthorized",
                "message": "Valid authentication token required"
            }), 401
        return f(*args, **kwargs)
    return decorated_function


def get_token_for_url():
    """
    Get the current authentication token for URL generation.
    
    Returns:
        str: The authentication token
    """
    return Config.AUTH_TOKEN
