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
    id?:number
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
    oldpayment_amount: number
    oldpayment_isOn: boolean
}

interface Storage{
    key: string
    value: any
}

interface Settings{
    key: string
    value: any
}

interface CutOffTenant{
    id?: number
    name?: string
    room?: string
    date?: string
}

interface QuarantineTenant{// tenant cutoff are stored in this table
    id?: number
    name?: string
    room?: string
    date?: string
    coin?: number
    balance?: number
    electric_bills?: ElectricBill[]
    water_bills?: WaterBill[]
    rent_bills?: RentBill[]
    oldpayment_amount?: number
    oldpayment_isOn?: boolean
}

//register table types for Dexie
const db = new Dexie('tenantDB') as Dexie & {
    tenants: EntityTable<Tenant,'id'>
    history: EntityTable<TenantHistory,'tenant_id'>
    storage: EntityTable<Storage,'key'>
    hebills: EntityTable<TableElectricBillHistory,'id'>
    settings: EntityTable<Settings,'key'>
    cutoff: EntityTable<CutOffTenant,'id'>
    quarantine: EntityTable<QuarantineTenant,'id'>
}

db.version(32).stores({
    tenants: '++id,name,room,date,coin,balance,*electric_bills,*water_bills,*rent_bills,oldpayment_amount,oldpayment_isOn',
    history: 'tenant_id,*TenantBills',
    storage: 'key,value',
    hebills: '++id, date, room, past, present, usage, rate, tax, total, roundOff, ofHead, individual, roundOffFinal',
    settings: 'key,value',
    cutoff: '++id,name,room,date',
    quarantine: '++id,name,room,date,coin,balance,*electric_bills,*water_bills,*rent_bills,oldpayment_amount,oldpayment_isOn'
})

// First run when database is created
db.on('populate', async ()=>{
    await db.settings.add({key: 'deletedb', value: false})
    await db.settings.add({key: 'syncdb', value: false})
    await db.settings.add({key: 'retrievedb', value: false})
    await db.settings.add({key: 'resetrecord', value: false})
    await db.settings.add({key: 'searched', value: ''})
    await db.storage.add({key: 'rent', value: 1000})
    await db.storage.add({key: 'rate', value: 0.0})
    await db.storage.add({key: 'tax', value: 0.0})
    await db.storage.add({key: 'show-rent', value: true})
    await db.storage.add({key: 'show-water', value: true})
    await db.storage.add({key: 'show-electric', value: true})
    const rooms = ['ROOM N1','ROOM N2','ROOM N3','ROOM N4','ROOM N5','ROOM N6','ROOM N7','ROOM N8','ROOM N9&10','ROOM N11','ROOM N12','ROOM N13','ROOM N14']
    await db.storage.add({key: 'rooms', value: rooms})
    rooms.map(async (room)=> await db.storage.add({key: room, value: 0})) 
    await db.storage.put({ key: 'username', value: ''});
})


const rentCost = async (): Promise<number> => {
    const rentSetting = await db.settings.get('rent');
    return rentSetting?.value ?? 1000;
};

type Tenants = Tenant[];
export type { Tenant, Tenants, TenantHistory, RentBill, ElectricBill, WaterBill, TableElectricBillHistory }
export { useLiveQuery, db, rentCost}
export default db;