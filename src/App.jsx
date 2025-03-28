import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const BASE_URL = 'https://reqres.in/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token, page]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users?page=${page}`);
      setUsers(response.data.data);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setLoginError('');
    } catch (error) {
      setLoginError('Invalid credentials');
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsers([]);
    setPage(1);
    setTotalPages(1);
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleUpdate = async (updatedUser) => {
    try {
      await axios.put(`${BASE_URL}/users/${updatedUser.id}`, {
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
      });
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="app">
      {!token ? (
        <LoginForm onLogin={handleLogin} error={loginError} />
      ) : editingUser ? (
        <EditForm user={editingUser} onUpdate={handleUpdate} onCancel={() => setEditingUser(null)} />
      ) : (
        <>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
          <UserList users={users} onEdit={handleEdit} onDelete={handleDelete} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

function LoginForm({ onLogin, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="login-container">
      <h2>User Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function UserList({ users, onEdit, onDelete }) {
  return (
    <div className="user-list-container">
      <h2>User List</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td><img src={user.avatar} alt="Avatar" className="user-avatar" /></td>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td className='editDeleteContainer'>
                <button onClick={() => onEdit(user)}>Edit</button>
                <button onClick={() => onDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EditForm({ user, onUpdate, onCancel }) {
  const [updatedUser, setUpdatedUser] = useState({ ...user });

  const handleChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(updatedUser);
  };

  return (
    <div className="edit-form-container">
      <h2>Edit User</h2>
      <form className="edit-form" onSubmit={handleSubmit}>
        <input type="text" name="first_name" placeholder="First Name" value={updatedUser.first_name} onChange={handleChange} />
        <input type="text" name="last_name" placeholder="Last Name" value={updatedUser.last_name} onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" value={updatedUser.email} onChange={handleChange} />
        <button type="submit">Update</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>Previous</button>
      <span>{page} / {totalPages}</span>
      <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
    </div>
  );
}

export default App;