import assert from 'node:assert';
import { after, describe, it } from 'node:test';
import { releaseAll } from '@cityssm/mssql-multi-pool';
import { replicateQueryRecordsetAsView } from '../index.js';
import { testConfigurations } from './config.js';
await describe('mssql-query-replicate', async () => {
    after(() => {
        void releaseAll();
    });
    for (const testConfiguration of testConfigurations) {
        const replicateTestFunction = async () => {
            const result = await replicateQueryRecordsetAsView(testConfiguration.source, testConfiguration.destination);
            console.log(result);
            assert.ok(result.success);
            assert.ok(result.destinationRows > 0);
        };
        await it(`Replicates ${testConfiguration.testName} to a view (creates new view)`, replicateTestFunction);
        await it(`Replicates ${testConfiguration.testName} to a view again (alters existing view)`, replicateTestFunction);
    }
});
