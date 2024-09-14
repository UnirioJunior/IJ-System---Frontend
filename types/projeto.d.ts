import { S } from "@fullcalendar/core/internal-common";

declare namespace Projeto {
    type Usuario = {
        id?: number;
        name: string;
        login: string;
        senha: string;
        email: string;
        situacao: string;
    };

    type Paciente = {
        id?: number;
        name: string;
        usuario: Usuario;
    };

    type Anamnese = {
        id?: number;
        descricao: string;
        paciente: Paciente;
        usuario: Usuario;
        data: string;
    }

    type Agendamento = {
        id?: number;
        usuario: Usuario;
        nomePaciente: string;
        telefone: string;
        dataNascimento: string;
        tipoAtendimento: string;
        inicio: string;
        fim: string;
    }
    type ConfigWhatsApp = {
        id?: number;
        usuario: Usuario;
        sessionId: string;
        numUser: string;
        mensagemPaciente: string;
        mensagemNumUser: string;
        isAtivo: boolean;
    }
}