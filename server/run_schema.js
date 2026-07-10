const db = require('./config/db');

(async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS professionals_account (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS professionals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        professional_account_id INT NULL UNIQUE,
        profession VARCHAR(100) NOT NULL,
        experience INT DEFAULT 0,
        languages VARCHAR(255) DEFAULT '',
        bio TEXT,
        state VARCHAR(100) DEFAULT '',
        district VARCHAR(100) DEFAULT '',
        city VARCHAR(100) DEFAULT '',
        pincode VARCHAR(10) DEFAULT '',
        service_area VARCHAR(255) DEFAULT '',
        visit_charge DECIMAL(10,2) DEFAULT 0,
        hourly_rate DECIMAL(10,2) DEFAULT 0,
        emergency_charge DECIMAL(10,2) DEFAULT 0,
        working_hours VARCHAR(100) DEFAULT '',
        emergency_service BOOLEAN DEFAULT FALSE,
        id_proof VARCHAR(255) DEFAULT '',
        certificate VARCHAR(255) DEFAULT '',
        profile_photo VARCHAR(255) DEFAULT '',
        bank_name VARCHAR(100) DEFAULT '',
        account_number VARCHAR(50) DEFAULT '',
        ifsc_code VARCHAR(20) DEFAULT '',
        verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (professional_account_id) REFERENCES professionals_account(id) ON DELETE CASCADE
      )
    `);

    const [columnRows] = await db.execute(
      `SELECT COUNT(*) AS count
       FROM information_schema.columns
       WHERE table_schema = ?
         AND table_name = 'professionals'
         AND column_name = 'professional_account_id'`,
      [process.env.DB_NAME]
    );

    if (columnRows[0].count === 0) {
      await db.execute(`
        ALTER TABLE professionals
          ADD COLUMN professional_account_id INT NULL UNIQUE AFTER id,
          ADD CONSTRAINT fk_professional_account
            FOREIGN KEY (professional_account_id)
            REFERENCES professionals_account(id)
            ON DELETE CASCADE
      `);
    }

    const [userIdColumn] = await db.execute(
      `SELECT IS_NULLABLE AS is_nullable
       FROM information_schema.columns
       WHERE table_schema = ?
         AND table_name = 'professionals'
         AND column_name = 'user_id'`,
      [process.env.DB_NAME]
    );

    if (userIdColumn.length > 0 && userIdColumn[0].is_nullable === 'NO') {
      await db.execute(`
        ALTER TABLE professionals
          MODIFY COLUMN user_id INT NULL
      `);
    }

    console.log('customer and professional tables created successfully');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
