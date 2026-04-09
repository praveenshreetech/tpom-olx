<?php
require_once __DIR__ . '/includes/functions.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    die("Product not found.");
}

$product = getProductById($id);
if (!$product) {
    die("Product not found.");
}

// Handle inquiry POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'inquiry') {
    $data = [
        'product_id' => $_POST['product_id'],
        'buyer_name' => $_POST['buyer_name'],
        'buyer_phone' => $_POST['buyer_phone'],
        'buyer_email' => $_POST['buyer_email'],
        'message' => $_POST['message'],
        'contact_method' => 'form'
    ];
    createInquiry($data);
    $inquiry_success = true;
}

$adminWA = getenv('ADMIN_WHATSAPP') ?: '';
$waMsg  = urlencode("Hi! I'm interested in: *{$product['title']}*\nPrice: ₹" . number_format($product['price']) . "\nProduct ID: {$product['id']}");
$waLink = "https://wa.me/{$adminWA}?text={$waMsg}";

$images = !empty($product['images']) ? $product['images'] : [['image_url' => null, 'is_primary' => 1]];

require_once __DIR__ . '/includes/header.php';
?>
<div class="page-tab-container">
    <div class="container" style="padding-top: 40px; padding-bottom: 80px;">
        <div class="product-layout">
            <div class="product-gallery">
                <div class="product-gallery-main">
                    <?php if ($images[0]['image_url']): ?>
                        <img id="main-image" src="<?php echo BASE_URL . ltrim($images[0]['image_url'], '/'); ?>" alt="<?php echo htmlspecialchars($product['title']); ?>" />
                    <?php else: ?>
                        <div class="product-gallery-noimg">No Image Available</div>
                    <?php endif; ?>
                </div>
                <?php if (count($images) > 1): ?>
                    <div class="product-gallery-thumbs">
                        <?php foreach ($images as $img): ?>
                            <button type="button" class="product-gallery-thumb" onclick="document.getElementById('main-image').src='<?php echo BASE_URL . ltrim($img['image_url'], '/'); ?>'">
                                <img src="<?php echo BASE_URL . ltrim($img['image_url'], '/'); ?>" alt="Thumbnail" />
                            </button>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

            <div class="product-details">
                <?php if ($product['category']): ?>
                    <span class="product-cat-label"><?php echo htmlspecialchars($product['category']); ?></span>
                <?php endif; ?>
                <h1 class="product-title"><?php echo htmlspecialchars($product['title']); ?></h1>
                <div class="product-price">
                    <?php echo $product['price'] > 0 ? '₹' . number_format($product['price']) : 'Contact for price'; ?>
                </div>
                <?php if ($product['location']): ?>
                    <p class="product-location">📍 <?php echo htmlspecialchars($product['location']); ?></p>
                <?php endif; ?>
                <?php if ($product['description']): ?>
                    <div class="product-desc">
                        <h3>Description</h3>
                        <p><?php echo nl2br(htmlspecialchars($product['description'])); ?></p>
                    </div>
                <?php endif; ?>

                <div class="product-meta">
                    <span>👁 <?php echo $product['views_count']; ?> views</span>
                    <span>🕐 <?php echo date('d M Y', strtotime($product['created_at'])); ?></span>
                </div>

                <div class="product-contact-box">
                    <h3 class="product-contact-title">Interested in this?</h3>
                    <p class="product-contact-sub">Contact our admin — we'll get back to you right away.</p>

                    <a href="<?php echo htmlspecialchars($waLink); ?>" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp product-wa-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp Admin
                    </a>

                    <div class="divider">or send a message</div>

                    <?php if (isset($inquiry_success) && $inquiry_success): ?>
                        <div style="padding: 10px; background: #e6f4ea; color: #1e8e3e; border-radius: 4px; margin-bottom: 10px;">
                            Message sent successfully! We will get back to you soon.
                        </div>
                    <?php endif; ?>

                    <form action="<?php echo BASE_URL; ?>product.php?id=<?php echo $product['id']; ?>" method="POST" id="inquiry-form" class="inquiry-form">
                        <input type="hidden" name="action" value="inquiry">
                        <input type="hidden" name="product_id" value="<?php echo $product['id']; ?>" />
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label>Your Name</label>
                            <input type="text" name="buyer_name" required class="form-control" style="width:100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"/>
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label>Phone Number (Optional)</label>
                            <input type="tel" name="buyer_phone" class="form-control" style="width:100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"/>
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label>Email Address</label>
                            <input type="email" name="buyer_email" required class="form-control" style="width:100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"/>
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label>Message</label>
                            <textarea name="message" required class="form-control" rows="3" style="width:100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">Hi, I want to know more about <?php echo htmlspecialchars($product['title']); ?>.</textarea>
                        </div>
                        <button type="submit" class="btn btn-primary inquiry-submit-btn" style="width: 100%;">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
