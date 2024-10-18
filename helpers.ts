import type { mssql } from '@cityssm/mssql-multi-pool'

export function buildColumnLists(
  columnMetadata: Array<mssql.IColumnMetadata[keyof mssql.IColumnMetadata]>
): { create: string; insert: string; parameters: string } {
  const create: string[] = []
  const insert: string[] = []
  const parameters: string[] = []

  for (const [columnIndex, column] of Object.entries(columnMetadata)) {
    create.push(columnMetadataToCreateString(column))
    insert.push(`[${column.name}]`)
    parameters.push(`@${columnIndex}`)
  }

  return {
    create: create.join(', '),
    insert: insert.join(', '),
    parameters: parameters.join(', ')
  }
}

function columnMetadataToCreateString(
  columnMetadata: mssql.IColumnMetadata[keyof mssql.IColumnMetadata]
): string {
  const createStringPieces = [`[${columnMetadata.name}]`]

  const columnType =
    typeof columnMetadata.type === 'function'
      ? columnMetadata.type()
      : columnMetadata.type

  // eslint-disable-next-line @typescript-eslint/prefer-destructuring
  const columnTypeName = (columnType.type as { name: keyof typeof mssql.TYPES })
    .name

  switch (columnTypeName) {
    case 'Char':
    case 'NChar':
    case 'VarChar':
    case 'NVarChar':
    case 'VarBinary': {
      createStringPieces.push(
        `${columnTypeName} (${columnMetadata.length > 8000 ? 'max' : columnMetadata.length})`
      )
      break
    }

    case 'Decimal':
    case 'Numeric': {
      createStringPieces.push(
        `${columnTypeName} (${columnMetadata.precision}, ${columnMetadata.scale})`
      )
      break
    }

    case 'Time':
    case 'DateTime2':
    case 'DateTimeOffset': {
      createStringPieces.push(`${columnTypeName} (${columnMetadata.scale})`)
      break
    }

    default: {
      createStringPieces.push(columnTypeName)
    }
  }

  if (columnMetadata.nullable === false) {
    createStringPieces.push('not null')
  }

  return createStringPieces.join(' ')
}
