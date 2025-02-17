import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Dialog, DialogTitle,DialogContent,DialogActions,Button,
  InputLabel,FormControl,MenuItem,Select, SelectChangeEvent,FormHelperText,
 } from '@mui/material'
import { IonInput,IonDatetime,useIonRouter } from '@ionic/react'
import db, { Tenant } from '../backend/db';


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
  const handleInputAmount = useCallback((e: any) => {
    setAmount(e.detail.value)
  },[])

  const getDate = useCallback((e?: any) => {
    const date = e ? new Date(e) : new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month < 10 ? '0'+month : month}-${day < 10 ? '0'+day : day}`
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
      coin: amount
    }

    if (id !== undefined) {
      await db.tenants.update(id, tenant).catch(async (err: any) => {
        console.error(err);
      });
    } else {
      await db.tenants.add(tenant).then((newId) => {
        setId(newId);
        setIsOpen(true);
      }).catch((err: any) => {
        console.error(err);
      });
    }
    
  },[name,room,startDate,onClose])

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
