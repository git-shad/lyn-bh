import dexie, { Dexie, type EntityTable } from 'dexie';

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
    name: string
    room: string
    date: string
    electric_bills?: TenantElectricBill[]
    water_bills?: TenantWaterBill[]
    rent_bills?: TenantRentBill[]
}

 

const db = new dexie('tenantDB') as Dexie & {
    tenants: EntityTable<Tenant,'id'>;
}

db.version(1).stores({
    tenants: '++id,name,room,date,mobile_number,*electric_bills,*water_bills,*rent_bills'
})

export default db;