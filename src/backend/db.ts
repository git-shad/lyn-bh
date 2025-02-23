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

interface Setting{
    key: string
    value: any
}

const db = new Dexie('tenantDB') as Dexie & {
    tenants: EntityTable<Tenant,'id'>
    history: EntityTable<TenantHistory,'tenant_id'>
    setting: EntityTable<Setting,'key'>
}

db.version(15).stores({
    tenants: '++id,name,room,date,coin,balance,*electric_bills,*water_bills,*rent_bills',
    history: 'tenant_id,*TenantBills',
    setting: 'key,value'
})

//first run when database are created
db.on('populate',async ()=>{
    await db.setting.add({key: 'rent', value: 1000})
})

const rentCost = async () =>{
  const setting = await db.setting.get('rent')
  if(!setting) return;
  return setting.value
}

type Tenants = Tenant[];
export type { Tenant, Tenants, TenantHistory, RentBill, ElectricBill, WaterBill }
export { useLiveQuery, db, rentCost}
export default db;