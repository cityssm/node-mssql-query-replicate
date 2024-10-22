// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable sonarjs/no-dead-store */

import mssql, { type mssqlTypes } from '@cityssm/mssql-multi-pool'
import { getTables, getViews } from '@cityssm/mssql-system-catalog'
import Debug from 'debug'

import { buildColumnLists } from './helpers.js'
import type {
  DestinationConfiguration,
  DestinationViewConfiguration,
  ErrorStep,
  ReplicateResult,
  SourceConfiguration
} from './types.js'

const debug = Debug('mssql-query-replicate:index')

/**
 * Replicates the results of a SQL query from a source database query
 * to a destination database table.
 * @param sourceConfiguration - Source database configuration.
 * @param destinationConfiguration - Destination database configuration.
 * @returns the status of the replication.
 */
export default async function replicateQueryRecordset(
  sourceConfiguration: SourceConfiguration,
  destinationConfiguration: DestinationConfiguration
): Promise<ReplicateResult> {
  let errorStep: '' | ErrorStep = ''
  let destinationRows = 0

  try {
    /*
     * Connect to source database
     */

    errorStep = 'source:connect'

    debug('Connecting to source database...')

    const sourcePool = await mssql.connect(sourceConfiguration.sourceDatabase)

    debug('Connected successfully.')

    /*
     * Construct request
     */

    errorStep = 'source:request'

    let sourceRequest = sourcePool.request()

    if (sourceConfiguration.sourceParameters !== undefined) {
      for (const [parameterName, parameterValue] of Object.entries(
        sourceConfiguration.sourceParameters
      )) {
        sourceRequest = sourceRequest.input(parameterName, parameterValue)
      }
    }

    /*
     * Query data
     */

    errorStep = 'source:query'

    debug('Retrieving source data...')

    const sourceResult = (await sourceRequest.query(
      sourceConfiguration.sourceSql
    )) as mssqlTypes.IResult<Record<string, unknown>>

    debug(`Source data retrieved, ${sourceResult.recordset.length} rows.`)

    /*
     * Build destination SQL statements
     */

    errorStep = 'destination:buildSql'

    debug('Building column lists...')
    const columnLists = buildColumnLists(
      Object.values(sourceResult.recordset.columns)
    )

    debug('Building destination create statement...')
    const destinationCreateSql = `create table ${destinationConfiguration.destinationTableName} (${columnLists.create})`
    debug(`Destination create statement:\n${destinationCreateSql}`)

    debug('Building destination insert statement...')
    const destinationInsertSql = `insert into ${destinationConfiguration.destinationTableName} (${columnLists.insert}) values (${columnLists.parameters})`
    debug(`Destination insert statement:\n${destinationInsertSql}`)

    /*
     * Connect to destination database
     */

    errorStep = 'destination:connect'

    debug('Connecting to destination database...')
    const destinationPool = await mssql.connect(
      destinationConfiguration.destinationDatabase
    )
    debug('Connected successfully.')

    /*
     * Create the table
     */

    errorStep = 'destination:createTable'

    debug('Creating the destination table...')

    await destinationPool.request().query(destinationCreateSql)

    debug('Destination table created successfully.')

    /*
     * Insert the data
     */

    errorStep = 'destination:insert'

    for (const row of sourceResult.recordset) {
      let destinationRequest = destinationPool.request()

      for (const [columnIndex, dataValue] of Object.values(row).entries()) {
        destinationRequest = destinationRequest.input(
          columnIndex.toString(),
          dataValue
        )
      }

      await destinationRequest.query(destinationInsertSql)

      destinationRows++
    }
  } catch (error) {
    debug(error)
    return {
      success: false,
      destinationRows,
      errorStep: errorStep as ErrorStep,
      errorMessage: error.toString()
    }
  }

  return {
    success: true,
    destinationRows,
    destinationTableName: destinationConfiguration.destinationTableName
  }
}

/**
 * Replicates the results of a SQL query from a source database query
 * to a destination database table, updating a view that points to the destination table.
 * Helpful for maintaining access to the replicated data during the replication process.
 * @param sourceConfiguration - Source database configuration.
 * @param destinationConfiguration - Destination database configuration.
 * @returns the status of the replication.
 */
export async function replicateQueryRecordsetAsView(
  sourceConfiguration: SourceConfiguration,
  destinationConfiguration: DestinationViewConfiguration
): Promise<ReplicateResult> {
  const destinationTablePrefix = `_${destinationConfiguration.destinationViewName}_`

  const destinationTableName = `${destinationTablePrefix}${Date.now()}`

  const result = await replicateQueryRecordset(sourceConfiguration, {
    destinationTableName,
    destinationDatabase: destinationConfiguration.destinationDatabase
  })

  if (!result.success) {
    return result
  }

  let errorStep: '' | ErrorStep = ''

  try {
    /*
     * Connect to destination database
     */

    errorStep = 'destination:connect'

    const destinationPool = await mssql.connect(
      destinationConfiguration.destinationDatabase
    )

    /*
     * Get destination views
     */

    const destinationViews = await getViews(destinationPool)

    const destinationHasView = destinationViews.some((possibleViewRecord) => {
      return (
        possibleViewRecord.name === destinationConfiguration.destinationViewName
      )
    })

    /*
     * Alter or create view
     */

    if (destinationHasView) {
      errorStep = 'destination:alterView'

      await destinationPool.request()
        .query(`alter view ${destinationConfiguration.destinationViewName} as
          select * from ${destinationTableName}`)
    } else {
      errorStep = 'destination:createView'

      await destinationPool.request()
        .query(`create view ${destinationConfiguration.destinationViewName} as
          select * from ${destinationTableName}`)
    }

    /*
     * Drop old tables
     */

    if (destinationConfiguration.dropOldTables ?? false) {
      const destinationTables = await getTables(destinationPool)

      const destinationTablesToDrop = destinationTables.filter(
        (possibleTableRecord) => {
          return (
            possibleTableRecord.name.startsWith(destinationTablePrefix) &&
            possibleTableRecord.name !== destinationTableName
          )
        }
      )

      errorStep = 'destination:dropTable'

      for (const destinationTableToDrop of destinationTablesToDrop) {
        debug(`Dropping table: ${destinationTableToDrop.name}`)

        await destinationPool
          .request()
          .query(`drop table ${destinationTableToDrop.name}`)
      }
    }
  } catch (error) {
    debug(error)
    return {
      success: false,
      destinationRows: result.destinationRows,
      errorStep: errorStep as ErrorStep,
      errorMessage: error.toString()
    }
  }

  return {
    success: true,
    destinationRows: result.destinationRows,
    destinationTableName
  }
}
