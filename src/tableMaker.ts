import {Index, IndexedGrammar, indexGrammar} from './grammarParser'

type ParsingRow = {
    index: number;
    symbol: string;
    guidingSymbols: string[];
    shift: boolean;
    error: boolean;
    pointer: number;
    stack: number;
    end: boolean;
};

type ParsingTable = ParsingRow[];

const parseString = (input: string, table: ParsingTable): string => {
    let pointer = 0;
    let stack: number[] = [1]; // Начинаем с первой строки таблицы
    let trace: string[] = [];

    while (stack.length > 0) {
        let tableIndex = stack.pop();
        if (tableIndex === undefined) return 'Error: Stack underflow';

        let row = table.find(r => r.index === tableIndex);
        if (!row) return `Error: No matching table row for index ${tableIndex}`;

        let currentChar = input[pointer] ?? '#'; // Если строка кончилась, рассматриваем '#'
        trace.push(`Stack: [${stack.join(', ')}], Reading: '${currentChar}', Processing: '${row.symbol}'`);

        if (row.guidingSymbols.includes(currentChar)) {
            if (row.shift) pointer++; // Продвигаем указатель, если есть сдвиг
            if (row.stack !== -1) stack.push(row.stack); // Добавляем в стек, если указано
            if (row.pointer !== -1) stack.push(row.pointer); // Переходим к следующему шагу
            if (row.end && pointer === input.length) return `OK\nTrace:\n${trace.join('\n')}`;
        } 
        // Если символ не подходит и error == true, пропускаем этот вариант
        else if (row.error) {
            continue;
        }
        // Если символ не подходит, но error == false и нет указателя, пробуем следующий вариант
        else if (!row.error) {
            let nextRow = table.find(r => r.index === tableIndex + 1); // Берём следующую строку
            if (nextRow) stack.push(nextRow.index);
        } 
        // Обработка ε-перехода
        else if (row.guidingSymbols.includes('ε')) {
            if (row.shift) pointer++; // Если ε-переход, но требует смещения — двигаем указатель
            if (row.pointer !== -1) stack.push(row.pointer); // Двигаемся дальше по таблице
        }
        // Если ничего не подошло — ошибка
        else {
            return `Error: Unexpected '${currentChar}', expected one of [${row.guidingSymbols.join(', ')}]`;
        }
    }

    // Если указатель не дошёл до конца строки, значит входной текст обработан не полностью
    return pointer === input.length ? `OK\nTrace:\n${trace.join('\n')}` : `Error\nTrace:\n${trace.join('\n')}`;
};
export {
    parseString, ParsingTable
}