<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../includes/functions.php';

$categories = getCategories();
// simple read-only category list for demo
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Categories - Admin Dashboard</title>
    <link rel="stylesheet" href="<?php echo BASE_URL; ?>assets/css/style.css">
    <style>
        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #f4f6f8; }
        .admin-layout { display: flex; min-height: 100vh; }
        .admin-sidebar { width: 250px; background: #2c3e50; color: white; padding: 20px 0; display: flex; flex-direction: column; }
        .admin-sidebar .logo { padding: 0 20px 20px; font-size: 24px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px; color: white; text-decoration: none; display: block; }
        .admin-sidebar a { display: block; padding: 12px 20px; color: #ecf0f1; text-decoration: none; border-left: 3px solid transparent; }
        .admin-sidebar a:hover, .admin-sidebar a.active { background: rgba(255,255,255,0.05); border-left-color: #3498db; }
        .admin-main { flex: 1; padding: 30px; overflow-y: auto; }
        .table { width: 100%; max-width: 600px; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .table th, .table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eaeaea; }
        .table th { background: #f8f9fa; font-weight: 600; color: #555; }
    </style>
</head>
<body>
    <div class="admin-layout">
        <div class="admin-sidebar">
            <a href="<?php echo BASE_URL; ?>" class="logo" target="_blank">Marketplace</a>
            <a href="index.php">Dashboard</a>
            <a href="products.php">Products</a>
            <a href="submissions.php">Seller Submissions</a>
            <a href="inquiries.php">Inquiries</a>
            <a href="categories.php" class="active">Categories</a>
            <div style="flex-grow: 1;"></div>
            <a href="logout.php" style="color: #e74c3c;">Logout</a>
        </div>
        <div class="admin-main">
            <div style="display: flex; justify-content: space-between; align-items: center; max-width: 600px; margin-bottom: 20px;">
                <h2 style="margin:0;">Categories</h2>
                <button class="btn-sm" style="padding: 8px 16px; background: #0088ff; color: white; border: none; border-radius: 4px;">+ Add Category</button>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Slug</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($categories as $c): ?>
                    <tr>
                        <td><?php echo $c['id']; ?></td>
                        <td><?php echo htmlspecialchars($c['name']); ?></td>
                        <td><?php echo htmlspecialchars($c['slug']); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
