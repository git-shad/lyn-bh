import { useState,useEffect,useCallback } from 'react'
import { 
  Paper, Box, SvgIcon, Button,IconButton,
  InputLabel,FormControl,MenuItem,Select, Alert, SelectChangeEvent,
  TableRow
 } from '@mui/material'
import { IonInput,IonFab,IonFabButton,IonFabList,IonContent } from '@ionic/react'
import db, { useLiveQuery, Tenant } from '../backend/db'
import ETable, { type TableData } from '../components/ETable'

//icons
import { IoHome } from "react-icons/io5";
import { IoWater } from "react-icons/io5";
import { IoFlash } from "react-icons/io5";
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TableViewIcon from '@mui/icons-material/TableView';

const BillingAndPayments: React.FC = () => {
  const tenants = useLiveQuery(() => db.tenants.toArray()) 
  const [rentAmount,setRentAmount] = useState<number>(0)
  const [personCount,setPersonCount] = useState<{[room: string]: number}>({}) 
  //room and count of person
  const [count,setCount] = useState<number>(0)//count of person
  const [rooms,setRooms] = useState<string[]>([])
  const [room, setRoomSelected] = useState<string>('');//room selected
  const [tenantSelected,setTenantSelected] = useState<Tenant[]>()
  const [roomList,setRoomList] = useState<string[]>()

  //computation for electric
  const [past,setPast] = useState<number>(0)
  const [present,setPresent] = useState<number>(0)
  const [usage,setUsage] = useState<number>(0)
  const [rate,setRate] = useState<number>(0)
  const [tax,setTax] = useState<number>(0)
  const [total,setTotal] = useState<number>(0)
  const [totalFinal,setTotalFinal] = useState<number>(0)

  useEffect(()=> setUsage(Math.abs(past - present)) ,[past,present])
  useEffect(()=> setTotal(Math.round(((usage * rate) + tax))),[usage,rate,tax,count])
  useEffect(()=> setTotalFinal(Math.round(total / count)),[total, count])
  useEffect(()=>{
    db.storage.get('rate').then((rate)=> setRate(rate?.value))
    db.storage.get('tax').then((tax)=> setTax(tax?.value))
  },[])

  //run when changing the room
  const handleInputRoom = useCallback(async (e: SelectChangeEvent) => {
    const room: string = e.target.value as string
 
    const tenant = tenants?.filter(tenant => tenant.room?.includes(room))
    setTenantSelected(tenant)
    
    
    setRoomSelected(room)
    setCount(personCount[room])
    setPast((await db.storage.get(room))?.value)
    setPresent(0)
    setUsage(0)
    setTotal(0)
    setTotalFinal(0)
  },[personCount])

  //select room first
  useEffect(()=>{
    if(rooms.length > 0){
      let roomSwitch = rooms.findIndex((_) => _ === room)
      const e = { target: { value: rooms[roomSwitch + 1] ? rooms[roomSwitch + 1] : rooms[0] } } as SelectChangeEvent;
      handleInputRoom(e)
    }
  },[rooms])

  //setup and initialize
  useEffect(()=>{
    (async ()=>{
      if(tenants){
        const rooms: [] = (await db.storage.get('rooms'))?.value
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
    })()
  },[tenants])
  
  //initit the rent state
  useEffect(()=>{
    db.storage.get('rent').then(result => setRentAmount(result?.value))
  },[])

  //rent
  const [isRentShow,setIsRentShow] = useState<boolean>(true) 
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

  //water
  const [waterAmount,setWaterAmount] = useState<number>(0)
  const [isWaterShow,setIsWaterShow] = useState<boolean>(true)
  const [isWaterBillApprove,setISWaterBillApprove] = useState<boolean>(false)
  const [isWaterBillhow,setIsWaterBillShow] = useState<boolean>(false)
  const [isWatterMsgShow, setIsWaterMsgShow] = useState<boolean>(false)
  const handleWaterInput = useCallback((e: any)=>{
    setWaterAmount(e?.detail.value)
  },[])

  const handleWaterAmount = useCallback(()=>{
    setISWaterBillApprove(true)
    setIsWaterBillShow(true)
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

    setIsWaterBillShow(true)
    setIsWaterBillShow(false)
    setIsWaterMsgShow(true)
    setTimeout(()=>{
      setIsWaterMsgShow(false)
    },5000)
  },[isWaterBillApprove,waterAmount,tenants])
  //end

  //Electric
  const [isElectricShow,setIsElectricShow] = useState<boolean>(true)
  const [isElectricBillApprove,setIsElectricBillApprove] = useState<boolean>(false)
  const [isElectricMsgShow, setIsElectricMsgShow] = useState<boolean>(false)
  const [tdata, setTData] = useState<TableData[]>([])
  const [open, setOpen] = useState(false);
  const handleElecticAmount = useCallback(async ()=>{    
    if(past > 0 && present > 0 && isElectricBillApprove){
      await db.storage.update(room, { value: Number(present) })
      await db.storage.update('rate',{ value: rate })
      await db.storage.update('tax',{ value: tax })

      const dateNow: string = new Date().toLocaleDateString()

      //all tenant in room number are suppy the bill
      tenantSelected?.map( async (tenant) => {
        const electric = tenant.electric_bills ? [...tenant.electric_bills, {amount: totalFinal, date: dateNow}] : [{amount: totalFinal, date: dateNow}]
        await db.tenants.update(tenant.id,{electric_bills: electric, balance: (Number(tenant.balance) + Number(totalFinal))})
      })
      setIsElectricMsgShow(true)

      const tableRow: TableData = {
        room: room,
        past: past,
        present: present,
        usage: usage,
        rate: rate,
        tax: tax, 
        total: total,
        roundOff: ((usage * rate) + tax),
        ofHead: count,
        individual: (total / count),
        roundOffFinal: totalFinal 
      };

      setTData((tdata) => {
        tdata = tdata.filter(data => data.room !== room)
        tdata = tdata ? [...tdata, tableRow] : [tableRow]
        return tdata
      })

      setTimeout(()=>{
        setIsElectricMsgShow(false)
      },5000)
    }else{
      setIsElectricBillApprove(true)
    }
  },[past,present,tax,rate,isElectricBillApprove,room,tenantSelected,totalFinal,count,usage,total])

  const handleOpen = useCallback(() => {
     setOpen(prev => !prev);
  }, []);



  return (
    <Box className='flex flex-col gap-2 p-2 h-full overflow-auto'>
      { isRentShow && (
        <Paper elevation={5} className='flex flex-col gap-2 p-4 m-1'>
          <Box className='flex flex-row gap-2'>
            <Box className='text-red-400'><SvgIcon><IoHome/></SvgIcon></Box>
            <Box className='font-bold text-2xl '>Rent</Box>
            <Box className='ml-auto'><IconButton onClick={()=> setIsRentShow(!isRentShow)}><CloseIcon/></IconButton></Box>
          </Box>
          <Box className='flex flex-col gap-2'>
            { isRentMSGShow && (
              <Alert severity='success'>This change has not affected the past amount of rent. Change approve!</Alert>
            )}  
            <IonInput value={rentAmount} onIonInput={handleRentInput} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Amount" />
            <Button onClick={handleRentAmount} startIcon={<DoneAllRoundedIcon/>} variant='contained' fullWidth>distribute</Button>
          </Box>
        </Paper>
      )}

      { isWaterShow && (
        <Paper elevation={5} className='flex flex-col gap-2 p-4 m-1'>
          <Box className='flex flex-row gap-2'>
            <Box className='text-blue-400'><SvgIcon><IoWater/></SvgIcon></Box>
            <Box className='font-bold text-2xl '>Water</Box>
            <Box className='ml-auto'><IconButton onClick={()=> setIsWaterShow(!isWaterShow)}><CloseIcon/></IconButton></Box>
          </Box>
          <Box className='flex flex-col gap-2'>
            { isWatterMsgShow && (
              <Alert severity='success'>Divides the amount of the water bill for all tenants.</Alert>
            )}

            <IonInput value={waterAmount !== 0? waterAmount : undefined} onIonInput={handleWaterInput} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Amount" disabled={isWaterBillhow}/>
            <Box className='flex flex-row gap-2 justify-end'>
              { isWaterBillhow && (
                <Button onClick={() => {setIsWaterBillShow(false); setISWaterBillApprove(false)}} variant='contained' fullWidth>cancel</Button>
              )}
              <Button onClick={handleWaterAmount} startIcon={isWaterBillApprove ? <DoneAllRoundedIcon/> : <CheckRoundedIcon/>} variant='contained' fullWidth>distribute</Button>
            </Box>
          </Box>
        </Paper>
      )}

      { isElectricShow && (
        <Paper elevation={5} className='flex flex-col gap-2 p-4 m-1'>
          <Box className='flex flex-row gap-2'>
            <Box className='text-yellow-400'><SvgIcon><IoFlash/></SvgIcon></Box>
            <Box className='font-bold text-2xl '>Electric</Box>
            <Box className='ml-auto'><IconButton onClick={()=> setIsElectricShow(!isElectricShow)}><CloseIcon/></IconButton></Box>
          </Box>
          <Box className='flex justify-end'>
            <IconButton onClick={handleOpen} color='primary' sx={{ border: '1px solid', borderRadius: '8px', m: 1 }}><TableViewIcon/></IconButton>
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
              <IonInput value={count} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Of Head"/>
              <IonInput value={totalFinal} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Individual (Round Off)" />
            </Box>
            <Box className='flex flex-row gap-4'>
              <IonInput value={usage} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Usage" />
              <IonInput value={rate} onIonInput={(e:any)=> setRate(e.detail.value)} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Rate" />
              <IonInput value={tax} onIonInput={(e:any)=> setTax(e.detail.value)} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Tax" />              
            </Box>
            <IonInput value={past} onIonInput={(e:any)=> setPast(e.detail.value)} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Past" />
            <IonInput value={present} onIonInput={(e:any)=> setPresent(e.detail.value)} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Present" />
            { isElectricMsgShow && (
              <Alert severity='success'>Distribute to every tenant. </Alert>
            )}
            <Box className='flex flex-row gap-2 justify-end'>
              { isElectricBillApprove && (
                <Button onClick={() => {setIsElectricBillApprove(false)}} variant='contained' fullWidth>cancel</Button>
              )}
              <Button onClick={handleElecticAmount} startIcon={isElectricBillApprove ? <DoneAllRoundedIcon/> : <CheckRoundedIcon/>} variant='contained' fullWidth>distribute</Button>
            </Box>
          </Box>
        </Paper>
      )}

      <ETable row={tdata || []} open={open} onClose={handleOpen}/>
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
  