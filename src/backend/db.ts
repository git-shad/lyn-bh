import { Dexie, type EntityTable } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';

interface ElectricBill {
    amount: number
    date: string
}

interface WaterBill {
    amount: number
    date: string
}

interface RentBill {
    amount: number
    date: string
}

interface TenantBills{
    label: string
    amount: number
    start_date: string
    end_date: string
}
interface TenantHistory{
    tenant_id: number
    bills?: TenantBills[]
}

interface TableElectricBillHistory {
    date: string 
    room: string
    past: number
    present: number
    usage: number
    rate: number
    tax: number
    total: number
    roundOff: number
    ofHead: number
    individual: number
    roundOffFinal: number
}
interface Tenant {
    id?: number
    name?: string
    room?: string
    date?: string
    coin?: number
    balance?: number
    electric_bills?: ElectricBill[]
    water_bills?: WaterBill[]
    rent_bills?: RentBill[]
}

interface Storage{
    key: string
    value: any
}

const db = new Dexie('tenantDB') as Dexie & {
    tenants: EntityTable<Tenant,'id'>
    history: EntityTable<TenantHistory,'tenant_id'>
    storage: EntityTable<Storage,'key'>
    hebills: EntityTable<TableElectricBillHistory,'date'>
}

db.version(21).stores({
    tenants: '++id,name,room,date,coin,balance,*electric_bills,*water_bills,*rent_bills',
    history: 'tenant_id,*TenantBills',
    storage: 'key,value'
})

db.version(22).stores({
    hebills: 'date, room, past, present, usage, rate, tax, total, roundOff, ofHead, individual, roundOffFinal'
})

//first run when database are created
db.on('populate',async ()=>{
    await db.storage.add({key: 'rent', value: 1000})
    await db.storage.add({key: 'rate', value: 8.5907})
    await db.storage.add({key: 'tax', value: 36.42})
    const rooms = ['ROOM N1','ROOM N2','ROOM N3','ROOM N4','ROOM N5','ROOM N6','ROOM N7','ROOM N8','ROOM N9&10','ROOM N11','ROOM N12','ROOM N13','ROOM N14']
    await db.storage.add({key: 'rooms', value: rooms})
    rooms.map(async (room)=> await db.storage.add({key: room, value: 0}) )
})

const rentCost = async () =>{
  const storage = await db.storage.get('rent')
  if(!storage) return;
  return storage.value
}

type Tenants = Tenant[];
export type { Tenant, Tenants, TenantHistory, RentBill, ElectricBill, WaterBill, TableElectricBillHistory }
export { useLiveQuery, db, rentCost}
export default db;