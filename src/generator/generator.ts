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
        const [leftSide, rightSideRaw] = production.split(SEPARATOR_SPACED_FALLOW)
        const guidingSymbols = new Set(guidingPart.split(SEPARATOR_COMMA).map(s => s.trim()))
        const symbols = rightSideRaw.match(REGEXP) || []

        const rightSide = symbols.map((s, i) => ({
            symbol: s,
            order: i
        }))

        const row: TableRow = {
            index: lineNumber,
            symbol: leftSide,
            guidingSymbols: guidingSymbols,
            isError: true,
            isShift: false,
            pointer: null,
            stackPushIndex: null,
            isParsingEnd: false,
            rightSide: rightSide,
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
        for (const symbolObj of row.rightSide ?? []) {
            const symbol = symbolObj.symbol;
            const order = symbolObj.order;
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
                rightSide: [symbolObj],
                parentRuleIndex: row.index,
                orderInRule: order
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
    // Установка указателей для символов из левой части
    for (const row of initialTable) {
        for (const symbol of row.rightSide) {
            const targetRow = table.find(r => r.symbol === symbol);
            if (targetRow) {
                row.pointer = targetRow.index;
                break;
            }
        }
    }

// Установка указателей для символов из правой части
    for (const row of table) {
        if (row.index <= initialTable.length) continue; // Пропускаем начальные строки
        if (row.symbol.startsWith("<")) {
            // Если символ - нетерминал, ищем первую строку, где он слева
            const firstRow = initialTable.find(r => r.symbol === row.symbol);
            if (firstRow) {
                row.pointer = firstRow.index;
            }
        } else {
            // Если символ - терминал
            const parentRow = initialTable.find(r =>
                r.rightSide?.some(s => s.symbol === row.symbol)
            );
            if (parentRow) {
                const symbolIndex = parentRow?.rightSide?.map(s => s.symbol).lastIndexOf(row.symbol) ?? -1;
                const isLast = symbolIndex === parentRow.rightSide!.length - 1;

                // Если символ последний в правой части, указатель null
                row.pointer = isLast ? null : row.index + 1;
            } else {
                row.pointer = row.index + 1;
            }
        }
    }


    for (const row of table) {
        if (row.index <= initialTable.length) continue;

        if (row.symbol.startsWith("<") && row.parentRuleIndex !== undefined && row.orderInRule !== undefined) {
            const parentRule = initialTable.find(r => r.index === row.parentRuleIndex);
            if (!parentRule || !parentRule.rightSide) {
                row.stackPushIndex = null;
                continue;
            }

            const nextSymbol = parentRule.rightSide.find(rs => rs.order === row.orderInRule + 1);

            if (nextSymbol) {
                const nextRow = table.find(t =>
                    t.parentRuleIndex === row.parentRuleIndex &&
                    t.orderInRule === nextSymbol.order &&
                    t.symbol === nextSymbol.symbol
                );

                row.stackPushIndex = nextRow?.index ?? null;
            } else {
                row.stackPushIndex = null;
            }

        } else {
            row.stackPushIndex = null;
        }
    }



    // Заполнение стека
    /*for (const row of table) {
        if (row.index <= initialTable.length) continue; // Пропускаем начальные строки

        if (row.symbol.startsWith("<")) {
            // Если символ - нетерминал, ищем его в правых частях правил
            const parentRow = initialTable.find(r => r.rightSide.includes(row.symbol));

            if (parentRow) {
                const symbolIndex = parentRow.rightSide.indexOf(row.symbol);

                // Если после нетерминала есть еще символы, записываем индекс следующего
                if (symbolIndex !== -1 && symbolIndex + 1 < parentRow.rightSide.length) {
                    const nextSymbol = parentRow.rightSide[symbolIndex + 1];
                    const nextRow = table.slice(row.index - 1, table.length).find(r =>
                        r.symbol === nextSymbol
                    );
                    row.stackPushIndex = nextRow ? nextRow.index : null;
                } else {
                    row.stackPushIndex = null;
                }

            }
        } else {
            // Терминалы не записываются в стек, они просто переходят на index + 1
            row.stackPushIndex = null;
        }
    }*/



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
                    temp.push(...getGuidingSymbols(table, row.rightSide[index + 1].symbol))
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