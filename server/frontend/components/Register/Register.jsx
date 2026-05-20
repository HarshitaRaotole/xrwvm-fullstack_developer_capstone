import React, { useState } from 'react';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const register_url = window.location.origin + "/djangoapp/register";
    
    try {
      const res = await fetch(register_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "userName": formData.username,
          "password": formData.password,
          "firstName": formData.firstName,
          "lastName": formData.lastName,
          "email": formData.email
        }),
      });
      
      const json = await res.json();
      if (json.status) {
        sessionStorage.setItem('username', json.userName);
        window.location.href = window.location.origin;
      } else if (json.error === "Already Registered") {
        alert("The user with same username is already registered");
        window.location.href = window.location.origin;
      } else {
        alert(json.error || "Registration failed");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Registration failed. Please try again later.");
    }
  };

  return (
    <div className="register-container">
      <h2>Sign-up</h2>
      <form onSubmit={handleRegister} className="register-form">
        <div className="input-group">
          <label>Username</label>
          <input 
            type="text" 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="input-group">
          <label>First Name</label>
          <input 
            type="text" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="input-group">
          <label>Last Name</label>
          <input 
            type="text" 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
        </div>
        <button type="submit" className="register-btn">Register</button>
      </form>
    </div>
  );
};

export default Register;
