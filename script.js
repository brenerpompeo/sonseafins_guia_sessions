document.addEventListener('DOMContentLoaded', () => {
  // --- Seletores Globais (Melhor performance selecionando uma vez) ---
  const themeToggleButton = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  const progressBar = document.getElementById('progressBar');
  const progressPercentage = document.getElementById('progressPercentage');
  const phaseNavContainer = document.querySelector('nav[role="tablist"]'); // Para event delegation
  const phaseNavButtons = document.querySelectorAll('.phase-nav-btn');
  const phaseContentSections = document.querySelectorAll('.phase-content');
  const taskCheckboxes = document.querySelectorAll('.task-checkbox');
  const notesTextarea = document.getElementById('projectNotes');
  const saveNotesButton = document.getElementById('saveNotes');
  const notesStatus = document.getElementById('notesStatus');
  const sessionNumberTitle = document.getElementById('sessionNumberTitle');
  const sessionNumberIntro = document.getElementById('sessionNumberIntro');
  const sessionNumberNotesTitle = document.getElementById('sessionNumberNotesTitle');
  const appVersionSpan = document.getElementById('appVersion');
  const lastUpdatedSpan = document.getElementById('lastUpdated');


  // --- Configuração Inicial ---
  let SESSION_ID = getCurrentSessionId(); // Tenta obter o ID da session
  console.log(`Initializing for Session ID: ${SESSION_ID}`);

  // Chaves dinâmicas no localStorage para suportar múltiplas sessions
  const LS_KEYS = {
    theme: 'themePreference',
    checkboxes: `session_${SESSION_ID}_checkboxes`,
    notes: `session_${SESSION_ID}_notes`
  };

  // --- Funções Auxiliares ---

  /**
   * Tenta obter o ID da sessão.
   * Prioridade: Parâmetro URL 'session' > Atributo data-session-id no body > Conteúdo do H2 > Fallback.
   * @returns {string} O ID da sessão encontrado ou um fallback.
   */
  function getCurrentSessionId() {
    // 1. Tentar parâmetro da URL (Ex: ?session=123) - MAIS RECOMENDADO
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('session');
    if (urlSessionId) return urlSessionId;

    // 2. Tentar atributo data no body (Ex: <body data-session-id="123">)
    const bodySessionId = document.body.dataset.sessionId;
    if (bodySessionId) return bodySessionId;

    // 3. Tentar pegar do conteúdo do H2 (Menos robusto)
    const h2Element = document.getElementById('sessionNumberTitle');
    if (h2Element && h2Element.textContent && h2Element.textContent !== '?') {
        return h2Element.textContent.trim();
    }

    // 4. Fallback se nada for encontrado
    console.warn("Session ID not found via URL, data-attribute, or H2. Using fallback 'default_session'. Data might be shared or overwritten if multiple unnamed sessions are used.");
    return 'default_session';
  }

  /**
   * Atualiza os elementos da UI que exibem o número da sessão e o título da página.
   * @param {string} sessionId - O ID da sessão a ser exibido.
   */
  function updateSessionNumbers(sessionId) {
    const displayId = (sessionId && sessionId !== 'default_session') ? sessionId : '?';

    if (sessionNumberTitle) sessionNumberTitle.textContent = displayId;
    if (sessionNumberIntro) sessionNumberIntro.textContent = displayId;
    if (sessionNumberNotesTitle) sessionNumberNotesTitle.textContent = displayId;

    // Atualiza o título da página
    document.title = `Sons & Sessions | Guia Prático ${displayId !== '?' ? '#' + displayId : ''}`;
  }

  /**
   * Atualiza informações no rodapé (versão e data).
   */
  function updateFooterInfo() {
      if (appVersionSpan) appVersionSpan.textContent = "1.1.0"; // Atualizar conforme necessário
      if (lastUpdatedSpan) {
          // Formata a data atual para DD/MM/AAAA
          const today = new Date();
          const day = String(today.getDate()).padStart(2, '0');
          const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses são 0-indexados
          const year = today.getFullYear();
          lastUpdatedSpan.textContent = `${day}/${month}/${year}`;
      }
  }


  // --- Lógica do Tema (Dark/Light Mode) ---

  /**
   * Aplica o tema (dark ou light) à UI.
   * @param {string} theme - 'dark' ou 'light'.
   */
  function applyTheme(theme) {
    const sunIcon = themeToggleButton?.querySelector('.icon-sun');
    const moonIcon = themeToggleButton?.querySelector('.icon-moon');

    if (theme === 'dark') {
      htmlElement.classList.add('dark');
      sunIcon?.classList.replace('block', 'hidden');
      moonIcon?.classList.replace('hidden', 'block');
    } else {
      htmlElement.classList.remove('dark');
      sunIcon?.classList.replace('hidden', 'block');
      moonIcon?.classList.replace('block', 'hidden');
    }
    // Recriar ícones pode ser necessário se o Lucide tiver problemas com display:none
    // if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  /**
   * Alterna entre os temas claro e escuro e salva a preferência.
   */
  function toggleTheme() {
    const currentTheme = htmlElement.classList.contains('dark') ? 'light' : 'dark';
    try {
        localStorage.setItem(LS_KEYS.theme, currentTheme);
    } catch (error) {
        console.error("Failed to save theme preference:", error);
    }
    applyTheme(currentTheme);
  }

  /**
   * Carrega o tema salvo ou prefere o do sistema.
   */
  function loadTheme() {
    let savedTheme = 'light'; // Default to light
    try {
        savedTheme = localStorage.getItem(LS_KEYS.theme) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch (error) {
        console.error("Failed to load theme preference:", error);
        // Usa a preferência do sistema como fallback em caso de erro
        savedTheme = (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    applyTheme(savedTheme);
  }


  // --- Lógica da Navegação por Fases (Abas) ---

  /**
   * Alterna a visibilidade e o estado ativo para a fase selecionada.
   * @param {string} targetPhase - O valor do data-phase do botão clicado.
   */
  function switchPhase(targetPhase) {
    // Atualiza Botões
    phaseNavButtons.forEach(button => {
      const isTarget = button.dataset.phase === targetPhase;
      button.classList.toggle('active', isTarget);
      button.setAttribute('aria-selected', isTarget);
    });

    // Atualiza Conteúdo
    phaseContentSections.forEach(section => {
      // O ID da seção deve corresponder a `[data-phase]-content`
      const isTarget = section.id === `${targetPhase}-content`;
      section.classList.toggle('hidden', !isTarget);
      section.setAttribute('aria-hidden', String(!isTarget)); // aria-hidden espera string 'true'/'false'

      // Foco no conteúdo recém-exibido para acessibilidade
      if (isTarget) {
          section.focus();
      }
    });
  }


  // --- Lógica dos Checkboxes e Barra de Progresso ---

   /**
    * Atualiza a barra de progresso e a porcentagem exibida.
    */
   function updateProgressBar() {
        if (!progressBar || !progressPercentage || taskCheckboxes.length === 0) {
            if (progressBar) progressBar.style.width = '0%';
            if (progressPercentage) progressPercentage.textContent = '0%';
            return; // Sai se elementos não existem ou não há tarefas
        }

        const completedTasks = document.querySelectorAll('.task-checkbox:checked').length;
        const totalTasks = taskCheckboxes.length;
        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
    }

  /**
   * Manipulador para mudança de estado de um checkbox de tarefa.
   * @param {Event} event - O evento de mudança.
   */
  function handleCheckboxChange(event) {
    const checkbox = event.target;
    const taskCard = checkbox.closest('.task-card'); // Encontra o card pai
    if (taskCard) {
      taskCard.classList.toggle('task-completed', checkbox.checked);
    }
    saveCheckboxStates(); // Salva o novo estado
    updateProgressBar(); // Atualiza a barra
  }

  /**
   * Salva o estado (marcado/desmarcado) de todos os checkboxes no localStorage.
   */
  function saveCheckboxStates() {
    const states = {};
    taskCheckboxes.forEach(cb => {
      states[cb.id] = cb.checked;
    });
    try {
      localStorage.setItem(LS_KEYS.checkboxes, JSON.stringify(states));
    } catch (error) {
      console.error("Failed to save checkbox states to localStorage:", error);
      // Poderia exibir um erro não intrusivo para o usuário
      if (notesStatus) {
        notesStatus.textContent = 'Erro ao salvar progresso!';
        notesStatus.className = 'text-xs text-red-600 dark:text-red-400 h-4 flex-grow'; // Classe de erro
      }
    }
  }

  /**
   * Carrega os estados salvos dos checkboxes do localStorage e aplica à UI.
   */
  function loadCheckboxStates() {
    try {
      const savedStates = JSON.parse(localStorage.getItem(LS_KEYS.checkboxes) || '{}');
      taskCheckboxes.forEach(cb => {
        // Verifica se existe um estado salvo para este ID específico
        if (savedStates[cb.id] !== undefined) {
          cb.checked = savedStates[cb.id];
          // Aplica estado visual inicial ao card correspondente
          const taskCard = cb.closest('.task-card');
           if (taskCard) {
               taskCard.classList.toggle('task-completed', cb.checked);
           }
        } else {
             // Garante que checkboxes sem estado salvo comecem desmarcados
             cb.checked = false;
             const taskCard = cb.closest('.task-card');
             if (taskCard) {
                 taskCard.classList.remove('task-completed');
             }
         }
      });
    } catch (error) {
      console.error("Failed to load or parse checkbox states from localStorage:", error);
      // Poderia limpar o estado inválido para evitar erros futuros
      // localStorage.removeItem(LS_KEYS.checkboxes);
    }
    updateProgressBar(); // Atualiza a barra após carregar os estados
  }


  // --- Lógica das Anotações ---
  let saveTimeout; // Timer para limpar mensagem de status
  let noteTypingTimeout; // Timer para auto-save

  /**
   * Salva o conteúdo da área de texto das anotações no localStorage.
   */
  function saveNotes() {
    if (!notesTextarea || !saveNotesButton || !notesStatus) return; // Verifica se elementos existem

    if (saveNotesButton.disabled) return; // Evita saves múltiplos se o botão estiver desabilitado

    const notes = notesTextarea.value;
    saveNotesButton.disabled = true; // Desabilita botão durante o salvamento
    notesStatus.textContent = 'Salvando...';
    notesStatus.className = 'text-xs text-gray-500 dark:text-gray-400 h-4 flex-grow'; // Reset classes

    // Simula um pequeno delay para o feedback de salvamento ser visível (opcional)
    setTimeout(() => {
        try {
          localStorage.setItem(LS_KEYS.notes, notes);
          clearTimeout(saveTimeout); // Limpa timeout anterior de limpar status
          notesStatus.textContent = 'Anotações salvas!';
          notesStatus.className = 'text-xs text-green-600 dark:text-green-400 h-4 flex-grow'; // Classe de sucesso

          // Limpa a mensagem de sucesso após alguns segundos
          saveTimeout = setTimeout(() => {
            notesStatus.textContent = '';
          }, 3000);

        } catch (error) {
            console.error("Failed to save notes to localStorage:", error);
            notesStatus.textContent = 'Erro ao salvar!';
            notesStatus.className = 'text-xs text-red-600 dark:text-red-400 h-4 flex-grow'; // Classe de erro
             // Não limpar mensagem de erro automaticamente, deixar visível
        } finally {
           saveNotesButton.disabled = false; // Reabilita o botão após tentativa
        }
    }, 200); // Pequeno delay simulado
  }

  /**
   * Carrega as anotações salvas do localStorage para a área de texto.
   */
  function loadNotes() {
    if (!notesTextarea) return;
    try {
      notesTextarea.value = localStorage.getItem(LS_KEYS.notes) || '';
    } catch (error) {
      console.error("Failed to load notes from localStorage:", error);
       notesTextarea.value = 'Erro ao carregar anotações anteriores.';
       notesTextarea.disabled = true; // Opcional: desabilitar se houve erro grave
    }
  }

  /**
   * Manipulador para o evento input na área de notas, acionando o auto-save.
   */
   function handleNotesInput() {
       if (!notesStatus) return;
       clearTimeout(noteTypingTimeout); // Cancela o timer anterior
       notesStatus.textContent = 'Digitando...'; // Feedback visual
       notesStatus.className = 'text-xs text-gray-500 dark:text-gray-400 h-4 flex-grow'; // Reset classes
       // Define um novo timer para salvar após um período de inatividade
       noteTypingTimeout = setTimeout(saveNotes, 1500); // Salva 1.5s após parar de digitar
   }


  // --- Inicialização Geral e Event Listeners ---

  function initializeApp() {
    // 0. Atualizar números da Session e título da página
    updateSessionNumbers(SESSION_ID);

    // 0.1 Atualizar informações do rodapé
    updateFooterInfo();

    // 1. Carregar Tema Preferido
    loadTheme();
    themeToggleButton?.addEventListener('click', toggleTheme);

    // 2. Configurar Navegação por Fases
    // Encontra o botão inicial ativo ou usa o primeiro como padrão
    const initialActiveButton = phaseNavContainer?.querySelector('.phase-nav-btn.active') || phaseNavButtons[0];
    if (initialActiveButton) {
        switchPhase(initialActiveButton.dataset.phase); // Garante conteúdo inicial correto
    }
    // Adiciona listener ao container para delegação de eventos
    phaseNavContainer?.addEventListener('click', (event) => {
      const button = event.target.closest('.phase-nav-btn');
      // Só alterna se clicar em um botão válido que não esteja ativo
      if (button && !button.classList.contains('active') && button.dataset.phase) {
        switchPhase(button.dataset.phase);
      }
    });

    // 3. Carregar Estados dos Checkboxes e Adicionar Listeners
    loadCheckboxStates(); // Carrega estados salvos ANTES de adicionar listeners
    taskCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', handleCheckboxChange);
    });

    // 4. Carregar Anotações e Adicionar Listeners
    loadNotes();
    saveNotesButton?.addEventListener('click', saveNotes);
    notesTextarea?.addEventListener('input', handleNotesInput); // Listener para auto-save

    // 5. Inicializar Ícones Lucide (após o DOM estar pronto)
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
      console.log("Lucide icons initialized.");
    } else {
      console.error("Lucide library not found or failed to load.");
    }

    // 6. Foco inicial estratégico (opcional, bom para acessibilidade)
    // Pode ser o primeiro botão de navegação ou o H2 principal
    // initialActiveButton?.focus();
    // ou
    // document.getElementById('sessionTitle')?.focus(); // Exige tabindex="-1" no H2 se quiser focar programaticamente

    console.log("Sons & Sessions Guide Initialized.");
  }

  // Executa a inicialização
  initializeApp();

}); // Fim do DOMContentLoaded
