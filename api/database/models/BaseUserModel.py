from datetime import datetime

from mongoengine.fields import EmailField, StringField, DateField, DateTimeField, BooleanField
from passlib.hash import argon2

from database.database import db


class IncorrectPasswordException(Exception):
    """Raised when the password doesn't match the one in the Database"""
    pass


class BaseUserModel(db.Document):
    meta = {
        "collection": "users",
        "allow_inheritance": True,
    }

    email = EmailField(unique=True)
    password = StringField(max_length=128, required=True)
    mobile_phone = StringField(max_length=255, unique=True, required=True)
    first_name = StringField(max_length=255, required=True)
    last_name = StringField(max_length=255, required=True)
    patronymic = StringField(max_length=255, null=True)
    birthday = DateField(required=True)
    date_joined = DateTimeField(default=datetime.now)
    is_active = BooleanField(default=True)

    def change_password(self, old_password, new_password):
        if not argon2.identify(self.password):
            self.password = argon2.using(rounds=4).hash(self.password)

        if not argon2.verify(old_password, self.password):
            raise IncorrectPasswordException

        if not argon2.identify(new_password):
            new_password = argon2.using(rounds=4).hash(new_password)
            self.update(password=new_password)

    def save(self, *args, **kwargs):
        if not argon2.identify(self.password):
            self.password = argon2.using(rounds=4).hash(self.password)

        return super().save(*args, **kwargs)

    def validate(self, clean=True):
        if not argon2.identify(self.password):
            self.password = argon2.using(rounds=4).hash(self.password)

        return super().validate(clean)

    def clean(self):
        if not argon2.identify(self.password):
            self.password = argon2.using(rounds=4).hash(self.password)

        super().clean()
