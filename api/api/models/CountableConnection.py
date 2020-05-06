from graphene import Int
from graphene.relay import Connection


class CountableConnection(Connection):
    class Meta:
        abstract = True

    total_count = Int()

    def resolve_total_count(root, info, **kwargs):
        return len(root.iterable)
