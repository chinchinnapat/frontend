const initHistory = async () => {
    const listContainer = document.getElementById('history-list-container');
    const storedData = localStorage.getItem('userData');
    
    if (!storedData) {
        listContainer.innerHTML = '<p style="text-align:center;">ไม่พบข้อมูลการเข้าสู่ระบบ</p>';
        return;
    }

    const userData = JSON.parse(storedData);
    const patientId = userData.patient_id;

    try {
        // เรียกใช้ api.js ตามที่คุณต้องการ
        const response = await api.visits.getHistory(patientId);
        const visits = response.data.history; 

        if (!visits || visits.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; padding: 40px;">ไม่พบประวัติการรักษา</p>';
            return;
        }

        listContainer.innerHTML = visits.map(visit => {
            const d = new Date(visit.visit_date || visit.app_date);
            const dateThai = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;

            return `
                <div class="history-item">
                    <div>
                        <strong style="color: #334155;">ตรวจเมื่อ: ${dateThai}</strong>
                        <p style="color: #64748b; font-size: 0.9rem; margin-top: 5px;">
                            <i class="fas fa-stethoscope"></i> อาการ: ${visit.symptoms || '-'}
                        </p>
                    </div>
                    <a href="medical-record.html?visit_id=${visit.visit_id}" class="btn-view">
                        รายละเอียด <i class="fas fa-chevron-right" style="font-size: 0.8rem;"></i>
                    </a>
                </div>`;
        }).join('');

    } catch (error) {
        console.error('Error:', error);
        listContainer.innerHTML = '<p style="text-align:center; color:red; padding: 20px;">เชื่อมต่อข้อมูลไม่สำเร็จ</p>';
    }
};

const logout = () => {
    localStorage.clear();
    window.location.href = "../login/login.html";
};

// สั่งรันเมื่อโหลด DOM เสร็จ
document.addEventListener('DOMContentLoaded', initHistory);