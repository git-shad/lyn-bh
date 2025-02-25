import React, {useEffect, useState, useCallback} from 'react';
import { Link } from 'react-router-dom';
import { 
  IonContent,IonItem,IonGrid,IonRow,IonCol,IonIcon,
  IonAccordionGroup,IonAccordion,IonLabel,IonList,useIonRouter,IonInput,IonDatetime
} from '@ionic/react';
import { Button, IconButton,SvgIcon, Box, Switch, FormControlLabel,Paper} from '@mui/material'
import { useLocation } from 'react-router-dom'
import { db, Tenant, RentBill, ElectricBill, WaterBill, TenantHistory, useLiveQuery } from '../backend/db';

//icon
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { flash,home,water } from 'ionicons/icons'
import PaidIcon from '@mui/icons-material/Paid';
import { PiHandCoinsFill } from "react-icons/pi";
import { IoCalendarOutline } from "react-icons/io5";
import DoneIcon from '@mui/icons-material/Done';

const Profile: React.FC = () => {
  const router = useIonRouter()
  const GoTo = useCallback((address:string)=>{
    router.push(address)
  },[router])

  const location = useLocation();
  const searchParam = new URLSearchParams(location.search)
  const id:number = Number(searchParam.get('id'))

  //dataset
  const [tenant, setTenant] = useState<Tenant>();
  const [dRent,setRent] = useState<RentBill[]>()
  const [dElectric,setElectric] = useState<ElectricBill[]>()
  const [dWater,setWater] = useState<WaterBill[]>()
  const [history,setHistory] = useState<TenantHistory>()

  useEffect(() => {
    if (id) {
      (async () => {
        const result = await db.tenants.get(id);
        
        if(result){
          setTenant(result);
          setRent(result?.rent_bills)
          setElectric(result?.electric_bills)
          setWater(result?.water_bills)
          const historys = await db.history.get(id)
          if(historys){
            setHistory(historys)
          }
        }else{
          GoTo('/tenants')
        }
      })();
    }else{
      GoTo('/tenants')
    }
  }, [id,tenant]);

  //every click the paid it auto allocate where deduction is 
  const handleDataBills = useCallback(async (data: {amount: number, date: string},bill: string, index: number)=>{
    const currentDate = new Date().toLocaleDateString()
    if(bill === 'rent' && tenant?.balance && tenant?.coin && history?.bills){
      if(data.amount > tenant?.coin) return;//block if amount are graterthan or equal to coin balance
      await db.tenants.update(id,{
        rent_bills: dRent?.filter((d,i)=> i !== index),
        balance: tenant.balance - data.amount,
        coin: tenant.coin - data.amount
      })

      // history.bills.push({amount: data.amount, start_date: data.date, label: bill, end_date: ''})
      const updatedBills = history.bills.map(where => {
        if(where.label === bill && where.start_date === data.date){
          where.amount = data.amount;
          where.end_date = currentDate
          return where
        }
        return where;
      });
      
      await db.history.update(id, { bills: updatedBills });
    }else if(bill === 'water' && tenant?.balance && tenant?.coin && history?.bills ){
      if(data.amount > tenant?.coin) return;
      await db.tenants.update(id,{
        water_bills: dWater?.filter((d,i)=> i !== index),
        balance: tenant.balance - data.amount,
        coin: tenant.coin - data.amount
      })
      
      history.bills.push({amount: data.amount, start_date: data.date, label: bill, end_date: ''})
      const updatedBills = history.bills.map(where => {
        if(where.label === bill && where.start_date === data.date){
          where.amount = data.amount;
          where.end_date = currentDate
          return where
        }
        return where;
      });
      
      await db.history.update(id, { bills: updatedBills });
    }else if(bill === 'electric' && tenant?.balance && tenant?.coin && history?.bills){
      if(data.amount > tenant?.coin) return;
      await db.tenants.update(id,{
        electric_bills: dElectric?.filter((d,i)=> i !== index),
        balance: tenant.balance - data.amount,
        coin: tenant.coin - data.amount
      })

      history.bills.push({amount: data.amount, start_date: data.date, label: bill, end_date: ''})
      const updatedBills = history.bills.map(where => {
        if(where.label === bill && where.start_date === data.date){
          where.amount = data.amount;
          where.end_date = currentDate
          return where
        }
        return where;
      });
      
      await db.history.update(id, { bills: updatedBills });
    } 
  },[id, tenant, history, dRent, dWater, dElectric])
  
  const [isAddCoin,setIsAddCoin] = useState<boolean>(false)
  const [isCalendar,setIsCalendar] = useState<boolean>(false)
  const [inputCoin,setInputCoin] = useState<number>()
  const handleAddCoin = useCallback(async ()=>{
    if(!tenant?.coin === undefined) return;
    const sum = (Number(tenant?.coin) + Number(inputCoin))
    await db.tenants.update(id,{coin: sum})
    setIsAddCoin(false)  
    setInputCoin(undefined)
  },[inputCoin,id,tenant])

  const handleInputAddCoin = useCallback((e: any)=>{
    setInputCoin(e.detail.value)
  },[])

  const [isHidden,setIsHidden] = useState<boolean>(false)

  function formatDate(date: string) {
    const dateParts = date.split('/');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[parseInt(dateParts[0], 10) - 1];
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);
    return `${month} ${day}, ${year}`;
  }

  return (
    <IonContent>
      <IonItem lines='none'>
        <Link to='/tenants'>
          <IconButton slot='start'><KeyboardArrowLeftIcon className='text-blue-500'/></IconButton>
        </Link>
        <Button onClick={()=>setIsHidden(!isHidden)} slot='end' variant='contained' size='small'>History</Button>
      </IonItem>
      <Box className='m-4'>
        <Box className='w-full' >
          <IonGrid className='border border-blue-500 rounded-xl'>
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
            { isAddCoin && (
              <Box className='w-full mt-4 mx-4'>
                <IonInput value={inputCoin} onIonInput={handleInputAddCoin} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Add Coin's" />
              </Box>
            )}
            { isCalendar && (
              <IonDatetime presentation='date' preferWheel={true}></IonDatetime>
            )}
          </IonRow>
          <IonRow>
            <IonCol size='auto'>
              { !isAddCoin && (
                <FormControlLabel control={<Switch />} label='Auto Deduction' labelPlacement='bottom'></FormControlLabel>
              )}
            </IonCol>
            <IonCol className='flex justify-end'>
              <Box>
                { !isAddCoin && (
                  <IconButton onClick={()=> setIsCalendar(!isCalendar)} color='primary' sx={{border: '1px solid', borderRadius: '8px',m: 1}}><SvgIcon><IoCalendarOutline/></SvgIcon></IconButton>
                )}
                <IconButton onClick={()=> setIsAddCoin(!isAddCoin)} color='primary' sx={{border: '1px solid', borderRadius: '8px',m: 1}}><SvgIcon><PiHandCoinsFill/></SvgIcon></IconButton>
                { isAddCoin && (
                  <IconButton onClick={handleAddCoin} color='primary' sx={{border: '1px solid', borderRadius: '8px',m: 1}}><DoneIcon/></IconButton>
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
                <IonIcon icon={home} className='mr-4'/>
                <IonLabel>Rent</IonLabel>
              </IonItem>
              <IonList slot='content' lines='none'>
                {dRent?.map((data,index)=>(
                    <Box key={index} className='grid grid-row-3 mx-2 mb-2 p-2 border rounded-md'>
                      <Box className='row-span-1'>Amount: <span className='font-semibold'>{data?.amount}</span></Box>
                      <Box className='row-span-1'>Date: {data?.date}</Box>
                      <Box className='row-span-1 flex justify-end'>
                        <Button onClick={()=>{handleDataBills({amount: data?.amount, date: data?.date},'rent',index)}} size='small' startIcon={<PaidIcon/>} sx={{textTransform: 'none'}}>paid</Button>
                      </Box>
                    </Box>
                  ))}
              </IonList>
            </IonAccordion>
            <IonAccordion value='water' >
              <IonItem slot='header' color='light'>
                <IonIcon icon={water} className='mr-4'/>
                <IonLabel>Water</IonLabel>
              </IonItem>
              <IonList slot='content' lines='none'>
                {dWater?.map((data,index)=>(
                    <Box key={index} className='grid grid-row-3 mx-2 mb-2 p-2 border rounded-md'>
                      <Box className='row-span-1'>Amount: <span className='font-semibold'>{data?.amount}</span></Box>
                      <Box className='row-span-1'>Date: {data?.date}</Box>
                      <Box className='row-span-1 flex justify-end'>
                        <Button onClick={()=>{handleDataBills({amount: data?.amount, date: data?.date},'water',index)}} size='small' startIcon={<PaidIcon/>} sx={{textTransform: 'none'}}>paid</Button>
                      </Box>
                    </Box>
                  ))}
              </IonList>
            </IonAccordion>
            <IonAccordion value='electric'>
               <IonItem slot='header' color='light'>
                <IonIcon icon={flash} className='mr-4'/>
                <IonLabel>Electric</IonLabel>
              </IonItem>
              <IonList slot='content' lines='none'>
                {dElectric?.map((data,index)=>(
                    <Box key={index} className='grid grid-row-3 mx-2 mb-2 p-2 border rounded-md'>
                      <Box className='row-span-1'>Amount: <span className='font-semibold'>{data?.amount}</span></Box>
                      <Box className='row-span-1'>Date: {data?.date}</Box>
                      <Box className='row-span-1 flex justify-end'>
                        <Button onClick={()=>{handleDataBills({amount: data?.amount, date: data?.date},'electric',index)}} size='small' startIcon={<PaidIcon/>} sx={{textTransform: 'none'}}>paid</Button>
                      </Box>
                    </Box>
                  ))}
              </IonList>
            </IonAccordion>
          </IonAccordionGroup>
        </Box>
      </IonItem>
      { isHidden && (
        <IonList lines='none' className='m-4 flex flex-col'>
          <Box className='font-bold text-2xl my-2'>History List</Box>
          { history?.bills && history.bills.map(bill => bill.amount !== 0 && bill.start_date !== '' ? (
            <Box className='flex flex-col border rounded-md p-2'>
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
    </IonContent>
  )
        
}

export default Profile;