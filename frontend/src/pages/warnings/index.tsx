import * as React from "react";
import useTitle from "../../hooks/useTitle";
import {useQuery} from "@apollo/react-hooks";
import MaterialTable from "../../components/materialTable";
import {useTranslation} from "../../i18n";
import {config} from "../../../config";
import {HeaderData, RowData, TableData} from "../../interfaces/materialTable";
import {localizedFormat} from "../../utils/dateUtils";
import { makeStyles } from '@material-ui/core/styles';
import {useContext} from "react";
import TopNav from "../../contexts/TopNav";
import useUser from "../../hooks/useUser";
import {WarningData} from "../../interfaces/warnings";
import {GET_WARNINGS} from "../../apollo/queries/warnings";
import { TiWarningOutline } from "react-icons/ti";

const Warnings = () => {
    const { t, i18n } = useTranslation();
    const classes = useStyles();
    const user = useUser();

    const { setCurrentTopNav } = useContext(TopNav);

    const [sortParam, setSortParam] = React.useState<string | null>(null);

    const { data, loading, fetchMore, refetch } = useQuery<WarningData>(GET_WARNINGS, {
        variables: {
            rowsPerPage: config.tables.rowsPerPage,
            orderBy: sortParam
        }
    });

    React.useEffect(() => {
        setCurrentTopNav({
            breadcrumbs: [
                {
                    name: t('warnings.title'),
                    url: '/users',
                }
            ],
            buttons: []
        });
    }, [user, i18n.language]);

    const headers: HeaderData[] = [
        {
            title: t('warnings.dateIssued'),
            query: "date_issued"
        },
        {
            title: t('warnings.severity'),
            query: "type"
        },
        {
            title: t('warnings.type'),
            query: "type"
        },
        {
            title: t('warnings.driverName'),
            query: "device"
        },
        {
            title: t('warnings.deviceId'),
            query: "device"
        }
    ];

    const generateTableStructure = (data: any): TableData[] => {
        let tableData: TableData[] = [];

        for (let index in data) {
            if (data.hasOwnProperty(index)) {
                const item = data[index].node;

                const rowData: RowData[] = [
                    {
                        content: localizedFormat(new Date(item.dateIssued))
                    },
                    {
                        content: item.type === "sleeping" ?
                            <TiWarningOutline className={classes.colorSevere} /> :
                            <TiWarningOutline className={classes.colorModerate} />
                    },
                    {
                        content: item.type === "sleeping" ?
                            t('warnings.sleeping') :
                            t('warnings.other')
                    },
                    {
                        content: item.device != null && item.device.driver != null ?
                                    item.device.driver.lastName + " " +
                                    item.device.driver.firstName + " " +
                                    item.device.driver.patronymic :
                                item.device != null ?
                                    t('warnings.noDriverDevice') :
                                    t('warnings.noDevice')
                    },
                    {
                        content: item.device?.deviceId
                    }
                ];

                tableData.push({
                    rowData: rowData
                });
            }
        }

        return tableData;
    };

    useTitle(t('warnings.title'));

    const handlePageChange = async (page: number, shouldLoad: boolean) => {
        if (!shouldLoad) {
            return;
        }

        await fetchMore({
            variables: {
                rowsPerPage: config.tables.rowsPerPage,
                cursor: data?.warnings.pageInfo.endCursor,
                orderBy: sortParam
            },
            updateQuery: (previousQueryResult, { fetchMoreResult }): WarningData => {
                if (fetchMoreResult == null) {
                    return previousQueryResult;
                }

                const newEdges = fetchMoreResult.warnings.edges;
                const pageInfo = fetchMoreResult.warnings.pageInfo;

                return newEdges.length
                    ? {
                        warnings: {
                            totalCount: previousQueryResult.warnings.totalCount,
                            __typename: previousQueryResult.warnings.__typename,
                            edges: [...previousQueryResult.warnings.edges, ...newEdges],
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
                cursor: data?.warnings.pageInfo.endCursor,
                orderBy: sortParam
            });
        } else {
            setSortParam(null);
        }
    };

    return (
        <MaterialTable
            data={generateTableStructure(data?.warnings.edges)}
            headers={headers}
            onPageChange={handlePageChange}
            loading={loading}
            count={data?.warnings.totalCount}
            onSort={handleSort}
        />
    );
};

const useStyles = makeStyles((theme) => ({
    colorSevere: {
        color: "#ff4b5a"
    },
    colorModerate: {
        color: "#ff9341"
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

export default Warnings;
