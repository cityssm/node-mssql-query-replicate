import type { mssqlTypes } from '@cityssm/mssql-multi-pool';
/**
 *
 * @param columnMetadata - Column metadata from a source database.
 * @returns Column lists for creating and inserting records.
 */
export declare function buildColumnLists(columnMetadata: Array<mssqlTypes.IColumnMetadata[keyof mssqlTypes.IColumnMetadata]>): {
    create: string;
    insert: string;
    parameters: string;
};
