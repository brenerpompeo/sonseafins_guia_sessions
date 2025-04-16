document.addEventListener('DOMContentLoaded', () => {
  // --- Seletores Globais ---
  const themeToggleButton = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  const progressBar = document.getElementById('progressBar');
  const progressPercentage = document.getElementById('progressPercentage');
  const phaseNavButtons = document.querySelectorAll('.phase-nav-btn');
  const phaseContentSections = document.querySelectorAll('.phase-content');
  const taskCheckboxes = document.querySelectorAll('.task-checkbox');
  const notesTextarea = document.getElementById('projectNotes');
  const saveNotesButton = document.getElementById('saveNotes');
  const notesStatus = document.getElementById('notesStatus');

  // --- Configuração Inicial ---
  // TODO: Obter o ID da session de forma dinâmica (ex: URL, data attribute, etc.)
  const SESSION_ID = getCurrentSessionId() || 'default_session'; // Usar um fallback
  console.log(`Initializing for Session ID: ${SESSION_ID}`);

  const LS_KEYS = {
    theme: 'themePreference',
    checkboxes: `session_${SESSION_ID}_checkboxes`,
    notes: `session_${SESSION_ID}_notes`
  };

  // --- Funções Auxiliares ---
  function getCurrentSessionId() {
    // Exemplo: Pegar de um data attribute no body ou de um meta tag
    // return document.body.dataset.sessionId;
    // Ou parsear da URL: new URLSearchParams(window.location.search).get('session');
    // Por agora, vamos tentar pegar do título (simplificado)
    const titleMatch = document.title.match(/#(\d+)/);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1];
    }
    // Ou pegar do H2
    const h2Element = document.getElementById('sessionNumberTitle');
    if (h2Element && h2Element.textContent !== '?') {
        return h2Element.textContent;
    }
    return null; // Retorna null se não conseguir encontrar
  }

  function updateSessionNumbers(sessionId) {
    if (sessionId && sessionId !== 'default_session') {
        document.getElementById('sessionNumberTitle').textContent = sessionId;
        document.getElementById('sessionNumberIntro').textContent = sessionId;
        document.getElementById('sessionNumberNotesTitle').textContent = sessionId;
        document.title = `Sons & Sessions | Guia Prático #${sessionId}`; // Atualiza title
    } else {
        // Mantém placeholders ou informa que é genérico
        console.warn("Session ID not found, using generic placeholders.");
         document.title = `Sons & Sessions | Guia Prático`;
    }
  }


  // --- Lógica do Tema (Dark/Light Mode) ---
  function applyTheme(theme) {
    const sunIcon = themeToggleButton.querySelector('.icon-sun');
    const moonIcon = themeToggleButton.querySelector('.icon-moon');

    if (theme === 'dark') {
      htmlElement.classList.add('dark');
      sunIcon?.classList.remove('block');
      sunIcon?.classList.add('hidden');
      moonIcon?.classList.remove('hidden');
      moonIcon?.classList.add('block');
    } else {
      htmlElement.classList.remove('dark');
      sunIcon?.classList.remove('hidden');
      sunIcon?.classList.add('block');
      moonIcon?.classList.remove('block');
      moonIcon?.classList.add('hidden');
    }
  }

  function toggleTheme() {
    const currentTheme = htmlElement.classList.contains('dark') ? 'light' : 'dark';
    localStorage.setItem(LS_KEYS.theme, currentTheme);
    applyTheme(currentTheme);
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem(LS_KEYS.theme) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
  }

  // --- Lógica da Navegação por Fases (Abas) ---
  function switchPhase(targetPhase) {
    // Atualiza Botões
    phaseNavButtons.forEach(button => {
      const isTarget = button.dataset.phase === targetPhase;
      button.classList.toggle('active', isTarget);
      button.setAttribute('aria-selected', isTarget);
    });

    // Atualiza Conteúdo
    phaseContentSections.forEach(section => {
      const isTarget = section.id === `${targetPhase}-content`;
      section.classList.toggle('hidden', !isTarget);
      section.setAttribute('aria-hidden', !isTarget); // Acessibilidade
    });
  }

  // --- Lógica dos Checkboxes e Barra de Progresso ---
   function updateProgressBar() {
        const totalTasks = taskCheckboxes.length;
        if (totalTasks === 0) {
            progressBar.style.width = '0%';
            progressPercentage.textContent = '0%';
            return;
        }
        const completedTasks = document.querySelectorAll('.task-checkbox:checked').length;
        const percentage = Math.round((completedTasks / totalTasks) * 100);

        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
    }

  function handleCheckboxChange(event) {
    const checkbox = event.target;
    const taskCard = checkbox.closest('.task-card');
    if (taskCard) {
      taskCard.classList.toggle('task-completed', checkbox.checked);
    }
    saveCheckboxStates();
    updateProgressBar();
  }

  function saveCheckboxStates() {
    const states = {};
    taskCheckboxes.forEach(cb => {
      states[cb.id] = cb.checked;
    });
    try {
      localStorage.setItem(LS_KEYS.checkboxes, JSON.stringify(states));
    } catch (error) {
      console.error("Failed to save checkbox states to localStorage:", error);
      // Poderia mostrar um erro para o usuário aqui
    }
  }

  function loadCheckboxStates() {
    try {
      const savedStates = JSON.parse(localStorage.getItem(LS_KEYS.checkboxes) || '{}');
      taskCheckboxes.forEach(cb => {
        if (savedStates[cb.id] !== undefined) {
          cb.checked = savedStates[cb.id];
          // Aplica estado visual inicial
          const taskCard = cb.closest('.task-card');
           if (taskCard) {
               taskCard.classList.toggle('task-completed', cb.checked);
           }
        }
      });
    } catch (error) {
      console.error("Failed to load checkbox states from localStorage:", error);
      // Limpar estado inválido?
      // localStorage.removeItem(LS_KEYS.checkboxes);
    }
    updateProgressBar(); // Atualiza a barra após carregar os estados
  }

  // --- Lógica das Anotações ---
  let saveTimeout;
  function saveNotes() {
    if (saveNotesButton.disabled) return; // Evita saves múltiplos

    const notes = notesTextarea.value;
    saveNotesButton.disabled = true;
    notesStatus.textContent = 'Salvando...';
    notesStatus.classList.remove('text-green-600', 'dark:text-green-400', 'text-red-600', 'dark:text-red-400');
    notesStatus.classList.add('text-gray-500', 'dark:text-gray-400');


    try {
      localStorage.setItem(LS_KEYS.notes, notes);
      clearTimeout(saveTimeout); // Limpa timeout anterior se houver
      notesStatus.textContent = 'Anotações salvas!';
      notesStatus.classList.remove('text-gray-500', 'dark:text-gray-400', 'text-red-600', 'dark:text-red-400');
      notesStatus.classList.add('text-green-600', 'dark:text-green-400');
      saveTimeout = setTimeout(() => {
        notesStatus.textContent = '';
      }, 3000); // Limpa mensagem após 3 segundos

    } catch (error) {
        console.error("Failed to save notes to localStorage:", error);
        notesStatus.textContent = 'Erro ao salvar!';
        notesStatus.classList.remove('text-gray-500', 'dark:text-gray-400', 'text-green-600', 'dark:text-green-400');
        notesStatus.classList.add('text-red-600', 'dark:text-red-400');
         // Não limpar mensagem de erro automaticamente
    } finally {
       saveNotesButton.disabled = false; // Reabilita o botão
    }
  }

  function loadNotes() {
    try {
      notesTextarea.value = localStorage.getItem(LS_KEYS.notes) || '';
    } catch (error) {
      console.error("Failed to load notes from localStorage:", error);
       notesTextarea.value = 'Erro ao carregar anotações anteriores.';
       notesTextarea.disabled = true; // Opcional: desabilitar se houve erro
    }
  }

  // --- Inicialização e Event Listeners ---

  // 0. Atualizar números da Session (se possível)
  updateSessionNumbers(SESSION_ID);

  // 1. Carregar Tema
  loadTheme();
  themeToggleButton.addEventListener('click', toggleTheme);

  // 2. Navegação por Fases
  const initialPhaseButton = document.querySelector('.phase-nav-btn.active');
  const initialPhase = initialPhaseButton ? initialPhaseButton.dataset.phase : phaseNavButtons[0]?.dataset.phase;
  if (initialPhase) {
    switchPhase(initialPhase); // Garante que o conteúdo inicial correto seja mostrado
  }
  document.querySelector('nav[role="tablist"]')?.addEventListener('click', (event) => {
    const button = event.target.closest('.phase-nav-btn');
    if (button && !button.classList.contains('active')) {
      switchPhase(button.dataset.phase);
    }
  });

  // 3. Checkboxes e Barra de Progresso
  loadCheckboxStates(); // Carrega estados salvos
  taskCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleCheckboxChange);
  });

  // 4. Anotações
  loadNotes();
  saveNotesButton.addEventListener('click', saveNotes);
  // Opcional: Salvar automaticamente após um tempo de inatividade
   let noteTypingTimeout;
   notesTextarea.addEventListener('input', () => {
       clearTimeout(noteTypingTimeout);
       notesStatus.textContent = 'Digitando...'; // Feedback de digitação
       notesStatus.classList.remove('text-green-600', 'dark:text-green-400', 'text-red-600', 'dark:text-red-400');
       notesStatus.classList.add('text-gray-500', 'dark:text-gray-400');
       noteTypingTimeout = setTimeout(saveNotes, 1500); // Salva 1.5s após parar de digitar
   });


  // 5. Inicializar Ícones Lucide
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
    console.log("Lucide icons initialized.");
  } else {
    console.error("Lucide library not found.");
  }

  // 6. TODO: Preencher informações dinâmicas como versão e data de atualização no rodapé
  // document.getElementById('appVersion').textContent = '1.0.0'; // Exemplo
  // document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString('pt-BR'); // Exemplo

});