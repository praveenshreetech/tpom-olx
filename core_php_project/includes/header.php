<?php
$current_page = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>tpom - The Product Offer Marketplace</title>
    <link rel="stylesheet" href="<?php echo BASE_URL; ?>/assets/css/style.css">
</head>
<body>
    <header class="navbar-header">
        <div class="container navbar-inner">
            <a href="<?php echo BASE_URL; ?>" class="navbar-logo">Market<span>place</span></a>
            <nav class="navbar-nav">
                <a href="<?php echo BASE_URL; ?>" class="<?php echo ($current_page == 'index.php') ? 'active' : ''; ?>">Browse</a>
                <a href="<?php echo BASE_URL; ?>contact.php" class="<?php echo ($current_page == 'contact.php') ? 'active' : ''; ?>">Sell With Us</a>
            </nav>
            <a href="<?php echo BASE_URL; ?>contact.php" class="btn btn-primary" style="font-size:11px; padding:8px 18px;">+ List Your Product</a>
        </div>
    </header>
    <main>
