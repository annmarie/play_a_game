import { useState, useEffect } from 'react';
import Layout from '@components/Layout';
import styles from './Rooms.module.css';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/rooms');
        const data = await response.json();
        setRooms(data.rooms || []);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
    const interval = setInterval(fetchRooms, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Layout><div className={styles.loading}>Loading rooms...</div></Layout>;

  return (
    <Layout>
      <div className={styles.container}>
        <h1>Active Rooms</h1>
        {rooms.length === 0 ? (
          <p className={styles.noRooms}>No active rooms</p>
        ) : (
          <div className={styles.roomsList}>
            {rooms.map(room => (
              <div key={room.id} className={styles.roomCard}>
                <div className={styles.roomHeader}>
                  <span className={styles.roomId}>{room.id}</span>
                  <span className={styles.gameType}>{room.gameType}</span>
                </div>
                <div className={styles.players}>
                  <div>Host: {room.players.host}</div>
                  <div>Guest: {room.players.guest || 'Waiting...'}</div>
                </div>
                <div className={`${styles.status} ${room.isFull ? styles.full : styles.waiting}`}>
                  {room.isFull ? 'Full' : 'Waiting for player'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Rooms;