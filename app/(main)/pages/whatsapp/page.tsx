/* eslint-disable @next/next/no-img-element */
'use client';

import { InputText } from 'primereact/inputtext';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WhatsAppService } from '../../../../service/WhatsappService';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { UsuarioService } from '../../../../service/UsuarioService';
import { Projeto } from '../../../../types/types';
import { ConfigWhatsappService } from '../../../../service/ConfigWhatsappService';



const WhatsApp = () => {

    let usuarioVazia: Projeto.Usuario = {
        id: 0, name: '', login: '', senha: '', email: '', situacao: ''
    }

    let configVazia: Projeto.ConfigWhatsapp = {
        id: 0,
        usuario: usuarioVazia,
        sessionId: '',
        mensagem: '',
        numUser: ''
    }

    const [sessao, setSessao] = useState('');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [sessionStarted, setSessionStarted] = useState<boolean>(false);
    const [canGenerateQRCode, setCanGenerateQRCode] = useState<boolean>(false); // Estado para habilitar o botão
    const whatsappService = useMemo(() => new WhatsAppService(process.env.NEXT_PUBLIC_WHATSAPP_URL_API!), []);
    const toast = useRef<Toast>(null);
    const [dialogoQr, setDialogoQr] = useState(false);
    const [mensagemPaciente, setMensagemPaciente] = useState('');
    const [mensagemNumUser, setMensagemNumUser] = useState('');
    const [numPrincipal, setNumPrincipal] = useState("")
    const [userId, setUserId] = useState<number | null>(null);
    const [usuarioLogado, setUsuarioLogado] = useState<Projeto.Usuario>(usuarioVazia);
    const usuarioService = useMemo(() => new UsuarioService(), []);
    const [configWhatsApp, setConfigWhatsApp] = useState<Projeto.ConfigWhatsapp>(configVazia);
    const configService = useMemo(() => new ConfigWhatsappService(), []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        let statusCheckInterval: NodeJS.Timeout;

        if (sessionStarted) {
            timer = setTimeout(() => {
                setCanGenerateQRCode(true);
            }, 7000);

            // Verifica o status da sessão periodicamente
            statusCheckInterval = setInterval(() => {
                checkSessionStatus();
            }, 5000); // Verifica a cada 5 segundos

        } else {
            setCanGenerateQRCode(false);
        }

        return () => {
            clearTimeout(timer);
            clearInterval(statusCheckInterval);
        };

    }, [sessionStarted]);

    // PEGA O USUARIO LOGADO //
    useEffect(() => {
        const userIdFromStorage = localStorage.getItem('USER_ID');
        const userIdNumber = userIdFromStorage ? parseInt(userIdFromStorage, 10) : null;
        setUserId(userIdNumber);
        if (userIdNumber !== null) {
            usuarioService.buscarPordId(userIdNumber).then((response) => {
                setUsuarioLogado(response.data);
            });
        }
    }, []);

    const iniciarSessao = async () => {
        try {
            const response = await whatsappService.iniciarSessao(sessao);
            setSessionStarted(true);
            toast.current?.show({
                severity: 'success',
                summary: 'Sessão Iniciada!',
                detail: 'A sessão foi iniciada com sucesso. Aguarde.'
            });
        } catch (error) {
            console.error("Erro ao iniciar a sessão:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao iniciar a sessão: ' + (error as Error).message
            });
        }
    };

    const gerarQrCode = async () => {
        if (!sessionStarted) {
            toast.current?.show({
                severity: 'info',
                summary: 'Sessão não Iniciada',
                detail: 'A sessão deve ser iniciada primeiro.'
            });
            return;
        }
        try {
            const qrCodeBlob = await whatsappService.gerarQRCode(sessao);
            if (qrCodeBlob) {
                setDialogoQr(true);
                const qrCodeUrl = URL.createObjectURL(qrCodeBlob);
                setQrCode(qrCodeUrl);
                toast.current?.show({
                    severity: 'success',
                    summary: 'QR Code Gerado',
                    detail: 'O QR Code foi gerado.'
                });
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('qr code not ready or already scanned')) {
                toast.current?.show({
                    severity: 'info',
                    summary: 'QR Code não Pronto',
                    detail: 'O QR Code não está pronto para ser escaneado.'
                });
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao gerar o QR Code: ' + (error as Error).message
                });
            }
        }
    };

    const checkSessionStatus = async () => {
        if (!sessao) {
            toast.current?.show({
                severity: 'info',
                summary: 'Sessão Não Iniciada',
                detail: 'A sessão não foi iniciada.'
            });
            return;
        }

        try {
            const response = await whatsappService.verificarStatusSessao(sessao);
            const { success, state, message } = response.data;

            if (success && state === 'CONNECTED') {
                // Sessão conectada, remova o QR Code
                setQrCode(null);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sessão Conectada',
                    detail: 'A sessão foi conectada com sucesso.'
                });
            } else {
                toast.current?.show({
                    severity: 'info',
                    summary: 'Sessão Não Conectada',
                    detail: 'A sessão ainda não está conectada.'
                });
            }
        } catch (error) {
            console.error("Erro ao verificar o status da sessão:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao verificar o status da sessão: ' + (error as Error).message
            });
        }
    };

    // Nova função para desconectar todas as sessões
    const desconectarTodasSessoes = async () => {
        try {
            await whatsappService.desconectarTodasSessoes();
            toast.current?.show({
                severity: 'success',
                summary: 'Todas as Sessões Desconectadas',
                detail: 'Todas as sessões foram desconectadas com sucesso.'
            });
            setQrCode(null); // Limpa o QR Code da tela
            setSessionStarted(false); // Reseta o estado da sessão
        } catch (error) {
            console.error("Erro ao desconectar todas as sessões:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao desconectar todas as sessões: ' + (error as Error).message
            });
        }
    };

    const fecharDialogoQr = () => {
        setDialogoQr(false);
    };

    const enviarMensagemComBotao = async () => {
        const telefone = '556696913759';  // Número do telefone do destinatário
        const mensagem = 'Esse é o botão para confirmar consulta';
        const textoBotao = 'Clique aqui';

        try {
            await whatsappService.enviarMensagemComBotao(sessao, telefone, mensagem, textoBotao);
            toast.current?.show({
                severity: 'success',
                summary: 'Mensagem enviada',
                detail: 'A mensagem com botão foi enviada com sucesso.'
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao enviar mensagem: ' + (error as Error).message
            });
        }
    };

    const salvarConfig = async () => {
        try {
            const response = await whatsappService.verificarStatusSessao(sessao);
            const { success, state } = response.data;

            if (success && state === 'CONNECTED') {
                const novaConfigWhatsApp: Projeto.ConfigWhatsapp = {
                    usuario: usuarioLogado, // Pega o usuário logado
                    sessionId: sessao, // Pega o ID da sessão
                    mensagemPaciente: mensagemPaciente,
                    mensagemNumUser: mensagemNumUser,
                    numUser: numPrincipal, // Pega o número do usuário
                    isAtivo: true // Sessão está conectada
                };

                await configService.inserir(novaConfigWhatsApp);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Config Salva!',
                    detail: 'Configuração salva com sucesso'
                });
            } else {
                toast.current?.show({
                    severity: 'info',
                    summary: 'Sessão Não Conectada',
                    detail: 'A sessão ainda não está conectada.'
                });
            }
        } catch (error) {
            console.error("Erro ao salvar a configuração:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro ao salvar',
                detail: 'Erro ao salvar a configuração: ' + (error as Error).message
            });
        }
    };



    return (
        <div className='card'>
            <div className="grid">
                <Toast ref={toast} />
                <div className='col-12 md:col-6'>
                    <h5>Conexão com WhatsApp</h5>
                    <div className='card p-fluid'>
                        <div className='p-fluid formgrid grid'>
                            <div className='field col-12 md:col-3'>
                                <div className='field'>
                                    <label htmlFor="nomeSessao" >
                                        Nome da Sessão
                                    </label>
                                    <InputText
                                        id='sessao'
                                        placeholder='Ex: Junior'
                                        value={sessao}
                                        onChange={(e) => setSessao(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className='field'>
                                    <Button onClick={iniciarSessao} label='Iniciar Sessão'></Button >
                                </div>
                                <div className='field'>
                                    <Button onClick={gerarQrCode} disabled={!canGenerateQRCode} label='Gerar QR Code'></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-12 md:col-6'>
                    <h5>Configuração de Mensagens</h5>
                    <div className='card p-fluid'>
                        <div className="p-fluid formgrid grid">
                            <div className='field col-6'>
                                <label htmlFor="idSessão2">Nome da Sessão já Iniciada</label>
                                <InputText
                                    id='idSessão2'
                                    placeholder='Ex: Junior'
                                    value={sessao}
                                />
                            </div>
                            <div className='field col-6'>
                                <label htmlFor="numeroPricipal">Seu número para lembrete</label>
                                <InputText
                                    id='numeroPricipal'
                                    placeholder='Ex: 6696022254'
                                    value={numPrincipal}
                                    onChange={(e) => setNumPrincipal(e.target.value)}
                                />
                            </div>
                            <div className='field col-6'>
                                <label htmlFor="numeroPricipal">Mensagem para min</label>
                                <InputTextarea
                                    id="address"
                                    value={mensagemNumUser}
                                    onChange={(e) => setMensagemNumUser(e.target.value)}
                                    placeholder='Ex: [mensagem] [nomePaciente] [inicio]'
                                    rows={4}
                                />
                            </div>
                            <div className='field col-6'>
                                <label htmlFor="msgPaciente">Mensagem para o Paciente</label>
                                <InputTextarea
                                    id="address"
                                    value={mensagemPaciente}
                                    onChange={(e) => setMensagemPaciente(e.target.value)}
                                    placeholder='Ex: Olá, [nomePaciente]. Esta é uma mensagem automática, estou passando aqui para lembrar que você tem um agendamento marcado dia [inicio].'
                                    rows={4}
                                />
                            </div>
                            <div className='field col'>
                                <Button onClick={salvarConfig} label='Salvar Configuração' />
                            </div>
                        </div>
                    </div>
                </div>

                <Dialog visible={dialogoQr} style={{ width: '450px' }} header="QR CODE" modal onHide={fecharDialogoQr}>
                    <div className="flex align-items-center justify-content-center">
                        {qrCode && <img src={qrCode} alt="QR Code" />}
                    </div>
                </Dialog>
            </div>
        </div>

    );
};

export default WhatsApp;
