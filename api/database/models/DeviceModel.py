from mongoengine import NULLIFY
from mongoengine.fields import StringField, ReferenceField
from passlib.hash import argon2
from database.database import db
from database.models.DriverModel import DriverModel


class DeviceModel(db.Document):
    meta = {
        "collection": "devices",
        'indexes': [
            {
                'fields': ['$name', "$device_id"],
                'default_language': 'english',
                'weights': {'name': 10, 'device_id': 5}
            }
        ]
    }

    driver = ReferenceField(DriverModel, null=True, reverse_delete_rule=NULLIFY)
    name = StringField(max_length=255, required=True)
    device_id = StringField(max_length=255, required=True, unique=True)
    device_pass = StringField(max_length=128, required=True)

    def save(self, *args, **kwargs):
        if not argon2.identify(self.device_pass):
            self.device_pass = argon2.using(rounds=4).hash(self.device_pass)

        return super().save(*args, **kwargs)
