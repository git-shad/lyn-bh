import {useState, useCallback, useEffect} from 'react'
import { Box, Dialog, DialogTitle, DialogActions, DialogContent, Button } from "@mui/material"
import {db, Tenant} from '../backend/db'
import { IonInput } from '@ionic/react'

//icon

interface Prop{
    id: number
    open: boolean
    onClose: ()=> void
}

const PayDialog: React.FC<Prop> = ({id,open,onClose}) =>{
    const [tenant, setTenant] = useState<Tenant>()
    
    useEffect(()=>{
        const fetchFunction = async ()=>{
            const tenant = await db.tenants.get(id)
            setTenant(tenant)
        }
        if(id) fetchFunction()
    },[id])

    const [paymentLessthan, setPaymentLessthan] = useState<boolean>(false)
    const [payValue, setPayValue] = useState<number>(0)
    const handleToPay = useCallback(()=>{
        
    },[paymentLessthan, payValue])

    const handleToPayAmountChange = useCallback(async (e: any)=>{
        const value = parseInt(e.detail.value)
        if(!isNaN(value)){
            setPayValue(value)
        }else{
            setPayValue(0)
        }
    },[])

    useEffect(()=>{
        if(tenant === undefined) return;
        setPaymentLessthan(false)
        const coin = tenant.coin || 0

        if(coin < payValue){
            setPaymentLessthan(true)
        }

        if(tenant.oldpayment_amount < payValue){
            setPaymentLessthan(true)
        }
    },[tenant, payValue, paymentLessthan])

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Old Payment</DialogTitle>
            <DialogContent>
                <Box>
                    <Box>Coin's: <span className='font-semibold'>{tenant?.coin}</span></Box>
                    <Box>Need to Pay: <span className='font-semibold'>{tenant?.oldpayment_amount}</span></Box>
                    <IonInput className={paymentLessthan ? 'mt-2 text-red-500' : 'mt-2 '}  value={payValue} onIonInput={handleToPayAmountChange} type='number' counter={true} maxlength={6} labelPlacement='stacked' label='amount' />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant='outlined' >cancel</Button>
                <Button onClick={handleToPay} variant='contained' sx={{ backgroundColor: '#2979ff', color: '#fff', boxShadow: '0 0 8px #2979ff', '&:hover': { backgroundColor: '#2962ff', boxShadow: '0 0 16px #2979ff', }, transition: 'box-shadow 0.3s ease-in-out', }}>ok</Button>
            </DialogActions>
        </Dialog>
    )
}

export default PayDialog;