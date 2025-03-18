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
  
  const tenants = useLiveQuery(() => db.tenants.toArray());
  const [data, setData] = useState<Tenants>();

  useEffect(() => {
    if (tenants) {
      setData(tenants);
    }
  }, [tenants]);

  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  useEffect(() => {
    if (tenants) {
      const fetchPreviousSearch = async () => {
      const previousSearch = await db.settings.get({ key: 'searched' });
      if (previousSearch?.value) {
        handleSearchInput(previousSearch.value);
      } else {
        setData(tenants);
      }
      };
      fetchPreviousSearch();
    }
  }, [tenants]);

  useEffect(() => {
    if (search !== '') {
      db.settings.put({ key: 'searched', value: search });
    }
  }, [search]);

  const handleSearchInput = useCallback((search: string) => {
    if (search) {
      const filtered = tenants?.filter((tenant) => {
        const regex = new RegExp(search.replace('*', '.*'), 'i'); // Updated to match any part of the string
        return regex.test(tenant.name ?? '') || tenant.room?.toLowerCase() === search.toLowerCase();
      });
      setData(filtered);
      setSearch(search);
    } else {
      setData(tenants);
      setSearch('');
    }
  }, [tenants]);

  return (
    <>
      <IonContent>
        <IonSearchbar value={search} onIonInput={(e: CustomEvent)=> handleSearchInput((e.target as HTMLInputElement).value)} className='sticky top-0 z-10 text-blue-500'/>
        <IonList className=''>
          {data?.map((tenant) => (
            <IonItem key={tenant.id}>
              <Button component={Link} to={`/tenants/profile?id=${tenant.id}`} fullWidth variant='text' sx={{justifyContent: 'left', textTransform: 'none'}}>{tenant.name}</Button>
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
