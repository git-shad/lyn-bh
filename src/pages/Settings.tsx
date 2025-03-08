import {} from 'react'
import { Box,FormControlLabel,Switch, Paper } from '@mui/material'
import { syncAllTables,syncFirestoreToDexie } from '../backend/firestore'

const Settings = ()=>{

   return (
      <Box className='p-4'>
         <Paper className='p-2'>
            <FormControlLabel value='bottom' control={<Switch/>} label='Syncing data to Cloud Server' labelPlacement='end'/>
         </Paper>
      </Box>
   )
}

export default Settings
