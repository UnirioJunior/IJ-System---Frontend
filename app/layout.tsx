'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import { useEffect, useState } from 'react';
import LoginPage from './(full-page)/auth/login/page';
import NewUserPage from './(full-page)/auth/newuser/page';


interface RootLayoutProps {
    children: React.ReactNode;
}

const checkAuth = () => {

    if (localStorage.getItem('TOKEN_APLICACAO_FRONTEND') != undefined) {
        return true;
    } else {
        return false;
    }
}
const checkNewUser = () => {
    if (localStorage.getItem('NEWUSER') === 'true' && localStorage.getItem('C') === '0') {
        localStorage.setItem('C', '1');
        return true;
    } else {
        localStorage.setItem('NEWUSER', 'false');
        localStorage.setItem('C', '0');
        return false;
    }
}

export default function RootLayout({ children }: RootLayoutProps) {


    const [autenticado, setAutenticado] = useState(false);
    const [newUser, setNewUser] = useState(false);

    useEffect(() => {
        
        setAutenticado(checkAuth());
        setNewUser(checkNewUser());
        
    }, []);

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet"></link>
            </head>
            <body>
                {autenticado ?
                    <PrimeReactProvider>
                        <LayoutProvider>{children}</LayoutProvider>
                    </PrimeReactProvider>
                        : newUser ? 
                        <PrimeReactProvider>
                            <LayoutProvider>
                                <NewUserPage />
                            </LayoutProvider>
                        </PrimeReactProvider>
                        :
                        <PrimeReactProvider>
                            <LayoutProvider>
                                <LoginPage />
                            </LayoutProvider>
                        </PrimeReactProvider>

                }
            </body>
        </html>
    );
}
