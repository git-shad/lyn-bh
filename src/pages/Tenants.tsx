import {useState, useCallback} from 'react'
import { IonSearchbar,IonList, IonItem,IonContent} from '@ionic/react';
import { Fab, Button } from '@mui/material'

//components
import NewTenant from '../components/NewTenant';

//icon
import AddIcon from '@mui/icons-material/Add';

const Tenants: React.FC = () => {
  const data = [
    'Amsterdam',
    'Buenos Aires',
    'Cairo',
    'Geneva',
    'Hong Kong',
    'Istanbul',
    'London',
    'Madrid',
    'New York',
    'Panama City',
    'Paris',
    'Rome',
    'San Francisco',
    'Sao Paulo',
    'Singapore',
    'Tokyo',
    'Utrecht',
    'Vancouver',
    'Washington, D.C.',
    'Xiamen',
    'Yokohama',
    'Zurich'
  ];

  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  return (
    <>
      <IonContent>
        <IonSearchbar className='sticky top-0 z-10 '/>
        <IonList className=''>
          {data.map((item, index) => (
            <IonItem key={index}>
              <Button fullWidth color='inherit' sx={{justifyContent: 'left', textTransform: 'none'}}>{item}</Button>
            </IonItem>
          ))}
        </IonList>
        <Fab onClick={handleOpen} color='primary' size='small' sx={{position: 'fixed', bottom: 16, right: 16}}>
          <AddIcon fontSize='small'/>
        </Fab>
        <NewTenant open={open} onClose={handleOpen}/>
      </IonContent>
    </>
  );
};

export default Tenants;
