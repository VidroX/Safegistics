STATUS_CODE = {
    # xx -> General codes
    0: "An unknown error has been caught while performing the query",
    1: "Access denied",
    2: "You don't have enough rights to perform this request",
    # 1xx -> Auth codes
    100: "Incorrect E-Mail or password",
    101: "You're trying to register with an unknown user type",
    102: "User with such email or mobile phone already exists",
    103: "User has been successfully deleted from the system",
    104: "User with provided ID not found",
    105: 'You cannot delete this user',
    # 2xx -> Device codes
    200: "Device with provided ID not found",
    201: "Device has been successfully removed from the system",
    202: "Device with the same id already exists",
    203: "You're trying to register device to an unknown driver",
    204: "Incorrect device id or password",
    # 3xx -> Warning codes
    300: "You are trying to add warning from an unknown device",
    301: "Unknown warning type"
}
