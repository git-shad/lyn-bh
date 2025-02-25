import { useEffect, useState } from 'react'
import { Box, Button, SvgIcon } from '@mui/material'
import { PieChart } from '@mui/x-charts'
import db, { useLiveQuery } from '../backend/db'

import logo from '../assets/logo.png'

//icon
import { FaHouseChimneyUser } from "react-icons/fa6";
import { MdBedroomParent } from "react-icons/md";

const Dashboard: React.FC = () => {
  const tenants = useLiveQuery(()=> db.tenants.toArray())
  const [roomCount,setRoomCount] = useState<number>(0)
  useEffect(()=>{
    (async ()=>{
      setRoomCount((await db.storage.get('rooms'))?.value.length)
    })()
  },[])
  return (
    <Box>
      <Box className='border border-blue-500 rounded-xl m-4 p-2'>
        <PieChart
          series={[
            {
              data: [{value: tenants?.length ?? 0},{value: roomCount}, {value: (roomCount * 4)}],
              innerRadius: 30,
              outerRadius: 100,
              paddingAngle: 5,
              cornerRadius: 5,
              startAngle: -45,
              endAngle: 225,
              cx: 170,
              cy: 170,
            }
          ]}
        />
        
      </Box>
      <Box className='flex flex-row gap-4 m-4 text-black'>
        <Box className='w-full p-2 bg-white rounded-xl grid grid-cols-3 gap-2'>
          <Box className='col-span-1 flex items-center justify-center'>
            <FaHouseChimneyUser className='size-10'/>
          </Box>
          <Box className='col-span-2'>
            <Box className='font-bold text-xl'>Tenants</Box>
            <Box>Head Count: {tenants?.length}</Box>
          </Box>
        </Box>
        <Box className='w-full p-2 bg-white rounded-xl grid grid-cols-3 gap-2'>
          <Box className='col-span-1 flex items-center justify-center'>
            <MdBedroomParent className='size-10'/>
          </Box>
          <Box className='col-span-2'>
            <Box className='font-bold text-xl'>Bed Rooms</Box>
            <Box>Total: {(roomCount * 4)}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}; 

export default Dashboard;
