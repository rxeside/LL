import {indexGrammar} from './grammarParser'
import {parseString, ParsingTable} from './tableMaker'

const main = () => {
    const grammarSample = [
        '<S> -> <A><B>#',
        '<A> -> a | c<A>',
        '<B> -> b<A>',
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