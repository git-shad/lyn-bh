import { FC } from 'react'
import { Table ,TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'


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
}

const ETable: FC<TableDataRow> = ({ row }) => {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableCell>Room</TableCell>
                    <TableCell>Past</TableCell>
                    <TableCell>Present</TableCell>
                    <TableCell>Usage</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Tax</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Round Off</TableCell>
                    <TableCell>Of Head</TableCell>
                    <TableCell>Individual</TableCell>
                    <TableCell>Round Off</TableCell>
                </TableHead>
                <TableBody>
                    { row.map((data)=>(
                        <TableRow>
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
        </TableContainer>
    );

}

export type { TableData }
export default ETable