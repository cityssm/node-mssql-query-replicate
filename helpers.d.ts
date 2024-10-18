import type { mssql } from '@cityssm/mssql-multi-pool';
export declare function buildColumnLists(columnMetadata: Array<mssql.IColumnMetadata[keyof mssql.IColumnMetadata]>): {
    create: string;
    insert: string;
    parameters: string;
};
