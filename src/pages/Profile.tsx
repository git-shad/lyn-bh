import React, {useEffect, useState, useCallback} from 'react';
import { Link } from 'react-router-dom';
import { 
  IonContent,IonItem,IonGrid,IonRow,IonCol,IonIcon,
  IonAccordionGroup,IonAccordion,IonLabel,IonList,useIonRouter
} from '@ionic/react';
import { Button, IconButton, Box, Switch, FormControlLabel} from '@mui/material'
import { useLocation } from 'react-router-dom'
import { db, Tenant, RentBill, ElectricBill, WaterBill,rentCost } from '../backend/db';

//icon
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { flash,home,water } from 'ionicons/icons'
import PaidIcon from '@mui/icons-material/Paid';

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

  useEffect(() => {
    if (id) {
      (async () => {
        const result = await db.tenants.get(id);
        if(result){
          setTenant(result);
          setRent(result?.rent_bills)
          setElectric(result?.electric_bills)
          setWater(result?.water_bills)
        }else{
          GoTo('/tenants')
        }
      })();
    }else{
      GoTo('/tenants')
    }
  }, [id,tenant]);

  //every click the paid it auto allocate where deduction is 
  const handleDataBills = useCallback(async (data: {amount: number, date: string},bill: string)=>{
    if(bill === 'rent' && tenant?.balance && tenant?.coin){
      if(data.amount >= tenant?.coin) return;//block if amount are graterthan or equal to coin balance
      await db.tenants.update(id,{
        rent_bills: dRent?.filter((d)=> d.date !== data.date),
        balance: tenant?.balance >= tenant?.coin ? tenant?.balance - tenant?.coin : tenant?.balance,
        coin: tenant?.balance >= tenant?.coin ? (tenant?.balance - tenant?.coin) - tenant?.coin : tenant?.balance
      })
    }else if(bill === 'electric' && tenant?.balance && tenant?.coin){
      if(data.amount >= tenant?.coin) return;
      await db.tenants.update(id,{
        electric_bills: dElectric?.filter((d)=> d.date !== data.date),
        balance: tenant?.balance >= tenant?.coin ? tenant?.balance - tenant?.coin : tenant?.balance,
        coin: tenant?.balance >= tenant?.coin ? (tenant?.balance - tenant?.coin) - tenant?.coin : tenant?.balance
      })
    }else if(bill === 'water' && tenant?.balance && tenant?.coin){
      if(data.amount >= tenant?.coin) return;
      await db.tenants.update(id,{
        water_bills: dWater?.filter((d)=> d.date !== data.date),
        balance: tenant?.balance >= tenant?.coin ? tenant?.balance - tenant?.coin : tenant?.balance,
        coin: tenant?.balance >= tenant?.coin ? (tenant?.balance - tenant?.coin) - tenant?.coin : tenant?.balance 
      })
    }
  },[id,tenant])
  
  return (
    <IonContent>
      <IonItem lines='none'>
        <Link to='/tenants'>
          <IconButton slot='start'><KeyboardArrowLeftIcon/></IconButton>
        </Link>
        <Button sx={{textTransform: 'none'}} slot='end' variant='contained' size='small'>History</Button>
      </IonItem>
      <IonItem lines='none' className='mt-2'>
        <IonGrid className='border rounded-xl bg-gray-100'>
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
      </IonItem>
      <Box className='flex justify-end m-4'>
        <Box>
          <FormControlLabel control={<Switch />} label='Auto Deduction' labelPlacement='bottom'></FormControlLabel>
        </Box>
      </Box>
      <IonItem lines='none' className='mt-4'>
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
                        <Button onClick={()=>{handleDataBills({amount: data?.amount, date: data?.date},'rent')}} size='small' startIcon={<PaidIcon/>} sx={{textTransform: 'none'}}>paid</Button>
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
                        <Button onClick={()=>{handleDataBills({amount: data?.amount, date: data?.date},'electric')}} size='small' startIcon={<PaidIcon/>} sx={{textTransform: 'none'}}>paid</Button>
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
                        <Button onClick={()=>{handleDataBills({amount: data?.amount, date: data?.date},'water')}} size='small' startIcon={<PaidIcon/>} sx={{textTransform: 'none'}}>paid</Button>
                      </Box>
                    </Box>
                  ))}
              </IonList>
            </IonAccordion>
          </IonAccordionGroup>
        </Box>
      </IonItem>
    </IonContent>
  )
        
}

export default Profile;