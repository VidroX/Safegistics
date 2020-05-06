from datetime import datetime


def validate_date(date_text, date_format='%Y-%m-%d') -> bool:
    try:
        datetime.strptime(date_text, date_format)
        return True
    except ValueError:
        return False
