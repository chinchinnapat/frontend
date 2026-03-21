async function initAppointmentPage() {
    try {
        const rawData = localStorage.getItem('userData') || localStorage.getItem('user');
        const user = rawData ? JSON.parse(rawData) : null;

        if (!user || !user.patient_id) {
            Swal.fire('กรุณาเข้าสู่ระบบ', 'ไม่พบข้อมูลผู้ใช้งาน', 'warning');
            return;
        }

        // --- โหลดรายชื่อแพทย์ ---
        const resDoc = await api.doctors.getAll();
        const select = document.getElementById('doctor_select');
        if (select && resDoc.data) {
            select.innerHTML = '<option value="">-- เลือกแพทย์ --</option>';
            resDoc.data.forEach(doc => {
                const prefix = doc.prefix || 'นพ.';
                select.innerHTML += `<option value="${doc.doctor_id}">${prefix} ${doc.firstname} ${doc.lastname}</option>`;
            });
        }

        const resApp = await api.appointments.getByPatientId(user.patient_id);
        const listContainer = document.getElementById('appointment_list');
        
        if (listContainer) {
            listContainer.innerHTML = ''; 
            if (resApp.data && resApp.data.length > 0) {
                resApp.data.forEach(app => {
                    const statusClass = app.status === 'confirmed' ? 'status-confirmed' : 'status-pending';
                    listContainer.innerHTML += `
                        <div class="appt-item">
                            <div>
                                <p style="margin:0; font-weight:600;">แพทย์: ${app.prefix ? app.prefix + ' ' + app.doctor_firstname + ' ' + app.doctor_lastname : (app.doctor_name || app.doctor_id)}</p>
                                <p style="margin:5px 0; font-size:0.9rem; color:#64748b;">
                                    <i class="far fa-calendar-alt"></i> ${app.app_date} | 
                                    <i class="far fa-clock"></i> ${app.app_time} น.
                                </p>
                            </div>
                            <span class="status-badge ${statusClass}">${app.status}</span>
                        </div>`;
                });
            } else {
                listContainer.innerHTML = '<p style="text-align:center; color:#64748b; padding:20px;">ยังไม่มีรายการนัดหมาย</p>';
            }
        }
    } catch (err) {
        console.error("Error loading data:", err);
    }
}

const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const rawData = localStorage.getItem('userData') || localStorage.getItem('user');
        const user = JSON.parse(rawData);

        // ดึงค่าโดยใช้ getElementById ให้ตรงกับ ID ใน HTML ของคุณ
        const appointData = {
            patient_id: parseInt(user.patient_id),
            doctor_id: parseInt(document.getElementById('doctor_select').value),
            app_date: document.getElementById('app_date').value,
            app_time: document.getElementById('app_time').value,
            reason: document.getElementById('reason').value,
            status: 'pending'
        };

        console.log("กำลังส่งข้อมูลจอง:", appointData);

        try {
            Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
            
            // ยิง API (POST /appointment)
            const response = await api.appointments.create(appointData); 
            
            await Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: 'จองนัดหมายเรียบร้อยแล้ว',
                timer: 2000
            });
            location.reload(); 
        } catch (err) {
            console.error("Save Error:", err.response?.data);
            const errorMsg = err.response?.data?.errors?.join('<br>') || err.response?.data?.message || 'กรอกข้อมูลไม่ครบถ้วน';
            Swal.fire({
                icon: 'error',
                title: 'จองนัดหมายไม่สำเร็จ',
                html: errorMsg
            });
        }
    });
}

function logout() {
    localStorage.clear();
    location.href = '../login/login.html';
}

// รันฟังก์ชัน
initAppointmentPage();