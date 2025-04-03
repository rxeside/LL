import {TableRow} from './types'

const parseString = (input: string, table: TableRow[]): string => {
    let pointer = 0
    let stack: number[] = [1] // Начинаем с первой строки таблицы
    let trace: string[] = []

    while (stack.length > 0) {
        let tableIndex = stack.pop()
        if (tableIndex === undefined) return 'Error: Stack underflow'

        let row = table.find(r => r.index === tableIndex)
        if (!row) return `Error: No matching table row for index ${tableIndex}`

        let currentChar = input[pointer] ?? '#' // Если строка кончилась, рассматриваем '#'
        trace.push(`Stack: [${stack.join(', ')}], Reading: '${currentChar}', Processing: '${row.symbol}'`)

        if (row.guidingSymbols.has(currentChar)) {
            if (row.isShift) pointer++ // Продвигаем указатель, если есть сдвиг
            if (row.stackPushIndex !== null) stack.push(row.stackPushIndex) // Добавляем в стек, если указано
            if (row.pointer !== null) stack.push(row.pointer) // Переходим к следующему шагу
            if (row.isParsingEnd && pointer === input.length) return `OK\nTrace:\n${trace.join('\n')}`
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
        // Обработка e-перехода
        else if (row.guidingSymbols.has('e')) {
            if (row.isShift) pointer++ // Если ε-переход, но требует смещения — двигаем указатель
            if (row.pointer !== null) stack.push(row.pointer) // Двигаемся дальше по таблице
        }
        // Если ничего не подошло — ошибка
        else {
            return `Error: Unexpected '${currentChar}', expected one of [${Array.from(row.guidingSymbols).join(', ')}]`
        }
    }

    // Если указатель не дошёл до конца строки, значит входной текст обработан не полностью
    return pointer === input.length ? `OK\nTrace:\n${trace.join('\n')}` : `Error\nTrace:\n${trace.join('\n')}`
}
export {
    parseString,
}