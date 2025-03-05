import { FC, useEffect, useState } from 'react'
import { 
    Table ,TableBody, TableCell, TableHead, TableRow,
    Dialog, DialogTitle,DialogContent, DialogActions,
    Button, Box
 } from '@mui/material'
//  import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
//  import html2canvas from 'html2canvas'

interface TableData{
    room: string
    past: number
    present: number
    usage: number
    rate: number
    tax: number
    total: number
    roundOff: number
    ofHead: number
    individual: number
    roundOffFinal: number
}

interface TableDataRow{
    row: TableData[]
    open: boolean;
    onClose: () => void;
}

const ETable: FC<TableDataRow> = ({ row, open, onClose }) => {
    // const saveAsPng = async () => {
    //     const element = document.getElementById('ElectricBillsTable');
    //     if (element) {
    //         const canvas = await html2canvas(element);
    //         const dataUrl = canvas.toDataURL('image/png');
    //         const base64Data = dataUrl.split(',')[1];
            
    //         await Filesystem.writeFile({
    //           path: 'ElectricBillsTable.png',
    //           data: base64Data,
    //           directory: Directory.Documents,
    //           encoding: Encoding.UTF8,
    //         });
    //         alert('File saved successfully!');
    //     } else {
    //         alert('Element not found!');
    //     }
    // };
    
    const [total, setTotal] = useState<number>(0)
    useEffect(()=>{
        let total: number = 0
        row.map(row => {
            total += row.roundOffFinal
        })
        setTotal(total)
    },[row])

    return (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Electric Bill Distribute</DialogTitle>
        <DialogContent>
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
            </Table>
            <Box className='flex justify-end'>
                <Box className='flex flex-row gap-4 fixed'>
                    <Box className='font-bold'>Total: </Box>
                    <Box>{total}</Box>
                </Box>
            </Box>
        </DialogContent>
        <DialogActions className='flex flex-row gap-2'>
            <Button onClick={onClose}>Close</Button>
            {/* <Button onClick={saveAsPng}>Download</Button> */}
        </DialogActions>
    </Dialog>
    );

}

export type { TableData }
export default ETable