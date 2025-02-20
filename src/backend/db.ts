import { Dexie, type EntityTable } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { Storage } from '@capacitor/storage'

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
    id?: number
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

const db = new Dexie('tenantDB') as Dexie & {
    tenants: EntityTable<Tenant,'id'>
    history: EntityTable<TenantHistory,'id'>
}

db.version(11).stores({
    tenants: '++id,name,room,date,coin,balance,*electric_bills,*water_bills,*rent_bills',
    history: '++id,tenant_id,*TenantBills'
})

const rentCost = async () =>{
  const { value } = await Storage.get({ key: 'rent' })
  return parseInt(value ?? '0')
}

type Tenants = Tenant[];
export type { Tenant, Tenants, TenantHistory, RentBill, ElectricBill, WaterBill }
export { useLiveQuery, db, Storage, rentCost}
export default db;