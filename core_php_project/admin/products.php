<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'status') {
        updateProductStatus($_POST['id'], $_POST['status']);
    } elseif (isset($_POST['action']) && $_POST['action'] === 'delete') {
        deleteProduct($_POST['id']);
    }
    header('Location: products.php');
    exit;
}

$products = getAllProductsAdmin();
$current_page = 'products';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Products - Admin Dashboard</title>
    <link rel="stylesheet" href="<?php echo BASE_URL; ?>assets/css/style.css">
    <style>
        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #f4f6f8; }
        .admin-layout { display: flex; min-height: 100vh; }
        .admin-sidebar { width: 250px; background: #2c3e50; color: white; padding: 20px 0; display: flex; flex-direction: column; }
        .admin-sidebar .logo { padding: 0 20px 20px; font-size: 24px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px; color: white; text-decoration: none; display: block; }
        .admin-sidebar a { display: block; padding: 12px 20px; color: #ecf0f1; text-decoration: none; border-left: 3px solid transparent; }
        .admin-sidebar a:hover, .admin-sidebar a.active { background: rgba(255,255,255,0.05); border-left-color: #3498db; }
        .admin-main { flex: 1; padding: 30px; overflow-y: auto; }
        .table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .table th, .table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eaeaea; }
        .table th { background: #f8f9fa; font-weight: 600; color: #555; }
        .table img { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .badge-active { background: #e6f4ea; color: #1e8e3e; }
        .badge-sold { background: #fce8e6; color: #d93025; }
        .badge-hidden { background: #f1f3f4; color: #5f6368; }
        .btn-sm { padding: 6px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #ccc; background: white; cursor: pointer; }
    </style>
</head>
<body>
    <div class="admin-layout">
        <div class="admin-sidebar">
            <a href="<?php echo BASE_URL; ?>" class="logo" target="_blank">Marketplace</a>
            <a href="index.php">Dashboard</a>
            <a href="products.php" class="active">Products</a>
            <a href="submissions.php">Seller Submissions</a>
            <a href="inquiries.php">Inquiries</a>
            <a href="categories.php">Categories</a>
            <div style="flex-grow: 1;"></div>
            <a href="logout.php" style="color: #e74c3c;">Logout</a>
        </div>
        <div class="admin-main">
            <h2>Products Management</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($products as $p): ?>
                    <tr>
                        <td>
                            <?php if ($p['primary_image']): ?>
                                <img src="<?php echo BASE_URL . ltrim($p['primary_image'], '/'); ?>" alt="img">
                            <?php else: ?>
                                <div style="width:50px;height:50px;background:#eee;border-radius:4px;"></div>
                            <?php endif; ?>
                        </td>
                        <td><?php echo htmlspecialchars($p['title']); ?></td>
                        <td><?php echo htmlspecialchars($p['category']); ?></td>
                        <td>₹<?php echo number_format($p['price']); ?></td>
                        <td><span class="badge badge-<?php echo $p['status']; ?>"><?php echo ucfirst($p['status']); ?></span></td>
                        <td><?php echo $p['views_count']; ?></td>
                        <td>
                            <form method="POST" style="display:inline;">
                                <input type="hidden" name="action" value="status">
                                <input type="hidden" name="id" value="<?php echo $p['id']; ?>">
                                <select name="status" onchange="this.form.submit()" class="btn-sm">
                                    <option value="active" <?php echo $p['status'] == 'active' ? 'selected' : ''; ?>>Active</option>
                                    <option value="sold" <?php echo $p['status'] == 'sold' ? 'selected' : ''; ?>>Sold</option>
                                    <option value="hidden" <?php echo $p['status'] == 'hidden' ? 'selected' : ''; ?>>Hidden</option>
                                </select>
                            </form>
                            <form method="POST" style="display:inline;" onsubmit="return confirm('Delete this product?');">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?php echo $p['id']; ?>">
                                <button type="submit" class="btn-sm" style="color: red; border-color: red; margin-left: 5px;">Delete</button>
                            </form>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
