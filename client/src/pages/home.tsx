import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { getSocket, WS } from '../lib/websocket';

export default function Home() {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const nav = useNavigate();

  const create = () => {
    const playerName = name || 'Player';
    sessionStorage.setItem('name', playerName);
    const s = getSocket();
    s.emit(WS.ROOM_CREATE, { name: playerName });
    s.once(WS.ROOM_CREATE, (payload: { code: string }) => {
      nav(`/lobby/${payload.code}`);
    });
  };

  const join = () => {
    if (!room) return;
    const playerName = name || 'Player';
    sessionStorage.setItem('name', playerName);
    nav(`/lobby/${room}`);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/assets/cauldron background.png)' }}
    >
      <div className="mx-auto max-w-md space-y-6 p-4 pt-24">
        <div className="text-center text-3xl font-bold">Irish Potions</div>
      <div className="space-y-2">
        <label className="text-sm text-slate-400">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-slate-400">Room Code</label>
        <Input value={room} onChange={(e) => setRoom(e.target.value.toUpperCase())} placeholder="ABCD" />
      </div>
      <div className="flex gap-2">
        <Button onClick={create} className="flex-1">Create Room</Button>
        <Button onClick={join} className="flex-1">Join Room</Button>
      </div>
      </div>
    </div>
  );
}
