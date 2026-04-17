export const translations = {
    pt: {
        // Nav
        nav: {
            home: "Início",
            about: "Sobre",
            features: "Funcionalidades",
            docs: "Documentação",
            login: "Entrar",
            getStarted: "Começar",
            contact: "Contacto",
        },
        // Hero
        hero: {
            version: "Edulite",
            titleStart: "O Futuro da",
            titleEnd: "Educação Digital.",
            subtitle: "Mais do que uma plataforma. Uma experiência de aprendizagem completa que evolui contigo.",
            teachFree: "Começar Agora",
            viewDemo: "Saber Mais",
            trust: "Confiado por instituições líderes em todo o país",
        },
        about: {
            p1: "EduLite nasceu da necessidade de simplificar a tecnologia na sala de aula. Acreditamos que os professores devem focar-se no ensino, não na configuração de software.",
            p2: "A nossa missão é fornecer ferramentas de classe mundial para instituições de todos os tamanhos, democratizando o acesso a uma educação digital de alta qualidade."
        },
        features: {
            title: "Tudo o que precisas num só lugar.",
            subtitle: "Funcionalidades desenhadas para modernizar o teu fluxo de trabalho.",
            f1: {
                title: "Gestão Ágil",
                desc: "Organiza as tuas turmas e tarefas com uma interface intuitiva e rápida.",
            },
            f2: {
                title: "Colaboração Real",
                desc: "Comunica instantaneamente com alunos e professores num ambiente seguro.",
            },
            f3: {
                title: "Análise de Dados",
                desc: "Visualiza o progresso através de gráficos detalhados e insights inteligentes.",
            },
            f4: {
                title: "Segurança Total",
                desc: "Os teus dados estão protegidos com encriptação de nível empresarial.",
            }
        },
        // Scrollytelling Sections
        scroll: {
            dashboard: {
                title: "Um Painel de Controlo, Não um Labirinto.",
                desc: "Tem uma visão geral de todas as tuas turmas, tarefas e prazos. Tudo o que importa, a um clique de distância."
            },
            chat: {
                title: "Comunicação Sem Fronteiras.",
                desc: "Diz adeus aos e-mails perdidos. O chat em tempo real permite que alunos e professores esclareçam dúvidas instantaneamente."
            },
            calendar: {
                title: "Nunca Mais Perca um Prazo.",
                desc: "O calendário inteligente sincroniza automaticamente com as tuas tarefas. Organização sem esforço."
            },
            analytics: {
                title: "Dados que Impulsionam o Ensino.",
                desc: "Compreende o desempenho da tua turma com gráficos claros e informações acionáveis (Funcionalidade Admin)."
            }
        },
        // FAQ
        faq: {
            title: "Perguntas Frequentes",
            q1: "O EduLite é gratuito?",
            a1: "Sim! O EduLite é open-source e gratuito para começar. Oferecemos planos premium para instituições maiores.",
            q2: "Como funciona o carregamento de ficheiros?",
            a2: "Utilizamos o armazenamento seguro do Supabase. Podes arrastar e largar ficheiros em tarefas e respostas.",
            q3: "Posso usar no telemóvel?",
            a3: "Sem dúvida. O EduLite é 100% responsivo e funciona perfeitamente em qualquer dispositivo.",
            q4: "Como ativo o Modo Escuro?",
            a4: "Basta clicares no ícone de lua/sol na barra de navegação. O sistema memoriza a tua preferência.",
        },
        // Auth
        auth: {
            welcome: "Bem-vindo de volta",
            loginSubtitle: "Inicia sessão para continuares a tua jornada.",
            createAccount: "Criar Conta",
            joinFuture: "Junta-te ao futuro da educação.",
            fullName: "Nome Completo",
            username: "Nome de Utilizador",
            email: "E-mail",
            password: "Palavra-passe",
            signIn: "Entrar",
            signUp: "Registar",
            orContinue: "Ou continua com",
            google: "Continuar com Google",
            noAccount: "Não tens uma conta?",
            hasAccount: "Já tens uma conta?",
        },
        dashboard: {
            myClasses: "As Minhas Turmas",
            createClass: "Criar Turma",
            joinClass: "Aceder a Turma",
            noClasses: "Ainda não estás em nenhuma turma.",
            welcome: "Bem-vindo de volta",
            noClassesDesc: "Acede a uma turma com um ID ou cria a tua própria para começares.",
            loading: "A carregar turmas...",
        },
        sidebar: {
            dashboard: "Painel",
            calendar: "Calendário",
            messages: "Mensagens",
            settings: "Definições",
            adminPanel: "Painel Admin",
            online: "Ligado",
        },
        admin: {
            checking: "A verificar permissões...",
            denied: "Acesso Negado",
            deniedDesc: "Não tens permissão para visualizar esta página.",
            return: "Voltar ao Painel",
            title: "Painel de Administração",
            totalUsers: "Total de Utilizadores",
            totalClasses: "Total de Turmas",
            assignments: "Tarefas",
            recentUsers: "Utilizadores Recentes",
            recentClasses: "Turmas Recentes",
            loading: "A carregar...",
            owner: "Proprietário",
        },
        settings: {
            title: "Definições",
            profile: "Perfil",
            changeAvatar: "Alterar Avatar",
            avatarDesc: "Recomendado: JPG/PNG quadrado",
            fullName: "Nome Completo",
            username: "Nome de Utilizador",
            bio: "Biografia",
            save: "Guardar Alterações",
            saving: "A guardar...",
            signOut: "Terminar Sessão",
            success: "Perfil atualizado!",
            error: "Erro ao atualizar perfil",
        },
        calendar: {
            title: "Calendário",
            selectDate: "Seleciona uma data para ver as tarefas.",
            loading: "A carregar...",
        },
        classDetails: {
            invalidId: "ID de Turma Inválido",
            notFound: "Turma não encontrada ou acesso negado.",
            teacherView: "Vista de Professor",
            tabs: {
                stream: "Mural",
                people: "Pessoas",
                settings: "Definições",
            },
            createAssignment: "Criar Tarefa",
            loadingAssignments: "A carregar tarefas...",
        },
        footer: {
            madeFor: "Criado para Estudantes",
            privacy: "Privacidade",
            terms: "Termos",
            contact: "Contacto",
        }
    }
};

export const t = (path) => {
    const keys = path.split('.');
    let current = translations.pt;

    for (const key of keys) {
        if (current[key] === undefined) return path;
        current = current[key];
    }

    return current;
};
