import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { IonContent,IonItem,IonGrid,IonRow,IonCol,IonIcon,IonAccordionGroup,IonAccordion,IonLabel} from '@ionic/react';
import { Button,IconButton,Box } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { db, type Tenant } from '../backend/db';

//icon
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { flash,home,water } from 'ionicons/icons'

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
        <Button sx={{textTransform: 'none'}} slot='end' variant='contained' size='small'>History</Button>
      </IonItem>
      <IonItem lines='none' className='mt-2'>
        <IonGrid className='border rounded-xl'>
          <IonRow className='m-2 mb-10 w-full flex justify-center'>
            <Box className='flex-col'>
              <Box className='font-bold text-3xl'>{tenant?.name}</Box>  
              <Box className=''>{tenant?.room}</Box>  
            </Box>
          </IonRow>
          
          <IonRow>
            <IonCol className='grid grid-rows-2'>
              <Box className='row-span-1 flex justify-center'>
                <Box className='font-bold'>{tenant?.balance}</Box>
              </Box>
              <Box className='row-span-1 flex justify-center'>
                Balance
              </Box>
            </IonCol>
            <IonCol className='grid grid-rows-2'>
              <Box className='row-span-1 flex justify-center'>
                <Box className='font-bold'>{tenant?.coin}</Box>
              </Box>
              <Box className='row-span-1 flex justify-center'>
                Coin's
              </Box>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonItem>
      <IonItem lines='none' className='mt-4'>
        <Box className='flex flex-col w-full'>
          <Box className='font-semibold'>utillity bills</Box>
          <IonAccordionGroup expand='inset'>
            <IonAccordion value='rent'>
              <IonItem slot='header' color='light'>
                <IonIcon icon={home} className='mr-4'/>
                <IonLabel>Rent</IonLabel>
              </IonItem>
            </IonAccordion>
            <IonAccordion value='electric'>
              <IonItem slot='header' color='light'>
                <IonIcon icon={flash} className='mr-4'/>
                <IonLabel>Electric</IonLabel>
              </IonItem>
            </IonAccordion>
            <IonAccordion value='water' >
              <IonItem slot='header' color='light'>
                <IonIcon icon={water} className='mr-4'/>
                <IonLabel>Water</IonLabel>
              </IonItem>
            </IonAccordion>
          </IonAccordionGroup>
        </Box>
      </IonItem>
    </IonContent>
  )
        
}

export default Profile;