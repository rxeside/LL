import {TableRow} from '@common/types'

const generateTable = (grammar: string[]): TableRow[] => {
    let initialTable: TableRow[] = []
    let table: TableRow[] = []
    let lineNumber = 1
    let nonTerminalMap = new Map<string, number[]>()

    // первые строки - инициализация
    for (const rule of grammar) {
        const [production, guidingPart] = rule.split(' / ')
        const [leftSide, rightSide] = production.split(' -> ')
        const guidingSymbols = new Set(guidingPart.split(', ').map(s => s.trim()))
        const symbols = rightSide.match(/<[^>]+>|[^<>\s]+/g) || []
        const row: TableRow = {
            index: lineNumber,
            symbol: leftSide,
            guidingSymbols: guidingSymbols,
            isError: true,
            isShift: false,
            pointer: null,
            stackPushIndex: null,
            isParsingEnd: false,
            rightSide: symbols,
        }
        initialTable.push(row)
        table.push(row)

        if (!nonTerminalMap.has(leftSide)) {
            nonTerminalMap.set(leftSide, [])
        }
        nonTerminalMap.get(leftSide)!.push(lineNumber)

        lineNumber++
    }

    // строки до конца
    for (const row of initialTable) {
        for (const symbol of row.rightSide) {
            const equals = initialTable.filter(row => row.symbol === symbol)
            table.push({
                index: lineNumber,
                symbol: symbol,
                guidingSymbols: symbol[0] === '<'
                    ? new Set(...equals.map(row => Array.from(row.guidingSymbols)))
                    : symbol !== 'e'
                        ? new Set(symbol)
                        : new Set(),
                isError: true,
                isShift: false,
                pointer: null,
                stackPushIndex: null,
                isParsingEnd: false,
                rightSide: null,
            })
            lineNumber++
        }
    }

    // замена e в left и в направляющих множествах
    for (const row of table) {
        let t: string[] = []
        if (Array.from(row.guidingSymbols.values())[0] === 'e' || row.symbol === 'e') {
            const left = row.symbol
            for (const row of initialTable) {
                for (let i = 0; i < row.rightSide.length; i++) {
                    if (row.rightSide[i] === left) {
                        if (i + 1 < row.rightSide.length) {
                            t.push(row.rightSide[i + 1])

                        } else {
                            t.push('#')
                        }
                    }
                }
            }
            row.guidingSymbols = new Set(...t)
        }
    }

    // флаг ошибки
    for (let i = 0; i < lineNumber; i++) {
        if (i >= lineNumber - 1) {
            break
        }
        if (!table[i] || !table[i + 1]) {
            console.error(`Ошибка: table[${i}] или table[${i + 1}] равно undefined`);
            continue;
        }
        if (table[i].symbol === table[i + 1].symbol) {
            table[i].isError = false
        }
    }

    // указатель
    for (const [nonTerminal, lines] of Array.from(nonTerminalMap.entries())) {
        for (let i = 0; i < lines.length; i++) {
            const index = lines[i] - 1
            table[index].pointer = lines[0]
        }
    }

    // стек
    for (const row of table) {
        if (row.index < initialTable.length) {
            row.stackPushIndex = null
        } else {
            if (row.symbol[0] == '<') {
                for (const initialRow of initialTable) {
                    if (row.symbol == initialRow.symbol) {
                        row.stackPushIndex = initialRow.index
                    }
                }
            } else {
                row.stackPushIndex = row.index + 1
            }
        }
    }

    // конец
    for (const row of table) {
        row.symbol == '#' ? row.isParsingEnd == true : row.isParsingEnd == false
    }

    return table
}

export {
    generateTable,
}