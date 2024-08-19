'use client';
import React, { useEffect, useState, useRef } from 'react';
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

let eventGuid = 0
let todayStr = new Date().toISOString().replace(/T.*$/, '')

function createEventId() {
    return String(eventGuid++)
}
export default function Agenda() {
    let agendamentoVazio: Projeto.Agendamento = {
        id: 0,
        nomePaciente: '',
        telefone: '',
        dataNascimento: '',
        tipoAtendiento: '',
        inicio: '',
        fim: '',
    };

    const [agendamento, setAgendamento] = useState<Projeto.Agendamento>(agendamentoVazio);
    const [dialogoAgendamento, setDialogoAgendamento] = useState(false);
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
    const [botaoPresencial, setBotaoPresencial] = useState<string | null>(null);
    const [botaoOnline, setBotaoOnline] = useState<string | null>(null);

    useEffect(() => {
        const carregarAgendamentos = async () => {
            try {
                const response = await agendamentoService.listarTodos();
                const agendamentos = response.data;

                const eventos = agendamentos.map(agendamento => ({
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
    }, []);

    function handleWeekendsToggle() {
        setWeekendsVisible(!weekendsVisible);
    }

    const salvarAgendamento = () => {
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

    function aoSelecionarData(selectInfo) {
        let calendarApi = calendarRef.current?.getApi();

        if (!calendarApi) {
            console.log("Calendar API not available");
            return;
        }

        let currentView = calendarApi.view.type;
        calendarApi.unselect();

        const inicio = selectInfo.startStr;
        const fim = selectInfo.endStr;

        setAgendamento(prevAgendamento => ({
            ...prevAgendamento,
            inicio: inicio,
            fim: fim
        }));

        setInicio(inicio);
        setFim(fim);

        setIsAllDay(selectInfo.allDay);

        if (currentView === 'timeGridDay') {
            prepararNovoAgendamento();
        } else {
            calendarApi.changeView('timeGridDay', selectInfo.startStr);
        }
    }

    function aoClicarAgendado(clickInfo) {
        if (confirm(`Seu compromisso '${clickInfo.event.title}'`)) {
            clickInfo.event.remove();
        }
    }

    function handleEvents(events) {
        setCurrentEvents(events);
    }

    const fecharDialogo = () => {
        setDialogoAgendamento(false);
    };

    const agendamentoDialogoFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={fecharDialogo} />
            <Button label="Save" icon="pi pi-check" text onClick={salvarAgendamento} />
        </>
    );

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setAgendamento(prevAgendamento => ({
            ...prevAgendamento,
            [name]: val
        }));
    };

    const prepararNovoAgendamento = () => {
        setDialogoAgendamento(true);
    }

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
                <Dialog visible={dialogoAgendamento} style={{ width: '450px' }} header={dialogHeader} modal className="p-fluid" footer={agendamentoDialogoFooter} onHide={fecharDialogo} >
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
                            checked={agendamento.tipoAtendiento === 'Presencial'}
                            onChange={(e) => setAgendamento(prev => ({ ...prev, tipoAtendiento: e.value }))}
                        />
                        <label htmlFor="option1" className="field">Presencial</label>
                        <RadioButton
                            inputId="option2"
                            className="field"
                            name="option"
                            value="On-line"
                            checked={agendamento.tipoAtendiento === 'On-line'}
                            onChange={(e) => setAgendamento(prev => ({ ...prev, tipoAtendiento: e.value }))}
                        />
                        <label htmlFor="option2">On-line</label>
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
            <i>{eventInfo.event.title}</i>
        </>
    );
}
