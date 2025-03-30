import { Route, Link, Redirect} from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Dashboard from './pages/Dashboard';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
// import '@ionic/react/css/palettes/dark.class.css';
// import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

import {
  IonToolbar,IonMenu,IonHeader,IonContent,IonPage,IonMenuButton,IonTitle,
  IonList,IonItem,IonMenuToggle,
} from '@ionic/react'
import {Button,SvgIcon} from '@mui/material'
import Tenants from './pages/Tenants';
import BillingAndPayments from './pages/BillingAndPayments';
import Profile from './pages/Profile';
import Settings from './pages/Settings'
import { useEffect, useState, useCallback } from 'react'
import db from './backend/db'
import {ThreeDot} from 'react-loading-indicators'
import { syncAllTables, syncFirestoreToDexie, handleResetTenantRecord} from './pages/Settings'
import { isOnline } from './backend/Online'

//icon
import DashboardIcon from '@mui/icons-material/Dashboard';
import { FaHouseChimneyUser } from "react-icons/fa6";
import PaymentsIcon from '@mui/icons-material/Payments';
import SettingsIcon from '@mui/icons-material/Settings';

const App: React.FC = () => {
  const [isBusy, setIsBusy] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [isSync, isRetrieve, isResetrecord] = await Promise.all([
        db.settings.get('syncdb'),
        db.settings.get('retrievedb'),
        db.settings.get('resetrecord')
      ]);

      if (isSync?.value) await syncAllTables();
      if (isRetrieve?.value) await syncFirestoreToDexie().then(()=>db.settings.update('retrievedb',{value: false}))
      if (isResetrecord?.value) await handleResetTenantRecord().then(()=>db.settings.update('resetrecord',{value: false}))
      setIsBusy(false);
    };

    fetchData();
  }, []);

  if (isBusy) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ThreeDot variant="bounce" color="#3183cc" size="large" text="loading..." textColor="" />
      </div>
    )
  }
   
  return (
    <IonReactRouter>
      <IonMenu id='main-menu' contentId='main' type='overlay'>
        <IonHeader>
          <IonToolbar>
            <IonTitle style={{ color: '#131c2b' }} slot='end'>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList inset={true} lines='none'>
            <IonItem>
              <Button component={Link} to='/dashboard' fullWidth sx={{justifyContent: 'left', textTransform: 'none'}} startIcon={<DashboardIcon/>}>Dashboard</Button>
            </IonItem>
            <IonItem>
              <Button component={Link} to='/tenants' fullWidth sx={{justifyContent: 'left', textTransform: 'none'}} startIcon={<SvgIcon><FaHouseChimneyUser/></SvgIcon>}>Tenants</Button>
            </IonItem>
            <IonItem>
              <Button component={Link} to='/payments' fullWidth sx={{justifyContent: 'left', textTransform: 'none'}} startIcon={<PaymentsIcon/>}>Billing & Payments</Button>
            </IonItem>
            <IonItem>
              <Button component={Link} to='/settings' fullWidth sx={{justifyContent: 'left', textTransform: 'none'}} startIcon={<SettingsIcon/>}>Settings</Button>
            </IonItem>
          </IonList>
        </IonContent>
      </IonMenu>
      <IonApp>
        <IonPage id='main'>
          <IonHeader translucent={true}>
            <IonToolbar>
              <Button>
                <IonMenuButton/>
              </Button>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonRouterOutlet>
              <Route path="/dashboard" exact component={Dashboard}/>
              <Route path="/" exact render={()=><Redirect to='/dashboard'/>}/>
              <Route path="/tenants" exact component={Tenants}/>
              <Route path="/tenants/profile" exact component={Profile}/>
              <Route path="/payments" exact component={BillingAndPayments}/>
              <Route path="/settings" exact component={Settings}/>
            </IonRouterOutlet>
          </IonContent>
        </IonPage>
      </IonApp>
    </IonReactRouter>
  )
}

export default App;


