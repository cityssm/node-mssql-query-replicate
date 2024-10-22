import type { DestinationConfiguration, DestinationViewConfiguration, ReplicateResult, SourceConfiguration } from './types.js';
/**
 * Replicates the results of a SQL query from a source database query
 * to a destination database table.
 * @param sourceConfiguration - Source database configuration.
 * @param destinationConfiguration - Destination database configuration.
 * @returns the status of the replication.
 */
export default function replicateQueryRecordset(sourceConfiguration: SourceConfiguration, destinationConfiguration: DestinationConfiguration): Promise<ReplicateResult>;
/**
 * Replicates the results of a SQL query from a source database query
 * to a destination database table, updating a view that points to the destination table.
 * Helpful for maintaining access to the replicated data during the replication process.
 * @param sourceConfiguration - Source database configuration.
 * @param destinationConfiguration - Destination database configuration.
 * @returns the status of the replication.
 */
export declare function replicateQueryRecordsetAsView(sourceConfiguration: SourceConfiguration, destinationConfiguration: DestinationViewConfiguration): Promise<ReplicateResult>;
