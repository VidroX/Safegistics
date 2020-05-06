import {ReactNode} from "react";

export interface ButtonData {
    title: string;
    onPress?: () => void;
}

export interface RowData {
    content: string | ReactNode;
    align?: "inherit" | "left" | "center" | "right" | "justify";
}

export interface TableData {
    rowData: RowData[];
    buttons?: ButtonData[];
}

export interface HeaderData {
    title: string;
    query?: string;
    align?: "inherit" | "left" | "center" | "right" | "justify";
    loadingSkeleton?: "text" | "rect" | "circle";
}

export interface MaterialTableProps {
    data: TableData[];
    headers: HeaderData[];
    onPageChange?: (page: number, shouldLoad: boolean) => void;
    onSort?: (sortQuery: string | null, item: HeaderData) => void;
    loading?: boolean;
    count?: number;
    dataPerPage?: number;
}

export interface SortItem {
    defaultQuery: string;
    sortQuery: string;
}
