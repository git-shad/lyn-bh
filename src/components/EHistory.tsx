import {useEffect,useState,useCallback} from 'react'
import { 
   Dialog, DialogTitle, DialogActions, DialogContent, 
   Table, TableHead, TableRow, TableCell, TableBody, 
   Box, Button, Paper
} from '@mui/material'
import db, { TableElectricBillHistory as TableData, useLiveQuery} from '../backend/db'
import MDate from '../components/MDate'
import { Filesystem, Directory } from '@capacitor/filesystem';
import html2canvas from 'html2canvas';

//icon
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';

interface Props{
   open: boolean
   onClose: () => void
}

const EHistory:React.FC<Props> = ({open,onClose})=>{
   const [row,setRow] = useState<TableData[]>([])
   const [changeDate, setChangeDate] = useState<string>('')
   const [isTax, setIsTax] = useState<boolean>(false)
   
   const [total, setTotal] = useState<number>(0)
   useEffect(()=>{
      let total: number = 0
      row.map(row => {
         total += Number(row.total)
      })
      setTotal(total)
   },[row])

   useEffect(()=>{
      const checkTax = async () => {
         const tax = await db.settings.get('tax')
         if (tax) {
            setIsTax(tax.value)
         }
      }
      checkTax()
   },[])

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
      const year = parseInt(dateParts[2], 10);
      return `${month}, ${year}`;
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
            // link.download = `Electric Bills (${formatDate(changeDate)}).png`;
            // link.click();

            await Filesystem.writeFile({
               path: `Electric Bills (${formatDate(changeDate)}).png`,
               data: base64Data,
               directory: Directory.Documents
            });

            alert('File saved successfully! Check your device\'s Documents folder.');
         } catch (error) {
            console.error('Error saving file:', error);
            alert('Failed to save file. Please try again.');
         }
      } else {
         alert('Element not found! Please check the ID.');
      }
   }, []);

   const [deleteState,setDeleteState] = useState(0)
   const handleDelete = useCallback(async () => {
      if (!dataEHistory) return;

      const date = new Date(changeDate);
      const filteredRecords = dataEHistory.filter(item => {
         const [month, , year] = item.date.split('/');
         return month === (date.getMonth() + 1).toString() && year === (date.getFullYear()).toString();
      });

      console.log('Filtered Records:', filteredRecords);

      try {
         await Promise.all(filteredRecords.map(async record => {
            await db.hebills.delete(record.id);
            const tenant = await db.tenants.where('room').equals(record.room).first();
            if (tenant) {
               const [month, , year] = record.date.split('/');
               const tenantElectricBillDates = tenant.electric_bills || [];
               const updatedElectricBillDates = tenantElectricBillDates.filter(date => {
                  const [tMonth, , tYear] = date.date.split('/');
                  return tMonth !== month || tYear !== year;
               });

               await db.tenants.update(tenant.id, { electric_bills: updatedElectricBillDates });
            }
            console.log(`Deleted record with id ${record.id}`);
         }));
         setRow([]);
         setTotal(0);
      } catch (error) {
         alert('Failed to delete records or update tenants.');
      }
   }, [changeDate, dataEHistory]);

   return (
      <Dialog open={open} onClose={onClose}>
            <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <Box fontSize="1.5rem" fontWeight="bold">History</Box>
              <Button 
               onClick={() => {
                if (deleteState === 1) {
                  handleDelete();
                  setDeleteState(0);
                } else {
                  setDeleteState(prev => prev + 1);
                }
               }} 
               color="error" 
               variant="outlined" 
               startIcon={<DeleteIcon/>} 
               sx={{ 
               borderRadius: '8px', 
               mt: { xs: 2, sm: 0 }, // Adds margin-top for smaller screens
               }}
              >
               {deleteState === 1 ? "Delete This Month's Records" : "Delete"}
              </Button>
            </Box>
            </DialogTitle>
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
                  { isTax ? (
                     <TableCell style={{ minWidth: 100 }} align="center">Tax</TableCell>
                  ) : null }
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
                        <TableCell align="right">{data.past % 1 !== 0 ? Number(data.past).toFixed(4) : data.past}</TableCell>
                        <TableCell align="right">{data.present % 1 !== 0 ? Number(data.present).toFixed(4) : data.present}</TableCell>
                        <TableCell align="right">{data.usage % 1 !== 0 ? Number(data.usage).toFixed(4) : data.usage}</TableCell>
                        <TableCell align="right">{data.rate % 1 !== 0 ? Number(data.rate).toFixed(4) : data.rate}</TableCell>
                        {isTax ? (
                           <TableCell align="right">{data.tax % 1 !== 0 ? Number(data.tax).toFixed(4) : data.tax}</TableCell>
                        ) : null}
                        <TableCell align="right">{data.total % 1 !== 0 ? Number(data.total).toFixed(4) : data.total}</TableCell>
                        <TableCell align="right">{data.roundOff % 1 !== 0 ? data.roundOff : data.roundOff}</TableCell>
                        <TableCell align="right">{data.ofHead % 1 !== 0 ? Number(data.ofHead).toFixed(4) : data.ofHead}</TableCell>
                        <TableCell align="right">{data.individual % 1 !== 0 ? Number(data.individual).toFixed(4) : data.individual}</TableCell>
                        <TableCell align="right">{data.roundOffFinal % 1 !== 0 ? data.roundOffFinal : data.roundOffFinal}</TableCell>
                     </TableRow>
                  ))}
                  <TableRow>
                  <TableCell colSpan={11} align="right">
                    <Box display="flex" flexDirection="column" gap={1}>
                     <Box display="flex" justifyContent="space-between" fontWeight="bold">
                        <span>Date: {formatDate(changeDate)}</span>
                     </Box>
                     <Box display="flex" justifyContent="space-between" fontWeight="bold">
                       <span>Total: {total % 1 !== 0 ? total.toFixed(4) : total}</span>
                     </Box>
                     <Box display="flex" justifyContent="space-between" fontWeight="bold">
                       <span>Rounded Total: {Math.round(total)}</span>
                     </Box>
                    </Box>
                  </TableCell>
                  </TableRow>
               </TableBody>
            </Table>
         </Box>
         <MDate open={openDate} onClose={() => setOpenDate(!openDate)} result={handleResult} presentation='month-year' setDate={changeDate}/>
         </DialogContent>
         <DialogActions>
         <Button onClick={onClose}>Close</Button>
         <Button onClick={saveAsPng} >Download</Button>
         </DialogActions>
      </Dialog>
   )
}

export default EHistory