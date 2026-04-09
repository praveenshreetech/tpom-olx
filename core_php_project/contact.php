<?php
require_once __DIR__ . '/includes/functions.php';

$success = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $seller_name = $_POST['seller_name'] ?? '';
    $seller_phone = $_POST['seller_phone'] ?? '';
    $seller_whatsapp = $_POST['seller_whatsapp'] ?? '';
    $seller_email = $_POST['seller_email'] ?? '';
    $product_title = $_POST['product_title'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = $_POST['price'] ?? '';
    $location = $_POST['location'] ?? '';

    if (!$seller_name || !$seller_phone || !$product_title) {
        $error = 'Name, phone and product title are required.';
    } else {
        $image_urls = [];
        if (!empty($_FILES['images']['name'][0])) {
            $uploadDir = __DIR__ . '/uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            foreach ($_FILES['images']['tmp_name'] as $index => $tmpName) {
                if ($index >= 5) break;
                
                if ($_FILES['images']['error'][$index] === UPLOAD_ERR_OK) {
                    $ext = pathinfo($_FILES['images']['name'][$index], PATHINFO_EXTENSION);
                    $filename = uniqid('img_') . '.' . $ext;
                    $targetPath = $uploadDir . $filename;
                    
                    if (move_uploaded_file($tmpName, $targetPath)) {
                        $image_urls[] = '/uploads/' . $filename;
                    }
                }
            }
        }
        
        $data = [
            'seller_name' => $seller_name,
            'seller_phone' => $seller_phone,
            'seller_whatsapp' => $seller_whatsapp,
            'seller_email' => $seller_email,
            'product_title' => $product_title,
            'description' => $description,
            'price' => $price,
            'location' => $location,
            'image_urls' => empty($image_urls) ? null : implode(',', $image_urls),
            'contact_method' => 'form'
        ];
        
        createSubmission($data);
        $success = true;
    }
}

$categories = getCategories();

require_once __DIR__ . '/includes/header.php';
?>
<div class="page-tab-container">
    <div class="container" style="max-width: 600px; margin: 40px auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">List Your Product</h2>
        <p style="color: #666; margin-bottom: 24px;">Fill the details below and our admin will review and publish your app.</p>

        <?php if ($success): ?>
            <div class="success-box" style="margin-top: 8px; padding: 12px; background: #e6f4ea; color: #1e8e3e; border-radius: 4px;">
                ✅ Submission received! We'll review your product and contact you within a few hours.
            </div>
            <a href="<?php echo BASE_URL; ?>" class="btn btn-primary" style="margin-top: 16px; display: inline-block;">Return to Home</a>
        <?php else: ?>
            <?php if ($error): ?>
                <p class="error-text" style="color: red; margin-bottom: 15px;"><?php echo htmlspecialchars($error); ?></p>
            <?php endif; ?>

            <form action="<?php echo BASE_URL; ?>contact.php" method="POST" enctype="multipart/form-data" class="seller-form" id="seller-form">
                <div class="form-section">
                    <p class="section-label">Your Details</p>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Full Name *</label>
                            <input type="text" name="seller_name" placeholder="Your name" required class="form-control" />
                        </div>
                        <div class="form-group">
                            <label>Phone Number *</label>
                            <input type="tel" name="seller_phone" placeholder="+91 98765 43210" required class="form-control" />
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>WhatsApp Number</label>
                            <input type="tel" name="seller_whatsapp" placeholder="If different from phone" class="form-control" />
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="seller_email" placeholder="you@email.com" class="form-control" />
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <p class="section-label">Product Details</p>
                    <div class="form-group">
                        <label>Product Title *</label>
                        <input type="text" name="product_title" placeholder="e.g. iPhone 14 Pro 256GB Space Black" required class="form-control" />
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="description" placeholder="Condition, age, any defects, reason for selling…" rows="4" class="form-control"></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Price (₹)</label>
                            <input type="number" name="price" placeholder="0" min="0" class="form-control" />
                        </div>
                        <div class="form-group">
                            <label>Location</label>
                            <input type="text" name="location" placeholder="City / Area" class="form-control" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category" class="form-control">
                            <option value="">Select a category</option>
                            <?php foreach ($categories as $c): ?>
                                <option value="<?php echo htmlspecialchars($c['slug']); ?>"><?php echo htmlspecialchars($c['name']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <div class="form-section">
                    <p class="section-label" style="display: flex; justify-content: space-between;">
                        <span>Product Images (up to 5)</span>
                        <span id="img-count" style="font-weight: 400; font-size: 0.82rem; color: #888;">0/5 selected</span>
                    </p>

                    <input type="file" name="images[]" id="images-input" accept="image/*" multiple style="display: none;" />

                    <label for="images-input" class="upload-box" id="upload-box" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; padding: 20px; border: 2px dashed #ddd; border-radius: 8px;">
                        <span class="upload-icon" style="font-size: 24px;">📸</span>
                        <span id="upload-text">Click to upload photos</span>
                        <span class="upload-hint" style="font-size: 11px; color: #888;">JPG, PNG — max 5MB each</span>
                    </label>

                    <div id="image-previews" class="previews" style="display: none; flex-wrap: wrap; gap: 10px; margin-top: 10px;"></div>
                </div>

                <button type="submit" class="btn btn-primary seller-submit-btn" style="width: 100%; margin-top: 20px;">✓ Submit Product</button>
            </form>
        <?php endif; ?>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
