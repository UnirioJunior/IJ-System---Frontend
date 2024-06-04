'use client';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';
import { Chips } from 'primereact/chips';
import { ColorPicker, ColorPickerHSBType, ColorPickerRGBType } from 'primereact/colorpicker';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Knob } from 'primereact/knob';
import { ListBox } from 'primereact/listbox';
import { MultiSelect } from 'primereact/multiselect';
import { RadioButton } from 'primereact/radiobutton';
import { Rating } from 'primereact/rating';
import { SelectButton } from 'primereact/selectbutton';
import { Slider } from 'primereact/slider';
import { ToggleButton } from 'primereact/togglebutton';
import React, { useEffect, useMemo, useState } from 'react';
import { CountryService } from '../../demo/service/CountryService';
import type { Demo, Page } from '../../types/types';
import { Projeto } from '../../types/types';
import { PacienteService } from '../../service/PacienteService';


interface InputValue {
    name: string;
    code: string;
}



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

    const [floatValue, setFloatValue] = useState('');
    const [autoValue, setAutoValue] = useState<Demo.Country[]>([]);
    const [checkboxValue, setCheckboxValue] = useState<string[]>([]);
    const [paciente, setPaciente] = useState<Projeto.Paciente>(pacienteVazio);
    const [pacientessss, setPacientessss] = useState<Projeto.Paciente[] | null>(null);
    const pacienteService = useMemo(() => new PacienteService(), []);
    const [descricaoAnamnese, setDescricaoAnamnese] = useState<Projeto.Anamnese>(anamneseVazia); 



    useEffect(() => {
        CountryService.getCountries().then((data) => setAutoValue(data));

        if (!pacientessss) {
            pacienteService.listarTodos()
                .then((response) => {
                    console.log(response.data);
                    setPacientessss(response.data);
                }).catch((error) => {
                    console.log(error);
                })
        }
    }, [pacienteService, paciente]);



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


    const itemTemplate = (option: InputValue) => {
        return (
            <div className="flex align-items-center">
                <img
                    alt={option.name}
                    src={`/demo/images/flag/flag_placeholder.png`}
                    onError={(e) => (e.currentTarget.src = 'https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png')}
                    className={`flag flag-${option.code.toLowerCase()}`}
                    style={{ width: '21px' }}
                />
                <span className="ml-2">{option.name}</span>
            </div>
        );
    };
    return (
        <div className="grid p-fluid input-demo">
            <div className="col-12 md:col-10">
                <div className="card">
                    <h5>Nome do Paciente</h5>
                    <Dropdown optionLabel="name"
                        value={paciente}
                        options={pacientessss || []}
                        onChange={(e) => setPaciente(e.value)}
                        placeholder='Selecione um paciente...'
                        filter />

                    <h5>Anamnese</h5>
                    <InputTextarea
                        id="anamnese"
                        value={descricaoAnamnese}
                        onChange={(e) => setDescricaoAnamnese(e.target.value)}
                        placeholder="Seu atendimento"
                        rows={12}
                        cols={30}
                    />
                    <div className="card"><button aria-label="Submit" className="p-button p-component" data-pc-name="button" data-pc-section="root">
                        <span className="p-button-label p-c" data-pc-section="label">Salvar</span></button></div>
                </div>
            </div>
        </div>
    );
};

export default Principal;

