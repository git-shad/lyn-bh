import {useState, useCallback, useEffect} from 'react'
import { Box, Dialog, DialogTitle, DialogActions, DialogContent, Button, Alert } from "@mui/material"
import {db, Tenant, TenantHistory} from '../backend/db'
import { IonInput } from '@ionic/react'

//icon

interface Prop{
    id: number
    open: boolean
    onClose: ()=> void
}

const PayDialog: React.FC<Prop> = ({id,open,onClose}) =>{
    const [tenant, setTenant] = useState<Tenant>()
    const [history,setHistory] = useState<TenantHistory>()
    
    useEffect(()=>{
        const fetchFunction = async ()=>{
            const tenant = await db.tenants.get(id)
            const history = await db.history.get(id)
            
            setTenant(tenant)
            setHistory(history)
        }
        if(id) fetchFunction()
    },[id, tenant])

    const [paymentLessthan, setPaymentLessthan] = useState<boolean>(false)
    const [payValue, setPayValue] = useState<number>(0)
    const [coinLessthan,setCoinLessthan] = useState<boolean>(false)
    const [oldPaymentAmountLessthan,setOldPaymentAmountLessthan] = useState<boolean>(false)
    
    const handleToPay = useCallback(async ()=>{
        if(paymentLessthan) return;
        if(payValue === 0) return
        
        const date = (new Date()).toLocaleDateString()
        history?.bills?.push({amount: payValue, label: 'Old Payment', end_date: date, start_date:''})
        const newValue = (tenant?.oldpayment_amount || 0) - payValue
        const newCoinValue = (tenant?.coin || 0) - payValue
        await db.tenants.update(id, {oldpayment_amount: newValue, coin: newCoinValue})
        await db.history.update(id, {bills: history?.bills})
        setPayValue(0)
    },[paymentLessthan, payValue, history, tenant, id])

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
        setCoinLessthan(false)
        setOldPaymentAmountLessthan(false)

        const coin = tenant.coin || 0

        if(coin < payValue){
            setPaymentLessthan(true)
            setCoinLessthan(true)
        }

        if(tenant.oldpayment_amount < payValue){
            setPaymentLessthan(true)
            setOldPaymentAmountLessthan(true)
        }
    },[tenant, payValue, paymentLessthan])

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Old Payment</DialogTitle>
            <DialogContent>
                <Box>
                    <Box>Coin's: <span className='font-semibold'>{tenant?.coin}</span></Box>
                    <Box>Need to Pay: <span className='font-semibold'>{tenant?.oldpayment_amount}</span></Box>
                    <IonInput className={paymentLessthan ? 'mt-2 text-red-500' : 'mt-2 '}  value={payValue} onIonInput={handleToPayAmountChange} type='number' counter={true} maxlength={6} labelPlacement='stacked' label='payment amount' />
                </Box>
                {coinLessthan && (
                    <Alert severity='error'>Coin's value is not enough to pay the amount</Alert>//dae pa tapos
                )}  
                {oldPaymentAmountLessthan && (
                    <Alert severity='warning'>cannot accept the payment because your old payment are lessthan to payment amount</Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant='outlined' >close</Button>
                <Button onClick={handleToPay} variant='contained' sx={{ backgroundColor: '#2979ff', color: '#fff', boxShadow: '0 0 8px #2979ff', '&:hover': { backgroundColor: '#2962ff', boxShadow: '0 0 16px #2979ff', }, transition: 'box-shadow 0.3s ease-in-out', }}>ok</Button>
            </DialogActions>
        </Dialog>
    )
}

export default PayDialog;