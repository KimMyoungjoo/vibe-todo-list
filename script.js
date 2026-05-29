// ==========================================================================
// 1. DOM 요소 가져오기 및 초기 데이터 세팅
// ==========================================================================
const todoList = document.getElementById('todo-list');
const openAddModalBtn = document.getElementById('open-add-modal-btn');

const todoModal = document.getElementById('todo-modal');
const modalTitle = document.getElementById('modal-title');
const modalTodoInput = document.getElementById('modal-todo-input');
const modalDateInput = document.getElementById('modal-date-input');
const modalCategorySelect = document.getElementById('modal-category-select');

const modalSaveBtn = document.getElementById('modal-save-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalDeleteBtn = document.getElementById('modal-delete-btn');

// [수정] 불필요한 하드코딩 샘플 데이터를 완전히 제거하고 빈 배열([])로 시작합니다.
let todos = JSON.parse(localStorage.getItem('vibe_todos')) || [];

// 로컬스토리지에 현재 배열 상태를 저장하는 함수
function saveToLocalStorage() {
    localStorage.setItem('vibe_todos', JSON.stringify(todos));
}

// 모달 초기 상태 숨김
todoModal.style.display = 'none';

// ==========================================================================
// 2. 모달 제어 및 데이터 등록 (로컬스토리지 저장)
// ==========================================================================
openAddModalBtn.addEventListener('click', () => {
    modalTitle.textContent = '할 일 추가';
    modalTodoInput.value = '';
    modalDateInput.value = '';
    modalCategorySelect.value = '전체';
    modalDeleteBtn.style.display = 'none';
    todoModal.style.display = 'flex';
});

modalCloseBtn.addEventListener('click', () => {
    todoModal.style.display = 'none';
});

// [등록 버튼] 입력값을 로컬스토리지에 저장하고 화면 갱신
modalSaveBtn.addEventListener('click', () => {
    const text = modalTodoInput.value.trim();
    const date = modalDateInput.value;
    const category = modalCategorySelect.value;

    if (!text) {
        alert('할 일 내용을 입력해주세요!');
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        date: date,
        category: category,
        completed: false
    };

    todos.push(newTodo);
    saveToLocalStorage(); // 로컬스토리지에 저장
    renderTodos();        // 저장된 데이터 기반으로 출력
    todoModal.style.display = 'none';
});

// ==========================================================================
// 3. 화면 출력 및 인터랙션 기능
// ==========================================================================
function renderTodos() {
    todoList.innerHTML = '';

    // 데이터가 아예 없을 때 보여줄 안내 문구 추가 (UX 개선)
    if (todos.length === 0) {
        todoList.innerHTML = `<li class="empty-message" style="text-align:center; color:#94a3b8; padding:40px 0; list-style:none;">등록된 할 일이 없습니다. 새로운 할 일을 추가해 보세요!</li>`;
        return;
    }

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        
        li.innerHTML = `
            <div class="todo-left">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleComplete(${todo.id})">
                <div class="todo-info">
                    <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                    <span class="todo-meta">📅 ${todo.date || '기한 없음'} | 🏷️ ${todo.category}</span>
                </div>
            </div>
            <button class="edit-btn">수정</button>
        `;
        
        todoList.appendChild(li);
    });
}

// [체크박스 기능] 완료 상태 토글 후 로컬스토리지 업데이트
window.toggleComplete = function(id) {
    todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
    saveToLocalStorage();
    renderTodos();
}

// 최초 페이지 로드 시 로컬스토리지 데이터 화면에 출력
renderTodos();