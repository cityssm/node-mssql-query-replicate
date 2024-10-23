# node-mssql-query-replicate

[![npm](https://img.shields.io/npm/v/@cityssm/mssql-query-replicate)](https://www.npmjs.com/package/@cityssm/mssql-query-replicate)
[![Maintainability](https://api.codeclimate.com/v1/badges/96bf1721c5f5e5c27c6c/maintainability)](https://codeclimate.com/github/cityssm/node-mssql-query-replicate/maintainability)
[![codecov](https://codecov.io/gh/cityssm/node-mssql-query-replicate/graph/badge.svg?token=XEAVOI1Q15)](https://codecov.io/gh/cityssm/node-mssql-query-replicate)
[![Coverage Testing](https://github.com/cityssm/node-mssql-query-replicate/actions/workflows/coverage.yml/badge.svg)](https://github.com/cityssm/node-mssql-query-replicate/actions/workflows/coverage.yml)
[![DeepSource](https://app.deepsource.com/gh/cityssm/node-mssql-query-replicate.svg/?label=active+issues&show_trend=true&token=YtY-ag7MTg2DFyDPqGE39IlF)](https://app.deepsource.com/gh/cityssm/node-mssql-query-replicate/)

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
