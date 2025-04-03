enum SYMBOL_TYPE {
    TERMINAL,
    NON_TERMINAL,
}

abstract class CustomSymbol {
    constructor(protected value: string) {}

    getValue(): string {
        return this.value;
    }

    abstract getType(): SYMBOL_TYPE;

    equals(other: CustomSymbol): boolean {
        return this.getType() === other.getType() && this.value === other.value;
    }
}

type Rule = CustomSymbol[];
type Rules = Rule[];

class NonTerminal extends CustomSymbol {
    private rules: Rules = [];

    constructor(value: string) {
        super(value);
    }

    addRule(rule: Rule): void {
        // Если правило уже существует – не добавляем его.
        if (!this.rules.some(r => ruleEquals(r, rule))) {
            this.rules.push(rule);
        }
    }

    clearRules(): void {
        this.rules = [];
    }

    getRules(): Rules {
        return this.rules;
    }

    getType(): SYMBOL_TYPE {
        return SYMBOL_TYPE.NON_TERMINAL;
    }
}

class Terminal extends CustomSymbol {
    constructor(value: string) {
        super(value);
    }

    getType(): SYMBOL_TYPE {
        return SYMBOL_TYPE.TERMINAL;
    }
}

function ruleEquals(r1: Rule, r2: Rule): boolean {
    if (r1.length !== r2.length) return false;
    for (let i = 0; i < r1.length; i++) {
        if (!r1[i].equals(r2[i])) return false;
    }
    return true;
}

const SALT = "'";

function addSuffixBeforeClosingBracket(str: string, ch: string): string {
    // Вставляем суффикс перед последним символом (предполагается, что строка заканчивается на '>')
    return str.slice(0, -1) + ch + str.slice(-1);
}

class Dictionary {
    private nonTerminals: NonTerminal[] = [];
    private terminals: Terminal[] = [];
    private allSymbols: CustomSymbol[] = [];

    add(symbol: CustomSymbol): void {
        if (this.allSymbols.some(s => s.equals(symbol))) {
            return;
        }
        this.allSymbols.push(symbol);
        if (symbol.getType() === SYMBOL_TYPE.NON_TERMINAL) {
            this.nonTerminals.push(symbol as NonTerminal);
        } else {
            this.terminals.push(symbol as Terminal);
        }
    }

    getNonTerminals(): NonTerminal[] {
        return this.nonTerminals;
    }

    getTerminals(): Terminal[] {
        return this.terminals;
    }

    getAllSymbols(): CustomSymbol[] {
        return this.allSymbols;
    }

    // Удаление левой рекурсии.
    removeLeftRecursion(): void {
        const newNonTerminals: NonTerminal[] = [];

        for (const nonTerminal of this.nonTerminals) {
            let created = false;
            const newNT = new NonTerminal(addSuffixBeforeClosingBracket(nonTerminal.getValue(), SALT));
            const indicesToRemove: number[] = [];
            const rules = nonTerminal.getRules();
            // Обработка правил, начинающихся с самого нетерминала
            for (let i = 0; i < rules.length; i++) {
                const rule = rules[i];
                if (rule.length > 0 && rule[0].equals(nonTerminal)) {
                    if (!created) {
                        created = true;
                        newNonTerminals.push(newNT);
                    }
                    // Создаем два правила: без первого символа и с добавлением нового нетерминала в конец
                    const newRule: Rule = rule.slice(1);
                    const newRule2: Rule = rule.slice(1);
                    newRule2.push(newNT);
                    indicesToRemove.push(i);
                    newNT.addRule(newRule);
                    newNT.addRule(newRule2);
                }
            }
            if (!created) continue;
            // Удаляем левые рекурсивные правила (начиная с конца, чтобы индексы не смещались)
            for (let i = indicesToRemove.length - 1; i >= 0; i--) {
                rules.splice(indicesToRemove[i], 1);
            }
            // Для остальных правил – добавляем новое правило с нетерминалом newNT
            const originalLength = rules.length;
            for (let i = 0; i < originalLength; i++) {
                const rule = rules[i];
                const newRule = rule.slice();
                newRule.push(newNT);
                rules.push(newRule);
            }
        }
        // Добавляем новые нетерминалы в словарь
        newNonTerminals.forEach(nt => this.add(nt));
    }

