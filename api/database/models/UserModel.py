from mongoengine import BooleanField

from database.models.BaseUserModel import BaseUserModel


class UserModel(BaseUserModel):
    meta = {
        'indexes': [
            {
                'fields': ['$email', "$mobile_phone", "$first_name", "$last_name", "$patronymic"],
                'default_language': 'english',
                'weights': {'email': 10, 'mobile_phone': 8, 'last_name': 6, 'patronymic': 4, 'first_name': 2}
            }
        ]
    }

    is_staff = BooleanField(required=True, default=False)
