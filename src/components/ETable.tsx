import { FC } from 'react'
import { 
    Table ,TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle,DialogContent, DialogActions
 } from '@mui/material'


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
    return (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Electric Bill Distribute</DialogTitle>
        <DialogContent>
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
                </TableBody>
            </Table>
        </DialogContent>
        <DialogActions className='flex flex-row gap-2'>
        </DialogActions>
    </Dialog>
    );

}

export type { TableData }
export default ETable