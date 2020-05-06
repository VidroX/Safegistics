import * as React from "react";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer, TableFooter,
    TableHead, TablePagination,
    TableRow
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {HeaderData, MaterialTableProps, SortItem} from "../interfaces/materialTable";
import MenuList from "./menuList";
import {config} from "../../config";
import {Skeleton} from "@material-ui/lab";
import {useTranslation} from "../i18n";
import { IoIosArrowRoundDown, IoIosArrowRoundUp } from "react-icons/io";
import theme from "../theme";


const MaterialTable = (props: MaterialTableProps) => {
    const { data, headers, onPageChange, onSort, loading, count, dataPerPage } = props;

    const [latestLoadedPage, setLatestLoadedPage] = React.useState(0);
    const [sortItem, setSortItem] = React.useState<SortItem | null>(null);
    const [shouldReset, setShouldReset] = React.useState<boolean>(false);

    const itemsAmount = count != null ? count : data.length;
    const rowsPerPage = dataPerPage != null ? dataPerPage : config.tables.rowsPerPage;

    const [page, setPage] = React.useState(0);

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, itemsAmount - page * rowsPerPage);

    const classes = useStyles();
    const { t } = useTranslation();

    const handleChangePage = (event: React.SyntheticEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);

        if (onPageChange != null) {
            if (latestLoadedPage < newPage) {
                setLatestLoadedPage(newPage);
                onPageChange(newPage, true);
            } else {
                onPageChange(newPage, false);
            }
        }
    };

    const handleHeaderItemClick = (e: React.SyntheticEvent<HTMLTableHeaderCellElement>) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        const index = e.currentTarget.cellIndex;
        const item = headers[index];
        const query = item.query;

        if (onSort != null && query != null) {
            let sortQuery: string | null =
                sortItem != null && query.includes(sortItem.defaultQuery) && sortItem?.sortQuery[0] === '-' ?
                    query : "-" + query;

            if (sortItem?.defaultQuery !== query || sortItem?.sortQuery !== sortQuery) {
                setPage(0);
                setLatestLoadedPage(0);
            }

            setSortItem({
                defaultQuery: query,
                sortQuery
            });

            if (sortItem?.defaultQuery === sortQuery) {
                setShouldReset(true);
            }

            if (shouldReset) {
                setSortItem(null);
                setShouldReset(false);
                sortQuery = null;
            }

            onSort(sortQuery, item);
        }
    };

    const renderTableBody = () => {
        if (loading) {
            const dummyRows = [];

            for (let i = 0; i < rowsPerPage; i++) {
                dummyRows.push(
                    <TableRow key={'dummy-row-' + i} style={{ height: config.tables.rowHeight }}>
                        { headers.map((header, index) =>
                            <TableCell
                                align={header.align != null ? header.align : "inherit"}
                                key={'dummy-cell-' + index}
                                component="th"
                                scope="row"
                            >
                                <Skeleton
                                    animation="wave"
                                    variant={header.loadingSkeleton != null ? header.loadingSkeleton : "text"}
                                    className={classes.centeredMargin}
                                    width={header.loadingSkeleton === "circle" ? 24 : "inherit"}
                                    height={header.loadingSkeleton === "circle" ? 24 : "inherit"}
                                />
                            </TableCell>
                        )}
                    </TableRow>
                );
            }

            return dummyRows;
        }

        return (
            <>
                {(rowsPerPage > 0
                    ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : data).map((row, index) => (
                    <TableRow key={'row-' + index}>
                        {
                            row.rowData.map((rData, rowIndex) => (
                                <TableCell
                                    align={rData.align != null ? rData.align : "inherit"}
                                    component="th"
                                    scope="row"
                                    key={'cell-' + rowIndex}
                                >
                                    {rData.content}
                                </TableCell>
                            ))
                        }
                        { row.buttons != null && row.buttons.length > 0 && (
                            <TableCell component="th" scope="row" key='cell-actions'>
                                <MenuList buttons={row.buttons} className={classes.centeredMargin} />
                            </TableCell>
                        )}
                    </TableRow>
                ))}
                {emptyRows > 0 && (
                    <TableRow style={{ height: config.tables.rowHeight * emptyRows }}>
                        <TableCell colSpan={6} />
                    </TableRow>
                )}
            </>
        );
    };

    const renderSortIcon = (header: HeaderData) => {
        if (!sortItem || header.query !== sortItem.defaultQuery) {
            return;
        }

        const direction = sortItem.sortQuery[0] === "-" ? "desc" : "asc";

        return direction === "asc" ? <IoIosArrowRoundUp color={theme.palette.secondary.light} /> :
            <IoIosArrowRoundDown color={theme.palette.secondary.light} />;
    };

    return (
        <TableContainer className={classes.table} component={Paper}>
            <Table aria-label="Material Table">
                <TableHead>
                    <TableRow style={{ height: config.tables.headerHeight }}>
                        {
                            headers.map((header, index) => (
                                <TableCell
                                    key={'header-' + index}
                                    align={header.align != null ? header.align : "inherit"}
                                    onClick={handleHeaderItemClick}
                                    className={header.query != null ? classes.selectable : classes.nonSelectable}
                                >
                                    { header.title }
                                    { renderSortIcon(header) }
                                </TableCell>
                            ))
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    { renderTableBody() }
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            className={classes.rightAlign}
                            rowsPerPageOptions={[]}
                            count={itemsAmount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            backIconButtonProps={{
                                disabled: loading || (rowsPerPage * page) <= 0 || itemsAmount <= rowsPerPage,
                                color: "secondary"
                            }}
                            nextIconButtonProps={{
                                disabled: loading ||
                                    (rowsPerPage * (page + 1)) >= itemsAmount || itemsAmount <= rowsPerPage,
                                color: "secondary"
                            }}
                            labelDisplayedRows={
                                ({ from, to, count }) => {
                                    if (loading) {
                                        return <Skeleton width={96} animation="wave" />;
                                    }

                                    return '' + from + '-' + to + ' ' + t('table.from') + ' ' + count;
                                }
                            }
                            SelectProps={{
                                inputProps: { 'aria-label': 'rows per page' },
                                native: true,
                            }}
                            onChangePage={handleChangePage}
                        />
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
    );
};

const useStyles = makeStyles((theme) => ({
    centeredMargin: {
        display: 'flex',
        margin: '0 auto',
    },
    selectable: {
        cursor: 'pointer',
        userSelect: 'none',
    },
    nonSelectable: {
        cursor: 'default',
        userSelect: 'none',
    },
    rightAlign: {
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        margin: '0 auto'
    },
    table: {
        minWidth: 600
    }
}));


export default MaterialTable;
