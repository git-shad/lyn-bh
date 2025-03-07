import {useEffect,useState,useCallback} from 'react'
import { 
   Dialog, DialogTitle, DialogActions, DialogContent, 
   Table, TableHead, TableRow, TableCell, TableBody, 
   Box, Button, Paper 
} from '@mui/material'
import db, { TableElectricBillHistory as TableData, useLiveQuery} from '../backend/db'
import MDate from '../components/MDate'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import html2canvas from 'html2canvas';

//icon
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface Props{
   open: boolean
   onClose: () => void
}

const EHistory:React.FC<Props> = ({open,onClose})=>{
   const [row,setRow] = useState<TableData[]>([])
   const [changeDate, setChangeDate] = useState<string>('')
   
   const [total, setTotal] = useState<number>(0)
   useEffect(()=>{
      let total: number = 0
      row.map(row => {
         total += row.roundOffFinal
      })
      setTotal(total)
   },[row])

   const dataEHistory = useLiveQuery(()=> db.hebills.toArray(),[]) 
   useEffect(()=>{
      (async ()=>{
         if(!dataEHistory) return;
         const date = new Date(changeDate)
         
         const only = dataEHistory.filter(item => {
            const [month, ,year] = item.date.split('/')
            return month === (date.getMonth() + 1).toString() && year === (date.getFullYear()).toString()
         })
         setRow(only)
      })()
   },[changeDate,dataEHistory])

   useEffect(()=>{
      const dateNow = new Date().toLocaleDateString()
      setChangeDate(dateNow)
   },[])

   const handleResult = useCallback((result: string)=> setChangeDate(result), [])

   function formatDate(date: string) {
      const dateParts = date.split('/');
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const month = monthNames[parseInt(dateParts[0], 10) - 1];
      const day = parseInt(dateParts[1], 10);
      const year = parseInt(dateParts[2], 10);
      return `${month} ${day}, ${year}`;
   }

   const [openDate, setOpenDate] = useState<boolean>(false)

   const saveAsPng = useCallback(async () => {
      const element = document.getElementById('screenshot');
      if (element) {
         try {
            const canvas = await html2canvas(element);
            const dataUrl = canvas.toDataURL('image/png');
            const base64Data = dataUrl.split(',')[1];
            // const link = document.createElement("a");
            // link.href = dataUrl;
            // link.download = "screenshot.png";
            // link.click();

            await Filesystem.writeFile({
               path: 'ElectricBillsTable.png',
               data: base64Data,
               directory: Directory.Documents
            });

            alert('File saved successfully!');
         } catch (error) {
            console.error('Error saving file:', error);
            alert('Failed to save file.');
         }
      } else {
         alert('Element not found!');
      }
   }, []);

   return (
      <Dialog open={open} onClose={onClose}>
         <DialogTitle>History</DialogTitle>
         <DialogContent>
         <Paper className='p-2 flex justify-center'>
            <Button onClick={() => setOpenDate(!openDate)} startIcon={<CalendarMonthIcon />} color='inherit' fullWidth>
               <Box className='text-xl font-semibold'>{formatDate(changeDate)}</Box>
            </Button>
         </Paper>
         <Box className='overflow-auto'>
            <Table id='screenshot' >
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
                  <TableRow>
                  <TableCell>
                     <Box className='flex flex-row gap-4'>
                     <Box className='font-bold'>Total: </Box>
                     <Box>{total}</Box>
                     </Box>
                  </TableCell>
                  </TableRow>
               </TableBody>
            </Table>
         </Box>
         <MDate open={openDate} onClose={() => setOpenDate(!openDate)} result={handleResult} presentation='month-year'/>
         </DialogContent>
         <DialogActions>
         <Button onClick={onClose}>Close</Button>
         <Button onClick={saveAsPng}>Download</Button>
         </DialogActions>
      </Dialog>
   )
}

export default EHistory