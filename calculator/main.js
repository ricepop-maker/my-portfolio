// ===== 상태 =====
let expression = ""; // 현재까지 입력된 수식 문자열
let angleMode = "DEG"; // "DEG" 또는 "RAD" (삼각함수 각도 단위)
let justEvaluated = false; // '=' 직후 상태인지 여부 (다음 입력을 새 식으로 시작할지 결정)

const exprEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const degBtn = document.getElementById("degToggle");

// ===== 계산 엔진: 문자열 -> 토큰 -> 재귀 하강 파서 =====

// 함수로 인식할 영문 이름 목록 (asin/acos/atan을 sin/cos/tan보다 먼저 매칭해야 함)
const FUNC_NAMES = ["asin", "acos", "atan", "sin", "cos", "tan", "log", "ln", "sqrt"];

// 문자열을 토큰 배열로 분해
function tokenize(str) {
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    const ch = str[i];

    if (ch === " ") {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let numStr = ch;
      i++;
      while (i < str.length && /[0-9.]/.test(str[i])) {
        numStr += str[i];
        i++;
      }
      tokens.push({ type: "num", value: parseFloat(numStr) });
      continue;
    }
    if (ch === "√") {
      tokens.push({ type: "func", value: "sqrt" });
      i++;
      continue;
    }
    if (ch === "π") {
      tokens.push({ type: "num", value: Math.PI });
      i++;
      continue;
    }
    if (ch === "²") {
      tokens.push({ type: "square" });
      i++;
      continue;
    }
    if (ch === "!") {
      tokens.push({ type: "fact" });
      i++;
      continue;
    }
    if (ch === "%") {
      tokens.push({ type: "percent" });
      i++;
      continue;
    }
    if (ch === "^") {
      tokens.push({ type: "op", value: "^" });
      i++;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "lparen" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen" });
      i++;
      continue;
    }
    if ("+-*/".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      let word = "";
      while (i < str.length && /[a-zA-Z]/.test(str[i])) {
        word += str[i];
        i++;
      }
      if (word === "e") {
        tokens.push({ type: "num", value: Math.E });
      } else if (FUNC_NAMES.includes(word)) {
        tokens.push({ type: "func", value: word });
      } else {
        throw new Error("알 수 없는 기호: " + word);
      }
      continue;
    }
    throw new Error("알 수 없는 문자: " + ch);
  }
  return tokens;
}

// 각도 <-> 라디안 변환
function toRad(deg) {
  return (deg * Math.PI) / 180;
}
function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

// 계승 (0 이상의 정수만 허용)
function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error("계승은 0 이상의 정수에만 사용할 수 있습니다");
  }
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

// 함수 이름과 인자로 실제 계산 값을 구함
function applyFunc(name, arg) {
  switch (name) {
    case "sin":
      return Math.sin(angleMode === "DEG" ? toRad(arg) : arg);
    case "cos":
      return Math.cos(angleMode === "DEG" ? toRad(arg) : arg);
    case "tan":
      return Math.tan(angleMode === "DEG" ? toRad(arg) : arg);
    case "asin": {
      const r = Math.asin(arg);
      return angleMode === "DEG" ? toDeg(r) : r;
    }
    case "acos": {
      const r = Math.acos(arg);
      return angleMode === "DEG" ? toDeg(r) : r;
    }
    case "atan": {
      const r = Math.atan(arg);
      return angleMode === "DEG" ? toDeg(r) : r;
    }
    case "log":
      return Math.log10(arg);
    case "ln":
      return Math.log(arg);
    case "sqrt":
      if (arg < 0) throw new Error("음수의 제곱근은 계산할 수 없습니다");
      return Math.sqrt(arg);
    default:
      throw new Error("알 수 없는 함수: " + name);
  }
}

