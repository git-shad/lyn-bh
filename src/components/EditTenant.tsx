import { useEffect, useState, useCallback } from 'react'
import { 
  Dialog, DialogTitle, DialogActions, DialogContent, Box, SelectChangeEvent,
  FormControl,InputLabel,Select,MenuItem,FormHelperText, Button, Alert, IconButton
} from '@mui/material'
import { IonInput } from '@ionic/react'
import db from '../backend/db'


//icon
import DeleteIcon from '@mui/icons-material/Delete';

interface EditTenantProps {
  id: number
  open: boolean;
  onClose: () => void;
}

const EditTenant: React.FC<EditTenantProps> = ({id,open,onClose})=> {
  const [alert,setAlert] = useState<{severity: 'success' | 'error' | 'warning' | 'info', msg: string}>()
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

  useEffect(()=>{
    if(!open) return;
    
    (async ()=>{
      const tenant = await db.tenants.get(id)
      
      setRoomSelected(tenant?.room || '')
      setName(tenant?.name || '')
      
    })()
    
  },[open,id])

  const [helperName, setHelperName] = useState<string>('');
  const [helperRoom, setHelperRoom] = useState<string>('');
  const handleSave = useCallback(async ()=>{
    if(!name || !room) {
      if(!name) setHelperName('Name is required')
      if(!room) setHelperRoom('Room is required')
      return;
    }
    await db.tenants.update(id,{name: name, room: room})
    setAlert({severity: 'success', msg: 'Save!'})

    setTimeout(()=>{
      setAlert(undefined)
    },5000)
  },[name,room])

  const [isDelete, setIsDelete] = useState(true)
  const handleDeleteTenant = useCallback(()=>{

    if(isDelete){
      setIsDelete(false)
      setAlert({severity: 'warning', msg: 'Click again to delete forever'})
      return;
    }

    setAlert({severity: 'success', msg: 'Deleting pending'})
    setTimeout(()=>{
      db.tenants.delete(id)
    },1000)
  },[isDelete])

  const handleCancelDeleteTenant = useCallback(()=>{
    setIsDelete(true)
    setAlert(undefined)
  },[])
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <Box className='flex flex-col gap-4'>
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
          <IonInput counter={true} maxlength={50} helperText={helperName} value={name} onIonInput={handleInputName} labelPlacement='floating' label='Name' />
          
        </Box>
        {alert && (
          <Alert severity={alert.severity}>{alert.msg}</Alert>
        )}
      </DialogContent>
      <DialogActions>
        
        {isDelete ? (
          <Box className='flex flex-row gap-2 w-full'>
            <Box className='mr-5'>
              <IconButton onClick={handleDeleteTenant} color='error' sx={{ border: '1px solid', borderRadius: '8px' }}><DeleteIcon/></IconButton>
            </Box>
            <Button onClick={onClose} variant='outlined'>Close</Button>
            <Button onClick={handleSave} variant='outlined'>Save</Button>
          </Box>
        ) : (
          <Box className='flex flex-row gap-2'>
            <Button onClick={handleCancelDeleteTenant} variant='outlined'>cancel</Button>
            <Button onClick={handleDeleteTenant} color='error' variant='contained' startIcon={<DeleteIcon/>}>Delete</Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default EditTenant;