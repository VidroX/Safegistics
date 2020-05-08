import * as React from "react";
import useTitle from "../../hooks/useTitle";
import {useMutation, useQuery} from "@apollo/react-hooks";
import MaterialTable from "../../components/materialTable";
import {useTranslation, Router} from "../../i18n";
import {config} from "../../../config";
import {ButtonData, HeaderData, RowData, TableData} from "../../interfaces/materialTable";
import {getParsedUserType, UserTypes} from "../../utils/userUtils";
import { MdClose, MdVerifiedUser } from "react-icons/md";
import {localizedFormat} from "../../utils/dateUtils";
import { makeStyles } from '@material-ui/core/styles';
import {GET_USERS, USER_DELETE} from "../../apollo/queries/user";
import {UserData} from "../../interfaces/user";
import {useContext} from "react";
import TopNav from "../../contexts/TopNav";
import useUser from "../../hooks/useUser";
import { GiTruck } from "react-icons/gi";
import { RiUser2Line } from "react-icons/ri";
import ConfirmationDialog, {CONFIRMATION_ACTIONS} from "../../components/dialogs/confirmationDialog";
import AddUserDialog from "../../components/dialogs/addUserDialog";

interface DeleteUserVariables {
    userId: string;
}

interface DeleteUserState {
    deleteUser: {
        result: string;
    }
}

