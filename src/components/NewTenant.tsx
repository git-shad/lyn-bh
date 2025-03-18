import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Dialog, DialogTitle,DialogContent,DialogActions,Button,
  InputLabel,FormControl,MenuItem,Select, SelectChangeEvent,FormHelperText,
 } from '@mui/material'
import { IonInput,IonDatetime,useIonRouter } from '@ionic/react'
import db, { Tenant, rentCost } from '../backend/db';


interface NewTenantProps {
  open: boolean;
  onClose: () => void;
}

const NewTenant: React.FC<NewTenantProps> = ({open,onClose}) => {
  const router = useIonRouter()
  const GoTo = useCallback((address:string)=>{
      router.push(address)
  },[router])

  //name
  const [name, setName] = useState<string>(' ');
  const handleInputName = useCallback((e: any) => {
    setName(e.detail.value)
  },[])

  //room
  const [roomNumber, setRoomNumber] = useState<string[]>([]);
  useEffect(()=>{
    (async()=>setRoomNumber((await db.storage.get('rooms'))?.value))()
  },[])

  const [room, setRoomSelected] = useState<string>('');
  const handleInputRoom = useCallback((e: SelectChangeEvent) => {
    setRoomSelected(e.target.value as string)
  },[])

  //advance pay
  const [amount, setAmount] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0)
  const [isBalancePaid,setIsBalancePaid] = useState<boolean>(false)
  const [rent,setRent] = useState<number>(0)
  const handleInputAmount = useCallback(async (e?: any) => {
    let amount = e?.detail.value ? e?.detail.value : 0 
    const coin = await rentCost()

    if(amount >= coin){
      amount = amount - coin
      setAmount(amount)
      setBalance(0)
      setIsBalancePaid(true)
      setRent(coin)
    }else{
      setIsBalancePaid(false)
      setAmount(amount)
      setBalance(coin)
      setRent(0)
    }
  },[balance,amount])

  const getDate = useCallback((e?: any) => {
    const date = e ? new Date(e) : new Date();
    return date.toLocaleDateString()
  },[])

  //date
  const [startDate, setStartDate] = useState<string>();
  const dateRef = useRef<HTMLIonDatetimeElement>(null);
  const handleInputDate = useCallback(() => {
    if(!dateRef.current) return;
    setStartDate(getDate(dateRef.current.value))
  },[dateRef])

  //handle save button click
  const [helperName, setHelperName] = useState<string>('');
  const [helperRoom, setHelperRoom] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [id,setId] = useState<number>()
  
  const handleSave = useCallback( async () => {
    if(!name || !room) {
      if(!name) setHelperName('Name is required')
      if(!room) setHelperRoom('Room is required')
      return;
    };

    const tenant: Tenant = {
      name,
      room,
      date: startDate as string,
      coin: amount,
      balance: balance,
      rent_bills: balance > 0 ? [{amount: balance, date: startDate as string}] : [],
      water_bills: [],
      electric_bills: []
    } 

    if (id !== undefined) {
      await db.tenants.update(id, tenant).then(async ()=>{
        if(id !== undefined){
          await db.history.update(id,{bills: [{label: 'rent',amount: rent, start_date: startDate as string,end_date: ''}]})
        }
      }).catch(async (err: any) => {
        console.error(err);
      });
    } else {
      await db.tenants.add(tenant).then(async (newId) => {
        if(newId !== undefined){
          await db.history.add({tenant_id: newId,bills: [{label: 'rent',amount: rent, start_date: startDate as string,end_date: getDate()}]})
        }
        setId(newId);
        setIsOpen(true);
      }).catch((err: any) => {
        console.error(err);
      });
    }
    
  },[name,room,startDate,onClose,amount,balance,id,isBalancePaid,rent])

  const handleOpen = useCallback(()=>{
    handleSave().then(()=>{
      GoTo(`/tenants/profile?id=${id}`)
    })
  },[id])
  
  //every open reset
  useEffect(() => {
    if(open){
      handleInputAmount()

      setName('')
      setRoomSelected('')
      setStartDate(getDate())
      setAmount(0)
      setBalance(0)
      setIsBalancePaid(false)
      setRent(0)
      setIsOpen(false)
      setHelperName('')
      setHelperRoom('')
      setId(undefined)
    }
  },[open])

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Tenant</DialogTitle>
      <DialogContent sx={{scrollbarWidth: 'none'}}>
        <div className='flex flex-col gap-4'>
          <FormControl variant='standard' className='w-full m-1'>
            <InputLabel>Room Number*</InputLabel>
            <Select label="Room Number" value={room} onChange={handleInputRoom}>
            {
              roomNumber.map((room,index) => (
                <MenuItem key={index} value={room}>{room}</MenuItem>
              ))
            }
            </Select>
            <FormHelperText>{helperRoom}</FormHelperText>
          </FormControl>
          <IonInput counter={true} maxlength={50} helperText={helperName} value={name} onIonInput={handleInputName} labelPlacement='floating' label='Name*' />
          <IonInput onIonInput={handleInputAmount} type='number' counter={true} maxlength={6} labelPlacement='stacked' label='Amount' />
          <IonDatetime onIonChange={handleInputDate} ref={dateRef} presentation='date'/>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={handleOpen} disabled={!isOpen}>Open</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewTenant;
