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

export type {
    TableRow,
}