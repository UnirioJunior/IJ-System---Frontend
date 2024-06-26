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
    };

    type Anamnese = {
        id?: number;
        descricao: string;
        paciente: Paciente;
    }
}