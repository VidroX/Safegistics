import graphene

from flask_jwt_extended import jwt_required, get_jwt_identity
from graphql import GraphQLError
from graphql_relay import from_global_id
from mongoengine import ValidationError

from api.decoratos.AuthDecorator import device_or_admin_only
from api.models.Warning import WarningGraphModel
from api.mutations.types.WarningTypes import AddWarningInputData
from api.statuses import STATUS_CODE
from database.models.DeviceModel import DeviceModel
from database.models.WarningModel import WarningModel


class AddWarning(graphene.Mutation):
    class Arguments:
        warning_data = AddWarningInputData(required=True)

    result = graphene.String()
    warning = graphene.Field(WarningGraphModel, required=False)

    @staticmethod
    @jwt_required
    @device_or_admin_only
    def mutate(self, info, warning_data=None):
        identity = get_jwt_identity()
        payload_device_id = identity["id"] or None
        device = None

        if warning_data.device is not None or payload_device_id is not None:
            if warning_data.device is None:
                device_id = from_global_id(payload_device_id)[1]
            else:
                device_id = from_global_id(warning_data.device)[1]
            device = DeviceModel.objects.get(id=device_id)

        print(warning_data.device)
        print(payload_device_id)
        if (warning_data.device is not None or payload_device_id is not None) and device is None:
            raise GraphQLError(STATUS_CODE[300], extensions={'code': 300})

        warning = WarningModel(
            device=device,
            type=warning_data.type
        )

        try:
            warning.save()
        except ValidationError:
            raise GraphQLError(STATUS_CODE[301], extensions={'code': 301})
        except Exception:
            raise GraphQLError(STATUS_CODE[0], extensions={'code': 0})

        return AddWarning(warning=warning, result="Warning has been successfully added to the device.")
