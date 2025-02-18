import { Dexie, type EntityTable } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { Storage } from '@capacitor/storage'

interface TenantElectricBill {
    amount: number
    date: string
}

interface TenantWaterBill {
    amount: number
    date: string
}

interface TenantRentBill {
    amount: number
    date: string
}

interface History{
    id?: number
    tenant_id: number
    electric_bills?: TenantElectricBill[]
    water_bills?: TenantWaterBill[]
    rent_bills?: TenantRentBill[]
}

interface Tenant {
    id?: number
    name?: string
    room?: string
    date?: string
    coin?: number
    balance?: number
    electric_bills?: TenantElectricBill[]
    water_bills?: TenantWaterBill[]
    rent_bills?: TenantRentBill[]
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
export type { Tenant, Tenants, History }
export { useLiveQuery, db, Storage, rentCost}
export default db;