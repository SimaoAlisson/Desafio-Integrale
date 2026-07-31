import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Action-Origin': 'frontend',
  },
});

export async function getLeads(search = '') {
  const params = {};

  if (search?.trim()) {
    params.search = search.trim();
  }

  const { data } = await api.get('/leads', { params });
  return data;
}

export async function getTrashLeads(search = '') {
  const params = {};

  if (search?.trim()) {
    params.search = search.trim();
  }

  const { data } = await api.get('/leads/trash', { params });
  return data;
}

export async function getLead(id) {
  const { data } = await api.get(`/leads/${id}`);
  return data;
}

export async function createLead(payload) {
  const { data } = await api.post('/leads', payload);
  return data;
}

export async function updateLead(id, payload) {
  const { data } = await api.put(`/leads/${id}`, payload);
  return data;
}

export async function deleteLead(id) {
  const { data } = await api.delete(`/leads/${id}`);
  return data;
}

export async function restoreLead(id) {
  const { data } = await api.post(`/leads/${id}/restore`);
  return data;
}

export async function getHistory({ leadId, action, search } = {}) {
  const params = {};

  if (leadId) params.leadId = leadId;
  if (action) params.action = action;
  if (search?.trim()) params.search = search.trim();

  const { data } = await api.get('/history', { params });
  return data;
}
