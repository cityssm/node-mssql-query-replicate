import assert from 'node:assert'
import { after, describe, it } from 'node:test'

import { releaseAll } from '@cityssm/mssql-multi-pool'

import replicateQueryRecordset from '../index.js'

import { testConfigurations } from './config.js'

await describe('mssql-query-replicate', async () => {
  after(() => {
    void releaseAll()
  })

  for (const testConfiguration of testConfigurations) {
    await it(`Replicates ${testConfiguration.testName}`, async () => {
      const result = await replicateQueryRecordset(
        testConfiguration.source,
        testConfiguration.destination
      )

      assert.ok(result)
    })
  }
})
