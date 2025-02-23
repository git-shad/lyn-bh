import { useState,useEffect,useCallback } from 'react'
import { Paper, Box, SvgIcon, Button } from '@mui/material'
import { IonInput } from '@ionic/react'
import db, { useLiveQuery, Tenant } from '../backend/db'

//icons
import { IoHome } from "react-icons/io5";
import { IoWater } from "react-icons/io5";
import { IoFlash } from "react-icons/io5";
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';


const BillingAndPayments: React.FC = () => {
  const tenants = useLiveQuery(() => db.tenants.toArray(),[])
  const [rentAmount,setRentAmount] = useState<number>(0)

  useEffect(()=>{
    db.open()
  },[])
  
  useEffect(()=>{
    db.setting.get('rent').then(result => setRentAmount(result?.value))
  },[])

  //for rent 
  const [isRentMSGShow,setIsRentMSGShow] = useState<boolean>(false)
  const handleRentInput = useCallback((e: any)=>{
    setRentAmount(e?.detail.value)
  },[])

  const handleRentAmount = useCallback(()=>{
    db.setting.update('rent',{value: rentAmount}).then(()=>{
      setIsRentMSGShow(true)
      setTimeout(()=>{
        setIsRentMSGShow(false) 
      },10000)
    })
  },[rentAmount])
  //end

  const [waterAmount,setWaterAmount] = useState<number>(0)
  const [isWaterBillApprove,setISWaterBillApprove] = useState<boolean>(false)
  const [isWaterMSGShow,setIsWaterMSGShow] = useState<boolean>(false)
  const handleWaterInput = useCallback((e: any)=>{
    setWaterAmount(e?.detail.value)
  },[])

  const handleWaterAmount = useCallback(()=>{
    setISWaterBillApprove(true)
    setIsWaterMSGShow(true)
    if(isWaterBillApprove === false) return;

    const divide: number = tenants ? (waterAmount / tenants.length) : 0
    const roundOf: number = Math.round(divide)
    const dateNow: string = new Date().toLocaleDateString()
    
    tenants?.map(async (tenant)=>{
      const water = tenant.water_bills ? [...tenant.water_bills, {amount: roundOf, date: dateNow}] : [{amount: roundOf, date: dateNow}]
      await db.tenants.update(tenant.id,{water_bills: water, balance: (Number(tenant.balance) + Number(roundOf))})
    })
    setISWaterBillApprove(false)
    setIsWaterMSGShow(false)
  },[isWaterBillApprove,waterAmount,tenants])

  return (
    <Box className='flex flex-col gap-2 m-2'>
      <Paper elevation={5} className='flex flex-col gap-2 p-4'>
        <Box className='flex flex-row gap-2'>
          <Box className='text-red-400'><SvgIcon><IoHome/></SvgIcon></Box>
          <Box className='font-bold text-2xl '>Rent</Box>
        </Box>
        <Box className='flex flex-col gap-2'>
          { isRentMSGShow && (
            <Box className='text-center font-semibold'>This change has not affected the past amount of rent. Change approve!</Box>
          )}
          <IonInput value={rentAmount} onIonInput={handleRentInput} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Amount" />
          <Button onClick={handleRentAmount} startIcon={<DoneAllRoundedIcon/>} variant='contained' fullWidth>confirm</Button>
        </Box>
      </Paper>

      <Paper elevation={5} className='flex flex-col gap-2 p-4'>
        <Box className='flex flex-row gap-2'>
          <Box className='text-blue-400'><SvgIcon><IoWater/></SvgIcon></Box>
          <Box className='font-bold text-2xl '>Water</Box>
        </Box>
        <Box className='flex flex-col gap-2'>
          { isWaterMSGShow && (
            <Box className='text-center font-semibold'>The second click divides the amount of the water bill for all tenants.</Box>
          )}
          <IonInput value={waterAmount} onIonInput={handleWaterInput} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Amount" disabled={isWaterMSGShow}/>
          <Box className='flex flex-row gap-2 justify-end'>
            { isWaterMSGShow && (
              <Button onClick={() => {setIsWaterMSGShow(false); setISWaterBillApprove(false)}} variant='contained' >cancel</Button>
            )}
            <Button onClick={handleWaterAmount} startIcon={isWaterBillApprove ? <DoneAllRoundedIcon/> : <CheckRoundedIcon/>} variant='contained' fullWidth={!isWaterMSGShow}>confirm</Button>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={5} className='flex flex-col gap-2 p-4'>
        <Box className='flex flex-row gap-2'>
          <Box className='text-yellow-400'><SvgIcon><IoFlash/></SvgIcon></Box>
          <Box className='font-bold text-2xl '>Electric</Box>
        </Box>
        <Box>
          
        </Box>
      </Paper>
    </Box>
  );
};

export default BillingAndPayments;
  