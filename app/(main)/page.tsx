'use client';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CountryService } from '../../demo/service/CountryService';
import type { Demo, Page } from '../../types/types';
import { Projeto } from '../../types/types';
import { PacienteService } from '../../service/PacienteService';
import { AnamneseService } from '../../service/AnamneseService';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { C } from '@fullcalendar/core/internal-common';
import { UsuarioService } from '../../service/UsuarioService';

const Principal: Page = () => {

    let pacienteVazio: Projeto.Paciente = {
        id: 0,
        name: '',
        usuario: { id: 0, name: '', login: '', senha: '', email: '', situacao: '' }
    };

    let anamneseVazia: Projeto.Anamnese = {
        id: 0,
        descricao: "",
        paciente: pacienteVazio,
        usuario: { id: 0, name: '', login: '', senha: '', email: '', situacao: '' },
        data: ''
    }

    let usuarioVazia: Projeto.Usuario = {
        id: 0, name: '', login: '', senha: '', email: '', situacao: ''
    }


    const [autoValue, setAutoValue] = useState<Demo.Country[]>([]);
    const [paciente, setPaciente] = useState<Projeto.Paciente>(pacienteVazio);
    const [pacientessss, setPacientessss] = useState<Projeto.Paciente[] | null>(null);
    const pacienteService = useMemo(() => new PacienteService(), []);
    const [descricaoAnamnese, setDescricaoAnamnese] = useState<Projeto.Anamnese>(anamneseVazia);
    const anamneseService = useMemo(() => new AnamneseService(), []);
    const usuarioService = useMemo(() => new UsuarioService(), []);
    const toast = useRef<Toast>(null);
    const [pacienteDialog, setPacienteDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [usuarioLogado, setUsuarioLogado] = useState<Projeto.Usuario>(usuarioVazia);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const userIdFromStorage = localStorage.getItem('USER_ID');
        const userIdNumber = userIdFromStorage ? parseInt(userIdFromStorage, 10) : null;
        setUserId(userIdNumber);
        if (userIdNumber !== null) {
            usuarioService.buscarPordId(userIdNumber).then((response) => {
                setUsuarioLogado(response.data);
            });
        }

    }, [pacienteService, paciente]);

    useEffect(() => {
        if (usuarioLogado) {
            setDescricaoAnamnese(prevState => ({
                ...prevState,
                usuario: usuarioLogado
            }));
        }

    }, [usuarioLogado]);

    useEffect(() => {
        if (userId !== null) {
            pacienteService.listarTodos()
                .then((response) => {
                    //console.log(response.data);
                    // Filtra os pacientes pelo userId
                    const pacientesFiltrados = response.data.filter((paciente: Projeto.Paciente) =>
                        paciente.usuario.id === userId
                    );
                    setPacientessss(pacientesFiltrados);
                })
                .catch((error) => {
                    //console.log("erro ao listar meus pacientes");
                });
        }
    }, [userId, pacienteService]);

    const salvarAnamnese = () => {
        descricaoAnamnese.data = new Date().toLocaleDateString("pt-BR") + '-' + new Date().toLocaleTimeString("pt-BR");
        console.log('JSON enviado:', JSON.stringify(descricaoAnamnese, null, 2));
        anamneseService.inserir(descricaoAnamnese).then((response) => {
            toast.current?.show({
                severity: 'success',
                summary: 'Atendimento Salvo!',
                detail: 'Atendimento salvo com sucesso!',
                life: 3000
            });
        }).catch((error) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro!',
                life: 3000
            });
        })
        setDescricaoAnamnese(anamneseVazia);
        setPaciente(pacienteVazio);
    }

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _paciente = { ...paciente };
        _paciente[`${name}`] = val;

        setPaciente(_paciente);

    };

    const onSelectPacienteChange = (paciente: Projeto.Paciente) => {
        let _paciente = { ...paciente };
        _paciente.name = paciente.name;
        setPaciente(_paciente);
    }

    const handleSubmit = () => {
        const dataToSend = {
            paciente: paciente,
            descricaoAnamnese: descricaoAnamnese
        };
        // Send dataToSend to your backend or API
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPacienteDialog(false);
    };

    const savePaciente = () => {
        setSubmitted(true);

        // Associa o usuário logado ao paciente
        const pacienteAtualizado = {
            ...paciente,
            usuario: usuarioLogado, // Adiciona o usuário logado ao paciente
        };

        if (!pacienteAtualizado.id) {

            //console.log('JSON enviado:', JSON.stringify(pacienteAtualizado, null, 2));
            pacienteService.inserir(pacienteAtualizado)
                .then((response) => {
                    setPacienteDialog(false);
                    setPaciente(pacienteVazio);
                    setPacientessss(null);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Sucesso!',
                        detail: 'Paciente cadastrado com sucesso!'
                    });
                }).catch((error) => {
                    console.log(error.data.message);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro!',
                        detail: 'Erro ao salvar!' + error.data.message
                    });
                });
        } else {
            pacienteService.alterar(pacienteAtualizado)
                .then((response) => {
                    setPacienteDialog(false);
                    setPaciente(pacienteVazio);
                    setPacientessss(null);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Sucesso!',
                        detail: 'Paciente alterado com sucesso!'
                    });
                }).catch((error) => {
                    console.log(error.data.message);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro!',
                        detail: 'Erro ao alterar!' + error.data.message
                    });
                });
        }
    }

    const pacienteDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={savePaciente} />
        </>
    );

    const openNew = () => {
        setPaciente(pacienteVazio);
        setSubmitted(false);
        setPacienteDialog(true);
    };

    return (
        <div className="grid p-fluid input-demo">
            <Toast ref={toast} />
            <div className="col-9">
                <div className="card">
                    <div className="formgroup-inline">
                        <div className="field col-8">
                            <h5>Nome do Paciente</h5>
                            <Dropdown optionLabel="name"
                                value={paciente}
                                options={pacientessss || []}
                                onChange={(e) => {
                                    setPaciente(e.value);
                                    setDescricaoAnamnese(prevState => ({
                                        ...prevState,
                                        paciente: e.value
                                    }));
                                }}
                                placeholder='Selecione um paciente...'
                                filter
                            />
                        </div>
                        <div className="field col-3">
                            <h5>Novo Cadastro</h5>
                            <Button label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                        </div>
                    </div>
                    <div className='col'>
                        <h5>Anamnese</h5>
                        <InputTextarea
                            id="anamnese"
                            value={descricaoAnamnese.descricao}
                            onChange={(e) => setDescricaoAnamnese(prevState => ({
                                ...prevState,
                                descricao: e.target.value
                            }))}
                            placeholder="Seu atendimento"
                            rows={12}
                            cols={30}
                        />
                        <div className="card">
                            <Button label="Salvar" onClick={salvarAnamnese} />
                        </div>
                        <Dialog visible={pacienteDialog} style={{ width: '450px' }} header="Detalhes do Paciente" modal className="p-fluid" footer={pacienteDialogFooter} onHide={hideDialog}>

                            <div className="field">
                                <label htmlFor="name">Name</label>
                                <InputText
                                    id="name"
                                    value={paciente.name}
                                    onChange={(e) => onInputChange(e, 'name')}
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !paciente.name
                                    })}
                                />
                                {submitted && !paciente.name && <small className="p-invalid">Nome é obrigatório.</small>}
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
            <div className="col-3">
                <div className="card">
                    <h5>Proximos Pacientes</h5>
                </div>
            </div>
        </div>
    );
};

export default Principal;
