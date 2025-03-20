import Link from 'next/link'; // Importa el componente Link de Next.js
import './menuNav.css'
import { IonIcon } from '@ionic/react';
import { homeOutline, logOutOutline, libraryOutline, settingsOutline, informationOutline } from 'ionicons/icons';
import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';

export default function MenuNav() {
    const router = useRouter();

    async function signOut() {
        try {
          const response = await fetch('/api/auth/logout', {
            method: 'POST',
          });
          if (response.ok) {
            // Limpia también el estado del usuario en el frontend y cualquier otra cosa que necesites.
            console.log('Sesión cerrada correctamente');
            router.push('/');// esto redirige al usuario a la página principal.
          } else {
            console.error('Error al cerrar sesión');
          }
        } catch (error) {
          console.error('Error de red al cerrar sesión:', error);
        }
      }

    return (
        <nav id="navbar">
            <ul className="navbar-items flexbox-col">
                <li className="navbar-logo flexbox-left">
                    <Link href="/menu" className="navbar-item-inner flexbox">

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
                <li className="navbar-item-inner flexbox-left" onClick={signOut}>
                    <div className="navbar-item-inner-icon-wrapper flexbox">
                        <IonIcon icon={logOutOutline} />
                    </div>
                    <span className="link-text">Cerra Sesion</span>
                </li>
            </ul>
        </nav>
    );
};
