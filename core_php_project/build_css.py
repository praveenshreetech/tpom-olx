import os
import re

css_map = {
    r'd:\tpom\app\globals.css': '',
    r'd:\tpom\app\page.module.css': 'page-',
    r'd:\tpom\app\products\[id]\page.module.css': 'product-',
    r'd:\tpom\components\layout\Navbar.module.css': 'navbar-',
    r'd:\tpom\components\SellerForm.module.css': 'seller-',
    r'd:\tpom\components\InquiryForm.module.css': 'inquiry-'
}

out_dir = r'd:\tpom\core_php_project\assets\css'
os.makedirs(out_dir, exist_ok=True)

final_css = ""

# Very basic regex to replace class definitions:
# .className { ... } -> .prefix-className { ... }
# Also replace subclasses: .className:hover -> .prefix-className:hover
# Also replace chained: .className.active -> .prefix-className.prefix-active
def replace_class(match, prefix):
    # match.group() is like .hero
    return f".{prefix}{match.group(1)}"

for file_path, prefix in css_map.items():
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            if prefix:
                # Replace only class declarations/usages
                # This matches `.classname` not inside a property value or url()
                # Actually, simple substitution `\.[a-zA-Z0-9_-]+` could match decimals etc
                # Safe regex for CSS classes: lookbehind for space, comma, newline, open brace, or > or :not( or start of string
                # Since Python regex engine doesn't support variable-length lookbehinds,
                # we can do:
                # substitute r'(^|[\s,>{])\.([a-zA-Z_][a-zA-Z0-9_-]*)' with r'\1.prefix-\2'
                content = re.sub(r'(^|[\s,>{}])\.([a-zA-Z_][a-zA-Z0-9_-]*)', lambda m: f"{m.group(1)}.{prefix}{m.group(2)}", content)
            
            final_css += f"/* {os.path.basename(file_path)} */\n"
            final_css += content + "\n\n"

# In footer.php we used some inline classes that need to be defined
footer_css = """
/* Footer styles translated from React inline */
.footer { background: var(--footer-bg); color: #fff; padding-top: 56px; position: relative; overflow: hidden; }
.top-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 44px; padding-bottom: 48px; max-width: 1200px; margin: 0 auto; padding: 0 20px; margin-bottom: 20px; }
.brand-column { display: flex; flex-direction: column; gap: 12px; }
.column { display: flex; flex-direction: column; gap: 10px; }
.app-column { display: flex; flex-direction: column; gap: 12px; }
.footer-logo { display: flex; align-items: flex-start; gap: 4px; }
.logo-olx { font-family: "DM Serif Display", serif; font-size: 32px; font-weight: 400; line-height: 1; color: #fff; letter-spacing: -0.02em; }
.logo-tm { font-size: 11px; color: #a0b4b6; margin-top: 4px; font-weight: 500; }
.tagline { font-size: 13.5px; color: #a0b4b6; line-height: 1.6; max-width: 210px; }
.column-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.4px; color: #a0b4b6; margin-bottom: 4px; }
.footer-link { font-size: 14px; color: #d4e0e1; text-decoration: none; line-height: 1.5; transition: color 0.15s ease; }
.footer-link:hover { color: #fff; }
.social-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.social-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); cursor: pointer; text-decoration: none; color: white;}
.social-btn:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.4); }
.social-icon { font-size: 11px; font-weight: 700; }
.app-badge { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 11px 15px; text-decoration: none; color: #fff; }
.app-badge:hover { background: rgba(255,255,255,0.12); }
.app-badge-icon { font-size: 18px; width: 22px; text-align: center; }
.app-badge-text { display: flex; flex-direction: column; }
.app-badge-small { font-size: 10px; color: #a0b4b6; }
.app-badge-big { font-size: 14px; font-weight: 600; }
.bottom-bar { background: var(--footer-bg-dark); padding: 20px 0; }
.bottom-inner { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; }
.copyright { font-size: 12.5px; color: #6b8a8d; }
.flag-row { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #6b8a8d; }

@media (max-width: 640px) {
    .olx-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px 20px !important; }
    .olx-brand-col { grid-column: 1 / -1; }
    .olx-app-col { grid-column: 1 / -1; }
}
"""

final_css += footer_css

with open(os.path.join(out_dir, 'style.css'), 'w', encoding='utf-8') as f:
    f.write(final_css)

print("CSS built successfully.")
