import mssql, { type IResult } from '@cityssm/mssql-multi-pool'
import Debug from 'debug'

import { buildColumnLists } from './helpers.js'
import type { DestinationConfiguration, SourceConfiguration } from './types.js'

const debug = Debug('mssql-query-replicate:index')

export default async function replicateQueryRecordset(
  sourceConfiguration: SourceConfiguration,
  destinationConfiguration: DestinationConfiguration
): Promise<boolean> {
  try {
    debug('Connecting to source database...')
    const sourcePool = await mssql.connect(sourceConfiguration.sourceDatabase)
    debug('Connected successfully.')

    let sourceRequest = sourcePool.request()

    if (sourceConfiguration.sourceParameters !== undefined) {
      for (const [parameterName, parameterValue] of Object.entries(
        sourceConfiguration.sourceParameters
      )) {
        sourceRequest = sourceRequest.input(parameterName, parameterValue)
      }
    }

    debug('Retrieving source data...')
    const sourceResult = (await sourceRequest.query(
      sourceConfiguration.sourceSql
    )) as IResult<Record<string, unknown>>
    debug(`Source data retrieved, ${sourceResult.recordset.length} rows.`)

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

    debug('Connecting to destination database...')
    const destinationPool = await mssql.connect(
      destinationConfiguration.destinationDatabase
    )
    debug('Connected successfully.')

    debug('Creating the destination table...')
    await destinationPool.request().query(destinationCreateSql)
    debug('Destination table created successfully.')

    for (const row of sourceResult.recordset) {
      let destinationRequest = destinationPool.request()

      for (const [columnIndex, dataValue] of Object.values(row).entries()) {
        destinationRequest = destinationRequest.input(
          columnIndex.toString(),
          dataValue
        )
      }

      await destinationRequest.query(destinationInsertSql)
    }
  } catch (error) {
    debug(error)
    return false
  }

  return true
}
