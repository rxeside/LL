import {Lexer} from '@src/lexer'
import {Lexeme} from '@common/types'

describe('Lexer', () => {
    describe('Basic tokens', () => {
        test('should tokenize keywords', () => {
            const input = 'IF THEN ELSE OR AND DIV MOD NOT TRUE FALSE'
            const lexer = new Lexer(input)
            const tokens = lexer.tokenize()

            expect(tokens.map(t => t.type)).toEqual([
                Lexeme.IF,
                Lexeme.THEN,
                Lexeme.ELSE,
                Lexeme.OR,
                Lexeme.AND,
                Lexeme.DIV,
                Lexeme.MOD,
                Lexeme.NOT,
                Lexeme.TRUE,
                Lexeme.FALSE,
                Lexeme.EOF,
            ])
        })

        test('should handle operators', () => {
            const input = '+ - * / = == != <= >= > < : . , ; ( ) [ ] !'
            const lexer = new Lexer(input)
            const tokens = lexer.tokenize()

            expect(tokens.map(t => t.type)).toEqual([
                Lexeme.PLUS,
                Lexeme.MINUS,
                Lexeme.MULTIPLICATION,
                Lexeme.DIVIDE,
                Lexeme.ASSIGN,
                Lexeme.DOUBLE_EQ,
                Lexeme.NOT_EQ,
                Lexeme.LESS_EQ,
                Lexeme.GREATER_EQ,
                Lexeme.GREATER,
                Lexeme.LESS,
                Lexeme.COLON,
                Lexeme.DOT,
                Lexeme.COMMA,
                Lexeme.SEMICOLON,
                Lexeme.LEFT_PAREN,
                Lexeme.RIGHT_PAREN,
                Lexeme.LEFT_BRACKET,
                Lexeme.RIGHT_BRACKET,
                Lexeme.NEGATION,
                Lexeme.EOF,
            ])
        })
    })

    describe('Numbers', () => {
        const testCases = [
            {input: '123', type: Lexeme.INTEGER},
            {input: '123.45', type: Lexeme.FLOAT},
            {input: '123e5', type: Lexeme.FLOAT},
            {input: '12.34e-6', type: Lexeme.FLOAT},
            {input: '123.45.67', type: Lexeme.ERROR},
            {input: '12e', type: Lexeme.ERROR},
            {input: '12e+', type: Lexeme.ERROR},
            {input: '123abc', type: Lexeme.ERROR},
        ]

        testCases.forEach(({input, type}) => {
            test(`should handle ${input} as ${type}`, () => {
                const lexer = new Lexer(input)
                const tokens = lexer.tokenize()
                expect(tokens[0].type).toBe(type)
            })
        })
    })

    describe('Strings', () => {
        test('should handle valid strings', () => {
            const input = '"Hello, World!"'
            const lexer = new Lexer(input)
            const tokens = lexer.tokenize()

            expect(tokens[0].type).toBe(Lexeme.STRING)
            expect(tokens[0].lexeme).toBe('Hello, World!')
        })

        test('should handle unclosed strings', () => {
            const input = '"Unclosed string'
            const lexer = new Lexer(input)
            const tokens = lexer.tokenize()

            expect(tokens[0].type).toBe(Lexeme.ERROR)
        })
    })

    describe('Identifiers', () => {
        const testCases = [
            {input: 'variable', type: Lexeme.IDENTIFIER},
            {input: 'var123', type: Lexeme.IDENTIFIER},
            {input: 'переменная', type: Lexeme.ERROR},
            {input: '_var', type: Lexeme.IDENTIFIER},
            {input: 'THEN', type: Lexeme.THEN},
        ]

        testCases.forEach(({input, type}) => {
            test(`should handle ${input} as ${type}`, () => {
                const lexer = new Lexer(input)
                const tokens = lexer.tokenize()
                expect(tokens[0].type).toBe(type)
            })
        })
    })

    describe('Comments', () => {
        test('should handle line comments', () => {
            const input = '// This is a comment'
            const lexer = new Lexer(input)
            const tokens = lexer.tokenize()

            expect(tokens[0].type).toBe(Lexeme.LINE_COMMENT)
        })

        test('should handle block comments', () => {
            const input = '{ This is a block comment }'
            const lexer = new Lexer(input)
            const tokens = lexer.tokenize()

            expect(tokens[0].type).toBe(Lexeme.BLOCK_COMMENT)
        })

        test('should handle unclosed block comments', () => {
            const input = '{ Unclosed comment'
            const lexer = new Lexer(input)
            const tokens = lexer.tokenize()

            expect(tokens[0].type).toBe(Lexeme.ERROR)
        })
    })

    describe('Positions', () => {
        test('should track line and column numbers', () => {
            const input = 'IF\n  x = 42'
            const lexer = new Lexer(input)
            const tokens = lexer.tokenize()

            expect(tokens[0].position).toEqual({line: 1, column: 0})
            expect(tokens[1].position).toEqual({line: 2, column: 2})
            expect(tokens[2].position).toEqual({line: 2, column: 4})
        })

        test('should handle empty input', () => {
            const lexer = new Lexer('')
            const tokens = lexer.tokenize()
            expect(tokens).toEqual([{
                type: Lexeme.EOF,
                lexeme: '',
                position: {line: 1, column: 0},
            }])
        })
    })

    describe('Error recovery', () => {
        test('should continue after errors', () => {
            const input = '123abc "unclosed \nab'
            const lexer = new Lexer(input)
            const tokens = lexer.tokenize()

            const types = tokens.map(t => t.type)
            expect(types).toEqual([
                Lexeme.ERROR,
                Lexeme.ERROR,
                Lexeme.IDENTIFIER,
                Lexeme.EOF,
            ])
        })
    })
})