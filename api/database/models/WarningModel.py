from datetime import datetime

from mongoengine import NULLIFY
from mongoengine.fields import StringField, ReferenceField, DateTimeField
from database.database import db
from database.models.DeviceModel import DeviceModel

WARNING_TYPES = (
    ('sleeping', 'Driver is sleeping'),
    ('other', 'Something wrong with the driver'),
)


class WarningModel(db.Document):
    meta = {
        "collection": "warnings",
        'indexes': [
            {
                'fields': ['$type', "$date_issued"],
                'default_language': 'english'
            }
        ]
    }

    device = ReferenceField(DeviceModel, null=True, reverse_delete_rule=NULLIFY)
    type = StringField(max_length=255, choices=WARNING_TYPES, required=True)
    date_issued = DateTimeField(default=datetime.now)
