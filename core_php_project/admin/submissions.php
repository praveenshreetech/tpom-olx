<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'status') {
        updateSubmissionStatus($_POST['id'], $_POST['status']);
    }
    header('Location: submissions.php');
    exit;
}

$submissions = getAllSubmissions();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Seller Submissions - Admin Dashboard</title>
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
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .badge-new { background: #e6f4ea; color: #1e8e3e; }
        .badge-reviewed { background: #fef7e0; color: #f29900; }
        .badge-posted { background: #e8f0fe; color: #1a73e8; }
        .badge-rejected { background: #fce8e6; color: #d93025; }
        .btn-sm { padding: 6px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #ccc; background: white; cursor: pointer; }
    </style>
</head>
<body>
    <div class="admin-layout">
        <div class="admin-sidebar">
            <a href="<?php echo BASE_URL; ?>" class="logo" target="_blank">Marketplace</a>
            <a href="index.php">Dashboard</a>
            <a href="products.php">Products</a>
            <a href="submissions.php" class="active">Seller Submissions</a>
            <a href="inquiries.php">Inquiries</a>
            <a href="categories.php">Categories</a>
            <div style="flex-grow: 1;"></div>
            <a href="logout.php" style="color: #e74c3c;">Logout</a>
        </div>
        <div class="admin-main">
            <h2>Seller Submissions</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Seller</th>
                        <th>Product Title</th>
                        <th>Price</th>
                        <th>Images</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($submissions as $s): ?>
                    <tr>
                        <td><?php echo date('d M Y', strtotime($s['created_at'])); ?></td>
                        <td>
                            <?php echo htmlspecialchars($s['seller_name']); ?><br>
                            <small><?php echo htmlspecialchars($s['seller_phone']); ?></small>
                        </td>
                        <td><?php echo htmlspecialchars($s['product_title']); ?></td>
                        <td>₹<?php echo number_format($s['price']); ?></td>
                        <td>
                            <?php if ($s['image_urls']): ?>
                                <?php $imgs = explode(',', $s['image_urls']); ?>
                                <a href="<?php echo BASE_URL . ltrim($imgs[0], '/'); ?>" target="_blank" style="color:blue;">View Images (<?php echo count($imgs); ?>)</a>
                            <?php else: ?>
                                None
                            <?php endif; ?>
                        </td>
                        <td><span class="badge badge-<?php echo $s['status']; ?>"><?php echo ucfirst($s['status']); ?></span></td>
                        <td>
                            <form method="POST">
                                <input type="hidden" name="action" value="status">
                                <input type="hidden" name="id" value="<?php echo $s['id']; ?>">
                                <select name="status" onchange="this.form.submit()" class="btn-sm">
                                    <option value="new" <?php echo $s['status'] == 'new' ? 'selected' : ''; ?>>New</option>
                                    <option value="reviewed" <?php echo $s['status'] == 'reviewed' ? 'selected' : ''; ?>>Reviewed</option>
                                    <option value="posted" <?php echo $s['status'] == 'posted' ? 'selected' : ''; ?>>Posted</option>
                                    <option value="rejected" <?php echo $s['status'] == 'rejected' ? 'selected' : ''; ?>>Rejected</option>
                                </select>
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
