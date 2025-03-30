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
        const [production, guidingPart] = rule.split(" / ")
        const [leftSide, rightSide] = production.split(" -> ")
        const guidingSymbols = new Set(guidingPart.split(", ").map(s => s.trim()))
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
            rightSide: symbols
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
            const equals = initialTable.filter(row => row.symbol ===  symbol)
            table.push({
                number: lineNumber,
                symbol: symbol,
                guidingSymbols: symbol[1] === "<"
                    ? new Set(...equals.map(row => row.guidingSymbols.values()))
                    : symbol !== "e"
                        ? new Set(symbol)
                        : new Set(),
                isError: true,
                isShift: false,
                pointer: null,
                stackPushIndex: null,
                isParsingEnd: false,
                rightSide: null
            })
            lineNumber++
        }
    }

    // замена e в left и в направляющих множествах
    for (const row of table) {
        let t: string[]
        if (row.guidingSymbols.values()[0] === "e" || row.symbol === "e") {
            const left = row.symbol
            for (const row of initialTable) {
                for (let i = 0; i < row.rightSide.length; i++) {
                    if (row.rightSide[i] === left) {
                        if (i + 1 < row.rightSide.length) {
                            t.push(row.rightSide[i+1])

                        } else {
                            t.push("#")
                        }
                    }
                }
            }
            row.guidingSymbols = new Set(...t)
        }
    }

    // флаг ошибки
    for (let i = 0; i < lineNumber; i++) {
        if (i >= lineNumber-1) {
            break
        }
        if (table[i].symbol === table[i+1].symbol) {
            table[i].isError = false
        }
    }

    // указатель
    for (const [nonTerminal, lines] of nonTerminalMap.entries()) {
        for (let i = 0; i < lines.length; i++) {
            const index = lines[i] - 1
            table[index].pointer = lines[0] // Указываем на первую альтернативу
        }
    }



    return table
};

const main = () => {
    const grammarSample = [
        "<S> -> <E># / id, -, (",
        "<E> -> <T><E'1> / id, -, (",
        "<T> -> <F><T'1> / id, -, (",
        "<F> -> id / id",
        "<F> -> -<F> / -",
        "<F> -> (<F>) / (",
        "<E'> -> +<T><E''> / +",
        "<T'> -> *<F><T''> / *",
        "<E'1> -> e / #",
        "<E'1> -> <E'> / +",
        "<T'1> -> e / +, #",
        "<T'1> -> <T'> / *",
        "<E''> -> e / #",
        "<E''> -> <E'> / +",
        "<T''> -> e / +, #",
        "<T''> -> <T'> / *",
    ]

    // const grammar = indexGrammar(grammarSample.join('\n'))
    // console.log(grammar)

    const table = parseGrammar(grammarSample)
    console.log(table)
}


if (require.main === module) {
    main()
}