// 재귀 하강 파서: 토큰 배열을 받아 최종 숫자 값을 계산
function parse(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  // 덧셈/뺄셈 (가장 낮은 우선순위)
  function parseExpression() {
    let value = parseTerm();
    while (peek() && peek().type === "op" && (peek().value === "+" || peek().value === "-")) {
      const op = next().value;
      const rhs = parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }

  // 곱셈/나눗셈
  function parseTerm() {
    let value = parseUnary();
    while (peek() && peek().type === "op" && (peek().value === "*" || peek().value === "/")) {
      const op = next().value;
      const rhs = parseUnary();
      if (op === "/") {
        if (rhs === 0) throw new Error("0으로 나눌 수 없습니다");
        value = value / rhs;
      } else {
        value = value * rhs;
      }
    }
    return value;
  }

  // 단항 부호(-, +)
  function parseUnary() {
    if (peek() && peek().type === "op" && peek().value === "-") {
      next();
      return -parseUnary();
    }
    if (peek() && peek().type === "op" && peek().value === "+") {
      next();
      return parseUnary();
    }
    return parsePower();
  }

  // 거듭제곱 (오른쪽 결합)
  function parsePower() {
    let base = parsePostfix();
    if (peek() && peek().type === "op" && peek().value === "^") {
      next();
      const exponent = parseUnary();
      base = Math.pow(base, exponent);
    }
    return base;
  }

  // 후위 연산자: 제곱(²), 계승(!), 퍼센트(%)
  function parsePostfix() {
    let value = parsePrimary();
    while (peek() && (peek().type === "square" || peek().type === "fact" || peek().type === "percent")) {
      const t = next();
      if (t.type === "square") value = value * value;
      else if (t.type === "percent") value = value / 100;
      else if (t.type === "fact") value = factorial(value);
    }
    return value;
  }

  // 숫자, 괄호, 함수 호출
  function parsePrimary() {
    const t = peek();
    if (!t) throw new Error("수식이 올바르지 않습니다");

    if (t.type === "num") {
      next();
      return t.value;
    }
    if (t.type === "lparen") {
      next();
      const value = parseExpression();
      if (!peek() || peek().type !== "rparen") throw new Error("괄호가 맞지 않습니다");
      next();
      return value;
    }
    if (t.type === "func") {
      next();
      if (!peek() || peek().type !== "lparen") throw new Error(t.value + " 뒤에 괄호가 필요합니다");
      next();
      const arg = parseExpression();
      if (!peek() || peek().type !== "rparen") throw new Error("괄호가 맞지 않습니다");
      next();
      return applyFunc(t.value, arg);
    }
    throw new Error("수식이 올바르지 않습니다");
  }

  const result = parseExpression();
  if (pos !== tokens.length) throw new Error("수식이 올바르지 않습니다");
  return result;
}

// 닫히지 않은 괄호를 자동으로 채워줌 (편의 기능)
function autoCloseParens(expr) {
  let open = 0;
  for (const ch of expr) {
    if (ch === "(") open++;
    else if (ch === ")") open--;
  }
  return expr + ")".repeat(Math.max(0, open));
}

// 문자열 수식을 최종 계산
function evaluate(expr) {
  const tokens = tokenize(autoCloseParens(expr));
  return parse(tokens);
}

// 계산 결과를 보기 좋은 문자열로 변환 (부동소수점 오차 정리)
function formatNumber(num) {
  if (!isFinite(num)) throw new Error("계산할 수 없는 값입니다");
  const rounded = Math.round(num * 1e10) / 1e10;
  return rounded.toString();
}

// ===== 화면 갱신 =====

function render() {
  exprEl.textContent = expression;
  try {
    if (expression.length === 0) {
      resultEl.textContent = "0";
    } else {
      resultEl.textContent = formatNumber(evaluate(expression));
    }
  } catch (e) {
    // 아직 입력이 끝나지 않은 상태일 수 있으므로 이전 결과를 그대로 둠
  }
}

// ===== 입력 처리 =====

// 숫자, 소수점, 상수(π, e) 입력: '=' 직후라면 새 식으로 시작
function inputValue(value) {
  if (justEvaluated) {
    expression = "";
    justEvaluated = false;
  }
  expression += value;
  render();
}

// 연산자 입력: '=' 직후라면 이전 결과에 이어서 계속 계산
function inputOperator(op) {
  justEvaluated = false;
  expression += op;
  render();
}

// 함수 입력: 함수명 + 여는 괄호를 추가
function inputFunc(name) {
  if (justEvaluated) {
    expression = "";
    justEvaluated = false;
  }
  expression += name + "(";
  render();
}

// 후위 기호(², !, %) 입력
function inputPostfix(symbol) {
  justEvaluated = false;
  expression += symbol;
  render();
}

// 전체 지우기
function clearAll() {
  expression = "";
  justEvaluated = false;
  render();
}

// 마지막 한 글자 지우기
function backspace() {
  expression = expression.slice(0, -1);
  justEvaluated = false;
  render();
}

// 마지막 숫자의 부호를 반전
function toggleSign() {
  const match = expression.match(/(-?\d+\.?\d*)$/);
  if (!match) {
    if (expression.length === 0) expression = "-";
    render();
    return;
  }
  const numStr = match[1];
  const start = match.index;
  const toggled = numStr.startsWith("-") ? numStr.slice(1) : "-" + numStr;
  expression = expression.slice(0, start) + toggled + expression.slice(start + numStr.length);
  render();
}

// '=' 처리: 최종 계산 후 결과를 다음 계산의 시작값으로 사용
function doEquals() {
  if (expression.length === 0) return;
  try {
    const value = formatNumber(evaluate(expression));
    resultEl.textContent = value;
    expression = value;
    exprEl.textContent = expression;
  } catch (e) {
    resultEl.textContent = "Error";
    expression = "";
    exprEl.textContent = "";
  }
  justEvaluated = true;
}

// 도(DEG) / 라디안(RAD) 각도 모드 전환
function toggleAngleMode() {
  angleMode = angleMode === "DEG" ? "RAD" : "DEG";
  degBtn.textContent = angleMode;
  render();
}

// ===== 버튼 이벤트 연결 =====

document.querySelectorAll(".btn.num").forEach((btn) => {
  btn.addEventListener("click", () => inputValue(btn.dataset.value));
});

document.querySelectorAll(".btn.const").forEach((btn) => {
  btn.addEventListener("click", () => inputValue(btn.dataset.value));
});

document.querySelectorAll(".btn.op").forEach((btn) => {
  btn.addEventListener("click", () => inputOperator(btn.dataset.value));
});

document.querySelectorAll(".btn.paren").forEach((btn) => {
  // 여는 괄호는 '=' 직후에 새 식을 시작하듯 처리하고, 닫는 괄호는 이어붙임
  if (btn.dataset.value === "(") {
    btn.addEventListener("click", () => inputFunc(""));
  } else {
    btn.addEventListener("click", () => inputOperator(btn.dataset.value));
  }
});

document.querySelectorAll(".btn.func").forEach((btn) => {
  btn.addEventListener("click", () => inputFunc(btn.dataset.func));
});

document.querySelectorAll(".btn.postfix").forEach((btn) => {
  btn.addEventListener("click", () => inputPostfix(btn.dataset.value));
});

document.getElementById("clear").addEventListener("click", clearAll);
document.getElementById("backspace").addEventListener("click", backspace);
document.getElementById("plusMinus").addEventListener("click", toggleSign);
document.getElementById("equals").addEventListener("click", doEquals);
degBtn.addEventListener("click", toggleAngleMode);

// ===== 키보드 입력 지원 =====
document.addEventListener("keydown", (e) => {
  if (/[0-9.]/.test(e.key)) {
    inputValue(e.key);
  } else if ("+-*/^()".includes(e.key)) {
    inputOperator(e.key);
  } else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    doEquals();
  } else if (e.key === "Backspace") {
    backspace();
  } else if (e.key === "Escape") {
    clearAll();
  } else if (e.key === "%") {
    inputPostfix("%");
  }
});

render();
