import graphene


class AddWarningInputData(graphene.InputObjectType):
    device = graphene.ID(required=False)
    type = graphene.String(required=True)