const Users = () => {
    const { t, i18n } = useTranslation();
    const classes = useStyles();
    const user = useUser();

    const { setCurrentTopNav } = useContext(TopNav);

    const [open, setOpen] = React.useState(false);
    const [createUserOpen, setCreateUserOpen] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);
    const [sortParam, setSortParam] = React.useState<string | null>(null);

    const { data, loading, fetchMore, refetch } = useQuery<UserData>(GET_USERS, {
        variables: {
            rowsPerPage: config.tables.rowsPerPage,
            orderBy: sortParam
        }
    });
    const [
        deleteUser,
        {
            data: deleteData,
            loading: deleteLoading,
            error: deleteError
        }
    ] = useMutation<DeleteUserState, DeleteUserVariables>(USER_DELETE);

    React.useEffect(() => {
        setCurrentTopNav({
            breadcrumbs: [
                {
                    name: t('users.users'),
                    url: '/users',
                }
            ],
            buttons: user?.isStaff ? [
                {
                    type: 'IconButton',
                    text: t('users.add'),
                    icon: 'MdAdd',
                    onPress: onAddUserPress
                }
            ] : null
        });
    }, [user, i18n.language]);

    React.useEffect(() => {
        if (!deleteLoading && !deleteError && deleteData != null) {
            window.location.reload();
        } else if (!deleteLoading && deleteError) {
            setOpen(false);
            setDeleteId(null);
        }
    }, [deleteData, deleteLoading, deleteError]);

    const headers: HeaderData[] = [
        {
            title: t('users.name'),
            query: "last_name"
        },
        {
            title: t('users.type'),
            query: "_cls"
        },
        {
            title: t('users.active'),
            query: "is_active"
        },
        {
            title: t('users.dateJoined'),
            query: "date_joined"
        },
        {
            title: t('common.actions'),
            align: 'center',
            loadingSkeleton: 'circle'
        }
    ];

    const generateTableStructure = (data: any): TableData[] => {
        let tableData: TableData[] = [];

        for (let index in data) {
            if (data.hasOwnProperty(index)) {
                const item = data[index].node;
                let userType = t('common.unknown');
                const parsedUserType = getParsedUserType(item.type);

                switch (parsedUserType) {
                    case UserTypes.DEFAULT:
                        userType = t('users.user');
                        break;
                    case UserTypes.DRIVER:
                        userType = t('users.driver');
                        break;
                }

                const rowData: RowData[] = [
                    {
                        content: item.lastName + " " + item.firstName + " " + item.patronymic
                    },
                    {
                        content: (
                            <span className={classes.userType}>
                                {parsedUserType === UserTypes.DRIVER ?
                                    <GiTruck className={classes.iconWithText} /> :
                                    <RiUser2Line className={classes.iconWithText} />
                                }
                                {userType}
                            </span>
                        )
                    },
                    {
                        content: item.isActive ?
                            <MdVerifiedUser className={classes.colorGreen} /> :
                            <MdClose className={classes.colorRed} />
                    },
                    {
                        content: localizedFormat(new Date(item.dateJoined))
                    }
                ];

                const buttonData: ButtonData[] = [
                    {
                        title: t('users.viewFullInformation'),
                        onPress: () => {
                            const url = {
                                pathname: '/users/[slug]',
                                query: {
                                    slug: item.id,
                                },
                            };
                            Router.push(url, '/users/' + item.id);
                        }
                    },
                    {
                        title: t('users.deleteUser'),
                        onPress: () => {
                            setDeleteId(item.id);
                            setOpen(true);
                        }
                    }
                ];

                tableData.push({
                    rowData: rowData,
                    buttons: buttonData
                });
            }
        }

        return tableData;
    };

    useTitle(t('users.users'));

    const handlePageChange = async (page: number, shouldLoad: boolean) => {
        if (!shouldLoad) {
            return;
        }

        await fetchMore({
            variables: {
                rowsPerPage: config.tables.rowsPerPage,
                cursor: data?.allUsers.pageInfo.endCursor,
                orderBy: sortParam
            },
            updateQuery: (previousQueryResult, { fetchMoreResult }): UserData => {
                if (fetchMoreResult == null) {
                    return previousQueryResult;
                }

                const newEdges = fetchMoreResult.allUsers.edges;
                const pageInfo = fetchMoreResult.allUsers.pageInfo;

                return newEdges.length
                    ? {
                        allUsers: {
                            totalCount: previousQueryResult.allUsers.totalCount,
                            __typename: previousQueryResult.allUsers.__typename,
                            edges: [...previousQueryResult.allUsers.edges, ...newEdges],
                            pageInfo
                        }
                    }
                    : previousQueryResult;
            }
        });
    };

    const handleSort = async (sortQuery: string | null, item: HeaderData) => {
        if (sortQuery != null) {
            setSortParam(sortQuery);

            await refetch({
                rowsPerPage: config.tables.rowsPerPage,
                cursor: data?.allUsers.pageInfo.endCursor,
                orderBy: sortParam
            });
        } else {
            setSortParam(null);
        }
    };

    const onAddUserPress = () => {
        setCreateUserOpen(true);
    };

    const onConfirmDialogAction = async (status: number) => {
        if (status === CONFIRMATION_ACTIONS.CONFIRM) {
            if (deleteId != null) {
                await deleteUser({
                    variables: {
                        userId: deleteId
                    }
                })
            }
        } else {
            setDeleteId(null);
            setOpen(false);
        }
    };

    const onUserCreateClose = (shouldRefresh: boolean) => {
        if (shouldRefresh) {
            window.location.reload();
        }

        setCreateUserOpen(false);
    };

    return (
        <>
            <ConfirmationDialog open={open} title={t('users.deleteUser')} onAction={onConfirmDialogAction} />
            <AddUserDialog open={createUserOpen} onClose={onUserCreateClose} />
            <MaterialTable
                data={generateTableStructure(data?.allUsers.edges)}
                headers={headers}
                onPageChange={handlePageChange}
                loading={loading}
                count={data?.allUsers.totalCount}
                onSort={handleSort}
            />
        </>
    );
};

const useStyles = makeStyles((theme) => ({
    colorGreen: {
        color: theme.palette.success.light
    },
    colorRed: {
        color: theme.palette.error.light
    },
    userType: {
        display: 'flex',
        alignItems: 'center'
    },
    iconWithText: {
        marginRight: 8,
        color: theme.palette.secondary.light
    }
}));

export default Users;
