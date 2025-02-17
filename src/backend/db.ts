import { Dexie, type EntityTable } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';

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

interface Tenant {
    id?: number
    name?: string
    room?: string
    date?: string
    coin?: number
    electric_bills?: TenantElectricBill[]
    water_bills?: TenantWaterBill[]
    rent_bills?: TenantRentBill[]
}

 

const db = new Dexie('tenantDB') as Dexie & {
    tenants: EntityTable<Tenant,'id'>;
}

db.version(1).stores({
    tenants: '++id,name,room,date,mobile_number,*electric_bills,*water_bills,*rent_bills'
})

type Tenants = Tenant[];
export type { Tenant, Tenants }
export { useLiveQuery, db }
export default db;