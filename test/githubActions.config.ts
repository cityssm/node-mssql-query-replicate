import type { DestinationViewConfiguration, SourceConfiguration } from '../types.js'

const databaseConfig = {
  server: 'localhost',
  user: 'sa',
  // eslint-disable-next-line sonarjs/no-hardcoded-credentials
  password: 'dbatools.I0',
  database: 'TestDatabase',
  options: {
    encrypt: false
  }
}

export const testConfigurations: Array<{
  testName: string
  source: SourceConfiguration
  destination: DestinationViewConfiguration
}> = [
  {
    testName: 'TestDatabase',
    source: {
      sourceSql: 'select top 10 * from sys.objects where o.type = @objectType',
      sourceParameters: {
        objectType: 'U'
      },
      sourceDatabase: databaseConfig
    },
    destination: {
      destinationViewName: 'SysObjectsU',
      destinationDatabase: databaseConfig,
      dropOldTables: true
    }
  }
]
