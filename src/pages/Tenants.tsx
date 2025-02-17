import {useState, useCallback, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { IonSearchbar,IonList, IonItem,IonContent} from '@ionic/react';
import { Fab, Button } from '@mui/material'
import { db, useLiveQuery, type Tenants } from '../backend/db';

//components
import NewTenant from '../components/NewTenant';

//icon
import AddIcon from '@mui/icons-material/Add';

const Tenants: React.FC = () => {
  const tenants = useLiveQuery(() => db.tenants.toArray(),[]);
  const [data, setData] = useState<Tenants>();

  useEffect(() => {
    if (tenants) {
      setData(tenants);
    }
  }, [tenants]);

  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  const handleSearchInput = useCallback((e: any) => {
    const search = e.target.value;
    if (search) {
      const filtered = tenants?.filter((tenant) => tenant.name?.toLowerCase().includes(search.toLowerCase()));
      setData(filtered);
    } else {
      setData(tenants);
    }
  },[tenants]);
  return (
    <>
      <IonContent>
        <IonSearchbar onIonInput={handleSearchInput} className='sticky top-0 z-10 '/>
        <IonList className=''>
          {data?.map((tenant) => (
            <IonItem key={tenant.id}>
              <Button component={Link} to={`/tenants/profile?id=${tenant.id}`} fullWidth color='inherit' sx={{justifyContent: 'left', textTransform: 'none'}}>{tenant.name}</Button>
            </IonItem>
          ))}
        </IonList>
        <Fab onClick={handleOpen} color='primary' sx={{position: 'fixed', bottom: 16, right: 16}}>
          <AddIcon/>
        </Fab>
        <NewTenant open={open} onClose={handleOpen}/>
      </IonContent>
    </>
  );
};

export default Tenants;
