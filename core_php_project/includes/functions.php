<?php
require_once __DIR__ . '/../config/db.php';

// ── Products ──────────────────────────────────────────────────

function getAllProducts($filters = []) {
    global $pdo;
    $category = $filters['category'] ?? null;
    $search = $filters['search'] ?? null;
    $limit = $filters['limit'] ?? 20;
    $offset = $filters['offset'] ?? 0;
    
    $sql = "SELECT p.id, p.title, p.price, p.location, p.views_count, p.created_at,
                   c.name AS category,
                   (SELECT image_url FROM product_images
                    WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image,
                   (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) AS images_count
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.status = 'active'";
    
    $params = [];
    if ($category) {
        $sql .= " AND c.slug = :category";
        $params['category'] = $category;
    }
    if ($search) {
        $sql .= " AND p.title LIKE :search";
        $params['search'] = "%$search%";
    }
    
    $sql .= " ORDER BY p.created_at DESC LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => &$val) {
        $stmt->bindParam(":$key", $val);
    }
    $limit = (int)$limit;
    $offset = (int)$offset;
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    return $stmt->fetchAll();
}

function getProductById($id) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT p.*, c.name AS category
                           FROM products p
                           LEFT JOIN categories c ON c.id = p.category_id
                           WHERE p.id = :id AND p.status = 'active'");
    $stmt->execute(['id' => $id]);
    $product = $stmt->fetch();
    
    if (!$product) return null;
    
    $imgStmt = $pdo->prepare("SELECT image_url, is_primary FROM product_images WHERE product_id = :id ORDER BY sort_order");
    $imgStmt->execute(['id' => $id]);
    $product['images'] = $imgStmt->fetchAll();
    
    $updStmt = $pdo->prepare("UPDATE products SET views_count = views_count + 1 WHERE id = :id");
    $updStmt->execute(['id' => $id]);
    
    return $product;
}

function getAllProductsAdmin() {
    global $pdo;
    $stmt = $pdo->query("
        SELECT p.id, p.title, p.price, p.location, p.status, p.views_count, p.created_at,
               c.name AS category,
               (SELECT image_url FROM product_images
                WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        ORDER BY p.created_at DESC");
    return $stmt->fetchAll();
}

function createProduct($data) {
    global $pdo;
    $stmt = $pdo->prepare("INSERT INTO products (category_id, title, description, price, location) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['category_id'] ?: null, 
        $data['title'], 
        $data['description'], 
        $data['price'], 
        $data['location']
    ]);
    
    $productId = $pdo->lastInsertId();
    
    if (!empty($data['images'])) {
        $imgStmt = $pdo->prepare("INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)");
        foreach ($data['images'] as $i => $url) {
            $imgStmt->execute([$productId, $url, $i === 0 ? 1 : 0, $i]);
        }
    }
    return $productId;
}

function updateProductStatus($id, $status) {
    global $pdo;
    $stmt = $pdo->prepare("UPDATE products SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
}

function deleteProduct($id) {
    global $pdo;
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
}

function getCategories() {
    global $pdo;
    return $pdo->query("SELECT * FROM categories ORDER BY name")->fetchAll();
}

// ── Seller Submissions ────────────────────────────────────────

function createSubmission($data) {
    global $pdo;
    $stmt = $pdo->prepare("
        INSERT INTO seller_submissions
          (seller_name, seller_phone, seller_whatsapp, seller_email,
           product_title, description, price, location, image_urls, contact_method)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['seller_name'],
        $data['seller_phone'],
        $data['seller_whatsapp'] ?: null,
        $data['seller_email'] ?: null,
        $data['product_title'],
        $data['description'] ?: null,
        $data['price'] ?: null,
        $data['location'] ?: null,
        $data['image_urls'] ?: null,
        $data['contact_method']
    ]);
    return $pdo->lastInsertId();
}

function getAllSubmissions() {
    global $pdo;
    return $pdo->query("SELECT * FROM seller_submissions ORDER BY created_at DESC")->fetchAll();
}

function updateSubmissionStatus($id, $status, $admin_notes = null) {
    global $pdo;
    $stmt = $pdo->prepare("UPDATE seller_submissions SET status = ?, admin_notes = ? WHERE id = ?");
    $stmt->execute([$status, $admin_notes ?: null, $id]);
}

// ── Buyer Inquiries ───────────────────────────────────────────

function createInquiry($data) {
    global $pdo;
    $stmt = $pdo->prepare("
        INSERT INTO inquiries (product_id, buyer_name, buyer_phone, buyer_email, message, contact_method)
        VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['product_id'],
        $data['buyer_name'],
        $data['buyer_phone'] ?: null,
        $data['buyer_email'] ?: null,
        $data['message'],
        $data['contact_method']
    ]);
    return $pdo->lastInsertId();
}

function getAllInquiries() {
    global $pdo;
    return $pdo->query("
        SELECT i.*, p.title AS product_title, p.price AS product_price
        FROM inquiries i
        JOIN products p ON p.id = i.product_id
        ORDER BY i.created_at DESC")->fetchAll();
}

function updateInquiryStatus($id, $status, $admin_notes = null) {
    global $pdo;
    $stmt = $pdo->prepare("UPDATE inquiries SET status = ?, admin_notes = ? WHERE id = ?");
    $stmt->execute([$status, $admin_notes ?: null, $id]);
}

// ── Dashboard Stats ───────────────────────────────────────────

function getDashboardStats() {
    global $pdo;
    $total_products = $pdo->query("SELECT COUNT(*) FROM products WHERE status='active'")->fetchColumn();
    $new_submissions = $pdo->query("SELECT COUNT(*) FROM seller_submissions WHERE status='new'")->fetchColumn();
    $new_inquiries = $pdo->query("SELECT COUNT(*) FROM inquiries WHERE status='new'")->fetchColumn();
    $total_views = $pdo->query("SELECT SUM(views_count) FROM products")->fetchColumn();
    
    return [
        'total_products' => $total_products,
        'new_submissions' => $new_submissions,
        'new_inquiries' => $new_inquiries,
        'total_views' => $total_views ?: 0
    ];
}
?>
