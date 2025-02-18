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
  const [roomNumber, setRoomNumber] = useState(['ROOM N1','ROOM N2','ROOM N3','ROOM N4','ROOM N5','ROOM N6','ROOM N7','ROOM N8','ROOM N9','ROOM N10','ROOM N11','ROOM N12','ROOM N13','ROOM N14','ROOM N15','ROOM N16','ROOM N17','ROOM N18','ROOM N19','ROOM N20']);
  const [room, setRoomSelected] = useState<string>('');
  const handleInputRoom = useCallback((e: SelectChangeEvent) => {
    setRoomSelected(e.target.value as string)
  },[])

  //advance pay
  const [amount, setAmount] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0)
  const [isBalancePaid,setIsBalancePaid] = useState<boolean>(false)
  const handleInputAmount = useCallback(async (e: any) => {
    let amount = e.detail.value
    const rent = await rentCost()

    if(amount >= rent){
      amount = amount - rent
      setAmount(amount)
      setBalance(0)
      setIsBalancePaid(true)
    }else{
      setIsBalancePaid(false)
      setAmount(amount)
      setBalance(rent)
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
  const [hId,setHId] = useState<number>()//history id
  
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
      balance: balance
    }
 
    if (id !== undefined) {
      await db.tenants.update(id, tenant).then(async ()=>{
        if(hId !== undefined ){
          await db.history.update(hId,{rent_bills: [{amount: balance, date: startDate as string}]})
        }
      }).catch(async (err: any) => {
        console.error(err);
      });
    } else {
      await db.tenants.add(tenant).then(async (newId) => {
        if(newId !== undefined && isBalancePaid){
          await db.history.add({tenant_id: newId,rent_bills: [{amount: balance, date: startDate as string}]}).then(newId => setHId(newId))
        }
        setId(newId);
        setIsOpen(true);
      }).catch((err: any) => {
        console.error(err);
      });
    }
    
  },[name,room,startDate,onClose,amount,balance,id,hId,isBalancePaid])

  //every open reset
  useEffect(() => {
    if(open){
      setName('')
      setRoomSelected('')
      setStartDate(getDate())
      setAmount(0)
      setIsOpen(false)
      setHelperName('')
      setHelperRoom('')
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
        <Button onClick={()=>GoTo(`/tenants/profile?id=${id}`)} disabled={!isOpen}>Open</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewTenant;
