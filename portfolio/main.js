// 카드를 클릭하면 해당 프로젝트 페이지로 이동
const cards = document.querySelectorAll('.project-card');

cards.forEach((card) => {
  card.addEventListener('click', () => {
    const url = card.dataset.url;
    window.location.href = url;
  });
});
