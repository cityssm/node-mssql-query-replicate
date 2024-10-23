const databaseConfig = {
    server: 'localhost',
    user: 'sa',
    // eslint-disable-next-line sonarjs/no-hardcoded-credentials
    password: 'dbatools.I0',
    database: 'TestDatabase',
    options: {
        encrypt: false
    }
};
export const testConfigurations = [
    {
        testName: 'sys.objects',
        source: {
            sourceType: 'sql',
            sourceSql: 'select top 10 * from sys.objects where type = @objectType',
            sourceParameters: {
                objectType: 'S'
            },
            sourceDatabase: databaseConfig
        },
        destination: {
            destinationViewName: 'SysObjectsS',
            destinationDatabase: databaseConfig,
            dropOldTables: true
        }
    }, {
        testName: 'sys.databases',
        source: {
            sourceType: 'table',
            sourceTableName: 'sys.databases',
            sourceDatabase: databaseConfig
        },
        destination: {
            destinationViewName: 'SysDatabases',
            destinationDatabase: databaseConfig,
            dropOldTables: true
        }
    }
];
