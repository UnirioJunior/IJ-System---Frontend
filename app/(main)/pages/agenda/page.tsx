'use client';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { format } from 'date-fns';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { AgendamentoService } from '../../../../service/AgendamentoService';
import { Toast } from 'primereact/toast';
import { InputMask, InputMaskChangeEvent } from 'primereact/inputmask';
import { RadioButton } from 'primereact/radiobutton';
import { UsuarioService } from '../../../../service/UsuarioService';
import { Projeto } from '../../../../types/types';

let eventGuid = 0
let todayStr = new Date().toISOString().replace(/T.*$/, '')

function createEventId() {
    return String(eventGuid++)
}
export default function Agenda() {
    let agendamentoVazio: Projeto.Agendamento = {
        id: 0,
        usuario: { id: 0, name: '', login: '', senha: '', email: '', situacao: '' },
        nomePaciente: '',
        telefone: '',
        dataNascimento: '',
        tipoAtendimento: '',
        inicio: '',
        fim: '',
    };

    let usuarioVazia: Projeto.Usuario = {
        id: 0, name: '', login: '', senha: '', email: '', situacao: ''
    }

    const [agendamento, setAgendamento] = useState<Projeto.Agendamento>(agendamentoVazio);
    const [dialogoAgendamento, setDialogoAgendamento] = useState(false);
    const [abrirAgendamento, setAbrirAgendamento] = useState(false);
    const [weekendsVisible, setWeekendsVisible] = useState(true);
    const [currentEvents, setCurrentEvents] = useState([]);
    const [isAllDay, setIsAllDay] = useState(true);
    const calendarRef = useRef<FullCalendar>(null);
    const agendamentoService = new AgendamentoService();
    const toast = useRef<Toast>(null);
    const [events, setEvents] = useState([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const [inicio, setInicio] = useState<string | null>(null);
    const [fim, setFim] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const userIdFromStorage = localStorage.getItem('USER_ID');
    const [usuarioLogado, setUsuarioLogado] = useState<Projeto.Usuario>(usuarioVazia);
    const usuarioService = useMemo(() => new UsuarioService(), []);



    useEffect(() => {
        const userIdFromStorage = localStorage.getItem('USER_ID');
        const userIdNumber = userIdFromStorage ? parseInt(userIdFromStorage, 10) : null;
        setUserId(userIdNumber);
        if (userIdNumber !== null) {
            usuarioService.buscarPordId(userIdNumber).then((response) => {
                setUsuarioLogado(response.data);
            });
        }
    }, []);

    useEffect(() => {
        if (userId !== null) { // Verifique se userId está definido
            const carregarAgendamentos = async () => {
                try {
                    const response = await agendamentoService.listarTodos();
                    const agendamentos = response.data;

                    // Filtra agendamentos com base no userId
                    const agendamentosFiltrados = agendamentos.filter(
                        agendamento => agendamento.usuario.id === userId
                    );

                    // Mapeia agendamentos filtrados para o formato do calendário
                    const eventos = agendamentosFiltrados.map(agendamento => ({
                        id: agendamento.id,
                        title: agendamento.nomePaciente,
                        start: agendamento.inicio,
                        end: agendamento.fim,
                        allDay: false
                    }));

                    setEvents(eventos);

                    if (calendarRef.current) {
                        calendarRef.current.getApi().addEventSource(eventos);
                    }
                } catch (error) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro!',
                        detail: 'Falha ao carregar os agendamentos.',
                        life: 3000
                    });
                }
            };

            carregarAgendamentos();
        }
    }, [userId]);

    useEffect(() => {
        if (usuarioLogado) {
            setAgendamento(prevState => ({
                ...prevState,
                usuario: usuarioLogado
            }));
        }
    }, [usuarioLogado]);

    function handleWeekendsToggle() {
        setWeekendsVisible(!weekendsVisible);
    }

    const salvarAgendamento = () => {
        //console.log('JSON enviado:', JSON.stringify(agendamento, null, 2));
        if (!calendarRef.current) return;

        const calendarApi = calendarRef.current.getApi();

        if (agendamento.nomePaciente && agendamento.inicio && agendamento.fim) {
            calendarApi.addEvent({
                id: createEventId(),
                title: agendamento.nomePaciente,
                start: agendamento.inicio,
                end: agendamento.fim,
                allDay: isAllDay
            });

            setAgendamento(agendamentoVazio);
            setDialogoAgendamento(false);
        }

        agendamentoService.inserir(agendamento).then((response) => {
            toast.current?.show({
                severity: 'success',
                summary: 'Agendamento Salvo!',
                detail: 'Agendamento salvo com sucesso!',
                life: 3000
            });
        }).catch((error) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro no Agendamento!',
                detail: 'Erro no Agendamento!',
                life: 3000
            });
        });
    };



    const aoSelecionarData = (selectInfo) => {
        let calendarApi = calendarRef.current?.getApi();

        if (!calendarApi) {
            console.log("Calendar API not available");
            return;
        }

        let currentView = calendarApi.view.type;
        calendarApi.unselect();

        const inicio = selectInfo.startStr;
        const fim = selectInfo.endStr;

        // Atualiza o estado do agendamento com os novos valores
        setAgendamento(prevAgendamento => ({
            ...prevAgendamento,
            inicio: inicio,
            fim: fim
        }));

        // Atualiza estados individuais se necessário
        setInicio(inicio);
        setFim(fim);
        setIsAllDay(selectInfo.allDay);

        // Usa o estado atualizado
        if (currentView === 'timeGridDay') {
            prepararNovoAgendamento();
        } else {
            calendarApi.changeView('timeGridDay', selectInfo.startStr);
        }
    };



    function aoClicarAgendado(clickInfo) {
        const agendamentoId = clickInfo.event.id;

        agendamentoService.buscarPordId(agendamentoId)
            .then((response) => {
                const agendamentoCompleto = response.data;
                setAgendamento(agendamentoCompleto);
                setAbrirAgendamento(true);

            })
            .catch((error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Falha ao carregar os detalhes do agendamento.',
                    life: 3000
                });
            });
    }


    function handleEvents(events) {
        setCurrentEvents(events);
    }

    const fecharDialogoAgendamento = () => {
        setDialogoAgendamento(false);
    };

    const fecharDialogoAbrirAgendamento = () => {
        setAgendamento(agendamentoVazio);
        setAbrirAgendamento(false);
    };

    const agendamentoDialogoFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={fecharDialogoAgendamento} />
            <Button label="Save" icon="pi pi-check" text onClick={salvarAgendamento} />
        </>
    );

    const abrirAgendamentoDialogoFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={() => console.log("Cancelado")} />
            <Button label="Excluir" icon="pi pi-times" text onClick={() => console.log("Excluido")} />
            <Button label="Confirmar" icon="pi pi-check" text onClick={() => console.log("Confirmado")} />
        </>
    );

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setAgendamento(prevAgendamento => ({
            ...prevAgendamento,
            [name]: val,
            usuario: usuarioLogado // Garante que o usuário logado seja sempre incluído
        }));
    };


    const prepararNovoAgendamento = () => {
        setAgendamento(prevAgendamento => ({
            ...prevAgendamento, // Mantém os valores existentes
            usuario: usuarioLogado, // Define o usuário logado
            // Você pode resetar apenas os campos necessários, se necessário
        }));
        setDialogoAgendamento(true);
    };



    const handleFocus = () => {
        if (inputRef.current) {
            inputRef.current.setSelectionRange(0, 0);
        }
    };

    const dialogHeader = (
        <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            <label htmlFor="Agendamento" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                Agendamento
            </label>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Início: {inicio ? format(new Date(inicio), 'dd-MM-yyyy HH:mm') : 'N/A'}
            </label>
            <label style={{ display: 'block' }}>
                Fim: {fim ? format(new Date(fim), 'dd-MM-yyyy HH:mm') : 'N/A'}
            </label>
        </div>
    );

    const abrirAgendamentoHeader = (
        <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            <label htmlFor="Agendamento" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                Agendamento
            </label>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Início: {agendamento?.inicio ? format(new Date(agendamento.inicio), 'dd-MM-yyyy HH:mm') : 'N/A'}
            </label>
            <label style={{ display: 'block' }}>
                Fim: {agendamento?.fim ? format(new Date(agendamento.fim), 'dd-MM-yyyy HH:mm') : 'N/A'}
            </label>
        </div>
    );


    return (
        <div className='demo-app'>
            <Toast ref={toast} />
            <div className='demo-app-main'>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    locales={[ptBrLocale]}
                    locale='pt-br'
                    timeZone='America/Cuiaba'
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridDay'
                    }}
                    initialView='dayGridMonth'
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={weekendsVisible}
                    select={aoSelecionarData}
                    eventContent={renderEventContent}
                    eventClick={aoClicarAgendado}
                    eventsSet={handleEvents}
                    events={events}
                />
                <Dialog visible={dialogoAgendamento} style={{ width: '450px' }} header={dialogHeader} modal className="p-fluid" footer={agendamentoDialogoFooter} onHide={fecharDialogoAgendamento} >
                    <div className="field">
                        <label htmlFor="Nome">Nome: </label>
                        <InputText
                            id="nome"
                            value={agendamento.nomePaciente}
                            onChange={(e) => onInputChange(e, 'nomePaciente')}
                            placeholder="Nome do paciente"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="Telefone">Telefone: </label>
                        <InputMask
                            id="telefone"
                            mask="(99) 999999999"
                            value={agendamento.telefone}
                            onChange={(e: InputMaskChangeEvent) => onInputChange(e as unknown as React.ChangeEvent<HTMLInputElement>, 'telefone')}
                            placeholder="Telefone do paciente"
                            required
                            onFocus={handleFocus}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="dataNascimento">Data de Nascimento: </label>
                        <InputMask
                            id="dataNascimento"
                            mask="99/99/9999"
                            value={agendamento.dataNascimento}
                            onChange={(e: InputMaskChangeEvent) => onInputChange(e as unknown as React.ChangeEvent<HTMLInputElement>, 'dataNascimento')}
                            placeholder="Data de nascimento do paciente"
                            required
                            onFocus={handleFocus}
                        />
                    </div>
                    <div className="formgroup-inline">
                        <RadioButton
                            inputId="option1"
                            className="field"
                            name="option"
                            value="Presencial"
                            checked={agendamento.tipoAtendimento === 'Presencial'}
                            onChange={(e) => setAgendamento(prev => ({ ...prev, tipoAtendimento: e.value }))}
                        />
                        <label htmlFor="option1" className="field">Presencial</label>

                        <RadioButton
                            inputId="option2"
                            className="field"
                            name="option"
                            value="On-line"
                            checked={agendamento.tipoAtendimento === 'On-line'}
                            onChange={(e) => setAgendamento(prev => ({ ...prev, tipoAtendimento: e.value }))}
                        />
                        <label htmlFor="option2">On-line</label>
                    </div>
                </Dialog>
                <Dialog visible={abrirAgendamento} style={{ width: '450px' }} header={abrirAgendamentoHeader} modal className="p-fluid" footer={abrirAgendamentoDialogoFooter} onHide={fecharDialogoAbrirAgendamento}>
                    <div className="field">
                        <label htmlFor="Nome">Nome: </label>
                        <InputText
                            id="nome"
                            value={agendamento.nomePaciente}
                            disabled
                            placeholder="Nome do paciente"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="Telefone">Telefone: </label>
                        <InputText
                            id="telefone"
                            value={agendamento.telefone}
                            disabled
                            placeholder="Telefone do paciente"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="dataNascimento">Data de Nascimento: </label>
                        <InputText
                            id="dataNascimento"
                            value={agendamento.dataNascimento} //
                            disabled
                            placeholder="Data de nascimento do paciente"
                        />
                    </div>
                    <div className="formgroup-inline">
                        <label htmlFor="tipoAtendimento"> Tipo do Atendimento</label>
                        <InputText
                            id='tipoAtendimento'
                            value={agendamento.tipoAtendimento}
                            disabled
                        />
                    </div>
                </Dialog>
            </div>
        </div>
    );
}

function renderEventContent(eventInfo) {
    return (
        <>
            <b>{eventInfo.timeText}</b>
            <span style={{ marginRight: '8px' }}></span>
            <i>{eventInfo.event.title}</i>
        </>
    );
}



