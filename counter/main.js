// 현재 카운트 값 (초기값 0)
let count = 0;

// 숫자를 표시할 요소 참조
const countEl = document.getElementById("count");

// 화면에 표시되는 숫자를 갱신하는 함수
function updateDisplay() {
  countEl.textContent = count;

  // 값의 부호에 따라 색상 클래스를 다시 설정 (양수: 초록, 음수: 빨강, 0: 기본색)
  countEl.classList.remove("positive", "negative");
  if (count > 0) {
    countEl.classList.add("positive");
  } else if (count < 0) {
    countEl.classList.add("negative");
  }
}

// 증가 버튼: 클릭하면 1 증가
document.getElementById("increaseBtn").addEventListener("click", () => {
  count += 1;
  updateDisplay();
});

// 감소 버튼: 클릭하면 1 감소
document.getElementById("decreaseBtn").addEventListener("click", () => {
  count -= 1;
  updateDisplay();
});

// 리셋 버튼: 클릭하면 0으로 초기화
document.getElementById("resetBtn").addEventListener("click", () => {
  count = 0;
  updateDisplay();
});
