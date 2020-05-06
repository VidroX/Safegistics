from api.mutations.types.AuthTypes import USER_TYPES, DEVICE_TYPES


def check_user_integrity(identity) -> bool:
    if not isinstance(identity, dict):
        return False

    user_type = identity.get('type', None)
    user_id = identity.get('id', None)

    if user_type is None or user_id is None:
        return False

    if user_type in USER_TYPES:
        return identity.get('email', None) is not None and identity.get('is_staff', None) is not None
    elif user_type in DEVICE_TYPES:
        return identity.get('device_id', None) is not None

    return False

