import {indexGrammar} from './grammarParser'

type TableRow = {
    number: number
    symbol: string
    guidingSymbols: Set<string>
    isShift: boolean
    isError: boolean
    pointer: number | null
    stackPushIndex: number | null
    isParsingEnd: boolean
    rightSide: string[] | null
};

const parseGrammar = (grammar: string[]): TableRow[] => {
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
            number: lineNumber,
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
                number: lineNumber,
                symbol: symbol,
                guidingSymbols: symbol[1] === '<'
                    ? new Set(...equals.map(row => row.guidingSymbols.values()))
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
        if (row.number < initialTable.length) {
            row.stackPushIndex = null
        } else {
            if (row.symbol[0] == '<') {
                for (const initialRow of initialTable) {
                    if (row.symbol == initialRow.symbol) {
                        row.stackPushIndex = initialRow.number
                    }
                }
            } else {
                row.stackPushIndex = row.number + 1
            }
        }
    }

    // конец
    for (const row of table) {
        row.symbol == '#' ? row.isParsingEnd == true : row.isParsingEnd == false
    }

    return table
}

const main = () => {
    const grammarSample = [
        '<S> -> <E># / id, -, (',
        '<E> -> <T><E\'1> / id, -, (',
        '<T> -> <F><T\'1> / id, -, (',
        '<F> -> id / id',
        '<F> -> -<F> / -',
        '<F> -> (<F>) / (',
        '<E\'> -> +<T><E\'\'> / +',
        '<T\'> -> *<F><T\'\'> / *',
        '<E\'1> -> e / #',
        '<E\'1> -> <E\'> / +',
        '<T\'1> -> e / +, #',
        '<T\'1> -> <T\'> / *',
        '<E\'\'> -> e / #',
        '<E\'\'> -> <E\'> / +',
        '<T\'\'> -> e / +, #',
        '<T\'\'> -> <T\'> / *',
    ]

    const grammar = indexGrammar(grammarSample.join('\n'))
    console.log(grammar)

    // const table: ParsingTable = [
    //     { index: 1, symbol: '<S>', guidingSymbols: ['a'], error: true, pointer: 2, stack: -1, shift: false, end: false },
    //     { index: 2, symbol: 'a', guidingSymbols: ['a'], error: true, pointer: 3, stack: 3, shift: true, end: false },
    //     { index: 3, symbol: '<A>', guidingSymbols: ['a'], error: true, pointer: 6, stack: 4, shift: false, end: false },
    //     { index: 4, symbol: '<B>', guidingSymbols: ['b', '#', 'ε'], error: true, pointer: 9, stack: 5, shift: false, end: false },
    //     { index: 5, symbol: '#', guidingSymbols: ['#'], error: true, pointer: -1, stack: -1, shift: true, end: true },
    //     { index: 6, symbol: '<A>', guidingSymbols: ['a'], error: true, pointer: 7, stack: -1, shift: false, end: false },
    //     { index: 7, symbol: 'a', guidingSymbols: ['a'], error: true, pointer: 8, stack: -1, shift: true, end: false },
    //     { index: 8, symbol: '<B>', guidingSymbols: ['b', '#', 'ε'], error: true, pointer: 9, stack: -1, shift: false, end: false },
    //     { index: 9, symbol: '<B>', guidingSymbols: ['b', '#', 'ε'], error: true, pointer: 10, stack: -1, shift: false, end: false },
    //     { index: 10, symbol: 'b', guidingSymbols: ['b'], error: false, pointer: -1, stack: -1, shift: true, end: false },
    //     { index: 11, symbol: 'ε', guidingSymbols: ['ε'], error: true, pointer: -1, stack: -1, shift: true, end: false }
    // ];

    // const table: ParsingTable = [
    //     { index: 1, symbol: '<S>', guidingSymbols: ['a'], error: true, pointer: 2, stack: -1, shift: false, end: false },
    //     { index: 2, symbol: 'a', guidingSymbols: ['a'], error: true, pointer: 3, stack: 3, shift: true, end: false },
    //     { index: 3, symbol: '<A>', guidingSymbols: ['a'], error: true, pointer: 6, stack: 4, shift: false, end: false },
    //     { index: 4, symbol: '<B>', guidingSymbols: ['b'], error: true, pointer: 9, stack: 5, shift: false, end: false },
    //     { index: 5, symbol: '#', guidingSymbols: ['#'], error: true, pointer: -1, stack: -1, shift: true, end: true },
    //     { index: 6, symbol: '<A>', guidingSymbols: ['a'], error: true, pointer: 7, stack: -1, shift: false, end: false },
    //     { index: 7, symbol: 'a', guidingSymbols: ['a'], error: true, pointer: 8, stack: -1, shift: true, end: false },
    //     { index: 8, symbol: '<B>', guidingSymbols: ['b'], error: true, pointer: 9, stack: -1, shift: false, end: false },
    //     { index: 9, symbol: '<B>', guidingSymbols: ['b'], error: true, pointer: 10, stack: -1, shift: false, end: false },
    //     { index: 10, symbol: 'b', guidingSymbols: ['b'], error: false, pointer: -1, stack: -1, shift: true, end: false },
    //     { index: 11, symbol: '<C>', guidingSymbols: ['c', 'ε'], error: true, pointer: 13, stack: -1, shift: false, end: false },
    //     { index: 12, symbol: '<B>', guidingSymbols: ['b'], error: true, pointer: 9, stack: -1, shift: false, end: false },
    //     { index: 13, symbol: '<C>', guidingSymbols: ['c', 'ε'], error: true, pointer: 14, stack: -1, shift: false, end: false },
    //     { index: 14, symbol: 'c', guidingSymbols: ['c'], error: false, pointer: -1, stack: -1, shift: true, end: false },
    //     { index: 15, symbol: 'ε', guidingSymbols: ['ε'], error: true, pointer: -1, stack: -1, shift: false, end: false }
    // ];

    const table: ParsingTable = [
        { index: 1, symbol: '<S>', guidingSymbols: ['a'], error: true, pointer: 2, stack: -1, shift: false, end: false },
        { index: 2, symbol: 'a', guidingSymbols: ['a'], error: true, pointer: 3, stack: -1, shift: true, end: false },
        { index: 3, symbol: '<B>', guidingSymbols: ['b'], error: true, pointer: 5, stack: 4, shift: false, end: false },
        { index: 4, symbol: '#', guidingSymbols: ['#'], error: true, pointer: -1, stack: -1, shift: true, end: true },
        { index: 5, symbol: '<B>', guidingSymbols: ['b'], error: true, pointer: 6, stack: -1, shift: false, end: false },
        { index: 6, symbol: 'b', guidingSymbols: ['b'], error: true, pointer: 7, stack: -1, shift: true, end: false },
        { index: 7, symbol: '<C>', guidingSymbols: ['b', 'ε'], error: true, pointer: 8, stack: -1, shift: false, end: false },
        { index: 8, symbol: '<C>', guidingSymbols: ['b', 'ε'], error: true, pointer: 9, stack: -1, shift: false, end: false },
        { index: 9, symbol: 'b', guidingSymbols: ['b'], error: false, pointer: 11, stack: -1, shift: true, end: false },
        { index: 10, symbol: 'ε', guidingSymbols: ['ε'], error: true, pointer: -1, stack: -1, shift: false, end: false },
        { index: 11, symbol: '<C>', guidingSymbols: ['b', 'ε'], error: true, pointer: 8, stack: -1, shift: false, end: false }
    ];

    console.log(parseString('abbbbbbbbbbbbbbbbbbbbbbbbb#', table));
}


if (require.main === module) {
    main()
}