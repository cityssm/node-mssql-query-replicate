import type { mssqlTypes } from '@cityssm/mssql-multi-pool';
export interface SourceConfiguration {
    sourceSql: string;
    sourceParameters?: Record<string, unknown>;
    sourceDatabase: mssqlTypes.config;
}
export interface DestinationConfiguration {
    destinationTableName: string;
    destinationDatabase: mssqlTypes.config;
}
