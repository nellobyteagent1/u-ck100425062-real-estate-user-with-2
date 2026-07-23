(() => {
  'use strict';

  const menuButton = document.querySelector('.menu-button');
  const navigation = document.querySelector('#primary-navigation');
  const currentYear = document.querySelector('#current-year');
  const interestForm = document.querySelector('#interest-form');
  const formStatus = document.querySelector('#form-status');
  const calculator = document.querySelector('.calculator');
  const calculatorResult = document.querySelector('#calculator-result');
  const calculation = document.querySelector('#calculation');

  let displayValue = '0';
  let firstValue = null;
  let operator = null;
  let waitingForSecondValue = false;

  const operatorSymbols = { '/': '÷', '*': '×', '-': '−', '+': '+' };

  const formatResult = (value) => {
    if (!Number.isFinite(value)) return 'Cannot divide by zero';
    return String(Number.parseFloat(value.toPrecision(12)));
  };

  const updateCalculatorDisplay = () => {
    calculatorResult.textContent = displayValue;
    calculation.textContent = firstValue !== null && operator
      ? `${firstValue} ${operatorSymbols[operator]}${waitingForSecondValue ? '' : ` ${displayValue}`}`
      : '\u00a0';
  };

  const calculate = (left, right, selectedOperator) => {
    if (selectedOperator === '+') return left + right;
    if (selectedOperator === '-') return left - right;
    if (selectedOperator === '*') return left * right;
    return right === 0 ? Infinity : left / right;
  };

  const clearCalculator = () => {
    displayValue = '0';
    firstValue = null;
    operator = null;
    waitingForSecondValue = false;
    calculator.querySelectorAll('.operator-key').forEach((key) => key.classList.remove('is-active'));
    updateCalculatorDisplay();
  };

  currentYear.textContent = String(new Date().getFullYear());

  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    navigation.classList.toggle('is-open', !expanded);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
    }
  });

  window.matchMedia('(min-width: 40.001rem)').addEventListener('change', (event) => {
    if (event.matches) {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
    }
  });

  calculator.addEventListener('click', (event) => {
    const key = event.target.closest('.calculator-key');
    if (!key) return;

    if (key.dataset.number !== undefined) {
      const number = key.dataset.number;
      if (displayValue === 'Cannot divide by zero' || waitingForSecondValue) {
        displayValue = number === '.' ? '0.' : number;
        waitingForSecondValue = false;
      } else if (number === '.') {
        if (!displayValue.includes('.')) displayValue += '.';
      } else {
        displayValue = displayValue === '0' ? number : displayValue + number;
      }
    }

    if (key.dataset.operator) {
      const inputValue = Number.parseFloat(displayValue);
      if (displayValue === 'Cannot divide by zero') return;
      if (firstValue !== null && operator && !waitingForSecondValue) {
        displayValue = formatResult(calculate(firstValue, inputValue, operator));
        firstValue = Number.parseFloat(displayValue);
      } else {
        firstValue = inputValue;
      }
      operator = key.dataset.operator;
      waitingForSecondValue = true;
      calculator.querySelectorAll('.operator-key').forEach((button) => button.classList.toggle('is-active', button === key));
    }

    if (key.dataset.action === 'equals' && operator && !waitingForSecondValue) {
      const result = calculate(firstValue, Number.parseFloat(displayValue), operator);
      calculation.textContent = `${firstValue} ${operatorSymbols[operator]} ${displayValue} =`;
      displayValue = formatResult(result);
      firstValue = null;
      operator = null;
      waitingForSecondValue = true;
      calculator.querySelectorAll('.operator-key').forEach((button) => button.classList.remove('is-active'));
      calculatorResult.textContent = displayValue;
      return;
    }

    if (key.dataset.action === 'clear') {
      clearCalculator();
      return;
    }

    if (key.dataset.action === 'delete') {
      if (displayValue === 'Cannot divide by zero') {
        clearCalculator();
        return;
      }
      if (!waitingForSecondValue) displayValue = displayValue.length > 1 ? displayValue.slice(0, -1) : '0';
    }

    updateCalculatorDisplay();
  });

  interestForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(interestForm);
    const subject = `Property enquiry from ${data.get('name')}`;
    const body = [
      `Name: ${data.get('name')}`,
      `Phone: ${data.get('phone')}`,
      `Interest: ${data.get('interest')}`,
      '',
      `Additional details: ${data.get('message') || 'None provided'}`
    ].join('\n');

    formStatus.textContent = 'Your email app is opening with your enquiry ready to send.';
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
