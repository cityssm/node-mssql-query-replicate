import type { config as MSSQLConfig } from '@cityssm/mssql-multi-pool';
export interface SourceConfiguration {
    sourceSql: string;
    sourceParameters?: Record<string, unknown>;
    sourceDatabase: MSSQLConfig;
}
export interface DestinationConfiguration {
    destinationTableName: string;
    destinationDatabase: MSSQLConfig;
}
