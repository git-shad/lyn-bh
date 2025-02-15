import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { 
  Dialog, DialogTitle,DialogContent,DialogActions,Button,
  InputLabel,FormControl,MenuItem,Select, SelectChangeEvent,FormHelperText,
  Accordion,AccordionSummary,AccordionDetails
 } from '@mui/material'
import { IonInput,IonDatetime,IonItem } from '@ionic/react'
import db from '../backend/db';

//icon
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FaHouseChimneyUser } from "react-icons/fa6";

interface NewTenantProps {
  open: boolean;
  onClose: () => void;
}

const NewTenant: React.FC<NewTenantProps> = ({open,onClose}) => {
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

  //date
  const [startDate, setStartDate] = useState<string | string[] | null | undefined>();
  const dateRef = useRef<HTMLIonDatetimeElement>(null);
  const handleInputDate = useCallback(() => {
    if(!dateRef.current) return;
    setStartDate(dateRef.current.value)
  },[dateRef])

  //handle save button click
  const [helperName, setHelperName] = useState<string>('');
  const [helperRoom, setHelperRoom] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const handleSave = useCallback(() => {
    if(!name || !room) {
      if(!name) setHelperName('Name is required')
      if(!room) setHelperRoom('Room is required')
      return;
    };
    console.log({name,room,startDate})
    setIsOpen(true)
  },[name,room,startDate,onClose])

  //handle open button click
  const handleOpen = useCallback(() => {
    
  }, []);

  //every open reset
  useEffect(() => {
    if(open){
      setName('')
      setRoomSelected('')
      setStartDate('')
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
        <div className='flex flex-col gap-2'>
          <IonInput counter={true} maxlength={50} helperText={helperName} value={name} onIonInput={handleInputName} labelPlacement='floating' label='Name' />
          <FormControl variant='standard' className='w-full m-1'>
            <InputLabel>Room Number</InputLabel>
            <Select label="Room Number" value={room} onChange={handleInputRoom}>
            {
              roomNumber.map((room,index) => (
                <MenuItem key={index} value={room}>{room}</MenuItem>
              ))
            }
            </Select>
            <FormHelperText>{helperRoom}</FormHelperText>
          </FormControl>
          <Accordion variant='outlined'>
            <AccordionSummary expandIcon={<KeyboardArrowDownIcon />}>
              <span>Advance Pay</span>
            </AccordionSummary>
            <AccordionDetails>
              <IonInput onIonInput={handleInputAmount} type='number' counter={true} maxlength={6} labelPlacement='stacked' label='Amount' />
            </AccordionDetails>
          </Accordion>
          <IonDatetime onIonChange={handleInputDate} ref={dateRef} presentation='date'/>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleSave}>Save</Button>
        <Button component={Link} to='/tenants/profile?id=1' onClick={handleOpen} disabled={!isOpen}>Open</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewTenant;
