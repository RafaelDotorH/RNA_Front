import Link from 'next/link'; // Importa el componente Link de Next.js
import '../CSS/menuNav.css'
import { IonIcon } from '@ionic/react';
import { homeOutline, logOutOutline, libraryOutline, settingsOutline, informationOutline } from 'ionicons/icons';
import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../lib/AuthContext';

const MenuNav = () => {
    const { logout } = useContext(AuthContext);
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <nav id="navbar">
            <ul className="navbar-items flexbox-col">
                <li className="navbar-logo flexbox-left">
                    <Link href="/" className="navbar-item-inner flexbox">
                        <div className="logo">
                            <img src={require('../resources/logo.png')} alt="Logo" style={{ width: 50, height: 50, opacity: 0.5 }} />
                        </div>
                    </Link>
                </li>
                <li className="navbar-item flexbox-left">
                    <Link href="/menu" className="navbar-item-inner flexbox-left">
                        <div className="navbar-item-inner-icon-wrapper flexbox">
                            <IonIcon icon={homeOutline} />
                        </div>
                        <span className="link-text">Inicio</span>
                    </Link>
                </li>
                <li className="navbar-item flexbox-left">
                    <Link href="/biblioteca" className="navbar-item-inner flexbox-left">
                        <div className="navbar-item-inner-icon-wrapper flexbox">
                            <IonIcon icon={libraryOutline} />
                        </div>
                        <span className="link-text">Biblioteca</span>
                    </Link>
                </li>
                <li className="navbar-item flexbox-left">
                    <Link href="/principal" className="navbar-item-inner flexbox-left">

                        <div className="navbar-item-inner-icon-wrapper flexbox">
                            <IonIcon icon={settingsOutline} />
                        </div>
                        <span className="link-text">Evaluador</span>

                    </Link>
                </li>
                <li className="navbar-item flexbox-left">
                    <Link href="/nosotros" className="navbar-item-inner flexbox-left">

                        <div className="navbar-item-inner-icon-wrapper flexbox">
                            <IonIcon icon={informationOutline} />
                        </div>
                        <span className="link-text">Nosotros</span>

                    </Link>
                </li>
                <li className="navbar-item-inner flexbox-left" onClick={handleLogout}>
                        <div className="navbar-item-inner-icon-wrapper flexbox">
                            <IonIcon icon={logOutOutline} />
                        </div>
                        <span className="link-text">Cerra Sesion</span>
                </li>
            </ul>
        </nav>
    );
};

export default MenuNav;