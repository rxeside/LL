import {Table} from '@common/types'

//TODO: доработать - это мок
const parseTable = (grammarTable: Table, inputString: string): boolean => {
    // Стек с начальным символом грамматики (в данном случае <S>)
    const stack: string[] = ['<S>'];
    const input = inputString.split(' '); // Разделяем строку на терминалы по пробелам
    let pointer = 0;  // Указатель на текущий терминал во входной строке

    // Процесс разбора
    while (stack.length > 0 && pointer < input.length) {
        const stackTop = stack[stack.length - 1]; // Верхний символ стека
        const currentInputSymbol = input[pointer]; // Текущий символ во входной строке

        if (stackTop === currentInputSymbol) {
            // Если верх стека совпадает с текущим символом во входной строке
            stack.pop();
            pointer++;
        } else if (stackTop === '#') {
            // Если мы дошли до конца строки и ожидаем символ '#'
            return pointer === input.length;
        } else if (stackTop.startsWith('<') && stackTop.endsWith('>')) {
            // Если верх стека — это нетерминал (например, <S>)
            const applicableRule = grammarTable.find(row => row.symbol === stackTop &&
                row.guidingSymbols.has(currentInputSymbol));

            if (!applicableRule) {
                // Ошибка: нет подходящей продукции для текущего символа стека
                console.error(`Ошибка: нет подходящей продукции для ${stackTop} и ${currentInputSymbol}`);
                return false;
            }

            // Применяем продукцию (разворачиваем нетерминал на её правую часть)
            stack.pop();
            for (let i = applicableRule.rightSide.length - 1; i >= 0; i--) {
                const symbol = applicableRule.rightSide[i];
                if (symbol !== 'e') { // Игнорируем пустые (epsilon) символы
                    stack.push(symbol);
                }
            }
        } else {
            // Ошибка: текущий символ в стеке не совпадает с символом входной строки
            console.error(`Ошибка: символ в стеке ${stackTop} не совпадает с входным символом ${currentInputSymbol}`);
            return false;
        }
    }

    // Если стек пуст и все символы во входной строке обработаны, то строка принадлежит языку
    return stack.length === 0 && pointer === input.length;
}

export {
    parseTable,
}