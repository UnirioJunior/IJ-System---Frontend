/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Projeto } from '../../../../types/types';
import {PacienteService } from '../../../../service/PacienteService'; 

const Paciente = () => {
    let pacienteVazio: Projeto.Paciente = {
        id: 0,
        name: ''
    };

    const [pacientessss, setPacientessss] = useState<Projeto.Paciente[] | null>(null);
    const [pacienteDialog, setPacienteDialog] = useState(false);
    const [deletePacienteDialog, setDeletePacienteDialog] = useState(false);
    const [deletePacientessssDialog, setDeletePacientessssDialog] = useState(false);
    const [paciente, setPaciente] = useState<Projeto.Paciente>(pacienteVazio);
    const [selectedPacientessss, setSelectedPacientessss] = useState<Projeto.Paciente[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const pacienteService = useMemo(() => new PacienteService(), []);

    useEffect(() => {
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

    const openNew = () => {
        setPaciente(pacienteVazio);
        setSubmitted(false);
        setPacienteDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPacienteDialog(false);
    };

    const hideDeletePacienteDialog = () => {
        setDeletePacienteDialog(false);
    };

    const hideDeletePacientessssDialog = () => {
        setDeletePacientessssDialog(false);
    };

    const savePaciente = () => {
        setSubmitted(true);

        if (!paciente.id) {
            pacienteService.inserir(paciente)
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
                    })
                });
        } else {
            pacienteService.alterar(paciente)
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
                    })
                })
        }
    }

    const editPacientes = (paciente: Projeto.Paciente) => {
        setPaciente({ ...paciente });
        setPacienteDialog(true);
    };

    const confirmDeletePaciente = (paciente: Projeto.Paciente) => {
        setPaciente(paciente);
        setDeletePacienteDialog(true);
    };

    const deletePaciente = () => {
        if (paciente.id) {
            pacienteService.excluir(paciente.id).then((response) => {
                setPaciente(pacienteVazio);
                setDeletePacienteDialog(false);
                setPacientessss(null);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: 'Paciente Deletado com Sucesso!',
                    life: 3000
                });
            }).catch((error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao deletar o Paciente!',
                    life: 3000
                });
            });
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeletePacientessssDialog(true);
    };

    const deleteSelectedPacientessss = () => {

        Promise.all(selectedPacientessss.map(async (_paciente) => {
            if (_paciente.id) {
                await pacienteService.excluir(_paciente.id);
            }
        })).then((response) => {
            setPacientessss(null);
            setSelectedPacientessss([]);
            setDeletePacientessssDialog(false);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'Paciente Deletados com Sucesso!',
                life: 3000
            });
        }).catch((error) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao deletar Pacientes!',
                life: 3000
            })
        });
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _paciente = { ...paciente };
        _paciente[`${name}`] = val;

        setPaciente(_paciente);
        
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedPacientessss || !(selectedPacientessss as any).length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" />
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const idBodyTemplate = (rowData: Projeto.Paciente) => {
        return (
            <>
                <span className="p-column-title">Código</span>
                {rowData.id}
            </>
        );
    };

    const nomeBodyTemplate = (rowData: Projeto.Paciente) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                {rowData.name}
            </>
        );
    };

    

    

    const actionBodyTemplate = (rowData: Projeto.Paciente) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editPacientes(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeletePaciente(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gerenciamento de Pacientes</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const pacienteDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={savePaciente} />
        </>
    );
    const deletePacienteDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeletePacienteDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deletePaciente} />
        </>
    );
    const deletePacientessssDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeletePacientessssDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSelectedPacientessss} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={pacientessss}
                        selection={selectedPacientessss}
                        onSelectionChange={(e) => setSelectedPacientessss(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} pacientes"
                        globalFilter={globalFilter}
                        emptyMessage="Nenhum paciente encontrado."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="id" header="Código" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="name" header="Nome" sortable body={nomeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

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

                    <Dialog visible={deletePacienteDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deletePacienteDialogFooter} onHide={hideDeletePacienteDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {paciente && (
                                <span>
                                    Você realmente deseja excluir o paciente <b>{paciente.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePacientessssDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deletePacientessssDialogFooter} onHide={hideDeletePacientessssDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {paciente && <span>Você realmente deseja excluir os pacientes selecionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Paciente;
