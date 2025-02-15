import React, {useEffect} from 'react';
import { useLocation } from 'react-router-dom'
import queryString from 'query-string'

const Profile: React.FC = () => {
  const location = useLocation();
  const { id } = queryString.parse(location.search);

  useEffect(() => {
    console.log(id) 
  },[id])

  return (
    <div>Profile</div>
  )
        
}

export default Profile;