const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');
const convertBtn = document.getElementById('convertBtn');
const swapBtn = document.getElementById('swap-btn');
const resultDiv = document.getElementById('result');

async function convert() {
  const amount = Number(amountInput.value);
  const from = fromCurrencySelect.value;
  const to = toCurrencySelect.value;

  if (!amountInput.value || amount <= 0) {
    resultDiv.textContent = '금액을 올바르게 입력해주세요';
    return;
  }

  resultDiv.textContent = '변환 중...';

  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);

    if (!response.ok) {
      resultDiv.textContent = '환율 정보를 가져오지 못했습니다';
      return;
    }

    const data = await response.json();
    const rate = data.rates[to];
    const converted = amount * rate;

    resultDiv.textContent = `${amount} ${from} = ${converted.toFixed(2)} ${to}`;
  } catch (error) {
    resultDiv.textContent = '환율 정보를 가져오지 못했습니다';
  }
}

convertBtn.addEventListener('click', convert);

swapBtn.addEventListener('click', () => {
  const from = fromCurrencySelect.value;
  fromCurrencySelect.value = toCurrencySelect.value;
  toCurrencySelect.value = from;

  if (amountInput.value) {
    convert();
  }
});
