import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  IonContent, IonItem, IonGrid, IonRow, IonCol, IonIcon,
  IonAccordionGroup, IonAccordion, IonLabel, IonList, useIonRouter, IonInput
} from '@ionic/react';
import { Button, IconButton, SvgIcon, Box } from '@mui/material';
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
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

const Profile: React.FC = () => {
  const location = useLocation();
  const searchParam = new URLSearchParams(location.search);
  const id: number = Number(searchParam.get('id'));

  useEffect(() => {
    //Fill rent dates that have no history but have not been paid
    (async () => {
      const tenant = await db.tenants.get(id);
      const dateNow: string = new Date().toLocaleDateString();
      if (!(tenant?.date && tenant?.balance)) return;

      const rentCost = 1000;
      const start = new Date(tenant.date);
      const end = new Date(dateNow);
      const dateStack: string[] = eachDayOfInterval({ start, end }).map(date => format(date, 'M/d/yyyy'));
      const rentH = (((await db.history.get(id))?.bills?.filter(bill => bill.label === 'rent'))?.filter(date => dateStack.includes(date.start_date)))?.map(date => date.start_date);
      const rentB = ((tenant.rent_bills)?.filter(date => dateStack.includes(date.date)))?.map(date => date.date);
      const rentDateBills = (dateStack.filter(date => !rentB?.includes(date) && !rentH?.includes(date)))?.map(date => ({ amount: rentCost, date: date }));

      if (rentDateBills.length <= 0) return;
      const rent = tenant.rent_bills?.concat(rentDateBills);
      const filter = Array.from(new Set(rent?.map(date => JSON.stringify(date)))).map(date => JSON.parse(date));
      
      //finalize
      await db.tenants.update(id, { rent_bills: filter, balance: tenant.balance + (rentCost * rentDateBills.length) });
    })();
  }, []);

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
    if (id) {
      (async () => {
        const tenant = await db.tenants.get(id);

        if (tenant) {
          setTenant(tenant);
          setRent(tenant?.rent_bills);
          setElectric(tenant?.electric_bills);
          setWater(tenant?.water_bills);
          const historys = await db.history.get(id);
          if (historys) {
            setHistory(historys);
          }
        } else {
          GoTo('/tenants');
        }
      })();
    } else {
      GoTo('/tenants');
    }
  }, [id, tenant]);

  const handleDataBills = async (data: { amount: number, date: string }, bill: string, index: number) => {
    if (!(tenant?.balance && tenant?.coin)) return;
    if (data.amount > tenant.coin) return; // block if amount is greater than coin balance

    const currentDate = new Date().toLocaleDateString();
    const updatedBalance = Math.max(tenant.balance - data.amount, 0);
    const updatedCoin = Math.max(tenant.coin - data.amount, 0);

    const updateTenantBills = async (billType: string, bills: any[], setBills: React.Dispatch<React.SetStateAction<any[] | undefined>>) => {
      await db.tenants.update(id, {
        [`${billType}_bills`]: bills.filter((_, i) => i !== index)
      });
      setBills(bills.filter((_, i) => i !== index));
    };

    const updateHistory = async () => {
      if (!history?.bills) return;

      const updatedBills = history.bills.map(b => {
        if (b.label === bill && b.start_date === data.date) {
          return { ...b, amount: data.amount, end_date: currentDate };
        }
        return b;
      });

      await db.history.update(id, { bills: Array.from(new Set(updatedBills.map(b => JSON.stringify(b)))).map(b => JSON.parse(b)) });
    };

    switch (bill) {
      case 'rent':
        await updateTenantBills('rent', dRent || [], setRent);
        break;
      case 'water':
        await updateTenantBills('water', dWater || [], setWater);
        break;
      case 'electric':
        await updateTenantBills('electric', dElectric || [], setElectric);
        break;
      default:
        return;
    }

    await updateHistory();
    await db.tenants.update(id, { balance: updatedBalance, coin: updatedCoin });
  }

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

  const handleAutoDeduction = useCallback(async () => {
    const allBills = [
      ...(dElectric?.map((bill, index) => ({ ...bill, billType: 'electric', index })) || []),
      ...(dWater?.map((bill, index) => ({ ...bill, billType: 'water', index })) || []),
      ...(dRent?.map((bill, index) => ({ ...bill, billType: 'rent', index })) || [])
    ];

    for (const bill of allBills) {
      await handleDataBills({ amount: bill.amount, date: bill.date }, bill.billType, bill.index);
    }
  }, [dElectric, dWater, dRent, handleDataBills]);

  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  return (
    <IonContent>
      <IonItem lines='none'>
        <Link to='/tenants'>
          <IconButton slot='start'><KeyboardArrowLeftIcon className='text-blue-500' /></IconButton>
        </Link>
        <Button startIcon={<HistoryIcon />} onClick={() => setIsHidden(!isHidden)} slot='end' variant='contained' size='small'>History</Button>
      </IonItem>
      <Box className='m-4'>
        <Box className='w-full' >
          <IonGrid className='border border-blue-500 rounded-xl p-4'>
            <IonRow className='m-2 mb-10 w-full flex justify-center'>
              <Box className='flex-col text-center'>
                <Box className='font-bold text-3xl'>{tenant?.name}</Box>
                <Box className='font-semibold text-sm itali'>{tenant?.room}</Box>
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
      <IonItem lines='none' className='mt-3' hidden={isHidden}>
        <IonGrid>
          <IonRow>
            {isAddCoin && (
              <Box className='w-full shadow-md shadow-slate-900 rounded-lg p-2 '>
                <IonInput value={inputCoin} onIonInput={handleInputAddCoin} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Add Coin's" />
              </Box>
            )}
          </IonRow>
          <IonRow>
            <IonCol className='flex justify-end mt-2'>
              <Box className='flex flex-row gap-2'>
                <IconButton onClick={handleOpen} color='primary' sx={{ border: '1px solid', borderRadius: '8px', m: 1 }}><ModeEditIcon /></IconButton>
                {!isAddCoin && (
                  <IconButton onClick={handleAutoDeduction} color='primary' sx={{ border: '1px solid', borderRadius: '8px', m: 1 }}><SvgIcon><AutorenewIcon /></SvgIcon></IconButton>
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
          <Box className='font-semibold'>utillity bills</Box>
          <IonAccordionGroup expand='inset'>
            <IonAccordion value='rent'>
              <IonItem slot='header' color='light'>
                <IonIcon icon={home} className='mr-4' />
                <IonLabel>Rent</IonLabel>
              </IonItem>
              <IonList slot='content' lines='none'>
                {dRent?.map((data, index) => (
                  <Box key={index} className='grid grid-row-3 mx-2 mb-2 p-2 border rounded-md'>
                    <Box className='row-span-1'>Amount: <span className='font-semibold'>{data?.amount}</span></Box>
                    <Box className='row-span-1'>Date: {data?.date}</Box>
                    <Box className='row-span-1 flex justify-end'>
                      <Button onClick={() => { handleDataBills({ amount: data?.amount, date: data?.date }, 'rent', index) }} size='small' startIcon={<PaidIcon />} sx={{ textTransform: 'none' }}>paid</Button>
                    </Box>
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
                {dWater?.map((data, index) => (
                  <Box key={index} className='grid grid-row-3 mx-2 mb-2 p-2 border rounded-md'>
                    <Box className='row-span-1'>Amount: <span className='font-semibold'>{data?.amount}</span></Box>
                    <Box className='row-span-1'>Date: {data?.date}</Box>
                    <Box className='row-span-1 flex justify-end'>
                      <Button onClick={() => { handleDataBills({ amount: data?.amount, date: data?.date }, 'water', index) }} size='small' startIcon={<PaidIcon />} sx={{ textTransform: 'none' }}>paid</Button>
                    </Box>
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
                {dElectric?.map((data, index) => (
                  <Box key={index} className='grid grid-row-3 mx-2 mb-2 p-2 border rounded-md'>
                    <Box className='row-span-1'>Amount: <span className='font-semibold'>{data?.amount}</span></Box>
                    <Box className='row-span-1'>Date: {data?.date}</Box>
                    <Box className='row-span-1 flex justify-end'>
                      <Button onClick={() => { handleDataBills({ amount: data?.amount, date: data?.date }, 'electric', index) }} size='small' startIcon={<PaidIcon />} sx={{ textTransform: 'none' }}>paid</Button>
                    </Box>
                  </Box>
                ))}
              </IonList>
            </IonAccordion>
          </IonAccordionGroup>
        </Box>
      </IonItem>
      {isHidden && (
        <IonList lines='none' className='m-4 flex flex-col'>
          <Box className='font-bold text-2xl my-2'>History List</Box>
          {history?.bills && history.bills.map((bill, index) => bill.amount !== 0 && bill.start_date !== '' ? (
            <Box key={index} className='flex flex-col border rounded-md p-2 m-2'>
              <Box className='font-bold uppercase '>{bill.label}</Box>
              <Box className='flex flex-col mx-2'>
                <Box>{formatDate(bill.start_date)}</Box>
                <Box>Amount: <span className='font-semibold'>{bill.amount}</span></Box>
              </Box>
              <Box>
                Paid on:  <span className='font-semibold'>{formatDate(bill.end_date)}</span>
              </Box>
            </Box>
          ) : (<></>))}
        </IonList>
      )}
      <EditTenant open={open} onClose={handleOpen} id={id}/>
    </IonContent>
  );
}

export default Profile;
