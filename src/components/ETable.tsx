import { FC, useEffect, useState, useRef, useCallback } from 'react'
import { 
    Table ,TableBody, TableCell, TableHead, TableRow,
    Dialog, DialogTitle,DialogContent, DialogActions,
    Button, Box
 } from '@mui/material'
import type { TableElectricBillHistory as TableData} from '../backend/db'

interface TableDataRow{
    row: TableData[]
    open: boolean;
    onClose: () => void;
}

const ETable: FC<TableDataRow> = ({ row, open, onClose }) => {

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
        <DialogTitle>Electric Bills Distributed</DialogTitle>
        <DialogContent>
            <Box className='overflow-auto'>
                <Table>            
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
            
        </DialogContent>
        <DialogActions className='flex flex-row gap-2'>
            <Button onClick={onClose}>Close</Button>
        </DialogActions>
    </Dialog>
    );

}

export type { TableData }
export default ETable