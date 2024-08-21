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

const Principal: Page = () => {

    let pacienteVazio: Projeto.Paciente = {
        id: 0,
        name: ''
    };

    let anamneseVazia: Projeto.Anamnese = {
        id: 0,
        descricao: "",
        paciente: pacienteVazio
    }

    const [autoValue, setAutoValue] = useState<Demo.Country[]>([]);
    const [paciente, setPaciente] = useState<Projeto.Paciente>(pacienteVazio);
    const [pacientessss, setPacientessss] = useState<Projeto.Paciente[] | null>(null);
    const pacienteService = useMemo(() => new PacienteService(), []);
    const [descricaoAnamnese, setDescricaoAnamnese] = useState<Projeto.Anamnese>(anamneseVazia);
    const anamneseService = useMemo(() => new AnamneseService(), []);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        CountryService.getCountries().then((data) => setAutoValue(data));

        if (!pacientessss) {
            pacienteService.listarTodos()
                .then((response) => {
                    setPacientessss(response.data);
                }).catch((error) => {
                    console.log(error);
                })
        }
    }, [pacienteService, paciente]);

    const salvarAnamnese = () => {
        //console.log('JSON enviado:', JSON.stringify(descricaoAnamnese, null, 2));
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

    return (
        <div className="grid p-fluid input-demo">
            <Toast ref={toast} />
            <div className="col-12 ">
                <div className="card">
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
                        filter />

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
                </div>
            </div>
        </div>
    );
};

export default Principal;
