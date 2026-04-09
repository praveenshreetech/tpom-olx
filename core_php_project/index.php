<?php
require_once __DIR__ . '/includes/functions.php';

$category = $_GET['category'] ?? null;
$search = $_GET['search'] ?? null;

$products = getAllProducts(['category' => $category, 'search' => $search]);
$categories = getCategories();

require_once __DIR__ . '/includes/header.php';
?>
<div class="page-tab-container">
    <!-- Hero -->
    <section class="page-hero">
        <div class="container">
            <p class="page-hero-tag">🛒 Buy &amp; Sell Locally</p>
            <h1 class="page-hero-title">
                Find What You<br /><span class="accent">Need.</span> Sell What You 
                <span class="accent"> Don't.</span>
            </h1>
            <form method="GET" action="<?php echo BASE_URL; ?>" class="page-search-bar">
                <input name="search" value="<?php echo htmlspecialchars($search ?? ''); ?>" placeholder="Search products…" />
                <button type="submit" class="btn btn-primary">Search</button>
            </form>
        </div>
    </section>

    <!-- Category pills -->
    <section class="page-cat-section">
        <div class="container page-cat-row">
            <a href="<?php echo BASE_URL; ?>" class="page-cat-pill <?php echo !$category ? 'page-cat-active' : ''; ?>">All</a>
            <?php foreach ($categories as $c): ?>
                <a href="<?php echo BASE_URL; ?>?category=<?php echo urlencode($c['slug']); ?>" 
                   class="page-cat-pill <?php echo $category === $c['slug'] ? 'page-cat-active' : ''; ?>">
                    <?php echo htmlspecialchars($c['name']); ?>
                </a>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- Products grid -->
    <section class="page-grid-section">
        <div class="container">
            <div class="page-grid-header">
                <h2 class="section-title">
                    <?php 
                    if ($search) {
                        echo 'Results for "' . htmlspecialchars($search) . '"';
                    } elseif ($category) {
                        echo htmlspecialchars(str_replace('-', ' ', $category));
                    } else {
                        echo 'Latest Listings';
                    }
                    ?>
                </h2>
                <span class="page-count"><?php echo count($products); ?> items</span>
            </div>

            <?php if (count($products) === 0): ?>
                <div class="page-empty">
                    <p>No products found.</p>
                    <a href="<?php echo BASE_URL; ?>" class="btn btn-outline" style="margin-top:16px;">Clear filters</a>
                </div>
            <?php else: ?>
                <div class="page-grid">
                    <?php foreach ($products as $p): ?>
                        <a href="<?php echo BASE_URL; ?>product.php?id=<?php echo $p['id']; ?>" class="card page-product-card">
                            <div class="page-img-wrap">
                                <?php if ($p['primary_image']): ?>
                                    <img src="<?php echo BASE_URL . ltrim($p['primary_image'], '/'); ?>" alt="<?php echo htmlspecialchars($p['title']); ?>" />
                                <?php else: ?>
                                    <div class="page-no-img">No Image</div>
                                <?php endif; ?>
                                
                                <?php if ($p['images_count'] > 1): ?>
                                    <div class="page-img-badge">+<?php echo $p['images_count'] - 1; ?></div>
                                <?php endif; ?>
                            </div>
                            <div class="page-card-body">
                                <?php if ($p['category']): ?>
                                    <span class="page-cat-label"><?php echo htmlspecialchars($p['category']); ?></span>
                                <?php endif; ?>
                                <h3 class="page-card-title"><?php echo htmlspecialchars($p['title']); ?></h3>
                                <div class="page-card-footer">
                                    <span class="page-price">
                                        <?php echo $p['price'] > 0 ? '₹' . number_format($p['price']) : 'Contact for price'; ?>
                                    </span>
                                    <?php if ($p['location']): ?>
                                        <span class="page-loc">📍 <?php echo htmlspecialchars($p['location']); ?></span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </a>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </section>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
