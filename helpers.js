/**
 *
 * @param columnMetadata - Column metadata from a source database.
 * @returns Column lists for creating and inserting records.
 */
export function buildColumnLists(columnMetadata) {
    const create = [];
    const insert = [];
    const parameters = [];
    for (const [columnIndex, column] of Object.entries(columnMetadata)) {
        create.push(columnMetadataToCreateString(column));
        insert.push(`[${column.name}]`);
        parameters.push(`@${columnIndex}`);
    }
    return {
        create: create.join(', '),
        insert: insert.join(', '),
        parameters: parameters.join(', ')
    };
}
function columnMetadataToCreateString(columnMetadata) {
    console.log(columnMetadata);
    const createStringPieces = [`[${columnMetadata.name}]`];
    const columnType = (typeof columnMetadata.type === 'function'
        ? columnMetadata.type()
        : columnMetadata.type);
    const columnTypeName = columnType === undefined
        ? 'VarChar'
        : columnType.type.name;
    switch (columnTypeName) {
        case 'Char':
        case 'NChar':
        case 'VarChar':
        case 'NVarChar':
        case 'VarBinary': {
            createStringPieces.push(`${columnTypeName} (${columnMetadata.length === 0 || columnMetadata.length > 8000 ? 'max' : columnMetadata.length})`);
            break;
        }
        case 'Decimal':
        case 'Numeric': {
            if (columnMetadata.precision !== undefined &&
                columnMetadata.scale !== undefined) {
                createStringPieces.push(`${columnTypeName} (${columnMetadata.precision}, ${columnMetadata.scale})`);
            }
            else {
                createStringPieces.push(`VarChar (${columnMetadata.length + 1})`);
            }
            break;
        }
        case 'Time':
        case 'DateTime2':
        case 'DateTimeOffset': {
            createStringPieces.push(`${columnTypeName} (${columnMetadata.scale})`);
            break;
        }
        default: {
            createStringPieces.push(columnTypeName);
        }
    }
    if (!columnMetadata.nullable) {
        createStringPieces.push('not null');
    }
    return createStringPieces.join(' ');
}
