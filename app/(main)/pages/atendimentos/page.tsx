/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProductService } from '../../../../demo/service/ProductService';
import { Demo } from '../../../../types/types';
import { Projeto } from '../../../../types/types';
import { PacienteService } from '../../../../service/PacienteService';
import { AnamneseService } from '../../../../service/AnamneseService';

const Atendimentos = () => {
    let emptyAtendimentos: Projeto.Anamnese = {
        id: 0,
        paciente: {
            id: 0,
            name: '',
            usuario: { id: 0, name: '', login: '', senha: '', email: '', situacao: '' }
        },
        descricao: '',
        usuario: { id: 0, name: '', login: '', senha: '', email: '', situacao: '' },
        data: ''
    };

    const [atendimentos, setAtendimentos] = useState([]);
    const [selectedAtendimentos, setSelecteAtendimentos] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const anamneseService = useMemo(() => new AnamneseService(), []);
    const [dialogoVer, setDialogoVer] = useState(false);
    const [descricaoAnamnese, setDescricaoAnamnese] = useState<string | null>(null);


    useEffect(() => {
        const userIdFromStorage = localStorage.getItem('USER_ID');
        const userIdNumber = userIdFromStorage ? parseInt(userIdFromStorage, 10) : null;
        setUserId(userIdNumber);
    }, []);

    useEffect(() => {
        if (userId !== null) {
            anamneseService.listarTodos()
                .then((response) => {
                    const filteredAtendimentos = response.data.filter(
                        atendimento => atendimento.usuario.id === userId
                    );
                    setAtendimentos(filteredAtendimentos);
                })
                .catch((error) => {
                    console.log('Error fetching data:', error);
                });
        }
    }, [userId, anamneseService]);

    const verAnamnese = (atendimento: Projeto.Anamnese) => {
        setDescricaoAnamnese(atendimento.descricao); // Armazena a descrição no estado
        setDialogoVer(true); // Abre o diálogo
    };

    const fecharDialogoVer = () => {
        setDialogoVer(false); // Fecha o diálogo
        setDescricaoAnamnese(null); // Limpa a descrição
    };

    const codeBodyTemplate = (rowData: Projeto.Anamnese) => {
        return (
            <>
                <span className="p-column-title">Código</span>
                {rowData.id}
            </>
        );
    };

    const nameBodyTemplate = (rowData: Projeto.Anamnese) => {
        return (
            <>
                <span className="p-column-title">Nome</span>
                {rowData.paciente.name}
            </>
        );
    };

    const dataBodyTemplate = (rowData: Projeto.Anamnese) => {
        return (
            <>
                <span className="p-column-title">data</span>
                {rowData.data}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Projeto.Anamnese) => {
        return (
            <>
                <Button icon="pi pi pi-eye" rounded severity="success" className="mr-2" onClick={() => verAnamnese(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Meus Atendimentos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />

                    <DataTable
                        ref={dt}
                        value={atendimentos}
                        selection={selectedAtendimentos}
                        onSelectionChange={(e) => setSelecteAtendimentos(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} atendimentos"
                        globalFilter={globalFilter}
                        emptyMessage="No atendimentos found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="código" header="Código" sortable body={codeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="nome" header="Nome" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="data" header="Data Atendimento" sortable body={dataBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                    </DataTable>
                    <Dialog visible={dialogoVer} style={{ width: '1000px' }} modal className="p-fluid" onHide={fecharDialogoVer}>
                        <p>{descricaoAnamnese}</p>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Atendimentos;
