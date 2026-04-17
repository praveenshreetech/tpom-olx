import pool from './db.js'

// ── Products ──────────────────────────────────────────────────

export async function getAllProducts(data = {}) {
  const { category, search, limit = 20, offset = 0 } = data
  let sql = `
    SELECT p.id, p.title, p.price, p.location, p.views_count, p.created_at,
           c.name AS category,
           (SELECT image_url FROM product_images
            WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.status = 'active'`
  const params = []
  if (category) { sql += ' AND c.slug = ?'; params.push(category) }
  if (data.property_type) { sql += ' AND p.property_type = ?'; params.push(data.property_type) }
  if (search)   { sql += ' AND p.title LIKE ?'; params.push(`%${search}%`) }
  sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)
  const [rows] = await pool.query(sql, params)
  return rows
}

export async function getProductById(id) {
  const [[product]] = await pool.query(`
    SELECT p.*, c.name AS category
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = ? AND p.status = 'active'`, [id])
  if (!product) return null
  const [images] = await pool.query(
    'SELECT image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY sort_order', [id])
  await pool.query('UPDATE products SET views_count = views_count + 1 WHERE id = ?', [id])
  return { ...product, images }
}

export async function getAllProductsAdmin() {
  const [rows] = await pool.query(`
    SELECT p.id, p.title, p.price, p.location, p.status, p.views_count, p.created_at,
           c.name AS category,
           (SELECT image_url FROM product_images
            WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.created_at DESC`)
  return rows
}

export async function createProduct({ category_id, title, description, price, location,
                                      model, ownership, year, kilometers, expected_price, property_type, images = [] }) {
  const [result] = await pool.query(
    `INSERT INTO products 
     (category_id, title, description, price, location, model, ownership, year, kilometers, expected_price, property_type) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [category_id || null, title, description, price, location,
     model || null, ownership || null, year || null, kilometers || null, expected_price || null, property_type || null])
  const productId = result.insertId
  if (images.length > 0) {
    const imageRows = images.map((url, i) => [productId, url, i === 0 ? 1 : 0, i])
    await pool.query('INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES ?', [imageRows])
  }
  return productId
}

export async function updateProductStatus(id, status) {
  await pool.query('UPDATE products SET status = ? WHERE id = ?', [status, id])
}

export async function deleteProduct(id) {
  await pool.query('DELETE FROM products WHERE id = ?', [id])
}

export async function getCategories() {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name')
  return rows
}

// ── Seller Submissions ────────────────────────────────────────

export async function createSubmission(data) {
  const { seller_name, seller_phone, seller_whatsapp, seller_email,
          product_title, description, price, location, image_urls, contact_method, category_id,
          model, ownership, year, kilometers, expected_price, property_type } = data
  const [result] = await pool.query(`
    INSERT INTO seller_submissions
      (seller_name, seller_phone, seller_whatsapp, seller_email,
       product_title, description, price, location, image_urls, contact_method, category_id,
       model, ownership, year, kilometers, expected_price, property_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [seller_name, seller_phone, seller_whatsapp || null, seller_email || null,
     product_title, description || null, price || null, location || null,
     image_urls || null, contact_method, category_id || null,
     model || null, ownership || null, year || null, kilometers || null, expected_price || null, property_type || null])
  return result.insertId
}

export async function getAllSubmissions() {
  const [rows] = await pool.query(`
    SELECT s.*, c.name AS category_name
    FROM seller_submissions s
    LEFT JOIN categories c ON s.category_id = c.id
    ORDER BY s.created_at DESC`)
  return rows
}

export async function updateSubmissionStatus(id, status, admin_notes) {
  await pool.query(
    'UPDATE seller_submissions SET status = ?, admin_notes = ? WHERE id = ?',
    [status, admin_notes || null, id])
}

// ── Buyer Inquiries ───────────────────────────────────────────

export async function createInquiry(data) {
  const { product_id, buyer_name, buyer_phone, buyer_email, message, contact_method } = data
  const [result] = await pool.query(`
    INSERT INTO inquiries (product_id, buyer_name, buyer_phone, buyer_email, message, contact_method)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [product_id, buyer_name, buyer_phone || null, buyer_email || null, message, contact_method])
  return result.insertId
}

export async function getAllInquiries() {
  const [rows] = await pool.query(`
    SELECT i.*, p.title AS product_title, p.price AS product_price
    FROM inquiries i
    JOIN products p ON p.id = i.product_id
    ORDER BY i.created_at DESC`)
  return rows
}

export async function updateInquiryStatus(id, status, admin_notes) {
  await pool.query(
    'UPDATE inquiries SET status = ?, admin_notes = ? WHERE id = ?',
    [status, admin_notes || null, id])
}

// ── Dashboard Stats ───────────────────────────────────────────

export async function getDashboardStats() {
  const [[{ total_products }]] = await pool.query("SELECT COUNT(*) AS total_products FROM products WHERE status='active'")
  const [[{ new_submissions }]] = await pool.query("SELECT COUNT(*) AS new_submissions FROM seller_submissions WHERE status='new'")
  const [[{ new_inquiries }]] = await pool.query("SELECT COUNT(*) AS new_inquiries FROM inquiries WHERE status='new'")
  const [[{ total_views }]] = await pool.query('SELECT SUM(views_count) AS total_views FROM products')
  return { total_products, new_submissions, new_inquiries, total_views: total_views || 0 }
}
