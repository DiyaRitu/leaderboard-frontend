import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const avatarOptions = [
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=Coffee",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=Bear",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=Star",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=Moon",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=Cupcake",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=Alien",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=Sunflower",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=Sparkle"
];

function App() {
  // States for user management and UI interaction
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [claimResult, setClaimResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [newUserName, setNewUserName] = useState('');
  const [history, setHistory] = useState([]);
  const [newAvatar, setNewAvatar] = useState('');

  // Fetch users from backend and assign avatars to those who don't have any
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users`);
      const updatedUsers = res.data.map((user, index) => {
        if (!user.avatar) {
          const avatar = avatarOptions[index % avatarOptions.length];
          return { ...user, avatar };
        }
        return user;
      });
      setUsers(updatedUsers);
    } catch (err) {
      console.error('❌ Failed to load users:', err);
    }
  };

  // Fetch leaderboard and assign fallback avatars if missing
  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/claim/leaderboard`);
      const updatedLeaderboard = res.data.map((user, index) => {
        if (!user.avatar) {
          const fallbackAvatar = avatarOptions[index % avatarOptions.length];
          return { ...user, avatar: fallbackAvatar };
        }
        return user;
      });
      setLeaderboard(updatedLeaderboard);
    } catch (err) {
      console.error('❌ Failed to load leaderboard:', err);
    }
  };

  // Fetch claim history and assign fallback avatars
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/claim/history`);
      const historyWithAvatars = res.data.map((entry, index) => ({
        ...entry,
        userId: {
          ...entry.userId,
          avatar: entry.userId?.avatar || avatarOptions[index % avatarOptions.length]
        }
      }));
      setHistory(historyWithAvatars);
    } catch (err) {
      console.error('❌ Failed to load history:', err);
    }
  };

  // Claim random points (1–10) for a selected user
  const handleClaim = async () => {
    if (!selectedUserId) return alert('Please select a user first!');
    try {
      const res = await axios.post(`${BASE_URL}/api/claim/claim`, { userId: selectedUserId });
      setClaimResult(res.data);
      fetchLeaderboard();
      fetchHistory();
    } catch (err) {
      console.error('❌ Claim failed:', err);
    }
  };

  // Add a new user with an optional avatar
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    try {
      const res = await axios.post(`${BASE_URL}/api/users/add`, {
        name: newUserName,
        avatar: newAvatar || `https://i.pravatar.cc/150?u=${newUserName}`
      });
      alert(`✅ User "${res.data.name}" added!`);
      setNewUserName('');
      fetchUsers();
    } catch (err) {
      console.error('❌ Failed to add user:', err);
      alert('Something went wrong!');
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
    fetchLeaderboard();
    fetchHistory();
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>

      {/* Header with Title and Ranking Tabs (based on img2.pdf) */}
      <div style={{ backgroundColor: '#1e1e2f', color: 'white', padding: '20px', textAlign: 'center', fontSize: '28px', borderRadius: '10px 10px 0 0' }}>
        🌟 Contribution & Star Tasks Ranking
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: '#2d2d44', padding: '10px 0', color: 'white', fontWeight: 'bold', fontSize: '16px', borderBottom: '3px solid #4CAF50' }}>
        <div style={{ cursor: 'pointer' }}>🌟 Contribution</div>
        <div style={{ cursor: 'pointer' }}>⭐ Star Tasks</div>
      </div>

      {/* Settlement Timer */}
      <div style={{ textAlign: 'center', backgroundColor: '#fef3c7', padding: '10px', fontWeight: 'bold', fontSize: '16px', marginTop: '20px', border: '1px solid #fcd34d', borderRadius: '8px', color: '#92400e' }}>
        ⏳ Settlement Time: 2 days 01:45:41
      </div>

      {/* Top 3 Users */}
      <h2 style={{ marginTop: '30px', textAlign: 'center' }}>🏆 Top Contributors</h2>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px' }}>
        {leaderboard.slice(0, 3).map((user, index) => (
          <div key={user._id} style={{ textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '10px', padding: '10px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', width: '30%' }}>
            <div style={{ fontSize: '30px' }}>{index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}</div>
            <img src={user.avatar} alt="avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px' }} />
            <h4 style={{ margin: '5px 0' }}>{user.name}</h4>
            <p style={{ margin: '0', color: '#374151' }}>{user.totalPoints.toLocaleString()} pts</p>
          </div>
        ))}
      </div>

      {/* Users 4+ */}
      <div>
        {leaderboard.slice(3).map((user, index) => (
          <div key={user._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: index % 2 === 0 ? '#f3f4f6' : '#ffffff', borderBottom: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <span style={{ width: '30px' }}>#{index + 4}</span>
            <img src={user.avatar} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ flexGrow: 1, marginLeft: '15px', fontWeight: 'bold' }}>{user.name}</span>
            <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>{user.totalPoints.toLocaleString()} pts</span>
          </div>
        ))}
      </div>

      {/* Claim Points & Select User */}
      <div style={{ marginTop: '40px' }}>
        <label><strong>Select User:</strong></label>
        <select
          value={selectedUserId}
          onChange={e => setSelectedUserId(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', width: '100%', margin: '10px 0' }}>
          <option value="">-- Select --</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>{user.name}</option>
          ))}
        </select>
        <button
          onClick={handleClaim}
          style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px 20px', fontSize: '16px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '30px' }}>
          🎯 Claim Points
        </button>

        {/* Claim Result */}
        {claimResult && (
          <div style={{ backgroundColor: '#d1fae5', padding: '15px', border: '2px solid #10b981', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src={claimResult.user.avatar} alt="avatar" style={{ width: 60, height: 60, borderRadius: '50%' }} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>🎯 {claimResult.user.name} just earned</div>
              <div style={{ fontSize: '24px', color: '#047857', fontWeight: 'bold' }}>+{claimResult.points} Points!</div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Form */}
      <h3>➕ Add New User</h3>
      <form onSubmit={handleCreateUser} style={{ marginBottom: '30px' }}>
        <input
          type="text"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder="Enter name"
          style={{ padding: '10px', fontSize: '16px', width: '60%' }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '10px 0' }}>
          {avatarOptions.map((avatar, index) => (
            <img
              key={index}
              src={avatar}
              alt={`avatar-${index}`}
              onClick={() => setNewAvatar(avatar)}
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                border: avatar === newAvatar ? '3px solid #4CAF50' : '2px solid #ccc',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Add
        </button>
      </form>

      {/* Claim History */}
      <h3>📜 Claim History</h3>
      <div>
        {history.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px', backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff', borderBottom: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img src={entry.userId?.avatar || 'https://via.placeholder.com/40'} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{entry.userId?.name || 'Unknown'}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>{new Date(entry.claimedAt).toLocaleString()}</div>
              </div>
            </div>
            <div style={{ fontWeight: 'bold', color: '#4B5563', fontSize: '18px' }}>+{entry.pointsClaimed}</div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;
