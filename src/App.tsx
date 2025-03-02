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
import { useEffect } from 'react'
import db from './backend/db'
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

//icon
import DashboardIcon from '@mui/icons-material/Dashboard';
import { FaHouseChimneyUser } from "react-icons/fa6";
import PaymentsIcon from '@mui/icons-material/Payments';


const App: React.FC = () => {

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      Keyboard.setScroll({ isDisabled: false });
    }
  }, []);

  useEffect(()=>{

    (async ()=>{
      const tenants = await db.tenants.toArray()
      const dateNow: string = new Date().toLocaleDateString()
      tenants?.map(async (tenant) => {
        if (tenant.id !== undefined && tenant.balance !== undefined) {
          const rentH = (await db.history.get(tenant.id))?.bills?.filter(bill => bill.label === 'rent')
          const rentB = tenant.rent_bills

          //add rent payment if not exists in history andrent bill
          if(!rentH?.find(date => date.start_date === dateNow) && !rentB?.find(date => date.date === dateNow)){
            const rentCost = 1000
            const rent = tenant.rent_bills ? [...(tenant.rent_bills || []), { amount: rentCost, date: dateNow }] : [{ amount: rentCost, date: dateNow }]
            const single = Array.from(new Set(rent?.map(bill => JSON.stringify(bill)))).map(bill => JSON.parse(bill))
            console.log(single)
            await db.tenants.update(tenant.id,{rent_bills: rent,balance: (tenant.balance + rentCost)})
          } 
      }
    })
    })()
  },[])

  return (
    <IonReactRouter>
      <IonMenu id='main-menu' contentId='main' type='overlay'>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu</IonTitle>
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
          <IonContent scrollY={true}>
          <IonRouterOutlet>
            <Route path="/dashboard" exact component={Dashboard}/>
            <Route path="/" exact render={()=><Redirect to='/dashboard'/>}/>
            <Route path="/tenants" exact component={Tenants}/>
            <Route path="/tenants/profile" exact component={Profile}/>
            <Route path="/payments" exact component={BillingAndPayments}/>
          </IonRouterOutlet>
          </IonContent>
        </IonPage>
      </IonApp>
    </IonReactRouter>
  )
}

export default App;
