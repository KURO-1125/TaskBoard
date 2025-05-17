import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState({});

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const res = await axiosInstance.get('/invitations');
        setInvitations(res.data);
      } catch (error) {
        setInvitations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvitations();
  }, []);

  const handleAction = async (id, action) => {
    setActionStatus({ ...actionStatus, [id]: 'loading' });
    try {
      await axiosInstance.post(`/invitations/${id}/${action}`);
      setInvitations(invitations.filter(invite => invite._id !== id));
      setActionStatus({ ...actionStatus, [id]: 'success' });
    } catch (error) {
      setActionStatus({ ...actionStatus, [id]: 'error' });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading invitations...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Project Invitations</h1>
      {invitations.length === 0 ? (
        <div className="text-gray-600">No pending invitations.</div>
      ) : (
        <ul className="space-y-4">
          {invitations.map(invite => (
            <li key={invite._id} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">{invite.project.title}</div>
                <div className="text-gray-600 text-sm">{invite.project.description}</div>
                <div className="text-xs text-gray-500 mt-1">Role: {invite.role}</div>
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => handleAction(invite._id, 'accept')}
                  disabled={actionStatus[invite._id] === 'loading'}
                >
                  Accept
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => handleAction(invite._id, 'decline')}
                  disabled={actionStatus[invite._id] === 'loading'}
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Invitations;
