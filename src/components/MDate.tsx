import { FC, useCallback, useState, useEffect } from 'react'
import { IonDatetime } from '@ionic/react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Paper, Box } from '@mui/material'
//icon
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DatetimePresentation } from '@ionic/core';

interface Props {
  open: boolean;
  onClose?: () => void;
  isChange?: () => void;
  result?: (date: string) => void;
  presentation?: DatetimePresentation;
  setDate?: string;
}

const MDate: FC<Props> = ({ open, onClose, result, presentation, isChange, setDate }) => {
  const [change, setChange] = useState<string>('')
  const [date, setDateState] = useState<string>('')

  useEffect(() => { 
    if(setDate && setDate !== '') {
      setDateState(new Date(setDate || '').toISOString())
      setChange(new Date(setDate).toISOString());
    } else {
      setChange(new Date().toISOString());
    }
    if (isChange) {
      isChange();
    }
  }, [isChange, setDate]);

  const handleDateChange = useCallback((event: CustomEvent) => {
    if (result) {
      const date = new Date(event.detail.value).toISOString();
      result(new Date(date).toLocaleDateString());
      setChange(date);
    }
  }, [result]);

  function formatDate(date: string) {
    date = new Date(date).toLocaleDateString();
    const dateParts = date.split('/');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[parseInt(dateParts[0], 10) - 1];
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);
    if (presentation === 'month-year') return `${month}, ${year}`;
    return `${month} ${day}, ${year}`;
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Paper className='p-2 flex justify-center'>
          <Box>{formatDate(change)}</Box>
        </Paper>
      </DialogTitle>
      <DialogContent>
        { setDate ? (
          <IonDatetime value={change} presentation={presentation || 'date'} onIonChange={handleDateChange} />
        ) : (
          <IonDatetime presentation={presentation || 'date'} onIonChange={handleDateChange} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default MDate