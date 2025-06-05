import { useState, useEffect, useCallback } from 'react'
import { IonList } from '@ionic/react'
import { Box, SvgIcon } from '@mui/material'
import { db, TenantHistory } from '../backend/db'
import piso from '../assets/piso.svg'

interface Prop{
    id: number
}

const Historys: React.FC<Prop> = ({id})=>{
    const [history, setHistory] = useState<TenantHistory>()

    useEffect(()=>{
        const fetchFunction = async ()=>{
            const history = await db.history.get(id)
            setHistory(history)
        }
        fetchFunction()
    },[history])
    
    function formatDate(date: string) {
        const dateParts = date.split('/');
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const month = monthNames[parseInt(dateParts[0], 10) - 1];
        const day = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[2], 10);
        return `${month} ${day}, ${year}`;
    }

    return (
      <IonList lines='none' className='mx-2 flex flex-col' >
        <Box className='font-bold text-xl my-2' style={{ color: '#131c2b' }}>History List</Box>
        {history?.bills && history.bills.map((bill, index) => bill.amount !== 0 && bill.end_date !== '' ? (
          <Box key={index} className='flex flex-col border rounded-md p-2' style={{ backgroundColor: '#131c2b' }}>
            <Box><span className='font-bold uppercase'>{bill.label}</span> <span>{bill.start_date !== '' ? formatDate(bill.start_date) : ''}</span></Box>
            <Box className='flex flex-col mx-1'>
              <Box>Paid Amount: <span className='font-semibold'>₱ {bill.amount}</span></Box>
            </Box>
            <Box className="flex justify-end text-gray-500">
              <span className='font-semibold'>{formatDate(bill.end_date)}</span>
            </Box>
          </Box>
        ) : (<Box key={index}></Box>))}
      </IonList>
    )
}

export default Historys