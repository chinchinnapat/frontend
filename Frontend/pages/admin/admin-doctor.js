document.addEventListener('DOMContentLoaded', () => {
    loadDoctors();
});

// โหลดข้อมูลหมอทั้งหมด
const loadDoctors = async () => {
    const grid = document.getElementById('doctorDisplayGrid')
    
    try {
        if (typeof api === 'undefined') throw new Error("ไม่พบ api.js")

        const response = await api.doctors.getAll()
        const doctors = response.data;

        if (!doctors || doctors.length === 0) {
            grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 50px; color: #64748b;">
                ไม่พบรายชื่อแพทย์ในระบบ
            </p>`;
            return;
        }

        renderDoctorGrid(doctors)

    } catch (error) {
        console.error("Load Doctors Error:", error)
        grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 50px; color: red;">
            ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง
        </p>`;
    }
};

function renderDoctorGrid(doctors) {
    const grid = document.getElementById('doctorDisplayGrid');
    
    grid.innerHTML = doctors.map(doc => `
        <div class="doctor-card">
            <div class="doctor-avatar">
                <i class="fas fa-user-md"></i>
            </div>
            <h3 style="margin-bottom: 5px;">${doc.prefix}${doc.firstname} ${doc.lastname}</h3>
            <p style="color: #3b82f6; font-weight: 600; font-size: 0.9rem; margin-bottom: 10px;">
                ใบอนุญาต: ${doc.license_number}
            </p>
            <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 20px;">
                <i class="fas fa-phone"></i> ${doc.phone_number || 'ไม่ได้ระบุ'}
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="deleteDoctor(${doc.doctor_id})" 
                    style="flex: 1; padding: 8px; border: 1px solid #ef4444; color: #ef4444; background: white; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-trash-alt"></i> ลบ
                </button>
            </div>
        </div>
    `).join('');
}

// ลบข้อมูลแพทย์
async function deleteDoctor(id) {
    const confirm = await Swal.fire({
        title: 'ยืนยันการลบ?',
        text: "ข้อมูลแพทย์รายนี้จะถูกลบออกจากระบบถาวร",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
    });

    if (confirm.isConfirmed) {
        try {
            await api.doctors.remove(id); 
            
            Swal.fire('สำเร็จ', 'ลบรายชื่อแพทย์เรียบร้อยแล้ว', 'success');
            loadDoctors();
        } catch (error) {
            console.error("Delete Error:", error);
            Swal.fire('ผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
        }
    }
}