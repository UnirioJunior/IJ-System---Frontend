import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_WHATSAPP_URL_API // URL vinda do .env
});

export class WhatsAppService {
    private url: string;

    constructor(url: string) {
        this.url = url;

        axiosInstance.interceptors.request.use(
            (config) => {
                const apiKey = process.env.NEXT_PUBLIC_API_KEY;
                //console.log("API Key:", apiKey); // Verifica se a chave está sendo obtida corretamente

                if (apiKey) {
                    config.headers['x-api-key'] = apiKey;
                }

                //console.log("Headers da requisição:", config.headers); // Verifica todos os headers antes de enviar a requisição

                return config;
            },
            (error) => Promise.reject(error)
        );

        axiosInstance.interceptors.response.use(
            (response) => {
                //console.log("Resposta recebida com sucesso:", response.status); // Verifica o status de sucesso da resposta
                return response;
            },
            async (error) => {
                console.error("Erro na resposta. Status:", error.response ? error.response.status : 'sem status'); // Verifica o status do erro
                if (error.response && error.response.status === 401) {
                    window.location.reload();
                }

                return Promise.reject(error);
            }
        );

    }

    iniciarSessao(sessionId: string) {
        return axiosInstance.get(`${this.url.replace(/\/+$/, '')}/session/start/${sessionId}`);
    }


    // Nova função para obter o QR Code
    async gerarQRCode(sessionId: string): Promise<Blob> {
        try {
            const response = await axiosInstance.get(`${this.url}/session/qr/${sessionId}/image`, {
                responseType: 'blob', // Define o tipo de resposta como 'blob'
                headers: {
                    'Accept': 'image/png',
                    'x-api-key': process.env.API_KEY || '', // Adiciona a chave da API
                }
            });

            // Verifica se a resposta não é um JSON de erro
            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('application/json')) {
                const text = await response.data.text();
                const jsonResponse = JSON.parse(text);
                console.error("Erro no servidor:", jsonResponse.error || jsonResponse.message);
                throw new Error(jsonResponse.error || jsonResponse.message);
            }

            return response.data; // Retorna o Blob se a resposta não for JSON
        } catch (error) {
            console.error("Erro ao gerar o QR Code:", error);
            throw error; // Rejeita a Promise em caso de erro
        }
    }

    // Nova função para verificar o status da sessão
    verificarStatusSessao(sessionId: string) {
        return axiosInstance.get(`${this.url}/session/status/${sessionId}`);
    }

    async desconectarTodasSessoes(): Promise<void> {
        try {
            await axiosInstance.get(`${this.url}/session/terminateAll`);
        } catch (error) {
            console.error("Erro ao desconectar todas as sessões:", error);
            throw error;
        }
    }

    async enviarMensagemComBotao(sessionId: string, chatId: string, messageBody: string, buttonText: string) {
        //console.log(`${this.url}/client/sendMessage/${sessionId}`);
        const payload = {
            chatId: `${chatId}@c.us`,  // Número de telefone + @c.us
            contentType: "Buttons",
            content: {
                body: messageBody,
                buttons: [
                    {
                        body: buttonText
                    }
                ],
                title: "Seja bem vindo!",
                footer: "Escolha uma opção"
            }
        };

        try {
            const response = await axiosInstance.post(`${this.url}/client/sendMessage/${sessionId}`, payload);
            return response.data;
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            throw error;
        }
    }
}


/* buscarPordId(id: number) {
    return axiosInstance.get(this.url + "/" + id);
}

inserir(objeto: any) {
    return axiosInstance.post(this.url, objeto);
}

alterar(objeto: any) {
    return axiosInstance.put(this.url, objeto);
}

excluir(id: number) {
    return axiosInstance.delete(this.url + "/" + id);
} */