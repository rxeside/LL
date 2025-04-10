import {generateTable} from '@src/generator'
import {parseString} from '@src/parser'
import {optimize} from '@src/optimizer'
import {Lexer} from '@src/lexer'
import {Table} from '@common/types'

/*const NON_OPTIMIZED_GRAMMAR = `
<Prog> -> <If>|<Ass>
<Ass> -> <Ident>=exp
<If> -> if<Exp>then<Ass><Else>
<Else> -> else<Ass>
<Exp> -> <Term><ExpTail>
<ExpTail> -> +<Term><ExpTail> | -<Term><ExpTail> | ε
<Term> -> <Factor><TermTail>
<TermTail> -> *<Factor><TermTail> | /<Factor><TermTail> | ε
<Factor> -> <Ident> | <Number> | (<Exp>)
<Ident> -> a | b | c | d | e | f | g | h | i | j | k | l | m | n | o | p | q | r | s | t | u | v | w | x | y | z
<Number> -> 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
`*/

/*const NON_OPTIMIZED_GRAMMAR = `
<S> -> 5<B>#
<B> -> e
<B> -> +<A><B>
<B> -> *<A><B>
<A> -> (<A>)
<A> -> i
`*/

// const NON_OPTIMIZED_GRAMMAR = `
// <Prog> -> <If>|<Ass>
// <Ass> -> <Ident>=exp
// <If> -> if<Exp>then<Ass><Else>
// <Else> -> else<Ass>
// <Exp> -> <Term><ExpTail>
// <ExpTail> -> +<Term><ExpTail> | -<Term><ExpTail> | ε
// <Term> -> <Factor><TermTail>
// <TermTail> -> *<Factor><TermTail> | /<Factor><TermTail> | ε
// <Factor> -> <Ident> | <Number> | (<Exp>)
// <Ident> -> a | b | c | d | e | f | g | h | i | j | k | l | m | n | o | p | q | r | s | t | u | v | w | x | y | z
// <Number> -> 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
// `

const NON_OPTIMIZED_GRAMMAR = `
<S> -> <A><B>#
<B> -> e
<B> -> +<A><B>
<B> -> *<A><B>
<A> -> (<A>)
<A> -> i
`

// const table: Table = [
//     { index: 1, symbol: '<S>', guidingSymbols: new Set('a'), isError: true, pointer: 2, stackPushIndex: -1, isShift: false, isParsingEnd: false, rightSide: null },
//     { index: 2, symbol: 'a', guidingSymbols: new Set('a'), isError: true, pointer: 3, stackPushIndex: -1, isShift: true, isParsingEnd: false, rightSide: null },
//     { index: 3, symbol: '<B>', guidingSymbols: new Set('b'), isError: true, pointer: 5, stackPushIndex: 4, isShift: false, isParsingEnd: false, rightSide: null },
//     { index: 4, symbol: '#', guidingSymbols: new Set('#'), isError: true, pointer: -1, stackPushIndex: -1, isShift: true, isParsingEnd: true, rightSide: null },
//     { index: 5, symbol: '<B>', guidingSymbols: new Set('b'), isError: true, pointer: 6, stackPushIndex: -1, isShift: false, isParsingEnd: false, rightSide: null },
//     { index: 6, symbol: 'b', guidingSymbols: new Set('b'), isError: true, pointer: 7, stackPushIndex: -1, isShift: true, isParsingEnd: false, rightSide: null },
//     { index: 7, symbol: '<C>', guidingSymbols: new Set(['b', '#']), isError: true, pointer: 8, stackPushIndex: -1, isShift: false, isParsingEnd: false, rightSide: null },
//     { index: 8, symbol: '<C>', guidingSymbols: new Set(['b', '#']), isError: true, pointer: 9, stackPushIndex: -1, isShift: false, isParsingEnd: false, rightSide: null },
//     { index: 9, symbol: 'b', guidingSymbols: new Set('b'), isError: false, pointer: 10, stackPushIndex: -1, isShift: true, isParsingEnd: false, rightSide: null },
//     { index: 10, symbol: '<C>', guidingSymbols: new Set(['b', '#']), isError: true, pointer: 8, stackPushIndex: -1, isShift: false, isParsingEnd: false, rightSide: null }
// ];

const main = () => {
    const optimizedGrammar = optimize(NON_OPTIMIZED_GRAMMAR)
    console.log(optimizedGrammar)
    const table = generateTable(optimizedGrammar.split('\n'))
    console.log(table)

    const input = '( i ) #'
    const lexer = new Lexer()
    const tokens = lexer.tokenize(input)
    console.log(tokens)

    console.log(parseString(tokens, table))
}

if (require.main === module) {
    main()
}

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