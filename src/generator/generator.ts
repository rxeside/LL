import {Table, TableRow} from '@common/types'
import {
    SEPARATOR_COMMA,
    SEPARATOR_SPACED_FALLOW,
    SEPARATOR_SPACED_SLASH,
    SYMBOL_EMPTY,
    SYMBOL_END,
} from '@common/consts'

const REGEXP: RegExp = /<[^>]+>|[^<>\s]+/g

const generateTable = (grammar: string[]): Table => {
    let initialTable: Table = []
    let table: Table = []
    let lineNumber = 1
    let nonTerminalMap = new Map<string, number[]>()

    // первые строки - инициализация по альтернативам
    for (const rule of grammar) {
        const [production, guidingPart] = rule.split(SEPARATOR_SPACED_SLASH)
        const [leftSide, rightSide] = production.split(SEPARATOR_SPACED_FALLOW)
        const guidingSymbols = new Set(guidingPart.split(SEPARATOR_COMMA).map(s => s.trim()))
        const symbols = rightSide.match(REGEXP) || []
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
                    ? new Set(equals.flatMap(row => Array.from(row.guidingSymbols)))
                    : new Set(symbol),
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
    table.forEach((row, tableIndex) => {
        if (row.symbol === SYMBOL_EMPTY) {
            let startIdx = 0
            for (let i = tableIndex - 1; i >= 0; i--) {
                if (table[i].symbol === SYMBOL_EMPTY) {
                    startIdx = i + 1
                    break
                }
            }
            let tempTable: Table = table.slice(startIdx, tableIndex + 1)
            row.guidingSymbols = new Set(getGuidingSymbolsForEmpty(row.symbol, tempTable, []))
        } else if (Array.from(row.guidingSymbols.values())[0] === SYMBOL_EMPTY && row.symbol !== SYMBOL_EMPTY) {
            row.guidingSymbols = new Set(getGuidingSymbolsForEmpty(row.symbol, table, []))
        }
    })

    // флаг ошибки
    for (let i = 0; i < initialTable.length - 1; i++) {
        if (!table[i] || !table[i + 1]) {
            console.error(`Ошибка: table[${i}] или table[${i + 1}] равно undefined`)
            continue
        }
        if (table[i].symbol === table[i + 1].symbol) {
            table[i].isError = false
        }
    }

    // переход
    for (let i = 0; i < table.length; i++) {
        if (table[i].symbol[0] != '<' && table[i].symbol !== SYMBOL_EMPTY) {
            table[i].isShift = true
        }
    }

    // указатель
    for (const [_, lines] of Array.from(nonTerminalMap.entries())) {
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
        row.symbol == SYMBOL_END ? row.isParsingEnd == true : row.isParsingEnd == false
    }

    return table
}

const getGuidingSymbolsForEmpty = (
    currentLeft: string,
    table: Table | null,
    temp: string[],
    visited: Set<string> = new Set(),
): string[] => {
    if (!table) {
        return temp
    }

    if (visited.has(currentLeft)) return temp
    visited.add(currentLeft)

    table.forEach((row, tableIndex) => {
        if (!row || !row.rightSide) {
            return
        }

        row.rightSide.forEach((rightSymbol, index) => {
            if (currentLeft === rightSymbol) {
                if (index === row.rightSide.length - 1) {
                    if (tableIndex === 0) {
                        if (!temp.includes(SYMBOL_END)) {
                            temp.push(SYMBOL_END)
                        }
                    } else {
                        temp.push(...getGuidingSymbolsForEmpty(row.symbol, table, temp, visited))
                    }
                } else {
                    temp.push(...getGuidingSymbols(table, rightSymbol))
                }
            }
        })
    })

    return temp
}

const getGuidingSymbols = (table: Table, left: string): string[] => {
    const temp: string[] = []
    table.map(row => {
        if (row.symbol === left) {
            temp.push(...Array.from(row.guidingSymbols))
        }
    })

    return temp
}

export {
    generateTable,
}