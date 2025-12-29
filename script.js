// Calculator - The Odin Project

// ==================== BASIC MATH FUNCTIONS ====================

function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        return 'ERROR';
    }
    return a / b;
}

// ==================== OPERATE FUNCTION ====================

function operate(operator, a, b) {
    a = parseFloat(a);
    b = parseFloat(b);
    
    switch (operator) {
        case '+':
            return add(a, b);
        case '-':
            return subtract(a, b);
        case '*':
            return multiply(a, b);
        case '/':
            return divide(a, b);
        default:
            return null;
    }
}

// ==================== CALCULATOR STATE ====================

let firstNumber = '';
let secondNumber = '';
let currentOperator = null;
let shouldResetDisplay = false;
let lastResult = null;

// ==================== DOM ELEMENTS ====================

const currentOperandDisplay = document.querySelector('.current-operand');
const previousOperandDisplay = document.querySelector('.previous-operand');
const digitButtons = document.querySelectorAll('.digit');
const operatorButtons = document.querySelectorAll('.operator');
const equalsButton = document.querySelector('[data-action="equals"]');
const clearButton = document.querySelector('[data-action="clear"]');
const backspaceButton = document.querySelector('[data-action="backspace"]');
const decimalButton = document.querySelector('[data-action="decimal"]');
const percentButton = document.querySelector('[data-action="percent"]');

// ==================== DISPLAY FUNCTIONS ====================

function updateDisplay(value) {
    currentOperandDisplay.classList.remove('error');
    
    if (value === 'ERROR') {
        currentOperandDisplay.textContent = 'Nice try 😏';
        currentOperandDisplay.classList.add('error');
        return;
    }
    
    // Round long decimals to prevent overflow
    if (typeof value === 'number') {
        // If it's a very long decimal, round it
        if (value.toString().length > 12) {
            value = parseFloat(value.toPrecision(10));
        }
    }
    
    currentOperandDisplay.textContent = value;
}

function updatePreviousDisplay() {
    if (firstNumber && currentOperator) {
        const operatorSymbol = getOperatorSymbol(currentOperator);
        previousOperandDisplay.textContent = `${firstNumber} ${operatorSymbol}`;
    } else {
        previousOperandDisplay.textContent = '';
    }
}

function getOperatorSymbol(op) {
    const symbols = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷'
    };
    return symbols[op] || op;
}

// ==================== INPUT HANDLERS ====================

function inputDigit(digit) {
    // After showing result, start fresh with new number
    if (shouldResetDisplay || currentOperandDisplay.textContent === '0') {
        currentOperandDisplay.textContent = digit;
        shouldResetDisplay = false;
    } else {
        // Prevent overflow
        if (currentOperandDisplay.textContent.length >= 12) return;
        currentOperandDisplay.textContent += digit;
    }
}

function inputDecimal() {
    // After result, start fresh with "0."
    if (shouldResetDisplay) {
        currentOperandDisplay.textContent = '0.';
        shouldResetDisplay = false;
        return;
    }
    
    // Don't add decimal if one already exists
    if (currentOperandDisplay.textContent.includes('.')) return;
    
    currentOperandDisplay.textContent += '.';
}

function inputOperator(operator) {
    const currentValue = currentOperandDisplay.textContent;
    
    // If we already have a first number and operator, calculate first
    if (firstNumber && currentOperator && !shouldResetDisplay) {
        secondNumber = currentValue;
        const result = operate(currentOperator, firstNumber, secondNumber);
        
        if (result === 'ERROR') {
            updateDisplay(result);
            clearAll();
            return;
        }
        
        updateDisplay(result);
        firstNumber = result.toString();
    } else {
        firstNumber = currentValue;
    }
    
    currentOperator = operator;
    shouldResetDisplay = true;
    updatePreviousDisplay();
    
    // Highlight active operator
    clearOperatorHighlight();
    const activeBtn = document.querySelector(`[data-operator="${operator}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

function calculate() {
    if (!currentOperator || !firstNumber) return;
    
    // Get second number from display
    secondNumber = currentOperandDisplay.textContent;
    
    // Perform calculation
    const result = operate(currentOperator, firstNumber, secondNumber);
    
    if (result === 'ERROR') {
        updateDisplay(result);
        clearAll();
        return;
    }
    
    // Update display with result
    previousOperandDisplay.textContent = `${firstNumber} ${getOperatorSymbol(currentOperator)} ${secondNumber} =`;
    updateDisplay(result);
    
    // Store result for potential chaining
    lastResult = result;
    firstNumber = result.toString();
    currentOperator = null;
    secondNumber = '';
    shouldResetDisplay = true;
    
    clearOperatorHighlight();
}

function clearAll() {
    firstNumber = '';
    secondNumber = '';
    currentOperator = null;
    shouldResetDisplay = false;
    lastResult = null;
    updateDisplay('0');
    previousOperandDisplay.textContent = '';
    clearOperatorHighlight();
}

function backspace() {
    if (shouldResetDisplay) return;
    
    const current = currentOperandDisplay.textContent;
    
    if (current.length === 1 || (current.length === 2 && current.startsWith('-'))) {
        currentOperandDisplay.textContent = '0';
    } else {
        currentOperandDisplay.textContent = current.slice(0, -1);
    }
}

function percent() {
    const current = parseFloat(currentOperandDisplay.textContent);
    const result = current / 100;
    updateDisplay(result);
}

function clearOperatorHighlight() {
    operatorButtons.forEach(btn => btn.classList.remove('active'));
}

// ==================== EVENT LISTENERS ====================

// Digit buttons
digitButtons.forEach(button => {
    button.addEventListener('click', () => {
        inputDigit(button.dataset.digit);
        clearOperatorHighlight();
    });
});

// Operator buttons
operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        inputOperator(button.dataset.operator);
    });
});

// Equals button
equalsButton.addEventListener('click', calculate);

// Clear button
clearButton.addEventListener('click', clearAll);

// Backspace button
backspaceButton.addEventListener('click', backspace);

// Decimal button
decimalButton.addEventListener('click', () => {
    inputDecimal();
    clearOperatorHighlight();
});

// Percent button
percentButton.addEventListener('click', percent);

// ==================== KEYBOARD SUPPORT (Extra Credit) ====================

document.addEventListener('keydown', (e) => {
    // Prevent default for calculator keys
    if (e.key.match(/[0-9]/) || 
        ['+', '-', '*', '/', 'Enter', '=', 'Escape', 'Backspace', '.'].includes(e.key)) {
        e.preventDefault();
    }
    
    // Digits
    if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
        clearOperatorHighlight();
    }
    
    // Operators
    if (['+', '-', '*', '/'].includes(e.key)) {
        inputOperator(e.key);
    }
    
    // Equals / Enter
    if (e.key === '=' || e.key === 'Enter') {
        calculate();
    }
    
    // Clear (Escape)
    if (e.key === 'Escape') {
        clearAll();
    }
    
    // Backspace
    if (e.key === 'Backspace') {
        backspace();
    }
    
    // Decimal
    if (e.key === '.') {
        inputDecimal();
        clearOperatorHighlight();
    }
    
    // Percent
    if (e.key === '%') {
        percent();
    }
});

// Initialize
console.log('Calculator loaded! Use mouse or keyboard.');