--- START OF FILE script.js ---

document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores Globais ---
    const themeToggleButton = document.getElementById('themeToggle');
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = document.getElementById('progressPercentage');
    const phaseNavContainer = document.getElementById('phaseNav');
    const phaseContentContainer = document.getElementById('phaseContentContainer');
    const notesTextarea = document.getElementById('projectNotesInput'); // ID do textarea para *adicionar* nota
    const addNoteBtn = document.getElementById('addNoteBtn');         // ID do botão para *adicionar* nota
    const notesStatus = document.getElementById('notesStatus');
    const savedNotesListContainer = document.getElementById('savedNotesList'); // Container para listar notas salvas
    const sessionNameDisplay = document.getElementById('sessionNameDisplay');
    const sessionNotesTitleDisplay = document.getElementById('sessionNotesTitleDisplay'); // Span no título de notas
    const renameSessionBtn = document.getElementById('renameSessionBtn');
    const deleteSessionBtn = document.getElementById('deleteSessionBtn');
    const goToDashboardBtn = document.getElementById('goToDashboardBtn');
    const showDeletedTasksBtn = document.getElementById('showDeletedTasksBtn');
    const hideDeletedTasksBtn = document.getElementById('hideDeletedTasksBtn');
    const deletedTasksSection = document.getElementById('deletedTasksSection');
    const deletedTaskList = document.getElementById('deletedTaskList');
    const appVersionSpan = document.getElementById('appVersion');
    const lastUpdatedSpan = document.getElementById('lastUpdated');

    // --- Variáveis de Estado ---
    let currentSessionId = null;
    let noteSaveTimeout; // Para debounce do status de adicionar nota

    // --- Funções de UI Específicas do Guia ---

    /** Atualiza os nomes da session na UI */
    function updateSessionDisplayInfo(sessionId) {
        let displayName = "Erro: Session Inválida";
        let isDefault = false;

        if (sessionId) {
            const sessions = getAllSessions(); // De common.js
            const sessionData = sessions.find(s => s.id === sessionId);
            displayName = sessionData ? sessionData.name : `Session ID: ${sessionId}`; // Mostra ID se não achar nome
            isDefault = sessionId === DEFAULT_SESSION_ID;
        } else {
            isDefault = true; // Se não tem ID, considera default/inválido
        }

        if (sessionNameDisplay) sessionNameDisplay.textContent = displayName;
        document.title = `Guia | ${displayName}`; // Atualiza título da aba
        if (sessionNotesTitleDisplay) sessionNotesTitleDisplay.textContent = `"${displayName}"`; // Atualiza título da seção de notas

        // Desabilita renomear/excluir para session default (se aplicável)
        if (renameSessionBtn) renameSessionBtn.disabled = isDefault;
        if (deleteSessionBtn) deleteSessionBtn.disabled = isDefault;
    }

    /** Alterna a visibilidade das fases/abas */
    function switchPhase(targetPhase) {
        const phaseNavButtons = phaseNavContainer?.querySelectorAll('.phase-nav-btn');
        if (!phaseNavButtons) return;

        phaseNavButtons.forEach(button => {
            const isTarget = button.dataset.phase === targetPhase;
            button.classList.toggle('active', isTarget);
            button.setAttribute('aria-selected', String(isTarget));
        });

        const phaseContents = phaseContentContainer?.querySelectorAll('.phase-content');
        phaseContents?.forEach(section => {
            const isTarget = section.id === `${targetPhase}-content`;
            section.classList.toggle('hidden', !isTarget);
            section.setAttribute('aria-hidden', String(!isTarget));
            // Move foco para a seção ativa (melhora acessibilidade)
            if (isTarget) {
                 section.setAttribute('tabindex', '0'); // Permite foco
                 section.focus({ preventScroll: true }); // Foca sem rolar a página bruscamente
            } else {
                 section.setAttribute('tabindex', '-1'); // Remove da ordem de tabulação
            }
        });
    }

    /** Atualiza a barra de progresso baseada nas tarefas completas */
    function updateProgressBar(sessionId) {
        if (!progressBar || !progressPercentage) return;
        const tasks = loadSessionTasks(sessionId); // De common.js
        const totalTasks = tasks.length;

        if (totalTasks === 0) {
            progressBar.style.width = '0%';
            progressPercentage.textContent = '0%';
            return;
        }
        const completedTasks = tasks.filter(task => task.completed).length;
        const percentage = Math.round((completedTasks / totalTasks) * 100);

        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
    }

    /** Gera o HTML para um card de tarefa */
    function createTaskCardHtml(task) {
        // Fallback para tarefas sem ID (deve ser raro com a lógica atual)
        const taskId = task.id || `task_${Math.random().toString(36).substring(2, 9)}`;
        if (!task.id) console.warn("Rendering task without persistent ID:", task.title);

        return `
            <div class="task-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-[var(--brand-primary)]/10 transition-shadow duration-200 ${task.completed ? 'task-completed' : ''}" data-task-id="${taskId}">
                <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <!-- Coluna Esquerda: Checkbox, Título, Descrição -->
                    <div class="flex-grow min-w-0"> <!-- min-w-0 previne overflow com texto longo -->
                        <div class="flex items-start">
                            <input type="checkbox" id="cb_${taskId}" class="task-checkbox mt-1 mr-3 flex-shrink-0" ${task.completed ? 'checked' : ''} data-task-id="${taskId}">
                            <label for="cb_${taskId}" class="font-semibold text-gray-800 dark:text-gray-100 cursor-pointer break-words">${task.title || 'Tarefa sem Título'}</label>
                        </div>
                        <p class="text-gray-600 dark:text-gray-400 text-sm mt-1 pl-7 break-words">
                            ${task.description || ''}
                        </p>
                    </div>
                    <!-- Coluna Direita: Detalhes e Ações -->
                    <div class="text-sm w-full sm:w-auto flex-shrink-0 pl-7 sm:pl-0 mt-2 sm:mt-0 space-y-1 sm:flex sm:flex-col sm:items-end">
                        ${task.details ? `
                            <details class="w-full group">
                                <summary class="font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--brand-primary)] dark:hover:text-[var(--brand-primary)] inline-flex items-center cursor-pointer list-none">
                                    <span>Ver detalhes</span>
                                    <i data-lucide="chevron-down" class="details-chevron w-4 h-4 ml-1 group-open:rotate-180 transition-transform" aria-hidden="true"></i>
                                </summary>
                                <div class="details-content mt-3 pt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none prose-a:text-[var(--brand-primary)] prose-a:no-underline hover:prose-a:underline">
                                    ${task.details} <!-- Renderiza HTML dos detalhes -->
                                    <button class="edit-task-details-btn text-xs text-blue-600 hover:underline mt-2" data-task-id="${taskId}"><i data-lucide="edit-3" class="w-3 h-3 mr-1 pointer-events-none"></i>Editar Detalhes</button>
                                </div>
                            </details>`
                        : '<button class="edit-task-details-btn text-xs text-blue-600 hover:underline" data-task-id="${taskId}"><i data-lucide="plus-circle" class="w-3 h-3 mr-1 pointer-events-none"></i>Adicionar Detalhes</button>'}

                        <button class="delete-task-btn text-xs text-red-600 hover:underline" data-task-id="${taskId}">
                            <i data-lucide="trash-2" class="w-3 h-3 mr-1 pointer-events-none"></i>Excluir Tarefa
                        </button>
                    </div>
                </div>
            </div>
        `;
    }


    // --- Renderização ---

    /** Renderiza as tarefas ativas nas listas de suas respectivas fases */
    function renderTasks(sessionId) {
         console.log(`Rendering tasks for session: ${sessionId}`);
         const tasks = loadSessionTasks(sessionId); // Só carrega ativas por padrão
         const taskLists = {
             'definicao-iniciacao': document.querySelector('#definicao-iniciacao-content .task-list'),
             'planejamento-preparacao': document.querySelector('#planejamento-preparacao-content .task-list'),
             'execucao': document.querySelector('#execucao-content .task-list'),
             'pos-producao-encerramento': document.querySelector('#pos-producao-encerramento-content .task-list'),
         };

         // Limpa todas as listas antes de preencher
         Object.values(taskLists).forEach(list => { if (list) list.innerHTML = ''; });

         if (!tasks || tasks.length === 0) {
             const message = 'Nenhuma tarefa ativa encontrada para esta session.';
             Object.values(taskLists).forEach(list => { if (list) list.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 italic p-4">${message}</p>`; });
         } else {
             const tasksByPhaseHtml = tasks.reduce((acc, task) => {
                 if (!acc[task.phase]) acc[task.phase] = '';
                 if(task.id) acc[task.phase] += createTaskCardHtml(task);
                 else console.warn("Task without ID found:", task.title); // Aviso se faltar ID
                 return acc;
             }, {});

             Object.entries(tasksByPhaseHtml).forEach(([phase, phaseHtml]) => {
                 const listContainer = taskLists[phase];
                 if (listContainer) {
                      listContainer.innerHTML = phaseHtml || `<p class="text-center text-gray-500 dark:text-gray-400 italic p-4">Nenhuma tarefa nesta fase.</p>`; // Mensagem se fase vazia
                 } else { console.warn(`Task list container for phase ${phase} not found.`); }
             });
         }

         // Atualiza a barra de progresso após renderizar
         updateProgressBar(sessionId);
         // Reativa ícones Lucide após renderizar
         if (typeof lucide !== 'undefined') { try { lucide.createIcons(); } catch (e) { console.error("Error creating Lucide icons:", e); } }
         else { console.warn("Lucide library not loaded."); }
     }

    /** Renderiza as tarefas na lixeira */
    function renderDeletedTasks(sessionId) {
         if (!deletedTaskList) return;
         const deletedTasks = loadDeletedSessionTasks(sessionId); // De common.js
         deletedTaskList.innerHTML = ''; // Limpa

         if (deletedTasks.length === 0) {
             deletedTaskList.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 italic py-2">Nenhuma tarefa na lixeira.</p>';
         } else {
             const fragment = document.createDocumentFragment();
             deletedTasks.sort((a,b) => (a.title || "").localeCompare(b.title || "")); // Ordena alfabeticamente

             deletedTasks.forEach(task => {
                 const item = document.createElement('div');
                 item.className = 'deleted-task-item flex justify-between items-center p-2 bg-gray-200 dark:bg-gray-700 rounded';
                 item.dataset.taskId = task.id;
                 item.innerHTML = `
                     <span class="text-sm text-gray-600 dark:text-gray-400 truncate mr-2" title="${task.title || 'Tarefa sem título'}">${task.title || 'Tarefa sem título'}</span>
                     <button class="restore-task-btn p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full flex-shrink-0" title="Restaurar tarefa">
                         <i data-lucide="rotate-ccw" class="w-4 h-4 pointer-events-none"></i>
                         <span class="sr-only">Restaurar</span>
                     </button>
                 `;
                 fragment.appendChild(item);
             });
             deletedTaskList.appendChild(fragment);
         }
         // Reativa ícones Lucide
         if (typeof lucide !== 'undefined') { try { lucide.createIcons(); } catch (e) { console.error(e); } }
     }

    /** Renderiza a lista de anotações salvas */
    function renderNotesList(sessionId) {
        if (!savedNotesListContainer) return;
        const notes = loadSessionNotes(sessionId); // Carrega array de notas de common.js
        savedNotesListContainer.innerHTML = ''; // Limpa

        if (notes.length === 0) {
            savedNotesListContainer.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 italic py-4">Nenhuma anotação salva ainda.</p>';
        } else {
            const fragment = document.createDocumentFragment();
            notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Mais recentes primeiro

            notes.forEach(note => {
                const noteEl = document.createElement('div');
                noteEl.className = 'saved-note-item bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm';
                noteEl.dataset.noteId = note.id; // Adiciona ID para referência
                // Usando textContent para segurança ao inserir o conteúdo da nota
                const contentDiv = document.createElement('div');
                contentDiv.className = 'note-content text-sm text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-wrap break-words';
                contentDiv.textContent = note.content; // Insere como texto plano

                noteEl.innerHTML = `
                    ${contentDiv.outerHTML}
                    <div class="note-meta text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center mt-2">
                        <span>Criada em: ${new Date(note.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short'})}</span>
                        <div class="note-actions flex gap-2">
                            <button class="edit-note-btn p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full" title="Editar Anotação">
                                <i data-lucide="edit-3" class="w-3 h-3 pointer-events-none"></i>
                                <span class="sr-only">Editar</span>
                            </button>
                            <button class="delete-note-btn p-1 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full" title="Excluir Anotação">
                                <i data-lucide="trash-2" class="w-3 h-3 pointer-events-none"></i>
                                <span class="sr-only">Excluir</span>
                            </button>
                        </div>
                    </div>
                `;
                fragment.appendChild(noteEl);
            });
            savedNotesListContainer.appendChild(fragment);
        }
        // Reativa ícones Lucide
        if (typeof lucide !== 'undefined') { try { lucide.createIcons(); } catch(e){ console.error("Lucide error on renderNotesList:", e); } }
    }


    // --- Handlers de Eventos ---

    /** Lida com cliques na navegação de fases */
    function handlePhaseNavClick(event) {
        const button = event.target.closest('.phase-nav-btn');
        if (button && !button.classList.contains('active') && button.dataset.phase) {
            switchPhase(button.dataset.phase);
        }
    }

    /** Lida com eventos dentro do container de conteúdo das fases (checkbox, delete, edit details) */
    function handleContentContainerEvents(event) {
        const target = event.target;
        if (target.matches('.task-checkbox')) {
            handleCheckboxChange(target, currentSessionId);
        } else {
            const deleteButton = target.closest('.delete-task-btn');
            const editDetailsButton = target.closest('.edit-task-details-btn');
            if (deleteButton) {
                handleDeleteTask(deleteButton, currentSessionId);
            } else if (editDetailsButton) {
                handleEditTaskDetails(editDetailsButton, currentSessionId);
            }
        }
    }

    /** Lida com eventos na lista de tarefas excluídas (restaurar) */
    function handleDeletedListEvents(event) {
        const restoreButton = event.target.closest('.restore-task-btn');
        if (restoreButton) {
            handleRestoreTask(restoreButton, currentSessionId);
        }
    }

    /** Atualiza estado da tarefa (completa/incompleta) */
    function handleCheckboxChange(checkbox, sessionId) {
        const taskId = checkbox.dataset.taskId;
        const taskCard = checkbox.closest('.task-card');
        const isCompleted = checkbox.checked;
        const tasks = loadSessionTasks(sessionId); // De common.js
        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if (taskIndex > -1) {
            tasks[taskIndex].completed = isCompleted;
            saveSessionTasks(sessionId, tasks); // De common.js
            if (taskCard) { taskCard.classList.toggle('task-completed', isCompleted); }
            updateProgressBar(sessionId);
        } else {
            console.error(`Task ${taskId} not found for completion toggle.`);
            showToast('Erro ao atualizar tarefa.', 'error');
        }
    }

    /** Move uma tarefa para a lixeira */
    function handleDeleteTask(button, sessionId) {
        const taskId = button.dataset.taskId;
        const taskCard = button.closest('.task-card'); // Para pegar o título
        const taskTitle = taskCard?.querySelector('label')?.textContent || 'esta tarefa';

        if (confirm(`Mover "${taskTitle}" para a lixeira?`)) {
            const allTasks = loadSessionTasks(sessionId);
            const taskIndex = allTasks.findIndex(t => t.id === taskId);

            if (taskIndex > -1) {
                const taskToDelete = allTasks[taskIndex];
                const activeTasks = allTasks.filter(t => t.id !== taskId);
                const deletedTasks = loadDeletedSessionTasks(sessionId);

                // Adiciona à lixeira apenas se não estiver lá
                if (!deletedTasks.some(t => t.id === taskId)) {
                    deletedTasks.push(taskToDelete);
                    saveDeletedSessionTasks(sessionId, deletedTasks); // De common.js
                }
                saveSessionTasks(sessionId, activeTasks); // Salva ativas restantes
                renderTasks(sessionId); // Atualiza lista principal
                renderDeletedTasks(sessionId); // Atualiza lixeira
                showToast('Tarefa movida para lixeira!', 'success');
            } else {
                console.error(`Task ${taskId} not found for deletion.`);
                showToast('Erro: Tarefa não encontrada.', 'error');
            }
        }
    }

    /** Restaura uma tarefa da lixeira */
    function handleRestoreTask(button, sessionId) {
        const taskId = button.dataset.taskId;
        const deletedTasks = loadDeletedSessionTasks(sessionId);
        const taskToRestoreIndex = deletedTasks.findIndex(t => t.id === taskId);

        if (taskToRestoreIndex > -1) {
            const taskDataToRestore = deletedTasks[taskToRestoreIndex];
            const updatedDeletedTasks = deletedTasks.filter(t => t.id !== taskId); // Remove da lixeira

            const activeTasks = loadSessionTasks(sessionId);
            // Adiciona de volta às ativas apenas se não existir lá
            if (!activeTasks.some(t => t.id === taskId)) {
                activeTasks.push(taskDataToRestore);
                saveSessionTasks(sessionId, activeTasks);
            } else {
                console.warn(`Task ${taskId} already exists in active tasks. Removing only from deleted.`);
            }

            saveDeletedSessionTasks(sessionId, updatedDeletedTasks); // Salva lixeira atualizada
            renderTasks(sessionId); // Re-renderiza ambas as listas
            renderDeletedTasks(sessionId);
            showToast(`Tarefa "${taskDataToRestore.title}" restaurada!`, 'success');
        } else {
            console.error(`Deleted task ${taskId} not found for restoration.`);
            showToast('Erro ao restaurar tarefa.', 'error');
        }
    }

     /** Edita os detalhes HTML de uma tarefa */
     function handleEditTaskDetails(button, sessionId) {
         const taskId = button.dataset.taskId;
         const tasks = loadSessionTasks(sessionId);
         const taskIndex = tasks.findIndex(t => t.id === taskId);

         if (taskIndex > -1) {
             const task = tasks[taskIndex];
             const currentDetails = task.details || '';
             // Usar prompt para edição simples. Para edição complexa, um modal/textarea seria melhor.
             const newDetails = prompt(`Editar detalhes HTML para "${task.title}":\n(Cuidado com HTML inválido!)`, currentDetails);

             if (newDetails !== null && newDetails !== currentDetails) { // Verifica se houve mudança e não foi cancelado
                 tasks[taskIndex].details = newDetails; // Salva o novo HTML
                 saveSessionTasks(sessionId, tasks);
                 renderTasks(sessionId); // Re-renderiza para mostrar a mudança
                 showToast('Detalhes da tarefa atualizados!', 'success');
             } else if (newDetails !== null) {
                 showToast('Nenhuma alteração feita nos detalhes.', 'info');
             }
         } else {
             console.error(`Task ${taskId} not found for editing details.`);
             showToast('Erro: Tarefa não encontrada.', 'error');
         }
     }

    /** Adiciona uma nova anotação */
    function addNoteHandler(sessionId) {
        if (!notesTextarea || !addNoteBtn || !notesStatus) return;
        if (addNoteBtn.disabled) return;

        const newNoteContent = notesTextarea.value.trim();
        if (!newNoteContent) {
            showToast('Digite algo na anotação.', 'info');
            notesTextarea.focus();
            return;
        }

        addNoteBtn.disabled = true;
        notesStatus.textContent = 'Adicionando...';
        notesStatus.className = 'text-xs text-gray-500 dark:text-gray-400 h-4 flex-grow';

        setTimeout(() => { // Pequeno delay para feedback
            const notes = loadSessionNotes(sessionId);
            const newNote = {
                id: crypto.randomUUID(),
                content: newNoteContent,
                createdAt: new Date().toISOString()
            };
            notes.push(newNote);
            const success = saveSessionNotes(sessionId, notes);

            if (success) {
                clearTimeout(noteSaveTimeout);
                notesTextarea.value = ''; // Limpa input
                notesStatus.textContent = 'Anotação adicionada!';
                notesStatus.className = 'text-xs text-green-600 dark:text-green-400 h-4 flex-grow';
                renderNotesList(sessionId); // Atualiza lista
                noteSaveTimeout = setTimeout(() => { notesStatus.textContent = ''; }, 3000);
            } else {
                notesStatus.textContent = 'Erro ao adicionar!';
                notesStatus.className = 'text-xs text-red-600 dark:text-red-400 h-4 flex-grow';
            }
            addNoteBtn.disabled = false;
        }, 100); // Delay mínimo
    }

    /** Lida com cliques na lista de notas salvas (editar/excluir) */
    function handleSavedNotesListEvents(event, sessionId) {
        const editButton = event.target.closest('.edit-note-btn');
        const deleteButton = event.target.closest('.delete-note-btn');

        if (editButton) {
            handleEditNote(editButton, sessionId);
        } else if (deleteButton) {
            handleDeleteNote(deleteButton, sessionId);
        }
    }

    /** Edita uma anotação existente */
    function handleEditNote(button, sessionId) {
        const noteItem = button.closest('.saved-note-item');
        const noteId = noteItem?.dataset.noteId;
        if (!noteId) return;

        const notes = loadSessionNotes(sessionId);
        const noteIndex = notes.findIndex(n => n.id === noteId);
        if (noteIndex === -1) { showToast('Erro: Anotação não encontrada.', 'error'); return; }

        const currentContent = notes[noteIndex].content;
        const newContent = prompt(`Editar Anotação:`, currentContent);

        if (newContent !== null && newContent.trim() !== currentContent.trim()) {
            notes[noteIndex].content = newContent.trim();
            const success = saveSessionNotes(sessionId, notes);
            if (success) {
                renderNotesList(sessionId);
                showToast('Anotação atualizada!', 'success');
            }
        } else if (newContent !== null) {
            showToast('Nenhuma alteração feita.', 'info');
        }
    }

    /** Exclui uma anotação existente */
    function handleDeleteNote(button, sessionId) {
        const noteItem = button.closest('.saved-note-item');
        const noteId = noteItem?.dataset.noteId;
        if (!noteId) return;

        if (confirm('Tem certeza que deseja excluir esta anotação permanentemente?')) {
            let notes = loadSessionNotes(sessionId);
            notes = notes.filter(n => n.id !== noteId);
            const success = saveSessionNotes(sessionId, notes);
            if (success) {
                renderNotesList(sessionId);
                showToast('Anotação excluída!', 'success');
            }
        }
    }

    /** Renomeia a session atual */
    function renameCurrentSession(sessionId) {
        if (!sessionId || sessionId === DEFAULT_SESSION_ID) { showToast("Não pode renomear session padrão.", 'info'); return; }
        const sessions = getAllSessions();
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);

        if (sessionIndex > -1) {
            const currentName = sessions[sessionIndex].name;
            const newName = prompt(`Renomear Session "${currentName}":`, currentName);

            if (newName && newName.trim() !== '' && newName.trim() !== currentName) {
                sessions[sessionIndex].name = newName.trim();
                saveAllSessions(sessions);
                updateSessionDisplayInfo(sessionId); // Atualiza UI
                showToast("Session renomeada!", 'success');
            } else if (newName !== null) {
                showToast("Nome inválido ou não modificado.", 'info');
            }
        } else { showToast("Erro: Session não encontrada.", 'error'); }
    }

    /** Exclui a session atual */
    function deleteCurrentSession(sessionId) {
        if (!sessionId || sessionId === DEFAULT_SESSION_ID) { showToast("Não pode excluir session padrão.", 'info'); return; }
        const sessions = getAllSessions();
        const sessionToDelete = sessions.find(s => s.id === sessionId);

        if (sessionToDelete && confirm(`EXCLUIR PERMANENTEMENTE a Session "${sessionToDelete.name}" e TODOS os seus dados (tarefas e notas)? Esta ação NÃO pode ser desfeita.`)) {
            const updatedSessions = sessions.filter(s => s.id !== sessionId);
            saveAllSessions(updatedSessions); // Salva índice sem a session
            try {
                // Remove dados específicos da session
                localStorage.removeItem(`${LS_KEY_TASKS_PREFIX}${sessionId}`);
                localStorage.removeItem(`${LS_KEY_DELETED_TASKS_PREFIX}${sessionId}`);
                localStorage.removeItem(`${LS_KEY_NOTES_PREFIX}${sessionId}`);
            } catch (e) { console.error(`Error removing data for session ${sessionId}:`, e); showToast('Erro ao remover dados da session!', 'error'); }

            showToast(`Session "${sessionToDelete.name}" excluída. Redirecionando...`, 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 1500); // Redireciona para dashboard
        }
    }

    // --- Inicialização Geral ---
    function initializeApp() {
        console.log("Initializing Session Guide...");
        currentSessionId = getCurrentSessionIdFromUrl(); // De common.js

        if (!currentSessionId) {
            console.error("Session ID missing from URL. Redirecting.");
            alert("ID da Session não encontrado na URL. Retornando para a Dashboard.");
            window.location.replace('index.html'); // Usa replace para não ficar no histórico
            return; // Interrompe execução
        }

        const sessions = getAllSessions();
        if (!sessions.some(s => s.id === currentSessionId)) {
            console.error(`Session ID "${currentSessionId}" not found in index. Redirecting.`);
            alert(`A Session com ID "${currentSessionId}" não foi encontrada. Verifique o link ou retorne à Dashboard.`);
            window.location.replace('index.html');
            return; // Interrompe execução
        }

        console.log(`Loading session: ${currentSessionId}`);
        loadTheme(); // Carrega tema (de common.js)
        updateSessionDisplayInfo(currentSessionId); // Atualiza nome na UI
        updateFooterInfo(); // Atualiza ano/versão (de common.js)

        // Renderiza conteúdo dinâmico
        renderTasks(currentSessionId);
        renderDeletedTasks(currentSessionId);
        renderNotesList(currentSessionId);

        // --- Adiciona Listeners ---
        themeToggleButton?.addEventListener('click', toggleTheme);
        phaseNavContainer?.addEventListener('click', handlePhaseNavClick);

        // Delegação de eventos para tarefas
        phaseContentContainer?.addEventListener('change', handleContentContainerEvents); // Para checkboxes
        phaseContentContainer?.addEventListener('click', handleContentContainerEvents); // Para botões

        // Delegação de eventos para lixeira
        deletedTaskList?.addEventListener('click', handleDeletedListEvents);

        // Delegação de eventos para lista de notas
        savedNotesListContainer?.addEventListener('click', (e) => handleSavedNotesListEvents(e, currentSessionId));

        // Botões de ação da session e notas
        addNoteBtn?.addEventListener('click', () => addNoteHandler(currentSessionId));
        renameSessionBtn?.addEventListener('click', () => renameCurrentSession(currentSessionId));
        deleteSessionBtn?.addEventListener('click', () => deleteCurrentSession(currentSessionId));
        goToDashboardBtn?.addEventListener('click', () => { window.location.href = 'index.html'; });

        // Botões da lixeira
        showDeletedTasksBtn?.addEventListener('click', () => {
            deletedTasksSection?.classList.remove('hidden');
            showDeletedTasksBtn.classList.add('hidden');
        });
        hideDeletedTasksBtn?.addEventListener('click', () => {
            deletedTasksSection?.classList.add('hidden');
            showDeletedTasksBtn?.classList.remove('hidden');
        });

        // Foco inicial na primeira aba (se existir)
        const initialActiveButton = phaseNavContainer?.querySelector('.phase-nav-btn.active');
        if (initialActiveButton) {
            switchPhase(initialActiveButton.dataset.phase); // Garante conteúdo correto
            // initialActiveButton.focus(); // Foco pode ser desorientador às vezes, opcional
        } else {
            // Fallback para a primeira aba se nenhuma estiver ativa
            const firstButton = phaseNavContainer?.querySelector('.phase-nav-btn');
            if (firstButton) switchPhase(firstButton.dataset.phase);
        }

        // Inicializa Lucide Ícones APÓS todo o conteúdo dinâmico ser renderizado
        if (typeof lucide !== 'undefined') {
            try { lucide.createIcons(); } catch (e) { console.error("Error creating Lucide icons on init:", e); }
        } else { console.warn("Lucide library not loaded."); }

        console.log(`Initialization complete for Session: ${currentSessionId}`);
    }

    // --- Executa a inicialização ---
    try {
        initializeApp();
    } catch (error) {
        console.error("FATAL ERROR during initialization:", error);
        document.body.innerHTML = `<div style="padding: 20px; text-align: center; color: red; font-family: sans-serif; background-color: #111; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;"><h1>Erro Crítico</h1><p>Ocorreu um erro grave ao carregar a página. Verifique o console (F12) para detalhes técnicos.</p><pre style="font-family: monospace; background-color: #333; padding: 15px; border-radius: 5px; color: #ffdddd; text-align: left; white-space: pre-wrap; margin-top: 20px; max-width: 800px; margin-left: auto; margin-right: auto;">${error.stack || error.message}</pre></div>`;
    }

}); // Fim do DOMContentLoaded
--- END OF FILE script.js ---
