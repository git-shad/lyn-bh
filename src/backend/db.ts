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

interface History{
    id?: number
    tenant_id: number
    electric_bills?: ElectricBill[]
    water_bills?: WaterBill[]
    rent_bills?: RentBill[]
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
    history: EntityTable<History,'id'>
}

db.version(10).stores({
    tenants: '++id,name,room,date,coin,balance,*electric_bills,*water_bills,*rent_bills',
    history: '++id,tenant_id,*electric_bills,*water_bills,*rent_bills'
})

const rentCost = async () =>{
  const { value } = await Storage.get({ key: 'rent' })
  return parseInt(value ?? '0')
}

type Tenants = Tenant[];
export type { Tenant, Tenants, History, RentBill, ElectricBill, WaterBill }
export { useLiveQuery, db, Storage, rentCost}
export default db;