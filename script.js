// ==========================================================================
// 1. 전역 변수 및 초기화 (로컬스토리지 키 설정)
// ==========================================================================
const STORAGE_KEY = 'todos'; 
let todos = [];
let currentEditId = null; // 현재 수정(편집) 중인 할 일의 ID

document.addEventListener('DOMContentLoaded', () => {
    loadTodosFromStorage();
    initEventListeners();
    renderTodos(); // 초기 화면 렌더링
});

// 하이브리드 데이터 호환 로드 함수 (데이터 유실 방지)
function loadTodosFromStorage() {
    try {
        const storageData = localStorage.getItem(STORAGE_KEY);
        if (storageData) {
            const rawTodos = JSON.parse(storageData);
            todos = rawTodos.map(todo => ({
                id: todo.id || Date.now() + Math.random(),
                title: todo.title || todo.text || todo.content || '', 
                date: todo.date || todo.dueDate || '',
                category: todo.category || '전체',
                completed: todo.completed || false
            }));
        } else {
            todos = [];
        }
    } catch (e) {
        console.error("로컬스토리지를 읽어오는 중 오류 발생:", e);
        todos = [];
    }
}

function saveTodosToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
        console.error("로컬스토리지에 저장하는 중 오류 발생:", e);
    }
}

// ==========================================================================
// 2. 이벤트 리스너 및 모달, 검색 제어
// ==========================================================================
function initEventListeners() {
    const openModalBtn = document.getElementById('open-add-modal-btn');
    const modalOverlay = document.getElementById('todo-modal');
    const modalTitle = document.getElementById('modal-title');
    
    // HTML 내부 실제 ID 매핑
    const titleInput = document.getElementById('modal-todo-input');
    const dateInput = document.getElementById('modal-date-input');
    const categorySelect = document.getElementById('modal-category-select');
    const searchInput = document.getElementById('search-input'); // 검색창 ID
    
    const saveBtn = document.getElementById('modal-save-btn');
    const closeBtn = document.getElementById('modal-close-btn');
    const deleteBtn = document.getElementById('modal-delete-btn');

    // 🔍 [실시간 검색 구현] 검색창에 타이핑할 때마다 즉시 리스트 갱신
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderTodos(); 
        });
    }

    // [1] 상단 '할 일 추가' 버튼 클릭 시 모달 열기 (등록 모드)
    if (openModalBtn && modalOverlay) {
        openModalBtn.addEventListener('click', () => {
            currentEditId = null; 
            if (modalTitle) modalTitle.innerText = '할 일 추가';
            modalOverlay.style.display = 'flex'; 
            
            if (titleInput) titleInput.value = '';
            if (categorySelect) categorySelect.value = '전체';
            if (dateInput) dateInput.value = new Date().toISOString().substring(0, 10);
            
            removeErrorMessage();

            if (deleteBtn) {
                deleteBtn.style.setProperty('display', 'none', 'important');
            }
        });
    }

    // [2] 모달 내부 '저장' 버튼 클릭 시 (추가 또는 수정 완료)
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            removeErrorMessage();

            if (!titleInput || !titleInput.value.trim()) {
                showErrorMessage(titleInput, '할 일 내용을 입력해 주세요!');
                return; 
            }

            if (currentEditId === null) {
                // [등록 모드]
                const newTodo = {
                    id: Date.now(),
                    title: titleInput.value.trim(),
                    date: dateInput ? dateInput.value : '',
                    category: categorySelect ? categorySelect.value : '전체',
                    completed: false
                };
                todos.push(newTodo);
            } else {
                // [편집 모드]
                const todoIndex = todos.findIndex(t => t.id == currentEditId);
                if (todoIndex !== -1) {
                    todos[todoIndex].title = titleInput.value.trim();
                    todos[todoIndex].date = dateInput ? dateInput.value : '';
                    todos[todoIndex].category = categorySelect ? categorySelect.value : '전체';
                }
            }

            saveTodosToStorage();
            renderTodos(); 
            if (modalOverlay) modalOverlay.style.display = 'none'; 
        });
    }

    // [3] 모달 내부 '삭제' 버튼 클릭 시
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentEditId !== null) {
                todos = todos.filter(t => t.id != currentEditId);
                saveTodosToStorage();
                renderTodos();
                if (modalOverlay) modalOverlay.style.display = 'none';
            }
        });
    }

    // [4] 취소 버튼 클릭 시 모달 닫기
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (modalOverlay) modalOverlay.style.display = 'none';
        });
    }

    // [5] 모달 바깥 배경 클릭 시 닫기
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.style.display = 'none';
            }
        });
    }
}

