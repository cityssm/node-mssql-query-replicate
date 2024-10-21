import type { mssqlTypes } from '@cityssm/mssql-multi-pool';
export declare function buildColumnLists(columnMetadata: Array<mssqlTypes.IColumnMetadata[keyof mssqlTypes.IColumnMetadata]>): {
    create: string;
    insert: string;
    parameters: string;
};
