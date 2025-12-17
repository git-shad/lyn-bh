import {useState, useCallback} from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../backend/firebase';
import { AppProvider } from '@toolpad/core/AppProvider';
import { AuthResponse, SignInPage, type AuthProvider } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';
import { Button, Box, Alert } from '@mui/material';
import { db } from '../backend/db';

const providers = [{ id: 'credentials', name: 'Email and Password' }];

interface subtitleProps {
  error?: boolean;
  helperText?: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
}
const SubTitle: React.FC<subtitleProps> = ({ error, helperText, severity }) => {

  return (
    <Box>
      <Box style={{ marginBottom: '16px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
        Please enter your email and password to log in.
      </Box>
      {error && (
        <Alert severity={severity}>{helperText}</Alert>
      )}
    </Box>
  )
};

const Login: React.FC = () => {
  const theme = useTheme();

  const [eHealperText, setEHelperText] = useState<string | undefined>(undefined);
  const [pHelperText, setPHelperText] = useState<string | undefined>(undefined);

  const [eError, setEError] = useState<boolean>(false);
  const [pError, setPError] = useState<boolean>(false);

  const [optionError, setOptionError] = useState<boolean>(false);
  const [optionHelperText, setOptionHelperText] = useState<string | undefined>(undefined);

  const [severity, setSeverity] = useState<'error' | 'warning' | 'info' | 'success'>('error');

  const signIn = useCallback(async (provider: AuthProvider, formData: FormData, callbackUrl?: string): Promise<AuthResponse> => {
    try{
      const result = await signInWithEmailAndPassword(
        auth,
        formData.get('email') as string,
        formData.get('password') as string
      );

      db.storage.put({ key: 'email', value: result.user.email});
      db.storage.put({ key: 'lastsignin', value: result.user.metadata.lastSignInTime});
    }catch(error: any){
      switch (error.code) {
        case "auth/user-not-found":
          setEHelperText("No account found with this email.");
          setEError(true);
          break;
        case "auth/wrong-password":
          setPHelperText("Incorrect password. Please try again.");
          setPError(true);
          break;
        case "auth/invalid-email":
          setEHelperText("Invalid email format.");
          setEError(true);
          break;
        case "auth/user-disabled":
          setEHelperText("This account has been disabled.");
          setEError(true);
          break;
        case "auth/too-many-requests":
          setOptionHelperText("Too many attempts. Please wait and retry.");
          setOptionError(true);
          setSeverity('warning');
          break;
        default:
          setOptionHelperText("Authentication failed. Please try again.");
          setOptionError(true);
          setSeverity('error');
      }
    }
    return { success: false as any };
  },[]);

  return (
    <AppProvider theme={theme}>
      <SignInPage
        signIn={signIn}
        providers={providers}
        slotProps={{ 
          emailField: { autoFocus: false, helperText: eHealperText, error: eError }, 
          passwordField: { helperText: pHelperText, error: pError },
          form: { noValidate: true },
        }}
        slots={{
          subtitle: () => <SubTitle error={optionError} helperText={optionHelperText} severity={severity} />,
          submitButton: () => <Button type="submit" variant="contained" color="info" size="medium" disableElevation fullWidth sx={{ my: 2 }}>Log In</Button>
        }}
        
      />
    </AppProvider>
  );
}

export default Login;