// ==========================================================================
// 3. 편집(수정) 버튼 클릭 시 모달 제어 함수
// ==========================================================================
function openEditModal(id) {
    const modalOverlay = document.getElementById('todo-modal');
    const modalTitle = document.getElementById('modal-title');
    const titleInput = document.getElementById('modal-todo-input');
    const dateInput = document.getElementById('modal-date-input');
    const categorySelect = document.getElementById('modal-category-select');
    const deleteBtn = document.getElementById('modal-delete-btn');

    const todo = todos.find(t => t.id == id);
    if (!todo) return;

    currentEditId = id; 
    if (modalTitle) modalTitle.innerText = '할 일 수정/편집';
    
    if (titleInput) titleInput.value = todo.title;
    if (dateInput) dateInput.value = todo.date;
    if (categorySelect) categorySelect.value = todo.category;

    removeErrorMessage();

    if (deleteBtn) {
        deleteBtn.style.setProperty('display', 'inline-block', 'important');
    }

    if (modalOverlay) modalOverlay.style.display = 'flex';
}

// ==========================================================================
// 4. 오류 안내 메시지 동적 제어 함수
// ==========================================================================
function showErrorMessage(inputElement, message) {
    if (!inputElement) return;
    inputElement.style.borderColor = '#ef4444';
    inputElement.focus();

    if (document.querySelector('.todo-error-msg')) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'todo-error-msg';
    errorDiv.innerText = message;
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.85rem';
    errorDiv.style.fontWeight = 'bold';
    errorDiv.style.marginTop = '6px';
    errorDiv.style.textAlign = 'left';

    inputElement.insertAdjacentElement('afterend', errorDiv);

    inputElement.addEventListener('input', function onInput() {
        removeErrorMessage();
        inputElement.removeEventListener('input', onInput);
    });
}

function removeErrorMessage() {
    const titleInput = document.getElementById('modal-todo-input');
    if (titleInput) {
        titleInput.style.borderColor = ''; 
    }
    const existingMsg = document.querySelector('.todo-error-msg');
    if (existingMsg) {
        existingMsg.remove();
    }
}

// ==========================================================================
// 5. 화면 리스트 렌더링 (리얼타임 검색 필터 포함)
// ==========================================================================
function renderTodos() {
    const todoListContainer = document.getElementById('todo-list');
    const searchInput = document.getElementById('search-input');
    if (!todoListContainer) return;
    
    todoListContainer.innerHTML = '';

    // 검색창 텍스트 가져오기 (소문자 변환하여 대소문자 구분 없이 검색 가능하게 처리)
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';

    // 🔍 전체 할 일 리스트 중 검색 키워드가 포함된 할 일만 필터링
    const filteredTodos = todos.filter(todo => {
        return todo.title.toLowerCase().includes(keyword);
    });

    // 검색 결과든, 전체 리스트든 비어있을 때 처리
    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#64748b';
        emptyMessage.style.padding = '30px 0';
        emptyMessage.style.listStyle = 'none';
        
        // 검색 키워드가 있을 때와 없을 때 안내 텍스트 다르게 표기
        if (keyword) {
            emptyMessage.innerText = `'${keyword}'가 포함된 검색 결과가 없습니다.`;
        } else {
            emptyMessage.innerText = '등록된 할 일이 없습니다. 새로운 할 일을 추가해 보세요!';
        }
        
        todoListContainer.appendChild(emptyMessage);
        return;
    }

    // 필터링된 결과물만 화면에 출력
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';

        const completedClass = todo.completed ? 'completed' : '';

        li.innerHTML = `
            <div class="todo-left">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="todo-info">
                    <span class="todo-text ${completedClass}">${escapeHtml(todo.title)}</span>
                    <span class="todo-meta">[${todo.category}] 마감일: ${todo.date}</span>
                </div>
            </div>
            <button class="edit-btn">편집</button>
        `;

        // 체크박스 상태 변경 이벤트
        const checkbox = li.querySelector('.todo-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                todo.completed = checkbox.checked;
                saveTodosToStorage();
                renderTodos(); 
            });
        }

        // 편집 버튼 클릭 이벤트
        const editBtn = li.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                openEditModal(todo.id);
            });
        }

        todoListContainer.appendChild(li);
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}