    // Вычисление FIRST* с использованием транзитивного замыкания.
    computeFirstStar(): Map<string, Set<string>> {
        const firstStar = new Map<string, Set<string>>();
        const size = this.nonTerminals.length;
        const indexMap = new Map<string, number>();
        for (let i = 0; i < this.nonTerminals.length; i++) {
            indexMap.set(this.nonTerminals[i].getValue(), i);
            firstStar.set(this.nonTerminals[i].getValue(), new Set<string>());
        }
        // Инициализация матрицы смежности
        const adjacencyMatrix: boolean[][] = Array.from({ length: size },
            () => Array(size).fill(false));

        for (const nonTerminal of this.nonTerminals) {
            for (const rule of nonTerminal.getRules()) {
                if (rule.length > 0) {
                    const firstSymbol = rule[0];
                    const from = indexMap.get(nonTerminal.getValue())!;
                    if (firstSymbol.getType() === SYMBOL_TYPE.NON_TERMINAL) {
                        const to = indexMap.get(firstSymbol.getValue())!;
                        adjacencyMatrix[from][to] = true;
                    }
                }
            }
        }
        // Вычисляем транзитивное замыкание
        for (let k = 0; k < size; k++) {
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    adjacencyMatrix[i][j] = adjacencyMatrix[i][j] || (adjacencyMatrix[i][k] && adjacencyMatrix[k][j]);
                }
            }
        }

        let changed: boolean;
        do {
            changed = false;
            for (const nonTerminal of this.nonTerminals) {
                const ntValue = nonTerminal.getValue();
                for (const rule of nonTerminal.getRules()) {
                    if (rule.length === 0) continue;
                    const firstSymbol = rule[0];
                    if (firstSymbol.getType() === SYMBOL_TYPE.TERMINAL) {
                        const set = firstStar.get(ntValue)!;
                        if (!set.has(firstSymbol.getValue())) {
                            set.add(firstSymbol.getValue());
                            changed = true;
                        }
                    } else {
                        // Если нетерминал, добавляем его FIRST* в текущее множество
                        const fs = firstStar.get(firstSymbol.getValue());
                        if (fs) {
                            for (const terminal of fs) {
                                const set = firstStar.get(ntValue)!;
                                if (!set.has(terminal)) {
                                    set.add(terminal);
                                    changed = true;
                                }
                            }
                        }
                    }
                }
            }
        } while (changed);

        return firstStar;
    }

    // Вычисление FOLLOW множества, используя вычисленное FIRST*
    computeFollow(firstStar: Map<string, Set<string>>): Map<string, Set<string>> {
        const follow = new Map<string, Set<string>>();
        if (this.nonTerminals.length === 0) return follow;
        // Инициализация
        for (const nt of this.nonTerminals) {
            follow.set(nt.getValue(), new Set<string>());
        }
        // Добавляем '$' в FOLLOW стартового символа
        const startSymbol = this.nonTerminals[0].getValue();
        follow.get(startSymbol)!.add("$");

        let changed: boolean;
        do {
            changed = false;
            for (const nonTerminal of this.nonTerminals) {
                const A = nonTerminal.getValue();
                for (const rule of nonTerminal.getRules()) {
                    for (let i = 0; i < rule.length; i++) {
                        const symbol = rule[i];
                        if (symbol.getType() === SYMBOL_TYPE.NON_TERMINAL) {
                            const B = symbol.getValue();
                            if (!follow.has(B)) {
                                follow.set(B, new Set<string>()); //
                            }
                            if (i + 1 < rule.length) {
                                const nextSymbol = rule[i + 1];
                                if (nextSymbol.getType() === SYMBOL_TYPE.TERMINAL) {
                                    if (!follow.get(B)!.has(nextSymbol.getValue())) {
                                        follow.get(B)!.add(nextSymbol.getValue());
                                        changed = true;
                                    }
                                } else {
                                    const nextFS = firstStar.get(nextSymbol.getValue());
                                    if (nextFS) {
                                        for (const terminal of nextFS) {
                                            if (terminal !== "e" && !follow.get(B)!.has(terminal)) {
                                                follow.get(B)!.add(terminal);
                                                changed = true;
                                            }
                                        }
                                        if (nextFS.has("e")) {
                                            for (const terminal of follow.get(A)!) {
                                                if (!follow.get(B)!.has(terminal)) {
                                                    follow.get(B)!.add(terminal);
                                                    changed = true;
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                // Если B – последний символ в правиле, добавляем FOLLOW(A) в FOLLOW(B)
                                for (const terminal of follow.get(A)!) {
                                    if (!follow.get(B)!.has(terminal)) {
                                        follow.get(B)!.add(terminal);
                                        changed = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } while (changed);

        return follow;
    }

    // Факторизация правил.
    factorize(): void {
        let globalChanged = false;
        const nonTerminalsToAdd: NonTerminal[] = [];

        do {
            globalChanged = false;
            for (const nonTerminal of this.nonTerminals) {
                let localChanged: boolean;
                do {
                    localChanged = false;
                    const rules = nonTerminal.getRules();
                    const groups = new Map<string, Rule[]>();
                    // Группируем правила по первому символу
                    for (const rule of rules) {
                        if (rule.length === 0) continue;
                        const key = rule[0].getValue();
                        if (!groups.has(key)) {
                            groups.set(key, []);
                        }
                        groups.get(key)!.push(rule);
                    }

                    for (const [key, group] of groups) {
                        if (group.length < 2) continue;

                        let prefixLength = 0;
                        let minLen = Math.min(...group.map(r => r.length));
                        for (let i = 0; i < minLen; i++) {
                            const symbol = group[0][i];
                            let allSame = true;
                            for (const r of group) {
                                if (i >= r.length || !r[i].equals(symbol)) {
                                    allSame = false;
                                    break;
                                }
                            }
                            if (allSame) {
                                prefixLength = i + 1;
                            } else {
                                break;
                            }
                        }
                        if (prefixLength === 0) continue;

                        // Генерируем новое имя для нетерминала
                        let baseName = addSuffixBeforeClosingBracket(nonTerminal.getValue(), SALT);
                        let newName = baseName;
                        let counter = 1;
                        while (this.allSymbols.some(s =>
                            s.getType() === SYMBOL_TYPE.NON_TERMINAL && s.getValue() === newName)) {
                            newName = addSuffixBeforeClosingBracket(baseName, counter.toString());
                            counter++;
                        }
                        const newNonTerminal = new NonTerminal(newName);
                        nonTerminalsToAdd.push(newNonTerminal);

                        // Новое правило для текущего нетерминала
                        const newRule: Rule = [];
                        for (let i = 0; i < prefixLength; i++) {
                            newRule.push(group[0][i]);
                        }
                        newRule.push(newNonTerminal);
                        nonTerminal.addRule(newRule);

                        // Для каждого правила из группы переносим оставшуюся часть в новый нетерминал
                        for (const oldRule of group) {
                            const suffix = oldRule.slice(prefixLength);
                            if (suffix.length === 0) {
                                // Если после общего префикса ничего нет – добавляем "e" (обозначение пустой строки)
                                suffix.push(new Terminal("e"));
                            }
                            newNonTerminal.addRule(suffix);
                        }

                        // Удаляем старые правила из группы
                        for (let i = rules.length - 1; i >= 0; i--) {
                            if (group.some(r => ruleEquals(r, rules[i]))) {
                                rules.splice(i, 1);
                            }
                        }
                        localChanged = true;
                        globalChanged = true;
                    }
                } while (localChanged);
            }
        } while (globalChanged);

        // Добавляем новые нетерминалы в словарь
        nonTerminalsToAdd.forEach(nt => this.add(nt));
    }
}

// Функция, которая парсит входную строку и создает Dictionary
function createDictionaryFromInput(input: string): Dictionary {
    const dictionary = new Dictionary();
    const ruleRegex = /(<[^>]+>)\s*->\s*((?:<[^>]+>|[^<>])+)/;
    const lines = input.split(/\r?\n/);
    for (const row of lines) {
        if (row.trim().length === 0) continue;
        const match = row.match(ruleRegex);
        if (match) {
            const left = match[1];
            const right = match[2];

            // Ищем уже существующий нетерминал
            let nonTerminal: NonTerminal | null = null;
            for (const nt of dictionary.getNonTerminals()) {
                if (nt.getValue() === left) {
                    nonTerminal = nt;
                    break;
                }
            }
            if (!nonTerminal) {
                nonTerminal = new NonTerminal(left);
                dictionary.add(nonTerminal);
            }

            // Разбиваем правую часть на символы.
            // Символы-нетерминалы находятся в угловых скобках, остальные – терминалы.
            const symbolRegex = /<[^>]+>|[^<>]+/g;
            const ruleSymbols: CustomSymbol[] = [];
            const symbolMatches = right.match(symbolRegex);
            if (symbolMatches) {
                for (let sym of symbolMatches) {
                    sym = sym.trim();
                    if (sym.length === 0) continue;
                    if (sym.startsWith("<") && sym.endsWith(">")) {
                        // Создаем временный нетерминал
                        ruleSymbols.push(new NonTerminal(sym));
                    } else {
                        const term = new Terminal(sym);
                        ruleSymbols.push(term);
                        dictionary.add(term);
                    }
                }
            }
            nonTerminal.addRule(ruleSymbols);
        }
    }
    return dictionary;
}

// Функция, которая оптимизирует грамматику, удаляет левую рекурсию, производит факторизацию,
// вычисляет направляющие множества и выводит результат.
function optimize(input: string): string {
    const dictionary = createDictionaryFromInput(input);
    dictionary.removeLeftRecursion();
    dictionary.factorize();

    const firstStar = dictionary.computeFirstStar();
    const follow = dictionary.computeFollow(firstStar);

    const lines: string[] = [];
    for (const nonTerminal of dictionary.getNonTerminals()) {
        for (const rule of nonTerminal.getRules()) {
            let line = `${nonTerminal.getValue()} -> `;
            for (const sym of rule) {
                line += sym.getValue();
            }
            line += " / ";
            let isFirst = true;
            // Для каждого направляющего символа, относящегося к текущему нетерминалу,
            // проверяем правило и выводим соответствующие символы.
            const guidingSet = firstStar.get(nonTerminal.getValue()) || new Set<string>();
            for (const guidingSymbol of guidingSet) {
                if (rule.length === 0) continue;
                if (rule[0].getType() === SYMBOL_TYPE.TERMINAL && rule[0].getValue() === guidingSymbol) {
                    if (!isFirst) line += ", ";
                    isFirst = false;
                    if (guidingSymbol === "e") {
                        let isSecondFirst = true;
                        const fol = follow.get(nonTerminal.getValue()) || new Set<string>();
                        for (const followSymbol of fol) {
                            if (!isSecondFirst) line += ", ";
                            isSecondFirst = false;
                            line += followSymbol;
                        }
                        continue;
                    }
                    line += guidingSymbol;
                } else if (rule[0].getType() === SYMBOL_TYPE.NON_TERMINAL) {
                    const firstSetOfRule0 = firstStar.get(rule[0].getValue()) || new Set<string>();
                    if (firstSetOfRule0.has(guidingSymbol)) {
                        if (!isFirst) line += ", ";
                        isFirst = false;
                        line += guidingSymbol;
                    }
                }
            }
            lines.push(line);
        }
    }
    return lines.join("\n");
}


const sampleInput = `
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
`;

console.log(optimize(sampleInput));