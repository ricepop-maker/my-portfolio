// 카드를 클릭하면 해당 프로젝트 페이지로 이동
const cards = document.querySelectorAll('.project-card');

cards.forEach((card) => {
  card.addEventListener('click', () => {
    const url = card.dataset.url;
    window.location.href = url;
  });
});

// 테마 전환 기능 (라이트/다크/오션/포레스트/선셋)
const THEME_STORAGE_KEY = 'portfolio-theme';
const DEFAULT_THEME = 'light';
const themeButtons = document.querySelectorAll('.theme-btn');

// 테마 적용 및 버튼 활성 상태 표시
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  console.log(`현재 테마: ${theme}`);
}

themeButtons.forEach((btn) => {
  btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
});

// 저장된 테마가 있으면 불러오고, 없으면 라이트 모드로 시작
const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
applyTheme(savedTheme);
