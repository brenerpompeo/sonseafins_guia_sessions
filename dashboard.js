document.addEventListener('DOMContentLoaded', () => {
    const sessionListContainer = document.getElementById('sessionList');
    const createSessionBtn = document.getElementById('createSessionBtn');
    const noSessionsMessage = document.getElementById('noSessionsMessage');

    // --- Funções da Dashboard ---

    /** Renderiza a lista de sessions existentes */
    function renderSessionList() {
        // Verifica se os elementos existem antes de prosseguir
        if (!sessionListContainer || !noSessionsMessage) {
            console.error("Dashboard elements not found (sessionList or noSessionsMessage).");
            return;
        }

        const sessions = getAllSessions(); // Função de common.js
        sessionListContainer.innerHTML = ''; // Limpa a lista

        if (sessions.length === 0) {
            noSessionsMessage.classList.remove('hidden');
            sessionListContainer.innerHTML = '';
        } else {
            noSessionsMessage.classList.add('hidden');
            const fragment = document.createDocumentFragment();
            // Ordena por data de criação, mais recente primeiro
            sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            sessions.forEach(session => {
                const li = document.createElement('div');
                // Adiciona data-session-id para fácil exclusão (opcional)
                li.dataset.sessionId = session.id;
                li.className = 'session-item p-4 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-[var(--brand-primary)] dark:hover:border-[var(--brand-primary)] transition duration-200 flex justify-between items-center gap-2';
                li.innerHTML = `
                    <a href="session.html?session=${session.id}" class="font-medium text-[var(--brand-primary)] hover:underline flex-grow mr-4 truncate" title="${session.name || `Session #${session.id}`}">
                        ${session.name || `Session #${session.id}`}
                    </a>
                    <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 whitespace-nowrap">
                        Criada em: ${new Date(session.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                     <button class="delete-session-from-dashboard-btn p-1 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full flex-shrink-0" title="Excluir esta session">
                        <i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i>
                     </button>
                    `;
                fragment.appendChild(li);
            });
            sessionListContainer.appendChild(fragment);
             // Reativa ícones Lucide após adicionar botões de exclusão
            if (typeof lucide !== 'undefined') {
                try { lucide.createIcons(); } catch(e){ console.error(e); }
            }
        }
    }

     /** Exclui uma session diretamente do dashboard */
     function deleteSessionFromDashboard(button) {
         const sessionItem = button.closest('.session-item');
         const sessionId = sessionItem?.dataset.sessionId;
         const sessions = getAllSessions();
         const sessionToDelete = sessions.find(s => s.id === sessionId);

         if (!sessionToDelete) {
             alert("Erro: Session não encontrada para exclusão.");
             return;
         }

         if (confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE a Session "${sessionToDelete.name}" e todos os seus dados (tarefas e notas)? ESTA AÇÃO NÃO PODE SER DESFEITA.`)) {
             // Remove do índice
             const updatedSessions = sessions.filter(s => s.id !== sessionId);
             saveAllSessions(updatedSessions);

             // Remove dados específicos da session (tarefas ativas, excluídas e notas)
             try {
                 localStorage.removeItem(`${LS_KEY_TASKS_PREFIX}${sessionId}`);
                 localStorage.removeItem(`${LS_KEY_DELETED_TASKS_PREFIX}${sessionId}`);
                 localStorage.removeItem(`${LS_KEY_NOTES_PREFIX}${sessionId}`);
             } catch (e) {
                 console.error(`Error removing data for deleted session ${sessionId}:`, e);
                 alert('Erro ao remover dados da session excluída!');
             }

             alert(`Session "${sessionToDelete.name}" excluída.`);
             renderSessionList(); // Atualiza a lista
         }
     }


    /** Cria uma nova session */
    function createNewSession() {
        const sessionName = prompt("Digite o nome para a nova Session (ex: Session #3 - Evento Z):");
        if (!sessionName || sessionName.trim() === '') {
            // Não mostra alerta se o usuário simplesmente cancelar
            if (sessionName !== null) {
                 alert("Nome da session inválido.");
            }
            return;
        }

        const sessions = getAllSessions();
        const newSessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        const newSessionData = {
            id: newSessionId,
            name: sessionName.trim(),
            createdAt: new Date().toISOString()
        };

        sessions.push(newSessionData);
        saveAllSessions(sessions); // Salva o índice atualizado

        // Inicializa os dados da nova session (tarefas e notas)
        // Garante que defaultTasksTemplate esteja definido (de common.js)
        if(typeof defaultTasksTemplate !== 'undefined') {
            const initialTasks = defaultTasksTemplate.map(task => ({ ...task, id: crypto.randomUUID(), completed: false }));
            saveSessionTasks(newSessionId, initialTasks); // Salva tarefas (de common.js)
            saveSessionNotes(newSessionId, ''); // Salva notas vazias (de common.js)
            console.log(`Session "${sessionName}" created with ID: ${newSessionId}`);
            renderSessionList(); // Atualiza a lista na dashboard
        } else {
            console.error("defaultTasksTemplate is not defined. Cannot initialize new session tasks.");
            alert("Erro: Template de tarefas não encontrado. Nova session criada sem tarefas.");
             renderSessionList(); // Atualiza lista mesmo assim
        }
    }

    // --- Inicialização da Dashboard ---
    function initializeDashboard() {
        console.log("Initializing Dashboard...");
        renderSessionList(); // Renderiza a lista inicial

        // Listener para o botão de criar
        if (createSessionBtn) {
            createSessionBtn.addEventListener('click', createNewSession);
        } else {
             console.error("Create Session Button not found.");
        }

         // Listener para botões de excluir na lista (delegação)
         if (sessionListContainer) {
             sessionListContainer.addEventListener('click', (event) => {
                 const deleteButton = event.target.closest('.delete-session-from-dashboard-btn');
                 if (deleteButton) {
                     deleteSessionFromDashboard(deleteButton);
                 }
             });
         }

         // Atualiza o rodapé (se existir)
         updateFooterInfo(); // Função de common.js

        console.log("Dashboard initialized.");
    }

    // Executa a inicialização da dashboard
    initializeDashboard();
});