import { useEffect, useState } from 'react'
import db, { Storage } from '../backend/db'

const BillingAndPayments: React.FC = () => {
  const [rentAmount,setRentAmount] = useState<number>(1000)

  useEffect(()=>{
    (async()=>{
      await Storage.set({key: 'rent', value: rentAmount.toString()})
    })()
  },[rentAmount])

  return (
    <div className='text-blue-500'>Billing and Payments</div>
  );
};

export default BillingAndPayments;
  