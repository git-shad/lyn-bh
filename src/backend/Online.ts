import axios from 'axios';

const isOnline = async () => {
    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

export { isOnline };