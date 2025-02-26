import { useEffect, useState, useCallback } from 'react'
import { Box, Button, SvgIcon} from '@mui/material'
import db, { useLiveQuery } from '../backend/db'
import { useIonRouter } from '@ionic/react'

import logo from '../assets/logo.png'
import { FaHouseChimneyUser } from "react-icons/fa6";
import { MdPayments } from "react-icons/md";

const Dashboard: React.FC = () => {
  const tenants = useLiveQuery(()=> db.tenants.toArray())

  const router = useIonRouter()
  const GoTo = useCallback((address:string)=>{
      router.push(address)
  },[router])

  const [roomCount,setRoomCount] = useState<number>(0)
  const [roomAvailable,setRoomAvailable] = useState<number>(0)
  useEffect(()=>{
    (async ()=>{
      const count = await db.storage.get('rooms')
      setRoomCount(count?.value.length)
    })()
  },[])

  return (
    <Box className='overflow-auto p-4'>
      <Box className='rounded-2xl p-4 flex flex-col gap-2 mb-10'>
        <Box className='flex justify-center m-4'> 
          <img src={logo} className='' width={200} height={200}/>
        </Box>
        <Box className='flex flex-row gap-2'>
          <Box className='flex justify-center w-full'>
            <Box className='flex flex-col gap-2'>
              <Box className='flex justify-center font-bold'>{tenants?.length}</Box>
              <Box className='flex justify-center'>Tenants</Box>
            </Box>
          </Box>
          <Box className='flex justify-center w-full'>
            <Box className='flex flex-col gap-2'>
              <Box className='flex justify-center font-bold'>{roomCount}</Box>
              <Box className='flex justify-center'>Rooms</Box>
            </Box>
          </Box>
          
        </Box>
      </Box>
      <Box className='grid grid-cols-3 m-2 mb-5'>
        <Box className='col-span-2 text-3xl font-bold'>LYN BORDING HOUSE</Box>
      </Box>
      <Box className='flex flex-rows gap-4'>
        <Box onClick={()=>{GoTo('/tenants')}} className='grid grid-cols-3 gap-4 w-full bg-slate-300 text-black rounded-2xl p-4 shadow-md'>
          <Box className='col-span-1 flex justify-center items-center'>
            <FaHouseChimneyUser className='size-8'/>
          </Box>
          <Box className='col-span-2 font-semibold'>Tenants</Box>
        </Box>
        <Box onClick={()=>{GoTo('/payments')}} className='grid grid-cols-3 gap-4 w-full bg-slate-300 text-black rounded-2xl p-4 shadow-md'>
          <Box className='col-span-1 flex justify-center items-center'>
            <MdPayments className='size-10'/>
          </Box>
          <Box className='col-span-2 font-semibold'>Billing & Payments</Box>
        </Box>
      </Box>
    </Box>
  );
}; 

export default Dashboard;
