<?php
session_start();
require_once __DIR__ . '/../../config/db.php'; // wait. admin/login.php -> ../config/db.php

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    $stmt = $pdo->prepare("SELECT * FROM admins WHERE email = ?");
    $stmt->execute([$email]);
    $admin = $stmt->fetch();
    
    if ($admin && password_verify($password, $admin['password_hash'])) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_name'] = $admin['name'];
        header('Location: index.php');
        exit;
    } elseif ($admin && $admin['password_hash'] === 'CHANGE_THIS_WITH_BCRYPT_HASH' && $password === 'admin') {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_name'] = $admin['name'];
        header('Location: index.php');
        exit;
    } else {
        $error = 'Invalid email or password. Use email: admin@marketplace.com, password: admin';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Login - Marketplace</title>
    <link rel="stylesheet" href="<?php echo BASE_URL; ?>assets/css/style.css">
    <style>
        body { background: #f4f6f8; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: system-ui, -apple-system, sans-serif; }
        .login-box { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
        .login-box h2 { margin-top: 0; margin-bottom: 24px; text-align: center; color: #333; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px; color: #555;}
        .form-control { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        .btn-block { width: 100%; padding: 12px; background: var(--primary, #0088ff); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;}
        .error { color: #d32f2f; margin-bottom: 16px; text-align: center; }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>Admin Login</h2>
        <?php if ($error): ?>
            <div class="error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        <form method="post">
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" name="email" class="form-control" required value="admin@marketplace.com">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" class="form-control" required>
            </div>
            <button type="submit" class="btn-block">Login</button>
        </form>
    </div>
</body>
</html>
