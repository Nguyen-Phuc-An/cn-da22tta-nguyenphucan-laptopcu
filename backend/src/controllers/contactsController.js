const db = require('../db');

/**
 * Create a new contact submission
 */
exports.create = async (req, res) => {
  try {
    const { ten, email, dien_thoai, tieu_de, noi_dung } = req.body;

    // Validation
    if (!ten || !email || !tieu_de || !noi_dung) {
      return res.status(400).json({ error: 'Missing required fields: ten, email, tieu_de, noi_dung' });
    }

    const query = `
      INSERT INTO contacts (ten, email, dien_thoai, tieu_de, noi_dung)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [ten, email, dien_thoai || null, tieu_de, noi_dung]);
    
    res.status(201).json({ 
      id: result.insertId, 
      ten, 
      email, 
      dien_thoai, 
      tieu_de, 
      noi_dung,
      tao_luc: new Date()
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact submission' });
  }
};

/**
 * Get all contacts (admin only)
 */
exports.list = async (req, res) => {
  try {
    const query = `
      SELECT id, ten, email, dien_thoai, tieu_de, noi_dung, tao_luc
      FROM contacts
      ORDER BY tao_luc DESC
    `;

    const [results] = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

/**
 * Get a single contact by ID
 */
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT id, ten, email, dien_thoai, tieu_de, noi_dung, tao_luc
      FROM contacts
      WHERE id = ?
    `;

    const [results] = await db.query(query, [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
};

/**
 * Delete a contact
 */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM contacts WHERE id = ?';

    const [result] = await db.query(query, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};
