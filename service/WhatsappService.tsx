import axios from "axios";

// Configurando a instância do Axios com a base URL vinda do arquivo .env
export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_WHATSAPP_URL_API
});

export class WhatsAppService {
    private url: string;

    constructor(url: string) {
        this.url = url.replace(/\/+$/, '');  // Remove qualquer barra no final da URL

        // Interceptor para adicionar a API Key em todas as requisições
        axiosInstance.interceptors.request.use(
            (config) => {
                const apiKey = process.env.NEXT_PUBLIC_API_KEY;
                if (apiKey) {
                    config.headers['x-api-key'] = apiKey;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Interceptor para tratar respostas e possíveis erros
        axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                console.error("Erro na resposta. Status:", error.response ? error.response.status : 'sem status');
                if (error.response && error.response.status === 401) {
                    window.location.reload(); // Recarrega a página em caso de erro de autenticação
                }
                return Promise.reject(error);
            }
        );
    }

    // Iniciar sessão
    iniciarSessao(sessionId: string) {
        return axiosInstance.get(`${this.url}/session/start/${sessionId}`);
    }

    // Obter QR Code
    async gerarQRCode(sessionId: string): Promise<Blob> {
        try {
            const response = await axiosInstance.get(`${this.url}/session/qr/${sessionId}/image`, {
                responseType: 'blob',
                headers: {
                    'Accept': 'image/png',
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('application/json')) {
                const jsonResponse = await response.data.text();
                const parsed = JSON.parse(jsonResponse);
                throw new Error(parsed.error || parsed.message);
            }

            return response.data;  // Retorna o blob da imagem
        } catch (error) {
            console.error("Erro ao gerar o QR Code:", error);
            throw error;
        }
    }

    // Verificar status da sessão
    verificarStatusSessao(sessionId: string) {
        return axiosInstance.get(`${this.url}/session/status/${sessionId}`);
    }

    // Desconectar todas as sessões
    async desconectarTodasSessoes(): Promise<void> {
        try {
            await axiosInstance.get(`${this.url}/session/terminateAll`);
        } catch (error) {
            console.error("Erro ao desconectar todas as sessões:", error);
            throw error;
        }
    }

    // Enviar mensagem com botão
    async enviarMensagemComBotao(sessionId: string, chatId: string, messageBody: string, buttonText: string) {
        const payload = {
            chatId: `${chatId}@c.us`,
            contentType: "Buttons",
            content: {
                body: messageBody,
                buttons: [{ body: buttonText }],
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
