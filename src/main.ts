import {generateTable} from '@src/generator'
import {parseTable} from '@src/parser'

const main = () => {
    const grammarSample = [
        "<Prog> -> <If> / if",
        "<Prog> -> <Ass> / if",
        "<Ass> -> <Infident>=exp /",
        "<If> -> if<Exp>than<Ass><Else> / if",
        "<Else> -> else<Ass> / else",
    ]

    const table = generateTable(grammarSample)
    console.log(table)

    // const table: ParsingTable = [
    //     { index: 1, symbol: '<S>', guidingSymbols: ['a'], isError: true, pointer: 2, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 2, symbol: 'a', guidingSymbols: ['a'], isError: true, pointer: 3, stackPushIndex: 3, isShift: true, isParsingEnd: false },
    //     { index: 3, symbol: '<A>', guidingSymbols: ['a'], isError: true, pointer: 6, stackPushIndex: 4, isShift: false, isParsingEnd: false },
    //     { index: 4, symbol: '<B>', guidingSymbols: ['b', '#', 'ε'], isError: true, pointer: 9, stackPushIndex: 5, isShift: false, isParsingEnd: false },
    //     { index: 5, symbol: '#', guidingSymbols: ['#'], isError: true, pointer: -1, stackPushIndex: -1, isShift: true, isParsingEnd: true },
    //     { index: 6, symbol: '<A>', guidingSymbols: ['a'], isError: true, pointer: 7, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 7, symbol: 'a', guidingSymbols: ['a'], isError: true, pointer: 8, stackPushIndex: -1, isShift: true, isParsingEnd: false },
    //     { index: 8, symbol: '<B>', guidingSymbols: ['b', '#', 'ε'], isError: true, pointer: 9, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 9, symbol: '<B>', guidingSymbols: ['b', '#', 'ε'], isError: true, pointer: 10, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 10, symbol: 'b', guidingSymbols: ['b'], isError: false, pointer: -1, stackPushIndex: -1, isShift: true, isParsingEnd: false },
    //     { index: 11, symbol: 'ε', guidingSymbols: ['ε'], isError: true, pointer: -1, stackPushIndex: -1, isShift: true, isParsingEnd: false }
    // ];

    // const table: ParsingTable = [
    //     { index: 1, symbol: '<S>', guidingSymbols: ['a'], isError: true, pointer: 2, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 2, symbol: 'a', guidingSymbols: ['a'], isError: true, pointer: 3, stackPushIndex: 3, isShift: true, isParsingEnd: false },
    //     { index: 3, symbol: '<A>', guidingSymbols: ['a'], isError: true, pointer: 6, stackPushIndex: 4, isShift: false, isParsingEnd: false },
    //     { index: 4, symbol: '<B>', guidingSymbols: ['b'], isError: true, pointer: 9, stackPushIndex: 5, isShift: false, isParsingEnd: false },
    //     { index: 5, symbol: '#', guidingSymbols: ['#'], isError: true, pointer: -1, stackPushIndex: -1, isShift: true, isParsingEnd: true },
    //     { index: 6, symbol: '<A>', guidingSymbols: ['a'], isError: true, pointer: 7, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 7, symbol: 'a', guidingSymbols: ['a'], isError: true, pointer: 8, stackPushIndex: -1, isShift: true, isParsingEnd: false },
    //     { index: 8, symbol: '<B>', guidingSymbols: ['b'], isError: true, pointer: 9, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 9, symbol: '<B>', guidingSymbols: ['b'], isError: true, pointer: 10, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 10, symbol: 'b', guidingSymbols: ['b'], isError: false, pointer: -1, stackPushIndex: -1, isShift: true, isParsingEnd: false },
    //     { index: 11, symbol: '<C>', guidingSymbols: ['c', 'ε'], isError: true, pointer: 13, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 12, symbol: '<B>', guidingSymbols: ['b'], isError: true, pointer: 9, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 13, symbol: '<C>', guidingSymbols: ['c', 'ε'], isError: true, pointer: 14, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 14, symbol: 'c', guidingSymbols: ['c'], isError: false, pointer: -1, stackPushIndex: -1, isShift: true, isParsingEnd: false },
    //     { index: 15, symbol: 'ε', guidingSymbols: ['ε'], isError: true, pointer: -1, stackPushIndex: -1, isShift: false, isParsingEnd: false }
    // ];

    // const table: ParsingTable = [
    //     { index: 1, symbol: '<S>', guidingSymbols: ['a'], isError: true, pointer: 2, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 2, symbol: 'a', guidingSymbols: ['a'], isError: true, pointer: 3, stackPushIndex: -1, isShift: true, isParsingEnd: false },
    //     { index: 3, symbol: '<B>', guidingSymbols: ['b'], isError: true, pointer: 5, stackPushIndex: 4, isShift: false, isParsingEnd: false },
    //     { index: 4, symbol: '#', guidingSymbols: ['#'], isError: true, pointer: -1, stackPushIndex: -1, isShift: true, isParsingEnd: true },
    //     { index: 5, symbol: '<B>', guidingSymbols: ['b'], isError: true, pointer: 6, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 6, symbol: 'b', guidingSymbols: ['b'], isError: true, pointer: 7, stackPushIndex: -1, isShift: true, isParsingEnd: false },
    //     { index: 7, symbol: '<C>', guidingSymbols: ['b', 'ε'], isError: true, pointer: 8, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 8, symbol: '<C>', guidingSymbols: ['b', 'ε'], isError: true, pointer: 9, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 9, symbol: 'b', guidingSymbols: ['b'], isError: false, pointer: 11, stackPushIndex: -1, isShift: true, isParsingEnd: false },
    //     { index: 10, symbol: 'ε', guidingSymbols: ['ε'], isError: true, pointer: -1, stackPushIndex: -1, isShift: false, isParsingEnd: false },
    //     { index: 11, symbol: '<C>', guidingSymbols: ['b', 'ε'], isError: true, pointer: 8, stackPushIndex: -1, isShift: false, isParsingEnd: false }
    // ];

    console.log(parseTable(table, 'id + id * id #'));
}


if (require.main === module) {
    main()
}