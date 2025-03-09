import { ReactNode, useEffect, useState, FC } from 'react';

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return isOnline;
};

interface Props {
  children?: ReactNode;
}

const Online: FC<Props> = ({ children }) => {
  const isOnline = useOnlineStatus();

  return <>{isOnline ? children : null}</>;
};

export {useOnlineStatus}
export default Online;
