import db from '../config/db.js';

class ProfessionalModel {
  static async create(data) {
    const query = `
      INSERT INTO professionals (
        user_id, profession, experience, languages, bio, 
        state, district, city, pincode, service_area,
        visit_charge, hourly_rate, emergency_charge,
        availability, working_hours, emergency_service,
        id_proof, certificate, profile_photo, portfolio_photos,
        bank_name, account_number, ifsc_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      data.user_id, data.profession, data.experience, data.languages, data.bio,
      data.state, data.district, data.city, data.pincode, data.service_area,
      data.visit_charge || 0, data.hourly_rate || 0, data.emergency_charge || 0,
      data.availability || '', data.working_hours || '', data.emergency_service || false,
      data.id_proof || '', data.certificate || '', data.profile_photo || '', 
      JSON.stringify(data.portfolio_photos || []),
      data.bank_name || '', data.account_number || '', data.ifsc_code || ''
    ]);
    return result;
  }

  static async findPending() {
    const [rows] = await db.execute(`
      SELECT p.*, u.name as user_name, u.email as user_email 
      FROM professionals p
      JOIN users u ON p.user_id = u.id
      WHERE p.verification_status = 'pending'
    `);
    return rows;
  }

  static async updateStatus(id, status, reason = null) {
    const query = `UPDATE professionals SET verification_status = ?, rejection_reason = ? WHERE id = ?`;
    const [result] = await db.execute(query, [status, reason, id]);
    return result;
  }
}

export default ProfessionalModel;
