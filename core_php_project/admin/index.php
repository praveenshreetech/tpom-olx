<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../includes/functions.php';

$stats = getDashboardStats();

$current_page = 'dashboard';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard - Marketplace</title>
    <link rel="stylesheet" href="<?php echo BASE_URL; ?>assets/css/style.css">
    <style>
        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #f4f6f8; }
        .admin-layout { display: flex; min-height: 100vh; }
        .admin-sidebar { width: 250px; background: #2c3e50; color: white; padding: 20px 0; display: flex; flex-direction: column; }
        .admin-sidebar .logo { padding: 0 20px 20px; font-size: 24px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px; color: white; text-decoration: none; display: block; }
        .admin-sidebar a { display: block; padding: 12px 20px; color: #ecf0f1; text-decoration: none; border-left: 3px solid transparent; }
        .admin-sidebar a:hover, .admin-sidebar a.active { background: rgba(255,255,255,0.05); border-left-color: #3498db; }
        .admin-main { flex: 1; padding: 30px; overflow-y: auto; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .admin-header h2 { margin: 0; color: #333; }
        .stat-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .stat-card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #eaeaea; }
        .stat-card-title { color: #7f8c8d; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; font-weight: 600;}
        .stat-card-value { font-size: 32px; font-weight: bold; color: #2c3e50; }
    </style>
</head>
<body>
    <div class="admin-layout">
        <div class="admin-sidebar">
            <a href="<?php echo BASE_URL; ?>" class="logo" target="_blank">Marketplace</a>
            <a href="index.php" class="<?php echo $current_page == 'dashboard' ? 'active' : ''; ?>">Dashboard</a>
            <a href="products.php">Products</a>
            <a href="submissions.php">Seller Submissions</a>
            <a href="inquiries.php">Inquiries</a>
            <a href="categories.php">Categories</a>
            <div style="flex-grow: 1;"></div>
            <a href="logout.php" style="color: #e74c3c;">Logout</a>
        </div>
        <div class="admin-main">
            <div class="admin-header">
                <h2>Overview Dashboard</h2>
                <div class="user-info">Logged in as <strong><?php echo htmlspecialchars($_SESSION['admin_name'] ?? 'Admin'); ?></strong></div>
            </div>
            
            <div class="stat-cards">
                <div class="stat-card">
                    <div class="stat-card-title">Total Active Products</div>
                    <div class="stat-card-value"><?php echo $stats['total_products']; ?></div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-title">New Submissions</div>
                    <div class="stat-card-value" style="<?php echo $stats['new_submissions'] > 0 ? 'color: #e67e22;' : ''; ?>">
                        <?php echo $stats['new_submissions']; ?>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-title">New Inquiries</div>
                    <div class="stat-card-value" style="<?php echo $stats['new_inquiries'] > 0 ? 'color: #3498db;' : ''; ?>">
                        <?php echo $stats['new_inquiries']; ?>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-title">Total Views</div>
                    <div class="stat-card-value"><?php echo $stats['total_views']; ?></div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
