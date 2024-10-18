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
    const createStringPieces = [`[${columnMetadata.name}]`];
    const columnType = typeof columnMetadata.type === 'function'
        ? columnMetadata.type()
        : columnMetadata.type;
    // eslint-disable-next-line @typescript-eslint/prefer-destructuring
    const columnTypeName = columnType.type
        .name;
    switch (columnTypeName) {
        case 'Char':
        case 'NChar':
        case 'VarChar':
        case 'NVarChar':
        case 'VarBinary': {
            createStringPieces.push(`${columnTypeName} (${columnMetadata.length > 8000 ? 'max' : columnMetadata.length})`);
            break;
        }
        case 'Decimal':
        case 'Numeric': {
            createStringPieces.push(`${columnTypeName} (${columnMetadata.precision}, ${columnMetadata.scale})`);
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
    if (columnMetadata.nullable === false) {
        createStringPieces.push('not null');
    }
    return createStringPieces.join(' ');
}
