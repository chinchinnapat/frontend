const initMedicalRecord = async () => {
    const container = document.getElementById('record-content');
    
    try {
        // ดึง visit_id จาก URL
        const urlParams = new URLSearchParams(window.location.search);
        const visitId = urlParams.get('visit_id');

        if (!visitId) {
            window.location.href = "history.html";
            return;
        }

        // เรียก API
        const response = await api.medicalRecords.getByVisitId(visitId);
        
        // จัดการข้อมูล (รองรับทั้งแบบ Object และ Array)
        const data = Array.isArray(response.data) ? response.data[0] : response.data;

        // ตรวจสอบและแสดงผล
        if (data && (data.diagnosis || data.record_id)) {
            renderRecordDetail(data);
        } else {
            container.innerHTML = `
                <div style="text-align:center; padding:60px 20px;">
                    <i class="fas fa-file-medical-alt fa-3x" style="color:#e2e8f0; margin-bottom:15px;"></i>
                    <h3 style="color:#64748b;">ไม่พบข้อมูลการรักษา</h3>
                    <p style="color:#94a3b8;">ไม่พบรายการบันทึกสำหรับ Visit ID: ${visitId}</p>
                </div>`;
        }
    } catch (error) {
        console.error("API Error:", error);
        container.innerHTML = `<div style="text-align:center; padding:50px; color:red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>`;
    }
};

const renderRecordDetail = (data) => {
    const container = document.getElementById('record-content');
    
    // แปลงวันที่ให้เป็นภาษาไทย
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const displayDate = data.visit_date ? new Date(data.visit_date).toLocaleDateString('th-TH', dateOptions) : 'ไม่ระบุวันที่';

    container.innerHTML = `
        <div style="background:#f8fafc; padding:20px; border-radius:12px; display:flex; gap:40px; margin-bottom:25px;">
            <div><span style="color:#64748b;">วันที่ตรวจ:</span> <strong>${displayDate}</strong></div>
            <div><span style="color:#64748b;">สถานะ:</span> <span style="color:#10b981; font-weight:bold;">ดำเนินการเสร็จสิ้น</span></div>
        </div>

        <div style="margin-bottom:30px;">
            <h3 style="color:#1a73e8; border-bottom:2px solid #e2e8f0; padding-bottom:10px;">
                <i class="fas fa-diagnoses"></i> ผลการวินิจฉัย (Diagnosis)
            </h3>
            <div style="background:#f0f7ff; padding:20px; border-radius:10px; border-left:5px solid #1a73e8; margin-top:15px;">
                <p style="font-size:1.1rem;">${data.diagnosis || 'ไม่มีข้อมูล'}</p>
            </div>
        </div>

        <div style="background:#fffbeb; border:1px dashed #f59e0b; padding:20px; border-radius:12px;">
            <h4 style="color:#b45309; margin-bottom:15px;"><i class="fas fa-pills"></i> รายการยาและคำแนะนำ</h4>
            <p><strong>คำแนะนำ:</strong> ${data.treatment_plan || '-'}</p>
            <hr style="border:0; border-top:1px solid rgba(245,158,11,0.2); margin:15px 0;">
            <p><strong>รายการยา:</strong> ${data.prescriptions || 'ไม่มีรายการยา'}</p>
        </div>
    `;
};

// สั่งให้ทำงานทันทีที่โหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', initMedicalRecord);