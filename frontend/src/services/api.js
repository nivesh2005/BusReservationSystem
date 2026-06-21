import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

export function getToken() {
  return localStorage.getItem('bus_token');
}

export function saveToken(token) {
  localStorage.setItem('bus_token', token);
  window.dispatchEvent(new Event('authChanged'));
}

export function logout() {
  localStorage.removeItem('bus_token');
  window.dispatchEvent(new Event('authChanged'));
  window.location.href = '/login';
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginUser(credentials) {
  return axios.post(`${API_BASE}/auth/login`, credentials);
}

export async function registerUser(data) {
  return axios.post(`${API_BASE}/auth/register`, data);
}

export async function fetchProfile() {
  return axios.get(`${API_BASE}/users/me`, { headers: authHeaders() });
}

export async function fetchBuses() {
  return axios.get(`${API_BASE}/buses`);
}

export async function createBooking(data) {
  return axios.post(`${API_BASE}/bookings`, data, { headers: authHeaders() });
}

export async function fetchHistory() {
  return axios.get(`${API_BASE}/bookings/history`, { headers: authHeaders() });
}

export async function deleteBooking(id) {
  return axios.delete(`${API_BASE}/bookings/${id}`, { headers: authHeaders() });
}
