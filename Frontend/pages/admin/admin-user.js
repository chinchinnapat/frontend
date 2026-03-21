const checkAuth = () => {
    const staffData = JSON.parse(localStorage.getItem('staffData'));
    if (!staffData || !staffData.role) {
        window.location.href = '../staff-login/staff-login.html';
        return;
    }

    const role = staffData.role.toLowerCase().trim();
    if (role !== 'admin') {
        Swal.fire({
            title: 'ไม่มีสิทธิ์เข้าถึง',
            text: 'หน้านี้สำหรับผู้ดูแลระบบเท่านั้น',
            icon: 'error'
        }).then(() => {
            window.location.href = '../staff-login/staff-login.html';
        });
    }
};

let allUsers = [];

// โหลดข้อมูลจาก API
const loadUsers = async () => {
    try {
        const response = await api.users.getAll();
        allUsers = response.data; 
        renderUserTable(allUsers);
    } catch (error) {
        console.error("Load Users Error:", error);
        document.getElementById('userTableBody').innerHTML = `
            <tr><td colspan="6" style="text-align:center; color:red; padding:20px;">
                ไม่สามารถเชื่อมต่อ API ได้ กรุณาตรวจสอบการรัน Server
            </td></tr>`;
    }
};

// แสดงผลตาราง (เน้นความสวยเดิม + เพิ่มคอลัมน์สถานะ)
function renderUserTable(users) {
    const tableBody = document.getElementById('userTableBody');
    if (!users || !Array.isArray(users) || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">ไม่พบข้อมูลผู้ใช้งาน</td></tr>';
        return;
    }

    tableBody.innerHTML = users.map(user => {
        // กำหนดสถานะการใช้งาน
        const isActive = user.is_active === 1 || user.is_active === null;
        const statusText = isActive ? 'ใช้งานปกติ (Active)' : 'ปิดบัญชีแล้ว (Inactive)';
        const statusBg = isActive ? '#dcfce7' : '#fee2e2'; 
        const statusColor = isActive ? '#166534' : '#991b1b'; 

        return `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 15px;">${user.user_id}</td>
                <td style="padding: 15px;"><strong>${user.username}</strong></td>
                <td style="padding: 15px;">
                    <span style="padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; 
                        background: ${user.role.toLowerCase() === 'admin' ? '#dbeafe' : '#fef9c3'}; 
                        color: ${user.role.toLowerCase() === 'admin' ? '#1e40af' : '#854d0e'};">
                        ${user.role.toUpperCase()}
                    </span>
                </td>
                <td style="padding: 15px; color: #64748b;">${user.patient_id || 'N/A'}</td>
                
                <td style="padding: 15px;">
                    <span style="padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; 
                        background: ${statusBg}; color: ${statusColor}; font-weight: 500;">
                        ${statusText}
                    </span>
                </td>

                <td style="padding: 15px;">
                    <button onclick="goToEditPage(${user.user_id}, ${user.patient_id || 'null'})" 
                        style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-cog"></i> แก้ไขข้อมูล
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ฟังก์ชันเปลี่ยนหน้าไปยังหน้าแก้ไข
function goToEditPage(userId, patientId) {
    const targetUrl = `admin-edit-user.html?userId=${userId}${patientId ? `&patientId=${patientId}` : ''}`;
    window.location.href = targetUrl;
}

// ระบบค้นหา
document.getElementById('userSearchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allUsers.filter(u => 
        u.username.toLowerCase().includes(searchTerm) || 
        (u.patient_id && u.patient_id.toString().includes(searchTerm))
    );
    renderUserTable(filtered);
});

// เริ่มต้นทำงาน
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUsers();
});