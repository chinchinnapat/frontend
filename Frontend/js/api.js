const BASE_URL = 'http://127.0.0.1:8000'

const api = {
        users: {
        login: (data) => axios.post(`${BASE_URL}/users/login`, data),
        getAll: () => axios.get(`${BASE_URL}/users`),
        getById: (id) => axios.get(`${BASE_URL}/users/${id}`),
        update: (id, data) => axios.put(`${BASE_URL}/users/${id}`, data),
        updatePassword: (id, data) => axios.put(`${BASE_URL}/users/${id}/password`, data)
    },
    patients: {
        getAll: () => axios.get(`${BASE_URL}/patient`),
        getById: (id) => axios.get(`${BASE_URL}/patient/${id}`),
        create: (data) => axios.post(`${BASE_URL}/patient`, data),
        update: (id,data) => axios.put(`${BASE_URL}/patient/${id}`, data)
    },
    appointments: {
        getAll: () => axios.get(`${BASE_URL}/appointment`),
        getById: (id) => axios.get(`${BASE_URL}/appointment/${id}`),
        getByPatientId: (id) => axios.get(`${BASE_URL}/appointment/${id}`), 
        create: (data) => axios.post(`${BASE_URL}/appointment`, data),
        updateStatus: (id, status) => axios.put(`${BASE_URL}/appointment/${id}/status`, {status}),
        remove: (id) => axios.delete(`${BASE_URL}/appointment/${id}`),
        confirm: (id) => axios.put(`${BASE_URL}/appointment/confirm/${id}`),
        cancel: (id) => axios.put(`${BASE_URL}/appointment/cancel/${id}`)
    },
    doctors: {
        getAll: () => axios.get(`${BASE_URL}/doctor`),
        create: (data) => axios.post(`${BASE_URL}/doctor`, data),
        getById: (id) => axios.get(`${BASE_URL}/doctor/${id}`),
        remove: (id) => axios.delete(`${BASE_URL}/doctor/${id}`)
    },
    visits: {
        getAll: () => axios.get(`${BASE_URL}/visit`), 
        create: (data) => axios.post(`${BASE_URL}/visit`, data),
        getListByPatient: (q) => axios.get(`${BASE_URL}/visit/list?q=${q}`),
        getHistory: (patientId) => axios.get(`${BASE_URL}/visit/${patientId}`),
        search: (q, doctorId) => axios.get(`${BASE_URL}/visit/search?q=${q}&doctor_id=${doctorId}`),
        getById: (id) => axios.get(`${BASE_URL}/visits/${id}`)
    },
    medicalRecords: {
        getByVisitId: (visitId) => axios.get(`${BASE_URL}/medical_records/${visitId}`),
        getByPatient: (patientId) => axios.get(`${BASE_URL}/medical_records/patient/${patientId}`),
        save: (data) => axios.post(`${BASE_URL}/medical_records`, data)
    }
}
