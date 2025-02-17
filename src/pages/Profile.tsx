import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { IonContent,IonItem,IonPage} from '@ionic/react';
import { Button,IconButton } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { db, type Tenant } from '../backend/db';

//icon
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

const Profile: React.FC = () => {
  const location = useLocation();
  const searchParam = new URLSearchParams(location.search)
  const id = searchParam.get('id')
  const [tenant, setTenant] = useState<Tenant>();

  useEffect(() => {
    if (id) {
      (async () => {
        const result = await db.tenants.get(Number(id));
        console.log(result);
        setTenant(result);
      })();
    }
  }, [id]);

  return (
    <IonContent>
      <IonItem lines='none'>
        <Link to='/tenants'>
          <IconButton slot='start'><KeyboardArrowLeftIcon/></IconButton>
        </Link>
        <Button slot='end' variant='outlined' size='small'>update</Button>
      </IonItem>
    </IonContent>
  )
        
}

export default Profile;