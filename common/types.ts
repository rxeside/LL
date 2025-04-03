type TableRow = {
    index: number
    symbol: string
    guidingSymbols: Set<string>
    isShift: boolean
    isError: boolean
    pointer: number | null
    stackPushIndex: number | null
    isParsingEnd: boolean
    rightSide: string[] | null
};

type Table = TableRow[]

enum Lexeme {
    // Ключевые слова
    IF = 'IF',
    THEN = 'THEN',
    ELSE = 'ELSE',
    OR = 'OR',
    AND = 'AND',
    DIV = 'DIV',
    MOD = 'MOD',
    NOT = 'NOT',
    TRUE = 'TRUE',
    FALSE = 'FALSE',

    // Операторы и знаки пунктуации
    MULTIPLICATION = '*',
    PLUS = '+',
    MINUS = '-',
    DIVIDE = '/',
    SEMICOLON = ';',
    COMMA = ',',
    LEFT_PAREN = '(',
    RIGHT_PAREN = ')',
    LEFT_BRACKET = '[',
    RIGHT_BRACKET = ']',
    GREATER = '>',
    LESS = '<',
    LESS_EQ = '<=',
    GREATER_EQ = '>=',
    NOT_EQ = '!=',
    COLON = ':',
    ASSIGN = '=',
    DOT = '.',
    DOUBLE_EQ = '==',
    NEGATION = '!',

    // Литералы и идентификаторы
    IDENTIFIER = 'IDENTIFIER',
    STRING = 'STRING',
    INTEGER = 'INTEGER',
    FLOAT = 'FLOAT',

    // Комментарии
    LINE_COMMENT = 'LINE_COMMENT',
    BLOCK_COMMENT = 'BLOCK_COMMENT',

    // Специальные
    ERROR = 'ERROR',
    EOF = 'EOF'
}

type Position = {
    line: number;
    column: number;
};

type Token = {
    type: Lexeme;
    lexeme: string;
    position: Position;
};

export {
    TableRow,
    Table,
    Lexeme,
    Position,
    Token,
}