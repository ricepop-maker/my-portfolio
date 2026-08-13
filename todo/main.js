// localStorage에 할 일 목록을 저장할 때 사용할 키 이름
const STORAGE_KEY = 'todos';

// 할 일 목록 데이터를 저장하는 배열 (초기값은 localStorage에서 불러와 채워진다)
let todos = [];

// 새 할 일에 부여할 다음 id 값 (추가할 때마다 1씩 증가)
// 삭제된 항목의 id가 재사용되지 않도록 별도 변수로 관리한다
let nextId = 1;

// 현재 선택된 필터 상태 ('all' | 'active' | 'completed')
// 목록을 화면에 그릴 때 이 값에 따라 보여줄 항목을 걸러낸다
let currentFilter = 'all';

// localStorage에서 저장된 할 일 목록을 읽어와 todos 배열을 채우는 함수
function loadTodos() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    todos = JSON.parse(saved);
    // 기존 항목들과 id가 겹치지 않도록, 저장된 항목 중 가장 큰 id보다 1 큰 값부터 시작
    nextId = todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
  }
}

// 현재 todos 배열을 localStorage에 저장하는 함수
// 추가/삭제/완료 토글 등 todos가 바뀔 때마다 호출되어 새로고침 후에도 데이터가 유지되게 한다
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// todos 배열의 현재 상태를 화면(목록 영역)에 그대로 반영하는 함수
// 추가/삭제/완료 토글 등 todos 배열이 바뀔 때마다 항상 다시 호출된다
function renderTodos() {
  const listEl = document.querySelector('.todo-list');
  // 기존에 그려져 있던 항목들을 모두 지우고 처음부터 새로 그린다 (전체 다시 그리기 방식)
  listEl.innerHTML = '';

  // currentFilter에 따라 실제로 화면에 그릴 항목만 걸러낸다
  // (todos 배열 자체는 건드리지 않으므로 개수 표시는 항상 전체 기준을 유지할 수 있다)
  const visibleTodos = todos.filter((todo) => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true; // 'all'
  });

  visibleTodos.forEach((todo) => {
    // 할 일 한 개를 담을 li 요소 생성
    const li = document.createElement('li');
    // 완료된 항목이면 completed 클래스를 추가해 CSS로 취소선이 보이게 한다
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');

    // 완료 여부를 표시/토글하는 체크박스
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    // 체크박스를 클릭하면 이 항목의 완료 상태를 뒤집는다
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    // 할 일 텍스트를 보여주는 요소
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;

    // 항목을 목록에서 제거하는 삭제 버튼
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '삭제';
    // 삭제 버튼을 클릭하면 이 항목을 배열에서 제거한다
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    // 체크박스 - 텍스트 - 삭제 버튼 순서로 li 안에 배치
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    listEl.appendChild(li);
  });

  // 목록을 새로 그릴 때마다 전체/완료 개수 표시와 필터 버튼 강조도 함께 갱신한다
  renderCount();
  renderFilterButtons();
}

// 현재 선택된 필터에 맞는 버튼에만 active 클래스를 부여해 강조하는 함수
function renderFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
  });
}

// 필터를 변경하고 목록을 다시 그리는 함수 (필터 버튼 클릭 시 호출됨)
function setFilter(filter) {
  currentFilter = filter;
  renderTodos();
}

// 완료된 항목을 한 번에 모두 삭제하는 함수 ("완료된 항목 삭제" 버튼 클릭 시 호출됨)
function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  renderTodos();
}

// 전체 할 일 개수와 완료된 할 일 개수를 화면에 표시하는 함수
function renderCount() {
  const countEl = document.querySelector('.todo-count');
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  countEl.textContent = `전체 ${total}개, 완료 ${completed}개`;
}

// 입력창의 내용을 새 할 일로 추가하는 함수 (추가 버튼 클릭, Enter 키 입력 시 호출됨)
function addTodo() {
  const inputEl = document.querySelector('.todo-input');
  // 앞뒤 공백만 입력된 경우를 걸러내기 위해 trim 처리
  const text = inputEl.value.trim();

  // 빈 값이면 목록에 추가하지 않고 사용자에게 알림만 띄운다
  if (text === '') {
    alert('할 일을 입력하세요');
    return;
  }

  // 이미 동일한 텍스트의 할 일이 있으면 중복 추가하지 않고 알림만 띄운다
  if (todos.some((t) => t.text === text)) {
    alert('이미 등록된 할 일입니다');
    return;
  }

  // 새 할 일 객체를 배열에 추가하고, 다음 id를 1 증가시킨다
  todos.push({ id: nextId++, text: text, completed: false });
  // 다음 입력을 위해 입력창을 비운다
  inputEl.value = '';
  // 배열이 바뀌었으므로 저장 후 화면을 다시 그린다
  saveTodos();
  renderTodos();
}

// id로 항목을 찾아 완료/미완료 상태를 반전시키는 함수
function toggleTodo(id) {
  // 배열에서 id가 일치하는 항목을 찾는다 (없으면 undefined)
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    // 완료 상태를 반전 (true <-> false)
    todo.completed = !todo.completed;
    // 배열이 바뀌었으므로 저장 후 취소선 표시를 갱신하기 위해 다시 그린다
    saveTodos();
    renderTodos();
  }
}

// id로 항목을 찾아 목록에서 제거하는 함수
function deleteTodo(id) {
  // 삭제 대상 id를 제외한 나머지 항목들로 새 배열을 만들어 교체한다
  todos = todos.filter((t) => t.id !== id);
  // 배열이 바뀌었으므로 저장 후 화면을 다시 그린다
  saveTodos();
  renderTodos();
}

// 앱 초기화 함수: 저장된 데이터를 불러오고, 이벤트 리스너를 연결하고, 초기 화면을 그린다
function initApp() {
  // 새로고침해도 데이터가 유지되도록 localStorage에서 먼저 불러온다
  loadTodos();

  const addBtn = document.querySelector('.add-btn');
  const inputEl = document.querySelector('.todo-input');

  // 추가 버튼 클릭으로 할 일 추가
  addBtn.addEventListener('click', addTodo);

  // 입력창에서 Enter 키를 눌러도 추가 버튼을 클릭한 것과 동일하게 동작하도록 처리
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  });

  // 필터 버튼(전체/진행중/완료) 클릭 시 해당 필터로 전환
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  // "완료된 항목 삭제" 버튼 클릭 시 완료된 항목을 일괄 삭제
  document.querySelector('.clear-completed-btn').addEventListener('click', clearCompleted);

  // 불러온 목록을 화면에 반영
  renderTodos();
}

// HTML 문서(DOM) 로딩이 완료된 후에 initApp을 실행한다
// script 태그가 body 끝에 있어 보통은 문제 없지만, 안전하게 DOMContentLoaded 시점에 초기화한다
document.addEventListener('DOMContentLoaded', initApp);
