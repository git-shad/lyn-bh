import { useState, useEffect, useCallback } from 'react';
import { db } from '../backend/db';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material';

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [lastsignin, setLastsignin] = useState('');

  useEffect(()=>{
    (async()=>{
        const username = await db.storage.get('username');
        const useremail = await db.storage.get('email');
        const userlastsignin = await db.storage.get('lastsignin');
        setLastsignin(userlastsignin?.value ?? '');
        setName(username?.value ?? '');
        setEmail(useremail?.value ?? '');
    })()
  },[]);

  const handleSave = useCallback(async () => {
    await db.storage.put({ key: 'username', value: name });
    window.location.reload();
  }, [name]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <Box className="my-2 text-gray-400">{lastsignin}</Box>
        <TextField
          autoFocus
          margin="dense"
          label="Username"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          disabled
          margin="dense"
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProfileDialog;