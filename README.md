# node-mssql-query-replicate

A simple way to replicate the results of a SQL Server query from database into a table in another.

Helpful for creating a copy of a select table for backup, reporting, or development purposes.

## Installation

```sh
npm install @cityssm/mssql-query-replicate
```

## Usage

```javascript
import { replicateQueryRecordsetAsView } from '@cityssm/mssql-query-replicate'

const result = await replicateQueryRecordsetAsView(
  {
    sourceType: 'sql',
    sourceSql: `SELECT w.workOrderNumber,
        w.workOrderDate,
        w.workOrderDescription, s.workOrderStatus
      FROM WorkOrders w
      LEFT JOIN WorkOrderStatuses s
        ON w.workOrderStatusId = s.workOrderStatusId
      WHERE year(w.workOrderDate) = @yearParameter`,
    sourceParameters: {
      yearParameter: new Date().getFullYear()
    },
    sourceDatabase: {
      server: 'productionServer',
      user: 'user',
      password: 'p@ssword',
      database: 'WorkOrderSystem'
    }
  },
  {
    destinationViewName: 'WorkOrdersThisYear',
    destinationDatabase: {
      server: 'devServer',
      user: 'devUser',
      password: 'passw0rd',
      database: 'TestDB'
    },
    dropOldTables: true
  }
)

console.log(result)

/*
  {
    success: true,
    destinationRows: 1337,
    destinationTableName: '_WorkOrdersThisYear_1729614386783'
  }
 */
```

## Related Projects

[@cityssm/mssql-multi-pool](https://www.npmjs.com/package/@cityssm/mssql-multi-pool)<br />
A simple way to manage connections to multiple SQL Server databases using the Node.js Tedious package ([node-mssql](https://www.npmjs.com/package/mssql)).

[@cityssm/mssql-system-catalog](https://www.npmjs.com/package/@cityssm/mssql-system-catalog)<br />
Helper functions to query a SQL Server database's system catalog.
