import re

def validate_email(email):
    """
    Validate email address format.
    """
    if not email:
        return False
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_regex, email))

def validate_password(password):
    """
    Validate password requirements (at least 6 characters).
    """
    if not password or len(password) < 6:
        return False
    return True

def validate_cbc_inputs(data):
    """
    Validate CBC parameters to ensure they are numeric and within plausible physiological limits.
    """
    errors = {}
    
    # Plausible limits for blood tests (safety checks, not strictly diagnostics limits)
    parameters = {
        'hemoglobin': (1.0, 30.0),
        'wbc': (100.0, 150000.0),
        'platelets': (1000.0, 2000000.0),
        'rbc': (0.5, 15.0),
        'mcv': (30.0, 180.0)
    }
    
    for param, limits in parameters.items():
        if param not in data or data[param] is None or str(data[param]).strip() == '':
            errors[param] = f"{param.upper()} is required."
            continue
            
        try:
            val = float(data[param])
            min_val, max_val = limits
            if val < min_val or val > max_val:
                errors[param] = f"{param.upper()} must be between {min_val} and {max_val}."
        except (ValueError, TypeError):
            errors[param] = f"{param.upper()} must be a valid number."
            
    return errors
