import { useState,useEffect,useCallback } from 'react'
import { 
  Paper, Box, SvgIcon, Button,IconButton,
  InputLabel,FormControl,MenuItem,Select, SelectChangeEvent
 } from '@mui/material'
import { IonInput,IonFab,IonFabButton,IonFabList,IonContent } from '@ionic/react'
import db, { useLiveQuery, Tenant } from '../backend/db'

//icons
import { IoHome } from "react-icons/io5";
import { IoWater } from "react-icons/io5";
import { IoFlash } from "react-icons/io5";
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface ElectricPast{
  room: string
  amount: number
}

const BillingAndPayments: React.FC = () => {
  const tenants = useLiveQuery(() => db.tenants.toArray(),[]) 
  const [rentAmount,setRentAmount] = useState<number>(0)

  const [personCount,setPersonCount] = useState<{[room: string]: number}>({})
  const [count,setCount] = useState<number>(0)
  const [rooms,setRooms] = useState<string[]>([])
  const [room, setRoomSelected] = useState<string>('');
  const handleInputRoom = useCallback((e: SelectChangeEvent) => {
    const room: string = e.target.value as string
    setRoomSelected(room)
    setCount(personCount[room])
  },[rooms])

  useEffect(()=>{
    if(tenants){
      const rooms = ['ROOM N1','ROOM N2','ROOM N3','ROOM N4','ROOM N5','ROOM N6','ROOM N7','ROOM N8','ROOM N9&10','ROOM N11','ROOM N12','ROOM N13','ROOM N14']
      const room: string[] = [];
      const roomCount: {[room: string]: number} = {}
      tenants?.map(result => {
        if (result?.room) {
          room.push(result.room);
        }

        if(result?.room && roomCount[result.room]){
          roomCount[result.room]++
        }else{
          if (result?.room) {
            roomCount[result.room] = 1;
          }
        }
      })
      setRooms(rooms.filter(r => Array.from(new Set(room)).includes(r)))
      setPersonCount(roomCount)
    }
  },[tenants])

  useEffect(()=>{
    db.open()
  },[])
  
  useEffect(()=>{
    db.storage.get('rent').then(result => setRentAmount(result?.value))
  },[])

  //for rent 
  const [isRentMSGShow,setIsRentMSGShow] = useState<boolean>(false)
  const handleRentInput = useCallback((e: any)=>{
    setRentAmount(e?.detail.value)
  },[])

  const handleRentAmount = useCallback(()=>{
    db.storage.update('rent',{value: rentAmount}).then(()=>{
      setIsRentMSGShow(true)
      setTimeout(()=>{
        setIsRentMSGShow(false) 
      },10000)
    })
  },[rentAmount])
  //end

  const [waterAmount,setWaterAmount] = useState<number>(0)
  const [isWaterBillApprove,setISWaterBillApprove] = useState<boolean>(false)
  const [isWaterMSGShow,setIsWaterMSGShow] = useState<boolean>(false)
  const handleWaterInput = useCallback((e: any)=>{
    setWaterAmount(e?.detail.value)
  },[])

  const handleWaterAmount = useCallback(()=>{
    setISWaterBillApprove(true)
    setIsWaterMSGShow(true)
    if(isWaterBillApprove === false) return;

    const divide: number = tenants ? (waterAmount / tenants.length) : 0
    const roundOf: number = Math.round(divide)
    const dateNow: string = new Date().toLocaleDateString()
    
    tenants?.map(async (tenant)=>{
      const water = tenant.water_bills ? [...tenant.water_bills, {amount: roundOf, date: dateNow}] : [{amount: roundOf, date: dateNow}]
      await db.tenants.update(tenant.id,{water_bills: water, balance: (Number(tenant.balance) + Number(roundOf))})
    })
    setWaterAmount(0)
    setISWaterBillApprove(false)
    setIsWaterMSGShow(false)
  },[isWaterBillApprove,waterAmount,tenants])

  const [isRentShow,setIsRentShow] = useState<boolean>(true)
  const [isWaterShow,setIsWaterShow] = useState<boolean>(true)
  const [isElectricShow,setIsElectricShow] = useState<boolean>(true)

  //computation for electric
  const [past,setPast] = useState<number>(0)
  const [present,setPresent] = useState<number>(0)
  const [usage,setUsage] = useState<number>(0)
  const [rate,setRate] = useState<number>(0)
  const [tax,setTax] = useState<number>(0)
  const [total,setTotal] = useState<number>(0)

  useEffect(()=> setUsage(Math.abs(past - present)) ,[past,present])
  useEffect(()=> setTotal(Math.round(((usage * rate) + tax))),[usage,rate,tax,count])
  useEffect(()=>{
    db.storage.get('rate').then((rate)=> setRate(rate?.value))
    db.storage.get('tax').then((tax)=> setTax(tax?.value))
  },[])


  const handleElecticAmount = useCallback(()=>{
    
  },[past,present])

  return (
    <Box className='flex flex-col gap-2 m-2 h-full overflow-auto'>
      { isRentShow && (
        <Paper elevation={5} className='flex flex-col gap-2 p-4'>
          <Box className='flex flex-row gap-2'>
            <Box className='text-red-400'><SvgIcon><IoHome/></SvgIcon></Box>
            <Box className='font-bold text-2xl '>Rent</Box>
            <Box className='ml-auto'><IconButton onClick={()=> setIsRentShow(!isRentShow)}><CloseIcon/></IconButton></Box>
          </Box>
          <Box className='flex flex-col gap-2'>
            { isRentMSGShow && (
              <Box className='text-center font-semibold'>This change has not affected the past amount of rent. Change approve!</Box>
            )}
            <IonInput value={rentAmount} onIonInput={handleRentInput} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Amount" />
            <Button onClick={handleRentAmount} startIcon={<DoneAllRoundedIcon/>} variant='contained' fullWidth>confirm</Button>
          </Box>
        </Paper>
      )}

      { isWaterShow && (
        <Paper elevation={5} className='flex flex-col gap-2 p-4'>
          <Box className='flex flex-row gap-2'>
            <Box className='text-blue-400'><SvgIcon><IoWater/></SvgIcon></Box>
            <Box className='font-bold text-2xl '>Water</Box>
            <Box className='ml-auto'><IconButton onClick={()=> setIsWaterShow(!isWaterShow)}><CloseIcon/></IconButton></Box>
          </Box>
          <Box className='flex flex-col gap-2'>
            { isWaterMSGShow && (
              <Box className='text-center font-semibold'>The second click divides the amount of the water bill for all tenants.</Box>
            )}
            <IonInput value={waterAmount !== 0? waterAmount : undefined} onIonInput={handleWaterInput} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Amount" disabled={isWaterMSGShow}/>
            <Box className='flex flex-row gap-2 justify-end'>
              { isWaterMSGShow && (
                <Button onClick={() => {setIsWaterMSGShow(false); setISWaterBillApprove(false)}} variant='contained' >cancel</Button>
              )}
              <Button onClick={handleWaterAmount} startIcon={isWaterBillApprove ? <DoneAllRoundedIcon/> : <CheckRoundedIcon/>} variant='contained' fullWidth={!isWaterMSGShow}>confirm</Button>
            </Box>
          </Box>
        </Paper>
      )}

      { isElectricShow && (
        <Paper elevation={5} className='flex flex-col gap-2 p-4'>
          <Box className='flex flex-row gap-2'>
            <Box className='text-yellow-400'><SvgIcon><IoFlash/></SvgIcon></Box>
            <Box className='font-bold text-2xl '>Electric</Box>
            <Box className='ml-auto'><IconButton onClick={()=> setIsElectricShow(!isElectricShow)}><CloseIcon/></IconButton></Box>
          </Box>
          <Box className='flex flex-col gap-4'>
            <FormControl variant='standard' className='w-full m-1'>
              <InputLabel>Tenant Room</InputLabel>
              <Select label="Room Number" value={room} onChange={handleInputRoom}>
              {
                rooms.map((room,index) => (
                  <MenuItem key={index} value={room}>{room}</MenuItem>
                ))
              }
              </Select>
            </FormControl>
            <Box className='flex flex-row gap-4'>
              <IonInput value={count} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Person Count"/>
              <IonInput value={total} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Total Amount" />
            </Box>
            <Box className='flex flex-row gap-4'>
              <IonInput value={usage} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Usage" />
              <IonInput value={rate} onIonInput={(e:any)=> setRate(e.detail.value)} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Rate" />
              <IonInput value={tax} onIonInput={(e:any)=> setTax(e.detail.value)} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Tax" />              
            </Box>
            <IonInput value={past} onIonInput={(e:any)=> setPast(e.detail.value)} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Past" />
            <IonInput value={present} onIonInput={(e:any)=> setPresent(e.detail.value)} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Present" />
            <Button onClick={handleElecticAmount} startIcon={<DoneAllRoundedIcon/>} variant='contained' fullWidth>confirm</Button>
          </Box>
        </Paper>
      )}

      <IonFab slot='fixed' vertical='bottom' horizontal='end'>
        <IonFabButton>
          <IconButton color='inherit'><KeyboardArrowUpIcon/></IconButton>
        </IonFabButton>
        <IonFabList side='top'>
          { !isElectricShow && (
            <IonFabButton >
              <IconButton onClick={()=> setIsElectricShow(!isElectricShow)} color='inherit'><SvgIcon><IoFlash/></SvgIcon></IconButton>
            </IonFabButton>
          )}

          { !isWaterShow && (
            <IonFabButton>
              <IconButton onClick={()=> setIsWaterShow(!isWaterShow)} color='inherit'><SvgIcon><IoWater/></SvgIcon></IconButton>
            </IonFabButton>
          )}

          { !isRentShow && (
            <IonFabButton>
              <IconButton onClick={()=> setIsRentShow(!isRentShow)} color='inherit'><SvgIcon><IoHome/></SvgIcon></IconButton>
            </IonFabButton>
          )}
        </IonFabList>
      </IonFab>
    </Box>
  );
};

export default BillingAndPayments;
  