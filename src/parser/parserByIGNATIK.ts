import {TableRow, Token} from '@common/types'

const parseString = (tokens: Token[], table: TableRow[]): string => {
    let pointer = 0
    let stack: number[] = [1] // Начинаем с первой строки таблицы
    let trace: string[] = []

    // Начинаем с обработки первого токена
    let currentToken = tokens[pointer] ?? {type: 'EOF', lexeme: '', position: {line: -1, column: -1}}

    // Если в стеке нет элементов, это ошибка
    if (stack.length === 0) return `Error: Stack is empty`

    // Начинаем обрабатывать элементы стека
    while (stack.length > 0) {
        let tableIndex = stack.pop()
        if (tableIndex === undefined) return 'Error: Stack underflow'

        let row = table.find(r => r.index === tableIndex)
        if (!row) return `Error: No matching table row for index ${tableIndex}`

        trace.push(`Stack: [${stack.join(', ')}], Reading: '${currentToken.lexeme}', Processing: '${row.symbol}'`)

        // Если символ в guidingSymbols совпадает с лексемой текущего токена
        if (row.guidingSymbols.has(currentToken.lexeme)) {
            if (row.isShift) pointer++ // Продвигаем указатель, если есть сдвиг
            if (row.stackPushIndex !== null) stack.push(row.stackPushIndex) // Добавляем в стек, если указано
            if (row.pointer !== null) stack.push(row.pointer) // Переходим к следующему шагу
            if (pointer === tokens.length) return `OK\nTrace:\n${trace.join('\n')}`
        } else if (currentToken.type == 'EOF') {
            return `OK\nTrace:\n${trace.join('\n')}`
        }
        // Если символ не подходит и isError == true, пропускаем этот вариант
        else if (row.isError) {
            continue
        }
        // Если символ не подходит, но isError == false и нет указателя, пробуем следующий вариант
        else if (!row.isError) {
            let nextRow = table.find(r => r.index === tableIndex + 1) // Берём следующую строку
            if (nextRow) stack.push(nextRow.index)
        }
        // Если ничего не подошло — ошибка
        else {
            return `Error: Unexpected '${currentToken.lexeme}', expected one of [${Array.from(row.guidingSymbols).join(', ')}]`
        }

        currentToken = tokens[pointer] ?? {type: 'EOF', lexeme: '', position: {line: -1, column: -1}}
    }

    // Если указатель не дошёл до конца строки, значит входной текст обработан не полностью
    return pointer === tokens.length ? `OK\nTrace:\n${trace.join('\n')}` : `Error\nTrace:\n${trace.join('\n')}`
}

export {
    parseString,
}
