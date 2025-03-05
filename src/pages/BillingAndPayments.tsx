import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Paper, Box, SvgIcon, Button, IconButton,
  InputLabel, FormControl, MenuItem, Select, Alert, SelectChangeEvent,
  Autocomplete, TextField
} from '@mui/material';
import { IonInput, IonFab, IonFabButton, IonFabList, IonContent} from '@ionic/react';
import MDate from '../components/MDate'
import db, { useLiveQuery, Tenant } from '../backend/db';
import ETable, { type TableData } from '../components/ETable';

// icons
import { IoHome, IoWater, IoFlash } from "react-icons/io5";
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TableViewIcon from '@mui/icons-material/TableView';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Tenants from './Tenants';

const BillingAndPayments: React.FC = () => {
  const tenants = useLiveQuery(() => db.tenants.toArray());
  const [optProfile,setOptProfile] = useState<{label: string, id: number}[]>([])
  const [rentAmount, setRentAmount] = useState<number>(0);
  const [personCount, setPersonCount] = useState<{ [room: string]: number }>({});
  const [count, setCount] = useState<number>(0);
  const [rooms, setRooms] = useState<string[]>([]);
  const [room, setRoomSelected] = useState<string>('');
  const [tenantSelected, setTenantSelected] = useState<Tenant[]>();

  // computation for electric
  const [past, setPast] = useState<number>(0);
  const [present, setPresent] = useState<number>(0);
  const [usage, setUsage] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [totalFinal, setTotalFinal] = useState<number>(0);

  useEffect(() => setUsage(Math.abs(past - present)), [past, present]);
  useEffect(() => setTotal(Math.round(((usage * rate) + tax))), [usage, rate, tax, count]);
  useEffect(() => setTotalFinal(Math.round(total / count)), [total, count]);
  useEffect(() => {
    db.storage.get('rate').then((rate) => setRate(rate?.value));
    db.storage.get('tax').then((tax) => setTax(tax?.value));
  }, []);

  // run when changing the room
  const handleInputRoom = useCallback(async (e: SelectChangeEvent) => {
    const room: string = e.target.value as string;
    const tenant = tenants?.filter(tenant => tenant.room?.includes(room));
    setTenantSelected(tenant);
    setRoomSelected(room);
    setCount(personCount[room]);
    setPast((await db.storage.get(room))?.value);
    setPresent(0);
    setUsage(0);
    setTotal(0);
    setTotalFinal(0);
  }, [personCount]);

  // select room first
  useEffect(() => {
    if (rooms.length > 0) {
      let roomSwitch = rooms.findIndex((_) => _ === room);
      const e = { target: { value: rooms[roomSwitch + 1] ? rooms[roomSwitch + 1] : rooms[0] } } as SelectChangeEvent;
      handleInputRoom(e);
    }
  }, [rooms]);

  // setup and initialize
  useEffect(() => {
    (async () => {
      if (tenants) {
        const rooms: [] = (await db.storage.get('rooms'))?.value;
        const room: string[] = [];
        const optProfile: {label: string, id: number}[] = []
        const roomCount: { [room: string]: number } = {};
        
        tenants?.map(result => {
          if (result?.room) {
            room.push(result.room);
          }

          if (result?.room && roomCount[result.room]) {
            roomCount[result.room]++;
          } else {
            if (result?.room) {
              roomCount[result.room] = 1;
            }
          }

          if(result?.name && result?.id){
            optProfile.push({label: result.name, id: result.id})
          }
        })

        setRooms(rooms.filter(r => Array.from(new Set(room)).includes(r)));
        setPersonCount(roomCount);
        setOptProfile(optProfile)
      }
    })();
  }, [tenants]);

  function formatDate(date: string) {
    const dateParts = date.split('/');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[parseInt(dateParts[0], 10) - 1];
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);
    return `${month} ${day}, ${year}`;
  }

  //start: rent
  const [isRentShow, setIsRentShow] = useState<boolean>(false);
  const [isRentMSGShow, setIsRentMSGShow] = useState<boolean>(false);
  const [optProfileSelected,setOptProfileSelected] = useState<{label: string, id: number}[]>([])

  const [dateNowR, setDateNowR] = useState<string>('');
  const [isOpenRCal, setIsOpenRCal] = useState(false); // open and close the date

  const handleNewDateR = useCallback((result: string) => {
    setDateNowR(result);
  }, []);

  const handleRentInput = useCallback((e: any) => {
    setRentAmount(e?.detail.value);
  }, []);

  const handleRentAmount = useCallback(() => {
    db.storage.update('rent', { value: rentAmount }).then(() => {
      setIsRentMSGShow(true);
      setTimeout(() => {
        setIsRentMSGShow(false);
      }, 10000);
    })

    if(!optProfileSelected) return
    
    const selectedTenant = tenants?.filter(tenant => optProfileSelected.some(profile => profile.id === tenant.id));
    selectedTenant?.map(async (selected) => {
      const rentBills = selected.rent_bills ? [...selected.rent_bills,{amount: rentAmount, date: dateNowR}] : [{amount: rentAmount, date: dateNowR}]
      const filter = rentBills.filter( only => only.date === dateNowR)

      if(filter.length !== 1) return
      await db.tenants.update(selected.id,{rent_bills: rentBills,balance: (selected?.balance ?? 0) + rentAmount})
    })

  }, [rentAmount, optProfileSelected, tenants]);

  const handleSelectedValue = useCallback((_: any, value: { label: string, id: number }[]) => setOptProfileSelected(value), [])

  const handleIsHideRent = useCallback(()=>{
    setIsRentShow( hide => {
      const change = !hide
      db.storage.update('show-rent',{value: change})
      return change
    })
  },[])
  //end: rent

  //start: water
  const [dateNowW, setDateNowW] = useState<string>('')
  const [isOpenWCal, setIsOpenWCal] = useState(false)//open and close the date

  const handleNewDateW = useCallback((result: string)=>{
    setDateNowW(result)
  },[])

  const [waterAmount, setWaterAmount] = useState<number>(0);
  const [isWaterShow, setIsWaterShow] = useState<boolean>(false);
  const [isWaterBillApprove, setISWaterBillApprove] = useState<boolean>(false);
  const [isWaterBillhow, setIsWaterBillShow] = useState<boolean>(false);
  const [isWatterMsgShow, setIsWaterMsgShow] = useState<boolean>(false);
  const handleWaterInput = useCallback((e: any) => {
    setWaterAmount(e?.detail.value);
  }, []);

  const handleWaterAmount = useCallback(() => {
    setISWaterBillApprove(true);
    setIsWaterBillShow(true);
    if (isWaterBillApprove === false) return;

    const divide: number = tenants ? (waterAmount / tenants.length) : 0;
    const roundOf: number = Math.round(divide);
    const dateNow: string = new Date().toLocaleDateString();

    tenants?.map(async (tenant) => {
      const water = tenant.water_bills ? [...tenant.water_bills, { amount: roundOf, date: dateNow }] : [{ amount: roundOf, date: dateNow }];
      await db.tenants.update(tenant.id, { water_bills: water, balance: (Number(tenant.balance) + Number(roundOf)) });
    });
    setWaterAmount(0);
    setISWaterBillApprove(false);

    setIsWaterBillShow(true);
    setIsWaterBillShow(false);
    setIsWaterMsgShow(true);
    setTimeout(() => {
      setIsWaterMsgShow(false);
    }, 5000);
  }, [isWaterBillApprove, waterAmount, tenants]);

  const handleIsHideWater = useCallback(()=>{
    setIsWaterShow( hide => {
      const change = !hide
      db.storage.update('show-water',{value: change})
      return change
    })
  },[])
  //end: water

  //start: Electric
  const [dateNowE,setDateNowE] = useState<string>('')
  const [isOpenECal,setIsOpenECal] = useState(false)//open and close the date

  const handleNewDateE = useCallback((result: string)=>{
    setDateNowE(result)
  },[])

  const [isElectricShow, setIsElectricShow] = useState<boolean>(false);
  const [isElectricBillApprove, setIsElectricBillApprove] = useState<boolean>(false);
  const [isElectricMsgShow, setIsElectricMsgShow] = useState<boolean>(false);
  const [tdata, setTData] = useState<TableData[]>([]);
  const [open, setOpen] = useState(false);
  const handleElecticAmount = useCallback(async () => {
    if (past > 0 && present > 0 && isElectricBillApprove) {
      await db.storage.update(room, { value: Number(present) });
      await db.storage.update('rate', { value: rate });
      await db.storage.update('tax', { value: tax });
 
      // all tenant in room number are suppy the bill
      tenantSelected?.map(async (tenant) => {
        const electric = tenant.electric_bills ? [...tenant.electric_bills, { amount: totalFinal, date: dateNowE }] : [{ amount: totalFinal, date: dateNowE }];
        await db.tenants.update(tenant.id, { electric_bills: electric, balance: (Number(tenant.balance) + Number(totalFinal)) });
      });

      setIsElectricMsgShow(true);

      const tableRow: TableData = {
        room: room,
        past: past,
        present: present,
        usage: usage,
        rate: rate,
        tax: tax,
        total: ((usage * rate) + tax),
        roundOff: total,
        ofHead: count,
        individual: (total / count),
        roundOffFinal: totalFinal
      };

      setTData((tdata) => {
        tdata = tdata.filter(data => data.room !== room);
        tdata = tdata ? [...tdata, tableRow] : [tableRow];
        return tdata;
      });

      setTimeout(() => {
        setIsElectricMsgShow(false);
      }, 5000);
    } else {
      setIsElectricBillApprove(true);
    }
  }, [past, present, tax, rate, isElectricBillApprove, room, tenantSelected, totalFinal, count, usage, total, dateNowE]);

  const handleIsHideElectric = useCallback(()=>{
    setIsElectricShow( hide => {
      const change = !hide
      db.storage.update('show-electric',{value: change})
      return change
    })
  },[])
  //end: electric
  
  const handleFocus = (e: any) => {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleOpen = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  

  //initial the default
  useEffect(() => {
    db.storage.get('rent').then(result => setRentAmount(result?.value));
    db.storage.get('show-rent').then( result => setIsRentShow(result?.value))
    db.storage.get('show-electric').then( result => setIsElectricShow(result?.value))
    db.storage.get('show-water').then( result => setIsWaterShow(result?.value))

    const date = new Date().toLocaleDateString()
    setDateNowE(date)
    setDateNowW(date)
    setDateNowR(date)    
  }, []);

  return (
    <IonContent scrollY={true}>
      <Box className='pb-60'>
        {isRentShow && (
          <Paper elevation={5} className='flex flex-col gap-2 p-4 m-4'>
            <Box className='flex flex-row gap-2'>
              <Box className='text-red-400'><SvgIcon><IoHome /></SvgIcon></Box>
              <Box className='font-bold text-2xl '>Rent</Box>
              <Box className='ml-auto'><IconButton onClick={handleIsHideRent}><CloseIcon /></IconButton></Box>
            </Box>
            <Box>
              <Paper className='p-2 flex justify-center my-4'>
                <Button startIcon={<CalendarMonthIcon />} onClick={()=> setIsOpenRCal(!isOpenRCal)} color='inherit' fullWidth><Box className='text-xl font-semibold'>{formatDate(dateNowR)}</Box></Button>
              </Paper>
            </Box>
            <Box className='flex flex-col gap-2'>
              {isRentMSGShow && (
                <Alert severity='success'>This change has not affected the past amount of rent. Change approve!</Alert>
              )}
              <Autocomplete value={optProfileSelected} onChange={handleSelectedValue} multiple size='small' options={optProfile} renderInput={(params) => <TextField {...params} label="Profile" />}/>
              <IonInput onFocus={handleFocus} value={rentAmount} onIonInput={handleRentInput} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Amount" />
              <Button onClick={handleRentAmount} startIcon={<DoneAllRoundedIcon />} variant='contained' fullWidth>distribute</Button>
            </Box>
            <MDate open={isOpenRCal} onClose={()=> setIsOpenRCal(!isOpenRCal)} result={handleNewDateR}/>
          </Paper>
        )}

        {isWaterShow && (
          <Paper elevation={5} className='flex flex-col gap-2 p-4 m-4'>
            <Box className='flex flex-row gap-2'>
              <Box className='text-blue-400'><SvgIcon><IoWater /></SvgIcon></Box>
              <Box className='font-bold text-2xl '>Water</Box>
              <Box className='ml-auto'><IconButton onClick={handleIsHideWater}><CloseIcon /></IconButton></Box>
            </Box>
            <Box>
              <Paper className='p-2 flex justify-center my-4'>
                <Button startIcon={<CalendarMonthIcon />} onClick={()=> setIsOpenWCal(!isOpenWCal)} color='inherit' fullWidth><Box className='text-xl font-semibold'>{formatDate(dateNowW)}</Box></Button>
              </Paper>
            </Box>
            <Box className='flex flex-col gap-2'>
              {isWatterMsgShow && (
                <Alert severity='success'>Divides the amount of the water bill for all tenants.</Alert>
              )}
              <IonInput onFocus={handleFocus} value={waterAmount !== 0 ? waterAmount : undefined} onIonInput={handleWaterInput} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Amount" disabled={isWaterBillhow} />
              <Box className='flex flex-row gap-2 justify-end'>
                {isWaterBillhow && (
                  <Button onClick={() => { setIsWaterBillShow(false); setISWaterBillApprove(false) }} variant='contained' fullWidth>cancel</Button>
                )}
                <Button onClick={handleWaterAmount} startIcon={isWaterBillApprove ? <DoneAllRoundedIcon /> : <CheckRoundedIcon />} variant='contained' fullWidth>distribute</Button>
              </Box>
            </Box>
            <MDate open={isOpenWCal} onClose={()=> setIsOpenWCal(!isOpenWCal)} result={handleNewDateW}/>
          </Paper>
        )}

        {isElectricShow && (
          <Paper elevation={5} className='flex flex-col gap-2 p-4 m-4'>
            <Box className='flex flex-row gap-2'>
              <Box className='text-yellow-400'><SvgIcon><IoFlash /></SvgIcon></Box>
              <Box className='font-bold text-2xl '>Electric</Box>
              <Box className='ml-auto'><IconButton onClick={handleIsHideElectric}><CloseIcon /></IconButton></Box>
            </Box>
            <Box className='flex flex-col gap-2 my-4'>
              <Paper className='p-2 flex justify-center'>
                <Button startIcon={<CalendarMonthIcon />} onClick={()=> setIsOpenECal(!isOpenECal)} color='inherit' fullWidth><Box className='text-xl font-semibold'>{formatDate(dateNowE)}</Box></Button>
              </Paper>
              
            </Box>
            <Box className='flex flex-col gap-4'>
              <FormControl variant='standard' className='w-full m-1'>
                <InputLabel>Tenant Room</InputLabel>
                <Select label="Room Number" value={room} onChange={handleInputRoom}>
                  {
                    rooms.map((room, index) => (
                      <MenuItem key={index} value={room}>{room}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
              <IonInput onFocus={handleFocus} value={past} onIonInput={(e: any) => setPast(e.detail.value)} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Past" />
              <IonInput onFocus={handleFocus} value={present} onIonInput={(e: any) => setPresent(e.detail.value)} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Present" />
              <Box className='flex flex-row gap-4'>
                <IonInput onFocus={handleFocus} value={rate} onIonInput={(e: any) => setRate(e.detail.value)} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Rate" />
                <IonInput onFocus={handleFocus} value={tax} onIonInput={(e: any) => setTax(e.detail.value)} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Tax" />
              </Box>
              <Box className='flex flex-row gap-4'>
                <IonInput onFocus={handleFocus} value={usage} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Usage" />
                <IonInput onFocus={handleFocus} value={count} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Of Head" />
              </Box>
              <IonInput onFocus={handleFocus} value={totalFinal} type='number' counter={true} maxlength={6} labelPlacement='stacked' label="Individual (Round Off)" />
              {isElectricMsgShow && (
                <Alert severity='success'>Distribute to every tenant.</Alert>
              )}
              <Box className='flex justify-end'>
                <Button onClick={handleOpen} startIcon={<TableViewIcon />} variant='outlined' color='primary' sx={{ borderRadius: '8px' }}>
                  View Table
                </Button>
              </Box>
              <Box className='flex flex-row gap-2 justify-end'>
                {isElectricBillApprove && (
                  <Button onClick={() => { setIsElectricBillApprove(false) }} variant='contained' fullWidth>cancel</Button>
                )}
                <Button onClick={handleElecticAmount} startIcon={isElectricBillApprove ? <DoneAllRoundedIcon /> : <CheckRoundedIcon />} variant='contained' fullWidth>distribute</Button>
              </Box>
            </Box>
            <MDate open={isOpenECal} onClose={()=> setIsOpenECal(!isOpenECal)} result={handleNewDateE}/>
          </Paper>
        )}
      </Box>

      <ETable row={tdata || []} open={open} onClose={handleOpen} />
      <IonFab slot='fixed' vertical='bottom' horizontal='end'>
        <IonFabButton>
          <IconButton color='inherit'><KeyboardArrowUpIcon /></IconButton>
        </IonFabButton>
        <IonFabList side='top'>
          {!isElectricShow && (
        <IonFabButton>
          <IconButton onClick={handleIsHideElectric} color='inherit'><SvgIcon><IoFlash /></SvgIcon></IconButton>
        </IonFabButton>
          )}
          {!isWaterShow && (
        <IonFabButton>
          <IconButton onClick={handleIsHideWater} color='inherit'><SvgIcon><IoWater /></SvgIcon></IconButton>
        </IonFabButton>
          )}
          {!isRentShow && (
        <IonFabButton>
          <IconButton onClick={handleIsHideRent} color='inherit'><SvgIcon><IoHome /></SvgIcon></IconButton>
        </IonFabButton>
          )}
        </IonFabList>
      </IonFab>
    </IonContent>
  );
};

export default BillingAndPayments;
