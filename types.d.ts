import type { mssqlTypes } from '@cityssm/mssql-multi-pool';
interface SourceQueryConfiguration {
    sourceType: 'sql';
    sourceSql: string;
    sourceParameters?: Record<string, unknown>;
}
interface SourceTableConfiguration {
    sourceType: 'table';
    sourceTableName: string;
}
export type SourceConfiguration = (SourceQueryConfiguration | SourceTableConfiguration) & {
    sourceDatabase: mssqlTypes.config;
};
export interface DestinationConfiguration {
    destinationTableName: string;
    destinationDatabase: mssqlTypes.config;
}
export interface DestinationViewConfiguration {
    destinationViewName: string;
    destinationDatabase: mssqlTypes.config;
    dropOldTables?: boolean;
}
interface ReplicateResultSuccess {
    success: true;
    destinationRows: number;
    destinationTableName: string;
}
export type ErrorStep = 'source:connect' | 'source:request' | 'source:query' | 'destination:buildSql' | 'destination:connect' | 'destination:createTable' | 'destination:insert' | 'destination:createView' | 'destination:alterView' | 'destination:dropTable';
interface ReplicateResultError {
    success: false;
    destinationRows: number;
    errorStep: ErrorStep;
    errorMessage: string;
}
export type ReplicateResult = ReplicateResultSuccess | ReplicateResultError;
export {};
