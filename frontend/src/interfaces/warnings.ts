import {Device} from "./devices";

export interface Warning {
    id: string;
    device?: Device | null;
    type: string;
    dateIssued: string;
}

export interface WarningEdge {
    node: Warning;
    cursor: string;
}

export interface WarningData {
    warnings: {
        __typename: string;
        totalCount: number;
        edges: WarningEdge[];
        pageInfo: {
            endCursor: string;
            hasNextPage: boolean;
        }
    };
}

export interface AddWarningVariables {
    device: string;
    type: string;
}

export interface AddWarningState {
    addWarning: {
        result: string;
        warning: Warning;
    }
}
