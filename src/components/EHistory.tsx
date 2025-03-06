import {useEffect,useState,useCallback} from 'react'
import { 
   Dialog, DialogTitle, DialogActions, DialogContent, 
   Table, TableHead, TableRow, TableCell, TableBody, 
   Box, Button, Paper 
} from '@mui/material'
import db, { TableElectricBillHistory as TableData} from '../backend/db'
import MDate from '../components/MDate'

//icon
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface Props{
   open: boolean
   onClose: () => void
}

const EHistory:React.FC<Props> = ({open,onClose})=>{
   const [row,setRow] = useState<TableData[]>([])
   const [change, setChange] = useState<string>('')
   
   const [total, setTotal] = useState<number>(0)
   useEffect(()=>{
      let total: number = 0
      row.map(row => {
         total += row.roundOffFinal
      })
      setTotal(total)
   },[row])

   useEffect(()=>{
      (async ()=>{
         
      })()
   },[])

   function formatDate(date: string) {
      const dateParts = date.split('/');
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const month = monthNames[parseInt(dateParts[0], 10) - 1];
      const day = parseInt(dateParts[1], 10);
      const year = parseInt(dateParts[2], 10);
      return `${month} ${day}, ${year}`;
   }

   const [openDate, setOpenDate] = useState<boolean>(false)
   return (
      <Dialog open={open} onClose={onClose}>
         <DialogTitle>History</DialogTitle>
         <DialogContent>
         <Paper className='p-2 flex justify-center'>
            <Button onClick={()=> setOpenDate(!openDate)} startIcon={<CalendarMonthIcon />} color='inherit' fullWidth><Box className='text-xl font-semibold'>{formatDate(change)}</Box></Button>
         </Paper>
         <Table id='ElectricBillsTable'>
            <TableHead>
            <TableRow>
               <TableCell style={{ minWidth: 100 }}>Room</TableCell>
               <TableCell style={{ minWidth: 100 }} align="center">Past</TableCell>
               <TableCell style={{ minWidth: 100 }} align="center">Present</TableCell>
               <TableCell style={{ minWidth: 100 }} align="center">Usage</TableCell>
               <TableCell style={{ minWidth: 100 }} align="center">Rate</TableCell>
               <TableCell style={{ minWidth: 100 }} align="center">Tax</TableCell>
               <TableCell style={{ minWidth: 100 }} align="center">Total</TableCell>
               <TableCell style={{ minWidth: 100 }} align="center">Round Off</TableCell>
               <TableCell style={{ minWidth: 100 }} align="center">Of Head</TableCell>
               <TableCell style={{ minWidth: 100 }} align="center">Individual</TableCell>
               <TableCell style={{ minWidth: 100 }} align="center">Round Off Final</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {row.map((data, index) => (
               <TableRow key={index}>
               <TableCell>{data.room}</TableCell>
               <TableCell align="right">{data.past}</TableCell>
               <TableCell align="right">{data.present}</TableCell>
               <TableCell align="right">{data.usage}</TableCell>
               <TableCell align="right">{data.rate}</TableCell>
               <TableCell align="right">{data.tax}</TableCell>
               <TableCell align="right">{data.total}</TableCell>
               <TableCell align="right">{data.roundOff}</TableCell>
               <TableCell align="right">{data.ofHead}</TableCell>
               <TableCell align="right">{data.individual}</TableCell>
               <TableCell align="right">{data.roundOffFinal}</TableCell>
               </TableRow>
            ))}
            </TableBody>
            <MDate open={openDate} onClose={()=> setOpenDate(!openDate)}/>
         </Table>
         <Box className='flex justify-end'>
            <Box className='flex flex-row gap-4 fixed'>
            <Box className='font-bold'>Total: </Box>
            <Box>{total}</Box>
            </Box>
         </Box>
         </DialogContent>
         <DialogActions>
            <Button onClick={onClose}>close</Button>
         </DialogActions>
      </Dialog>
   )
}

export default EHistory