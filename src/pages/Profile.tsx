import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  IonContent, IonItem, IonGrid, IonRow, IonCol, IonIcon,
  IonAccordionGroup, IonAccordion, IonLabel, IonList, useIonRouter, IonInput
} from '@ionic/react';
import { Button, IconButton, SvgIcon, Box, FormControlLabel, Paper, Switch } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { db, Tenant, RentBill, ElectricBill, WaterBill, TenantHistory } from '../backend/db';
import { format, eachDayOfInterval } from 'date-fns';
import EditTenant from '../components/EditTenant';

//icon
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { flash, home, water } from 'ionicons/icons';
import PaidIcon from '@mui/icons-material/Paid';
import { PiHandCoinsFill } from "react-icons/pi";
import HistoryIcon from '@mui/icons-material/History';
import DoneIcon from '@mui/icons-material/Done';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';

const Profile: React.FC = () => {
  const location = useLocation();
  const searchParam = new URLSearchParams(location.search);
  const id: number = Number(searchParam.get('id'));

  useEffect(() => {
    // Fill rent dates that have no history but have not been paid
    (async () => {
      const tenant = await db.tenants.get(id);
      const dateNow: string = new Date().toLocaleDateString();
      if (!tenant?.date || tenant?.balance === undefined) return;
 
      const rentCost = (await db.storage.get('rent'))?.value  ?? 1000
      const start = new Date(tenant.date);
      const end = new Date(dateNow);
      const dateStack: string[] = eachDayOfInterval({ start, end }).map(date => format(date, 'M/d/yyyy'));
      const rentHistory = (await db.history.get(id))?.bills?.filter(bill => bill.label === 'rent').map(bill => bill.start_date) || [];
      const rentBills = tenant.rent_bills?.map(bill => bill.date) || [];
      const rentDateBills = dateStack.filter(date => !rentBills.includes(date) && !rentHistory.includes(date)).map(date => ({ amount: rentCost, date }));
      
      const singleRentBills = (Array.from(new Set(rentDateBills.map(bill => JSON.stringify(({amount: bill.amount, date: format(bill.date, 'M/yyyy')}))))).map(bill => JSON.parse(bill)))
      const currentRentBills = tenant.rent_bills?.map(bill => ({amount: bill.amount, date: format(new Date(bill.date), 'M/yyyy') })) || [];
      const filteredRentBills = singleRentBills.filter(bill => !currentRentBills.some(currentBill => currentBill.date === bill.date && currentBill.amount === bill.amount)) 
      const filteredRentHistory = rentHistory.map(date => format(date, 'M/yyyy'))//temp 
      const filterOnlyOneDate = filteredRentBills.filter(only => !filteredRentHistory.includes(only.date))
      const finalFilteringRentBills = filterOnlyOneDate.map(bill => {
        const [month,year] = bill.date.split('/');
        const date = new Date(Number(year),Number(month) - 1,end.getDate());
        return { amount: bill.amount, date: date.toLocaleDateString() }
      });

      if (finalFilteringRentBills.length === 0 ) return;
      const updatedRentBills = [...(tenant.rent_bills || []), ...finalFilteringRentBills];
      const uniqueRentBills = Array.from(new Set(updatedRentBills.map(bill => JSON.stringify(bill)))).map(bill => JSON.parse(bill));

      // Finalize the rent bills
      await db.tenants.update(id, { rent_bills: uniqueRentBills, balance: (Number(tenant.balance) || 0) + (rentCost * finalFilteringRentBills.length) });
    })().then(async () => {
      const tenant = await db.tenants.get(id);
      if (!tenant) return;

      const totalRent = tenant.rent_bills?.reduce((acc, bill) => acc + bill.amount, 0) || 0;
      const totalElectric = tenant.electric_bills?.reduce((acc, bill) => acc + bill.amount, 0) || 0;
      const totalWater = tenant.water_bills?.reduce((acc, bill) => acc + bill.amount, 0) || 0;

      const newBalance = totalRent + totalElectric + totalWater;

      await db.tenants.update(id, { balance: newBalance });
    });
  }, [id]);

  const router = useIonRouter();
  const GoTo = useCallback((address: string) => {
    router.push(address);
  }, [router]);

  const [tenant, setTenant] = useState<Tenant>();
  const [dRent, setRent] = useState<RentBill[]>();
  const [dElectric, setElectric] = useState<ElectricBill[]>();
  const [dWater, setWater] = useState<WaterBill[]>();
  const [history, setHistory] = useState<TenantHistory>();


  useEffect(() => {
    if (!id) {
      GoTo('/tenants');
      return;
    }

    (async () => {
      const cutoff = await db.cutoff.get(id)
      const tenant = cutoff ? await db.quarantine.get(id) : await db.tenants.get(id); 
      if (!tenant) {
        GoTo('/tenants');
        return;
      }

      setTenant(tenant);
      setRent(tenant.rent_bills || []);
      setElectric(tenant.electric_bills || []);
      setWater(tenant.water_bills || []);

      const historys = await db.history.get(id);
      if (historys) {
        setHistory(historys);
      }
    })();
  }, [id, GoTo,tenant]);

  //for paying button
  const handleDataBills = useCallback(async (data: {amount: number, date: string},bill: string, index: number)=>{
    const currentDate = new Date().toLocaleDateString()
    if(bill === 'rent' && tenant?.balance && tenant?.coin && history?.bills){
      if(data.amount > tenant?.coin) return;//block if amount are graterthan or equal to coin balance
      await db.tenants.update(id,{
        rent_bills: dRent?.filter((d,i)=> i !== index),
        balance: tenant.balance - data.amount,
        coin: tenant.coin - data.amount
      })

      history.bills.push({label: bill,amount: data.amount, start_date: data.date, end_date: ''})
      const updatedBills = history.bills.map(where => {
        if(where.label === bill && where.start_date === data.date){
          where.amount = data.amount;
          where.end_date = currentDate
          return where
        }
        return where;
      });
      
      await db.history.update(id, { bills: Array.from(new Set(updatedBills.map(bill => JSON.stringify(bill)))).map(bill => JSON.parse(bill)) });
    }else if(bill === 'water' && tenant?.balance && tenant?.coin && history?.bills ){
      if(data.amount > tenant?.coin) return;
      await db.tenants.update(id,{
        water_bills: dWater?.filter((d,i)=> i !== index),
        balance: tenant.balance - data.amount,
        coin: tenant.coin - data.amount
      })
      
      history.bills.push({label: bill,amount: data.amount, start_date: data.date, end_date: ''})
      const updatedBills = history.bills.map(where => {
        if(where.label === bill && where.start_date === data.date){
          where.amount = data.amount;
          where.end_date = currentDate
          return where
        }
        return where;
      });
      
      await db.history.update(id, { bills: Array.from(new Set(updatedBills.map(bill => JSON.stringify(bill)))).map(bill => JSON.parse(bill)) });
    }else if(bill === 'electric' && tenant?.balance && tenant?.coin && history?.bills){
      if(data.amount > tenant?.coin) return;
      await db.tenants.update(id,{
        electric_bills: dElectric?.filter((d,i)=> i !== index),
        balance: tenant.balance - data.amount,
        coin: tenant.coin - data.amount
      })

      history.bills.push({label: bill,amount: data.amount, start_date: data.date, end_date: ''})
      const updatedBills = history.bills.map(where => {
        if(where.label === bill && where.start_date === data.date){
          where.amount = data.amount;
          where.end_date = currentDate
          return where
        }
        return where;
      });
      
      await db.history.update(id, { bills: Array.from(new Set(updatedBills.map(bill => JSON.stringify(bill)))).map(bill => JSON.parse(bill)) });
    } 
  },[id, tenant, history, dRent, dWater, dElectric])

  const [isAddCoin, setIsAddCoin] = useState<boolean>(false);
  const [inputCoin, setInputCoin] = useState<number>();

  const handleAddCoin = useCallback(async () => {
    if ((tenant === undefined || tenant?.coin === undefined) || isNaN(Number(inputCoin))) return;
    const sum = (Number(tenant?.coin) + Number(inputCoin));
    await db.tenants.update(id, { coin: sum });
    setIsAddCoin(false);
    setInputCoin(undefined);
  }, [inputCoin, id, tenant]);

  const handleInputAddCoin = useCallback((e: any) => {
    setInputCoin(e.detail.value);
  }, []);

  const [isHidden, setIsHidden] = useState<boolean>(false);

  function formatDate(date: string) {
    const dateParts = date.split('/');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[parseInt(dateParts[0], 10) - 1];
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);
    return `${month} ${day}, ${year}`;
  }

  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  const [openDeleteItemR,setOpenDeleteItemR] = useState<number>();
  const [openDeleteItemW,setOpenDeleteItemW] = useState<number>();
  const [openDeleteItemE,setOpenDeleteItemE] = useState<number>();
  const [openDeleteItem, setOpenDeleteItem] = useState<boolean>(false);

  const handleOpenDelete = useCallback((bill: string, index: number) => {
    if(openDeleteItem){
      setOpenDeleteItem(false);
      setOpenDeleteItemR(undefined);
      setOpenDeleteItemW(undefined);
      setOpenDeleteItemE(undefined);
      return;
    }

    if(bill === 'rent'){
      setOpenDeleteItemR(index);
    }else if(bill === 'water'){
      setOpenDeleteItemW(index);
    }else if(bill === 'electric'){
      setOpenDeleteItemE(index);
    }
    setOpenDeleteItem(true);
  },[openDeleteItem])

  const handleDeleteItem = useCallback(async (data: {amount: number, date: string},bill: string, index: number)=>{
    const amount = !isNaN(data.amount) ? data.amount : 0;

    if(bill === 'rent' && tenant?.balance){
      await db.tenants.update(id,{
        rent_bills: dRent?.filter((_,i)=> i !== index),
        balance: tenant.balance - amount
      })
    }else if(bill === 'water' && tenant?.balance){
      console.log('test')
      await db.tenants.update(id,{
        water_bills: dWater?.filter((_,i)=> i !== index),
        balance: tenant.balance - amount
      })
    }else if(bill === 'electric' && tenant?.balance){
      await db.tenants.update(id,{
        electric_bills: dElectric?.filter((_,i)=> i !== index),
        balance: tenant.balance - amount
      })
    } 
  },[id, tenant, dRent, dWater, dElectric])

  const [isCutOff, setIsCutOff] = useState(false);
  const handleCutOffSwitch = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = event.target;

        if (checked) {
          await db.cutoff.add({ id, name: tenant?.name, room: tenant?.room, date: new Date().toLocaleDateString() });
          await db.quarantine.add( tenant as any);
          await db.tenants.update(id, { room: 'CUTOFF' });
        } else {
          const tenantData = await db.quarantine.get(id);
          if (tenantData) {
            await db.tenants.update(id, tenantData as Tenant);
            await db.cutoff.delete(id);
            await db.quarantine.delete(id);
          }
        }

        setIsCutOff(checked);
  },[tenant])

  useEffect(() => {
    const fetchCutOff = async () => {
      const cutoff = await db.cutoff.get(id);
      if (cutoff) {
        setIsCutOff(true);
      }
    };
    fetchCutOff();
  }, [id]);

  return (
    <IonContent>
      <IonItem lines='none' className='sticky top-0 bg-transparent z-20'>
        <Link to='/tenants'>
          <IconButton slot='start'><KeyboardArrowLeftIcon className='text-blue-500' /></IconButton>
        </Link>
        <Button startIcon={<HistoryIcon />} onClick={() => setIsHidden(!isHidden)} slot='end' variant='contained' size='small'>History</Button>
      </IonItem>
      <Box className='m-4'>
        <Box className='w-full' >
          <IonGrid className='border border-blue-500 rounded-xl px-4 py-9' style={{ backgroundColor: '#131c2b' }}>
            <IonRow className='m-2 mb-10 w-full flex justify-center'>
              <Box className='flex-col text-center'>
                <Box className='font-bold text-3xl'>{tenant?.name}</Box>
                <Box className='font-semibold text-sm itali'>{ isCutOff ? 'CUTOFF' : tenant?.room}</Box>
              </Box>
            </IonRow>

            <IonRow>
              <IonCol className='grid grid-rows-2'>
                <Box className='row-span-1 flex justify-center'>
                  <Box className='font-bold'>{tenant?.balance}</Box>
                </Box>
                <Box className='row-span-1 flex justify-center text-sm'>Balance</Box>
              </IonCol>
              <IonCol className='grid grid-rows-2'>
                <Box className='row-span-1 flex justify-center'>
                  <Box className='font-bold'>{tenant?.coin}</Box>
                </Box>
                <Box className='row-span-1 flex justify-center text-sm'>Coin's</Box>
              </IonCol>
            </IonRow>
          </IonGrid>
        </Box>
      </Box>
      <IonItem className='p-2'>
        <FormControlLabel 
          control={<Switch checked={isCutOff} onChange={handleCutOffSwitch} />} 
          label={<span style={{ color: '#131c2b' }}>{isCutOff ? 'Cutoff Enabled' : 'Cutoff Disabled'}</span>} 
           labelPlacement='end'
        /> 
      </IonItem>
      <IonItem lines='none' className='mt-1' hidden={isHidden}>
        <IonGrid>
          <IonRow>
            {isAddCoin && (
              <Box className='w-full shadow-md shadow-slate-900 rounded-lg px-6 bg-blue-100'>
                <IonInput className='text-black' value={inputCoin} onIonInput={handleInputAddCoin} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Add Coin's" />
              </Box>
            )}
          </IonRow>
          <IonRow>
            <IonCol className='flex justify-end mt-2'>
              <Box className='flex flex-row'>
                {!isAddCoin && (
                  <IconButton onClick={handleOpen} color='primary' sx={{ border: '1px solid', borderRadius: '8px', m: 1 }}><ModeEditIcon /></IconButton>
                )}
                <IconButton onClick={() => setIsAddCoin(!isAddCoin)} color='primary' sx={{ border: '1px solid', borderRadius: '8px', m: 1 }}><SvgIcon><PiHandCoinsFill /></SvgIcon></IconButton>
                {isAddCoin && (
                  <IconButton onClick={handleAddCoin} color='primary' sx={{ border: '1px solid', borderRadius: '8px', m: 1 }}><DoneIcon /></IconButton>
                )}
              </Box>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonItem>
      <IonItem lines='none' className='mt-4' hidden={isHidden}>
        <Box className='flex flex-col w-full'>
          <Box className='font-semibold text-lg' style={{ color: '#131c2b' }}>Utility Bills</Box>
          <IonAccordionGroup expand='inset'>
            <IonAccordion value='rent'>
              <IonItem slot='header' color='light'>
                <IonIcon icon={home} className='mr-4' />
                <IonLabel>Rent</IonLabel>
              </IonItem>
              <IonList slot='content' lines='none'>
                {dRent?.map((data,index) => (
                    <Box style={{ backgroundColor: '#131c2b' }} key={index} onClick={()=>{ handleOpenDelete('rent',index) }} className='grid grid-row-3 mx-2 mb-2 p-2 border rounded-md'>
                      { openDeleteItemR === index && (
                        <Box className='row-span-1 flex justify-end'>
                          <IconButton onClick={() => { handleDeleteItem({ amount: data?.amount, date: data?.date }, 'rent', index) }} color='error' sx={{ border: '1px solid', borderRadius: '8px', m: 1 }}><DeleteIcon /></IconButton>
                        </Box>
                      )}
                      <Box className='row-span-1'>Amount: <span className='font-semibold'>{(data?.amount).toString()}</span></Box>
                      <Box className='row-span-1'>Date: {formatDate(data?.date)}</Box>
                      { openDeleteItemR !== index && (
                        <Box className='row-span-1 flex justify-end'>
                          <Button onClick={() => { handleDataBills({ amount: data?.amount, date: data?.date }, 'rent', index) }} size='small' startIcon={<PaidIcon />} sx={{ textTransform: 'none' }}>paid</Button>
                        </Box>
                      )}
                    </Box>
                  ))}
              </IonList>
            </IonAccordion>
            <IonAccordion value='water' >
              <IonItem slot='header' color='light'>
                <IonIcon icon={water} className='mr-4' />
                <IonLabel>Water</IonLabel>
              </IonItem>
              <IonList slot='content' lines='none'>
                {dWater?.map((data,index) => (
                  <Box style={{ backgroundColor: '#131c2b' }} key={index} onClick={()=>{ handleOpenDelete('water',index) }} className='grid grid-row-3 mx-2 mb-2 p-2 border rounded-md'>
                  { openDeleteItemW === index && (
                    <Box className='row-span-1 flex justify-end'>
                      <IconButton onClick={() => { handleDeleteItem({ amount: data?.amount, date: data?.date }, 'water', index) }} color='error' sx={{ border: '1px solid', borderRadius: '8px', m: 1 }}><DeleteIcon /></IconButton>
                    </Box>
                  )}
                  <Box className='row-span-1'>Amount: <span className='font-semibold'>{(data?.amount).toString()}</span></Box>
                  <Box className='row-span-1'>Date: {formatDate(data?.date)}</Box>
                  { openDeleteItemW !== index && (
                    <Box className='row-span-1 flex justify-end'>
                      <Button onClick={() => { handleDataBills({ amount: data?.amount, date: data?.date }, 'water', index) }} size='small' startIcon={<PaidIcon />} sx={{ textTransform: 'none' }}>paid</Button>
                    </Box>
                  )}
                  </Box>
                ))}
              </IonList>
            </IonAccordion>
            <IonAccordion value='electric'>
              <IonItem slot='header' color='light'>
                <IonIcon icon={flash} className='mr-4' />
                <IonLabel>Electric</IonLabel>
              </IonItem>
              <IonList slot='content' lines='none'>
                {dElectric?.map((data,index) => (
                  <Box style={{ backgroundColor: '#131c2b' }} key={index} onClick={()=>{ handleOpenDelete('electric',index) }} className='grid grid-row-3 mx-2 mb-2 p-2 border rounded-md'>
                  { openDeleteItemE === index && (
                    <Box className='row-span-1 flex justify-end'>
                      <IconButton onClick={() => { handleDeleteItem({ amount: data?.amount, date: data?.date }, 'electric', index) }} color='error' sx={{ border: '1px solid', borderRadius: '8px', m: 1 }}><DeleteIcon /></IconButton>
                    </Box>
                  )}
                  <Box className='row-span-1'>Amount: <span className='font-semibold'>{(data?.amount).toString()}</span></Box>
                  <Box className='row-span-1'>Date: {formatDate(data?.date)}</Box>
                  { openDeleteItemE !== index && (
                    <Box className='row-span-1 flex justify-end'>
                      <Button onClick={() => { handleDataBills({ amount: data?.amount, date: data?.date }, 'electric', index) }} size='small' startIcon={<PaidIcon />} sx={{ textTransform: 'none' }}>paid</Button>
                    </Box>
                  )}
                  </Box>
                ))}
              </IonList>
            </IonAccordion>
          </IonAccordionGroup>
        </Box>
      </IonItem>
      {isHidden && (
        <IonList lines='none' className='m-4 flex flex-col' >
          <Box className='font-bold text-2xl my-2' style={{ color: '#131c2b' }}>History List</Box>
          {history?.bills && history.bills.map((bill, index) => bill.amount !== 0 && bill.start_date !== '' ? (
            <Box key={index} className='flex flex-col border rounded-md p-2 m-2' style={{ backgroundColor: '#131c2b' }}>
              <Box className='font-bold uppercase '>{bill.label}</Box>
              <Box className='flex flex-col mx-2'>
                <Box>{formatDate(bill.start_date)}</Box>
                <Box>Amount: <span className='font-semibold'>{bill.amount}</span></Box>
              </Box>
              <Box>
                Paid on:  <span className='font-semibold'>{formatDate(bill.end_date)}</span>
              </Box>
            </Box>
          ) : (<Box></Box>))}
        </IonList>
      )}
      <EditTenant open={open} onClose={handleOpen} id={id}/>
    </IonContent>
  );
}

export default Profile;